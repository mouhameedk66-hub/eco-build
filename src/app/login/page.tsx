"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Leaf, Building2, Truck, Recycle, Landmark, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const demoAccounts = [
  { email: "contractor@ecobuild.demo", role: "CONTRACTOR", icon: Building2, en: "Contractor", ar: "مقاول" },
  { email: "carrier@ecobuild.demo", role: "CARRIER", icon: Truck, en: "Carrier", ar: "ناقل" },
  { email: "recycler@ecobuild.demo", role: "RECYCLER", icon: Recycle, en: "Recycling Facility", ar: "مركز إعادة تدوير" },
  { email: "authority@ecobuild.demo", role: "AUTHORITY", icon: Landmark, en: "MWAN Authority", ar: "هيئة موان" },
];

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { lang, dir, toggle } = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  async function handleLogin(e?: React.FormEvent, overrideEmail?: string) {
    e?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: overrideEmail ?? email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        setLoading(false);
        return;
      }
      router.push(params.get("next") || data.redirect);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-grid overflow-hidden px-4 py-10">
      <div className="absolute -top-32 -end-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-32 -start-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <button
        onClick={toggle}
        className="absolute top-5 end-5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-muted"
      >
        {lang === "ar" ? "English" : "العربية"}
      </button>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Leaf className="h-6 w-6" />
          </div>
          <div className={cn("text-start", dir === "rtl" && "text-end")}>
            <p className="text-lg font-bold leading-tight">{lang === "ar" ? "معمار البيئة" : "Eco-Build"}</p>
            <p className="text-xs text-muted-foreground">{lang === "ar" ? "Eco-Build" : "معمار البيئة"}</p>
          </div>
        </Link>

        <Card className="p-6 sm:p-8 shadow-xl">
          <h1 className="text-xl font-bold">{lang === "ar" ? "تسجيل الدخول" : "Sign in to your account"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "ar"
              ? "منصة تجريبية — استخدم أحد الحسابات التجريبية أدناه للدخول السريع."
              : "Demo platform — use one of the demo accounts below for quick access."}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                disabled={loading}
                onClick={() => {
                  setEmail(acc.email);
                  handleLogin(undefined, acc.email);
                }}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-secondary/40 p-3 text-center transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50"
              >
                <acc.icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">{lang === "ar" ? acc.ar : acc.en}</span>
              </button>
            ))}
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            {lang === "ar" ? "أو الدخول يدويًا" : "or sign in manually"}
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{lang === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@ecobuild.demo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{lang === "ar" ? "كلمة المرور" : "Password"}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{lang === "ar" ? "تسجيل الدخول" : "Login"} <Arrow className="h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {lang === "ar" ? "كلمة المرور التجريبية لجميع الحسابات:" : "Demo password for all accounts:"}{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">demo1234</code>
          </p>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground hover:underline">
            {lang === "ar" ? "العودة للصفحة الرئيسية" : "Back to homepage"}
          </Link>
        </p>
      </div>
    </div>
  );
}
