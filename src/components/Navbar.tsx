import { Link, useNavigate } from "react-router-dom";
import { Droplets, Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSuppliers } from "@/contexts/SuppliersContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getApplicationByUserId } = useSuppliers();

  const handleRequestWater = () => {
    setMobileOpen(false);
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const handleBecomeSupplier = () => {
    setMobileOpen(false);
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
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Droplets className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold gradient-text">Moyo</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <button type="button" onClick={handleRequestWater} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Request Water
          </button>
          <button type="button" onClick={handleBecomeSupplier} className="text-sm px-4 py-2 rounded-lg gradient-bg font-medium text-primary-foreground hover:opacity-90 transition-opacity inline-flex items-center gap-1">
            Become a Supplier
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border/50"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">Home</Link>
              <button type="button" onClick={handleRequestWater} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 text-left">
                Request Water
              </button>
              <button type="button" onClick={handleBecomeSupplier} className="text-sm px-4 py-2 rounded-lg gradient-bg font-medium text-primary-foreground text-center">
                Become a Supplier
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
