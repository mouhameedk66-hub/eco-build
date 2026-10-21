"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Truck, User, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

const truckStatusLabel: Record<string, { en: string; ar: string; variant: "success" | "warning" | "gray" }> = {
  AVAILABLE: { en: "Available", ar: "متاحة", variant: "success" },
  ON_TRIP: { en: "On Trip", ar: "في رحلة", variant: "warning" },
  MAINTENANCE: { en: "Maintenance", ar: "صيانة", variant: "gray" },
};

export default function FleetPage() {
  const { lang, T } = useLang();
  const [shipments, setShipments] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/shipments").then((r) => r.json()).then((d) => setShipments(d.shipments ?? []));
  }, []);

  if (!shipments) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const trucksMap = new Map<string, any>();
  const driversMap = new Map<string, any>();
  shipments.forEach((s) => {
    trucksMap.set(s.truck.id, s.truck);
    driversMap.set(s.driver.id, s.driver);
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold">{T("fleet")}</h1></div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Truck className="h-4 w-4" /> {lang === "ar" ? "الشاحنات" : "Trucks"}</h2>
        <Table>
          <THead><TR><TH>{lang === "ar" ? "رقم اللوحة" : "Plate"}</TH><TH>{lang === "ar" ? "النوع" : "Type"}</TH><TH>{lang === "ar" ? "السعة" : "Capacity"}</TH><TH>{lang === "ar" ? "الحالة" : "Status"}</TH></TR></THead>
          <TBody>
            {Array.from(trucksMap.values()).map((t) => {
              const meta = truckStatusLabel[t.status] ?? truckStatusLabel.AVAILABLE;
              return (
                <TR key={t.id}>
                  <TD className="font-mono">{t.plateNumber}</TD>
                  <TD>{t.type}</TD>
                  <TD>{t.capacityTons} {lang === "ar" ? "طن" : "t"}</TD>
                  <TD><Badge variant={meta.variant}>{lang === "ar" ? meta.ar : meta.en}</Badge></TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><User className="h-4 w-4" /> {lang === "ar" ? "السائقون" : "Drivers"}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from(driversMap.values()).map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4">
                <p className="font-medium">{lang === "ar" ? d.nameAr : d.name}</p>
                <p className="text-xs text-muted-foreground" dir="ltr">{d.licenseNo}</p>
                <p className="text-xs text-amber-500">★ {d.rating}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
