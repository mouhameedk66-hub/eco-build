import { Truck as TruckIcon, MapPin, Recycle, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MapPoint {
  lat: number;
  lng: number;
}

export interface MapMarker extends MapPoint {
  id: string;
  type: "pickup" | "facility" | "truck" | "carrier" | "flagged";
  label?: string;
  sub?: string;
}

const PADDING_RATIO = 0.18;

function computeBounds(points: MapPoint[]) {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  let minLat = Math.min(...lats);
  let maxLat = Math.max(...lats);
  let minLng = Math.min(...lngs);
  let maxLng = Math.max(...lngs);

  const latSpan = Math.max(maxLat - minLat, 0.01);
  const lngSpan = Math.max(maxLng - minLng, 0.01);
  minLat -= latSpan * PADDING_RATIO;
  maxLat += latSpan * PADDING_RATIO;
  minLng -= lngSpan * PADDING_RATIO;
  maxLng += lngSpan * PADDING_RATIO;

  return { minLat, maxLat, minLng, maxLng };
}

export function RouteMap({
  route = [],
  markers = [],
  height = 420,
  className,
}: {
  route?: MapPoint[];
  markers?: MapMarker[];
  height?: number;
  className?: string;
}) {
  const allPoints = [...route, ...markers];
  if (allPoints.length === 0) {
    return (
      <div className={cn("flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground", className)} style={{ height }}>
        No map data
      </div>
    );
  }

  const width = 800;
  const { minLat, maxLat, minLng, maxLng } = computeBounds(allPoints);

  const project = (p: MapPoint) => {
    const x = ((p.lng - minLng) / (maxLng - minLng)) * width;
    const y = ((maxLat - p.lat) / (maxLat - minLat)) * height;
    return { x, y };
  };

  const routePoints = route.map(project);
  const pathD = routePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border bg-[#eef4f0]", className)} style={{ height }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="mapGrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="hsl(var(--primary) / 0.08)" strokeWidth="1" />
          </pattern>
          <linearGradient id="routeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="#f2b807" />
          </linearGradient>
        </defs>
        <rect width={width} height={height} fill="url(#mapGrid)" />

        {routePoints.length > 1 && (
          <>
            <path d={pathD} fill="none" stroke="white" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
            <path d={pathD} fill="none" stroke="url(#routeGradient)" strokeWidth={3.5} strokeDasharray="1 10" strokeLinecap="round" />
          </>
        )}

        {markers.map((m) => {
          const { x, y } = project(m);
          if (m.type === "truck") {
            return (
              <g key={m.id} transform={`translate(${x}, ${y})`}>
                <circle r="14" fill="hsl(var(--primary) / 0.25)" className="animate-pulse-ring origin-center" />
                <circle r="10" fill="hsl(var(--primary))" stroke="white" strokeWidth="2.5" />
                <foreignObject x={-6} y={-6} width={12} height={12}>
                  <TruckIcon className="h-3 w-3 text-white" />
                </foreignObject>
                {m.label && (
                  <text x="0" y="-20" textAnchor="middle" fontSize="11" fontWeight={700} fill="hsl(var(--foreground))">
                    {m.label}
                  </text>
                )}
              </g>
            );
          }
          if (m.type === "flagged") {
            return (
              <g key={m.id} transform={`translate(${x}, ${y})`}>
                <circle r="12" fill="#ef4444" stroke="white" strokeWidth="2.5" />
                <text x="0" y="4" textAnchor="middle" fontSize="12" fontWeight={800} fill="white">!</text>
              </g>
            );
          }
          const Icon = m.type === "facility" ? Recycle : m.type === "carrier" ? Building2 : MapPin;
          const fill = m.type === "facility" ? "#7c3aed" : m.type === "carrier" ? "#0ea5e9" : "#16a34a";
          return (
            <g key={m.id} transform={`translate(${x}, ${y})`}>
              <path
                d="M0 -22 C 8 -22 14 -16 14 -8 C 14 2 0 16 0 16 C 0 16 -14 2 -14 -8 C -14 -16 -8 -22 0 -22 Z"
                fill={fill}
                stroke="white"
                strokeWidth="1.5"
              />
              <foreignObject x={-6} y={-16} width={12} height={12}>
                <Icon className="h-3 w-3 text-white" />
              </foreignObject>
              {m.label && (
                <text x="0" y="30" textAnchor="middle" fontSize="10.5" fontWeight={600} fill="hsl(var(--foreground))">
                  {m.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
