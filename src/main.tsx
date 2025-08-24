import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './theme.css'
import './theme-enforcement.css'
import './index.css'
// Import theme initialization script
import './lib/theme-init'

createRoot(document.getElementById("root")!).render(<App />);
