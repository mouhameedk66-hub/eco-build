import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const include = {
  wasteRequest: { include: { contractor: true, classification: true } },
  carrier: true,
  driver: true,
  truck: true,
  recyclingCenter: true,
  manifest: true,
};

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const statusFilter = req.nextUrl.searchParams.get("status");
  const where: Record<string, unknown> = {};
  if (statusFilter) where.status = statusFilter;

  if (session.role === "CONTRACTOR") {
    const contractor = await prisma.contractor.findUnique({ where: { userId: session.userId } });
    if (!contractor) return NextResponse.json({ shipments: [] });
    where.wasteRequest = { contractorId: contractor.id };
  } else if (session.role === "CARRIER") {
    const carrier = await prisma.carrier.findUnique({ where: { userId: session.userId } });
    if (!carrier) return NextResponse.json({ shipments: [] });
    where.carrierId = carrier.id;
  } else if (session.role === "RECYCLER") {
    const center = await prisma.recyclingCenter.findUnique({ where: { userId: session.userId } });
    if (!center) return NextResponse.json({ shipments: [] });
    where.recyclingCenterId = center.id;
  }
  // AUTHORITY sees all

  const shipments = await prisma.shipment.findMany({
    where,
    include,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ shipments });
}
