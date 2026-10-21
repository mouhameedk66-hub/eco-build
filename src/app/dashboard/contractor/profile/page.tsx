"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function ContractorProfilePage() {
  const { lang, T } = useLang();
  const [requests, setRequests] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/waste-requests").then((r) => r.json()).then((d) => setRequests(d.requests ?? []));
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">{T("profile")}</h1>
      </div>
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <p className="text-lg font-bold">{lang === "ar" ? "شركة البناء الحديث للمقاولات" : "Modern Building Contracting Co."}</p>
            <Badge variant="info" className="mt-1">{lang === "ar" ? "مقاول" : "Contractor"}</Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4 p-6 text-sm">
          <Row icon={Mail} label={lang === "ar" ? "البريد الإلكتروني" : "Email"} value="contractor@ecobuild.demo" />
          <Row icon={Phone} label={lang === "ar" ? "الهاتف" : "Phone"} value="0551234567" />
          <Row icon={MapPin} label={lang === "ar" ? "المدينة" : "City"} value={lang === "ar" ? "الرياض" : "Riyadh"} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="mb-1 text-sm font-semibold">{lang === "ar" ? "إحصائيات الحساب" : "Account Stats"}</p>
          {!requests ? (
            <Loader2 className="mt-3 h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              {lang === "ar" ? `إجمالي الطلبات: ${requests.length}` : `Total requests: ${requests.length}`}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" /> {label}</span>
      <span className="font-medium" dir="ltr">{value}</span>
    </div>
  );
}
