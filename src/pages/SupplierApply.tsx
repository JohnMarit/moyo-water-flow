import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, ArrowLeft, User, CreditCard, Hash, Camera, Upload, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSuppliers } from "@/contexts/SuppliersContext";

/**
 * Supplier application: name, national ID, vehicle plate, and evidence photo
 * (tanker with number plate visible). Builds trust — South Sudan users value
 * verification and visible proof.
 */
const SupplierApply = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { addApplication, getApplicationByUserId } = useSuppliers();
  const [name, setName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [tankerPhotoUrl, setTankerPhotoUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userId = user?.uid ?? user?.email ?? "mock-user";
  const existing = getApplicationByUserId(userId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image (e.g. photo of your tanker with number plate visible).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setTankerPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedName = name.trim();
    const trimmedId = nationalId.trim();
    const trimmedPlate = vehiclePlate.trim().toUpperCase();
    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }
    if (!trimmedId) {
      setError("Please enter your national ID.");
      return;
    }
    if (!trimmedPlate) {
      setError("Please enter your vehicle number plate.");
      return;
    }
    if (!tankerPhotoUrl) {
      setError("Please upload a photo of your tanker with the number plate clearly visible (evidence).");
      return;
    }
    addApplication({
      userId,
      name: trimmedName,
      nationalId: trimmedId,
      vehiclePlate: trimmedPlate,
      email: user?.email ?? "",
      tankerPhotoUrl,
    });
    setSubmitted(true);
  };

  if (existing?.status === "approved") {
    navigate("/supplier", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-moyo-glow/[0.03] blur-[100px] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
            <Droplets className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-display font-bold gradient-text">Moyo</span>
          <span className="text-sm text-muted-foreground">Supplier application</span>
        </div>

        {existing?.status === "pending" ? (
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-moyo-warning/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-moyo-warning" />
            </div>
            <p className="text-xs font-semibold text-moyo-warning uppercase tracking-wider mb-2">Pending approval</p>
            <h2 className="text-lg font-display font-bold mb-2">Application under review</h2>
            <p className="text-sm text-muted-foreground mb-4">
              We have received your details and tanker photo. An admin will verify and approve you soon. You will then appear on the live map and can start receiving requests.
            </p>
            <Link to="/" className="text-sm text-primary hover:underline">Return to home</Link>
          </div>
        ) : submitted ? (
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-moyo-success/20 flex items-center justify-center mx-auto mb-4">
              <Droplets className="w-6 h-6 text-moyo-success" />
            </div>
            <h2 className="text-lg font-display font-bold mb-2">Application submitted</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Thank you. Your details and tanker photo have been sent for verification. You will be notified once approved and can then use the supplier dashboard and appear on the live map.
            </p>
            <Link to="/" className="text-sm text-primary hover:underline">Return to home</Link>
          </div>
        ) : (
          <div className="glass-card p-6">
            <h2 className="text-xl font-display font-bold mb-1">Apply as a water supplier</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Provide your details and a photo of your tanker with the number plate visible. Admin will approve you so your live location can be shown on the map.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </p>
              )}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm"
                    placeholder="Your full name"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">National ID</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm"
                    placeholder="e.g. SS-N-12345"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Vehicle number plate</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm uppercase"
                    placeholder="e.g. SS-1234"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Evidence: tanker photo (number plate visible)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-lg border border-dashed border-border bg-secondary/50 hover:bg-secondary text-sm text-muted-foreground"
                >
                  {tankerPhotoUrl ? (
                    <>
                      <Camera className="w-4 h-4 text-moyo-success" />
                      Photo added — tap to change
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload photo of tanker with number plate visible
                    </>
                  )}
                </button>
                {tankerPhotoUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-border max-h-32">
                    <img src={tankerPhotoUrl} alt="Tanker evidence" className="w-full h-28 object-cover object-center" />
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl gradient-bg font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Submit application
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SupplierApply;
