import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const updateTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  bannerPosition: z.string().optional(),
  backgroundColor: z.string().optional(),
  cardColor: z.string().optional(),
  primaryColor: z.string().optional(),
  textColor: z.string().optional(),
  buttonColor: z.string().optional(),
  buttonTextColor: z.string().optional(),
  buttonText: z.string().optional(),
  footerText: z.string().optional(),
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
  })).optional(),
});

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await ctx.params;
    const template = await prisma.leadTemplate.findFirst({
      where: { 
        id,
        ownerId: user.id 
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Failed to fetch template:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await ctx.params;
    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const parsed = updateTemplateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "Invalid payload", 
        details: parsed.error.issues 
      }, { status: 400 });
    }

    const template = await prisma.leadTemplate.findFirst({
      where: { 
        id,
        ownerId: user.id 
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const updateData = {
      ...parsed.data,
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

    const updatedTemplate = await prisma.leadTemplate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("Failed to update template:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await ctx.params;
    const template = await prisma.leadTemplate.findFirst({
      where: { 
        id,
        ownerId: user.id 
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Update any QR codes using this template to remove the reference
    await prisma.qRCode.updateMany({
      where: { leadTemplateId: id },
      data: { leadTemplateId: null },
    });

    await prisma.leadTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete template:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}