import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const request = await prisma.wasteRequest.findUnique({
    where: { id: params.id },
    include: {
      images: true,
      classification: true,
      contractor: true,
      shipment: {
        include: {
          carrier: true,
          driver: true,
          truck: true,
          recyclingCenter: true,
          manifest: true,
          events: { orderBy: { timestamp: "asc" } },
          gpsPoints: { orderBy: { timestamp: "asc" } },
        },
      },
    },
  });

  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ request });
}
