import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";

const PostSchema = z.object({
  fileName: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  authorId: z.string(),
  tags: z.array(z.string()).optional(),
});

interface Post {
  id: string;
  fileName: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  tags?: string[];
}

export async function compileMDXtoJSON(
  directory: string
): Promise<Omit<Post, "id">[]> {
  const files = fs.readdirSync(directory);
  const posts: Omit<Post, "id">[] = [];

  for (const file of files) {
    if (path.extname(file) === ".mdx") {
      const filePath = path.join(directory, file);
      const content = fs.readFileSync(filePath, "utf-8");

      const { data, content: mdxContent } = matter(content);

      const contentString = String(mdxContent);

      const postData = {
        fileName: path.basename(file, ".mdx"),
        title: data.title,
        content: contentString,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: data.authorId,
        tags: data.tags || [],
      };

      const parsedPost = PostSchema.parse(postData);
      posts.push(parsedPost);
    }
  }
  return posts;
}
