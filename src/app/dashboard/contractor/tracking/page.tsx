"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { MapPinned, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function TrackingListPage() {
  const { lang, T } = useLang();
  const [shipments, setShipments] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/shipments").then((r) => r.json()).then((d) => setShipments(d.shipments ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{T("liveTracking")}</h1>
        <p className="text-sm text-muted-foreground">{lang === "ar" ? "اختر شحنة لعرض موقعها المباشر" : "Select a shipment to view its live location"}</p>
      </div>

      {!shipments ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : shipments.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <MapPinned className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد شحنات لتتبعها بعد." : "No shipments to track yet."}</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {shipments.map((s) => (
            <Link key={s.id} href={`/dashboard/contractor/tracking/${s.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{lang === "ar" ? s.wasteRequest.projectNameAr : s.wasteRequest.projectName}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">#{s.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <StatusBadge status={s.status} lang={lang} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lang === "ar" ? s.carrier.companyNameAr : s.carrier.companyName} · {s.truck.plateNumber}
                  </p>
                  <Progress value={s.progressPct} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
