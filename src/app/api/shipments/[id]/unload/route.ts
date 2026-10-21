import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { addEvent } from "@/lib/shipment-helpers";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || session.role !== "CARRIER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shipment = await prisma.shipment.findUnique({ where: { id: params.id } });
  if (!shipment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (shipment.status !== "AT_RECYCLING_CENTER") {
    return NextResponse.json({ error: "Truck has not arrived at the facility yet" }, { status: 409 });
  }

  await addEvent(params.id, "WASTE_UNLOADED", "Driver confirmed unloading. Awaiting facility reception confirmation.");
  await prisma.truck.update({ where: { id: shipment.truckId }, data: { status: "AVAILABLE" } });

  return NextResponse.json({ ok: true });
}
