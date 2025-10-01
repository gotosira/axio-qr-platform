import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get overall analytics data
    const qrs = await prisma.qRCode.findMany({
      where: { ownerId: user.id },
      include: {
        scans: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const totalScans = await prisma.scanEvent.count({
      where: { qr: { ownerId: user.id } }
    });

    const scansByCountry = await prisma.scanEvent.groupBy({
      by: ["country"],
      where: { qr: { ownerId: user.id } },
      _count: { _all: true }
    });

    const scansByCity = await prisma.scanEvent.groupBy({
      by: ["city"],
      where: { qr: { ownerId: user.id } },
      _count: { _all: true }
    });

    const scansByReferer = await prisma.scanEvent.groupBy({
      by: ["referer"],
      where: { qr: { ownerId: user.id } },
      _count: { _all: true }
    });

    // Get QR performance data
    const qrPerformance = await Promise.all(
      qrs.map(async (qr) => {
        const qrScans = await prisma.scanEvent.count({
          where: { qrId: qr.id }
        });
        return {
          ...qr,
          totalScans: qrScans
        };
      })
    );

    // Sort the data client-side
    const sortedCountries = scansByCountry.sort((a, b) => (b._count?._all || 0) - (a._count?._all || 0));
    const sortedCities = scansByCity.sort((a, b) => (b._count?._all || 0) - (a._count?._all || 0));
    const sortedReferrers = scansByReferer.sort((a, b) => (b._count?._all || 0) - (a._count?._all || 0));

    const data = {
      user: user.email,
      summary: {
        totalQrs: qrs.length,
        totalScans,
        avgScansPerQr: qrs.length > 0 ? Math.round(totalScans / qrs.length) : 0,
        topCountry: sortedCountries[0]?.country || "N/A",
        topCity: sortedCities[0]?.city || "N/A"
      },
      qrPerformance: qrPerformance.sort((a, b) => b.totalScans - a.totalScans),
      geographic: {
        countries: sortedCountries.slice(0, 10),
        cities: sortedCities.slice(0, 10)
      },
      traffic: sortedReferrers.slice(0, 10)
    };

    // Generate comprehensive HTML report
    const reportHtml = generateOverallReportHtml(data);
    
    return new NextResponse(reportHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="Overall-QR-Analytics-Report.html"`,
      },
    });

  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function generateOverallReportHtml(data: any): string {
  const { user, summary, qrPerformance, geographic, traffic } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Overall QR Analytics Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background: #f8fafc;
        }
        .slide {
            background: white;
            padding: 40px;
            margin: 30px 0;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            page-break-after: always;
        }
        .slide:last-child {
            page-break-after: auto;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        .header h1 {
            color: #2563eb;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .metric-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
        }
        .metric-value {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .metric-label {
            font-size: 1.1em;
            opacity: 0.9;
        }
        .section {
            margin: 40px 0;
        }
        .section h2 {
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
            font-size: 1.8em;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .data-table th,
        .data-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        .data-table th {
            background: #f1f5f9;
            font-weight: 600;
            color: #475569;
        }
        .data-table tr:hover {
            background: #f8fafc;
        }
        .chart-placeholder {
            background: linear-gradient(45deg, #f1f5f9, #e2e8f0);
            height: 200px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
            font-weight: 500;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            padding: 30px;
            background: #1e293b;
            color: white;
            border-radius: 12px;
        }
        .highlight {
            background: #fef3c7;
            padding: 20px;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            margin: 20px 0;
        }
        @media print {
            body { background: white; }
            .slide { 
                box-shadow: none; 
                border: 1px solid #ccc;
            }
        }
    </style>
</head>
<body>
    <!-- Title Slide -->
    <div class="slide">
        <div class="header">
            <h1>QR Analytics Report</h1>
            <h2>Executive Summary</h2>
            <p style="font-size: 1.2em; margin-top: 20px;">Generated for: ${user}</p>
            <p style="color: #64748b;">Report Date: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
        </div>
        
        <div class="highlight">
            <h3>Key Insights</h3>
            <ul style="font-size: 1.1em; line-height: 1.8;">
                <li><strong>${summary.totalQrs}</strong> active QR codes generating <strong>${summary.totalScans.toLocaleString()}</strong> total scans</li>
                <li>Average of <strong>${summary.avgScansPerQr}</strong> scans per QR code</li>
                <li>Top performing region: <strong>${summary.topCountry}</strong></li>
                <li>Most active city: <strong>${summary.topCity}</strong></li>
            </ul>
        </div>
    </div>

    <!-- Performance Overview Slide -->
    <div class="slide">
        <h2>Performance Overview</h2>
        
        <div class="metric-grid">
            <div class="metric-card">
                <div class="metric-value">${summary.totalQrs}</div>
                <div class="metric-label">Total QR Codes</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${summary.totalScans.toLocaleString()}</div>
                <div class="metric-label">Total Scans</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${summary.avgScansPerQr}</div>
                <div class="metric-label">Avg Scans/QR</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${geographic.countries.length}</div>
                <div class="metric-label">Countries Reached</div>
            </div>
        </div>
        
        <div class="chart-placeholder">
            Performance Trends Chart
            <br><small>Visual representation of scan activity over time</small>
        </div>
    </div>

    <!-- Top Performing QR Codes Slide -->
    <div class="slide">
        <h2>Top Performing QR Codes</h2>
        
        <table class="data-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>QR Code Label</th>
                    <th>Destination</th>
                    <th>Total Scans</th>
                    <th>Performance</th>
                </tr>
            </thead>
            <tbody>
                ${qrPerformance.slice(0, 10).map((qr: any, index: number) => {
                  const percentage = summary.totalScans > 0 ? ((qr.totalScans / summary.totalScans) * 100).toFixed(1) : '0.0';
                  return `
                    <tr>
                        <td><strong>#${index + 1}</strong></td>
                        <td><strong>${qr.label}</strong></td>
                        <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${qr.destination}</td>
                        <td><strong>${qr.totalScans.toLocaleString()}</strong></td>
                        <td>${percentage}% of total</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
    </div>

    <!-- Geographic Analysis Slide -->
    <div class="slide">
        <h2>Geographic Analysis</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
            <div>
                <h3>Top Countries</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Country</th>
                            <th>Scans</th>
                            <th>Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${geographic.countries.slice(0, 8).map((country: any) => {
                          const percentage = summary.totalScans > 0 ? ((country._count._all / summary.totalScans) * 100).toFixed(1) : '0.0';
                          return `
                            <tr>
                                <td>${country.country || 'Unknown'}</td>
                                <td><strong>${country._count._all.toLocaleString()}</strong></td>
                                <td>${percentage}%</td>
                            </tr>
                          `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div>
                <h3>Top Cities</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>City</th>
                            <th>Scans</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${geographic.cities.slice(0, 8).map((city: any) => `
                            <tr>
                                <td>${city.city || 'Unknown'}</td>
                                <td><strong>${city._count._all.toLocaleString()}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="chart-placeholder">
            Geographic Distribution Map
            <br><small>Visual map showing scan distribution across regions</small>
        </div>
    </div>

    <!-- Traffic Sources Slide -->
    <div class="slide">
        <h2>Traffic Sources Analysis</h2>
        
        <table class="data-table">
            <thead>
                <tr>
                    <th>Source</th>
                    <th>Scans</th>
                    <th>Percentage</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
                ${traffic.map((source: any) => {
                  const percentage = summary.totalScans > 0 ? ((source._count._all / summary.totalScans) * 100).toFixed(1) : '0.0';
                  const sourceType = source.referer ? 'Referral' : 'Direct';
                  const displaySource = source.referer || 'Direct Access';
                  return `
                    <tr>
                        <td>${displaySource}</td>
                        <td><strong>${source._count._all.toLocaleString()}</strong></td>
                        <td>${percentage}%</td>
                        <td><span style="padding: 4px 8px; background: ${sourceType === 'Direct' ? '#dcfce7' : '#dbeafe'}; border-radius: 4px; font-size: 0.9em;">${sourceType}</span></td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
        
        <div class="highlight">
            <h3>Traffic Insights</h3>
            <p><strong>Direct access</strong> represents ${traffic.find((t: any) => !t.referer)?._count._all || 0} scans (${traffic.find((t: any) => !t.referer) ? ((traffic.find((t: any) => !t.referer)._count._all / summary.totalScans) * 100).toFixed(1) : '0'}% of total), indicating strong brand recognition and direct QR code usage.</p>
        </div>
    </div>

    <div class="footer">
        <h3>Report Summary</h3>
        <p>This comprehensive analytics report provides insights into your QR code performance across all campaigns. Use these insights to optimize your QR code strategy and improve engagement.</p>
        <p style="margin-top: 20px; opacity: 0.8;">Generated by AXIO QR Analytics Platform | © ${new Date().getFullYear()} All rights reserved</p>
    </div>
</body>
</html>`;
}