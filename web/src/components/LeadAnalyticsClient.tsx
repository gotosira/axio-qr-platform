"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { toast } from "sonner";
import { Download, ExternalLink, Users, Target, TrendingUp, Clock, FileText, FileSpreadsheet } from "lucide-react";

interface QRCodeWithLeads {
  id: string;
  label: string;
  slug: string;
  destination: string;
  createdAt: Date;
  leadTemplate?: {
    name: string;
    title: string;
  } | null;
  leads: {
    id: string;
    name: string | null;
    email: string | null;
    company: string | null;
    createdAt: Date;
    formData?: any;
  }[];
  _count: { leads: number };
  totalScans: number;
  conversionRate: number;
}

interface AnalyticsData {
  qrCodes: QRCodeWithLeads[];
  totalLeads: number;
  uniqueLeads: number;
  recentLeads: {
    id: string;
    name: string | null;
    email: string | null;
    company: string | null;
    phone: string | null;
    message: string | null;
    createdAt: Date;
    formData?: any;
    qr: {
      label: string;
      slug: string;
    };
  }[];
  dailyLeads: { date: string; leads: number }[];
  hourlyLeads: { hour: number; leads: number }[];
}

interface Props {
  data: AnalyticsData;
}

export default function LeadAnalyticsClient({ data }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQrId, setSelectedQrId] = useState<string>("all");
  const [userTimezone, setUserTimezone] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { qrCodes, totalLeads, uniqueLeads, recentLeads, dailyLeads, hourlyLeads } = data;

  // Get user's timezone
  useEffect(() => {
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

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

  const exportCSV = async (exportAll = false) => {
    try {
      const leadsToExport = exportAll ? filteredLeads : paginatedLeads;

      // Create headers including custom fields
      const baseHeaders = ["Date", "Time", "QR Code", "QR Slug", "Name", "Email", "Phone", "Company", "Message"];
      const customFields = new Set<string>();
      
      // Collect all custom field names
      leadsToExport.forEach(lead => {
        if (lead.formData && typeof lead.formData === 'object') {
          Object.keys(lead.formData).forEach(key => customFields.add(key));
        }
      });
      
      const headers = [...baseHeaders, ...Array.from(customFields)];
      
      const csvContent = [
        headers.join(","),
        ...leadsToExport.map(lead => {
          const baseData = [
            formatDate(lead.createdAt),
            new Date(lead.createdAt).toLocaleTimeString(),
            lead.qr.label,
            lead.qr.slug,
            lead.name || "",
            lead.email || "",
            lead.phone || "",
            lead.company || "",
            lead.message || ""
          ];
          
          // Add custom field values
          const customData = Array.from(customFields).map(field => {
            const value = lead.formData?.[field];
            return value ? String(value) : "";
          });
          
          return [...baseData, ...customData]
            .map(field => `"${(field || '').toString().replace(/"/g, '""')}"`)
            .join(",");
        })
      ].join("\\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${exportAll ? 'all' : 'current-page'}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`${leadsToExport.length} leads exported to CSV successfully!`);
    } catch (error) {
      toast.error("Failed to export leads to CSV");
    }
  };

  const exportPDF = async (exportAll = false) => {
    try {
      const leadsToExport = exportAll ? filteredLeads : paginatedLeads;
      
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Please allow popups to export PDF");
        return;
      }

      const customFields = new Set<string>();
      leadsToExport.forEach(lead => {
        if (lead.formData && typeof lead.formData === 'object') {
          Object.keys(lead.formData).forEach(key => customFields.add(key));
        }
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Leads Export - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; margin-bottom: 30px; }
            .info { text-align: center; margin-bottom: 20px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .empty { text-align: center; font-style: italic; color: #999; }
            @media print {
              body { margin: 0; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          <h1>AXIO QR - Leads Export</h1>
          <div class="info">
            <p>Export Date: ${new Date().toLocaleString()}</p>
            <p>Total Records: ${leadsToExport.length}</p>
            <p>Filter: ${selectedQrId === 'all' ? 'All QR Codes' : qrCodes.find(qr => qr.id === selectedQrId)?.label || 'Unknown'}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>QR Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Message</th>
                ${Array.from(customFields).map(field => `<th>${field}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${leadsToExport.map(lead => `
                <tr>
                  <td>${formatDateTime(lead.createdAt)}</td>
                  <td>${lead.qr.label}</td>
                  <td>${lead.name || '<span class="empty">Not provided</span>'}</td>
                  <td>${lead.email || '<span class="empty">Not provided</span>'}</td>
                  <td>${lead.phone || '<span class="empty">Not provided</span>'}</td>
                  <td>${lead.company || '<span class="empty">Not provided</span>'}</td>
                  <td>${lead.message || '<span class="empty">No message</span>'}</td>
                  ${Array.from(customFields).map(field => {
                    const value = lead.formData?.[field];
                    return `<td>${value || '<span class="empty">-</span>'}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);

      toast.success(`PDF export initiated for ${leadsToExport.length} leads!`);
    } catch (error) {
      toast.error("Failed to export leads to PDF");
    }
  };

  // Filter leads and QR codes based on search
  const filteredQrCodes = qrCodes.filter(qr => 
    qr.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeads = selectedQrId === "all" 
    ? recentLeads.filter(lead => 
        lead.qr.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : recentLeads.filter(lead => {
        const qr = qrCodes.find(q => q.slug === lead.qr.slug);
        return qr?.id === selectedQrId && (
          lead.qr.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });

  // Pagination calculations
  const totalFilteredLeads = filteredLeads.length;
  const totalPages = Math.ceil(totalFilteredLeads / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedQrId, rowsPerPage]);

  // Analyze data to determine which columns have content and custom fields
  const analyzeTableColumns = () => {
    const hasData = {
      name: false,
      email: false,
      phone: false,
      company: false,
      message: false
    };
    
    const customFields = new Set<string>();
    
    filteredLeads.forEach(lead => {
      if (lead.name) hasData.name = true;
      if (lead.email) hasData.email = true;
      if (lead.phone) hasData.phone = true;
      if (lead.company) hasData.company = true;
      if (lead.message) hasData.message = true;
      
      if (lead.formData && typeof lead.formData === 'object') {
        Object.keys(lead.formData).forEach(key => {
          if (lead.formData[key]) customFields.add(key);
        });
      }
    });
    
    return { hasData, customFields: Array.from(customFields) };
  };

  const { hasData, customFields } = analyzeTableColumns();

  // Calculate averages and insights
  const avgDailyLeads = dailyLeads.length > 0 ? Math.round(totalLeads / dailyLeads.length) : 0;
  const avgConversionRate = qrCodes.length > 0 ? qrCodes.reduce((sum, qr) => sum + qr.conversionRate, 0) / qrCodes.length : 0;
  
  // Convert hourly leads to local timezone
  const getLocalHourlyLeads = () => {
    if (!userTimezone) return hourlyLeads;
    
    const serverHourMap = new Map();
    hourlyLeads.forEach(lead => {
      serverHourMap.set(lead.hour, lead.leads);
    });

    const serverDate = new Date();
    const userDate = new Date(serverDate.toLocaleString('en-US', { timeZone: userTimezone }));
    const serverUTCDate = new Date(serverDate.toLocaleString('en-US', { timeZone: 'UTC' }));
    const timezoneOffset = Math.round((userDate.getTime() - serverUTCDate.getTime()) / (1000 * 60 * 60));

    const localHourlyLeads = [];
    for (let localHour = 0; localHour < 24; localHour++) {
      let serverHour = (localHour - timezoneOffset + 24) % 24;
      const leads = serverHourMap.get(serverHour) || 0;
      localHourlyLeads.push({ hour: localHour, leads });
    }
    
    return localHourlyLeads;
  };

  const localHourlyLeads = getLocalHourlyLeads();
  const peakHour = localHourlyLeads.reduce((max, current) => current.leads > max.leads ? current : max, localHourlyLeads[0]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Lead Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track and analyze your lead collection performance
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative group">
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              Export Leads
            </Button>
            <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="p-2 min-w-[200px]">
                <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Export Current Page</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => exportCSV(false)}
                  className="w-full justify-start"
                >
                  <FileSpreadsheet size={14} className="mr-2" />
                  Current Page as CSV
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => exportPDF(false)}
                  className="w-full justify-start"
                >
                  <FileText size={14} className="mr-2" />
                  Current Page as PDF
                </Button>
                <div className="border-t border-border my-2"></div>
                <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Export All Results</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => exportCSV(true)}
                  className="w-full justify-start"
                >
                  <FileSpreadsheet size={14} className="mr-2" />
                  All Results as CSV
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => exportPDF(true)}
                  className="w-full justify-start"
                >
                  <FileText size={14} className="mr-2" />
                  All Results as PDF
                </Button>
              </div>
            </div>
          </div>
          <Button asChild>
            <Link href="/lead-templates">
              Manage Templates
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{totalLeads.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique Leads</p>
                <p className="text-2xl font-bold">{uniqueLeads.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Conversion</p>
                <p className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peak Hour</p>
                <p className="text-lg font-bold">{peakHour ? `${peakHour.hour}:00` : "N/A"}</p>
                <p className="text-xs text-muted-foreground">{peakHour?.leads || 0} leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Daily Leads Trend */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Daily Leads (Last 30 Days)</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyLeads.slice(0, 10).map((day, index) => {
                const maxLeads = Math.max(...dailyLeads.map(d => d.leads));
                const percentage = maxLeads > 0 ? (day.leads / maxLeads) * 100 : 0;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{formatDate(day.date)}</span>
                      <span className="text-muted-foreground">{day.leads} leads</span>
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
                const hourData = localHourlyLeads.find(h => h.hour === i);
                const leads = hourData?.leads || 0;
                const maxLeads = Math.max(...localHourlyLeads.map(h => h.leads));
                const intensity = maxLeads > 0 ? (leads / maxLeads) : 0;
                return (
                  <div key={i} className="text-center">
                    <div 
                      className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-xs font-medium mb-1"
                      style={{ backgroundColor: `rgba(37, 99, 235, ${0.1 + intensity * 0.7})` }}
                    >
                      {leads}
                    </div>
                    <div className="text-xs text-muted-foreground">{i}h</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Codes Performance */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">QR Codes Performance</h3>
          <p className="text-sm text-muted-foreground">Lead collection enabled QR codes</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredQrCodes.map((qr) => (
              <div key={qr.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-semibold truncate">{qr.label}</h4>
                      <p className="text-sm text-muted-foreground truncate">{qr.destination}</p>
                      {qr.leadTemplate && (
                        <p className="text-xs text-muted-foreground">Template: {qr.leadTemplate.name}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-lg font-bold">{qr._count.leads}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{qr.totalScans}</p>
                    <p className="text-xs text-muted-foreground">Scans</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{qr.conversionRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Conversion</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/analytics/${qr.id}`}>
                        <ExternalLink size={14} />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Individual Leads Details</h3>
              <p className="text-sm text-muted-foreground">Complete information for all captured leads</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <select
                value={selectedQrId}
                onChange={(e) => setSelectedQrId(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All QR Codes</option>
                {qrCodes.map((qr) => (
                  <option key={qr.id} value={qr.id}>{qr.label}</option>
                ))}
              </select>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b-2 border-border bg-muted/20">
                  <th className="text-left py-4 px-3 font-semibold text-sm min-w-[120px]">Date & Time</th>
                  <th className="text-left py-4 px-3 font-semibold text-sm min-w-[150px]">QR Code</th>
                  {hasData.name && (
                    <th className="text-left py-4 px-3 font-semibold text-sm min-w-[120px]">Name</th>
                  )}
                  {hasData.email && (
                    <th className="text-left py-4 px-3 font-semibold text-sm min-w-[180px]">Email</th>
                  )}
                  {hasData.phone && (
                    <th className="text-left py-4 px-3 font-semibold text-sm min-w-[120px]">Phone</th>
                  )}
                  {hasData.company && (
                    <th className="text-left py-4 px-3 font-semibold text-sm min-w-[140px]">Company</th>
                  )}
                  {hasData.message && (
                    <th className="text-left py-4 px-3 font-semibold text-sm min-w-[180px]">Message</th>
                  )}
                  {customFields.map(field => (
                    <th key={field} className="text-left py-4 px-3 font-semibold text-sm min-w-[140px]">
                      {field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((lead, index) => (
                  <tr key={lead.id} className={`border-b border-border/30 hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-muted/5' : ''}`}>
                    <td className="py-4 px-3 text-sm align-top">
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium text-xs">{formatDate(lead.createdAt)}</span>
                        <span className="text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-sm align-top">
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium text-xs truncate" title={lead.qr.label}>{lead.qr.label}</span>
                        <span className="text-xs text-muted-foreground truncate">/{lead.qr.slug}</span>
                      </div>
                    </td>
                    {hasData.name && (
                      <td className="py-4 px-3 text-sm align-top">
                        <span className="text-xs font-medium" title={lead.name || undefined}>
                          {lead.name}
                        </span>
                      </td>
                    )}
                    {hasData.email && (
                      <td className="py-4 px-3 text-sm align-top">
                        <a href={`mailto:${lead.email}`} className="text-primary hover:underline text-xs truncate block" title={lead.email || undefined}>
                          {lead.email}
                        </a>
                      </td>
                    )}
                    {hasData.phone && (
                      <td className="py-4 px-3 text-sm align-top">
                        <a href={`tel:${lead.phone}`} className="text-primary hover:underline text-xs truncate block" title={lead.phone || undefined}>
                          {lead.phone}
                        </a>
                      </td>
                    )}
                    {hasData.company && (
                      <td className="py-4 px-3 text-sm align-top">
                        <span className="text-xs font-medium truncate" title={lead.company || undefined}>
                          {lead.company}
                        </span>
                      </td>
                    )}
                    {hasData.message && (
                      <td className="py-4 px-3 text-sm align-top">
                        <div className="text-xs truncate" title={lead.message || undefined}>
                          {lead.message}
                        </div>
                      </td>
                    )}
                    {customFields.map(field => {
                      const value = lead.formData?.[field];
                      return (
                        <td key={field} className="py-4 px-3 text-sm align-top">
                          <span className="text-xs font-medium truncate" title={String(value || '')}>
                            {value ? String(value) : '-'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {paginatedLeads.length === 0 && filteredLeads.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-semibold mb-2">No leads found</h3>
                <p className="text-sm">No leads match your current search criteria.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalFilteredLeads > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, totalFilteredLeads)} of {totalFilteredLeads} leads
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2"
                >
                  ««
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2"
                >
                  ‹
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="px-3"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2"
                >
                  ›
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2"
                >
                  »»
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}