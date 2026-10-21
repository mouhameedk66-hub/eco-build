"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { FileCheck2, Loader2, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function ManifestListPage() {
  const { lang, T } = useLang();
  const [shipments, setShipments] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/shipments").then((r) => r.json()).then((d) => setShipments(d.shipments ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{T("digitalManifest")}</h1>
        <p className="text-sm text-muted-foreground">{lang === "ar" ? "جميع البيانات الرقمية لشحناتك" : "All digital manifests for your shipments"}</p>
      </div>

      {!shipments ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : shipments.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <FileCheck2 className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد بيانات رقمية بعد." : "No manifests yet."}</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {shipments.map((s) => (
            <Link key={s.id} href={`/dashboard/contractor/manifest/${s.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm font-semibold" dir="ltr">{s.manifest?.manifestNumber ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{lang === "ar" ? s.wasteRequest.projectNameAr : s.wasteRequest.projectName}</p>
                    </div>
                    {s.manifest?.verified && (
                      <Badge variant="success"><ShieldCheck className="h-3 w-3" /> {lang === "ar" ? "موثّق" : "Verified"}</Badge>
                    )}
                  </div>
                  <StatusBadge status={s.status} lang={lang} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
