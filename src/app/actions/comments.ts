"use server";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function addComment(formData: FormData) {
  const session = await getAuthSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const text = formData.get("text") as string;
  const postId = formData.get("postId") as string;
  const replyToId = formData.get("replyToId") as string | null;

  if (!text || !postId) {
    throw new Error("Missing required fields");
  }

  try {
    await db.comment.create({
      data: {
        text,
        postId,
        authorId: session.user.id,
        replyToId,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Error creating comment");
  }
}

export async function editComment(commentId: string, newText: string) {
  const session = await getAuthSession();
  if (!session) {
    throw new Error("You must be signed in to edit a comment.");
  }

  const comment = await db.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment || comment.authorId !== session.user.id || comment.deleted) {
    throw new Error("You don't have permission to edit this comment.");
  }

  await db.comment.update({
    where: { id: commentId },
    data: { text: newText },
  });
}

export async function deleteComment(commentId: string) {
  const session = await getAuthSession();
  if (!session) {
    throw new Error("You must be signed in to delete a comment.");
  }

  const comment = await db.comment.findUnique({
    where: { id: commentId },
    include: { replies: true },
  });

  if (!comment || comment.authorId !== session.user.id) {
    throw new Error("You don't have permission to delete this comment.");
  }

  if (comment.replies.length === 0) {
    await db.comment.delete({
      where: { id: commentId },
    });
  } else {
    await db.comment.update({
      where: { id: commentId },
      data: { deleted: true, text: "[This comment has been deleted]" },
    });
  }
}
