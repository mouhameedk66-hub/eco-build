"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Wallet, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatSar, formatDate } from "@/lib/utils";

export default function RecyclerSalesPage() {
  const { lang, T } = useLang();
  const [orders, setOrders] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/marketplace/orders").then((r) => r.json()).then((d) => setOrders(d.orders ?? []));
  }, []);

  if (!orders) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const total = orders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{T("sales")}</h1>
        <p className="text-sm text-muted-foreground">{lang === "ar" ? `إجمالي المبيعات: ${formatSar(total, lang)}` : `Total sales: ${formatSar(total, lang)}`}</p>
      </div>

      {orders.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <Wallet className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد مبيعات بعد." : "No sales yet."}</p>
        </CardContent></Card>
      ) : (
        <Table>
          <THead><TR><TH>{lang === "ar" ? "رقم الطلب" : "Order"}</TH><TH>{lang === "ar" ? "المقاول" : "Contractor"}</TH><TH>{lang === "ar" ? "المنتجات" : "Items"}</TH><TH>{lang === "ar" ? "الإجمالي" : "Total"}</TH><TH>{lang === "ar" ? "التاريخ" : "Date"}</TH></TR></THead>
          <TBody>
            {orders.map((o) => (
              <TR key={o.id}>
                <TD className="font-mono text-xs">{o.id.slice(-8).toUpperCase()}</TD>
                <TD>{o.contractor ? (lang === "ar" ? o.contractor.companyNameAr : o.contractor.companyName) : "—"}</TD>
                <TD>{o.items.length}</TD>
                <TD className="font-semibold">{formatSar(o.totalAmount, lang)}</TD>
                <TD>{formatDate(o.createdAt, lang)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
