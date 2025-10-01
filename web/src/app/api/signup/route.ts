import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { email, password, name } = parsed.data;
  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    const passwordHash = await hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash, name } });
    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "Signup failed";
    // Common prod failure on Vercel if using SQLite: attempt to write a readonly database
    if (message.toLowerCase().includes("readonly") || message.toLowerCase().includes("read-only")) {
      return NextResponse.json({
        error: "Database is read-only in this environment. Please configure a writable database (e.g., Postgres).",
      }, { status: 500 });
    }
    return NextResponse.json({ error: message || "Signup failed" }, { status: 500 });
  }
}


