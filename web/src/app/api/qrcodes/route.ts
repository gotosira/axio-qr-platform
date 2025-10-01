import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomBytes } from "crypto";
import { z } from "zod";

const styleSchema = z.object({
  logoUrl: z.string().url().optional().nullable(),
  fgColor: z.string().optional(),
  bgColor: z.string().optional(),
  styleType: z.enum(["square", "rounded", "dots"]).optional(),
  logoAspect: z.enum(["1:1", "16:9", "3:4"]).optional(),
  cornerRadius: z.number().int().min(0).max(100).optional(),
  logoSizePct: z.number().int().min(10).max(60).optional(),
}).partial();

const createSchema = z.object({
  label: z.string().min(1),
  destination: z.string().min(1),
  style: styleSchema.optional(),
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
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

    const json = await req.json().catch(() => null);
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const { label, destination, style, metadata } = parsed.data;

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


