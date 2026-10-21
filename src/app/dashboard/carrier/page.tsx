"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, Truck, MapPinned, CheckCircle2, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatSar } from "@/lib/utils";

export default function CarrierDashboard() {
  const { lang } = useLang();
  const [shipments, setShipments] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/shipments").then((r) => r.json()).then((d) => setShipments(d.shipments ?? []));
  }, []);

  if (!shipments) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const available = shipments.filter((s) => s.status === "ASSIGNED");
  const active = shipments.filter((s) => ["PICKUP_READY", "IN_TRANSIT", "AT_RECYCLING_CENTER"].includes(s.status));
  const completed = shipments.filter((s) => s.status === "COMPLETED");

  const kpis = [
    { icon: ClipboardList, label: lang === "ar" ? "طلبات متاحة" : "Available Requests", value: available.length, color: "text-blue-600 bg-blue-50" },
    { icon: MapPinned, label: lang === "ar" ? "شحنات نشطة" : "Active Shipments", value: active.length, color: "text-indigo-600 bg-indigo-50" },
    { icon: CheckCircle2, label: lang === "ar" ? "شحنات مكتملة" : "Completed Shipments", value: completed.length, color: "text-green-600 bg-green-50" },
    { icon: Truck, label: lang === "ar" ? "إجمالي الإيرادات" : "Total Earnings", value: formatSar(completed.reduce((s, sh) => s + sh.estimatedCostSar, 0), lang), color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{lang === "ar" ? "لوحة تحكم الناقل" : "Carrier Dashboard"}</h1>
        <p className="text-sm text-muted-foreground">{lang === "ar" ? "إدارة طلبات النقل والأسطول" : "Manage transport requests and your fleet"}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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

      {active.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{lang === "ar" ? "الشحنات النشطة" : "Active Shipments"}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {active.map((s) => (
              <Link key={s.id} href={`/dashboard/carrier/shipments/${s.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{lang === "ar" ? s.wasteRequest.projectNameAr : s.wasteRequest.projectName}</p>
                        <p className="text-xs text-muted-foreground">{s.truck.plateNumber} · {lang === "ar" ? s.driver.nameAr : s.driver.name}</p>
                      </div>
                      <StatusBadge status={s.status} lang={lang} />
                    </div>
                    <Progress value={s.progressPct} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {available.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{lang === "ar" ? "طلبات بانتظار القبول" : "Requests Awaiting Acceptance"}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {available.map((s) => (
              <Link key={s.id} href={`/dashboard/carrier/shipments/${s.id}`}>
                <Card className="h-full border-accent/40 bg-accent/5 transition-shadow hover:shadow-md">
                  <CardContent className="space-y-2 p-5">
                    <p className="font-semibold">{lang === "ar" ? s.wasteRequest.projectNameAr : s.wasteRequest.projectName}</p>
                    <p className="text-xs text-muted-foreground">{s.wasteRequest.address}, {s.wasteRequest.city}</p>
                    <p className="text-xs font-medium text-primary">{formatSar(s.estimatedCostSar, lang)} · {s.distanceKm} {lang === "ar" ? "كم" : "km"}</p>
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
