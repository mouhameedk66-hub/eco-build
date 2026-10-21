/**
 * routeOptimizationService
 * ------------------------------------------------------------------
 * MOCK / SIMULATION SERVICE — Eco-Build MVP
 *
 * Simulates a logistics optimization engine that scores carriers and
 * recycling facilities against a waste-removal request, then produces
 * a synthetic route between pickup -> recycling facility.
 *
 * Swap-in plan for production:
 *   Replace the scoring + route generation with calls to a real routing
 *   engine (e.g. a maps/directions API) and a real optimization/assignment
 *   service, keeping the same input/output contract.
 * ------------------------------------------------------------------
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface CarrierCandidate {
  id: string;
  companyName: string;
  companyNameAr: string;
  lat: number;
  lng: number;
  rating: number;
  capacityTons: number;
  pricePerKm: number;
  availableTrucks: number;
}

export interface FacilityCandidate {
  id: string;
  name: string;
  nameAr: string;
  lat: number;
  lng: number;
  acceptedWasteTypes: string[];
  capacityTonsPerDay: number;
  processingTimeHours: number;
  licensed: boolean;
}

export interface RouteOptimizationInput {
  pickup: GeoPoint;
  wasteType: string;
  estimatedWeight: number;
  carriers: CarrierCandidate[];
  facilities: FacilityCandidate[];
}

export interface ScoredCarrier extends CarrierCandidate {
  distanceKm: number;
  estimatedPriceSar: number;
  score: number;
}

export interface ScoredFacility extends FacilityCandidate {
  distanceKm: number;
  score: number;
}

export interface RouteOptimizationResult {
  recommendedCarrier: ScoredCarrier;
  alternativeCarriers: ScoredCarrier[];
  recommendedFacility: ScoredFacility;
  alternativeFacilities: ScoredFacility[];
  route: GeoPoint[];
  distanceKm: number;
  estimatedCostSar: number;
  etaMinutes: number;
  engineVersion: string;
}

export function haversineKm(a: GeoPoint, b: GeoPoint) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Builds a synthetic multi-point road-like path between two points. */
export function buildSyntheticRoute(start: GeoPoint, end: GeoPoint, segments = 10): GeoPoint[] {
  const points: GeoPoint[] = [];
  const seed = Math.abs(Math.round((start.lat + start.lng + end.lat + end.lng) * 10000));
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const jitterSeed = (seed * (i + 1)) % 997;
    const jitter = (Math.sin(jitterSeed) * 0.004) * Math.sin(f * Math.PI); // eases out at endpoints
    points.push({
      lat: start.lat + (end.lat - start.lat) * f + jitter,
      lng: start.lng + (end.lng - start.lng) * f + jitter * 0.6,
    });
  }
  return points;
}

export function optimizeLogistics(input: RouteOptimizationInput): RouteOptimizationResult {
  const { pickup, wasteType, estimatedWeight, carriers, facilities } = input;

  const scoredCarriers: ScoredCarrier[] = carriers
    .map((c) => {
      const distanceKm = Math.round(haversineKm(pickup, { lat: c.lat, lng: c.lng }) * 10) / 10;
      const estimatedPriceSar = Math.round(distanceKm * c.pricePerKm + estimatedWeight * 12);
      const capacityFit = c.capacityTons >= estimatedWeight ? 1 : c.capacityTons / estimatedWeight;
      const score =
        capacityFit * 40 +
        (c.rating / 5) * 30 +
        Math.max(0, 30 - distanceKm) +
        (c.availableTrucks > 0 ? 10 : -20);
      return { ...c, distanceKm, estimatedPriceSar, score: Math.round(score * 10) / 10 };
    })
    .sort((a, b) => b.score - a.score);

  const scoredFacilities: ScoredFacility[] = facilities
    .map((f) => {
      const distanceKm = Math.round(haversineKm(pickup, { lat: f.lat, lng: f.lng }) * 10) / 10;
      const accepts = f.acceptedWasteTypes.some(
        (t) => t.toLowerCase() === wasteType.toLowerCase()
      )
        ? 1
        : 0.3;
      const score =
        accepts * 45 +
        Math.max(0, 35 - distanceKm) +
        (f.licensed ? 15 : 0) +
        Math.min(5, f.capacityTonsPerDay / 100);
      return { ...f, distanceKm, score: Math.round(score * 10) / 10 };
    })
    .sort((a, b) => b.score - a.score);

  const recommendedCarrier = scoredCarriers[0];
  const recommendedFacility = scoredFacilities[0];

  const route = buildSyntheticRoute(pickup, { lat: recommendedFacility.lat, lng: recommendedFacility.lng });
  const distanceKm = recommendedFacility.distanceKm;
  const estimatedCostSar = Math.round(distanceKm * recommendedCarrier.pricePerKm + estimatedWeight * 12);
  const avgSpeedKph = 55;
  const etaMinutes = Math.max(12, Math.round((distanceKm / avgSpeedKph) * 60));

  return {
    recommendedCarrier,
    alternativeCarriers: scoredCarriers.slice(1, 4),
    recommendedFacility,
    alternativeFacilities: scoredFacilities.slice(1, 4),
    route,
    distanceKm,
    estimatedCostSar,
    etaMinutes,
    engineVersion: "eco-mock-route-optimizer-v1 (simulated — not a production optimization engine)",
  };
}
