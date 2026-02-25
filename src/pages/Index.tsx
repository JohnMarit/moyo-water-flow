import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Droplets, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import LiveMap from "@/components/LiveMap";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import { useSuppliers } from "@/contexts/SuppliersContext";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();
  const { liveSuppliersForMap, getApplicationByUserId } = useSuppliers();
  const liveSuppliers = liveSuppliersForMap.map((s) => ({
    id: s.supplierId,
    lat: s.lat,
    lng: s.lng,
    name: s.name,
    vehiclePlate: s.vehiclePlate,
  }));

  const handleRequestWater = () => {
    if (authLoading) return;
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const handleBecomeSupplier = () => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth?role=supplier");
      return;
    }
    const userId = user.uid ?? user.email ?? "";
    const application = getApplicationByUserId(userId);
    if (application?.status === "approved") {
      navigate("/supplier");
    } else {
      navigate("/supplier/apply");
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* Map first — wider square on all breakpoints; live tanker movement builds trust and motivates requests (South Sudan) */}
      <section className="relative pt-20 pb-4 px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-2xl overflow-hidden glass-card aspect-square w-full min-h-[280px] sm:min-h-[320px] md:min-h-[380px] lg:min-h-[420px]"
          >
            <LiveMap
              preview
              liveSuppliers={liveSuppliers}
              className="!rounded-2xl w-full h-full absolute inset-0"
              height="h-full min-h-[280px] sm:min-h-[320px] md:min-h-[380px] lg:min-h-[420px]"
            />
          </motion.div>

          {/* Primary actions directly after the map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <button
              type="button"
              onClick={handleRequestWater}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-bg font-semibold text-primary-foreground hover:opacity-90 transition-opacity glow-shadow"
            >
              <Droplets className="w-4 h-4" />
              Request Water
            </button>
            <button
              type="button"
              onClick={handleBecomeSupplier}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass-button font-medium text-foreground"
            >
              Become a Supplier
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Request water & details below the map */}
      <section className="relative pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-moyo-glow/[0.04] blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-button text-xs text-muted-foreground mb-6"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-moyo-success animate-pulse" />
              Live in Juba, South Sudan
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6 text-balance"
            >
              Clean water,{" "}
              <span className="gradient-text">delivered</span>{" "}
              where it&apos;s needed
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-xl mx-auto mb-8"
            >
              See tankers moving on the map above. Request water, track delivery, save lives.
            </motion.p>
          </div>

          {/* Stats */}
          <div className="max-w-4xl mx-auto">
            <StatsSection />
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-sm font-semibold text-moyo-urgency-high uppercase tracking-wider mb-3">The Problem</h3>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                Juba lacks centralized water infrastructure
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Water is distributed by private tanker trucks with no coordination. Households miss supply when tankers don&apos;t pass through their area. Operators waste fuel without visibility into demand zones.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <h3 className="text-sm font-semibold text-moyo-success uppercase tracking-wider mb-3">The Solution</h3>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                Demand-driven water routing
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Moyo lets households pin their GPS location to request water. Tanker operators see live demand clusters, optimize routes, and confirm delivery — reducing waste and ensuring every home gets water.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;
