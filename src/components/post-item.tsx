"use client";

import { vote } from "@/app/actions/vote";
import { formatDateToNums } from "@/lib/utils";
import { ExtendedPost } from "@/types/db";
import { abbreviateNumber } from "js-abbreviation-number";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Icons } from "./ui/icons";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";
import VoteButtons from "./vote-buttons";

interface PostItemProps {
  session: Session | null;
  post: ExtendedPost;
}

type VoteType = "UP" | "DOWN";

export default function PostItem({ session, post }: PostItemProps) {
  const [score, setScore] = useState(post.score);
  const [userVote, setUserVote] = useState<VoteType | null>(
    session ? post.userVote : null
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
        const result = await vote(post.id, voteType);
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

  return (
    <div className="relative flex justify-between items-center w-full px-2 py-2 align-middle border-t-[1px] border-border transition-all group-hover:text-muted-foreground hover:!text-foreground">
      <div className="flex items-center w-[70%]">
        <VoteButtons session={session} post={post} orientation={"VERTICAL"} />
        <Link
          className="w-fit mr-3 hover:underline"
          href={`p/${post.fileName}`}
        >
          {post.title}
        </Link>
      </div>
      <div className="flex justify-end flex-1">
        <span className="text-start">{post.author.name}</span>
        <span className="flex-1 w-fit ml-2 text-end hidden xl:inline">
          {formatDateToNums(post.createdAt)}
        </span>
      </div>
    </div>
  );
}
