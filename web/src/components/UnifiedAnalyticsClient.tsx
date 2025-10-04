"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
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

  // Analyze lead data to determine visible columns
  const analyzeLeadColumns = () => {
    const hasData = {
      name: false,
      email: false,
      phone: false,
      company: false,
      message: false
    };
    
    const customFields = new Set<string>();
    
    leadData.recentLeads.forEach(lead => {
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

  const exportCombinedCSV = async () => {
    try {
      const { hasData, customFields } = analyzeLeadColumns();
      
      // QR Analytics data
      const qrHeaders = ["QR Label", "QR Slug", "Destination", "Total Scans", "Created Date"];
      const qrRows = qrData.qrs.map(qr => [
        qr.label,
        qr.slug,
        qr.destination,
        qr._count?.scans || 0,
        formatDate(qr.createdAt)
      ]);

      // Lead Analytics data - only visible columns
      const leadBaseHeaders = ["Date", "Time", "QR Code", "QR Slug"];
      if (hasData.name) leadBaseHeaders.push("Name");
      if (hasData.email) leadBaseHeaders.push("Email");
      if (hasData.phone) leadBaseHeaders.push("Phone");
      if (hasData.company) leadBaseHeaders.push("Company");
      if (hasData.message) leadBaseHeaders.push("Message");
      leadBaseHeaders.push(...customFields);

      const leadRows = leadData.recentLeads.map(lead => {
        const row = [
          formatDate(lead.createdAt),
          new Date(lead.createdAt).toLocaleTimeString(),
          lead.qr.label,
          lead.qr.slug
        ];
        
        if (hasData.name) row.push(lead.name || "");
        if (hasData.email) row.push(lead.email || "");
        if (hasData.phone) row.push(lead.phone || "");
        if (hasData.company) row.push(lead.company || "");
        if (hasData.message) row.push(lead.message || "");
        
        customFields.forEach(field => {
          const value = lead.formData?.[field];
          row.push(value ? String(value) : "");
        });
        
        return row;
      });

      // Combine data
      const csvContent = [
        "=== QR CODES ANALYTICS ===",
        qrHeaders.join(","),
        ...qrRows.map(row => row.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(",")),
        "",
        "=== LEADS ANALYTICS ===",
        leadBaseHeaders.join(","),
        ...leadRows.map(row => row.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(","))
      ].join("\\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-combined-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Combined analytics exported: ${qrData.qrs.length} QR codes, ${leadData.recentLeads.length} leads`);
    } catch (error) {
      toast.error("Failed to export combined analytics");
    }
  };

  const exportCombinedPDF = async () => {
    try {
      const { hasData, customFields } = analyzeLeadColumns();
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Please allow popups to export PDF");
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>AXIO QR - Combined Analytics Report</title>
          <meta charset="UTF-8">
          <style>
            * { box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            .container {
              background: white;
              border-radius: 12px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
              max-width: 1400px;
              margin: 0 auto;
            }
            .header {
              background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0 0 15px 0;
              font-size: 36px;
              font-weight: 700;
              letter-spacing: -0.5px;
            }
            .header .subtitle {
              font-size: 20px;
              opacity: 0.9;
              margin: 0;
            }
            .stats-section {
              background: #f8fafc;
              padding: 30px;
              border-bottom: 1px solid #e2e8f0;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 25px;
              max-width: 1000px;
              margin: 0 auto;
            }
            .stat-card {
              background: white;
              padding: 25px;
              border-radius: 12px;
              border-left: 5px solid #7c3aed;
              box-shadow: 0 4px 6px rgba(0,0,0,0.07);
              text-align: center;
            }
            .stat-icon {
              font-size: 32px;
              margin-bottom: 10px;
            }
            .stat-label {
              font-size: 14px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
              font-weight: 600;
            }
            .stat-value {
              font-size: 24px;
              color: #1e293b;
              font-weight: 700;
            }
            .section {
              padding: 40px 30px;
            }
            .section-header {
              display: flex;
              align-items: center;
              gap: 15px;
              margin-bottom: 30px;
              padding-bottom: 15px;
              border-bottom: 3px solid #e2e8f0;
            }
            .section-title {
              font-size: 28px;
              color: #1e293b;
              font-weight: 700;
              margin: 0;
            }
            .section-icon {
              font-size: 36px;
            }
            .section-description {
              color: #64748b;
              margin: 5px 0 0 0;
              font-size: 16px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 8px 16px rgba(0,0,0,0.1);
              margin-bottom: 30px;
            }
            th {
              background: linear-gradient(135deg, #1e293b 0%, #374151 100%);
              color: white;
              padding: 18px 15px;
              text-align: left;
              font-size: 14px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              border: none;
            }
            td {
              padding: 16px 15px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 14px;
              color: #374151;
              vertical-align: top;
            }
            tr:nth-child(even) td {
              background-color: #f8fafc;
            }
            tr:hover td {
              background-color: #f1f5f9;
              transition: background-color 0.2s ease;
            }
            .empty {
              color: #9ca3af;
              font-style: italic;
              font-size: 13px;
            }
            .email-link {
              color: #2563eb;
              text-decoration: none;
              font-weight: 500;
            }
            .phone-link {
              color: #059669;
              text-decoration: none;
              font-weight: 500;
            }
            .qr-destination {
              max-width: 300px;
              word-wrap: break-word;
              color: #4f46e5;
              font-weight: 500;
            }
            .scan-count {
              background: #dbeafe;
              color: #1e40af;
              padding: 4px 12px;
              border-radius: 20px;
              font-weight: 600;
              font-size: 13px;
              display: inline-block;
            }
            .footer {
              background: linear-gradient(135deg, #1e293b 0%, #374151 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .footer-content {
              max-width: 600px;
              margin: 0 auto;
            }
            .footer-title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 10px;
            }
            .footer-info {
              opacity: 0.8;
              font-size: 14px;
              line-height: 1.6;
            }
            @media print {
              body { 
                background: white !important;
                padding: 0 !important;
              }
              .container {
                box-shadow: none !important;
                border-radius: 0 !important;
              }
              .header {
                background: #7c3aed !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              th {
                background: #1e293b !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              tr:nth-child(even) td {
                background-color: #f8fafc !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              .section {
                page-break-before: always;
              }
              .section:first-child {
                page-break-before: auto;
              }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Complete Analytics Report</h1>
              <p class="subtitle">Comprehensive QR Code & Lead Collection Analysis</p>
            </div>
            
            <div class="stats-section">
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">📊</div>
                  <div class="stat-label">Export Date</div>
                  <div class="stat-value">${new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🎯</div>
                  <div class="stat-label">QR Codes</div>
                  <div class="stat-value">${qrData.qrs.length.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">👥</div>
                  <div class="stat-label">Total Leads</div>
                  <div class="stat-value">${leadData.recentLeads.length.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">⏰</div>
                  <div class="stat-label">Generated</div>
                  <div class="stat-value">${new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-header">
                <div class="section-icon">🎯</div>
                <div>
                  <h2 class="section-title">QR Code Performance</h2>
                  <p class="section-description">Overview of all QR codes and their scan analytics</p>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>QR Code Label</th>
                    <th>Slug</th>
                    <th>Destination URL</th>
                    <th>Total Scans</th>
                    <th>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${qrData.qrs.map(qr => `
                    <tr>
                      <td style="font-weight: 600; color: #1e293b;">${qr.label}</td>
                      <td style="font-family: monospace; background: #f1f5f9; padding: 6px 10px; border-radius: 4px; font-size: 13px;">/${qr.slug}</td>
                      <td class="qr-destination">${qr.destination}</td>
                      <td><span class="scan-count">${(qr._count?.scans || 0).toLocaleString()}</span></td>
                      <td style="color: #64748b;">${formatDate(qr.createdAt)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="section">
              <div class="section-header">
                <div class="section-icon">👥</div>
                <div>
                  <h2 class="section-title">Lead Collection Data</h2>
                  <p class="section-description">Detailed information about captured leads</p>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>QR Code</th>
                    ${hasData.name ? '<th>Name</th>' : ''}
                    ${hasData.email ? '<th>Email</th>' : ''}
                    ${hasData.phone ? '<th>Phone</th>' : ''}
                    ${hasData.company ? '<th>Company</th>' : ''}
                    ${hasData.message ? '<th>Message</th>' : ''}
                    ${customFields.map(field => `<th>${field}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${leadData.recentLeads.map(lead => `
                    <tr>
                      <td>
                        <div style="font-weight: 600; color: #1e293b;">${formatDate(lead.createdAt)}</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 3px;">${new Date(lead.createdAt).toLocaleTimeString()}</div>
                      </td>
                      <td>
                        <div style="font-weight: 600; color: #1e293b;">${lead.qr.label}</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 3px;">/${lead.qr.slug}</div>
                      </td>
                      ${hasData.name ? `<td style="font-weight: 600;">${lead.name || '<span class="empty">Not provided</span>'}</td>` : ''}
                      ${hasData.email ? `<td>${lead.email ? `<a href="mailto:${lead.email}" class="email-link">${lead.email}</a>` : '<span class="empty">Not provided</span>'}</td>` : ''}
                      ${hasData.phone ? `<td>${lead.phone ? `<a href="tel:${lead.phone}" class="phone-link">${lead.phone}</a>` : '<span class="empty">Not provided</span>'}</td>` : ''}
                      ${hasData.company ? `<td style="font-weight: 600;">${lead.company || '<span class="empty">Not provided</span>'}</td>` : ''}
                      ${hasData.message ? `<td style="max-width: 300px; word-wrap: break-word;">${lead.message || '<span class="empty">No message</span>'}</td>` : ''}
                      ${customFields.map(field => {
                        const value = lead.formData?.[field];
                        return `<td style="font-weight: 500;">${value || '<span class="empty">-</span>'}</td>`;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="footer">
              <div class="footer-content">
                <div class="footer-title">AXIO QR Platform Analytics</div>
                <div class="footer-info">
                  This comprehensive report includes ${qrData.qrs.length} QR codes and ${leadData.recentLeads.length} leads.<br>
                  Generated on ${new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} at ${new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);

      toast.success("Combined analytics PDF export initiated!");
    } catch (error) {
      toast.error("Failed to export combined analytics to PDF");
    }
  };

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
          <div className="relative group">
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              Export Combined
            </Button>
            <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="p-2 min-w-[200px]">
                <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Export All Analytics</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportCombinedCSV}
                  className="w-full justify-start"
                >
                  <FileSpreadsheet size={14} className="mr-2" />
                  Combined CSV Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportCombinedPDF}
                  className="w-full justify-start"
                >
                  <FileText size={14} className="mr-2" />
                  Combined PDF Export
                </Button>
              </div>
            </div>
          </div>
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