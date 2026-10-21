import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contractor = await prisma.contractor.findUnique({ where: { userId: session.userId } });
  if (!contractor) return NextResponse.json({ error: "Not a contractor" }, { status: 403 });

  const requests = await prisma.wasteRequest.findMany({
    where: { contractorId: contractor.id },
    include: {
      images: true,
      classification: true,
      shipment: { include: { carrier: true, recyclingCenter: true, truck: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contractor = await prisma.contractor.findUnique({ where: { userId: session.userId } });
  if (!contractor) return NextResponse.json({ error: "Not a contractor" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const { projectName, projectNameAr, city, address, lat, lng, description } = body ?? {};

  if (!projectName || !city || !address) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const request = await prisma.wasteRequest.create({
    data: {
      contractorId: contractor.id,
      projectName,
      projectNameAr: projectNameAr || projectName,
      city,
      address,
      lat: typeof lat === "number" ? lat : 24.7136 + (Math.random() - 0.5) * 0.1,
      lng: typeof lng === "number" ? lng : 46.6753 + (Math.random() - 0.5) * 0.1,
      description: description || "",
      status: "PENDING",
    },
  });

  return NextResponse.json({ request });
}
