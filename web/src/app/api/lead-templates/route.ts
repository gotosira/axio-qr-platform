import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  title: z.string().default("Get Exclusive Access"),
  subtitle: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  bannerPosition: z.string().default("top"),
  backgroundColor: z.string().default("#f8fafc"),
  cardColor: z.string().default("#ffffff"),
  primaryColor: z.string().default("#3b82f6"),
  textColor: z.string().default("#1f2937"),
  buttonColor: z.string().default("#3b82f6"),
  buttonTextColor: z.string().default("#ffffff"),
  buttonText: z.string().default("Submit"),
  footerText: z.string().default("Your information is secure and will not be shared with third parties."),
  facebookUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  termsUrl: z.string().optional(),
  privacyUrl: z.string().optional(),
  formFields: z.array(z.object({
    id: z.string(),
    type: z.enum(["text", "email", "tel", "textarea", "select", "checkbox", "radio"]),
    label: z.string(),
    placeholder: z.string(),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
  })).default([]),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const templates = await prisma.leadTemplate.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const parsed = createTemplateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Invalid payload", 
        details: parsed.error.issues 
      }, { status: 400 });
    }

    const templateData = {
      ...parsed.data,
      ownerId: user.id,
      subtitle: parsed.data.subtitle || null,
      logoUrl: parsed.data.logoUrl || null,
      bannerUrl: parsed.data.bannerUrl || null,
      facebookUrl: parsed.data.facebookUrl || null,
      twitterUrl: parsed.data.twitterUrl || null,
      instagramUrl: parsed.data.instagramUrl || null,
      linkedinUrl: parsed.data.linkedinUrl || null,
      youtubeUrl: parsed.data.youtubeUrl || null,
      tiktokUrl: parsed.data.tiktokUrl || null,
      websiteUrl: parsed.data.websiteUrl || null,
      termsUrl: parsed.data.termsUrl || null,
      privacyUrl: parsed.data.privacyUrl || null,
    };

    const template = await prisma.leadTemplate.create({
      data: templateData,
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Failed to create template:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}