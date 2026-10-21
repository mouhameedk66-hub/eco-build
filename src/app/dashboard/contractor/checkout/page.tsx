"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatSar } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/toast";

export default function CheckoutPage() {
  const { lang, T } = useLang();
  const router = useRouter();
  const { toast } = useToast();
  const { items, clearCart } = useCart();
  const [products, setProducts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [city, setCity] = useState("الرياض");

  useEffect(() => {
    if (items.length === 0) { setLoading(false); return; }
    Promise.all(items.map((i) => fetch(`/api/marketplace/products/${i.productId}`).then((r) => r.json())))
      .then((results) => {
        const map: Record<string, any> = {};
        results.forEach((r) => { if (r.product) map[r.product.id] = r.product; });
        setProducts(map);
      })
      .finally(() => setLoading(false));
  }, [items]);

  const total = items.reduce((sum, i) => sum + (products[i.productId]?.price ?? 0) * i.quantity, 0);

  async function placeOrder() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/marketplace/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      clearCart();
      router.push(`/dashboard/contractor/orders/${data.order.id}`);
    } catch (e: any) {
      toast({ kind: "error", title: lang === "ar" ? "تعذر إتمام الطلب" : "Could not place order", description: e.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{lang === "ar" ? "السلة فارغة." : "Your cart is empty."}</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">{T("checkout")}</h1>

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-semibold">{lang === "ar" ? "ملخص الطلب" : "Order Summary"}</p>
          {items.map((i) => {
            const p = products[i.productId];
            if (!p) return null;
            return (
              <div key={i.productId} className="flex justify-between text-sm">
                <span>{lang === "ar" ? p.nameAr : p.name} × {i.quantity}</span>
                <span className="font-medium">{formatSar(p.price * i.quantity, lang)}</span>
              </div>
            );
          })}
          <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
            <span>{lang === "ar" ? "الإجمالي" : "Total"}</span>
            <span className="text-primary">{formatSar(total, lang)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <Label>{lang === "ar" ? "مدينة التسليم" : "Delivery City"}</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="space-y-3 p-5">
          <p className="flex items-center gap-2 text-sm font-semibold"><CreditCard className="h-4 w-4" /> {lang === "ar" ? "الدفع (محاكاة)" : "Payment (simulated)"}</p>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="4242 4242 4242 4242" dir="ltr" disabled />
            <Input placeholder="MM/YY" dir="ltr" disabled />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> {lang === "ar" ? "هذه بوابة دفع تجريبية — لن يتم خصم أي مبلغ فعلي." : "This is a simulated payment gateway — no real charge will occur."}
          </p>
        </CardContent>
      </Card>

      <Button size="lg" className="w-full" disabled={submitting} onClick={placeOrder}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : lang === "ar" ? `تأكيد الطلب — ${formatSar(total, lang)}` : `Place Order — ${formatSar(total, lang)}`}
      </Button>
    </div>
  );
}
