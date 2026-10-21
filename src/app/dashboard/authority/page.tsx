"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RouteMap, type MapMarker } from "@/components/shared/route-map";
import {
  ClipboardList, Truck, Weight, Recycle, PercentCircle, CheckCircle2, Activity, Flag, Loader2, ArrowUpRight, AlertTriangle,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatNumber, timeAgo } from "@/lib/utils";

export default function AuthorityOverviewPage() {
  const { lang } = useLang();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/authority/stats").then((r) => r.json()).then(setStats);
    const interval = setInterval(() => fetch("/api/authority/stats").then((r) => r.json()).then(setStats), 15000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const t = stats.totals;
  const kpis = [
    { icon: ClipboardList, label: lang === "ar" ? "إجمالي الطلبات" : "Total Requests", value: t.totalRequests, color: "text-blue-600 bg-blue-50" },
    { icon: Truck, label: lang === "ar" ? "إجمالي الشحنات" : "Total Shipments", value: t.totalShipments, color: "text-indigo-600 bg-indigo-50" },
    { icon: Weight, label: lang === "ar" ? "المخلفات المنقولة (طن)" : "Waste Transported (t)", value: formatNumber(t.totalTransportedTons, lang), color: "text-amber-600 bg-amber-50" },
    { icon: Recycle, label: lang === "ar" ? "المخلفات المعاد تدويرها (طن)" : "Recycled Waste (t)", value: formatNumber(t.totalRecycledTons, lang), color: "text-emerald-600 bg-emerald-50" },
    { icon: PercentCircle, label: lang === "ar" ? "معدل إعادة التدوير" : "Recycling Rate", value: `${t.recyclingRate}%`, color: "text-teal-600 bg-teal-50" },
    { icon: CheckCircle2, label: lang === "ar" ? "شحنات مكتملة" : "Completed Shipments", value: t.completedShipments, color: "text-green-600 bg-green-50" },
    { icon: Activity, label: lang === "ar" ? "شحنات نشطة" : "Active Shipments", value: t.activeShipments, color: "text-sky-600 bg-sky-50" },
    { icon: Flag, label: lang === "ar" ? "شحنات مبلّغ عنها" : "Flagged Shipments", value: t.flaggedShipments, color: "text-red-600 bg-red-50" },
  ];

  const markers: MapMarker[] = [
    ...stats.facilities.map((f: any) => ({ id: `f-${f.id}`, type: "facility" as const, lat: f.lat, lng: f.lng, label: lang === "ar" ? f.nameAr : f.name })),
    ...stats.activeShipmentMarkers.map((s: any) => ({ id: `s-${s.id}`, type: s.flagged ? ("flagged" as const) : ("truck" as const), lat: s.lat, lng: s.lng })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{lang === "ar" ? "لوحة موان التنظيمية" : "MWAN Regulatory Dashboard"}</h1>
        <p className="text-sm text-muted-foreground">{lang === "ar" ? "مؤشرات تشغيلية لحظية لمنظومة إدارة مخلفات البناء والهدم" : "Real-time operational indicators for the C&D waste ecosystem"}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">{lang === "ar" ? "الخريطة الحية" : "Live Map"}</h2>
            <Link href="/dashboard/authority/map" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              {lang === "ar" ? "عرض كامل" : "Full view"} <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <RouteMap markers={markers} height={380} />
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">{lang === "ar" ? "أحدث التنبيهات" : "Latest Alerts"}</h2>
          <Card className="h-[380px] overflow-y-auto">
            <CardContent className="space-y-3 p-4">
              {stats.alerts.length === 0 && <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد تنبيهات." : "No alerts."}</p>}
              {stats.alerts.map((a: any) => (
                <div key={a.id} className="flex items-start gap-2 border-b border-border pb-3 last:border-0">
                  <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${a.severity === "CRITICAL" ? "text-red-600" : a.severity === "WARNING" ? "text-amber-500" : "text-blue-500"}`} />
                  <div className="flex-1">
                    <p className="text-xs font-medium">{lang === "ar" ? a.messageAr : a.message}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{timeAgo(a.createdAt, lang)}</p>
                  </div>
                  {a.resolved && <Badge variant="success">{lang === "ar" ? "محلول" : "Resolved"}</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
