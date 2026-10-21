"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { ShoppingCart, Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatSar } from "@/lib/utils";
import { useCart } from "@/lib/cart";

export default function CartPage() {
  const { lang, T } = useLang();
  const router = useRouter();
  const { items, updateQuantity, removeItem } = useCart();
  const [products, setProducts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      setLoading(false);
      return;
    }
    Promise.all(items.map((i) => fetch(`/api/marketplace/products/${i.productId}`).then((r) => r.json())))
      .then((results) => {
        const map: Record<string, any> = {};
        results.forEach((r) => { if (r.product) map[r.product.id] = r.product; });
        setProducts(map);
      })
      .finally(() => setLoading(false));
  }, [items]);

  const total = items.reduce((sum, i) => sum + (products[i.productId]?.price ?? 0) * i.quantity, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">{T("cart")}</h1>
        <p className="text-sm text-muted-foreground">{lang === "ar" ? "راجع طلبك قبل إتمام الشراء" : "Review your order before checkout"}</p>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{lang === "ar" ? "السلة فارغة." : "Your cart is empty."}</p>
          <Link href="/dashboard/contractor/marketplace"><Button size="sm">{lang === "ar" ? "تصفح السوق" : "Browse marketplace"}</Button></Link>
        </CardContent></Card>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => {
              const p = products[item.productId];
              if (!p) return null;
              return (
                <Card key={item.productId}>
                  <CardContent className="flex items-center gap-4 p-3">
                    <PlaceholderImage seed={p.imageSeed} className="h-16 w-16 shrink-0 rounded-lg" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{lang === "ar" ? p.nameAr : p.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSar(p.price, lang)} / {lang === "ar" ? "طن" : "ton"}</p>
                    </div>
                    <div className="flex items-center rounded-lg border border-border">
                      <button className="p-1.5" onClick={() => updateQuantity(item.productId, item.quantity - 1)}><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button className="p-1.5" onClick={() => updateQuantity(item.productId, item.quantity + 1)}><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <p className="w-24 text-end text-sm font-semibold">{formatSar(p.price * item.quantity, lang)}</p>
                    <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{lang === "ar" ? "الإجمالي" : "Total"}</p>
                <p className="text-xl font-bold text-primary">{formatSar(total, lang)}</p>
              </div>
              <Button size="lg" onClick={() => router.push("/dashboard/contractor/checkout")}>{T("checkout")}</Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
