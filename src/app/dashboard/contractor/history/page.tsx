"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { History, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatNumber, formatSar } from "@/lib/utils";

export default function ShipmentHistoryPage() {
  const { lang, T } = useLang();
  const [shipments, setShipments] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/shipments?status=COMPLETED").then((r) => r.json()).then((d) => setShipments(d.shipments ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{T("shipmentHistory")}</h1>
        <p className="text-sm text-muted-foreground">{lang === "ar" ? "الشحنات المكتملة" : "Completed shipments"}</p>
      </div>

      {!shipments ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : shipments.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <History className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد شحنات مكتملة بعد." : "No completed shipments yet."}</p>
        </CardContent></Card>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>{lang === "ar" ? "المشروع" : "Project"}</TH>
              <TH>{lang === "ar" ? "نوع المخلفات" : "Waste Type"}</TH>
              <TH>{lang === "ar" ? "الكمية" : "Quantity"}</TH>
              <TH>{lang === "ar" ? "الناقل" : "Carrier"}</TH>
              <TH>{lang === "ar" ? "التكلفة" : "Cost"}</TH>
              <TH>{lang === "ar" ? "الحالة" : "Status"}</TH>
              <TH></TH>
            </TR>
          </THead>
          <TBody>
            {shipments.map((s) => (
              <TR key={s.id}>
                <TD className="font-medium">{lang === "ar" ? s.wasteRequest.projectNameAr : s.wasteRequest.projectName}</TD>
                <TD>{s.wasteRequest.classification ? (lang === "ar" ? s.wasteRequest.classification.wasteTypeAr : s.wasteRequest.classification.wasteType) : "—"}</TD>
                <TD>{s.wasteRequest.classification ? `${formatNumber(s.wasteRequest.classification.estimatedWeight, lang)} ${lang === "ar" ? "طن" : "t"}` : "—"}</TD>
                <TD>{lang === "ar" ? s.carrier.companyNameAr : s.carrier.companyName}</TD>
                <TD>{formatSar(s.estimatedCostSar, lang)}</TD>
                <TD><StatusBadge status={s.status} lang={lang} /></TD>
                <TD>
                  <Link href={`/dashboard/contractor/manifest/${s.id}`} className="text-xs font-medium text-primary hover:underline">
                    {lang === "ar" ? "البيان الرقمي" : "Manifest"}
                  </Link>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
