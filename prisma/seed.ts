/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import { buildSyntheticRoute, haversineKm, type GeoPoint } from "../src/services/routeOptimizationService";
import { SHIPMENT_STAGES } from "../src/types";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo1234";

// ---- City clusters (Saudi Arabia) ----------------------------------------
const CITIES = {
  riyadh: { name: "Riyadh", nameAr: "الرياض", lat: 24.7136, lng: 46.6753 },
  jeddah: { name: "Jeddah", nameAr: "جدة", lat: 21.4858, lng: 39.1925 },
  dammam: { name: "Dammam", nameAr: "الدمام", lat: 26.4207, lng: 50.0888 },
  makkah: { name: "Makkah", nameAr: "مكة المكرمة", lat: 21.3891, lng: 39.8579 },
};

function jitter(center: GeoPoint, km = 8): GeoPoint {
  const dLat = (Math.random() - 0.5) * (km / 111);
  const dLng = (Math.random() - 0.5) * (km / 95);
  return { lat: center.lat + dLat, lng: center.lng + dLng };
}

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

async function main() {
  console.log("Seeding Eco-Build demo data...");

  // Clean slate (idempotent reseed)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.gPSPoint.deleteMany();
  await prisma.shipmentEvent.deleteMany();
  await prisma.digitalManifest.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.marketplaceProduct.deleteMany();
  await prisma.recycledMaterial.deleteMany();
  await prisma.aIClassification.deleteMany();
  await prisma.wasteImage.deleteMany();
  await prisma.wasteRequest.deleteMany();
  await prisma.truck.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.recyclingCenter.deleteMany();
  await prisma.carrier.deleteMany();
  await prisma.contractor.deleteMany();
  await prisma.user.deleteMany();

  // ---- Users & Contractors -------------------------------------------------
  const contractorSeed = [
    { email: "contractor@ecobuild.demo", name: "Modern Building Contracting Co.", nameAr: "شركة البناء الحديث للمقاولات", city: "riyadh" },
    { email: "c2@ecobuild.demo", name: "Integrated Construction Est.", nameAr: "مؤسسة الإنشاءات المتكاملة", city: "riyadh" },
    { email: "c3@ecobuild.demo", name: "Ufuq Al-Tamir Co.", nameAr: "شركة أفق التعمير", city: "jeddah" },
    { email: "c4@ecobuild.demo", name: "Al-Diyar Contracting Group", nameAr: "مجموعة الديار للمقاولات", city: "dammam" },
    { email: "c5@ecobuild.demo", name: "Al-Ruwad Engineering Projects Co.", nameAr: "شركة الرواد للمشاريع الهندسية", city: "makkah" },
  ];

  const contractors: any[] = [];
  for (const c of contractorSeed) {
    const user = await prisma.user.create({
      data: {
        email: c.email,
        password: DEMO_PASSWORD,
        name: c.name,
        nameAr: c.nameAr,
        role: "CONTRACTOR",
        phone: "05" + Math.floor(10000000 + Math.random() * 89999999),
      },
    });
    const contractor = await prisma.contractor.create({
      data: {
        userId: user.id,
        companyName: c.name,
        companyNameAr: c.nameAr,
        city: CITIES[c.city as keyof typeof CITIES].nameAr,
        phone: user.phone!,
      },
    });
    contractors.push({ ...contractor, cityKey: c.city });
  }

  // ---- Carriers, drivers, trucks -------------------------------------------
  const carrierSeed = [
    { email: "carrier@ecobuild.demo", name: "Green Transport Logistics Co.", nameAr: "شركة النقل الأخضر للخدمات اللوجستية", city: "riyadh", trucks: 3 },
    { email: "cr2@ecobuild.demo", name: "Fast Freight Est.", nameAr: "مؤسسة الشحن السريع", city: "riyadh", trucks: 2 },
    { email: "cr3@ecobuild.demo", name: "Mawanea Waste Transport Co.", nameAr: "شركة الموانئ لنقل المخلفات", city: "jeddah", trucks: 2 },
    { email: "cr4@ecobuild.demo", name: "Eastern Heavy Haulage", nameAr: "الشرقية للنقل الثقيل", city: "dammam", trucks: 1 },
  ];

  const driverNames = [
    { en: "Faisal Al-Otaibi", ar: "فيصل العتيبي" },
    { en: "Nasser Al-Qahtani", ar: "ناصر القحطاني" },
    { en: "Khalid Al-Harbi", ar: "خالد الحربي" },
    { en: "Mohammed Al-Zahrani", ar: "محمد الزهراني" },
    { en: "Abdullah Al-Shammari", ar: "عبدالله الشمري" },
    { en: "Turki Al-Dosari", ar: "تركي الدوسري" },
    { en: "Sami Al-Ghamdi", ar: "سامي الغامدي" },
    { en: "Yousef Al-Malki", ar: "يوسف المالكي" },
  ];

  const truckTypes = ["Tipper Truck", "Flatbed Truck", "Roll-off Truck", "Dump Truck"];

  const carriers: any[] = [];
  const trucks: any[] = [];
  const drivers: any[] = [];
  let truckIdx = 0;
  let driverIdx = 0;
  for (const c of carrierSeed) {
    const center = CITIES[c.city as keyof typeof CITIES];
    const loc = jitter(center, 5);
    const user = await prisma.user.create({
      data: {
        email: c.email,
        password: DEMO_PASSWORD,
        name: c.name,
        nameAr: c.nameAr,
        role: "CARRIER",
        phone: "05" + Math.floor(10000000 + Math.random() * 89999999),
      },
    });
    const carrier = await prisma.carrier.create({
      data: {
        userId: user.id,
        companyName: c.name,
        companyNameAr: c.nameAr,
        city: center.nameAr,
        lat: loc.lat,
        lng: loc.lng,
        rating: Math.round((4 + Math.random()) * 10) / 10,
        capacityTons: pick([15, 20, 25, 30], carriers.length),
        pricePerKm: Math.round((3 + Math.random() * 2) * 10) / 10,
        phone: user.phone!,
      },
    });
    carriers.push({ ...carrier, cityKey: c.city });

    for (let i = 0; i < c.trucks; i++) {
      const d = driverNames[driverIdx % driverNames.length];
      driverIdx++;
      const driver = await prisma.driver.create({
        data: {
          carrierId: carrier.id,
          name: d.en,
          nameAr: d.ar,
          phone: "05" + Math.floor(10000000 + Math.random() * 89999999),
          licenseNo: "DL-" + (100000 + truckIdx),
          rating: Math.round((4.2 + Math.random() * 0.7) * 10) / 10,
        },
      });
      drivers.push(driver);

      const truck = await prisma.truck.create({
        data: {
          carrierId: carrier.id,
          plateNumber: `${["ABC", "KLM", "XYZ", "RTN"][truckIdx % 4]}-${1000 + truckIdx}`,
          type: truckTypes[truckIdx % truckTypes.length],
          capacityTons: pick([12, 18, 22, 28], truckIdx),
          status: "AVAILABLE",
        },
      });
      trucks.push({ ...truck, driverId: driver.id, cityKey: c.city });
      truckIdx++;
    }
  }

  // ---- Recycling centers -----------------------------------------------------
  const facilitySeed = [
    {
      email: "recycler@ecobuild.demo",
      name: "Riyadh C&D Recycling Center",
      nameAr: "مركز الرياض لإعادة تدوير مخلفات البناء",
      city: "riyadh",
      types: ["Concrete", "Bricks & Masonry", "Asphalt", "Mixed C&D Waste"],
    },
    {
      email: "rc2@ecobuild.demo",
      name: "Jeddah Concrete Crushing Plant",
      nameAr: "مصنع جدة لتكسير الخرسانة",
      city: "jeddah",
      types: ["Concrete", "Rebar / Steel", "Mixed C&D Waste"],
    },
    {
      email: "rc3@ecobuild.demo",
      name: "Dammam Industrial Recycling Center",
      nameAr: "مركز الدمام لإعادة التدوير الصناعي",
      city: "dammam",
      types: ["Concrete", "Rebar / Steel", "Wood", "Asphalt"],
    },
    {
      email: "rc4@ecobuild.demo",
      name: "Makkah Green Recycling Facility",
      nameAr: "منشأة مكة الخضراء لإعادة التدوير",
      city: "makkah",
      types: ["Concrete", "Bricks & Masonry", "Mixed C&D Waste"],
    },
  ];

  const facilities: any[] = [];
  for (const f of facilitySeed) {
    const center = CITIES[f.city as keyof typeof CITIES];
    const loc = jitter(center, 6);
    const user = await prisma.user.create({
      data: {
        email: f.email,
        password: DEMO_PASSWORD,
        name: f.name,
        nameAr: f.nameAr,
        role: "RECYCLER",
        phone: "05" + Math.floor(10000000 + Math.random() * 89999999),
      },
    });
    const facility = await prisma.recyclingCenter.create({
      data: {
        userId: user.id,
        name: f.name,
        nameAr: f.nameAr,
        city: center.nameAr,
        address: `${center.nameAr} - المنطقة الصناعية`,
        lat: loc.lat,
        lng: loc.lng,
        capacityTonsPerDay: pick([200, 350, 500, 280], facilities.length),
        acceptedWasteTypes: JSON.stringify(f.types),
        phone: user.phone!,
        licensed: true,
        processingTimeHours: pick([4, 6, 8, 5], facilities.length),
      },
    });
    facilities.push({ ...facility, cityKey: f.city, types: f.types });
  }

  // ---- Regulatory authority user ---------------------------------------------
  await prisma.user.create({
    data: {
      email: "authority@ecobuild.demo",
      password: DEMO_PASSWORD,
      name: "MWAN National Waste Authority",
      nameAr: "موان - الهيئة الوطنية لإدارة النفايات",
      role: "AUTHORITY",
      phone: "0112345678",
    },
  });

  // ---- Waste requests, classifications, shipments -----------------------------
  const wasteTypes = [
    { en: "Concrete", ar: "خرسانة", recyclable: true },
    { en: "Rebar / Steel", ar: "حديد تسليح", recyclable: true },
    { en: "Bricks & Masonry", ar: "طوب وبناء", recyclable: true },
    { en: "Asphalt", ar: "إسفلت", recyclable: true },
    { en: "Wood", ar: "خشب", recyclable: true },
    { en: "Gypsum / Drywall", ar: "جبس", recyclable: false },
    { en: "Excavation Soil", ar: "تربة حفر", recyclable: false },
    { en: "Mixed C&D Waste", ar: "مخلفات مختلطة", recyclable: true },
  ];

  const projectNames = [
    { en: "Al-Narjis Residential Tower", ar: "برج النرجس السكني" },
    { en: "King Fahd Road Renovation", ar: "تجديد طريق الملك فهد" },
    { en: "Al-Yasmin Villas Compound", ar: "مجمع فلل الياسمين" },
    { en: "Corniche Commercial Center", ar: "المركز التجاري بالكورنيش" },
    { en: "Industrial City Warehouse", ar: "مستودع المدينة الصناعية" },
    { en: "Al-Rawdah School Demolition", ar: "هدم مدرسة الروضة" },
    { en: "Downtown Office Complex", ar: "مجمع مكاتب وسط المدينة" },
    { en: "Al-Salam Bridge Works", ar: "أعمال جسر السلام" },
    { en: "Green Valley Housing Project", ar: "مشروع إسكان الوادي الأخضر" },
    { en: "Al-Fanar Mall Renovation", ar: "تجديد مول الفنار" },
    { en: "Coastal Road Extension", ar: "امتداد الطريق الساحلي" },
    { en: "Al-Waha Residential Complex", ar: "مجمع الواحة السكني" },
    { en: "University Campus Expansion", ar: "توسعة الحرم الجامعي" },
    { en: "Al-Manar Tower Demolition", ar: "هدم برج المنار" },
    { en: "Riverside Logistics Park", ar: "المنتزه اللوجستي على الضفة" },
  ];

  // status plan for 15 requests
  type Plan = "PENDING" | "CLASSIFIED" | "ASSIGNED" | "IN_TRANSIT" | "AT_RECYCLING_CENTER" | "COMPLETED";
  const plan: Plan[] = [
    "PENDING", "PENDING",
    "CLASSIFIED", "CLASSIFIED",
    "ASSIGNED", "ASSIGNED", "ASSIGNED",
    "IN_TRANSIT", "IN_TRANSIT", "IN_TRANSIT",
    "AT_RECYCLING_CENTER", "AT_RECYCLING_CENTER",
    "COMPLETED", "COMPLETED", "COMPLETED",
  ];

  let manifestCounter = 1000;
  let flaggedAssigned = false;
  const createdShipments: { id: string; status: string }[] = [];

  for (let i = 0; i < projectNames.length; i++) {
    const contractor = contractors[i % contractors.length];
    const cityKey = contractor.cityKey as keyof typeof CITIES;
    const center = CITIES[cityKey];
    const pickup = jitter(center, 10);
    const proj = projectNames[i];
    const status = plan[i];
    const wt = wasteTypes[i % wasteTypes.length];

    const request = await prisma.wasteRequest.create({
      data: {
        contractorId: contractor.id,
        projectName: proj.en,
        projectNameAr: proj.ar,
        city: center.nameAr,
        address: `${center.nameAr}, حي ${["النرجس", "الملقا", "العليا", "الروضة", "السلام"][i % 5]}, شارع رقم ${(i % 20) + 1}`,
        lat: pickup.lat,
        lng: pickup.lng,
        description:
          i % 2 === 0
            ? "مخلفات ناتجة عن أعمال هدم وإعادة بناء تشمل خرسانة وحديد وطوب."
            : "Debris from demolition and renovation works including concrete, steel and bricks.",
        status: status === "PENDING" ? "PENDING" : status === "CLASSIFIED" ? "CLASSIFIED" : "IN_PROGRESS",
        createdAt: new Date(Date.now() - (15 - i) * 1000 * 60 * 60 * 8),
      },
    });

    // images (placeholder seeds, rendered client-side as generated thumbnails)
    for (let imgI = 0; imgI < 3; imgI++) {
      await prisma.wasteImage.create({
        data: {
          wasteRequestId: request.id,
          url: `seed:${wt.en.toLowerCase().replace(/[^a-z]+/g, "-")}-${imgI}`,
        },
      });
    }

    if (status === "PENDING") continue;

    const estimatedWeight = Math.round((6 + Math.random() * 30) * 10) / 10;
    const confidence = 82 + Math.floor(Math.random() * 16);
    await prisma.aIClassification.create({
      data: {
        wasteRequestId: request.id,
        wasteType: wt.en,
        wasteTypeAr: wt.ar,
        confidence,
        estimatedWeight,
        recyclable: wt.recyclable,
        recommendations: JSON.stringify([
          "Route to nearest licensed recycling facility for crushing/reprocessing.",
          "Segregate from mixed loads to improve recovery rate.",
        ]),
        modelVersion: "eco-mock-classifier-v1 (simulated — not a production CV model)",
      },
    });

    if (status === "CLASSIFIED") continue;

    // Pick carrier + facility in same city cluster (simulating optimization result)
    const cityCarriers = carriers.filter((c) => c.cityKey === cityKey);
    const cityFacilities = facilities.filter((f) => f.cityKey === cityKey);
    const carrier = (cityCarriers[0] ?? carriers[0]);
    const facility =
      cityFacilities.find((f) => f.types.includes(wt.en)) ?? cityFacilities[0] ?? facilities[0];
    const cityTrucks = trucks.filter((t) => t.cityKey === carrier.cityKey);
    const truck = cityTrucks[i % Math.max(1, cityTrucks.length)] ?? trucks[0];

    const dest: GeoPoint = { lat: facility.lat, lng: facility.lng };
    const route = buildSyntheticRoute(pickup, dest, 14);
    const distanceKm = Math.round(haversineKm(pickup, dest) * 10) / 10;
    const estimatedCostSar = Math.round(distanceKm * carrier.pricePerKm + estimatedWeight * 12);
    const etaMinutes = Math.max(15, Math.round((distanceKm / 55) * 60));

    let progressPct = 0;
    let shipmentStatus = "ASSIGNED";
    if (status === "ASSIGNED") { progressPct = 0; shipmentStatus = "ASSIGNED"; }
    if (status === "IN_TRANSIT") { progressPct = 25 + Math.random() * 45; shipmentStatus = "IN_TRANSIT"; }
    if (status === "AT_RECYCLING_CENTER") { progressPct = 100; shipmentStatus = "AT_RECYCLING_CENTER"; }
    if (status === "COMPLETED") { progressPct = 100; shipmentStatus = "COMPLETED"; }

    const shouldFlag = status === "IN_TRANSIT" && !flaggedAssigned;
    if (shouldFlag) flaggedAssigned = true;

    const currentPointIdx = Math.min(route.length - 1, Math.floor((progressPct / 100) * (route.length - 1)));
    const currentPoint = route[currentPointIdx];

    const now = new Date();
    const departureTime = new Date(now.getTime() - 1000 * 60 * 60 * (2 + i));

    const shipment = await prisma.shipment.create({
      data: {
        wasteRequestId: request.id,
        carrierId: carrier.id,
        driverId: truck.driverId,
        truckId: truck.id,
        recyclingCenterId: facility.id,
        status: shouldFlag ? "FLAGGED" : shipmentStatus,
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        destLat: dest.lat,
        destLng: dest.lng,
        currentLat: currentPoint.lat,
        currentLng: currentPoint.lng,
        routeJson: JSON.stringify(route),
        distanceKm,
        estimatedCostSar,
        etaMinutes,
        speedKph: status === "IN_TRANSIT" ? 45 + Math.round(Math.random() * 30) : 0,
        progressPct: Math.round(progressPct * 10) / 10,
        departureTime: status === "ASSIGNED" ? null : departureTime,
        arrivalTime: status === "COMPLETED" || status === "AT_RECYCLING_CENTER" ? new Date(departureTime.getTime() + etaMinutes * 60000) : null,
        lastGpsUpdate: status === "ASSIGNED" ? null : now,
        flagged: shouldFlag,
        flagReason: shouldFlag ? "Truck deviated more than 2km from the recommended route." : null,
      },
    });

    createdShipments.push({ id: shipment.id, status: shipment.status });

    if (truck.id) {
      await prisma.truck.update({
        where: { id: truck.id },
        data: { status: status === "ASSIGNED" || status === "IN_TRANSIT" ? "ON_TRIP" : "AVAILABLE" },
      });
    }

    // Shipment timeline events
    const stageCutoff: Record<Plan, number> = {
      PENDING: 0,
      CLASSIFIED: 0,
      ASSIGNED: 2,
      IN_TRANSIT: 5,
      AT_RECYCLING_CENTER: 7,
      COMPLETED: 9,
    };
    const cutoff = stageCutoff[status];
    for (let s = 0; s < cutoff; s++) {
      const stage = SHIPMENT_STAGES[s];
      await prisma.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          stage: stage.en,
          stageAr: stage.ar,
          timestamp: new Date(departureTime.getTime() + s * 12 * 60000),
        },
      });
    }

    // GPS history for moving/arrived shipments
    if (status === "IN_TRANSIT" || status === "AT_RECYCLING_CENTER" || status === "COMPLETED") {
      const pointsToLog = Math.max(2, Math.floor((progressPct / 100) * 10));
      for (let p = 0; p <= pointsToLog; p++) {
        const f = (p / 10) * (progressPct / 100) * 10;
        const idx = Math.min(route.length - 1, Math.floor((p / pointsToLog) * currentPointIdx));
        const pt = route[idx];
        await prisma.gPSPoint.create({
          data: {
            shipmentId: shipment.id,
            latitude: pt.lat,
            longitude: pt.lng,
            speed: 40 + Math.round(Math.random() * 35),
            status: shipment.status,
            timestamp: new Date(departureTime.getTime() + p * 6 * 60000),
          },
        });
      }
    }

    // Digital manifest (PENDING/CLASSIFIED already `continue`d above)
    {
      manifestCounter++;
      await prisma.digitalManifest.create({
        data: {
          shipmentId: shipment.id,
          manifestNumber: `EB-MF-${manifestCounter}`,
          verified: status === "COMPLETED",
          qrData: `ECO-BUILD|MANIFEST|${shipment.id}|${request.id}`,
          closedAt: status === "COMPLETED" ? new Date(departureTime.getTime() + etaMinutes * 60000 + 3600000) : null,
        },
      });
    }

    // Recycled material record once received
    if (status === "AT_RECYCLING_CENTER" || status === "COMPLETED") {
      await prisma.recycledMaterial.create({
        data: {
          recyclingCenterId: facility.id,
          materialType: wt.en,
          quantityTons: estimatedWeight,
          receivedAt: new Date(departureTime.getTime() + etaMinutes * 60000),
        },
      });
    }
  }

  // ---- Alerts (regulatory demo scenarios) -------------------------------------
  const flaggedShipment = createdShipments.find((s) => s.status === "FLAGGED");
  const inTransitShipments = createdShipments.filter((s) => s.status === "IN_TRANSIT");
  const completedShipments = createdShipments.filter((s) => s.status === "COMPLETED");

  const alertsData = [
    flaggedShipment && {
      type: "ROUTE_DEVIATION",
      severity: "WARNING",
      shipmentId: flaggedShipment.id,
      message: "Truck deviated from the recommended route by more than 2 km.",
      messageAr: "انحرفت الشاحنة عن المسار الموصى به بأكثر من 2 كم.",
    },
    inTransitShipments[0] && {
      type: "DELAYED_ARRIVAL",
      severity: "WARNING",
      shipmentId: inTransitShipments[0].id,
      message: "Shipment has not reached the recycling facility within the estimated time.",
      messageAr: "لم تصل الشحنة إلى مركز إعادة التدوير خلال الوقت المقدر.",
    },
    inTransitShipments[1] && {
      type: "GPS_SIGNAL_LOST",
      severity: "CRITICAL",
      shipmentId: inTransitShipments[1].id,
      message: "GPS signal lost for more than 15 minutes.",
      messageAr: "انقطعت إشارة تحديد الموقع لأكثر من 15 دقيقة.",
    },
    {
      type: "ILLEGAL_DUMPING_RISK",
      severity: "CRITICAL",
      shipmentId: null,
      message: "Unregistered dumping activity detected near Al-Kharj road, outside any licensed facility.",
      messageAr: "تم رصد نشاط تفريغ غير مسجل بالقرب من طريق الخرج، خارج أي منشأة مرخصة.",
    },
    completedShipments[0] && {
      type: "SHIPMENT_COMPLETED",
      severity: "INFO",
      shipmentId: completedShipments[0].id,
      message: "Shipment successfully completed and manifest verified.",
      messageAr: "تم إكمال الشحنة بنجاح والتحقق من البيان الرقمي.",
      resolved: true,
    },
    completedShipments[1] && {
      type: "SHIPMENT_COMPLETED",
      severity: "INFO",
      shipmentId: completedShipments[1].id,
      message: "Shipment successfully completed and manifest verified.",
      messageAr: "تم إكمال الشحنة بنجاح والتحقق من البيان الرقمي.",
      resolved: true,
    },
  ].filter(Boolean) as any[];

  for (const a of alertsData) {
    await prisma.alert.create({ data: a });
  }

  // ---- Marketplace products --------------------------------------------------
  const productCatalog = [
    { name: "Recycled Concrete Aggregate", nameAr: "ركام خرساني معاد تدويره", type: "Concrete", price: 45 },
    { name: "Recycled Coarse Gravel", nameAr: "حصى خشن معاد تدويره", type: "Gravel", price: 38 },
    { name: "Recycled Road Base Aggregate", nameAr: "ركام قاعدة طرق معاد تدويره", type: "Aggregate", price: 42 },
    { name: "Crushed Asphalt Millings", nameAr: "إسفلت مطحون معاد استخدامه", type: "Asphalt", price: 35 },
    { name: "Recycled Sand Fill", nameAr: "رمل ردم معاد تدويره", type: "Sand", price: 28 },
    { name: "Reclaimed Brick Blocks", nameAr: "طوب مستصلح", type: "Bricks", price: 55 },
  ];

  for (const facility of facilities) {
    for (let p = 0; p < 3; p++) {
      const item = productCatalog[(facilities.indexOf(facility) * 3 + p) % productCatalog.length];
      const qty = Math.round(50 + Math.random() * 450);
      await prisma.marketplaceProduct.create({
        data: {
          recyclingCenterId: facility.id,
          name: item.name,
          nameAr: item.nameAr,
          materialType: item.type,
          description: `High-quality ${item.name.toLowerCase()} sourced from certified construction & demolition waste processing.`,
          descriptionAr: `${item.nameAr} عالي الجودة، مصدره معالجة مخلفات بناء وهدم معتمدة.`,
          price: item.price + Math.round(Math.random() * 10),
          unit: "طن",
          quantityAvailable: qty,
          location: facility.city,
          imageSeed: item.type.toLowerCase(),
          status: qty > 20 ? "ACTIVE" : "OUT_OF_STOCK",
        },
      });
    }
  }

  // ---- A demo order for the primary contractor --------------------------------
  const demoProducts = await prisma.marketplaceProduct.findMany({ take: 2 });
  if (demoProducts.length) {
    const total = demoProducts.reduce((sum, p) => sum + p.price * 5, 0);
    const order = await prisma.order.create({
      data: {
        contractorId: contractors[0].id,
        status: "COMPLETED",
        totalAmount: total,
        deliveryCity: contractors[0].city,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
    });
    for (const p of demoProducts) {
      await prisma.orderItem.create({
        data: { orderId: order.id, productId: p.id, quantity: 5, unitPrice: p.price },
      });
    }
  }

  console.log("Seed complete.");
  console.log("Demo accounts (password: demo1234):");
  console.log(" - contractor@ecobuild.demo");
  console.log(" - carrier@ecobuild.demo");
  console.log(" - recycler@ecobuild.demo");
  console.log(" - authority@ecobuild.demo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
