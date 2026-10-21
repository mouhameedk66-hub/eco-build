"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { Plus, ShoppingBag, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { formatSar, formatNumber } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { WASTE_TYPES } from "@/types";

export default function RecyclerMarketplaceListingsPage() {
  const { lang, T } = useLang();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[] | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "", nameAr: "", materialType: "Concrete", description: "", descriptionAr: "",
    price: "", quantityAvailable: "", location: "",
  });

  function load() {
    fetch("/api/marketplace/products?mine=true").then((r) => r.json()).then((d) => setProducts(d.products ?? []));
  }
  useEffect(load, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/marketplace/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          quantityAvailable: Number(form.quantityAvailable),
          imageSeed: form.materialType.toLowerCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ kind: "success", title: lang === "ar" ? "تمت إضافة المنتج" : "Product added" });
      setOpen(false);
      setForm({ name: "", nameAr: "", materialType: "Concrete", description: "", descriptionAr: "", price: "", quantityAvailable: "", location: "" });
      load();
    } catch (e: any) {
      toast({ kind: "error", title: lang === "ar" ? "تعذر إضافة المنتج" : "Could not add product", description: e.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{T("listings")}</h1>
          <p className="text-sm text-muted-foreground">{lang === "ar" ? "إدارة منتجاتك في سوق المواد المعاد تدويرها" : "Manage your listings in the recycled materials marketplace"}</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> {lang === "ar" ? "إضافة منتج" : "Add Product"}</Button>
      </div>

      {!products ? (
        <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : products.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد منتجات بعد." : "No products yet."}</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <PlaceholderImage seed={p.imageSeed} className="h-32 w-full" />
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{lang === "ar" ? p.nameAr : p.name}</p>
                  <Badge variant={p.status === "ACTIVE" ? "success" : "danger"}>
                    {p.status === "ACTIVE" ? (lang === "ar" ? "متاح" : "Active") : (lang === "ar" ? "نفدت الكمية" : "Out of stock")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{p.materialType}</p>
                <div className="flex items-center justify-between pt-1 text-sm">
                  <p className="font-bold text-primary">{formatSar(p.price, lang)}</p>
                  <p className="text-muted-foreground">{formatNumber(p.quantityAvailable, lang)} {lang === "ar" ? "طن" : "t"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title={lang === "ar" ? "إضافة منتج جديد" : "Add New Product"}>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{lang === "ar" ? "الاسم (عربي)" : "Name (Arabic)"}</Label>
              <Input required value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{lang === "ar" ? "الاسم (إنجليزي)" : "Name (English)"}</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} dir="ltr" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{lang === "ar" ? "نوع المادة" : "Material Type"}</Label>
            <Select value={form.materialType} onChange={(e) => setForm({ ...form, materialType: e.target.value })}>
              {WASTE_TYPES.map((t) => <option key={t.en} value={t.en}>{lang === "ar" ? t.ar : t.en}</option>)}
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{lang === "ar" ? "الوصف" : "Description"}</Label>
            <Textarea value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{lang === "ar" ? "السعر" : "Price"}</Label>
              <Input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{lang === "ar" ? "الكمية" : "Quantity"}</Label>
              <Input required type="number" value={form.quantityAvailable} onChange={(e) => setForm({ ...form, quantityAvailable: e.target.value })} dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{lang === "ar" ? "الموقع" : "Location"}</Label>
              <Input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (lang === "ar" ? "إضافة المنتج" : "Add Product")}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
