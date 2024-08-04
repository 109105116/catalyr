"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserAuthForm from "@/components/user-auth-form";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Dialog
      open={pathname === "/sign-in"}
      onOpenChange={() => router.push("/home")}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="p-2">Sign in</DialogTitle>
          <DialogDescription>
            <UserAuthForm className="p-2" />
            <div className="flex justify-center mt-4">
              <span>
                new here?{" "}
                <Link href="/sign-up" className="font-bold hover:underline">
                  sign up
                </Link>
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
