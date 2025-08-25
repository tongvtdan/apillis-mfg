import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Import enhanced status styling
import './styles/enhanced-status.css'
// Import theme initialization script
import './lib/theme-init'

createRoot(document.getElementById("root")!).render(<App />);