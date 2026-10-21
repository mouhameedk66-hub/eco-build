"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Truck, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function RecyclerShipmentsPage() {
  const { lang, T } = useLang();
  const [shipments, setShipments] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/shipments").then((r) => r.json()).then((d) => setShipments(d.shipments ?? []));
  }, []);

  if (!shipments) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const incoming = shipments.filter((s) => s.status === "AT_RECYCLING_CENTER");
  const upcoming = shipments.filter((s) => ["ASSIGNED", "PICKUP_READY", "IN_TRANSIT"].includes(s.status));
  const completed = shipments.filter((s) => s.status === "COMPLETED");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">{T("incomingShipments")}</h1>

      <Tabs defaultValue="incoming">
        <TabsList>
          <TabsTrigger value="incoming">{lang === "ar" ? "واردة" : "Incoming"} ({incoming.length})</TabsTrigger>
          <TabsTrigger value="upcoming">{T("upcomingDeliveries")} ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">{lang === "ar" ? "مكتملة" : "Completed"} ({completed.length})</TabsTrigger>
        </TabsList>

        {[{ key: "incoming", data: incoming }, { key: "upcoming", data: upcoming }, { key: "completed", data: completed }].map((group) => (
          <TabsContent key={group.key} value={group.key} className="mt-4">
            {group.data.length === 0 ? (
              <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <Truck className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد شحنات." : "No shipments."}</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {group.data.map((s: any) => (
                  <Link key={s.id} href={`/dashboard/recycler/shipments/${s.id}`}>
                    <Card className="h-full transition-shadow hover:shadow-md">
                      <CardContent className="space-y-2 p-5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold">{lang === "ar" ? s.wasteRequest.projectNameAr : s.wasteRequest.projectName}</p>
                          <StatusBadge status={s.status} lang={lang} />
                        </div>
                        <p className="text-xs text-muted-foreground">{s.truck.plateNumber} · {lang === "ar" ? s.carrier.companyNameAr : s.carrier.companyName}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
