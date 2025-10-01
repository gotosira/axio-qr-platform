import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const qr = await prisma.qRCode.findUnique({ where: { slug } });
  if (!qr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const headers = new Headers(req.headers);
  const ip = headers.get("x-forwarded-for") ?? headers.get("x-real-ip") ?? "";
  const userAgent = headers.get("user-agent") ?? undefined;
  const referer = headers.get("referer") ?? undefined;
  const country = headers.get("x-vercel-ip-country") ?? undefined;
  const city = headers.get("x-vercel-ip-city") ?? undefined;

  const parsed = parseUserAgent(userAgent ?? "");

  await prisma.scanEvent.create({
    data: {
      qrId: qr.id,
      ip: ip || undefined,
      userAgent,
      referer,
      country: country ?? parsed.country,
      city: city ?? parsed.city,
    },
  });

  return NextResponse.redirect(qr.destination, 302);
}

function parseUserAgent(ua: string): { device?: string; os?: string; browser?: string; country?: string; city?: string } {
  // Lightweight UA hints (best-effort)
  const out: any = {};
  if (/iphone|ipad|ipod/i.test(ua)) out.device = "iOS";
  else if (/android/i.test(ua)) out.device = "Android";
  else if (/macintosh|mac os x/i.test(ua)) out.device = "Mac";
  else if (/windows/i.test(ua)) out.device = "Windows";
  else if (/linux/i.test(ua)) out.device = "Linux";

  if (/windows nt/i.test(ua)) out.os = "Windows";
  else if (/mac os x/i.test(ua)) out.os = "macOS";
  else if (/android/i.test(ua)) out.os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) out.os = "iOS";
  else if (/linux/i.test(ua)) out.os = "Linux";

  if (/chrome\//i.test(ua)) out.browser = "Chrome";
  else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) out.browser = "Safari";
  else if (/firefox\//i.test(ua)) out.browser = "Firefox";
  else if (/edg\//i.test(ua)) out.browser = "Edge";
  else if (/opera|opr\//i.test(ua)) out.browser = "Opera";
  return out;
}


