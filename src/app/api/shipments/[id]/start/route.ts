import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { addEvent } from "@/lib/shipment-helpers";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || session.role !== "CARRIER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shipment = await prisma.shipment.findUnique({ where: { id: params.id } });
  if (!shipment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (shipment.status !== "PICKUP_READY") {
    return NextResponse.json({ error: "Shipment must be pickup-ready before starting the trip" }, { status: 409 });
  }

  const now = new Date();
  const updated = await prisma.shipment.update({
    where: { id: params.id },
    data: { status: "IN_TRANSIT", departureTime: now, lastGpsUpdate: now, speedKph: 55 },
  });
  await addEvent(params.id, "PICKUP_COMPLETED", "Waste loaded onto the truck at the pickup location.");
  await addEvent(params.id, "SHIPMENT_STARTED", "Truck departed toward the recycling facility.");
  await addEvent(params.id, "IN_TRANSIT", "Live GPS tracking started.");

  return NextResponse.json({ shipment: updated });
}
