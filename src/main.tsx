import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/enhanced-status.css'
import './lib/theme-init'

console.log('🔧 main.tsx: Starting app initialization');

try {
  createRoot(document.getElementById("root")!).render(<App />);
  console.log('🔧 main.tsx: App rendered successfully');
} catch (error) {
  console.error('🚨 main.tsx: Error during app render:', error);
}
