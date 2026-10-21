"use client";

import { useEffect, useState } from "react";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatSar } from "@/lib/utils";

export default function AuthorityShipmentsPage() {
  const { lang } = useLang();
  const [shipments, setShipments] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/shipments").then((r) => r.json()).then((d) => setShipments(d.shipments ?? []));
  }, []);

  if (!shipments) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">{lang === "ar" ? "جميع الشحنات" : "All Shipments"}</h1>
      <Table>
        <THead>
          <TR>
            <TH>{lang === "ar" ? "المشروع" : "Project"}</TH>
            <TH>{lang === "ar" ? "الناقل" : "Carrier"}</TH>
            <TH>{lang === "ar" ? "المنشأة" : "Facility"}</TH>
            <TH>{lang === "ar" ? "التكلفة" : "Cost"}</TH>
            <TH>{lang === "ar" ? "الحالة" : "Status"}</TH>
          </TR>
        </THead>
        <TBody>
          {shipments.map((s) => (
            <TR key={s.id}>
              <TD className="font-medium">{lang === "ar" ? s.wasteRequest.projectNameAr : s.wasteRequest.projectName}</TD>
              <TD>{lang === "ar" ? s.carrier.companyNameAr : s.carrier.companyName}</TD>
              <TD>{lang === "ar" ? s.recyclingCenter.nameAr : s.recyclingCenter.name}</TD>
              <TD>{formatSar(s.estimatedCostSar, lang)}</TD>
              <TD><StatusBadge status={s.status} lang={lang} /></TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
