"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { User } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { FC } from "react";
import UpdatePostsButton from "./update-posts-button";

interface UserMenuProps {
  user: Pick<User, "name" | "image" | "email">;
}

const UserMenu: FC<UserMenuProps> = ({ user }) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <span className="text-s font-light">{user.name?.toLowerCase()}</span>
        <MoreHorizontal className="h-5 hidden xl:inline ml-2" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <span>{user.name}</span>}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        <UpdatePostsButton />

        <DropdownMenuItem disabled={true}>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event) => {
            event.preventDefault();
            signOut({
              callbackUrl: `${window.location.origin}/`,
            });
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;