"use client";

import Link from "next/link";
import {
  Leaf,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  TrendingDown,
  Building2,
  Network,
  Camera,
  Cpu,
  Route,
  Truck,
  Recycle,
  ShoppingBag,
  ShieldCheck,
  Landmark,
  Wallet,
  CircleCheck,
  QrCode,
  MapPinned,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const { lang, dir, toggle } = useLang();
  const [navOpen, setNavOpen] = useState(false);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const nav = [
    { href: "#problem", en: "Problem", ar: "التحدي" },
    { href: "#solution", en: "Solution", ar: "الحل" },
    { href: "#how-it-works", en: "How It Works", ar: "آلية العمل" },
    { href: "#impact", en: "Impact", ar: "الأثر" },
  ];

  return (
    <div className="flex-1">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/30">
              <Leaf className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">{lang === "ar" ? "معمار البيئة" : "Eco-Build"}</p>
              <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "Eco-Build" : "معمار البيئة"}</p>
            </div>
          </Link>

          <nav className="ms-6 hidden items-center gap-6 text-sm font-medium text-foreground/70 md:flex">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="hover:text-foreground transition-colors">
                {lang === "ar" ? n.ar : n.en}
              </a>
            ))}
          </nav>

          <div className="ms-auto flex items-center gap-2">
            <button
              onClick={toggle}
              className="hidden rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted sm:block"
            >
              {lang === "ar" ? "English" : "العربية"}
            </button>
            <Link
              href="/login"
              className="hidden rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted sm:block"
            >
              {lang === "ar" ? "تسجيل الدخول" : "Login"}
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary-700"
            >
              {lang === "ar" ? "ابدأ الآن" : "Get Started"}
            </Link>
            <button className="md:hidden" onClick={() => setNavOpen((v) => !v)}>
              {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {navOpen && (
          <div className="border-t border-border bg-card px-4 py-3 md:hidden">
            {nav.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setNavOpen(false)} className="block py-2 text-sm font-medium">
                {lang === "ar" ? n.ar : n.en}
              </a>
            ))}
            <button onClick={toggle} className="mt-2 w-full rounded-lg border border-border py-2 text-xs font-medium">
              {lang === "ar" ? "English" : "العربية"}
            </button>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-grid">
        <div className="absolute -top-40 -end-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-40 -start-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
            <Leaf className="h-3.5 w-3.5" />
            {lang === "ar" ? "منصة رقمية ذكية لإدارة مخلفات البناء والهدم" : "Smart digital platform for Construction & Demolition Waste"}
          </div>
          <h1 className="mx-auto max-w-4xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {lang === "ar" ? (
              <>رقمنة إدارة <span className="text-primary">مخلفات البناء والهدم</span> من أجل مستقبل مستدام</>
            ) : (
              <>Digitizing Construction & Demolition Waste Management for a <span className="text-primary">Sustainable Future</span></>
            )}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {lang === "ar"
              ? "معمار البيئة يربط المقاولين وشركات النقل ومراكز إعادة التدوير والجهات التنظيمية عبر منصة لوجستية ذكية واحدة — من طلب الإزالة إلى البيان الرقمي الموثّق."
              : "Eco-Build connects contractors, carriers, recycling facilities and regulators through one smart logistics marketplace — from waste removal request to a verified Digital Manifest."}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
            >
              {lang === "ar" ? "ابدأ الآن" : "Get Started"} <Arrow className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-muted"
            >
              {lang === "ar" ? "استكشف المنصة" : "Explore Platform"}
            </a>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { v: "40–45%", en: "of Saudi waste is C&D", ar: "من نفايات السعودية مخلفات بناء" },
              { v: "4", en: "connected user roles", ar: "أدوار مستخدمين متصلة" },
              { v: "AI", en: "waste classification", ar: "تصنيف ذكي للمخلفات" },
              { v: "GPS", en: "live shipment tracking", ar: "تتبع مباشر للشحنات" },
            ].map((s) => (
              <div key={s.en} className="rounded-xl border border-border bg-card/70 p-4 shadow-sm backdrop-blur">
                <p className="text-xl font-extrabold text-primary sm:text-2xl">{s.v}</p>
                <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{lang === "ar" ? s.ar : s.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem" className="border-t border-border bg-card py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={lang === "ar" ? "التحدي" : "The Problem"}
            title={lang === "ar" ? "مخلفات البناء والهدم في المملكة تمثل تحديًا بيئيًا ولوجستيًا كبيرًا" : "C&D waste is one of Saudi Arabia's largest environmental & logistics challenges"}
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: TrendingDown,
                en: "40–45% share of total waste",
                ar: "٤٠–٤٥٪ من إجمالي النفايات",
                enBody: "Construction & demolition waste represents approximately 40–45% of total waste generated in Saudi Arabia.",
                arBody: "تمثل مخلفات البناء والهدم ما يقارب ٤٠-٤٥٪ من إجمالي النفايات المتولدة في المملكة.",
              },
              {
                icon: AlertTriangle,
                en: "Random dumping",
                ar: "الدفن العشوائي",
                enBody: "Uncontrolled, illegal dumping causes visual pollution and environmental degradation.",
                arBody: "التخلص العشوائي وغير المرخّص يسبب تلوثًا بصريًا وتدهورًا بيئيًا.",
              },
              {
                icon: Wallet,
                en: "High logistics costs",
                ar: "تكاليف لوجستية مرتفعة",
                enBody: "Lack of route and carrier optimization drives up transportation costs for contractors.",
                arBody: "غياب تحسين المسارات والناقلين يرفع تكاليف النقل على المقاولين.",
              },
              {
                icon: Network,
                en: "No digital connection",
                ar: "غياب الربط الرقمي",
                enBody: "Contractors struggle to connect with licensed recycling facilities and crushers.",
                arBody: "يواجه المقاولون صعوبة في التواصل مع مراكز إعادة التدوير والكسّارات المرخّصة.",
              },
            ].map((p) => (
              <div key={p.en} className="rounded-xl border border-border p-5 transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{lang === "ar" ? p.ar : p.en}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{lang === "ar" ? p.arBody : p.enBody}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section id="solution" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={lang === "ar" ? "الحل" : "The Solution"}
            title={lang === "ar" ? "سوق لوجستي ذكي يربط كل أطراف منظومة إعادة التدوير" : "A smart logistics marketplace connecting the entire recycling ecosystem"}
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Network, en: "Smart Logistics Marketplace", ar: "سوق لوجستي ذكي" },
              { icon: Cpu, en: "AI Waste Classification", ar: "تصنيف ذكي للمخلفات" },
              { icon: MapPinned, en: "GPS Truck Tracking", ar: "تتبع الشاحنات عبر GPS" },
              { icon: QrCode, en: "Digital Manifest", ar: "البيان الرقمي" },
              { icon: ShoppingBag, en: "Recycling Marketplace", ar: "سوق المواد المعاد تدويرها" },
              { icon: Landmark, en: "Regulatory Dashboard for MWAN", ar: "لوحة تنظيمية لموان" },
            ].map((s) => (
              <div key={s.en} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="font-semibold">{lang === "ar" ? s.ar : s.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-y border-border bg-card py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={lang === "ar" ? "آلية العمل" : "How It Works"}
            title={lang === "ar" ? "من طلب الإزالة إلى سوق المواد المعاد تدويرها" : "From a removal request to the recycled-materials marketplace"}
          />
          <div className="relative mt-14">
            <div className="absolute top-10 hidden h-px w-full bg-border lg:block" />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
              {[
                { icon: Camera, en: "Request Waste Removal", ar: "طلب إزالة المخلفات" },
                { icon: Cpu, en: "AI Classification", ar: "التصنيف الذكي" },
                { icon: Route, en: "Smart Logistics Recommendation", ar: "توصية لوجستية ذكية" },
                { icon: Truck, en: "Truck Tracking", ar: "تتبع الشاحنة" },
                { icon: Recycle, en: "Recycling Facility Delivery", ar: "التسليم لمركز إعادة التدوير" },
                { icon: ShoppingBag, en: "Recycled Materials Marketplace", ar: "سوق المواد المعاد تدويرها" },
              ].map((step, i) => (
                <div key={step.en} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-card bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <step.icon className="h-7 w-7" />
                    <span className="absolute -top-2 -end-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                      {i + 1}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold">{lang === "ar" ? step.ar : step.en}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section id="impact" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={lang === "ar" ? "الأثر" : "Impact"}
            title={lang === "ar" ? "أثر يمتد للبيئة والاقتصاد والجهات التنظيمية" : "Impact across environment, economy and regulation"}
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              {
                icon: Leaf,
                color: "emerald",
                en: "Environmental",
                ar: "بيئي",
                points: [
                  { en: "Reduce random & illegal dumping", ar: "تقليل الدفن العشوائي وغير المرخّص" },
                  { en: "Protect the environment from C&D waste impact", ar: "حماية البيئة من أثر مخلفات البناء والهدم" },
                  { en: "Support the circular economy", ar: "دعم الاقتصاد الدائري" },
                ],
              },
              {
                icon: Wallet,
                color: "amber",
                en: "Economic",
                ar: "اقتصادي",
                points: [
                  { en: "Reduce transportation & logistics costs", ar: "تقليل تكاليف النقل واللوجستيات" },
                  { en: "Lower-cost recycled construction materials", ar: "مواد بناء معاد تدويرها بتكلفة أقل" },
                  { en: "New revenue streams for recycling facilities", ar: "مصادر دخل جديدة لمراكز إعادة التدوير" },
                ],
              },
              {
                icon: ShieldCheck,
                color: "blue",
                en: "Regulatory",
                ar: "تنظيمي",
                points: [
                  { en: "Real-time operational data for MWAN", ar: "بيانات تشغيلية لحظية لهيئة موان" },
                  { en: "Monitor national recycling indicators", ar: "مراقبة مؤشرات إعادة التدوير الوطنية" },
                  { en: "End-to-end traceability via Digital Manifest", ar: "تتبع كامل عبر البيان الرقمي" },
                ],
              },
            ].map((c) => (
              <div key={c.en} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-xl",
                  c.color === "emerald" && "bg-emerald-100 text-emerald-700",
                  c.color === "amber" && "bg-amber-100 text-amber-700",
                  c.color === "blue" && "bg-blue-100 text-blue-700",
                )}>
                  <c.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">{lang === "ar" ? c.ar : c.en}</h3>
                <ul className="mt-4 space-y-2.5">
                  {c.points.map((pt) => (
                    <li key={pt.en} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {lang === "ar" ? pt.ar : pt.en}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES CTA STRIP */}
      <section className="border-t border-border bg-card py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={lang === "ar" ? "لكل الأطراف" : "Built for everyone"}
            title={lang === "ar" ? "منصة واحدة لكل الأطراف المعنية" : "One platform for every stakeholder"}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Building2, en: "Contractor", ar: "مقاول" },
              { icon: Truck, en: "Carrier", ar: "ناقل" },
              { icon: Recycle, en: "Recycling Facility", ar: "مركز إعادة تدوير" },
              { icon: Landmark, en: "MWAN Authority", ar: "هيئة موان" },
            ].map((r) => (
              <Link
                key={r.en}
                href="/login"
                className="group flex flex-col items-center gap-3 rounded-xl border border-border p-6 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <r.icon className="h-7 w-7" />
                </div>
                <p className="font-semibold">{lang === "ar" ? r.ar : r.en}</p>
                <span className="flex items-center gap-1 text-xs font-medium text-primary">
                  {lang === "ar" ? "دخول" : "Enter"} <Arrow className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6">
          <BarChart3 className="h-10 w-10 opacity-90" />
          <h2 className="text-2xl font-bold sm:text-3xl">
            {lang === "ar" ? "جاهز لرقمنة إدارة مخلفات مشروعك؟" : "Ready to digitize your project's waste management?"}
          </h2>
          <p className="max-w-xl text-primary-foreground/80">
            {lang === "ar"
              ? "جرّب النسخة التجريبية الآن وشاهد رحلة المخلفات كاملة من الطلب حتى إعادة التدوير."
              : "Try the demo now and follow the full waste journey — from request to recycling."}
          </p>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg transition-transform hover:-translate-y-0.5"
          >
            {lang === "ar" ? "ابدأ الآن" : "Get Started"} <Arrow className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </div>
            <p className="font-bold">{lang === "ar" ? "معمار البيئة" : "Eco-Build"}</p>
          </div>
          <p className="max-w-md text-xs text-muted-foreground">
            {lang === "ar"
              ? "منصة تجريبية (MVP) لأغراض العرض التوضيحي. خدمات الذكاء الاصطناعي وتتبع GPS والتوجيه المستخدمة هنا محاكاة (Simulation) وليست أنظمة حكومية أو إنتاجية فعلية."
              : "This is a demo MVP for demonstration purposes. AI, GPS tracking and routing shown here are simulated services, not real government or production systems."}
          </p>
          <p className="text-xs text-muted-foreground">© 2026 Eco-Build. {lang === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h2>
    </div>
  );
}
