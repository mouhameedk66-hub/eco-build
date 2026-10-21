"use client";

import { useParams } from "next/navigation";
import { ManifestView } from "@/components/shared/manifest-view";

export default function ContractorManifestDetailPage() {
  const params = useParams<{ id: string }>();
  return <ManifestView shipmentId={params.id} />;
}
