"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function UserAuthForm({
  className,
  ...props
}: UserAuthFormProps) {
  const [formLoading, setFormLoading] = React.useState<boolean>(false);
  const [oAuthLoading, setOAuthLoading] = React.useState<boolean>(false);
  const { toast } = useToast();
  const pathname = usePathname();

  const loginWithGoogle = async () => {
    setOAuthLoading(true);

    try {
      await signIn("google", { callbackUrl: `${window.location.origin}/home` });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error logging in with Google",
        variant: "destructive",
      });
    } finally {
      setOAuthLoading(false);
    }
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setFormLoading(true);
    signIn();
    setTimeout(() => {
      setFormLoading(false);
    }, 3000);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="email"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={true}
              className="border border-border"
              // disabled={formLoading}
            />
            <Input
              id="password"
              placeholder="password"
              type="password"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={true}
              className="border border-border"
              // disabled={formLoading}
            />
            {pathname === "/sign-up" && (
              <Input
                id="confirmpassword"
                placeholder="confirm password"
                type="password"
                autoCapitalize="none"
                autoCorrect="off"
                disabled={true}
                className="border border-border"
                // disabled={formLoading}
              />
            )}
          </div>

          <Button
            disabled={true}
            className="border border-border"
            // disabled={formLoading}
          >
            {formLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Email sign-in currently disabled
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        className="border border-border"
        disabled={oAuthLoading}
        onClick={loginWithGoogle}
      >
        {oAuthLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}{" "}
        Google
      </Button>
    </div>
  );
}
