/**
 * trackingService
 * ------------------------------------------------------------------
 * MOCK / SIMULATION SERVICE — Eco-Build MVP
 *
 * Simulates GPS telemetry for a shipment moving along a pre-computed
 * route (see routeOptimizationService). Produces GPS points shaped
 * exactly like real GPS/IoT tracker payloads so a future integration
 * with an actual GPS/IoT provider only needs to swap the data source,
 * not the consuming code.
 * ------------------------------------------------------------------
 */

import type { GeoPoint } from "./routeOptimizationService";

export interface SimulatedGpsPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  speed: number; // km/h
  status: string;
  progressPct: number;
  remainingKm: number;
  etaMinutes: number;
}

/** Interpolates a point along a polyline route at fraction f (0-1). */
export function pointAtProgress(route: GeoPoint[], f: number): GeoPoint {
  if (route.length === 0) return { lat: 0, lng: 0 };
  const clamped = Math.max(0, Math.min(1, f));
  const segmentCount = route.length - 1;
  if (segmentCount <= 0) return route[0];
  const segF = clamped * segmentCount;
  const idx = Math.min(segmentCount - 1, Math.floor(segF));
  const localF = segF - idx;
  const a = route[idx];
  const b = route[idx + 1];
  return {
    lat: a.lat + (b.lat - a.lat) * localF,
    lng: a.lng + (b.lng - a.lng) * localF,
  };
}

function routeLengthKm(route: GeoPoint[]) {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += haversineKm(route[i], route[i + 1]);
  }
  return total;
}

function haversineKm(a: GeoPoint, b: GeoPoint) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

const STEP_PCT_RANGE: [number, number] = [4, 9];

/**
 * Advances a shipment's simulated position by one tick.
 * Returns the next GPS point + updated progress. Deterministic-ish
 * randomness keeps the demo feeling alive without real telemetry.
 */
export function advanceSimulatedPosition(params: {
  route: GeoPoint[];
  currentProgressPct: number;
  totalDistanceKm: number;
  status: string;
}): SimulatedGpsPoint {
  const { route, currentProgressPct, totalDistanceKm, status } = params;
  const [minStep, maxStep] = STEP_PCT_RANGE;
  const step = minStep + Math.random() * (maxStep - minStep);
  const nextProgress = Math.min(100, currentProgressPct + step);
  const point = pointAtProgress(route, nextProgress / 100);
  const distanceCovered = (nextProgress / 100) * totalDistanceKm;
  const remainingKm = Math.max(0, Math.round((totalDistanceKm - distanceCovered) * 10) / 10);
  const speed = nextProgress >= 100 ? 0 : Math.round(48 + Math.random() * 30);
  const avgSpeedKph = 58;
  const etaMinutes = Math.max(0, Math.round((remainingKm / avgSpeedKph) * 60));

  return {
    latitude: point.lat,
    longitude: point.lng,
    timestamp: new Date().toISOString(),
    speed,
    status,
    progressPct: Math.round(nextProgress * 10) / 10,
    remainingKm,
    etaMinutes,
  };
}

export function computeRouteDistanceKm(route: GeoPoint[]) {
  return Math.round(routeLengthKm(route) * 10) / 10;
}
