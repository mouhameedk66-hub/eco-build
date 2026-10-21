"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, Loader2, MapPin } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function AuthorityFacilitiesPage() {
  const { lang, T } = useLang();
  const [facilities, setFacilities] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/authority/stats").then((r) => r.json()).then((d) => setFacilities(d.facilities ?? []));
  }, []);

  if (!facilities) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">{T("facilities")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((f) => (
          <Card key={f.id}>
            <CardContent className="space-y-2 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600"><Factory className="h-5 w-5" /></div>
              <p className="font-semibold">{lang === "ar" ? f.nameAr : f.name}</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {f.city}</p>
              <Badge variant="success">{lang === "ar" ? "مرخّصة" : "Licensed"}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
