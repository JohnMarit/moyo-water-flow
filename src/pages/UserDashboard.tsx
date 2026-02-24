import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Droplets, MapPin, Clock, CheckCircle2, Truck, LogOut, AlertTriangle, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LiveMap from "@/components/LiveMap";
import { useDemand } from "@/contexts/DemandContext";
import { useAuth } from "@/contexts/AuthContext";
import { distanceKm, formatDistance, isValidLatLng, JUBA_CENTER } from "@/lib/map-utils";
import { useToast } from "@/hooks/use-toast";

type RequestStatus = "idle" | "pending" | "on_the_way" | "supplied";
type Urgency = "low" | "medium" | "high";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { signOut: authSignOut } = useAuth();
  const { toast } = useToast();
  const {
    addDemand,
    updateDemandStatus,
    setMyRequestId,
    setSupplierLocation,
    setSupplierEnRouteTo,
    supplierLocation,
    supplierEnRouteTo,
    myRequestId,
    demands,
  } = useDemand();

  const [status, setStatus] = useState<RequestStatus>("idle");
  const [urgency, setUrgency] = useState<Urgency>("medium");
  const [liters, setLiters] = useState("200");
  const [phoneNum, setPhoneNum] = useState("");
  const [showForm, setShowForm] = useState(false);
  /** User's GPS position (pinned when requesting) */
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(false);

  const myDemand = myRequestId ? demands.find((d) => d.id === myRequestId) : null;
  const householdPosRaw = userPosition ?? (myDemand ? { lat: myDemand.lat, lng: myDemand.lng } : null);
  const householdPos = isValidLatLng(householdPosRaw) ? householdPosRaw : null;
  const isSupplierComingToMe = status === "on_the_way" && myRequestId === supplierEnRouteTo;
  /** Local state for animating supplier position toward household */
  const [displaySupplierPos, setDisplaySupplierPos] = useState<{ lat: number; lng: number } | null>(null);
  const supplierPosRaw = isSupplierComingToMe ? (displaySupplierPos ?? supplierLocation) : null;
  const supplierPos = isValidLatLng(supplierPosRaw) ? supplierPosRaw : null;
  const distanceToSupplier =
    householdPos && supplierPos ? distanceKm(householdPos.lat, householdPos.lng, supplierPos.lat, supplierPos.lng) : null;

  // Request GPS when form is shown
  const requestLocation = useCallback(() => {
    setGpsError(false);
    setGpsLoading(true);
    if (!navigator.geolocation) {
      setGpsLoading(false);
      setGpsError(true);
      toast({ title: "GPS not supported", description: "Using default location for Juba." });
      setUserPosition(JUBA_CENTER);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
        toast({ title: "Location pinned", description: "Suppliers will see your exact location." });
      },
      () => {
        setGpsLoading(false);
        setGpsError(true);
        toast({ title: "Location denied", description: "Using Juba center. Enable GPS for accurate delivery." });
        setUserPosition(JUBA_CENTER);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [toast]);

  useEffect(() => {
    if (showForm && !userPosition && !gpsLoading) requestLocation();
  }, [showForm, userPosition, gpsLoading, requestLocation]);

  const handleRequest = () => {
    const position = userPosition ?? JUBA_CENTER;
    const id = addDemand({
      lat: position.lat,
      lng: position.lng,
      area: "Household request",
      urgency,
    });
    setMyRequestId(id);
    setStatus("pending");
    setShowForm(false);
    // Simulate supplier accepting and coming
    setTimeout(() => {
      updateDemandStatus(id, "on_the_way");
      setStatus("on_the_way");
      // Supplier "starts" ~2 km from household (north)
      const supplierStart = {
        lat: position.lat + 0.018,
        lng: position.lng,
      };
      setSupplierLocation(supplierStart);
      setSupplierEnRouteTo(id);
    }, 5000);
    setTimeout(() => {
      updateDemandStatus(id, "supplied");
      setStatus("supplied");
      setSupplierLocation(null);
      setSupplierEnRouteTo(null);
      setDisplaySupplierPos(null);
    }, 12000);
  };

  useEffect(() => {
    if (isSupplierComingToMe && supplierLocation) setDisplaySupplierPos(supplierLocation);
  }, [isSupplierComingToMe, supplierLocation]);

  useEffect(() => {
    if (!isSupplierComingToMe || !householdPos) return;
    const interval = setInterval(() => {
      setDisplaySupplierPos((prev) => {
        if (!prev) return null;
        const step = 0.12;
        const lat = prev.lat + (householdPos.lat - prev.lat) * step;
        const lng = prev.lng + (householdPos.lng - prev.lng) * step;
        const d = distanceKm(lat, lng, householdPos.lat, householdPos.lng);
        if (d < 0.03) return householdPos;
        return { lat, lng };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isSupplierComingToMe, householdPos]);

  const statusConfig = {
    idle: { color: "text-muted-foreground", bg: "bg-muted", label: "No active request", icon: MapPin },
    pending: { color: "text-moyo-warning", bg: "bg-moyo-warning/10", label: "Pending — finding a supplier", icon: Clock },
    on_the_way: { color: "text-primary", bg: "bg-primary/10", label: "Supplier on the way!", icon: Truck },
    supplied: { color: "text-moyo-success", bg: "bg-moyo-success/10", label: "Water delivered ✓", icon: CheckCircle2 },
  };

  const current = statusConfig[status];

  return (
    <div className="min-h-screen bg-background">
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
              <Droplets className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold gradient-text">Moyo</span>
          </div>
          <button
            type="button"
            onClick={async () => {
              await authSignOut();
              navigate("/", { replace: true });
            }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-3 h-3" /> Sign out
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-card p-4 mb-6 flex items-center gap-3 ${current.bg} border-l-4`}
          style={{ borderLeftColor: "hsl(var(--primary))" }}
        >
          <current.icon className={`w-5 h-5 ${current.color}`} />
          <div>
            <p className={`text-sm font-semibold ${current.color}`}>{current.label}</p>
            {status === "on_the_way" && distanceToSupplier != null && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Supplier is {formatDistance(distanceToSupplier)} away — see map below
              </p>
            )}
            {status === "on_the_way" && distanceToSupplier == null && (
              <p className="text-xs text-muted-foreground mt-0.5">Estimated arrival: ~15 minutes</p>
            )}
          </div>
        </motion.div>

        <div className="mb-6">
          <LiveMap
            householdPosition={householdPos}
            supplierPosition={supplierPos}
            height="min-h-[320px]"
          />
        </div>

        {status === "idle" && !showForm && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowForm(true)}
            className="w-full py-4 rounded-2xl gradient-bg font-bold text-primary-foreground glow-shadow text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Droplets className="w-5 h-5" />
            Request Water
          </motion.button>
        )}

        {status === "idle" && showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 space-y-4"
          >
            <h3 className="font-display font-semibold text-lg">Request Details</h3>
            {userPosition && (
              <p className="text-xs text-moyo-success flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Your location will be pinned for suppliers
              </p>
            )}
            {gpsLoading && <p className="text-xs text-muted-foreground">Getting your location…</p>}
            {gpsError && (
              <p className="text-xs text-moyo-warning">Using default location. Enable GPS for accurate delivery.</p>
            )}

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Urgency Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "medium", "high"] as Urgency[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUrgency(u)}
                    className={`py-2 rounded-lg text-xs font-medium capitalize transition-all duration-300 flex items-center justify-center gap-1 ${
                      urgency === u
                        ? u === "high"
                          ? "bg-moyo-urgency-high/20 text-moyo-urgency-high border border-moyo-urgency-high/30"
                          : u === "medium"
                          ? "gradient-bg text-primary-foreground"
                          : "bg-moyo-urgency-low/20 text-moyo-urgency-low border border-moyo-urgency-low/30"
                        : "bg-secondary text-muted-foreground border border-border"
                    }`}
                  >
                    {u === "high" && <AlertTriangle className="w-3 h-3" />}
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Estimated Liters</label>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Phone Number (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="+211 ..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl glass-button text-sm font-medium text-muted-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleRequest}
                className="flex-1 py-2.5 rounded-xl gradient-bg text-sm font-semibold text-primary-foreground glow-shadow hover:opacity-90 transition-opacity"
              >
                Submit Request
              </button>
            </div>
          </motion.div>
        )}

        {status === "supplied" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-6">
            <button
              onClick={() => {
                setStatus("idle");
                setMyRequestId(null);
                setUserPosition(null);
                setDisplaySupplierPos(null);
              }}
              className="text-sm text-primary hover:underline"
            >
              Make another request
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
