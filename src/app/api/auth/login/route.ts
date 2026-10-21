import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encodeSession, SESSION_COOKIE, roleHome, type SessionPayload } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = (body?.email ?? "").toString().trim().toLowerCase();
  const password = (body?.password ?? "").toString();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Invalid credentials. This is a demo login — use one of the demo accounts." }, { status: 401 });
  }

  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as SessionPayload["role"],
    name: user.name,
    nameAr: user.nameAr,
  };

  const res = NextResponse.json({ role: user.role, redirect: roleHome[payload.role] });
  res.cookies.set(SESSION_COOKIE, encodeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
