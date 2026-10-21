import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { classifyWasteImages } from "@/services/aiClassificationService";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const request = await prisma.wasteRequest.findUnique({
    where: { id: params.id },
    include: { images: true },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await classifyWasteImages({
    imageNames: request.images.map((i) => i.url.slice(0, 60)),
    imageCount: request.images.length || 1,
    approxSizeKb: request.images.reduce((s, i) => s + i.url.length / 1024, 0),
    wasteDescription: request.description,
  });

  const classification = await prisma.aIClassification.upsert({
    where: { wasteRequestId: request.id },
    create: {
      wasteRequestId: request.id,
      wasteType: result.wasteType,
      wasteTypeAr: result.wasteTypeAr,
      confidence: result.confidence,
      estimatedWeight: result.estimatedWeight,
      recyclable: result.recyclable,
      recommendations: JSON.stringify({ en: result.recommendations, ar: result.recommendationsAr }),
      modelVersion: result.modelVersion,
    },
    update: {
      wasteType: result.wasteType,
      wasteTypeAr: result.wasteTypeAr,
      confidence: result.confidence,
      estimatedWeight: result.estimatedWeight,
      recyclable: result.recyclable,
      recommendations: JSON.stringify({ en: result.recommendations, ar: result.recommendationsAr }),
      modelVersion: result.modelVersion,
    },
  });

  await prisma.wasteRequest.update({ where: { id: request.id }, data: { status: "CLASSIFIED" } });

  return NextResponse.json({ classification, raw: result });
}
