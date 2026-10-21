"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ClipboardList, Truck, Weight, Recycle, CheckCircle2, ArrowUpRight, Plus, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatNumber } from "@/lib/utils";

interface RequestRow {
  id: string;
  projectName: string;
  projectNameAr: string;
  city: string;
  status: string;
  createdAt: string;
  classification: { wasteType: string; wasteTypeAr: string; estimatedWeight: number } | null;
  shipment: {
    id: string;
    status: string;
    progressPct: number;
    etaMinutes: number;
    carrier: { companyName: string; companyNameAr: string };
    truck: { plateNumber: string };
    recyclingCenter: { name: string; nameAr: string };
  } | null;
}

export default function ContractorDashboard() {
  const { lang, T } = useLang();
  const [requests, setRequests] = useState<RequestRow[] | null>(null);

  useEffect(() => {
    fetch("/api/waste-requests")
      .then((r) => r.json())
      .then((d) => setRequests(d.requests ?? []));
  }, []);

  if (!requests) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeRequests = requests.filter((r) => ["PENDING", "CLASSIFIED", "IN_PROGRESS"].includes(r.status)).length;
  const activeShipments = requests.filter((r) => r.shipment && r.shipment.status !== "COMPLETED");
  const completedRequests = requests.filter((r) => r.status === "COMPLETED").length;
  const totalWaste = requests.reduce((s, r) => s + (r.classification?.estimatedWeight ?? 0), 0);
  const recycledWaste = requests
    .filter((r) => r.status === "COMPLETED")
    .reduce((s, r) => s + (r.classification?.estimatedWeight ?? 0), 0);

  const kpis = [
    { icon: ClipboardList, label: lang === "ar" ? "الطلبات النشطة" : "Active Requests", value: activeRequests, color: "text-blue-600 bg-blue-50" },
    { icon: Truck, label: lang === "ar" ? "الشحنات النشطة" : "Active Shipments", value: activeShipments.length, color: "text-indigo-600 bg-indigo-50" },
    { icon: Weight, label: lang === "ar" ? "إجمالي المخلفات (طن)" : "Total Waste (t)", value: formatNumber(totalWaste, lang), color: "text-amber-600 bg-amber-50" },
    { icon: Recycle, label: lang === "ar" ? "المخلفات المعاد تدويرها (طن)" : "Recycled Waste (t)", value: formatNumber(recycledWaste, lang), color: "text-emerald-600 bg-emerald-50" },
    { icon: CheckCircle2, label: lang === "ar" ? "الطلبات المكتملة" : "Completed Requests", value: completedRequests, color: "text-green-600 bg-green-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{lang === "ar" ? "لوحة تحكم المقاول" : "Contractor Dashboard"}</h1>
        <p className="text-sm text-muted-foreground">
          {lang === "ar" ? "نظرة عامة على طلباتك وشحناتك الحالية" : "Overview of your waste requests and active shipments"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${k.color}`}>
                <k.icon className="h-4.5 w-4.5" />
              </div>
              <p className="text-2xl font-bold">{k.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeShipments.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{lang === "ar" ? "الشحنات النشطة" : "Active Shipments"}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {activeShipments.map((r) => {
              const s = r.shipment!;
              return (
                <Card key={r.id} className="overflow-hidden">
                  <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                    <div>
                      <CardTitle className="text-sm">{lang === "ar" ? r.projectNameAr : r.projectName}</CardTitle>
                      <p className="text-xs text-muted-foreground" dir="ltr">#{r.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <StatusBadge status={s.status} lang={lang} />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <InfoRow label={lang === "ar" ? "نوع المخلفات" : "Waste Type"} value={(lang === "ar" ? r.classification?.wasteTypeAr : r.classification?.wasteType) ?? "-"} />
                      <InfoRow label={lang === "ar" ? "الكمية" : "Quantity"} value={`${formatNumber(r.classification?.estimatedWeight ?? 0, lang)} ${lang === "ar" ? "طن" : "t"}`} />
                      <InfoRow label={lang === "ar" ? "الناقل" : "Carrier"} value={lang === "ar" ? s.carrier.companyNameAr : s.carrier.companyName} />
                      <InfoRow label={lang === "ar" ? "رقم الشاحنة" : "Truck"} value={s.truck.plateNumber} />
                      <InfoRow label={lang === "ar" ? "مركز إعادة التدوير" : "Facility"} value={lang === "ar" ? s.recyclingCenter.nameAr : s.recyclingCenter.name} />
                      <InfoRow label="ETA" value={`${s.etaMinutes} ${lang === "ar" ? "دقيقة" : "min"}`} />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                        <span>{lang === "ar" ? "التقدم" : "Progress"}</span>
                        <span>{Math.round(s.progressPct)}%</span>
                      </div>
                      <Progress value={s.progressPct} />
                    </div>
                    <div className="flex justify-end">
                      <Link href={`/dashboard/contractor/tracking/${s.id}`}>
                        <Button size="sm" variant="outline">
                          {lang === "ar" ? "تتبع الشحنة" : "Track shipment"} <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">{lang === "ar" ? "أحدث الطلبات" : "Recent Requests"}</h2>
          <Link href="/dashboard/contractor/new-request">
            <Button size="sm"><Plus className="h-4 w-4" /> {T("newRequest")}</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-10 text-center">
                <ClipboardList className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {lang === "ar" ? "لا توجد طلبات بعد. أنشئ طلبك الأول." : "No waste requests yet. Create your first one."}
                </p>
                <Link href="/dashboard/contractor/new-request">
                  <Button size="sm"><Plus className="h-4 w-4" /> {T("newRequest")}</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {requests.slice(0, 6).map((r) => (
                  <Link
                    key={r.id}
                    href={`/dashboard/contractor/requests/${r.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm hover:bg-muted/40"
                  >
                    <div>
                      <p className="font-medium">{lang === "ar" ? r.projectNameAr : r.projectName}</p>
                      <p className="text-xs text-muted-foreground">{r.city} · {new Date(r.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}</p>
                    </div>
                    <StatusBadge status={r.shipment?.status ?? r.status} lang={lang} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
