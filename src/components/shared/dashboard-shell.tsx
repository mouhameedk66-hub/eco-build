"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Leaf,
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  Globe,
  User as UserIcon,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { NAV_ITEMS_BY_ROLE, type NavItem } from "@/components/shared/nav-config";

export type { NavItem };

export interface ShellUser {
  name: string;
  nameAr: string;
  role: string;
  email: string;
}

const roleLabels: Record<string, { en: string; ar: string }> = {
  CONTRACTOR: { en: "Contractor", ar: "مقاول" },
  CARRIER: { en: "Carrier", ar: "ناقل" },
  RECYCLER: { en: "Recycling Facility", ar: "مركز إعادة تدوير" },
  AUTHORITY: { en: "MWAN Authority", ar: "هيئة موان" },
};

export function DashboardShell({
  user,
  notifications,
  children,
}: {
  user: ShellUser;
  notifications?: { title: string; titleAr: string; time: string }[];
  children: React.ReactNode;
}) {
  const { lang, toggle, dir } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const roleLabel = roleLabels[user.role] ?? { en: user.role, ar: user.role };
  const notifs = notifications ?? [];
  const navItems = NAV_ITEMS_BY_ROLE[user.role] ?? [];

  return (
    <div className="flex min-h-screen bg-secondary/30">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex w-64 flex-col border-e border-border bg-card transition-transform lg:static lg:translate-x-0",
          dir === "rtl" ? "end-0" : "start-0",
          mobileOpen ? "translate-x-0" : dir === "rtl" ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold">{lang === "ar" ? "معمار البيئة" : "Eco-Build"}</p>
            <p className="text-[11px] text-muted-foreground">{lang === "ar" ? "Eco-Build" : "معمار البيئة"}</p>
          </div>
          <button className="ms-auto lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "" && pathname?.startsWith(item.href + "/"));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {lang === "ar" ? item.labelAr : item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4.5 w-4.5" />
            {lang === "ar" ? "تسجيل الخروج" : "Logout"}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col lg:ms-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden text-sm text-muted-foreground sm:block">
            {lang === "ar" ? roleLabel.ar : roleLabel.en}
          </div>

          <div className="ms-auto flex items-center gap-2">
            <button
              onClick={toggle}
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang === "ar" ? "EN" : "AR"}
            </button>

            <div className="relative">
              <button
                onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
              >
                <Bell className="h-4.5 w-4.5" />
                {notifs.length > 0 && (
                  <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute end-0 mt-2 w-72 rounded-xl border border-border bg-card p-2 shadow-lg animate-slide-up">
                  <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {lang === "ar" ? "الإشعارات" : "Notifications"}
                  </p>
                  {notifs.length === 0 && (
                    <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                      {lang === "ar" ? "لا توجد إشعارات جديدة" : "No new notifications"}
                    </p>
                  )}
                  {notifs.map((n, i) => (
                    <div key={i} className="rounded-lg px-2 py-2 text-xs hover:bg-muted">
                      <p className="font-medium">{lang === "ar" ? n.titleAr : n.title}</p>
                      <p className="text-muted-foreground">{n.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
                className="flex items-center gap-2 rounded-lg border border-border py-1.5 ps-1.5 pe-2.5 hover:bg-muted"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserIcon className="h-4 w-4" />
                </div>
                <span className="hidden text-xs font-medium sm:block">{lang === "ar" ? user.nameAr : user.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {profileOpen && (
                <div className="absolute end-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg animate-slide-up">
                  <div className="border-b border-border px-2 py-2">
                    <p className="text-sm font-medium">{lang === "ar" ? user.nameAr : user.name}</p>
                    <p className="text-xs text-muted-foreground" dir="ltr">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-start text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {lang === "ar" ? "تسجيل الخروج" : "Logout"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
