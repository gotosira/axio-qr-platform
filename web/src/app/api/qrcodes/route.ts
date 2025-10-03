import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomBytes } from "crypto";
import { z } from "zod";

const styleSchema = z.object({
  logoUrl: z.string().optional().nullable(), // Allow data URLs and regular URLs
  fgColor: z.string().optional(),
  bgColor: z.string().optional(),
  styleType: z.enum(["square", "rounded", "dots"]).optional(),
  logoAspect: z.enum(["1:1", "16:9", "3:4"]).optional(),
  cornerRadius: z.number().int().min(0).max(100).optional(),
  logoSizePct: z.number().int().min(5).max(70).optional(),
}).partial();

const createSchema = z.object({
  label: z.string().min(1),
  destination: z.string().min(1),
  collectLeads: z.boolean().optional(),
  leadTemplateId: z.string().optional().nullable(),
  style: styleSchema.optional(),
  metadata: z.object({
    title: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
  }).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await prisma.qRCode.findMany({
    where: { ownerId: user.id },
    include: {
      scans: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check content length to prevent 413 errors
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json({ error: "Request too large. Please use a smaller logo image." }, { status: 413 });
    }

    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Validate logo data URL size if present
    if (json.style?.logoUrl && json.style.logoUrl.startsWith('data:')) {
      const base64Size = json.style.logoUrl.length * 0.75; // Approximate decoded size
      if (base64Size > 2 * 1024 * 1024) { // 2MB limit for base64 data
        return NextResponse.json({ error: "Logo image too large. Please use an image smaller than 2MB." }, { status: 413 });
      }
    }

    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      console.error("Validation failed:", parsed.error.issues);
      console.error("Received payload:", JSON.stringify(json, null, 2));
      return NextResponse.json({ 
        error: "Invalid payload", 
        details: parsed.error.issues 
      }, { status: 400 });
    }
    const { label, destination, collectLeads, leadTemplateId, style, metadata } = parsed.data;

    let slug = randomBytes(4).toString("hex");
    for (let i = 0; i < 3; i++) {
      const existing = await prisma.qRCode.findUnique({ where: { slug } });
      if (!existing) break;
      slug = randomBytes(4).toString("hex");
    }

    const created = await prisma.qRCode.create({
      data: {
        label,
        destination,
        slug,
        ownerId: user.id,
        collectLeads: collectLeads ?? false,
        leadTemplateId: leadTemplateId || null,
        logoUrl: style?.logoUrl ?? null,
        fgColor: style?.fgColor ?? undefined,
        bgColor: style?.bgColor ?? undefined,
        styleType: style?.styleType ?? undefined,
        logoAspect: style?.logoAspect ?? undefined,
        cornerRadius: style?.cornerRadius ?? undefined,
        logoSizePct: style?.logoSizePct ?? undefined,
        metaTitle: metadata?.title ?? null,
        metaDescription: metadata?.description ?? null,
        metaImage: metadata?.image ?? null,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error("Create QR failed", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const schema = z.object({ id: z.string(), label: z.string().min(1).optional(), destination: z.string().url().optional(), style: styleSchema.optional() });
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { id, label, destination, style } = parsed.data;
  const existing = await prisma.qRCode.findUnique({ where: { id } });
  if (!existing || existing.ownerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.qRCode.update({
    where: { id },
    data: {
      label,
      destination,
      logoUrl: style?.logoUrl ?? existing.logoUrl,
      fgColor: style?.fgColor ?? existing.fgColor,
      bgColor: style?.bgColor ?? existing.bgColor,
      styleType: style?.styleType ?? existing.styleType,
      logoAspect: style?.logoAspect ?? existing.logoAspect,
      cornerRadius: style?.cornerRadius ?? existing.cornerRadius,
      logoSizePct: style?.logoSizePct ?? existing.logoSizePct,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const existing = await prisma.qRCode.findUnique({ where: { id } });
  if (!existing || existing.ownerId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.scanEvent.deleteMany({ where: { qrId: id } });
  await prisma.qRCode.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}


