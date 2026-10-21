/**
 * aiClassificationService
 * ------------------------------------------------------------------
 * MOCK / SIMULATION SERVICE — Eco-Build MVP
 *
 * This service simulates a Computer Vision waste-classification model.
 * It does NOT run a real AI model. It analyzes lightweight signals from
 * the uploaded images (filename hints, count, byte size) and combines
 * them with weighted randomness to produce a realistic, deterministic-ish
 * result for demo purposes.
 *
 * Swap-in plan for production:
 *   Replace `classifyWasteImages()` internals with a call to a real
 *   Computer Vision endpoint (e.g. a hosted image classification model),
 *   keeping the exact same function signature and return type so no
 *   caller in the app needs to change.
 * ------------------------------------------------------------------
 */

export type WasteType =
  | "Concrete"
  | "Rebar / Steel"
  | "Bricks & Masonry"
  | "Wood"
  | "Mixed C&D Waste"
  | "Asphalt"
  | "Gypsum / Drywall"
  | "Excavation Soil";

export interface ClassificationInput {
  imageNames: string[];
  imageCount: number;
  approxSizeKb: number;
  wasteDescription?: string;
}

export interface AIClassificationResult {
  wasteType: WasteType;
  wasteTypeAr: string;
  confidence: number; // 0-100
  estimatedWeight: number; // tons
  recyclable: boolean;
  recommendations: string[];
  recommendationsAr: string[];
  modelVersion: string;
  analyzedAt: string;
}

const WASTE_PROFILES: { type: WasteType; ar: string; recyclable: boolean; keywords: string[] }[] = [
  { type: "Concrete", ar: "خرسانة", recyclable: true, keywords: ["concrete", "خرسان", "beton", "slab"] },
  { type: "Rebar / Steel", ar: "حديد تسليح", recyclable: true, keywords: ["steel", "rebar", "حديد", "metal"] },
  { type: "Bricks & Masonry", ar: "طوب وبناء", recyclable: true, keywords: ["brick", "طوب", "masonry", "block"] },
  { type: "Asphalt", ar: "إسفلت", recyclable: true, keywords: ["asphalt", "اسفلت", "road"] },
  { type: "Wood", ar: "خشب", recyclable: true, keywords: ["wood", "خشب", "timber"] },
  { type: "Gypsum / Drywall", ar: "جبس", recyclable: false, keywords: ["gypsum", "جبس", "drywall"] },
  { type: "Excavation Soil", ar: "تربة حفر", recyclable: false, keywords: ["soil", "تربة", "excavation", "dirt"] },
  { type: "Mixed C&D Waste", ar: "مخلفات مختلطة", recyclable: true, keywords: ["mixed", "مختلط", "debris"] },
];

const RECOMMENDATIONS: Record<string, { en: string; ar: string }[]> = {
  recyclable: [
    { en: "Route to nearest licensed recycling facility for crushing/reprocessing.", ar: "توجيه المخلفات لأقرب مركز إعادة تدوير مرخّص للتكسير والمعالجة." },
    { en: "Segregate from mixed loads to improve recovery rate.", ar: "فصل المخلفات عن الحمولات المختلطة لتحسين معدل الاستعادة." },
    { en: "Use a covered truck to minimize dust during transport.", ar: "استخدام شاحنة مغطاة لتقليل الغبار أثناء النقل." },
  ],
  nonRecyclable: [
    { en: "Dispose at an authorized landfill under MWAN regulations.", ar: "التخلص في مكب نفايات مرخّص وفق أنظمة موان." },
    { en: "Verify hazardous content before transport.", ar: "التحقق من عدم احتواء المخلفات على مواد خطرة قبل النقل." },
  ],
};

function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export async function classifyWasteImages(input: ClassificationInput): Promise<AIClassificationResult> {
  // Simulate model inference latency
  await new Promise((r) => setTimeout(r, 1800 + Math.random() * 900));

  const joined = (input.imageNames.join(" ") + " " + (input.wasteDescription ?? "")).toLowerCase();
  const seed = hashString(joined + input.imageCount + input.approxSizeKb);

  let matched = WASTE_PROFILES.find((p) => p.keywords.some((k) => joined.includes(k)));
  if (!matched) {
    matched = WASTE_PROFILES[seed % WASTE_PROFILES.length];
  }

  const confidence = 82 + (seed % 17); // 82-98
  const baseWeight = 3 + ((seed % 400) / 10); // 3 - 43 tons
  const estimatedWeight = Math.round((baseWeight + input.imageCount * 1.4) * 10) / 10;

  const pool = matched.recyclable ? RECOMMENDATIONS.recyclable : RECOMMENDATIONS.nonRecyclable;

  return {
    wasteType: matched.type,
    wasteTypeAr: matched.ar,
    confidence,
    estimatedWeight,
    recyclable: matched.recyclable,
    recommendations: pool.map((p) => p.en),
    recommendationsAr: pool.map((p) => p.ar),
    modelVersion: "eco-mock-classifier-v1 (simulated — not a production CV model)",
    analyzedAt: new Date().toISOString(),
  };
}
