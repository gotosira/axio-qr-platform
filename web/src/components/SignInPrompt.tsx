"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function SignInPrompt() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If there's a client-side session but server says no session,
  // force sign out to clear the inconsistent state (only once)
  useEffect(() => {
    if (mounted && session?.user && !localStorage.getItem('signing-out')) {
      console.log("Session mismatch detected - forcing sign out");
      localStorage.setItem('signing-out', 'true');
      signOut({ callbackUrl: "/" }).then(() => {
        localStorage.removeItem('signing-out');
      });
    }
  }, [mounted, session]);

  if (!mounted || status === "loading") {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="text-6xl mb-4">📱</div>
      <h2 className="text-2xl font-bold mb-2">My QR Codes</h2>
      <p className="text-muted-foreground mb-6">Please sign in to view your QR codes.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild>
          <Link href="/">Sign In</Link>
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    </div>
  );
}