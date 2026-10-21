"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertTriangle, BellRing, CheckCircle2, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { timeAgo } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const typeLabels: Record<string, { en: string; ar: string }> = {
  ROUTE_DEVIATION: { en: "Route Deviation", ar: "انحراف عن المسار" },
  DELAYED_ARRIVAL: { en: "Delayed Arrival", ar: "تأخر في الوصول" },
  GPS_SIGNAL_LOST: { en: "GPS Signal Lost", ar: "انقطاع إشارة GPS" },
  SHIPMENT_COMPLETED: { en: "Shipment Completed", ar: "اكتمال الشحنة" },
  ILLEGAL_DUMPING_RISK: { en: "Illegal Dumping Risk", ar: "خطر تفريغ غير مرخّص" },
};

export default function AuthorityAlertsPage() {
  const { lang, T } = useLang();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<any[] | null>(null);

  function load() {
    fetch("/api/alerts").then((r) => r.json()).then((d) => setAlerts(d.alerts ?? []));
  }
  useEffect(load, []);

  async function resolve(id: string) {
    await fetch(`/api/alerts/${id}/resolve`, { method: "POST" });
    toast({ kind: "success", title: lang === "ar" ? "تم حل التنبيه" : "Alert resolved" });
    load();
  }

  if (!alerts) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const active = alerts.filter((a) => !a.resolved);
  const resolved = alerts.filter((a) => a.resolved);

  const renderList = (list: any[]) =>
    list.length === 0 ? (
      <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
        <BellRing className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد تنبيهات." : "No alerts."}</p>
      </CardContent></Card>
    ) : (
      <div className="space-y-3">
        {list.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${a.severity === "CRITICAL" ? "text-red-600" : a.severity === "WARNING" ? "text-amber-500" : "text-blue-500"}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={a.severity === "CRITICAL" ? "danger" : a.severity === "WARNING" ? "warning" : "info"}>
                      {lang === "ar" ? typeLabels[a.type]?.ar : typeLabels[a.type]?.en}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">{timeAgo(a.createdAt, lang)}</span>
                  </div>
                  <p className="mt-1.5 text-sm">{lang === "ar" ? a.messageAr : a.message}</p>
                  {a.shipment && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {lang === "ar" ? a.shipment.wasteRequest?.projectNameAr : a.shipment.wasteRequest?.projectName} · {lang === "ar" ? a.shipment.carrier?.companyNameAr : a.shipment.carrier?.companyName}
                    </p>
                  )}
                </div>
              </div>
              {!a.resolved && (
                <Button size="sm" variant="outline" onClick={() => resolve(a.id)}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> {lang === "ar" ? "وضع كمحلول" : "Mark Resolved"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">{T("alerts")}</h1>
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">{lang === "ar" ? "نشطة" : "Active"} ({active.length})</TabsTrigger>
          <TabsTrigger value="resolved">{lang === "ar" ? "محلولة" : "Resolved"} ({resolved.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">{renderList(active)}</TabsContent>
        <TabsContent value="resolved" className="mt-4">{renderList(resolved)}</TabsContent>
      </Tabs>
    </div>
  );
}
