"use client";

import revalidatePost from "@/app/actions/revalidate-post";
import { vote } from "@/app/actions/vote";
import { ExtendedComment, ExtendedPost } from "@/types/db";
import { abbreviateNumber } from "js-abbreviation-number";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { Icons } from "./ui/icons";

interface VoteButtonsProps {
  session: Session | null;
  post: ExtendedPost;
  orientation: Orientation;
  comment?: ExtendedComment;
}

type VoteType = "UP" | "DOWN";
type Orientation = "VERTICAL" | "HORIZONTAL";

const VoteButtons: React.FC<VoteButtonsProps> = ({
  session,
  post,
  orientation,
  comment,
}) => {
  const [score, setScore] = useState<number>(
    comment ? comment.score : post.score
  );
  const [userVote, setUserVote] = useState<VoteType | null>(
    session ? (comment ? comment.userVote : post.userVote) : null
  );
  const router = useRouter();

  const handleVote = useCallback(
    async (voteType: VoteType) => {
      if (!session) {
        router.push("/sign-in");
        return;
      }

      const prevScore = score;
      const prevUserVote = userVote;

      if (userVote === voteType) {
        setScore(prevScore + (voteType === "UP" ? -1 : 1));
        setUserVote(null);
      } else {
        setScore(
          prevScore +
            (voteType === "UP" ? 1 : -1) +
            (prevUserVote ? (prevUserVote === "UP" ? -1 : 1) : 0)
        );
        setUserVote(voteType);
      }

      try {
        const result = await vote(post.id, voteType, comment?.id);
        if (!comment?.id) {
          revalidatePost({ post });
        }
        setTimeout(() => {
          setScore(result.score);
        }, 300);
      } catch (error) {
        console.error("Error voting:", error);
        setScore(prevScore);
        setUserVote(prevUserVote);
      }
    },
    [post.id, score, userVote, router, session]
  );

  if (orientation === "VERTICAL") {
    return (
      <>
        <div
          className="flex flex-col h-full w-fit mr-4"
          onClick={(e) => e.preventDefault()}
        >
          <div
            onClick={() => handleVote("UP")}
            className={`h-fit w-fit cursor-pointer leading-none ${
              userVote === "UP" && "text-green-600 dark:text-green-400"
            }`}
          >
            <Icons.upvote />
          </div>
          <div
            onClick={() => handleVote("DOWN")}
            className={`h-fit w-fit cursor-pointer leading-none ${
              userVote === "DOWN" && "text-red-600 dark:text-red-400"
            }`}
          >
            <Icons.downvote />
          </div>
        </div>
        <span className="inline-block w-[8%] mr-10">
          {" " + abbreviateNumber(score) + " "}
        </span>
      </>
    );
  } else {
    return (
      <div className="flex w-fit justify-center items-center padding-2">
        <div
          onClick={() => handleVote("UP")}
          className={`h-fit w-fit cursor-pointer leading-none ${
            userVote === "UP" && "text-green-600 dark:text-green-400"
          }`}
        >
          <Icons.upvote />
        </div>
        <span className="w-fit px-2">
          {" " + abbreviateNumber(score) + " "}
        </span>
        <div
          onClick={() => handleVote("DOWN")}
          className={`h-fit w-fit cursor-pointer leading-none ${
            userVote === "DOWN" && "text-red-600 dark:text-red-400"
          }`}
        >
          <Icons.downvote />
        </div>
      </div>
    );
  }
};

export default VoteButtons;
