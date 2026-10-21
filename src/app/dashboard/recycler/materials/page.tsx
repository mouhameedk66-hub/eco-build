"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Recycle, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatNumber, formatDate } from "@/lib/utils";

export default function RecycledMaterialsPage() {
  const { lang, T } = useLang();
  const [materials, setMaterials] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/recycler/materials").then((r) => r.json()).then((d) => setMaterials(d.materials ?? []));
  }, []);

  if (!materials) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const byType = materials.reduce<Record<string, number>>((acc, m) => {
    acc[m.materialType] = (acc[m.materialType] ?? 0) + m.quantityTons;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{T("recycledMaterials")} / {T("inventory")}</h1>
        <p className="text-sm text-muted-foreground">{lang === "ar" ? "المخلفات المستلمة والمصنّفة حسب النوع" : "Received waste grouped by type"}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Object.entries(byType).map(([type, qty]) => (
          <Card key={type}>
            <CardContent className="p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Recycle className="h-4.5 w-4.5" /></div>
              <p className="text-xl font-bold">{formatNumber(qty, lang)} {lang === "ar" ? "طن" : "t"}</p>
              <p className="text-xs text-muted-foreground">{type}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {materials.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <Recycle className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد مواد مستلمة بعد." : "No received materials yet."}</p>
        </CardContent></Card>
      ) : (
        <Table>
          <THead><TR><TH>{lang === "ar" ? "النوع" : "Type"}</TH><TH>{lang === "ar" ? "الكمية" : "Quantity"}</TH><TH>{lang === "ar" ? "تاريخ الاستلام" : "Received At"}</TH></TR></THead>
          <TBody>
            {materials.map((m) => (
              <TR key={m.id}>
                <TD className="font-medium">{m.materialType}</TD>
                <TD>{formatNumber(m.quantityTons, lang)} {lang === "ar" ? "طن" : "t"}</TD>
                <TD>{formatDate(m.receivedAt, lang)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
