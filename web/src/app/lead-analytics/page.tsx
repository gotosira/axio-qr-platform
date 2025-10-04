import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import LeadAnalyticsClient from "@/components/LeadAnalyticsClient";

export default async function LeadAnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-2xl font-bold mb-2">Lead Analytics</h2>
        <p className="text-muted-foreground mb-6">Please sign in to view lead analytics.</p>
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

  // Get all QR codes with lead collection enabled
  const qrCodes = await prisma.qRCode.findMany({
    where: { 
      ownerId: user.id,
      collectLeads: true
    },
    include: {
      leadTemplate: true,
      leads: {
        orderBy: { createdAt: "desc" }
      },
      _count: {
        select: { leads: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Get overall lead statistics
  const totalLeads = await prisma.lead.count({
    where: {
      qr: { ownerId: user.id }
    }
  });

  // Get unique leads (by email)
  const uniqueLeads = await prisma.lead.groupBy({
    by: ["email"],
    where: {
      qr: { ownerId: user.id },
      email: { not: null }
    },
    _count: { _all: true }
  });

  // Get recent leads
  const recentLeads = await prisma.lead.findMany({
    where: {
      qr: { ownerId: user.id }
    },
    include: {
      qr: {
        select: {
          label: true,
          slug: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  // Get daily lead data for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyLeads = await prisma.$queryRaw`
    SELECT 
      DATE(l."createdAt") as date,
      COUNT(*)::integer as leads
    FROM "Lead" l
    JOIN "QRCode" qr ON l."qrId" = qr.id
    WHERE qr."ownerId" = ${user.id}
      AND l."createdAt" >= ${thirtyDaysAgo}
    GROUP BY DATE(l."createdAt")
    ORDER BY date DESC
  ` as { date: string; leads: number }[];

  // Get hourly distribution
  const hourlyLeads = await prisma.$queryRaw`
    SELECT 
      EXTRACT(HOUR FROM l."createdAt")::integer as hour,
      COUNT(*)::integer as leads
    FROM "Lead" l
    JOIN "QRCode" qr ON l."qrId" = qr.id
    WHERE qr."ownerId" = ${user.id}
    GROUP BY EXTRACT(HOUR FROM l."createdAt")
    ORDER BY hour
  ` as { hour: number; leads: number }[];

  // Get conversion rates (leads vs scans)
  const qrWithConversion = await Promise.all(qrCodes.map(async (qr) => {
    const totalScans = await prisma.scanEvent.count({
      where: { qrId: qr.id }
    });
    
    return {
      ...qr,
      totalScans,
      conversionRate: totalScans > 0 ? (qr._count.leads / totalScans) * 100 : 0
    };
  }));

  const analyticsData = {
    qrCodes: qrWithConversion,
    totalLeads,
    uniqueLeads: uniqueLeads.length,
    recentLeads,
    dailyLeads,
    hourlyLeads
  };

  return <LeadAnalyticsClient data={analyticsData} />;
}