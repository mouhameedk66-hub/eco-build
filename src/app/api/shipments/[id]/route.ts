import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shipment = await prisma.shipment.findUnique({
    where: { id: params.id },
    include: {
      wasteRequest: { include: { contractor: true, classification: true, images: true } },
      carrier: true,
      driver: true,
      truck: true,
      recyclingCenter: true,
      manifest: true,
      events: { orderBy: { timestamp: "asc" } },
      gpsPoints: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!shipment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ shipment });
}
