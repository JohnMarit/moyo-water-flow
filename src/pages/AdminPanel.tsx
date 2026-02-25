import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, LogOut, Users, BarChart3, CheckCircle2, XCircle, Download, Shield, TrendingUp, MapPin, ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useSuppliers } from "@/contexts/SuppliersContext";

const stats = [
  { label: "Total Requests Today", value: "342", icon: Droplets, trend: "+12%" },
  { label: "Fulfilled", value: "289", icon: CheckCircle2, trend: "84.5%" },
  { label: "Active Suppliers", value: "18", icon: Users, trend: "+2" },
  { label: "Coverage Areas", value: "12", icon: MapPin, trend: "Stable" },
];

const AdminPanel = () => {
  const [tab, setTab] = useState<"overview" | "suppliers">("overview");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { applications, updateApplicationStatus } = useSuppliers();
  const suppliers = applications;

  return (
    <div className="min-h-screen bg-background">
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
              <Droplets className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold gradient-text">Moyo</span>
            <span className="text-xs text-muted-foreground ml-2">Admin</span>
          </div>
          <Link to="/" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-3 h-3" /> Logout
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Tabs */}
        <div className="glass-card p-1 flex mb-6 rounded-xl max-w-xs">
          <button
            onClick={() => setTab("overview")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              tab === "overview" ? "gradient-bg text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Overview
          </button>
          <button
            onClick={() => setTab("suppliers")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              tab === "suppliers" ? "gradient-bg text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Shield className="w-4 h-4" /> Suppliers
          </button>
        </div>

        {tab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <s.icon className="w-5 h-5 text-primary" />
                    <span className="text-[10px] text-moyo-success font-medium flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> {s.trend}
                    </span>
                  </div>
                  <p className="text-2xl font-bold font-display">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Simple bar chart representation */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold mb-4">Daily Requests (Last 7 Days)</h3>
              <div className="flex items-end gap-2 h-32">
                {[180, 220, 310, 280, 342, 290, 320].map((val, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / 342) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                    className="flex-1 rounded-t-lg gradient-bg opacity-70 hover:opacity-100 transition-opacity relative group"
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {val}
                    </span>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <span key={d} className="text-[10px] text-muted-foreground flex-1 text-center">{d}</span>
                ))}
              </div>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 rounded-lg glass-button text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </motion.div>
        )}

        {tab === "suppliers" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-xs text-muted-foreground mb-2">
              Approve suppliers so their live location can be shown on the map. Verify name, ID, plate and tanker photo evidence.
            </p>
            {suppliers.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold">{s.name}</h4>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                    <p className="text-xs text-muted-foreground">ID: {s.nationalId} · Plate: {s.vehiclePlate}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                        s.status === "approved"
                          ? "bg-moyo-success/15 text-moyo-success"
                          : s.status === "pending"
                          ? "bg-moyo-warning/15 text-moyo-warning"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {s.status}
                    </span>
                    {s.status === "pending" && (
                      <button
                        onClick={() => updateApplicationStatus(s.id, "approved")}
                        className="p-1.5 rounded-lg gradient-bg hover:opacity-90 transition-opacity"
                        title="Approve — supplier will appear on live map"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                      </button>
                    )}
                    {s.status !== "suspended" && (
                      <button
                        onClick={() => updateApplicationStatus(s.id, "suspended")}
                        className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors"
                        title="Suspend"
                      >
                        <XCircle className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Evidence: tanker photo with number plate */}
                <div className="border-t border-border/50 pt-3">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    {expandedId === s.id ? "Hide" : "Show"} tanker photo (evidence)
                  </button>
                  {expandedId === s.id && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-border bg-secondary/30 max-w-sm">
                      {s.tankerPhotoUrl ? (
                        <img src={s.tankerPhotoUrl} alt={`Tanker ${s.vehiclePlate}`} className="w-full max-h-48 object-contain" />
                      ) : (
                        <div className="p-6 text-center text-xs text-muted-foreground">
                          No photo uploaded
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
