"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Loader2, MapPin, Weight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatSar, formatNumber } from "@/lib/utils";

export default function AvailableRequestsPage() {
  const { lang, T } = useLang();
  const [shipments, setShipments] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/shipments?status=ASSIGNED").then((r) => r.json()).then((d) => setShipments(d.shipments ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{T("availableRequests")}</h1>
        <p className="text-sm text-muted-foreground">{lang === "ar" ? "طلبات نقل موجهة إليك بانتظار القبول" : "Transport requests routed to you, awaiting acceptance"}</p>
      </div>

      {!shipments ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : shipments.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد طلبات متاحة حاليًا." : "No available requests right now."}</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {shipments.map((s) => (
            <Card key={s.id}>
              <CardContent className="space-y-3 p-5">
                <p className="font-semibold">{lang === "ar" ? s.wasteRequest.projectNameAr : s.wasteRequest.projectName}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {s.wasteRequest.address}, {s.wasteRequest.city}</p>
                {s.wasteRequest.classification && (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Weight className="h-3.5 w-3.5" /> {lang === "ar" ? s.wasteRequest.classification.wasteTypeAr : s.wasteRequest.classification.wasteType} · {formatNumber(s.wasteRequest.classification.estimatedWeight, lang)} {lang === "ar" ? "طن" : "t"}
                  </p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <p className="text-sm font-bold text-primary">{formatSar(s.estimatedCostSar, lang)}</p>
                  <Link href={`/dashboard/carrier/shipments/${s.id}`}>
                    <Button size="sm">{lang === "ar" ? "عرض والقبول" : "View & Accept"}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
