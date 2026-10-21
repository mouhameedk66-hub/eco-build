"use client";

import { useParams } from "next/navigation";
import { ShipmentTrackingView } from "@/components/shared/shipment-tracking-view";
import { useLang } from "@/lib/i18n";

export default function ContractorTrackingDetailPage() {
  const { T } = useLang();
  const params = useParams<{ shipmentId: string }>();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{T("liveTracking")}</h1>
      <ShipmentTrackingView shipmentId={params.shipmentId} />
    </div>
  );
}
