import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { SHIPMENT_STATUS_ORDER } from "@/types";

export async function GET() {
  const session = getSession();
  if (!session || session.role !== "AUTHORITY") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [requests, shipments, classifications, recycledMaterials, alerts, facilities, carriers] = await Promise.all([
    prisma.wasteRequest.count(),
    prisma.shipment.findMany({
      include: { wasteRequest: { include: { classification: true } }, carrier: true, recyclingCenter: true, truck: true },
    }),
    prisma.aIClassification.findMany(),
    prisma.recycledMaterial.findMany(),
    prisma.alert.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: { shipment: { include: { wasteRequest: true, carrier: true } } } }),
    prisma.recyclingCenter.findMany(),
    prisma.carrier.findMany({ include: { trucks: true } }),
  ]);

  const totalShipments = shipments.length;
  const completedShipments = shipments.filter((s) => s.status === "COMPLETED").length;
  const activeShipments = shipments.filter((s) => ["ASSIGNED", "PICKUP_READY", "IN_TRANSIT", "AT_RECYCLING_CENTER"].includes(s.status)).length;
  const flaggedShipments = shipments.filter((s) => s.status === "FLAGGED" || s.flagged).length;

  const totalTransportedTons = classifications.reduce((s, c) => s + c.estimatedWeight, 0);
  const totalRecycledTons = recycledMaterials.reduce((s, m) => s + m.quantityTons, 0);
  const recyclingRate = totalTransportedTons > 0 ? Math.min(100, Math.round((totalRecycledTons / totalTransportedTons) * 1000) / 10) : 0;

  const byStatus = SHIPMENT_STATUS_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = shipments.filter((sh) => sh.status === s).length;
    return acc;
  }, {});

  const wasteByType = classifications.reduce<Record<string, number>>((acc, c) => {
    acc[c.wasteType] = (acc[c.wasteType] ?? 0) + c.estimatedWeight;
    return acc;
  }, {});

  // Volume over time (group by day for last 15 entries by createdAt of classification)
  const volumeOverTime = classifications
    .slice()
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((c) => ({ date: c.createdAt.toISOString().slice(0, 10), weight: c.estimatedWeight }))
    .reduce<{ date: string; weight: number }[]>((acc, cur) => {
      const existing = acc.find((a) => a.date === cur.date);
      if (existing) existing.weight += cur.weight;
      else acc.push({ ...cur });
      return acc;
    }, []);

  const recycledByMaterial = recycledMaterials.reduce<Record<string, number>>((acc, m) => {
    acc[m.materialType] = (acc[m.materialType] ?? 0) + m.quantityTons;
    return acc;
  }, {});

  const trucks = carriers.flatMap((c) =>
    c.trucks.map((t) => ({
      id: t.id,
      plateNumber: t.plateNumber,
      status: t.status,
      carrierName: c.companyName,
      carrierNameAr: c.companyNameAr,
    }))
  );

  const activeShipmentMarkers = shipments
    .filter((s) => ["IN_TRANSIT", "AT_RECYCLING_CENTER", "ASSIGNED", "PICKUP_READY", "FLAGGED"].includes(s.status))
    .map((s) => ({
      id: s.id,
      status: s.status,
      lat: s.currentLat,
      lng: s.currentLng,
      pickupLat: s.pickupLat,
      pickupLng: s.pickupLng,
      destLat: s.destLat,
      destLng: s.destLng,
      carrierName: s.carrier.companyName,
      carrierNameAr: s.carrier.companyNameAr,
      facilityName: s.recyclingCenter.name,
      facilityNameAr: s.recyclingCenter.nameAr,
      flagged: s.flagged || s.status === "FLAGGED",
    }));

  return NextResponse.json({
    totals: {
      totalRequests: requests,
      totalShipments,
      totalTransportedTons: Math.round(totalTransportedTons * 10) / 10,
      totalRecycledTons: Math.round(totalRecycledTons * 10) / 10,
      recyclingRate,
      completedShipments,
      activeShipments,
      flaggedShipments,
    },
    byStatus,
    wasteByType,
    volumeOverTime,
    recycledByMaterial,
    alerts,
    facilities: facilities.map((f) => ({ id: f.id, name: f.name, nameAr: f.nameAr, lat: f.lat, lng: f.lng, city: f.city })),
    trucks,
    activeShipmentMarkers,
  });
}
