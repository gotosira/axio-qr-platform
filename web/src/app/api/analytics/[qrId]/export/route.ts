import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ qrId: string }> }
) {
  const { qrId } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify QR code ownership
    const qr = await prisma.qRCode.findFirst({
      where: { 
        id: qrId,
        ownerId: user.id 
      }
    });

    if (!qr) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    const data = await req.json();

    // Generate PDF report (simplified HTML to PDF approach)
    const reportHtml = generateReportHtml(data);
    
    // For now, return the HTML content
    // In production, you'd use a service like Puppeteer or a PDF API
    return new NextResponse(reportHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="QR-${qr.label}-Analytics-Report.html"`,
      },
    });

  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function generateReportHtml(data: any): string {
  const { qr, totalScans, scansByCountry, scansByCity, scansByReferer, dailyScans } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Analytics Report - ${qr.label}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2563eb;
            margin-bottom: 10px;
        }
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .metric-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #2563eb;
        }
        .metric-label {
            color: #64748b;
            font-size: 0.9em;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }
        .data-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .data-row:last-child {
            border-bottom: none;
        }
        .qr-info {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>QR Code Analytics Report</h1>
        <h2>${qr.label}</h2>
        <p>Generated on ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
    </div>

    <div class="qr-info">
        <h3>QR Code Information</h3>
        <div class="data-row">
            <span><strong>Label:</strong></span>
            <span>${qr.label}</span>
        </div>
        <div class="data-row">
            <span><strong>Destination:</strong></span>
            <span>${qr.destination}</span>
        </div>
        <div class="data-row">
            <span><strong>Created:</strong></span>
            <span>${new Date(qr.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="data-row">
            <span><strong>Slug:</strong></span>
            <span>${qr.slug}</span>
        </div>
    </div>

    <div class="metric-grid">
        <div class="metric-card">
            <div class="metric-value">${totalScans.toLocaleString()}</div>
            <div class="metric-label">Total Scans</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${scansByCountry.length}</div>
            <div class="metric-label">Countries Reached</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${scansByCity.length}</div>
            <div class="metric-label">Cities Reached</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${dailyScans.length > 0 ? Math.round(totalScans / dailyScans.length) : 0}</div>
            <div class="metric-label">Avg Daily Scans</div>
        </div>
    </div>

    <div class="section">
        <h2>Geographic Distribution</h2>
        <h3>Top Countries</h3>
        ${scansByCountry.slice(0, 10).map((country: any) => `
            <div class="data-row">
                <span>${country.country || 'Unknown'}</span>
                <span>${country._count._all} scans (${((country._count._all / totalScans) * 100).toFixed(1)}%)</span>
            </div>
        `).join('')}
        
        <h3 style="margin-top: 20px;">Top Cities</h3>
        ${scansByCity.slice(0, 10).map((city: any) => `
            <div class="data-row">
                <span>${city.city || 'Unknown'}</span>
                <span>${city._count._all} scans</span>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Traffic Sources</h2>
        ${scansByReferer.slice(0, 10).map((referer: any) => `
            <div class="data-row">
                <span>${referer.referer || 'Direct Access'}</span>
                <span>${referer._count._all} scans</span>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Daily Performance (Last 10 Days)</h2>
        ${dailyScans.slice(0, 10).map((day: any) => `
            <div class="data-row">
                <span>${new Date(day.date).toLocaleDateString()}</span>
                <span>${day.scans} scans</span>
            </div>
        `).join('')}
    </div>

    <div class="footer">
        <p>This report was generated by AXIO QR Analytics Platform</p>
        <p>© ${new Date().getFullYear()} AXIO QR. All rights reserved.</p>
    </div>
</body>
</html>`;
}