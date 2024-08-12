"use server";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

type VoteType = "UP" | "DOWN";

export async function vote(
  postId: string,
  voteType: VoteType,
  commentId?: string
) {
  const session = await getAuthSession();
  if (!session || !session.user) {
    throw new Error("You must be logged in to vote");
  }

  const userId = session.user.id;

  try {
    if (commentId) {
      const existingCommentVote = await db.commentVote.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });

      if (existingCommentVote) {
        if (existingCommentVote.type === voteType) {
          await db.commentVote.delete({
            where: {
              userId_commentId: {
                userId,
                commentId,
              },
            },
          });
        } else {
          await db.commentVote.update({
            where: {
              userId_commentId: {
                userId,
                commentId,
              },
            },
            data: {
              type: voteType,
            },
          });
        }
      } else {
        await db.commentVote.create({
          data: {
            userId,
            commentId,
            type: voteType,
          },
        });
      }

      const upvotes = await db.commentVote.count({
        where: {
          commentId,
          type: "UP",
        },
      });
      const downvotes = await db.commentVote.count({
        where: {
          commentId,
          type: "DOWN",
        },
      });
      const score = upvotes - downvotes;

      await db.comment.update({
        where: { id: commentId },
        data: { score },
      });

      return { upvotes, downvotes, score };
    } else {
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
          await db.vote.delete({
            where: {
              userId_postId: {
                userId,
                postId,
              },
            },
          });
        } else {
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
        await db.vote.create({
          data: {
            userId,
            postId,
            type: voteType,
          },
        });
      }

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

      return { upvotes, downvotes, score };
    }
  } catch (error) {
    console.error("Error voting:", error);
    throw new Error("Failed to vote");
  }
}
