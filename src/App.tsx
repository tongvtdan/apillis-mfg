import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/core/auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSessionManager } from "@/core/auth/hooks";
import { useEffect } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";

// Import providers
import { DocumentProvider } from "@/core/documents/DocumentProvider";
import { WorkflowProvider } from "@/core/workflow/WorkflowProvider";
import { ApprovalProvider } from "@/core/approvals/ApprovalProvider";


import AdminUsers from "./pages/AdminUsers";
import AdminPermissions from "./pages/AdminPermissions";
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
import CreateProject from "./pages/CreateProject";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Approvals from "./pages/Approvals";
import CoreTest from "./pages/CoreTest";
import IntakeTest from "./pages/IntakeTest";
import EngineeringReviewTest from "./pages/EngineeringReviewTest";
import CostingEngineTest from "./pages/CostingEngineTest";
import SupplierManagementTest from "./pages/SupplierManagementTest";
import CustomerManagementTest from "./pages/CustomerManagementTest";
import DashboardTest from "./pages/DashboardTest";

import { applyAdaptiveTheme } from "@/lib/theme";
import "@/styles/smooth-transitions.css";


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
                <WorkflowProvider>
                  <ApprovalProvider>
                    <DocumentProvider>
                      <ProjectDetail />
                    </DocumentProvider>
                  </ApprovalProvider>
                </WorkflowProvider>
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
            <Route path="/permissions" element={
              <ProtectedRoute requiredRoles={['management', 'admin']}>
                <AppLayout><AdminPermissions /></AppLayout>
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
            <Route path="/projects/new" element={
              <ProtectedRoute>
                <AppLayout><CreateProject /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/core-test" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AppLayout><CoreTest /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/intake-test" element={
              <ProtectedRoute>
                <AppLayout><IntakeTest /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/engineering-review-test" element={
              <ProtectedRoute>
                <AppLayout><EngineeringReviewTest /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/costing-engine-test" element={
              <ProtectedRoute>
                <AppLayout><CostingEngineTest /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/supplier-management-test" element={
              <ProtectedRoute>
                <AppLayout><SupplierManagementTest /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/customer-management-test" element={
              <ProtectedRoute>
                <AppLayout><CustomerManagementTest /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard-test" element={
              <ProtectedRoute>
                <AppLayout><DashboardTest /></AppLayout>
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