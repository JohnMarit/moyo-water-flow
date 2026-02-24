import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, MapPin, Truck, LogOut, Filter, Navigation, CheckCircle2, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import MapPreview from "@/components/MapPreview";

interface DemandPoint {
  id: string;
  area: string;
  requests: number;
  urgency: "low" | "medium" | "high";
  distance: string;
  status: "pending" | "on_the_way" | "supplied";
}

const mockDemand: DemandPoint[] = [
  { id: "1", area: "Gudele Block 7", requests: 12, urgency: "high", distance: "2.3 km", status: "pending" },
  { id: "2", area: "Munuki West", requests: 8, urgency: "medium", distance: "3.1 km", status: "pending" },
  { id: "3", area: "Kator Market Area", requests: 15, urgency: "high", distance: "1.8 km", status: "pending" },
  { id: "4", area: "Jebel Kujur", requests: 5, urgency: "low", distance: "5.4 km", status: "pending" },
  { id: "5", area: "Hai Referendum", requests: 9, urgency: "medium", distance: "4.0 km", status: "pending" },
];

const urgencyStyles = {
  low: { dot: "bg-moyo-urgency-low", text: "text-moyo-urgency-low", badge: "bg-moyo-urgency-low/15 text-moyo-urgency-low" },
  medium: { dot: "bg-moyo-urgency-medium", text: "text-moyo-urgency-medium", badge: "bg-moyo-urgency-medium/15 text-moyo-urgency-medium" },
  high: { dot: "bg-moyo-urgency-high", text: "text-moyo-urgency-high", badge: "bg-moyo-urgency-high/15 text-moyo-urgency-high" },
};

const SupplierDashboard = () => {
  const [demands, setDemands] = useState(mockDemand);
  const [filter, setFilter] = useState<"all" | "low" | "medium" | "high">("all");

  const filtered = filter === "all" ? demands : demands.filter((d) => d.urgency === filter);

  const handleAction = (id: string, action: "on_the_way" | "supplied") => {
    setDemands((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: action } : d))
    );
  };

  const pendingCount = demands.filter((d) => d.status === "pending").length;
  const onWayCount = demands.filter((d) => d.status === "on_the_way").length;
  const suppliedCount = demands.filter((d) => d.status === "supplied").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
              <Droplets className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold gradient-text">Moyo</span>
            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">Supplier Panel</span>
          </div>
          <Link to="/" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-3 h-3" /> Logout
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Map area */}
          <div>
            <MapPreview />

            {/* Quick stats */}
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

          {/* Demand sidebar */}
          <div className="space-y-4">
            {/* Filter */}
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

            {/* Route suggestion */}
            <div className="glass-card p-4 glow-border">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold">Suggested Route</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Kator Market Area → Gudele Block 7 — highest demand cluster (27 requests, 4.1 km)
              </p>
              <button className="w-full py-2 rounded-lg gradient-bg text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                Start Navigation
              </button>
            </div>

            {/* Demand list */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground px-1">Demand Points</h4>
              {filtered.map((d, i) => {
                const style = urgencyStyles[d.urgency];
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
                          {d.requests} requests · {d.distance} away
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
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
