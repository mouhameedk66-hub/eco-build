import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { addEvent } from "@/lib/shipment-helpers";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || session.role !== "RECYCLER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shipment = await prisma.shipment.findUnique({
    where: { id: params.id },
    include: { wasteRequest: { include: { classification: true } } },
  });
  if (!shipment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (shipment.status !== "AT_RECYCLING_CENTER") {
    return NextResponse.json({ error: "Truck has not arrived at the facility yet" }, { status: 409 });
  }

  const center = await prisma.recyclingCenter.findUnique({ where: { userId: session.userId } });
  if (!center || center.id !== shipment.recyclingCenterId) {
    return NextResponse.json({ error: "This shipment is not assigned to your facility" }, { status: 403 });
  }

  const now = new Date();
  const updated = await prisma.shipment.update({
    where: { id: params.id },
    data: { status: "COMPLETED" },
  });

  await prisma.wasteRequest.update({ where: { id: shipment.wasteRequestId }, data: { status: "COMPLETED" } });
  await prisma.truck.update({ where: { id: shipment.truckId }, data: { status: "AVAILABLE" } });

  await addEvent(params.id, "MANIFEST_COMPLETED", "Recycling facility confirmed waste reception. Digital Manifest closed.");

  const manifest = await prisma.digitalManifest.update({
    where: { shipmentId: params.id },
    data: { verified: true, closedAt: now },
  });

  if (shipment.wasteRequest.classification) {
    await prisma.recycledMaterial.create({
      data: {
        recyclingCenterId: center.id,
        materialType: shipment.wasteRequest.classification.wasteType,
        quantityTons: shipment.wasteRequest.classification.estimatedWeight,
        receivedAt: now,
      },
    });
  }

  await prisma.alert.create({
    data: {
      type: "SHIPMENT_COMPLETED",
      severity: "INFO",
      shipmentId: params.id,
      message: "Shipment successfully completed and manifest verified.",
      messageAr: "تم إكمال الشحنة بنجاح والتحقق من البيان الرقمي.",
      resolved: true,
    },
  });

  return NextResponse.json({ shipment: updated, manifest });
}
