"use server";

import { revalidatePath } from "next/cache";
import path from "path";
import { z } from "zod";
import { TAGS } from "@/config";
import { db } from "@/lib/db";
import { compileMDXtoJSON } from "@/lib/posts";

const TagSchema = z.object({
  name: z.string(),
});

interface Post {
  id: string;
  fileName: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  tags?: string[];
}

async function upsertPost(
  post: Omit<Post, "id">,
  invalidTags: string[]
): Promise<void> {
  // Validate tags against the predefined TAGS array
  const postInvalidTags = post.tags?.filter((tag) => !TAGS.includes(tag)) || [];
  if (postInvalidTags.length > 0) {
    invalidTags.push(...postInvalidTags);
    return; // Exit early to avoid processing invalid posts
  }

  // Find the existing post by fileName
  const existingPost = await db.post.findUnique({
    where: { fileName: post.fileName },
    include: { tags: { select: { tag: { select: { name: true } } } } },
  });

  if (existingPost) {
    // Fetch upvotes and downvotes for the post
    const votes = await db.vote.groupBy({
      by: ["type"],
      where: { postId: existingPost.id },
      _count: true,
    });

    // Calculate the score
    const upvotes = votes.find((v) => v.type === "UP")?._count ?? 0;
    const downvotes = votes.find((v) => v.type === "DOWN")?._count ?? 0;
    const score = upvotes - downvotes;

    // Update the post fields if any part of it has changed
    await db.post.update({
      where: { fileName: post.fileName },
      data: {
        title: post.title,
        content: post.content,
        updatedAt: new Date(),
        authorId: post.authorId,
        score: score, // Update the score
      },
    });

    // Determine which tags to add or remove
    const existingTagNames = existingPost.tags.map((tag) => tag.tag.name);
    const newTagNames = post.tags || [];
    const tagsToRemove = existingTagNames.filter(
      (tag) => !newTagNames.includes(tag)
    );
    const tagsToAdd = newTagNames.filter(
      (tag) => !existingTagNames.includes(tag)
    );

    // Remove old tags
    if (tagsToRemove.length > 0) {
      const tagsToRemoveIds = await Promise.all(
        tagsToRemove.map(async (tagName) => {
          const tag = await db.tag.findUnique({ where: { name: tagName } });
          return tag ? tag.id : null;
        })
      );

      // Filter out null values
      const validTagsToRemoveIds = tagsToRemoveIds.filter(
        (id): id is string => id !== null
      );

      await db.postTag.deleteMany({
        where: {
          postId: existingPost.id,
          tagId: { in: validTagsToRemoveIds },
        },
      });
    }

    // Add new tags
    if (tagsToAdd.length > 0) {
      const newTagIds = await Promise.all(
        tagsToAdd.map(async (tagName) => {
          const tag = await db.tag.findUnique({ where: { name: tagName } });
          return tag
            ? tag.id
            : (await db.tag.create({ data: { name: tagName } })).id;
        })
      );

      await db.postTag.createMany({
        data: newTagIds.map((tagId) => ({
          postId: existingPost.id,
          tagId,
        })),
      });
    }
  } else {
    // Insert the post and create its tags
    const tagsData = post.tags
      ? await Promise.all(
          post.tags.map(async (tagName) => {
            const tag = TagSchema.parse({ name: tagName });
            const existingTag = await db.tag.findUnique({
              where: { name: tag.name },
            });
            const tagId = existingTag
              ? existingTag.id
              : (await db.tag.create({ data: { name: tag.name } })).id;

            return { tagId };
          })
        )
      : [];

    await db.post.create({
      data: {
        fileName: post.fileName,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        authorId: post.authorId,
        tags: {
          create: tagsData.map((data) => ({
            tagId: data.tagId,
          })),
        },
      },
    });
  }
}

async function deleteUnmatchedPosts(
  existingFileNames: string[]
): Promise<void> {
  // Fetch posts from the database that do not match the existing file names
  const unmatchedPosts = await db.post.findMany({
    where: {
      fileName: {
        notIn: existingFileNames,
      },
    },
  });

  for (const post of unmatchedPosts) {
    // Delete related PostTag entries before deleting the post
    await db.postTag.deleteMany({
      where: {
        postId: post.id,
      },
    });
    // Delete the post
    await db.post.delete({
      where: { id: post.id },
    });
  }
}

export async function updatePosts() {
  const invalidTags: string[] = [];

  try {
    const postsDirectory = path.join(process.cwd(), "src/content/posts");
    const posts = await compileMDXtoJSON(postsDirectory);

    // Extract file names from valid posts
    const validFileNames = posts.map((post) => post.fileName);

    for (const post of posts) {
      await upsertPost(post, invalidTags);
    }

    // Delete posts that do not match any MDX file
    await deleteUnmatchedPosts(validFileNames);

    if (invalidTags.length > 0) {
      throw new Error(`Invalid tags found: ${invalidTags.join(", ")}`);
    }

    revalidatePath("/home");
    return { message: "Database updated successfully!" };
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred while updating the database.";
    throw new Error(errorMessage);
  }
}
