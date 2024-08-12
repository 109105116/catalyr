"use client";

import { ExtendedPost } from "@/types/db";
import { Bookmark, MessageSquare, MessagesSquare } from "lucide-react";
import { Session } from "next-auth";
import React from "react";
import VoteButtons from "./vote-buttons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatDateToWord } from "@/lib/utils";

interface PostOptionsProps {
  session: Session | null;
  post: ExtendedPost;
  commentCount: number;
}

const PostOptions: React.FC<PostOptionsProps> = ({
  session,
  post,
  commentCount,
}) => {
  const pathname = usePathname();
  return (
    <div className="my-12 w-full flex justify-between items-center border rounded-md p-3 border-border">
      <div className="flex items-center gap-x-4">
        <VoteButtons session={session} post={post} orientation={"HORIZONTAL"} />
        <button
          className="px-[4px] flex items-center gap-2 text-gray-400"
          disabled={true}
        >
          <Bookmark className="h-4 w-4" /> save
        </button>
      </div>

      <div className="flex items-center gap-x-4">
        <span>
          by{" "}
          {/* <Link
          href={`/u/${post.authorId}`}
          className="underline underline-offset-4"
        > */}
          <span className="underline underline-offset-4 cursor-default">
            {post.author.name}
          </span>
          {/* </Link> */}
        </span>
        {formatDateToWord(post.createdAt)}
        <span className="flex items-center">
          <MessagesSquare className="h-4 w-4" />
          <Link href={pathname + "#comments"} className="ml-2">
            {commentCount}
          </Link>
        </span>
      </div>
    </div>
  );
};

export default PostOptions;
