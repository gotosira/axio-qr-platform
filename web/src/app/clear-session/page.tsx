"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

export default function ClearSessionPage() {
  const [isClearing, setIsClearing] = useState(false);

  const clearSession = async () => {
    setIsClearing(true);
    
    try {
      // Clear NextAuth session
      await signOut({ 
        callbackUrl: "/",
        redirect: false 
      });
      
      // Clear all cookies manually
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      });
      
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Wait a moment then redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      
    } catch (error) {
      console.error("Error clearing session:", error);
      // Force redirect anyway
      window.location.href = "/";
    }
  };

  useEffect(() => {
    // Auto-clear on page load
    clearSession();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🔄</div>
        <h1 className="text-2xl font-bold mb-4">Clearing Session</h1>
        <p className="text-muted-foreground mb-6">
          {isClearing ? "Clearing your session and cookies..." : "Preparing to clear session..."}
        </p>
        {!isClearing && (
          <Button onClick={clearSession}>
            Clear Session Manually
          </Button>
        )}
      </div>
    </div>
  );
}