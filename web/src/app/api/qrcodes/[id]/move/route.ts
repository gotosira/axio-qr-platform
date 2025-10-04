import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    const { folderId } = json;
    
    // Validate folder ownership if folderId is provided
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { 
          id: folderId,
          ownerId: user.id 
        }
      });

      if (!folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }
    }

    // Update QR code folder
    const qrCode = await prisma.qRCode.updateMany({
      where: { 
        id: id,
        ownerId: user.id 
      },
      data: {
        folderId: folderId || null
      }
    });

    if (qrCode.count === 0) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to move QR code:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}