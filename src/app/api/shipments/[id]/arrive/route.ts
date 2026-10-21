import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { addEvent, parseRoute } from "@/lib/shipment-helpers";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || session.role !== "CARRIER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shipment = await prisma.shipment.findUnique({ where: { id: params.id } });
  if (!shipment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (shipment.status !== "IN_TRANSIT") {
    return NextResponse.json({ error: "Shipment is not in transit" }, { status: 409 });
  }

  const route = parseRoute(shipment.routeJson);
  const dest = route[route.length - 1] ?? { lat: shipment.destLat, lng: shipment.destLng };
  const now = new Date();

  const updated = await prisma.shipment.update({
    where: { id: params.id },
    data: {
      status: "AT_RECYCLING_CENTER",
      progressPct: 100,
      currentLat: dest.lat,
      currentLng: dest.lng,
      speedKph: 0,
      etaMinutes: 0,
      arrivalTime: now,
      lastGpsUpdate: now,
    },
  });
  await addEvent(params.id, "RECYCLING_CENTER_REACHED", "Truck arrived at the recycling facility.");

  return NextResponse.json({ shipment: updated });
}
