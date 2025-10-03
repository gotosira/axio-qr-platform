"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { toast } from "sonner";

interface AnalyticsData {
  qr: {
    id: string;
    label: string;
    slug: string;
    destination: string;
    createdAt: Date;
    logoUrl?: string | null;
    fgColor?: string | null;
    bgColor?: string | null;
    styleType?: string | null;
    cornerRadius?: number | null;
    logoSizePct?: number | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaImage?: string | null;
  };
  totalScans: number;
  uniqueScans: number;
  scansByCountry: { country: string | null; _count: { _all: number } }[];
  scansByCity: { city: string | null; _count: { _all: number } }[];
  scansByReferer: { referer: string | null; _count: { _all: number } }[];
  scansByDevice: { userAgent: string | null; _count: { _all: number } }[];
  dailyScans: { date: string; scans: number }[];
  hourlyScans: { hour: number; scans: number }[];
  recentScans: {
    id: string;
    createdAt: Date;
    ip: string | null;
    country: string | null;
    city: string | null;
    userAgent: string | null;
    referer: string | null;
  }[];
}

interface Props {
  data: AnalyticsData;
}

export default function IndividualQrAnalytics({ data }: Props) {
  const [exporting, setExporting] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [userTimezone, setUserTimezone] = useState<string>('');
  const { qr, totalScans, uniqueScans, scansByCountry, scansByCity, scansByReferer, scansByDevice, dailyScans, hourlyScans, recentScans } = data;

  // Get user's timezone
  useEffect(() => {
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  // Generate QR code image
  useEffect(() => {
    generateQrImage();
  }, [qr]);

  async function generateQrImage() {
    try {
      const url = `${window.location.origin}/api/scan/${qr.slug}`;
      const QRCode = await import("qrcode");
      const png = await QRCode.toDataURL(url, { 
        margin: 1, 
        width: 200,
        color: { 
          dark: qr.fgColor || "#000000", 
          light: qr.bgColor || "#ffffff" 
        } 
      });
      setQrImageUrl(png);
    } catch (error) {
      console.error("QR generation failed:", error);
      setQrImageUrl(null);
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceType = (userAgent: string | null) => {
    if (!userAgent) return "Unknown";
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return "Mobile";
    if (ua.includes('tablet') || ua.includes('ipad')) return "Tablet";
    return "Desktop";
  };

  const exportExecutiveSummary = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/analytics/${qr.id}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `QR-${qr.label}-Analytics-Report.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Analytics report exported successfully!");
      } else {
        throw new Error("Export failed");
      }
    } catch (error) {
      toast.error("Failed to export analytics report");
    } finally {
      setExporting(false);
    }
  };

  // Calculate averages and insights
  const avgDailyScans = dailyScans.length > 0 ? Math.round(totalScans / dailyScans.length) : 0;
  
  // Sort the grouped data by count (client-side sorting)
  const sortedCountries = [...scansByCountry].sort((a, b) => (b._count?._all || 0) - (a._count?._all || 0));
  const sortedCities = [...scansByCity].sort((a, b) => (b._count?._all || 0) - (a._count?._all || 0));
  const sortedReferrers = [...scansByReferer].sort((a, b) => (b._count?._all || 0) - (a._count?._all || 0));
  const sortedDevices = [...scansByDevice].sort((a, b) => (b._count?._all || 0) - (a._count?._all || 0));
  
  const topCountry = sortedCountries[0];
  const topCity = sortedCities[0];
  
  // Convert hourly scans to user's local timezone
  const getLocalHourlyScans = () => {
    if (!userTimezone) return hourlyScans;
    
    // Create a map for quick lookup
    const serverHourMap = new Map();
    hourlyScans.forEach(scan => {
      serverHourMap.set(scan.hour, scan.scans);
    });

    // Get timezone offset difference
    const serverDate = new Date();
    const userDate = new Date(serverDate.toLocaleString('en-US', { timeZone: userTimezone }));
    const serverUTCDate = new Date(serverDate.toLocaleString('en-US', { timeZone: 'UTC' }));
    const timezoneOffset = Math.round((userDate.getTime() - serverUTCDate.getTime()) / (1000 * 60 * 60));

    // Convert each hour to local time
    const localHourlyScans = [];
    for (let localHour = 0; localHour < 24; localHour++) {
      // Calculate corresponding server hour
      let serverHour = (localHour - timezoneOffset + 24) % 24;
      const scans = serverHourMap.get(serverHour) || 0;
      localHourlyScans.push({ hour: localHour, scans });
    }
    
    return localHourlyScans;
  };

  const localHourlyScans = getLocalHourlyScans();
  const peakHour = localHourlyScans.reduce((max, current) => current.scans > max.scans ? current : max, localHourlyScans[0]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/analytics"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Analytics
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{qr.label}</h1>
          <p className="text-muted-foreground mt-1">
            Individual QR Code Analytics & Performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportExecutiveSummary}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "Export Report"}
          </Button>
          <Button variant="outline" asChild>
            <a href={`/api/scan/${qr.slug}`} target="_blank">
              View QR Code
            </a>
          </Button>
        </div>
      </div>

      {/* QR Code Info */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">QR Code Information</h3>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Label:</span>
                <p className="font-medium">{qr.label}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Destination:</span>
                <p className="text-sm break-all">{qr.destination}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Created:</span>
                <p className="text-sm">{formatDate(qr.createdAt)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Slug:</span>
                <p className="text-sm font-mono">{qr.slug}</p>
              </div>
            </div>

            {/* Metadata */}
            {(qr.metaTitle || qr.metaDescription || qr.metaImage) && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">URL Metadata</h4>
                {qr.metaTitle && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Title:</span>
                    <p className="text-sm">{qr.metaTitle}</p>
                  </div>
                )}
                {qr.metaDescription && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Description:</span>
                    <p className="text-sm text-muted-foreground line-clamp-3">{qr.metaDescription}</p>
                  </div>
                )}
                {qr.metaImage && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Preview Image:</span>
                    <div className="mt-2">
                      <img 
                        src={qr.metaImage} 
                        alt="URL Preview" 
                        className="w-24 h-16 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* QR Code Image */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                {qrImageUrl ? (
                  <img src={qrImageUrl} alt={qr.label} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">📱</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">Scan to visit destination</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary text-xl font-bold">👆</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold">{totalScans.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                <span className="text-info text-xl font-bold">👥</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique Scans</p>
                <p className="text-2xl font-bold">{uniqueScans.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <span className="text-success text-xl font-bold">📊</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Daily Scans</p>
                <p className="text-2xl font-bold">{avgDailyScans}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <span className="text-warning text-xl font-bold">🌍</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Country</p>
                <p className="text-lg font-bold">{topCountry?.country || "N/A"}</p>
                <p className="text-xs text-muted-foreground">{topCountry?._count._all || 0} scans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground text-xl font-bold">⏰</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peak Hour</p>
                <p className="text-lg font-bold">{peakHour ? `${peakHour.hour}:00` : "N/A"}</p>
                <p className="text-xs text-muted-foreground">{peakHour?.scans || 0} scans</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Daily Scans Trend */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Daily Scans (Last 30 Days)</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyScans.slice(0, 10).map((day, index) => {
                const maxScans = Math.max(...dailyScans.map(d => d.scans));
                const percentage = maxScans > 0 ? (day.scans / maxScans) * 100 : 0;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{formatDate(day.date)}</span>
                      <span className="text-muted-foreground">{day.scans} scans</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Hourly Distribution</h3>
            {userTimezone && (
              <p className="text-sm text-muted-foreground">Local time ({userTimezone})</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 24 }, (_, i) => {
                const hourData = localHourlyScans.find(h => h.hour === i);
                const scans = hourData?.scans || 0;
                const maxScans = Math.max(...localHourlyScans.map(h => h.scans));
                const intensity = maxScans > 0 ? (scans / maxScans) : 0;
                return (
                  <div key={i} className="text-center">
                    <div 
                      className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-xs font-medium mb-1"
                      style={{ backgroundColor: `rgba(37, 99, 235, ${0.1 + intensity * 0.7})` }}
                    >
                      {scans}
                    </div>
                    <div className="text-xs text-muted-foreground">{i}h</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Geographic Distribution</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Top Countries</h4>
                <div className="space-y-2">
                  {sortedCountries.slice(0, 5).map((country, index) => {
                    const percentage = totalScans > 0 ? (country._count._all / totalScans) * 100 : 0;
                    return (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{country.country || "Unknown"}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                          <span className="font-medium">{country._count._all}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3">Top Cities</h4>
                <div className="space-y-2">
                  {sortedCities.slice(0, 5).map((city, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{city.city || "Unknown"}</span>
                      <span className="text-muted-foreground">{city._count._all}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Analytics */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Device Analytics</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedDevices.slice(0, 6).map((device, index) => {
                const deviceType = getDeviceType(device.userAgent);
                const percentage = totalScans > 0 ? (device._count._all / totalScans) * 100 : 0;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{deviceType}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                        <span className="font-medium">{device._count._all}</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-success h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Scan Activity</h3>
          <p className="text-sm text-muted-foreground">Last 50 scans</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-auto">
            {recentScans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <p className="text-sm font-medium">{formatDateTime(scan.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {scan.country && scan.city ? `${scan.city}, ${scan.country}` : scan.country || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{getDeviceType(scan.userAgent)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground truncate">
                      {scan.referer ? new URL(scan.referer).hostname : "Direct"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}