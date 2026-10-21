"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Leaf, ShieldCheck, ShieldAlert, Printer, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useLang } from "@/lib/i18n";
import { SHIPMENT_STAGES } from "@/types";
import { formatDate, formatNumber, cn } from "@/lib/utils";

export function ManifestView({ shipmentId }: { shipmentId: string }) {
  const { lang } = useLang();
  const [shipment, setShipment] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/shipments/${shipmentId}`).then((r) => r.json()).then((d) => setShipment(d.shipment));
  }, [shipmentId]);

  if (!shipment) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const m = shipment.manifest;
  const c = shipment.wasteRequest.classification;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-end gap-2 no-print">
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> {lang === "ar" ? "تحميل PDF / طباعة" : "Download PDF / Print"}
        </Button>
      </div>

      <Card className="print:shadow-none print:border-0">
        <CardContent className="p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold">{lang === "ar" ? "معمار البيئة" : "Eco-Build"}</p>
                <p className="text-xs text-muted-foreground">{lang === "ar" ? "البيان الرقمي" : "Digital Manifest"}</p>
              </div>
            </div>
            <div className="text-end">
              <p className="font-mono text-lg font-bold" dir="ltr">{m?.manifestNumber ?? "—"}</p>
              {m?.verified ? (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5" /> {lang === "ar" ? "موثّق" : "Verified"}
                </span>
              ) : (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  <ShieldAlert className="h-3.5 w-3.5" /> {lang === "ar" ? "قيد الإجراء" : "Pending Verification"}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-6 border-b border-border py-6 sm:grid-cols-2">
            <div className="space-y-3 text-sm">
              <Field label={lang === "ar" ? "رقم الطلب" : "Request ID"} value={shipment.wasteRequestId.slice(-10).toUpperCase()} mono />
              <Field label={lang === "ar" ? "المقاول" : "Contractor"} value={lang === "ar" ? shipment.wasteRequest.contractor.companyNameAr : shipment.wasteRequest.contractor.companyName} />
              <Field label={lang === "ar" ? "الناقل" : "Carrier"} value={lang === "ar" ? shipment.carrier.companyNameAr : shipment.carrier.companyName} />
              <Field label={lang === "ar" ? "السائق" : "Driver"} value={lang === "ar" ? shipment.driver.nameAr : shipment.driver.name} />
              <Field label={lang === "ar" ? "رقم الشاحنة" : "Truck Number"} value={shipment.truck.plateNumber} mono />
            </div>
            <div className="space-y-3 text-sm">
              <Field label={lang === "ar" ? "نوع المخلفات" : "Waste Type"} value={c ? (lang === "ar" ? c.wasteTypeAr : c.wasteType) : "—"} />
              <Field label={lang === "ar" ? "الكمية التقديرية" : "Estimated Quantity"} value={c ? `${formatNumber(c.estimatedWeight, lang)} ${lang === "ar" ? "طن" : "tons"}` : "—"} />
              <Field label={lang === "ar" ? "موقع الاستلام" : "Pickup Location"} value={`${shipment.wasteRequest.address}, ${shipment.wasteRequest.city}`} />
              <Field label={lang === "ar" ? "مركز إعادة التدوير" : "Recycling Facility"} value={lang === "ar" ? shipment.recyclingCenter.nameAr : shipment.recyclingCenter.name} />
              <Field label={lang === "ar" ? "حالة الشحنة" : "Shipment Status"} value={<StatusBadge status={shipment.status} lang={lang} />} />
            </div>
          </div>

          <div className="grid gap-6 border-b border-border py-6 sm:grid-cols-2">
            <Field label={lang === "ar" ? "وقت المغادرة" : "Departure Time"} value={shipment.departureTime ? formatDate(shipment.departureTime, lang) : "—"} />
            <Field label={lang === "ar" ? "وقت الوصول" : "Arrival Time"} value={shipment.arrivalTime ? formatDate(shipment.arrivalTime, lang) : "—"} />
          </div>

          <div className="grid gap-8 py-6 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold">{lang === "ar" ? "الجدول الزمني للشحنة" : "Shipment Timeline"}</p>
              <div className="space-y-2">
                {SHIPMENT_STAGES.map((stage) => {
                  const event = shipment.events.find((e: any) => e.stage === stage.en);
                  return (
                    <div key={stage.key} className="flex items-center gap-2 text-xs">
                      {event ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground/30" />}
                      <span className={cn(!event && "text-muted-foreground")}>{lang === "ar" ? stage.ar : stage.en}</span>
                      {event && <span className="ms-auto text-muted-foreground" dir="ltr">{new Date(event.timestamp).toLocaleString(lang === "ar" ? "ar-SA" : "en-US")}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-5">
              <QRCodeSVG value={m?.qrData ?? shipment.id} size={128} level="M" includeMargin />
              <p className="text-center text-[11px] text-muted-foreground">
                {lang === "ar" ? "امسح الرمز للتحقق من صحة البيان الرقمي" : "Scan to verify this Digital Manifest"}
              </p>
            </div>
          </div>

          {shipment.gpsPoints?.length > 0 && (
            <div className="border-t border-border pt-6">
              <p className="mb-3 text-sm font-semibold">{lang === "ar" ? "سجل تتبع GPS" : "GPS Tracking History"}</p>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/70 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-start">{lang === "ar" ? "الوقت" : "Time"}</th>
                      <th className="px-3 py-2 text-start">{lang === "ar" ? "الإحداثيات" : "Coordinates"}</th>
                      <th className="px-3 py-2 text-start">{lang === "ar" ? "الحالة" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {shipment.gpsPoints.map((p: any) => (
                      <tr key={p.id}>
                        <td className="px-3 py-1.5" dir="ltr">{new Date(p.timestamp).toLocaleString()}</td>
                        <td className="px-3 py-1.5" dir="ltr">{p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</td>
                        <td className="px-3 py-1.5">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-border pt-4 text-center text-[11px] text-muted-foreground">
            {lang === "ar"
              ? "هذا البيان الرقمي صادر آليًا عن منصة معمار البيئة (نسخة تجريبية) ويوثّق سلسلة نقل المخلفات من موقع الاستلام حتى مركز إعادة التدوير."
              : "This Digital Manifest is generated automatically by the Eco-Build demo platform and traces the waste chain from pickup to the recycling facility."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("font-medium", mono && "font-mono")} dir={mono ? "ltr" : undefined}>{value}</p>
    </div>
  );
}
