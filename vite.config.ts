import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    mainFields: ['module', 'jsnext:main', 'jsnext'],
    conditions: ['import', 'module', 'browser', 'default']
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    // Simplified build configuration for Vercel compatibility
    rollupOptions: {
      output: {
        // Remove manual chunks to avoid Rollup native dependency issues
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js']
  }
}));
