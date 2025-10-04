import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const folder = await prisma.folder.findFirst({
      where: { 
        id: id,
        ownerId: user.id 
      },
      include: {
        qrcodes: {
          include: {
            _count: {
              select: { scans: true }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: { qrcodes: true }
        }
      }
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Failed to fetch folder:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const { name, description, icon, color } = json;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const folder = await prisma.folder.updateMany({
      where: { 
        id: id,
        ownerId: user.id 
      },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon || "📁",
        color: color || "#3b82f6",
        updatedAt: new Date()
      }
    });

    if (folder.count === 0) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Return updated folder
    const updatedFolder = await prisma.folder.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: { qrcodes: true }
        }
      }
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("Failed to update folder:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // First, move all QR codes in this folder to null (uncategorized)
    await prisma.qRCode.updateMany({
      where: { 
        folderId: id,
        ownerId: user.id 
      },
      data: { folderId: null }
    });

    // Then delete the folder
    const folder = await prisma.folder.deleteMany({
      where: { 
        id: id,
        ownerId: user.id 
      }
    });

    if (folder.count === 0) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete folder:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}