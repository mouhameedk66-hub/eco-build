import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const materialType = sp.get("materialType");
  const location = sp.get("location");
  const minPrice = sp.get("minPrice");
  const maxPrice = sp.get("maxPrice");
  const minQuantity = sp.get("minQuantity");
  const mine = sp.get("mine");

  const where: Record<string, unknown> = {};
  if (mine === "true") {
    const session = getSession();
    if (!session || session.role !== "RECYCLER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const center = await prisma.recyclingCenter.findUnique({ where: { userId: session.userId } });
    if (!center) return NextResponse.json({ products: [] });
    where.recyclingCenterId = center.id;
  }
  if (materialType) where.materialType = materialType;
  if (location) where.location = location;
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: Number(minPrice) } : {}),
      ...(maxPrice ? { lte: Number(maxPrice) } : {}),
    };
  }
  if (minQuantity) where.quantityAvailable = { gte: Number(minQuantity) };

  const products = await prisma.marketplaceProduct.findMany({
    where,
    include: { recyclingCenter: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || session.role !== "RECYCLER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const center = await prisma.recyclingCenter.findUnique({ where: { userId: session.userId } });
  if (!center) return NextResponse.json({ error: "Facility profile not found" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const { name, nameAr, materialType, description, descriptionAr, price, quantityAvailable, location, imageSeed } = body ?? {};

  if (!name || !materialType || !price || !quantityAvailable) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const product = await prisma.marketplaceProduct.create({
    data: {
      recyclingCenterId: center.id,
      name,
      nameAr: nameAr || name,
      materialType,
      description: description || "",
      descriptionAr: descriptionAr || description || "",
      price: Number(price),
      quantityAvailable: Number(quantityAvailable),
      location: location || center.city,
      imageSeed: imageSeed || materialType.toLowerCase(),
      status: Number(quantityAvailable) > 0 ? "ACTIVE" : "OUT_OF_STOCK",
    },
  });

  return NextResponse.json({ product });
}
