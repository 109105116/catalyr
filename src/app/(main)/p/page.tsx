import PostsList from "@/components/posts-list";
import { getAuthSession } from "@/lib/auth";

export default async function PostsPage() {
  const session = await getAuthSession();

  return <PostsList userSession={session} />;
}
