"use server";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

type VoteType = "UP" | "DOWN";

export async function vote(postId: string, voteType: VoteType) {
  const session = await getAuthSession();
  if (!session || !session.user) {
    throw new Error("You must be logged in to vote");
  }

  const userId = session.user.id;

  try {
    const existingVote = await db.vote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingVote) {
      if (existingVote.type === voteType) {
        // Remove the vote if it's the same type
        await db.vote.delete({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
        });
      } else {
        // Update the vote if it's a different type
        await db.vote.update({
          where: {
            userId_postId: {
              userId,
              postId,
            },
          },
          data: {
            type: voteType,
          },
        });
      }
    } else {
      // Create a new vote
      await db.vote.create({
        data: {
          userId,
          postId,
          type: voteType,
        },
      });
    }

    // Update the post score
    const upvotes = await db.vote.count({
      where: {
        postId,
        type: "UP",
      },
    });
    const downvotes = await db.vote.count({
      where: {
        postId,
        type: "DOWN",
      },
    });
    const score = upvotes - downvotes;

    await db.post.update({
      where: { id: postId },
      data: { score },
    });

    // revalidatePath(`/home`);

    return { upvotes, downvotes, score };
  } catch (error) {
    console.error("Error voting:", error);
    throw new Error("Failed to vote");
  }
}
