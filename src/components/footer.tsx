import { getAuthSession } from "@/lib/auth";
import ThemeToggle from "./theme-toggle";
import UserMenu from "./user-menu";
import Link from "next/link";

export async function Footer() {
  const session = await getAuthSession();
  return (
    <footer className="fixed bottom-0 bg-background w-full py-1 flex justify-center border-t-[1px] border-border text-muted-foreground text-s font-light">
      <div className="flex justify-between w-[50%]">
        {session?.user ? (
          <UserMenu user={session.user} />
        ) : (
          <Link href="/sign-in">sign in</Link>
        )}
        <ThemeToggle />
      </div>
    </footer>
  );
}
