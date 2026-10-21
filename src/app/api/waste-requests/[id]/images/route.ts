import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB per image, generous for demo

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const images: string[] = Array.isArray(body?.images) ? body.images : [];
  if (images.length === 0) {
    return NextResponse.json({ error: "No images provided" }, { status: 400 });
  }

  for (const img of images) {
    if (typeof img !== "string" || !img.startsWith("data:image/") || img.length > MAX_IMAGE_BYTES * 1.4) {
      return NextResponse.json({ error: "Invalid or oversized image" }, { status: 400 });
    }
  }

  const created = await prisma.$transaction(
    images.map((url) =>
      prisma.wasteImage.create({ data: { wasteRequestId: params.id, url } })
    )
  );

  return NextResponse.json({ images: created });
}
