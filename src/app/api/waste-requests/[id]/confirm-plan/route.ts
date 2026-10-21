import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { buildSyntheticRoute, haversineKm } from "@/services/routeOptimizationService";
import { addEvent } from "@/lib/shipment-helpers";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { carrierId, recyclingCenterId, distanceKm, estimatedCostSar, etaMinutes } = body ?? {};
  if (!carrierId || !recyclingCenterId) {
    return NextResponse.json({ error: "carrierId and recyclingCenterId are required" }, { status: 400 });
  }

  const request = await prisma.wasteRequest.findUnique({
    where: { id: params.id },
    include: { classification: true, shipment: true },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!request.classification) return NextResponse.json({ error: "Run AI classification first" }, { status: 400 });
  if (request.shipment) return NextResponse.json({ error: "Shipment already exists for this request" }, { status: 409 });

  const [carrier, facility, truck] = await Promise.all([
    prisma.carrier.findUnique({ where: { id: carrierId } }),
    prisma.recyclingCenter.findUnique({ where: { id: recyclingCenterId } }),
    prisma.truck.findFirst({ where: { carrierId, status: "AVAILABLE" } }),
  ]);
  if (!carrier || !facility) return NextResponse.json({ error: "Carrier or facility not found" }, { status: 404 });
  if (!truck) return NextResponse.json({ error: "No available truck for the selected carrier" }, { status: 409 });

  const driver = await prisma.driver.findFirst({ where: { carrierId } });
  if (!driver) return NextResponse.json({ error: "No driver available for the selected carrier" }, { status: 409 });

  const pickup = { lat: request.lat, lng: request.lng };
  const dest = { lat: facility.lat, lng: facility.lng };
  const route = buildSyntheticRoute(pickup, dest, 14);
  const finalDistance = typeof distanceKm === "number" ? distanceKm : Math.round(haversineKm(pickup, dest) * 10) / 10;

  const shipment = await prisma.shipment.create({
    data: {
      wasteRequestId: request.id,
      carrierId: carrier.id,
      driverId: driver.id,
      truckId: truck.id,
      recyclingCenterId: facility.id,
      status: "ASSIGNED",
      pickupLat: pickup.lat,
      pickupLng: pickup.lng,
      destLat: dest.lat,
      destLng: dest.lng,
      currentLat: pickup.lat,
      currentLng: pickup.lng,
      routeJson: JSON.stringify(route),
      distanceKm: finalDistance,
      estimatedCostSar: typeof estimatedCostSar === "number" ? estimatedCostSar : Math.round(finalDistance * carrier.pricePerKm),
      etaMinutes: typeof etaMinutes === "number" ? etaMinutes : Math.max(15, Math.round((finalDistance / 55) * 60)),
      progressPct: 0,
    },
  });

  await prisma.truck.update({ where: { id: truck.id }, data: { status: "ON_TRIP" } });
  await prisma.wasteRequest.update({ where: { id: request.id }, data: { status: "IN_PROGRESS" } });

  await addEvent(shipment.id, "REQUEST_CREATED", "Waste removal request submitted by contractor.");
  await addEvent(shipment.id, "CARRIER_ASSIGNED", `${carrier.companyName} assigned via smart logistics recommendation.`);

  const manifest = await prisma.digitalManifest.create({
    data: {
      shipmentId: shipment.id,
      manifestNumber: `EB-MF-${Date.now().toString().slice(-8)}`,
      verified: false,
      qrData: `ECO-BUILD|MANIFEST|${shipment.id}|${request.id}`,
    },
  });

  return NextResponse.json({ shipment, manifest });
}
