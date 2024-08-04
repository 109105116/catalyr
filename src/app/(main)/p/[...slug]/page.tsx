import components from "@/components/mdx-components";
import { Tag } from "@/components/tag";
import { db } from "@/lib/db";
import { formatDateToWord } from "@/lib/utils";
import "@/styles/mdx.css";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";
import rehypeAutolinkHeadings, {
  Options as AutolinkHeadingsOptions,
} from "rehype-autolink-headings";
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
  // onVisitHighlightedLine(node) {
  //   node.properties.className.push("highlighted");
  // },
  // onVisitHighlightedWord(node, id) {
  //   node.properties.className = ["word", `${id}`];
  // },
};

const rehypeAutolinkHeadingsOptions = {
  behavior: "wrap",
  properties: {
    className: ["anchor-link"],
    title: "Permalink to this heading",
  },
  content: {
    type: "element",
    tagName: "span",
    properties: { className: ["anchor-icon"] },
    children: [{ type: "text", value: "#" }],
  },
};

async function getPostFromParams(params: PostPageProps["params"]) {
  const fileName = params?.slug?.join("/");
  const post = await db.post.findUnique({
    where: { fileName },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      author: true,
    },
  });

  if (post) {
    return {
      ...post,
      tags: post.tags.map((pt) => pt.tag.name),
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
              <Tag tag={tag} key={tag} />
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
                  // [rehypeAutolinkHeadings, rehypeAutolinkHeadingsOptions],
                  [rehypePrettyCode, rehypePrettyCodeOptions],
                ],
              },
            }}
          />
        )}
      </article>
    </>
  );
}
