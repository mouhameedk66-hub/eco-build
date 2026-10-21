export type Role = "CONTRACTOR" | "CARRIER" | "RECYCLER" | "AUTHORITY";

export type RequestStatus =
  | "PENDING"
  | "CLASSIFIED"
  | "PLANNED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type ShipmentStatus =
  | "PENDING"
  | "ASSIGNED"
  | "PICKUP_READY"
  | "IN_TRANSIT"
  | "AT_RECYCLING_CENTER"
  | "RECYCLED"
  | "COMPLETED"
  | "FLAGGED";

export const SHIPMENT_STATUS_ORDER: ShipmentStatus[] = [
  "PENDING",
  "ASSIGNED",
  "PICKUP_READY",
  "IN_TRANSIT",
  "AT_RECYCLING_CENTER",
  "RECYCLED",
  "COMPLETED",
];

export type TruckStatus = "AVAILABLE" | "ON_TRIP" | "MAINTENANCE";

export type AlertType =
  | "ROUTE_DEVIATION"
  | "DELAYED_ARRIVAL"
  | "GPS_SIGNAL_LOST"
  | "SHIPMENT_COMPLETED"
  | "ILLEGAL_DUMPING_RISK";

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export type ProductStatus = "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";

export type OrderStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export const WASTE_TYPES = [
  { en: "Concrete", ar: "خرسانة" },
  { en: "Rebar / Steel", ar: "حديد تسليح" },
  { en: "Bricks & Masonry", ar: "طوب وبناء" },
  { en: "Asphalt", ar: "إسفلت" },
  { en: "Wood", ar: "خشب" },
  { en: "Gypsum / Drywall", ar: "جبس" },
  { en: "Excavation Soil", ar: "تربة حفر" },
  { en: "Mixed C&D Waste", ar: "مخلفات مختلطة" },
] as const;

export const SHIPMENT_STAGES = [
  { key: "REQUEST_CREATED", en: "Request created", ar: "تم إنشاء الطلب" },
  { key: "CARRIER_ASSIGNED", en: "Carrier assigned", ar: "تم تعيين الناقل" },
  { key: "TRUCK_ARRIVED", en: "Truck arrived", ar: "وصلت الشاحنة" },
  { key: "PICKUP_COMPLETED", en: "Pickup completed", ar: "تم الاستلام" },
  { key: "SHIPMENT_STARTED", en: "Shipment started", ar: "بدأت الرحلة" },
  { key: "IN_TRANSIT", en: "Truck in transit", ar: "الشاحنة في الطريق" },
  { key: "RECYCLING_CENTER_REACHED", en: "Recycling facility reached", ar: "وصول مركز إعادة التدوير" },
  { key: "WASTE_UNLOADED", en: "Waste unloaded", ar: "تم تفريغ المخلفات" },
  { key: "MANIFEST_COMPLETED", en: "Digital Manifest completed", ar: "اكتمال البيان الرقمي" },
] as const;
