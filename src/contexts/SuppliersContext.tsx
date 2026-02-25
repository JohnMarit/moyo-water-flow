import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { JUBA_CENTER } from "@/lib/map-utils";

export interface SupplierApplication {
  id: string;
  /** Firebase UID or email when no Firebase */
  userId: string;
  name: string;
  nationalId: string;
  vehiclePlate: string;
  email: string;
  /** Evidence: photo of tanker with number plate visible (data URL or storage URL) */
  tankerPhotoUrl: string;
  status: "pending" | "approved" | "suspended";
  createdAt: number;
}

export interface LiveSupplierPosition {
  supplierId: string;
  name: string;
  vehiclePlate: string;
  lat: number;
  lng: number;
  updatedAt: number;
}

interface SuppliersState {
  applications: SupplierApplication[];
  /** Only approved suppliers who are "active" (e.g. logged in and sharing location) appear here */
  livePositions: LiveSupplierPosition[];
}

interface SuppliersContextValue extends SuppliersState {
  addApplication: (app: Omit<SupplierApplication, "id" | "status" | "createdAt">) => string;
  updateApplicationStatus: (id: string, status: "approved" | "suspended") => void;
  setSupplierLivePosition: (supplierId: string, name: string, vehiclePlate: string, lat: number, lng: number) => void;
  clearSupplierLivePosition: (supplierId: string) => void;
  getApplicationByUserId: (userId: string) => SupplierApplication | undefined;
  /** For landing page: simulated live movement of approved suppliers (when no real positions yet) */
  liveSuppliersForMap: LiveSupplierPosition[];
}

const SuppliersContext = createContext<SuppliersContextValue | null>(null);

/** Seed a few approved suppliers with simulated positions so the landing map shows movement (builds trust; South Sudan users value visibility). */
function seedMockLivePositions(): LiveSupplierPosition[] {
  const now = Date.now();
  return [
    { supplierId: "seed-1", name: "James Deng", vehiclePlate: "SS-1234", lat: JUBA_CENTER[0] + 0.02, lng: JUBA_CENTER[1] - 0.01, updatedAt: now },
    { supplierId: "seed-2", name: "Mary Achol", vehiclePlate: "SS-5678", lat: JUBA_CENTER[0] - 0.015, lng: JUBA_CENTER[1] + 0.02, updatedAt: now },
    { supplierId: "seed-3", name: "Peter Kuol", vehiclePlate: "SS-9012", lat: JUBA_CENTER[0] + 0.01, lng: JUBA_CENTER[1] + 0.015, updatedAt: now },
  ];
}

/** Slight random drift to simulate movement */
function driftPosition(pos: LiveSupplierPosition): LiveSupplierPosition {
  const d = 0.002;
  return {
    ...pos,
    lat: pos.lat + (Math.random() - 0.5) * d,
    lng: pos.lng + (Math.random() - 0.5) * d,
    updatedAt: Date.now(),
  };
}

export function SuppliersProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<SupplierApplication[]>(() => {
    // Mock pending/approved for admin and landing
    const t = Date.now() - 86400 * 2;
    return [
      { id: "1", userId: "u1", name: "James Deng", nationalId: "SS-N-001", vehiclePlate: "SS-1234", email: "james@mail.com", tankerPhotoUrl: "", status: "approved", createdAt: t },
      { id: "2", userId: "u2", name: "Mary Achol", nationalId: "SS-N-002", vehiclePlate: "SS-5678", email: "mary@mail.com", tankerPhotoUrl: "", status: "approved", createdAt: t },
      { id: "3", userId: "u3", name: "Peter Kuol", nationalId: "SS-N-003", vehiclePlate: "SS-9012", email: "peter@mail.com", tankerPhotoUrl: "", status: "pending", createdAt: t },
      { id: "4", userId: "u4", name: "Grace Akuei", nationalId: "SS-N-004", vehiclePlate: "SS-3456", email: "grace@mail.com", tankerPhotoUrl: "", status: "approved", createdAt: t },
      { id: "5", userId: "u5", name: "John Mayen", nationalId: "SS-N-005", vehiclePlate: "SS-7890", email: "john@mail.com", tankerPhotoUrl: "", status: "suspended", createdAt: t },
    ];
  });
  const [livePositions, setLivePositions] = useState<LiveSupplierPosition[]>([]);
  const [simulatedPositions, setSimulatedPositions] = useState<LiveSupplierPosition[]>(seedMockLivePositions);

  // Simulate live movement on landing (every 3s) so users see tankers moving — builds trust and motivates requests
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedPositions((prev) => prev.map(driftPosition));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const addApplication = useCallback((app: Omit<SupplierApplication, "id" | "status" | "createdAt">) => {
    const id = `app-${Date.now()}`;
    const newApp: SupplierApplication = {
      ...app,
      id,
      status: "pending",
      createdAt: Date.now(),
    };
    setApplications((prev) => [newApp, ...prev]);
    return id;
  }, []);

  const updateApplicationStatus = useCallback((id: string, status: "approved" | "suspended") => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  }, []);

  const setSupplierLivePosition = useCallback((supplierId: string, name: string, vehiclePlate: string, lat: number, lng: number) => {
    const pos: LiveSupplierPosition = { supplierId, name, vehiclePlate, lat, lng, updatedAt: Date.now() };
    setLivePositions((prev) => {
      const rest = prev.filter((p) => p.supplierId !== supplierId);
      return [...rest, pos];
    });
  }, []);

  const clearSupplierLivePosition = useCallback((supplierId: string) => {
    setLivePositions((prev) => prev.filter((p) => p.supplierId !== supplierId));
  }, []);

  const getApplicationByUserId = useCallback((userId: string) => {
    return applications.find((a) => a.userId === userId);
  }, [applications]);

  // Public map: show real live positions if any, otherwise simulated (so landing always shows movement)
  const liveSuppliersForMap = livePositions.length > 0 ? livePositions : simulatedPositions;

  const value: SuppliersContextValue = {
    applications,
    livePositions,
    addApplication,
    updateApplicationStatus,
    setSupplierLivePosition,
    clearSupplierLivePosition,
    getApplicationByUserId,
    liveSuppliersForMap,
  };

  return (
    <SuppliersContext.Provider value={value}>
      {children}
    </SuppliersContext.Provider>
  );
}

export function useSuppliers() {
  const ctx = useContext(SuppliersContext);
  if (!ctx) throw new Error("useSuppliers must be used within SuppliersProvider");
  return ctx;
}
