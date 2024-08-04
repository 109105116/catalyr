"use client";

import React from "react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { updatePosts } from "@/app/actions/update-posts";
import { useTransition } from "react";

export default function UpdatePostsButton() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    startTransition(async () => {
      try {
        const result = await updatePosts();
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "An error occurred while updating the database.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onSelect={(event) => {
        event.preventDefault();
        handleUpdate();
      }}
      disabled={isPending}
    >
      {isPending ? "Updating..." : "Update Posts"}
    </DropdownMenuItem>
  );
}
