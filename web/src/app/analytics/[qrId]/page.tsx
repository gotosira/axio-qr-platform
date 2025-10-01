import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import IndividualQrAnalytics from "@/components/IndividualQrAnalytics";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    qrId: string;
  }>;
}

export default async function IndividualAnalyticsPage({ params }: PageProps) {
  const { qrId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold mb-2">QR Analytics</h2>
        <p className="text-muted-foreground mb-6">Please sign in to view QR analytics.</p>
        <Button>Sign In</Button>
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

  // Get QR code with detailed analytics
  const qr = await prisma.qRCode.findFirst({
    where: { 
      id: qrId,
      ownerId: user.id 
    },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  });

  if (!qr) {
    notFound();
  }

  // Get aggregated analytics
  const totalScans = await prisma.scanEvent.count({
    where: { qrId: qrId }
  });

  const scansByCountry = await prisma.scanEvent.groupBy({
    by: ["country"],
    where: { qrId: qrId },
    _count: { _all: true }
  });

  const scansByCity = await prisma.scanEvent.groupBy({
    by: ["city"],
    where: { qrId: qrId },
    _count: { _all: true }
  });

  const scansByReferer = await prisma.scanEvent.groupBy({
    by: ["referer"],
    where: { qrId: qrId },
    _count: { _all: true }
  });

  const scansByDevice = await prisma.scanEvent.groupBy({
    by: ["userAgent"],
    where: { qrId: qrId },
    _count: { _all: true }
  });

  // Get daily scan data for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyScans = await prisma.$queryRaw`
    SELECT 
      DATE("createdAt") as date,
      COUNT(*)::integer as scans
    FROM "ScanEvent" 
    WHERE "qrId" = ${qrId} 
      AND "createdAt" >= ${thirtyDaysAgo}
    GROUP BY DATE("createdAt")
    ORDER BY date DESC
  ` as { date: string; scans: number }[];

  // Get hourly distribution
  const hourlyScans = await prisma.$queryRaw`
    SELECT 
      EXTRACT(HOUR FROM "createdAt")::integer as hour,
      COUNT(*)::integer as scans
    FROM "ScanEvent" 
    WHERE "qrId" = ${qrId}
    GROUP BY EXTRACT(HOUR FROM "createdAt")
    ORDER BY hour
  ` as { hour: number; scans: number }[];

  // Recent scans with details
  const recentScans = await prisma.scanEvent.findMany({
    where: { qrId: qrId },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  const analyticsData = {
    qr,
    totalScans,
    scansByCountry,
    scansByCity,
    scansByReferer,
    scansByDevice,
    dailyScans,
    hourlyScans,
    recentScans
  };

  return <IndividualQrAnalytics data={analyticsData} />;
}