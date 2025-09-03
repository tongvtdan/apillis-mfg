import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useEffect } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";


import AdminUsers from "./pages/AdminUsers";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Vendors from "./pages/Vendors";
import Projects from "./pages/Projects";
import PurchaseOrders from "./pages/PurchaseOrders";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import ProjectDetail from "./pages/ProjectDetail";
import NewRFQ from "./pages/NewRFQ";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Approvals from "./pages/Approvals";
import { GoogleDriveCallback } from "./pages/GoogleDriveCallback";

import { applyAdaptiveTheme } from "@/lib/theme";
import "@/styles/smooth-transitions.css";

// Temporary debug - remove this later
console.log('🔍 Environment Variables Debug:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('SUPABASE_URL (fallback):', import.meta.env.SUPABASE_URL);
console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log('VITE_GOOGLE_CLIENT_SECRET:', import.meta.env.VITE_GOOGLE_CLIENT_SECRET ? '***SET***' : '***NOT SET***');
console.log('All VITE_ variables:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
console.log('NODE_ENV:', import.meta.env.NODE_ENV);
console.log('MODE:', import.meta.env.MODE);
console.log('BASE_URL:', import.meta.env.BASE_URL);

// Session Manager Component to initialize session management
function SessionManagerWrapper({ children }: { children: React.ReactNode }) {
  useSessionManager(); // Initialize session management
  return <>{children}</>;
}

const App = () => {
  // Apply adaptive theme on initial render
  useEffect(() => {
    applyAdaptiveTheme();
  }, []);

  return (
    <AuthProvider>
      <SessionManagerWrapper>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/vendors" element={
              <ProtectedRoute>
                <AppLayout><Vendors /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <AppLayout><Projects /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/purchase-orders" element={
              <ProtectedRoute>
                <AppLayout><PurchaseOrders /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <AppLayout><Inventory /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <AppLayout><Customers /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/suppliers" element={
              <ProtectedRoute>
                <AppLayout><Suppliers /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <AppLayout><Reports /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/reviews" element={
              <ProtectedRoute requiredRoles={['engineering', 'qa', 'production', 'management', 'admin', 'procurement']}>
                <AppLayout><div className="p-6">Reviews - Coming Soon</div></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/approvals" element={
              <ProtectedRoute requiredRoles={['engineering', 'qa', 'production', 'management', 'admin', 'procurement']}>
                <AppLayout><Approvals /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/project/:id" element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            } />
            <Route path="/production" element={
              <ProtectedRoute requiredRoles={['production', 'management', 'admin']}>
                <AppLayout><div className="p-6">Production - Coming Soon</div></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute requiredRoles={['management', 'admin', 'procurement']}>
                <AppLayout><div className="p-6">Analytics - Coming Soon</div></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute requiredRoles={['management', 'admin']}>
                <AppLayout><AdminUsers /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout><Settings /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout><Profile /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/rfq/submit" element={
              <ProtectedRoute>
                <AppLayout><NewRFQ /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/rfq/new" element={
              <ProtectedRoute>
                <AppLayout><NewRFQ /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Google Drive OAuth Callback */}
            <Route path="/auth/google-drive/callback" element={
              <ProtectedRoute>
                <GoogleDriveCallback />
              </ProtectedRoute>
            } />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </SessionManagerWrapper>
    </AuthProvider>
  );
};

export default App;