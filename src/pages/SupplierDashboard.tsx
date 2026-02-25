import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Droplets, Truck, LogOut, Filter, Navigation, CheckCircle2, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LiveMap from "@/components/LiveMap";
import { useDemand } from "@/contexts/DemandContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSuppliers } from "@/contexts/SuppliersContext";
import { distanceKm, formatDistance } from "@/lib/map-utils";
import { JUBA_CENTER } from "@/lib/map-utils";

const urgencyStyles = {
  low: { dot: "bg-moyo-urgency-low", text: "text-moyo-urgency-low", badge: "bg-moyo-urgency-low/15 text-moyo-urgency-low" },
  medium: { dot: "bg-moyo-urgency-medium", text: "text-moyo-urgency-medium", badge: "bg-moyo-urgency-medium/15 text-moyo-urgency-medium" },
  high: { dot: "bg-moyo-urgency-high", text: "text-moyo-urgency-high", badge: "bg-moyo-urgency-high/15 text-moyo-urgency-high" },
};

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut: authSignOut } = useAuth();
  const { demands, updateDemandStatus, setSupplierLocation, setSupplierEnRouteTo } = useDemand();
  const { getApplicationByUserId, setSupplierLivePosition, clearSupplierLivePosition } = useSuppliers();
  const [filter, setFilter] = useState<"all" | "low" | "medium" | "high">("all");

  const userId = user?.uid ?? user?.email ?? "";
  const application = getApplicationByUserId(userId);

  useEffect(() => {
    if (!userId) return;
    if (!application) {
      navigate("/supplier/apply", { replace: true });
      return;
    }
    if (application.status === "pending" || application.status === "suspended") {
      navigate("/supplier/apply", { replace: true });
    }
  }, [userId, application, navigate]);

  const filtered = filter === "all" ? demands : demands.filter((d) => d.urgency === filter);

  const handleAction = (id: string, action: "on_the_way" | "supplied") => {
    const demand = demands.find((d) => d.id === id);
    if (action === "on_the_way" && demand && application) {
      const pos = { lat: demand.lat + 0.018, lng: demand.lng };
      setSupplierEnRouteTo(id);
      setSupplierLocation(pos);
      setSupplierLivePosition(application.id, application.name, application.vehiclePlate, pos.lat, pos.lng);
    }
    if (action === "supplied") {
      if (application) clearSupplierLivePosition(application.id);
      setSupplierEnRouteTo(null);
      setSupplierLocation(null);
    }
    updateDemandStatus(id, action);
  };

  const pendingDemands = demands.filter((d) => d.status === "pending");
  const pendingCount = pendingDemands.length;
  const onWayCount = demands.filter((d) => d.status === "on_the_way").length;
  const suppliedCount = demands.filter((d) => d.status === "supplied").length;
  const nextPending = pendingDemands[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
              <Droplets className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold gradient-text">Moyo</span>
            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">Supplier Panel</span>
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

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <div>
            <LiveMap demandPoints={demands} height="min-h-[340px]" />

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="glass-card p-3 text-center">
                <p className="text-2xl font-bold font-display text-moyo-warning">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="glass-card p-3 text-center">
                <p className="text-2xl font-bold font-display text-primary">{onWayCount}</p>
                <p className="text-xs text-muted-foreground">On the Way</p>
              </div>
              <div className="glass-card p-3 text-center">
                <p className="text-2xl font-bold font-display text-moyo-success">{suppliedCount}</p>
                <p className="text-xs text-muted-foreground">Supplied</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-3 flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-1 flex-1">
                {(["all", "high", "medium", "low"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-300 ${
                      filter === f ? "gradient-bg text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-4 glow-border">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold">Suggested Route</h4>
              </div>
              {nextPending ? (
                <>
                  <p className="text-xs text-muted-foreground mb-2">
                    Nearest pending: <strong>{nextPending.area}</strong> — {formatDistance(distanceKm(JUBA_CENTER[0], JUBA_CENTER[1], nextPending.lat, nextPending.lng))} away
                  </p>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${nextPending.lat}&mlon=${nextPending.lng}#map=17/${nextPending.lat}/${nextPending.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 rounded-lg gradient-bg text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity text-center"
                  >
                    Open in OpenStreetMap
                  </a>
                </>
              ) : (
                <p className="text-xs text-muted-foreground mb-2">
                  No pending requests. New requests from households will appear here and on the map.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground px-1">Demand Points</h4>
              {filtered.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Inbox className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                  <p className="text-sm text-muted-foreground">No demand points yet</p>
                  <p className="text-xs text-muted-foreground mt-1">When households request water, their location will appear here and on the map.</p>
                </div>
              ) : (
              filtered.map((d, i) => {
                const style = urgencyStyles[d.urgency];
                const distKm = typeof d.lat === "number" && typeof d.lng === "number"
                  ? distanceKm(JUBA_CENTER[0], JUBA_CENTER[1], d.lat, d.lng)
                  : null;
                const distStr = distKm != null ? formatDistance(distKm) : d.distance;
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-4 hover:glow-border transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                          <h5 className="text-sm font-semibold">{d.area}</h5>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {d.requests} request(s) · {distStr} away
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${style.badge}`}>
                        {d.urgency}
                      </span>
                    </div>

                    {d.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(d.id, "on_the_way")}
                          className="flex-1 py-1.5 rounded-lg gradient-bg text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                        >
                          <Truck className="w-3 h-3" /> On My Way
                        </button>
                        <button
                          onClick={() => handleAction(d.id, "supplied")}
                          className="flex-1 py-1.5 rounded-lg glass-button text-xs font-medium text-foreground flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Supplied
                        </button>
                      </div>
                    )}

                    {d.status === "on_the_way" && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-primary flex items-center gap-1">
                          <Truck className="w-3 h-3" /> En route
                        </span>
                        <button
                          onClick={() => handleAction(d.id, "supplied")}
                          className="text-xs text-moyo-success hover:underline flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Mark Supplied
                        </button>
                      </div>
                    )}

                    {d.status === "supplied" && (
                      <span className="text-xs text-moyo-success flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Fulfilled
                      </span>
                    )}
                  </motion.div>
                );
              })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
