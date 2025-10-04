import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Manual validation
    const { qrId, name, email, phone, company, message, formData } = json;
    
    if (!qrId || typeof qrId !== 'string' || qrId.trim().length === 0) {
      return NextResponse.json({ error: "qrId is required" }, { status: 400 });
    }

    // Verify QR exists and has lead collection enabled
    const qr = await prisma.qRCode.findUnique({
      where: { id: qrId },
    });

    if (!qr || !qr.collectLeads) {
      return NextResponse.json({ error: "QR code not found or lead collection not enabled" }, { status: 404 });
    }

    // Get request metadata
    const headers = new Headers(req.headers);
    const ip = headers.get("x-forwarded-for") ?? headers.get("x-real-ip") ?? undefined;
    const userAgent = headers.get("user-agent") ?? undefined;

    // Create lead record
    const lead = await prisma.lead.create({
      data: {
        qrId,
        name: name && typeof name === 'string' ? name.trim() || null : null,
        email: email && typeof email === 'string' ? email.trim() || null : null,
        phone: phone && typeof phone === 'string' ? phone.trim() || null : null,
        company: company && typeof company === 'string' ? company.trim() || null : null,
        message: message && typeof message === 'string' ? message.trim() || null : null,
        ip,
        userAgent,
        formData: formData || {},
      },
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error) {
    console.error("Lead submission failed:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: "Server error",
      debug: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    }, { status: 500 });
  }
}