import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { optimizeLogistics } from "@/services/routeOptimizationService";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const request = await prisma.wasteRequest.findUnique({
    where: { id: params.id },
    include: { classification: true },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!request.classification) {
    return NextResponse.json({ error: "Run AI classification first" }, { status: 400 });
  }

  const [carriersRaw, facilitiesRaw, trucks] = await Promise.all([
    prisma.carrier.findMany({ include: { trucks: true } }),
    prisma.recyclingCenter.findMany(),
    prisma.truck.findMany({ where: { status: "AVAILABLE" } }),
  ]);

  const carriers = carriersRaw.map((c) => ({
    id: c.id,
    companyName: c.companyName,
    companyNameAr: c.companyNameAr,
    lat: c.lat,
    lng: c.lng,
    rating: c.rating,
    capacityTons: c.capacityTons,
    pricePerKm: c.pricePerKm,
    availableTrucks: trucks.filter((t) => t.carrierId === c.id).length,
  }));

  const facilities = facilitiesRaw.map((f) => ({
    id: f.id,
    name: f.name,
    nameAr: f.nameAr,
    lat: f.lat,
    lng: f.lng,
    acceptedWasteTypes: JSON.parse(f.acceptedWasteTypes) as string[],
    capacityTonsPerDay: f.capacityTonsPerDay,
    processingTimeHours: f.processingTimeHours,
    licensed: f.licensed,
  }));

  const result = optimizeLogistics({
    pickup: { lat: request.lat, lng: request.lng },
    wasteType: request.classification.wasteType,
    estimatedWeight: request.classification.estimatedWeight,
    carriers,
    facilities,
  });

  return NextResponse.json(result);
}
