import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { JUBA_CENTER } from "@/lib/map-utils";
import type { DemandPoint } from "@/contexts/DemandContext";

// Fix default marker icons in Leaflet with Vite
const createIcon = (color: string, iconLabel?: string) =>
  L.divIcon({
    className: "custom-marker",
    html: iconLabel
      ? `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:bold">${iconLabel}</div>`
      : `<div style="background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const householdIcon = createIcon("#3892dc"); // blue - water drop style
const supplierIcon = createIcon("#22c55e", "S"); // green - supplier
const demandIcon = (urgency: DemandPoint["urgency"]) =>
  createIcon(
    urgency === "high" ? "#ef4444" : urgency === "medium" ? "#eab308" : "#3b82f6",
    "!"
  );

interface LiveMapProps {
  /** Demand points to show (supplier view) */
  demandPoints?: DemandPoint[];
  /** Household's own position (user view) */
  householdPosition?: { lat: number; lng: number } | null;
  /** Supplier's position when en route (user view) */
  supplierPosition?: { lat: number; lng: number } | null;
  /** Show only a preview (e.g. landing) with no markers */
  preview?: boolean;
  className?: string;
  height?: string;
}

function FitBounds({ demandPoints, householdPosition, supplierPosition }: {
  demandPoints?: DemandPoint[];
  householdPosition?: { lat: number; lng: number } | null;
  supplierPosition?: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [];
    demandPoints?.forEach((d) => points.push([d.lat, d.lng]));
    if (householdPosition) points.push([householdPosition.lat, householdPosition.lng]);
    if (supplierPosition) points.push([supplierPosition.lat, supplierPosition.lng]);
    if (points.length > 1) {
      map.fitBounds(points as [number, number][], { padding: [40, 40], maxZoom: 14 });
    }
  }, [map, demandPoints, householdPosition, supplierPosition]);
  return null;
}

export default function LiveMap({
  demandPoints = [],
  householdPosition = null,
  supplierPosition = null,
  preview = false,
  className = "",
  height = "min-h-[280px]",
}: LiveMapProps) {
  return (
    <div className={`relative rounded-2xl overflow-hidden glass-card ${height} ${className}`}>
      <MapContainer
        center={JUBA_CENTER}
        zoom={12}
        className="w-full h-full min-h-[280px] z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!preview && householdPosition && (
          <Marker
            position={[householdPosition.lat, householdPosition.lng]}
            icon={householdIcon}
          >
            <Popup>Your location (water request)</Popup>
          </Marker>
        )}
        {!preview && supplierPosition && (
          <Marker
            position={[supplierPosition.lat, supplierPosition.lng]}
            icon={supplierIcon}
          >
            <Popup>Supplier en route</Popup>
          </Marker>
        )}
        {!preview && demandPoints.length > 0 &&
          demandPoints.map((d) => (
            <Marker
              key={d.id}
              position={[d.lat, d.lng]}
              icon={demandIcon(d.urgency)}
            >
              <Popup>
                <strong>{d.area}</strong>
                <br />
                {d.requests} request(s) · {d.urgency}
              </Popup>
            </Marker>
          ))}
        {!preview && (demandPoints.length > 0 || householdPosition || supplierPosition) && (
          <FitBounds
            demandPoints={demandPoints}
            householdPosition={householdPosition}
            supplierPosition={supplierPosition}
          />
        )}
      </MapContainer>
      <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-2 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-moyo-glow animate-glow-pulse" />
        <span className="text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
          Live map — Juba, South Sudan
        </span>
      </div>
    </div>
  );
}
