"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ShipmentTrackingView } from "@/components/shared/shipment-tracking-view";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackageCheck, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";

export default function RecyclerShipmentDetailPage() {
  const { lang, T } = useLang();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  async function confirmReception() {
    setBusy(true);
    try {
      const res = await fetch(`/api/shipments/${params.id}/receive`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ kind: "success", title: lang === "ar" ? "تم تأكيد الاستلام وإغلاق البيان الرقمي" : "Reception confirmed and manifest closed" });
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      toast({ kind: "error", title: lang === "ar" ? "تعذر تأكيد الاستلام" : "Could not confirm reception", description: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{T("incomingShipments")}</h1>
      <ShipmentConfirmCard shipmentId={params.id} busy={busy} onConfirm={confirmReception} key={refreshKey} />
      <ShipmentTrackingView shipmentId={params.id} manifestHref={`/dashboard/recycler/manifest/${params.id}`} />
    </div>
  );
}

function ShipmentConfirmCard({ shipmentId, busy, onConfirm }: { shipmentId: string; busy: boolean; onConfirm: () => void }) {
  const { lang } = useLang();
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/shipments/${shipmentId}`).then((r) => r.json()).then((d) => setStatus(d.shipment?.status));
  }, [shipmentId]);

  if (status === null) return <div className="flex h-16 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  if (status !== "AT_RECYCLING_CENTER") return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-sm font-medium">{lang === "ar" ? "وصلت الشاحنة إلى المنشأة — أكّد استلام المخلفات لإغلاق البيان الرقمي." : "Truck has arrived — confirm waste reception to close the Digital Manifest."}</p>
        <Button disabled={busy} onClick={onConfirm}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><PackageCheck className="h-4 w-4" /> {lang === "ar" ? "تأكيد الاستلام" : "Confirm Reception"}</>}
        </Button>
      </CardContent>
    </Card>
  );
}
