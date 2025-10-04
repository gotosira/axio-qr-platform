"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Session } from "next-auth";

export default function Providers({ 
  children,
  session 
}: { 
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="axioqr-theme">
      <SessionProvider
        session={session}
        refetchInterval={60}
        refetchOnWindowFocus={true}
        refetchWhenOffline={false}
      >
        {children}
        <Toaster richColors position="top-center" />
      </SessionProvider>
    </ThemeProvider>
  );
}


