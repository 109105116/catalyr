import type { Post, User, Vote, Comment, PostTag } from "@prisma/client";

import { Prisma } from "@prisma/client";

export type ExtendedPost = Prisma.PostGetPayload<{
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
    userVote: "UP" | "DOWN";
  };
}>;
