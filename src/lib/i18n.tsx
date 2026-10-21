"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Lang = "ar" | "en";

type Dict = Record<string, { ar: string; en: string }>;

export const dict: Dict = {
  appName: { ar: "معمار البيئة", en: "Eco-Build" },
  tagline: { ar: "منصة رقمية ذكية لإدارة مخلفات البناء والهدم", en: "Smart digital platform for construction & demolition waste" },
  dashboard: { ar: "لوحة التحكم", en: "Dashboard" },
  newRequest: { ar: "طلب إزالة جديد", en: "New Waste Request" },
  myRequests: { ar: "طلباتي", en: "My Requests" },
  liveTracking: { ar: "التتبع المباشر", en: "Live Tracking" },
  digitalManifest: { ar: "البيان الرقمي", en: "Digital Manifest" },
  shipmentHistory: { ar: "سجل الشحنات", en: "Shipment History" },
  marketplace: { ar: "سوق المواد المعاد تدويرها", en: "Marketplace" },
  profile: { ar: "الملف الشخصي", en: "Profile" },
  availableRequests: { ar: "الطلبات المتاحة", en: "Available Requests" },
  myShipments: { ar: "شحناتي", en: "My Shipments" },
  fleet: { ar: "الأسطول", en: "Fleet" },
  incomingShipments: { ar: "الشحنات الواردة", en: "Incoming Shipments" },
  upcomingDeliveries: { ar: "التسليمات القادمة", en: "Upcoming Deliveries" },
  receivedWaste: { ar: "المخلفات المستلمة", en: "Received Waste" },
  recycledMaterials: { ar: "المواد المعاد تدويرها", en: "Recycled Materials" },
  inventory: { ar: "المخزون", en: "Inventory" },
  listings: { ar: "منتجات السوق", en: "Marketplace Listings" },
  sales: { ar: "المبيعات", en: "Sales" },
  overview: { ar: "نظرة عامة", en: "Overview" },
  analytics: { ar: "التحليلات", en: "Analytics" },
  alerts: { ar: "التنبيهات", en: "Alerts" },
  liveMap: { ar: "الخريطة الحية", en: "Live Map" },
  facilities: { ar: "مراكز إعادة التدوير", en: "Recycling Facilities" },
  login: { ar: "تسجيل الدخول", en: "Login" },
  logout: { ar: "تسجيل الخروج", en: "Logout" },
  getStarted: { ar: "ابدأ الآن", en: "Get Started" },
  explorePlatform: { ar: "استكشف المنصة", en: "Explore Platform" },
  cart: { ar: "السلة", en: "Cart" },
  checkout: { ar: "إتمام الطلب", en: "Checkout" },
  notifications: { ar: "الإشعارات", en: "Notifications" },
};

export function t(key: keyof typeof dict, lang: Lang) {
  return dict[key]?.[lang] ?? key;
}

export const statusLabels: Record<string, { ar: string; en: string; color: string }> = {
  PENDING: { ar: "قيد الانتظار", en: "Pending", color: "amber" },
  ASSIGNED: { ar: "تم تعيين الناقل", en: "Assigned", color: "blue" },
  PICKUP_READY: { ar: "جاهز للاستلام", en: "Pickup Ready", color: "blue" },
  IN_TRANSIT: { ar: "في الطريق", en: "In Transit", color: "indigo" },
  AT_RECYCLING_CENTER: { ar: "وصل لمركز إعادة التدوير", en: "At Recycling Center", color: "purple" },
  RECYCLED: { ar: "تم إعادة التدوير", en: "Recycled", color: "emerald" },
  COMPLETED: { ar: "مكتمل", en: "Completed", color: "green" },
  FLAGGED: { ar: "مبلّغ عنه", en: "Flagged", color: "red" },
  CLASSIFIED: { ar: "تم التصنيف", en: "Classified", color: "blue" },
  PLANNED: { ar: "تم التخطيط", en: "Planned", color: "indigo" },
  IN_PROGRESS: { ar: "قيد التنفيذ", en: "In Progress", color: "indigo" },
  CANCELLED: { ar: "ملغى", en: "Cancelled", color: "gray" },
  ACTIVE: { ar: "متاح", en: "Active", color: "green" },
  OUT_OF_STOCK: { ar: "نفدت الكمية", en: "Out of Stock", color: "red" },
  CONFIRMED: { ar: "مؤكد", en: "Confirmed", color: "blue" },
};

interface LangContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  toggle: () => void;
  T: (key: keyof typeof dict) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("eb-lang") as Lang | null) : null;
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("eb-lang", l);
  }, []);

  const toggle = useCallback(() => setLang(lang === "ar" ? "en" : "ar"), [lang, setLang]);
  const T = useCallback((key: keyof typeof dict) => t(key, lang), [lang]);

  return (
    <LangContext.Provider value={{ lang, dir: lang === "ar" ? "rtl" : "ltr", setLang, toggle, T }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
