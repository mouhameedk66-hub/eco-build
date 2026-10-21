import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { addEvent } from "@/lib/shipment-helpers";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || session.role !== "CARRIER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shipment = await prisma.shipment.findUnique({ where: { id: params.id } });
  if (!shipment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (shipment.status !== "ASSIGNED") {
    return NextResponse.json({ error: "Shipment cannot be accepted in its current state" }, { status: 409 });
  }

  const updated = await prisma.shipment.update({
    where: { id: params.id },
    data: { status: "PICKUP_READY" },
  });
  await addEvent(params.id, "TRUCK_ARRIVED", "Carrier accepted the request; truck en route to pickup location.");

  return NextResponse.json({ shipment: updated });
}
