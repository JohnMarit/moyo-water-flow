import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, authLoading, mockAuthenticated } = useAuth();
  const location = useLocation();
  const isAuthenticated = !!user || mockAuthenticated;

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

  if (!isAuthenticated) {
    const isSupplierRoute = location.pathname.startsWith("/supplier");
    const authPath = isSupplierRoute ? "/auth?role=supplier" : "/auth";
    return <Navigate to={authPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
