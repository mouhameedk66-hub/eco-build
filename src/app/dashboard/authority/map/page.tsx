"use client";

import { useEffect, useState } from "react";
import { RouteMap, type MapMarker } from "@/components/shared/route-map";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function AuthorityMapPage() {
  const { lang, T } = useLang();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/authority/stats").then((r) => r.json()).then(setStats);
    const interval = setInterval(() => fetch("/api/authority/stats").then((r) => r.json()).then(setStats), 10000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const markers: MapMarker[] = [
    ...stats.facilities.map((f: any) => ({ id: `f-${f.id}`, type: "facility" as const, lat: f.lat, lng: f.lng, label: lang === "ar" ? f.nameAr : f.name })),
    ...stats.activeShipmentMarkers.map((s: any) => ({
      id: `s-${s.id}`,
      type: s.flagged ? ("flagged" as const) : ("truck" as const),
      lat: s.lat,
      lng: s.lng,
      label: lang === "ar" ? s.carrierNameAr : s.carrierName,
    })),
    ...stats.activeShipmentMarkers.map((s: any) => ({ id: `p-${s.id}`, type: "pickup" as const, lat: s.pickupLat, lng: s.pickupLng })),
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">{T("liveMap")}</h1>
        <p className="text-sm text-muted-foreground">{lang === "ar" ? "مواقع الشاحنات والمقاولين ومراكز إعادة التدوير" : "Truck, contractor, and recycling facility locations"}</p>
      </div>
      <RouteMap markers={markers} height={600} />
      <Card>
        <CardContent className="flex flex-wrap gap-5 p-4 text-xs">
          <LegendItem color="#16a34a" label={lang === "ar" ? "موقع استلام" : "Pickup location"} />
          <LegendItem color="#7c3aed" label={lang === "ar" ? "مركز إعادة تدوير" : "Recycling facility"} />
          <LegendItem color="#1f7d4d" label={lang === "ar" ? "شاحنة" : "Truck"} />
          <LegendItem color="#ef4444" label={lang === "ar" ? "شحنة مبلّغ عنها" : "Flagged shipment"} />
        </CardContent>
      </Card>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
