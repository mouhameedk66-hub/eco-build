"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { MapPin, Loader2, ArrowUpRight, FileCheck2, Route } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatNumber, formatDate } from "@/lib/utils";

export default function RequestDetailPage() {
  const { lang, dir } = useLang();
  const params = useParams<{ id: string }>();
  const [request, setRequest] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/waste-requests/${params.id}`).then((r) => r.json()).then((d) => setRequest(d.request));
  }, [params.id]);

  if (!request) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const c = request.classification;
  const s = request.shipment;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{lang === "ar" ? request.projectNameAr : request.projectName}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {request.address}, {request.city}
          </p>
        </div>
        <StatusBadge status={s?.status ?? request.status} lang={lang} />
      </div>

      {request.images?.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <p className="mb-3 text-sm font-semibold">{lang === "ar" ? "صور المخلفات" : "Waste Images"}</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {request.images.map((img: any) => (
                <div key={img.id} className="aspect-square overflow-hidden rounded-lg border border-border">
                  {img.url.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <PlaceholderImage seed={img.url} className="h-full w-full" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-semibold">{lang === "ar" ? "وصف المخلفات" : "Waste Description"}</p>
          <p className="text-sm text-muted-foreground">{request.description || "—"}</p>
        </CardContent>
      </Card>

      {c && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">{lang === "ar" ? "تصنيف الذكاء الاصطناعي" : "AI Classification"}</p>
              <Badge variant={c.recyclable ? "success" : "danger"}>
                {c.recyclable ? (lang === "ar" ? "قابل لإعادة التدوير" : "Recyclable") : (lang === "ar" ? "غير قابل" : "Not recyclable")}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">{lang === "ar" ? "النوع" : "Type"}</p>
                <p className="font-semibold">{lang === "ar" ? c.wasteTypeAr : c.wasteType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "ar" ? "الثقة" : "Confidence"}</p>
                <p className="font-semibold">{c.confidence}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "ar" ? "الوزن التقديري" : "Est. Weight"}</p>
                <p className="font-semibold">{formatNumber(c.estimatedWeight, lang)} {lang === "ar" ? "طن" : "t"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {s ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm font-semibold">{lang === "ar" ? "الشحنة" : "Shipment"}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? s.carrier.companyNameAr : s.carrier.companyName} · {s.truck.plateNumber}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/contractor/tracking/${s.id}`}>
                <Button size="sm" variant="outline"><Route className="h-4 w-4" /> {lang === "ar" ? "تتبع" : "Track"}</Button>
              </Link>
              <Link href={`/dashboard/contractor/manifest/${s.id}`}>
                <Button size="sm"><FileCheck2 className="h-4 w-4" /> {lang === "ar" ? "البيان الرقمي" : "Manifest"}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : c ? (
        <Card className="border-accent/40 bg-accent/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <p className="text-sm">{lang === "ar" ? "تم التصنيف — أكمل خطة النقل لبدء الشحن." : "Classified — complete the transportation plan to start shipping."}</p>
            <Link href={`/dashboard/contractor/new-request?continueId=${request.id}`}>
              <Button size="sm">{lang === "ar" ? "متابعة الخطة اللوجستية" : "Continue Logistics Plan"} <ArrowUpRight className="h-4 w-4" /></Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
