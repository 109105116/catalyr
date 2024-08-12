import components from "@/components/mdx-components";
import PostOptions from "@/components/post-options";
import { Tag } from "@/components/tag";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateToWord } from "@/lib/utils";
import "@/styles/mdx.css";
import { ExtendedComment } from "@/types/db";
import { Comment } from "@prisma/client";
const CommentSection = dynamic(() => import("@/components/comment-section"), {
  loading: () => <p>Loading...</p>,
});

import { MDXRemote } from "next-mdx-remote/rsc";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import rehypePrettyCode, {
  Options as PrettyCodeOptions,
} from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

interface PostPageProps {
  params: {
    slug: string[];
  };
}
const rehypePrettyCodeOptions: Partial<PrettyCodeOptions> = {
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
  keepBackground: true,
  onVisitLine(node) {
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
  },
};

async function getPostFromParams(params: PostPageProps["params"]) {
  const fileName = params?.slug?.join("/");
  const session = await getAuthSession();

  const post = await db.post.findUnique({
    where: { fileName },
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
          userId: session?.user.id,
        },
      },
    },
  });

  if (post) {
    return {
      ...post,
      userVote: post.votes.length > 0 ? post.votes[0].type : null,
      votes: undefined,
    };
  }

  return null;
}

export async function generateStaticParams(): Promise<
  PostPageProps["params"][]
> {
  const posts = await db.post.findMany({
    select: { fileName: true },
  });

  return posts.map((post) => ({ slug: post.fileName.split("/") }));
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostFromParams(params);
  if (!post) {
    notFound();
  }

  const session = await getAuthSession();

  const comments = await db.comment.findMany({
    where: { postId: post.id, replyToId: null },
    include: {
      author: true,
      replies: {
        include: {
          author: true,
          replies: {
            include: {
              author: true,
              replies: {
                include: {
                  author: true,
                  replies: {
                    include: {
                      author: true,
                      replies: {
                        include: {
                          author: true,
                          replies: {
                            include: {
                              author: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      votes: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const userId = session?.user.id;

  type CommentWithReply = Comment & {
    replies: CommentWithReply[];
  };

  async function transformComment(
    comment: CommentWithReply,
    userId: string | undefined
  ): Promise<ExtendedComment> {
    const userVote = userId
      ? await db.commentVote.findUnique({
          where: {
            userId_commentId: {
              userId,
              commentId: comment.id,
            },
          },
          select: {
            type: true,
          },
        })
      : null;

    const transformedReplies = await Promise.all(
      (comment.replies || []).map((reply) => transformComment(reply, userId))
    );

    return {
      ...comment,
      userVote: userVote ? userVote.type : null,
      replies: transformedReplies,
    };
  }

  async function getTransformedComments(
    comments: CommentWithReply[],
    userId: string | undefined
  ): Promise<ExtendedComment[]> {
    return Promise.all(
      comments.map((comment) => transformComment(comment, userId))
    );
  }

  const transformedComments = await getTransformedComments(comments, userId);

  function countComments(comments: ExtendedComment[] = []): number {
    return comments.reduce((count, comment) => {
      return count + 1 + countComments(comment.replies);
    }, 0);
  }

  const commentCount = countComments(transformedComments);

  return (
    <>
      <div className="flex justify-start items-center w-full">
        <Link href="/home" className="flex justify-start items-center">
          <div className="h-fit w-fit leading-none">
            <svg
              className="inline-block w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </div>
          <span className="">Home</span>
        </Link>
      </div>
      <article className="container py-6 prose dark:prose-invert mx-auto max-w-5xl">
        <h1 className="mb-0">{post.title}</h1>
        <h2 className="flex justify-start mb-5 mt-2">by {post.author.name}</h2>
        <hr className="-mx-1 my-3 h-px border-accent" />

        <div className="flex justify-start items-center text-foreground mb-10">
          <span>{formatDateToWord(post.createdAt)}</span>
          <span className="ml-2">in </span>
          <div className="gap-2 ml-2 inline-flex text-muted-foreground">
            {post.tags.map((tag) => (
              <Tag tag={tag.tag.name} key={tag.tag.name} />
            ))}
          </div>
        </div>
        {post.content && (
          <MDXRemote
            source={post.content}
            components={components}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  [rehypePrettyCode, rehypePrettyCodeOptions],
                ],
              },
            }}
          />
        )}
      </article>
      <div className="container max-w-5xl">
        <hr className="border-t border-border mt-6" />
        <PostOptions
          session={session}
          post={post}
          commentCount={commentCount}
        />

        <CommentSection
          post={post}
          session={session}
          initialComments={transformedComments}
          commentCount={commentCount}
        />
      </div>
    </>
  );
}
