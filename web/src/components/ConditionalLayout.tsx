"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";
import ThemeToggle from "@/components/ThemeToggle";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/Button";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const isLeadPage = pathname?.startsWith("/lead/");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log("ConditionalLayout - Session status:", status, "Session data:", session);
  }, [session, status]);

  if (isLeadPage) {
    return (
      <ErrorBoundary>
        <main className="min-h-screen">
          {children}
        </main>
      </ErrorBoundary>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link 
                href="/" 
                className="flex items-center gap-2 font-bold text-xl tracking-tight hover:text-primary transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">Q</span>
                </div>
                AXIO QR
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link 
                  href="/" 
                  prefetch={true}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline underline-offset-4"
                >
                  Home
                </Link>
                <Link 
                  href="/my-qr" 
                  prefetch={true}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline underline-offset-4"
                >
                  My QR Codes
                </Link>
                <Link 
                  href="/analytics" 
                  prefetch={true}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline underline-offset-4"
                >
                  Analytics
                </Link>
                <Link 
                  href="/lead-templates" 
                  prefetch={true}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline underline-offset-4"
                >
                  Lead Templates
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {!mounted || status === "loading" ? (
                <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
              ) : session?.user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {session.user.name || session.user.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="h-9"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <AuthModal />
              )}
            </div>
          </div>
        </div>
      </header>
      <ErrorBoundary>
        <main className="min-h-screen animate-fade-in">
          {children}
        </main>
      </ErrorBoundary>
      <footer className="border-t border-border/40 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">Q</span>
              </div>
              <span className="text-sm text-muted-foreground">© 2025 AXIO QR. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}