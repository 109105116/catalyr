import type { Post, User, Vote, Comment, PostTag } from "@prisma/client";

import { Prisma } from "@prisma/client";

type BasePost = Prisma.PostGetPayload<{
  include: {
    tags: {
      include: {
        tag: true;
      };
    };
    author: {
      select: {
        name: true;
      };
    };
  };
}>;

export type ExtendedPost = BasePost & {
  userVote: "UP" | "DOWN" | null;
};

export type ExtendedComment = Comment & {
  author?: User;
  replies?: ExtendedComment[];
  userVote: "UP" | "DOWN" | null;
};
