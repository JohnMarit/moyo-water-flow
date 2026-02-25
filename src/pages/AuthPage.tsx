import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, User, Truck, Mail, Lock, ArrowLeft, Phone } from "lucide-react";
import { signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

type Role = "user" | "supplier";
type Mode = "login" | "signup";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, authLoading, role: authRole, setRole: persistRole, setMockAuthenticated } = useAuth();
  const initialRole = searchParams.get("role") === "supplier" ? "supplier" : "user";

  const [role, setRole] = useState<Role>(initialRole);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Already signed in: redirect — suppliers go to apply (or dashboard if already approved)
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      const target = authRole === "supplier" ? "/supplier/apply" : "/dashboard";
      navigate(target, { replace: true });
    }
  }, [user, authLoading, navigate, authRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    persistRole(role);
    setMockAuthenticated(true);
    if (role === "supplier") {
      navigate("/supplier/apply");
    } else {
      navigate("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    try {
      setGoogleLoading(true);
      persistRole(role); // save before redirect so we know which dashboard after return
      await signInWithGoogle(); // redirects to Google; after return, getRedirectResultOnLoad runs in AuthContext
    } catch (error: unknown) {
      console.error("Google sign-in failed", error);
      const code = error && typeof error === "object" && "code" in error ? (error as { code: string }).code : "";
      const message = error && typeof error === "object" && "message" in error ? (error as { message: string }).message : String(error);
      setGoogleError(message || "Google sign-in failed. Please try again.");
      if (code === "auth/unauthorized-domain") {
        setGoogleError("This domain is not allowed. Add it in Firebase Console → Authentication → Settings → Authorized domains.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl gradient-bg animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-moyo-glow/[0.03] blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
            <Droplets className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-display font-bold gradient-text">Moyo</span>
        </div>

        {/* Role selector */}
        <div className="glass-card p-1 flex mb-6 rounded-xl">
          <button
            onClick={() => setRole("user")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              role === "user" ? "gradient-bg text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" /> Household
          </button>
          <button
            onClick={() => setRole("supplier")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              role === "supplier" ? "gradient-bg text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Truck className="w-4 h-4" /> Supplier
          </button>
        </div>

        {/* Form */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-display font-bold mb-1">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "login"
              ? `Sign in as a ${role === "supplier" ? "water supplier" : "household user"}`
              : `Register as a ${role === "supplier" ? "water supplier" : "household user"}`}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="+211 ..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 rounded-xl gradient-bg font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity glow-shadow text-sm"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Or continue with
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-sm font-medium text-foreground disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-white text-xs font-bold text-[#4285F4]">
                G
              </span>
              {googleLoading ? "Connecting to Google..." : "Continue with Google"}
            </button>
            {googleError && (
              <p className="mt-3 text-sm text-destructive text-center">{googleError}</p>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
