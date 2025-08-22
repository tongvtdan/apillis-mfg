import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import PublicRFQ from "./pages/PublicRFQ";
import NewRFQ from "./pages/NewRFQ";
import AdminUsers from "./pages/AdminUsers";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/rfq/new" element={
              <ProtectedRoute>
                <AppLayout><NewRFQ /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/rfqs" element={
              <ProtectedRoute>
                <AppLayout><div className="p-6">RFQs List - Coming Soon</div></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/reviews" element={
              <ProtectedRoute requiredRoles={['Engineering', 'QA', 'Management']}>
                <AppLayout><div className="p-6">Reviews - Coming Soon</div></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/production" element={
              <ProtectedRoute requiredRoles={['Production', 'Management']}>
                <AppLayout><div className="p-6">Production - Coming Soon</div></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute requiredRoles={['Management', 'Procurement Owner']}>
                <AppLayout><div className="p-6">Analytics - Coming Soon</div></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute requiredRoles={['Management']}>
                <AppLayout><AdminUsers /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout><div className="p-6">Settings - Coming Soon</div></AppLayout>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
