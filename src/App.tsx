import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NewRFQ from "./pages/NewRFQ";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/rfq/new" element={<AppLayout><NewRFQ /></AppLayout>} />
          <Route path="/rfqs" element={<AppLayout><div className="p-6">RFQs List - Coming Soon</div></AppLayout>} />
          <Route path="/reviews" element={<AppLayout><div className="p-6">Reviews - Coming Soon</div></AppLayout>} />
          <Route path="/production" element={<AppLayout><div className="p-6">Production - Coming Soon</div></AppLayout>} />
          <Route path="/analytics" element={<AppLayout><div className="p-6">Analytics - Coming Soon</div></AppLayout>} />
          <Route path="/users" element={<AppLayout><div className="p-6">User Management - Coming Soon</div></AppLayout>} />
          <Route path="/settings" element={<AppLayout><div className="p-6">Settings - Coming Soon</div></AppLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
