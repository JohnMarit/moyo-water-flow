import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DemandProvider } from "@/contexts/DemandContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SuppliersProvider } from "@/contexts/SuppliersContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import UserDashboard from "./pages/UserDashboard";
import SupplierDashboard from "./pages/SupplierDashboard";
import AdminPanel from "./pages/AdminPanel";
import SupplierApply from "./pages/SupplierApply";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/supplier" element={<ProtectedRoute><SupplierDashboard /></ProtectedRoute>} />
      <Route path="/supplier/apply" element={<ProtectedRoute><SupplierApply /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SuppliersProvider>
        <DemandProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
        </DemandProvider>
      </SuppliersProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
