import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import UnifiedAnalyticsClient from "@/components/UnifiedAnalyticsClient";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold mb-2">Analytics Dashboard</h2>
        <p className="text-muted-foreground mb-6">Please sign in to view your QR code analytics.</p>
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

  // Optimize with parallel queries and limit results for faster loading
  const [qrs, totals, byCountry, byCity, byReferer] = await Promise.all([
    prisma.qRCode.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        label: true,
        slug: true,
        destination: true,
        createdAt: true,
        _count: { select: { scans: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit for performance
    }),
    prisma.scanEvent.groupBy({ 
      by: ["qrId"], 
      where: { qr: { ownerId: user.id } },
      _count: { _all: true }
    }),
    prisma.scanEvent.groupBy({ 
      by: ["country"], 
      where: { qr: { ownerId: user.id } },
      _count: { _all: true }
    }),
    prisma.scanEvent.groupBy({ 
      by: ["city"], 
      where: { qr: { ownerId: user.id } },
      _count: { _all: true }
    }),
    prisma.scanEvent.groupBy({ 
      by: ["referer"], 
      where: { qr: { ownerId: user.id } },
      _count: { _all: true }
    })
  ]);
  
  // Get QR-specific analytics using the _count from the query
  const qrAnalytics = qrs.map(qr => ({
    ...qr,
    totalScans: qr._count?.scans || 0,
    scans: [] // Provide empty array for compatibility
  })).sort((a, b) => b.totalScans - a.totalScans);

  const totalScans = totals.reduce((a, b) => a + (b._count?._all || 0), 0);
  const avgScansPerQr = qrs.length > 0 ? Math.round(totalScans / qrs.length) : 0;
  
  // Recent activity (last 7 days) - limit to 10 for better performance
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentScans = await prisma.scanEvent.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
      qr: { ownerId: user.id }
    },
    select: {
      id: true,
      createdAt: true,
      country: true,
      city: true,
      qr: { select: { label: true, slug: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  const topCountries = byCountry
    .sort((a, b) => (b._count?._all || 0) - (a._count?._all || 0))
    .slice(0, 5);
  
  const topCities = byCity
    .sort((a, b) => (b._count?._all || 0) - (a._count?._all || 0))
    .slice(0, 5);
    
  // Sort other data client-side for performance
  const sortedTotals = totals.sort((a, b) => (b._count?._all || 0) - (a._count?._all || 0));
  const sortedReferrers = byReferer.sort((a, b) => (b._count?._all || 0) - (a._count?._all || 0));

  const analyticsData = {
    qrs,
    totals: sortedTotals,
    byCountry,
    byCity,
    byReferer: sortedReferrers,
    recentScans,
    qrAnalytics,
    totalScans,
    avgScansPerQr,
    topCountries,
    topCities
  };

  // Get lead analytics data for unified view
  const leadQrCodes = await prisma.qRCode.findMany({
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

  const totalLeads = await prisma.lead.count({
    where: {
      qr: { ownerId: user.id }
    }
  });

  const uniqueLeads = await prisma.lead.groupBy({
    by: ["email"],
    where: {
      qr: { ownerId: user.id },
      email: { not: null }
    },
    _count: { _all: true }
  });

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

  const qrWithConversion = await Promise.all(leadQrCodes.map(async (qr) => {
    const totalScans = await prisma.scanEvent.count({
      where: { qrId: qr.id }
    });
    
    return {
      ...qr,
      totalScans,
      conversionRate: totalScans > 0 ? (qr._count.leads / totalScans) * 100 : 0
    };
  }));

  const leadAnalyticsData = {
    qrCodes: qrWithConversion,
    totalLeads,
    uniqueLeads: uniqueLeads.length,
    recentLeads,
    dailyLeads,
    hourlyLeads
  };

  return <UnifiedAnalyticsClient qrData={analyticsData} leadData={leadAnalyticsData} />;
}


