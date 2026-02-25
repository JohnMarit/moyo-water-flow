import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { JUBA_CENTER, isValidLatLng } from "@/lib/map-utils";
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

// Keep map focused on Juba, South Sudan and prevent panning/zooming far away
const JUBA_BOUNDS = L.latLngBounds(
  [JUBA_CENTER[0] - 0.1, JUBA_CENTER[1] - 0.15],
  [JUBA_CENTER[0] + 0.1, JUBA_CENTER[1] + 0.15]
);

export interface LiveSupplierMarker {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  vehiclePlate?: string;
}

interface LiveMapProps {
  /** Demand points to show (supplier view) */
  demandPoints?: DemandPoint[];
  /** Household's own position (user view) */
  householdPosition?: { lat: number; lng: number } | null;
  /** Supplier's position when en route (user view) */
  supplierPosition?: { lat: number; lng: number } | null;
  /** Multiple live supplier positions (e.g. landing map: approved tankers moving) */
  liveSuppliers?: LiveSupplierMarker[];
  /** Show only a preview (e.g. landing) with optional live supplier markers */
  preview?: boolean;
  className?: string;
  height?: string;
}

function FitBounds({
  demandPoints,
  householdPosition,
  supplierPosition,
  liveSuppliers,
}: {
  demandPoints?: DemandPoint[];
  householdPosition?: { lat: number; lng: number } | null;
  supplierPosition?: { lat: number; lng: number } | null;
  liveSuppliers?: LiveSupplierMarker[];
}) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [];
    demandPoints?.forEach((d) => {
      if (isValidLatLng(d)) points.push([d.lat, d.lng]);
    });
    if (isValidLatLng(householdPosition)) points.push([householdPosition.lat, householdPosition.lng]);
    if (isValidLatLng(supplierPosition)) points.push([supplierPosition.lat, supplierPosition.lng]);
    liveSuppliers?.forEach((s) => points.push([s.lat, s.lng]));
    if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
    }
  }, [map, demandPoints, householdPosition, supplierPosition, liveSuppliers]);
  return null;
}

export default function LiveMap({
  demandPoints = [],
  householdPosition = null,
  supplierPosition = null,
  liveSuppliers = [],
  preview = false,
  className = "",
  height = "min-h-[280px]",
}: LiveMapProps) {
  const showLiveSuppliers = preview ? liveSuppliers : [];
  const hasAnyMarkers =
    demandPoints.some(isValidLatLng) ||
    isValidLatLng(householdPosition) ||
    isValidLatLng(supplierPosition) ||
    showLiveSuppliers.length > 0;

  return (
    <div className={`relative rounded-2xl overflow-hidden glass-card ${height} ${className}`}>
      <MapContainer
        center={JUBA_CENTER}
        zoom={12}
        minZoom={12}
        maxZoom={17}
        maxBounds={JUBA_BOUNDS}
        maxBoundsViscosity={1.0}
        className="w-full h-full min-h-[280px] z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!preview && isValidLatLng(householdPosition) && (
          <Marker
            position={[householdPosition.lat, householdPosition.lng]}
            icon={householdIcon}
          >
            <Popup>Your location (water request)</Popup>
          </Marker>
        )}
        {!preview && isValidLatLng(supplierPosition) && (
          <Marker
            position={[supplierPosition.lat, supplierPosition.lng]}
            icon={supplierIcon}
          >
            <Popup>Supplier en route</Popup>
          </Marker>
        )}
        {showLiveSuppliers.length > 0 &&
          showLiveSuppliers.map((s) => (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={supplierIcon}
            >
              <Popup>
                <strong>Water tanker</strong>
                {s.name && <><br />{s.name}</>}
                {s.vehiclePlate && <><br />Plate: {s.vehiclePlate}</>}
              </Popup>
            </Marker>
          ))}
        {!preview && demandPoints.length > 0 &&
          demandPoints.filter(isValidLatLng).map((d) => (
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
        {!preview && hasAnyMarkers && (
          <FitBounds
            demandPoints={demandPoints}
            householdPosition={householdPosition}
            supplierPosition={supplierPosition}
            liveSuppliers={showLiveSuppliers.length > 0 ? showLiveSuppliers : undefined}
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
