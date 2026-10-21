import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const product = await prisma.marketplaceProduct.findUnique({
    where: { id: params.id },
    include: { recyclingCenter: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || session.role !== "RECYCLER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const center = await prisma.recyclingCenter.findUnique({ where: { userId: session.userId } });
  const product = await prisma.marketplaceProduct.findUnique({ where: { id: params.id } });
  if (!product || !center || product.recyclingCenterId !== center.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (typeof body.price === "number") data.price = body.price;
  if (typeof body.quantityAvailable === "number") {
    data.quantityAvailable = body.quantityAvailable;
    data.status = body.quantityAvailable > 0 ? "ACTIVE" : "OUT_OF_STOCK";
  }
  if (typeof body.status === "string") data.status = body.status;

  const updated = await prisma.marketplaceProduct.update({ where: { id: params.id }, data });
  return NextResponse.json({ product: updated });
}
