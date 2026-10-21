import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { advanceSimulatedPosition } from "@/services/trackingService";
import { parseRoute, addEvent } from "@/lib/shipment-helpers";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shipment = await prisma.shipment.findUnique({ where: { id: params.id } });
  if (!shipment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (shipment.status !== "IN_TRANSIT") {
    return NextResponse.json({ shipment, note: "Shipment is not currently in transit." });
  }

  const route = parseRoute(shipment.routeJson);
  const next = advanceSimulatedPosition({
    route,
    currentProgressPct: shipment.progressPct,
    totalDistanceKm: shipment.distanceKm,
    status: shipment.status,
  });

  const reachedFacility = next.progressPct >= 100;

  const updated = await prisma.shipment.update({
    where: { id: params.id },
    data: {
      currentLat: next.latitude,
      currentLng: next.longitude,
      progressPct: next.progressPct,
      speedKph: next.speed,
      etaMinutes: next.etaMinutes,
      lastGpsUpdate: new Date(next.timestamp),
      status: reachedFacility ? "AT_RECYCLING_CENTER" : "IN_TRANSIT",
      arrivalTime: reachedFacility ? new Date(next.timestamp) : null,
    },
  });

  await prisma.gPSPoint.create({
    data: {
      shipmentId: params.id,
      latitude: next.latitude,
      longitude: next.longitude,
      speed: next.speed,
      status: updated.status,
      timestamp: new Date(next.timestamp),
    },
  });

  if (reachedFacility) {
    await addEvent(params.id, "RECYCLING_CENTER_REACHED", "Truck arrived at the recycling facility.");
  }

  return NextResponse.json({ shipment: updated, gps: next });
}
