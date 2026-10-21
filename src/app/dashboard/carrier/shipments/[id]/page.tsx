"use client";

import { useParams } from "next/navigation";
import { ShipmentTrackingView } from "@/components/shared/shipment-tracking-view";
import { useLang } from "@/lib/i18n";

export default function CarrierShipmentDetailPage() {
  const { T } = useLang();
  const params = useParams<{ id: string }>();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{T("myShipments")}</h1>
      <ShipmentTrackingView shipmentId={params.id} interactive manifestHref={`/dashboard/carrier/manifest/${params.id}`} />
    </div>
  );
}
