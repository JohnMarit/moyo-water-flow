import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, ArrowLeft } from "lucide-react";
import { signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useSuppliers } from "@/contexts/SuppliersContext";

/** Role is strictly from URL: /auth = household (request water), /auth?role=supplier = supplier */
type Role = "user" | "supplier";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, authLoading, role: authRole, setRole: persistRole } = useAuth();
  const { getApplicationByUserId } = useSuppliers();
  const role: Role = searchParams.get("role") === "supplier" ? "supplier" : "user";

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Already signed in: redirect immediately. Use URL intent (role) so /auth → dashboard, /auth?role=supplier → supplier
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      const isAdmin = user.email === "johnmarit42@gmail.com";
      if (isAdmin) {
        navigate("/admin", { replace: true });
        return;
      }
      if (role === "supplier") {
        const userId = user.uid ?? user.email ?? "";
        const application = getApplicationByUserId(userId);
        if (application?.status === "approved") {
          navigate("/supplier", { replace: true });
        } else {
          navigate("/supplier/apply", { replace: true });
        }
        return;
      }
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate, role, getApplicationByUserId]);

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

  // Already signed in: never show the sign-in form — show redirect state until they're sent to dashboard/supplier/admin
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl gradient-bg animate-pulse" />
          <p className="text-sm text-muted-foreground">Taking you back…</p>
        </div>
      </div>
    );
  }

  // Not signed in: show sign-in screen — role is fixed from URL (strict flow)
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

        {/* Auth card — copy depends on flow (request water vs become a supplier) */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-display font-bold mb-1">
            Sign in with Google
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {role === "supplier"
              ? "Sign in to submit your supplier application. After approval you can access the supplier dashboard."
              : "Sign in to request water. You’ll be taken to your household dashboard to request supply."}
          </p>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-sm font-medium text-foreground disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-white text-xs font-bold text-[#4285F4]">
                G
              </span>
              {googleLoading ? "Connecting to Google..." : "Continue with Google"}
            </button>
            {googleError && (
              <p className="text-sm text-destructive text-center">{googleError}</p>
            )}
            <p className="text-[11px] text-muted-foreground text-center">
              You will be redirected back to Moyo after Google sign-in.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
