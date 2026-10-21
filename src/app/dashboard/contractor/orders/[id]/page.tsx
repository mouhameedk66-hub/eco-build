"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatSar, formatDate } from "@/lib/utils";

export default function OrderConfirmationPage() {
  const { lang } = useLang();
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetch("/api/marketplace/orders")
      .then((r) => r.json())
      .then((d) => setOrder((d.orders ?? []).find((o: any) => o.id === params.id)));
  }, [params.id]);

  if (!order) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="mx-auto max-w-xl space-y-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="text-xl font-bold">{lang === "ar" ? "تم تأكيد الطلب بنجاح" : "Order Confirmed"}</h1>
        <p className="text-sm text-muted-foreground" dir="ltr">#{order.id.slice(-10).toUpperCase()}</p>
      </div>

      <Card className="text-start">
        <CardContent className="space-y-3 p-5">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{lang === "ar" ? item.product.nameAr : item.product.name} × {item.quantity}</span>
              <span className="font-medium">{formatSar(item.unitPrice * item.quantity, lang)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
            <span>{lang === "ar" ? "الإجمالي" : "Total"}</span>
            <span className="text-primary">{formatSar(order.totalAmount, lang)}</span>
          </div>
          <p className="text-xs text-muted-foreground">{formatDate(order.createdAt, lang)} · {order.deliveryCity}</p>
        </CardContent>
      </Card>

      <Link href="/dashboard/contractor/marketplace">
        <Button variant="outline"><ShoppingBag className="h-4 w-4" /> {lang === "ar" ? "متابعة التسوق" : "Continue shopping"}</Button>
      </Link>
    </div>
  );
}
