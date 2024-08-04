import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  limit: z.string().transform(Number).default("10"),
  page: z.string().transform(Number).default("1"),
  sortBy: z.enum(["date", "score"]).default("date"),
  order: z.enum(["asc", "desc"]).default("desc"),
  tags: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const result = querySchema.safeParse(
    Object.fromEntries(url.searchParams.entries())
  );

  if (!result.success) {
    return NextResponse.json(result.error.errors, { status: 400 });
  }

  const session = await getAuthSession();
  const userId = session?.user.id;

  const { limit, page, sortBy, order, tags } = result.data;
  const skip = (page - 1) * limit;

  const orderBy: Prisma.PostOrderByWithRelationInput[] = [
    sortBy === "date" ? { createdAt: order } : { score: order },
    { fileName: "asc" },
  ];

  const tagsArray = tags?.split(",").map((tag) => tag.trim()) || [];

  const filterWhere: Prisma.PostWhereInput = tagsArray.length
    ? {
        AND: tagsArray.map((tag) => ({
          tags: {
            some: {
              tag: {
                name: {
                  equals: tag,
                  mode: "insensitive",
                },
              },
            },
          },
        })),
      }
    : {};

  try {
    const posts = await db.post.findMany({
      take: limit,
      skip,
      orderBy,
      where: filterWhere,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        author: {
          select: {
            name: true,
          },
        },
        votes: {
          where: {
            userId: userId,
          },
        },
      },
    });

    // Transform the posts to include a userVote field
    const transformedPosts = posts.map((post) => ({
      ...post,
      userVote: post.votes.length > 0 ? post.votes[0].type : null,
      votes: undefined, // Remove the votes array from the response
    }));

    return NextResponse.json(transformedPosts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
