"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import AnalyticsClient from "@/components/AnalyticsClient";
import LeadAnalyticsClient from "@/components/LeadAnalyticsClient";

interface QRAnalyticsData {
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
}

interface LeadAnalyticsData {
  qrCodes: any[];
  totalLeads: number;
  uniqueLeads: number;
  recentLeads: any[];
  dailyLeads: any[];
  hourlyLeads: any[];
}

interface Props {
  qrData: QRAnalyticsData;
  leadData: LeadAnalyticsData;
}

export default function UnifiedAnalyticsClient({ qrData, leadData }: Props) {
  const [activeTab, setActiveTab] = useState("qr");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive analytics for your QR codes and lead collection
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-sm bg-muted px-2 py-1 rounded">
            {qrData.qrs.length} QR Codes
          </span>
          <span className="text-sm bg-muted px-2 py-1 rounded">
            {leadData.totalLeads} Leads
          </span>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold">📊</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold">{qrData.totalScans.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                <span className="text-info font-bold">👥</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{leadData.totalLeads.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <span className="text-success font-bold">🎯</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">QR Codes</p>
                <p className="text-2xl font-bold">{qrData.qrs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <span className="text-warning font-bold">⭐</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique Leads</p>
                <p className="text-2xl font-bold">{leadData.uniqueLeads.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        <Button
          variant={activeTab === "qr" ? "default" : "ghost"}
          onClick={() => setActiveTab("qr")}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          QR Analytics
        </Button>
        <Button
          variant={activeTab === "leads" ? "default" : "ghost"}
          onClick={() => setActiveTab("leads")}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          Lead Analytics
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "qr" && (
        <div>
          <AnalyticsClient data={qrData} />
        </div>
      )}
      
      {activeTab === "leads" && (
        <div>
          <LeadAnalyticsClient data={leadData} />
        </div>
      )}
    </div>
  );
}