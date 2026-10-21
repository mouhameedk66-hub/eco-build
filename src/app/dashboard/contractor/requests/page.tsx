"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Loader2, Plus } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatNumber } from "@/lib/utils";

export default function MyRequestsPage() {
  const { lang, T } = useLang();
  const [requests, setRequests] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/waste-requests").then((r) => r.json()).then((d) => setRequests(d.requests ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{T("myRequests")}</h1>
          <p className="text-sm text-muted-foreground">{lang === "ar" ? "جميع طلبات إزالة المخلفات الخاصة بك" : "All your waste removal requests"}</p>
        </div>
        <Link href="/dashboard/contractor/new-request">
          <Button size="sm"><Plus className="h-4 w-4" /> {T("newRequest")}</Button>
        </Link>
      </div>

      {!requests ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : requests.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد طلبات بعد." : "No requests yet."}</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((r) => (
            <Link key={r.id} href={`/dashboard/contractor/requests/${r.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{lang === "ar" ? r.projectNameAr : r.projectName}</p>
                    <StatusBadge status={r.shipment?.status ?? r.status} lang={lang} />
                  </div>
                  <p className="text-xs text-muted-foreground">{r.city} · {new Date(r.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}</p>
                  {r.classification && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">
                        {lang === "ar" ? r.classification.wasteTypeAr : r.classification.wasteType}
                      </span>
                      <span className="text-muted-foreground">{formatNumber(r.classification.estimatedWeight, lang)} {lang === "ar" ? "طن" : "t"}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{r.images?.length ?? 0} {lang === "ar" ? "صور مرفوعة" : "images uploaded"}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
