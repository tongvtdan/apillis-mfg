import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import './styles/enhanced-status.css';
import './styles/auth-ui-enhancements.css';
import './styles/project-form-enhancements.css';
import './styles/project-tabs-fix.css';
import './styles/project-view-tabs.css';
import './styles/tab-system-fix.css';
import './styles/modal-forms-enhancements.css';
import './styles/action-buttons-enhancements.css';
import './styles/toast-enhancements.css';
import './styles/toast-opacity-fix.css';
import './styles/project-animations.css';
import './lib/theme-init';
import { queryClient } from './lib/queryClient';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>
);