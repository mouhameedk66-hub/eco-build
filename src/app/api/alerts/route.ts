import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParam = req.nextUrl.searchParams.get("resolved");
  const where: Record<string, unknown> = {};
  if (resolvedParam !== null) where.resolved = resolvedParam === "true";

  const alerts = await prisma.alert.findMany({
    where,
    include: { shipment: { include: { wasteRequest: true, carrier: true, recyclingCenter: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ alerts });
}
