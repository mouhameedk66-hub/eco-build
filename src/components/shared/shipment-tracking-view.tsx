"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Truck as TruckIcon,
  User,
  Gauge,
  Ruler,
  Clock,
  FileCheck2,
  CheckCircle2,
  Circle,
  Loader2,
  PlayCircle,
  MapPinCheck,
  PackageCheck,
  RadioTower,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { RouteMap, type MapMarker } from "@/components/shared/route-map";
import { useLang } from "@/lib/i18n";
import { SHIPMENT_STAGES } from "@/types";
import { formatNumber, timeAgo, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export function ShipmentTrackingView({
  shipmentId,
  interactive = false,
  manifestHref,
}: {
  shipmentId: string;
  interactive?: boolean;
  manifestHref?: string;
}) {
  const { lang } = useLang();
  const { toast } = useToast();
  const [shipment, setShipment] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const pollingRef = useRef(false);

  async function refresh() {
    const res = await fetch(`/api/shipments/${shipmentId}`);
    const data = await res.json();
    if (res.ok) setShipment(data.shipment);
    return data.shipment;
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(async () => {
      if (pollingRef.current) return;
      pollingRef.current = true;
      try {
        const current = await refresh();
        if (current?.status === "IN_TRANSIT") {
          await fetch(`/api/shipments/${shipmentId}/tick`, { method: "POST" });
          await refresh();
        }
      } finally {
        pollingRef.current = false;
      }
    }, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId]);

  async function runAction(action: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await refresh();
      toast({ kind: "success", title: lang === "ar" ? "تم تنفيذ الإجراء" : "Action completed" });
    } catch (e: any) {
      toast({ kind: "error", title: lang === "ar" ? "تعذر تنفيذ الإجراء" : "Action failed", description: e.message });
    } finally {
      setBusy(false);
    }
  }

  if (!shipment) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const route = JSON.parse(shipment.routeJson);
  const remainingKm = Math.max(0, Math.round(shipment.distanceKm * (1 - shipment.progressPct / 100) * 10) / 10);

  const markers: MapMarker[] = [
    { id: "pickup", type: "pickup", lat: shipment.pickupLat, lng: shipment.pickupLng, label: lang === "ar" ? "موقع الاستلام" : "Pickup" },
    { id: "facility", type: "facility", lat: shipment.destLat, lng: shipment.destLng, label: lang === "ar" ? shipment.recyclingCenter.nameAr : shipment.recyclingCenter.name },
  ];
  if (["ASSIGNED", "PICKUP_READY", "IN_TRANSIT", "AT_RECYCLING_CENTER", "FLAGGED"].includes(shipment.status)) {
    markers.push({
      id: "truck",
      type: shipment.status === "FLAGGED" ? "flagged" : "truck",
      lat: shipment.currentLat,
      lng: shipment.currentLng,
      label: shipment.truck.plateNumber,
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RouteMap route={route} markers={markers} height={440} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{lang === "ar" ? "معلومات الشحنة" : "Shipment Info"}</p>
                <StatusBadge status={shipment.status} lang={lang} />
              </div>
              <InfoLine icon={TruckIcon} label={lang === "ar" ? "رقم الشاحنة" : "Truck"} value={shipment.truck.plateNumber} />
              <InfoLine icon={User} label={lang === "ar" ? "السائق" : "Driver"} value={lang === "ar" ? shipment.driver.nameAr : shipment.driver.name} />
              <InfoLine icon={Gauge} label={lang === "ar" ? "السرعة" : "Speed"} value={`${Math.round(shipment.speedKph)} ${lang === "ar" ? "كم/س" : "km/h"}`} />
              <InfoLine icon={Ruler} label={lang === "ar" ? "المسافة المتبقية" : "Remaining Distance"} value={`${formatNumber(remainingKm, lang)} ${lang === "ar" ? "كم" : "km"}`} />
              <InfoLine icon={Clock} label="ETA" value={`${shipment.etaMinutes} ${lang === "ar" ? "دقيقة" : "min"}`} />
              <InfoLine icon={RadioTower} label={lang === "ar" ? "آخر تحديث GPS" : "Last GPS Update"} value={shipment.lastGpsUpdate ? timeAgo(shipment.lastGpsUpdate, lang) : "—"} />
              <div>
                <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>{lang === "ar" ? "التقدم" : "Progress"}</span>
                  <span>{Math.round(shipment.progressPct)}%</span>
                </div>
                <Progress value={shipment.progressPct} />
              </div>
              <Link href={manifestHref ?? `/dashboard/contractor/manifest/${shipment.id}`} className="flex items-center gap-1.5 pt-1 text-xs font-medium text-primary hover:underline">
                <FileCheck2 className="h-3.5 w-3.5" /> {lang === "ar" ? "عرض البيان الرقمي" : "View Digital Manifest"}
              </Link>
            </CardContent>
          </Card>

          {interactive && (
            <Card>
              <CardContent className="space-y-2 p-4">
                <p className="text-sm font-semibold">{lang === "ar" ? "إجراءات الناقل" : "Carrier Actions"}</p>
                {shipment.status === "ASSIGNED" && (
                  <Button size="sm" className="w-full" disabled={busy} onClick={() => runAction("accept")}>
                    <PlayCircle className="h-4 w-4" /> {lang === "ar" ? "قبول الطلب" : "Accept Request"}
                  </Button>
                )}
                {shipment.status === "PICKUP_READY" && (
                  <Button size="sm" className="w-full" disabled={busy} onClick={() => runAction("start")}>
                    <PlayCircle className="h-4 w-4" /> {lang === "ar" ? "بدء الرحلة" : "Start Trip"}
                  </Button>
                )}
                {shipment.status === "IN_TRANSIT" && (
                  <>
                    <Button size="sm" variant="outline" className="w-full" disabled={busy} onClick={() => runAction("tick")}>
                      <RadioTower className="h-4 w-4" /> {lang === "ar" ? "محاكاة تحديث GPS" : "Simulate GPS Update"}
                    </Button>
                    <Button size="sm" className="w-full" disabled={busy} onClick={() => runAction("arrive")}>
                      <MapPinCheck className="h-4 w-4" /> {lang === "ar" ? "الوصول لمركز إعادة التدوير" : "Arrive at Facility"}
                    </Button>
                  </>
                )}
                {shipment.status === "AT_RECYCLING_CENTER" && (
                  <Button size="sm" className="w-full" disabled={busy} onClick={() => runAction("unload")}>
                    <PackageCheck className="h-4 w-4" /> {lang === "ar" ? "تأكيد تفريغ المخلفات" : "Confirm Unloading"}
                  </Button>
                )}
                {shipment.status === "COMPLETED" && (
                  <p className="flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" /> {lang === "ar" ? "اكتملت الشحنة" : "Shipment completed"}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <p className="mb-4 text-sm font-semibold">{lang === "ar" ? "الجدول الزمني للشحنة" : "Shipment Timeline"}</p>
          <div className="space-y-0">
            {SHIPMENT_STAGES.map((stage, i) => {
              const event = shipment.events.find((e: any) => e.stage === stage.en);
              const done = !!event;
              return (
                <div key={stage.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-muted-foreground/30" />
                    )}
                    {i < SHIPMENT_STAGES.length - 1 && (
                      <div className={cn("w-0.5 flex-1 my-0.5", done ? "bg-primary" : "bg-border")} style={{ minHeight: 20 }} />
                    )}
                  </div>
                  <div className="pb-5">
                    <p className={cn("text-sm font-medium", !done && "text-muted-foreground")}>{lang === "ar" ? stage.ar : stage.en}</p>
                    {event && <p className="text-xs text-muted-foreground">{timeAgo(event.timestamp, lang)}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {shipment.gpsPoints.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <p className="mb-3 text-sm font-semibold">{lang === "ar" ? "سجل تتبع GPS" : "GPS Tracking History"}</p>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted/70 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-start">{lang === "ar" ? "الوقت" : "Time"}</th>
                    <th className="px-3 py-2 text-start">{lang === "ar" ? "الإحداثيات" : "Coordinates"}</th>
                    <th className="px-3 py-2 text-start">{lang === "ar" ? "السرعة" : "Speed"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {shipment.gpsPoints.slice().reverse().map((p: any) => (
                    <tr key={p.id}>
                      <td className="px-3 py-1.5">{new Date(p.timestamp).toLocaleTimeString(lang === "ar" ? "ar-SA" : "en-US")}</td>
                      <td className="px-3 py-1.5" dir="ltr">{p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</td>
                      <td className="px-3 py-1.5">{Math.round(p.speed)} {lang === "ar" ? "كم/س" : "km/h"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoLine({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
