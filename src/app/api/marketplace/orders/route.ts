import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role === "CONTRACTOR") {
    const contractor = await prisma.contractor.findUnique({ where: { userId: session.userId } });
    if (!contractor) return NextResponse.json({ orders: [] });
    const orders = await prisma.order.findMany({
      where: { contractorId: contractor.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  }

  if (session.role === "RECYCLER") {
    const center = await prisma.recyclingCenter.findUnique({ where: { userId: session.userId } });
    if (!center) return NextResponse.json({ orders: [] });
    const orders = await prisma.order.findMany({
      where: { items: { some: { product: { recyclingCenterId: center.id } } } },
      include: { items: { include: { product: true } }, contractor: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  }

  return NextResponse.json({ orders: [] });
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || session.role !== "CONTRACTOR") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contractor = await prisma.contractor.findUnique({ where: { userId: session.userId } });
  if (!contractor) return NextResponse.json({ error: "Contractor profile not found" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const items: { productId: string; quantity: number }[] = Array.isArray(body?.items) ? body.items : [];
  if (items.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  const products = await prisma.marketplaceProduct.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });

  for (const item of items) {
    const p = products.find((pr) => pr.id === item.productId);
    if (!p) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    if (item.quantity <= 0 || item.quantity > p.quantityAvailable) {
      return NextResponse.json({ error: `Requested quantity for ${p.name} exceeds availability` }, { status: 409 });
    }
  }

  const total = items.reduce((sum, item) => {
    const p = products.find((pr) => pr.id === item.productId)!;
    return sum + p.price * item.quantity;
  }, 0);

  const order = await prisma.order.create({
    data: {
      contractorId: contractor.id,
      status: "CONFIRMED",
      totalAmount: Math.round(total * 100) / 100,
      deliveryCity: contractor.city,
      items: {
        create: items.map((item) => {
          const p = products.find((pr) => pr.id === item.productId)!;
          return { productId: p.id, quantity: item.quantity, unitPrice: p.price };
        }),
      },
    },
    include: { items: { include: { product: true } } },
  });

  await Promise.all(
    items.map((item) => {
      const p = products.find((pr) => pr.id === item.productId)!;
      const remaining = p.quantityAvailable - item.quantity;
      return prisma.marketplaceProduct.update({
        where: { id: p.id },
        data: { quantityAvailable: remaining, status: remaining > 0 ? "ACTIVE" : "OUT_OF_STOCK" },
      });
    })
  );

  return NextResponse.json({ order });
}
