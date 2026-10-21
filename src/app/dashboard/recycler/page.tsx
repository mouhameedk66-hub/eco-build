"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Truck, Recycle, ShoppingBag, Wallet, Loader2, PackageCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatNumber, formatSar } from "@/lib/utils";

export default function RecyclerDashboard() {
  const { lang } = useLang();
  const [shipments, setShipments] = useState<any[] | null>(null);
  const [materials, setMaterials] = useState<any[] | null>(null);
  const [products, setProducts] = useState<any[] | null>(null);
  const [orders, setOrders] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/shipments").then((r) => r.json()).then((d) => setShipments(d.shipments ?? []));
    fetch("/api/recycler/materials").then((r) => r.json()).then((d) => setMaterials(d.materials ?? []));
    fetch("/api/marketplace/products?mine=true").then((r) => r.json()).then((d) => setProducts(d.products ?? []));
    fetch("/api/marketplace/orders").then((r) => r.json()).then((d) => setOrders(d.orders ?? []));
  }, []);

  if (!shipments || !materials || !products || !orders) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const incoming = shipments.filter((s) => s.status === "AT_RECYCLING_CENTER");
  const upcoming = shipments.filter((s) => ["ASSIGNED", "PICKUP_READY", "IN_TRANSIT"].includes(s.status));
  const receivedTons = materials.reduce((s, m) => s + m.quantityTons, 0);
  const salesTotal = orders.reduce((s, o) => s + o.totalAmount, 0);

  const kpis = [
    { icon: Truck, label: lang === "ar" ? "شحنات واردة" : "Incoming Shipments", value: incoming.length, color: "text-blue-600 bg-blue-50" },
    { icon: PackageCheck, label: lang === "ar" ? "تسليمات قادمة" : "Upcoming Deliveries", value: upcoming.length, color: "text-indigo-600 bg-indigo-50" },
    { icon: Recycle, label: lang === "ar" ? "مخلفات مستلمة (طن)" : "Received Waste (t)", value: formatNumber(receivedTons, lang), color: "text-emerald-600 bg-emerald-50" },
    { icon: ShoppingBag, label: lang === "ar" ? "منتجات السوق" : "Marketplace Listings", value: products.length, color: "text-purple-600 bg-purple-50" },
    { icon: Wallet, label: lang === "ar" ? "إجمالي المبيعات" : "Total Sales", value: formatSar(salesTotal, lang), color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{lang === "ar" ? "لوحة تحكم مركز إعادة التدوير" : "Recycling Facility Dashboard"}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${k.color}`}><k.icon className="h-4.5 w-4.5" /></div>
              <p className="text-2xl font-bold">{k.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {incoming.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{lang === "ar" ? "بانتظار تأكيد الاستلام" : "Awaiting Reception Confirmation"}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {incoming.map((s) => (
              <Link key={s.id} href={`/dashboard/recycler/shipments/${s.id}`}>
                <Card className="h-full border-accent/40 bg-accent/5 transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between gap-3 p-5">
                    <div>
                      <p className="font-semibold">{lang === "ar" ? s.wasteRequest.projectNameAr : s.wasteRequest.projectName}</p>
                      <p className="text-xs text-muted-foreground">{s.truck.plateNumber} · {lang === "ar" ? s.carrier.companyNameAr : s.carrier.companyName}</p>
                    </div>
                    <StatusBadge status={s.status} lang={lang} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
