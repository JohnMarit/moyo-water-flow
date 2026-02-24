import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface DemandPoint {
  id: string;
  lat: number;
  lng: number;
  area: string;
  requests: number;
  urgency: "low" | "medium" | "high";
  distance: string;
  status: "pending" | "on_the_way" | "supplied";
}

interface DemandState {
  demands: DemandPoint[];
  /** Current supplier location when en route (for household to see) */
  supplierLocation: { lat: number; lng: number } | null;
  /** Demand id the supplier is heading to */
  supplierEnRouteTo: string | null;
  /** Current user's request id (household) */
  myRequestId: string | null;
}

interface DemandContextValue extends DemandState {
  addDemand: (point: Omit<DemandPoint, "id" | "distance" | "requests" | "status">) => string;
  updateDemandStatus: (id: string, status: DemandPoint["status"]) => void;
  setSupplierLocation: (loc: { lat: number; lng: number } | null) => void;
  setSupplierEnRouteTo: (id: string | null) => void;
  setMyRequestId: (id: string | null) => void;
}

const DemandContext = createContext<DemandContextValue | null>(null);

const initialDemands: DemandPoint[] = [
  { id: "1", lat: 4.848, lng: 31.598, area: "Gudele Block 7", requests: 12, urgency: "high", distance: "2.3 km", status: "pending" },
  { id: "2", lat: 4.862, lng: 31.592, area: "Munuki West", requests: 8, urgency: "medium", distance: "3.1 km", status: "pending" },
  { id: "3", lat: 4.855, lng: 31.618, area: "Kator Market Area", requests: 15, urgency: "high", distance: "1.8 km", status: "pending" },
  { id: "4", lat: 4.838, lng: 31.632, area: "Jebel Kujur", requests: 5, urgency: "low", distance: "5.4 km", status: "pending" },
  { id: "5", lat: 4.872, lng: 31.605, area: "Hai Referendum", requests: 9, urgency: "medium", distance: "4.0 km", status: "pending" },
];

export function DemandProvider({ children }: { children: ReactNode }) {
  const [demands, setDemands] = useState<DemandPoint[]>(initialDemands);
  const [supplierLocation, setSupplierLocationState] = useState<{ lat: number; lng: number } | null>(null);
  const [supplierEnRouteTo, setSupplierEnRouteToState] = useState<string | null>(null);
  const [myRequestId, setMyRequestIdState] = useState<string | null>(null);

  const addDemand = useCallback((point: Omit<DemandPoint, "id" | "distance" | "requests" | "status">) => {
    const id = `live-${Date.now()}`;
    const newDemand: DemandPoint = {
      ...point,
      id,
      requests: 1,
      distance: "—",
      status: "pending",
    };
    setDemands((prev) => [newDemand, ...prev]);
    return id;
  }, []);

  const updateDemandStatus = useCallback((id: string, status: DemandPoint["status"]) => {
    setDemands((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
  }, []);

  const setSupplierLocation = useCallback((loc: { lat: number; lng: number } | null) => {
    setSupplierLocationState(loc);
  }, []);

  const setSupplierEnRouteTo = useCallback((id: string | null) => {
    setSupplierEnRouteToState(id);
  }, []);

  const setMyRequestId = useCallback((id: string | null) => {
    setMyRequestIdState(id);
  }, []);

  return (
    <DemandContext.Provider
      value={{
        demands,
        supplierLocation,
        supplierEnRouteTo,
        myRequestId,
        addDemand,
        updateDemandStatus,
        setSupplierLocation,
        setSupplierEnRouteTo,
        setMyRequestId,
      }}
    >
      {children}
    </DemandContext.Provider>
  );
}

export function useDemand() {
  const ctx = useContext(DemandContext);
  if (!ctx) throw new Error("useDemand must be used within DemandProvider");
  return ctx;
}
