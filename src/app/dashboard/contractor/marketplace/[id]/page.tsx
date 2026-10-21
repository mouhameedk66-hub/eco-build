"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { MapPin, Recycle, Loader2, Minus, Plus, ArrowLeft } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatSar, formatNumber } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

export default function ProductDetailPage() {
  const { lang, dir } = useLang();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetch(`/api/marketplace/products/${params.id}`).then((r) => r.json()).then((d) => setProduct(d.product));
  }, [params.id]);

  if (!product) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/dashboard/contractor/marketplace" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className={dir === "rtl" ? "h-4 w-4 rotate-180" : "h-4 w-4"} /> {lang === "ar" ? "العودة للسوق" : "Back to marketplace"}
      </Link>

      <Card>
        <div className="grid sm:grid-cols-2">
          <PlaceholderImage seed={product.imageSeed} className="h-64 sm:h-full" />
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl font-bold">{lang === "ar" ? product.nameAr : product.name}</h1>
              <Badge variant={product.status === "ACTIVE" ? "success" : "danger"}>
                {product.status === "ACTIVE" ? (lang === "ar" ? "متاح" : "Available") : (lang === "ar" ? "نفدت الكمية" : "Out of stock")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{lang === "ar" ? product.descriptionAr : product.description}</p>

            <div className="space-y-2 rounded-lg border border-border p-3 text-sm">
              <p className="flex items-center gap-2"><Recycle className="h-4 w-4 text-primary" /> {lang === "ar" ? product.recyclingCenter.nameAr : product.recyclingCenter.name}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {product.location}</p>
            </div>

            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-primary">{formatSar(product.price, lang)}</p>
              <p className="text-sm text-muted-foreground">/{lang === "ar" ? "طن" : "ton"}</p>
            </div>
            <p className="text-xs text-muted-foreground">{formatNumber(product.quantityAvailable, lang)} {lang === "ar" ? "طن متاح" : "tons available"}</p>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-border">
                <button className="p-2" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button className="p-2" onClick={() => setQty((q) => Math.min(product.quantityAvailable, q + 1))}><Plus className="h-4 w-4" /></button>
              </div>
              <Button
                disabled={product.status !== "ACTIVE"}
                className="flex-1"
                onClick={() => { addItem(product.id, qty); toast({ kind: "success", title: lang === "ar" ? "أُضيف للسلة" : "Added to cart" }); }}
              >
                {lang === "ar" ? "إضافة للسلة" : "Add to Cart"}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
