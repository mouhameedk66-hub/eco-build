import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  MapPinned,
  FileCheck2,
  History,
  ShoppingBag,
  UserCircle,
  Truck,
  BarChart3,
  BellRing,
  Factory,
  Recycle,
  Wallet,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  labelAr: string;
  icon: LucideIcon;
}

export const NAV_ITEMS_BY_ROLE: Record<string, NavItem[]> = {
  CONTRACTOR: [
    { href: "/dashboard/contractor", label: "Dashboard", labelAr: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/dashboard/contractor/new-request", label: "New Waste Request", labelAr: "طلب إزالة جديد", icon: PlusCircle },
    { href: "/dashboard/contractor/requests", label: "My Requests", labelAr: "طلباتي", icon: ClipboardList },
    { href: "/dashboard/contractor/tracking", label: "Live Tracking", labelAr: "التتبع المباشر", icon: MapPinned },
    { href: "/dashboard/contractor/manifest", label: "Digital Manifest", labelAr: "البيان الرقمي", icon: FileCheck2 },
    { href: "/dashboard/contractor/history", label: "Shipment History", labelAr: "سجل الشحنات", icon: History },
    { href: "/dashboard/contractor/marketplace", label: "Marketplace", labelAr: "سوق المواد المعاد تدويرها", icon: ShoppingBag },
    { href: "/dashboard/contractor/profile", label: "Profile", labelAr: "الملف الشخصي", icon: UserCircle },
  ],
  CARRIER: [
    { href: "/dashboard/carrier", label: "Dashboard", labelAr: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/dashboard/carrier/requests", label: "Available Requests", labelAr: "الطلبات المتاحة", icon: ClipboardList },
    { href: "/dashboard/carrier/shipments", label: "My Shipments", labelAr: "شحناتي", icon: MapPinned },
    { href: "/dashboard/carrier/fleet", label: "Fleet", labelAr: "الأسطول", icon: Truck },
    { href: "/dashboard/carrier/profile", label: "Profile", labelAr: "الملف الشخصي", icon: UserCircle },
  ],
  RECYCLER: [
    { href: "/dashboard/recycler", label: "Dashboard", labelAr: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/dashboard/recycler/shipments", label: "Incoming Shipments", labelAr: "الشحنات الواردة", icon: Truck },
    { href: "/dashboard/recycler/materials", label: "Recycled Materials", labelAr: "المواد المعاد تدويرها", icon: Recycle },
    { href: "/dashboard/recycler/marketplace", label: "Marketplace Listings", labelAr: "منتجات السوق", icon: ShoppingBag },
    { href: "/dashboard/recycler/sales", label: "Sales", labelAr: "المبيعات", icon: Wallet },
    { href: "/dashboard/recycler/profile", label: "Profile", labelAr: "الملف الشخصي", icon: UserCircle },
  ],
  AUTHORITY: [
    { href: "/dashboard/authority", label: "Overview", labelAr: "نظرة عامة", icon: LayoutDashboard },
    { href: "/dashboard/authority/analytics", label: "Analytics", labelAr: "التحليلات", icon: BarChart3 },
    { href: "/dashboard/authority/map", label: "Live Map", labelAr: "الخريطة الحية", icon: MapPinned },
    { href: "/dashboard/authority/alerts", label: "Alerts", labelAr: "التنبيهات", icon: BellRing },
    { href: "/dashboard/authority/shipments", label: "Shipments", labelAr: "الشحنات", icon: Truck },
    { href: "/dashboard/authority/facilities", label: "Recycling Facilities", labelAr: "مراكز إعادة التدوير", icon: Factory },
    { href: "/dashboard/authority/profile", label: "Profile", labelAr: "الملف الشخصي", icon: UserCircle },
  ],
};
