"use server";

import { ExtendedPost } from "@/types/db";
import { revalidatePath } from "next/cache";

interface revalidatePostProps {
  post: ExtendedPost;
}

export default async function revalidatePost({ post }: revalidatePostProps) {
  revalidatePath(`/p/${post.fileName}`);
}
