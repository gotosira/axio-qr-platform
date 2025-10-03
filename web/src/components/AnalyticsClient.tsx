"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { toast } from "sonner";

interface AnalyticsClientProps {
  data: {
    qrs: any[];
    totals: any[];
    byCountry: any[];
    byCity: any[];
    byReferer: any[];
    recentScans: any[];
    qrAnalytics: any[];
    totalScans: number;
    avgScansPerQr: number;
    topCountries: any[];
    topCities: any[];
  };
}

export default function AnalyticsClient({ data }: AnalyticsClientProps) {
  const { 
    qrs = [], 
    qrAnalytics = [], 
    totalScans = 0, 
    avgScansPerQr = 0, 
    topCountries = [], 
    topCities = [], 
    byReferer = [], 
    recentScans = [] 
  } = data || {};

  const exportOverallReport = async () => {
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Overall-QR-Analytics-Report.html';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success("Analytics report exported successfully!");
      } else {
        throw new Error("Export failed");
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error("Failed to export analytics report");
    }
  };

  // Show empty state if no QR codes
  if (!qrs || qrs.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold mb-2">No Analytics Data</h2>
        <p className="text-muted-foreground mb-6">
          Create your first QR code to start tracking analytics.
        </p>
        <Link href="/">
          <Button>Create QR Code</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track performance and insights for your QR codes
          </p>
        </div>
        <Button variant="outline" onClick={exportOverallReport}>
          Export Overall Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary text-xl font-bold">📱</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total QR Codes</p>
                <p className="text-2xl font-bold">{qrs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <span className="text-success text-xl font-bold">👆</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold">{totalScans.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <span className="text-warning text-xl font-bold">📊</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Scans/QR</p>
                <p className="text-2xl font-bold">{avgScansPerQr}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground text-xl font-bold">🌍</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Countries</p>
                <p className="text-2xl font-bold">{topCountries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Visualizations */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top QR Codes */}
        <Card className="animate-slide-up">
          <CardHeader>
            <h3 className="text-lg font-semibold">Top Performing QR Codes</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(qrAnalytics || []).slice(0, 5).map((qr: any, index: number) => {
                const percentage = totalScans > 0 ? (qr.totalScans / totalScans) * 100 : 0;
                return (
                  <div key={qr.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate flex-1 mr-2">{qr.label}</span>
                      <span className="text-muted-foreground">{qr.totalScans} scans</span>
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
              {qrAnalytics.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No QR codes yet</p>
                  <Button className="mt-4" onClick={() => window.location.href = "/"}>
                    Create Your First QR Code
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card className="animate-slide-up">
          <CardHeader>
            <h3 className="text-lg font-semibold">Geographic Distribution</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Top Countries</h4>
                <div className="space-y-3">
                  {(topCountries || []).map((country: any, index: number) => {
                    const percentage = totalScans > 0 ? ((country._count?._all || 0) / totalScans) * 100 : 0;
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{country.country || "Unknown"}</span>
                          <span className="text-muted-foreground">{country._count?._all || 0}</span>
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
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3">Top Cities</h4>
                <div className="space-y-2">
                  {(topCities || []).slice(0, 3).map((city: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{city.city || "Unknown"}</span>
                      <span className="text-muted-foreground">{city._count?._all || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Referrers */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="animate-slide-up">
          <CardHeader>
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Last 20 scans from the past 7 days</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-auto">
              {(recentScans || []).map((scan: any) => (
                <div key={scan.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{scan.qr.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {scan.country && scan.city ? `${scan.city}, ${scan.country}` : scan.country || "Unknown location"}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {new Date(scan.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
              {recentScans.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card className="animate-slide-up">
          <CardHeader>
            <h3 className="text-lg font-semibold">Traffic Sources</h3>
            <p className="text-sm text-muted-foreground">Where your scans are coming from</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-auto">
              {(byReferer || [])
                .sort((a: any, b: any) => (b._count?._all || 0) - (a._count?._all || 0))
                .slice(0, 8)
                .map((referrer: any, index: number) => {
                  const percentage = totalScans > 0 ? ((referrer._count?._all || 0) / totalScans) * 100 : 0;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1 mr-2">
                          {referrer.referer || "Direct Access"}
                        </span>
                        <span className="text-muted-foreground">{referrer._count?._all || 0}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-warning h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              {byReferer.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No referrer data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Details */}
      {qrs.length > 0 && (
        <Card className="animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Individual QR Code Performance</h3>
              <p className="text-sm text-muted-foreground">Click any QR code for detailed analytics</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(qrAnalytics || []).map((qr: any) => (
                <Link
                  key={qr.id}
                  href={`/analytics/${qr.id}`}
                  className="block p-4 border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium truncate flex-1 mr-2 group-hover:text-primary transition-colors">{qr.label}</h4>
                    <span className="text-sm text-muted-foreground">{qr.totalScans} scans</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 truncate">{qr.slug}</p>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Total Scans: {qr.totalScans || 0}</p>
                    <div className="text-xs text-muted-foreground">
                      <span>Created: {new Date(qr.createdAt).toLocaleDateString('en-US', { 
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <span className="text-xs text-primary group-hover:underline">
                      View Detailed Analytics →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}