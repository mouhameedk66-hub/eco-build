import { prisma } from "@/lib/db";
import { SHIPMENT_STAGES } from "@/types";

export async function addEvent(shipmentId: string, stageKey: (typeof SHIPMENT_STAGES)[number]["key"], note?: string) {
  const stage = SHIPMENT_STAGES.find((s) => s.key === stageKey)!;
  return prisma.shipmentEvent.create({
    data: { shipmentId, stage: stage.en, stageAr: stage.ar, note },
  });
}

export function parseRoute(routeJson: string): { lat: number; lng: number }[] {
  try {
    return JSON.parse(routeJson);
  } catch {
    return [];
  }
}
