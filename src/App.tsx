import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import React, { useEffect } from "react";
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
import { RFQDetail } from "./pages/RFQDetail";
import Settings from "./pages/Settings";

import { applyAdaptiveTheme } from "@/lib/theme";

const App = () => {
  // Apply adaptive theme on initial render
  useEffect(() => {
    applyAdaptiveTheme();
  }, []);

  return (
    <AuthProvider>
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
            <ProtectedRoute requiredRoles={['Engineering', 'QA', 'Production', 'Management', 'Procurement']}>
              <AppLayout><div className="p-6">Reviews - Coming Soon</div></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/project/:id" element={
            <ProtectedRoute>
              <AppLayout><ProjectDetail /></AppLayout>
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
              <AppLayout><Settings /></AppLayout>
            </ProtectedRoute>
          } />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  );
};

export default App;