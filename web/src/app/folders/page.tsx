import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import FoldersPageClient from "@/components/FoldersPageClient";

export default async function FoldersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">📁</div>
        <h2 className="text-2xl font-bold mb-2">Folder Management</h2>
        <p className="text-muted-foreground mb-6">Please sign in to manage your QR code folders.</p>
        <Button>Sign In</Button>
      </div>
    );
  }

  return <FoldersPageClient />;
}