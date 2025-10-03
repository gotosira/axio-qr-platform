import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const leadSchema = z.object({
  qrId: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  company: z.string().min(1, "Company/University is required"),
  message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const parsed = leadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Invalid payload", 
        details: parsed.error.issues 
      }, { status: 400 });
    }

    const { qrId, name, email, phone, company, message } = parsed.data;

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
        name: name?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        message: message?.trim() || null,
        ip,
        userAgent,
      },
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error) {
    console.error("Lead submission failed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}