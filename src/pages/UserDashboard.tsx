import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, MapPin, Clock, CheckCircle2, Truck, LogOut, AlertTriangle, ChevronDown, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import MapPreview from "@/components/MapPreview";

type RequestStatus = "idle" | "pending" | "on_the_way" | "supplied";
type Urgency = "low" | "medium" | "high";

const UserDashboard = () => {
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [urgency, setUrgency] = useState<Urgency>("medium");
  const [liters, setLiters] = useState("200");
  const [phoneNum, setPhoneNum] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleRequest = () => {
    setStatus("pending");
    setShowForm(false);
    // Mock: after 5s set to on_the_way
    setTimeout(() => setStatus("on_the_way"), 5000);
    setTimeout(() => setStatus("supplied"), 12000);
  };

  const statusConfig = {
    idle: { color: "text-muted-foreground", bg: "bg-muted", label: "No active request", icon: MapPin },
    pending: { color: "text-moyo-warning", bg: "bg-moyo-warning/10", label: "Pending — finding a supplier", icon: Clock },
    on_the_way: { color: "text-primary", bg: "bg-primary/10", label: "Supplier on the way!", icon: Truck },
    supplied: { color: "text-moyo-success", bg: "bg-moyo-success/10", label: "Water delivered ✓", icon: CheckCircle2 },
  };

  const current = statusConfig[status];

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
          </div>
          <Link to="/" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-3 h-3" /> Logout
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Status tracker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-card p-4 mb-6 flex items-center gap-3 ${current.bg} border-l-4`}
          style={{ borderLeftColor: "hsl(var(--primary))" }}
        >
          <current.icon className={`w-5 h-5 ${current.color}`} />
          <div>
            <p className={`text-sm font-semibold ${current.color}`}>{current.label}</p>
            {status === "on_the_way" && (
              <p className="text-xs text-muted-foreground mt-0.5">Estimated arrival: ~15 minutes</p>
            )}
          </div>
        </motion.div>

        {/* Map */}
        <div className="mb-6">
          <MapPreview />
        </div>

        {/* Request button or form */}
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
            <button onClick={() => setStatus("idle")} className="text-sm text-primary hover:underline">
              Make another request
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
