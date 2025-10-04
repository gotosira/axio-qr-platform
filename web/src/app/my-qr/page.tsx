import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import MyQrClient from "@/components/MyQrClient";
import SignInPrompt from "@/components/SignInPrompt";

export default async function MyQrPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <SignInPrompt />;
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

  const qrs = await prisma.qRCode.findMany({
    where: { ownerId: user.id },
    select: {
      id: true,
      label: true,
      slug: true,
      destination: true,
      logoUrl: true,
      fgColor: true,
      bgColor: true,
      styleType: true,
      logoAspect: true,
      cornerRadius: true,
      logoSizePct: true,
      createdAt: true,
      folderId: true,
      _count: { select: { scans: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 100, // Limit for performance
  });

  return <MyQrClient initialQrs={qrs} />;
}
