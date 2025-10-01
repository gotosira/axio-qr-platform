"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AuthModal() {
  // Guard against missing provider during certain prerendered routes
  const sessionApi = typeof useSession === "function" ? useSession() : undefined;
  const session = sessionApi?.data as any;

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {session.user.name?.charAt(0)?.toUpperCase() || session.user.email?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{session.user.name || "User"}</p>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href="/auth/signin">Sign In</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/auth/signup">Sign Up</Link>
      </Button>
    </div>
  );
}


