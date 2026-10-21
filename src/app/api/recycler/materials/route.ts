import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = getSession();
  if (!session || session.role !== "RECYCLER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const center = await prisma.recyclingCenter.findUnique({ where: { userId: session.userId } });
  if (!center) return NextResponse.json({ materials: [] });

  const materials = await prisma.recycledMaterial.findMany({
    where: { recyclingCenterId: center.id },
    orderBy: { receivedAt: "desc" },
  });

  return NextResponse.json({ materials });
}
