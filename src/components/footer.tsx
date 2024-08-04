import { getAuthSession } from "@/lib/auth";
import ThemeToggle from "./theme-toggle";
import UserMenu from "./user-menu";
import Link from "next/link";
import { db } from "@/lib/db";

export async function Footer() {
  const session = await getAuthSession();
  const user = await db.user.findUnique({
    where: {
      id: session?.user.id,
    },
  });

  return (
    <footer className="fixed bottom-0 bg-background w-full py-1 flex justify-center border-t-[1px] border-border text-muted-foreground text-s font-light">
      <div className="flex justify-between w-[50%]">
        {user ? <UserMenu user={user} /> : <Link href="/sign-in">sign in</Link>}
        <ThemeToggle />
      </div>
    </footer>
  );
}
