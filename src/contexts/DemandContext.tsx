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

export function DemandProvider({ children }: { children: ReactNode }) {
  const [demands, setDemands] = useState<DemandPoint[]>([]);
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
