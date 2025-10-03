import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import LeadTemplateClient from "@/components/LeadTemplateClient";

export default async function LeadTemplatesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">🎨</div>
        <h2 className="text-2xl font-bold mb-2">Lead Form Templates</h2>
        <p className="text-muted-foreground mb-6">Please sign in to create and manage lead form templates.</p>
      </div>
    );
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Account Not Found</h2>
        <p className="text-muted-foreground mb-6">
          Your user account was not found. Please sign out and create a new account.
        </p>
        <Button asChild>
          <Link href="/api/auth/signout">Sign Out & Create New Account</Link>
        </Button>
      </div>
    );
  }

  const templates = await prisma.leadTemplate.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return <LeadTemplateClient initialTemplates={templates} />;
}