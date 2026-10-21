"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, Input, Label } from "@/components/ui/input";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { ShoppingBag, Loader2, MapPin, ShoppingCart } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatSar, formatNumber } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/toast";

export default function MarketplacePage() {
  const { lang, T } = useLang();
  const { toast } = useToast();
  const { addItem, items } = useCart();
  const [products, setProducts] = useState<any[] | null>(null);
  const [materialType, setMaterialType] = useState("");
  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    fetch("/api/marketplace/products").then((r) => r.json()).then((d) => setProducts(d.products ?? []));
  }, []);

  const materialTypes = useMemo(() => Array.from(new Set((products ?? []).map((p) => p.materialType))), [products]);
  const locations = useMemo(() => Array.from(new Set((products ?? []).map((p) => p.location))), [products]);

  const filtered = (products ?? []).filter((p) => {
    if (materialType && p.materialType !== materialType) return false;
    if (location && p.location !== location) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;
    return true;
  });

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{T("marketplace")}</h1>
          <p className="text-sm text-muted-foreground">{lang === "ar" ? "تصفح المواد المعاد تدويرها من مراكز إعادة التدوير المرخّصة" : "Browse recycled materials from licensed recycling facilities"}</p>
        </div>
        <Link href="/dashboard/contractor/cart" className="relative flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
          <ShoppingCart className="h-4 w-4" /> {T("cart")}
          {cartCount > 0 && <span className="absolute -end-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{cartCount}</span>}
        </Link>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{lang === "ar" ? "نوع المادة" : "Material Type"}</Label>
            <Select value={materialType} onChange={(e) => setMaterialType(e.target.value)}>
              <option value="">{lang === "ar" ? "الكل" : "All"}</option>
              {materialTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{lang === "ar" ? "الموقع" : "Location"}</Label>
            <Select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">{lang === "ar" ? "الكل" : "All"}</option>
              {locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{lang === "ar" ? "أقصى سعر (ر.س/طن)" : "Max Price (SAR/ton)"}</Label>
            <Input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="100" dir="ltr" />
          </div>
        </CardContent>
      </Card>

      {!products ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد منتجات مطابقة." : "No matching products."}</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <Link href={`/dashboard/contractor/marketplace/${p.id}`}>
                <PlaceholderImage seed={p.imageSeed} className="h-36 w-full" />
              </Link>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/dashboard/contractor/marketplace/${p.id}`} className="font-semibold hover:underline">
                    {lang === "ar" ? p.nameAr : p.name}
                  </Link>
                  <Badge variant={p.status === "ACTIVE" ? "success" : "danger"}>
                    {p.status === "ACTIVE" ? (lang === "ar" ? "متاح" : "Available") : (lang === "ar" ? "نفدت الكمية" : "Out of stock")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{p.materialType} · {lang === "ar" ? p.recyclingCenter.nameAr : p.recyclingCenter.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {p.location}</p>
                <div className="flex items-center justify-between pt-1">
                  <p className="font-bold text-primary">{formatSar(p.price, lang)}<span className="text-xs font-normal text-muted-foreground">/{lang === "ar" ? "طن" : "ton"}</span></p>
                  <p className="text-xs text-muted-foreground">{formatNumber(p.quantityAvailable, lang)} {lang === "ar" ? "طن متاح" : "t available"}</p>
                </div>
                <button
                  disabled={p.status !== "ACTIVE"}
                  onClick={() => { addItem(p.id, 1); toast({ kind: "success", title: lang === "ar" ? "أُضيف للسلة" : "Added to cart" }); }}
                  className="mt-2 w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-700 disabled:opacity-40"
                >
                  {lang === "ar" ? "إضافة للسلة" : "Add to Cart"}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
