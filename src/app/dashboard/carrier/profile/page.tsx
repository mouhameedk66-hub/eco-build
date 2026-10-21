"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Mail, Phone, MapPin } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function CarrierProfilePage() {
  const { lang, T } = useLang();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">{T("profile")}</h1>
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"><Truck className="h-8 w-8" /></div>
          <div>
            <p className="text-lg font-bold">{lang === "ar" ? "شركة النقل الأخضر للخدمات اللوجستية" : "Green Transport Logistics Co."}</p>
            <Badge variant="info" className="mt-1">{lang === "ar" ? "ناقل" : "Carrier"}</Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4 p-6 text-sm">
          <Row icon={Mail} label={lang === "ar" ? "البريد الإلكتروني" : "Email"} value="carrier@ecobuild.demo" />
          <Row icon={Phone} label={lang === "ar" ? "الهاتف" : "Phone"} value="0559876543" />
          <Row icon={MapPin} label={lang === "ar" ? "المدينة" : "City"} value={lang === "ar" ? "الرياض" : "Riyadh"} />
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
