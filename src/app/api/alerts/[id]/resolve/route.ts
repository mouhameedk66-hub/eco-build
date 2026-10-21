import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || session.role !== "AUTHORITY") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const alert = await prisma.alert.update({ where: { id: params.id }, data: { resolved: true } });
  return NextResponse.json({ alert });
}
