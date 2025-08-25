import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import App from "./App.tsx";
import "./index.css";
import './styles/enhanced-status.css';
import './lib/theme-init';
import { queryClient } from "./lib/queryClient.ts";

console.log('🔧 main.tsx: Starting app initialization');
console.log('🔧 main.tsx: QueryClient imported:', queryClient);

console.log('🔧 main.tsx: About to render app');

try {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
  console.log('🔧 main.tsx: App rendered successfully');
} catch (error) {
  console.error('🚨 main.tsx: Error during app render:', error);
}