import { createContext, useContext, useState, useCallback, ReactNode } from "react";

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
  /** For landing page: live positions of approved suppliers (no mock data) */
  liveSuppliersForMap: LiveSupplierPosition[];
}

const SuppliersContext = createContext<SuppliersContextValue | null>(null);

export function SuppliersProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<SupplierApplication[]>([]);
  const [livePositions, setLivePositions] = useState<LiveSupplierPosition[]>([]);

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

  // Public map: only show real live positions (no mock data)
  const liveSuppliersForMap = livePositions;

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
