import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = getSession();
  if (!session || session.role !== "RECYCLER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const center = await prisma.recyclingCenter.findUnique({ where: { userId: session.userId } });
  if (!center) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ center });
}
