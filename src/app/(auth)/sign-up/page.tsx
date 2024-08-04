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
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <Dialog open={true} onOpenChange={() => router.push("/home")}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="p-2">Sign up</DialogTitle>
          <DialogDescription>
            <UserAuthForm className="p-2" />
            <div className="flex justify-center mt-4">
              <span>
                already have an account?{" "}
                <Link href="/sign-in" className="font-bold hover:underline">
                  sign in
                </Link>
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
