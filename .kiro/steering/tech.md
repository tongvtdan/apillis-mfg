# Technology Stack & Build System

## Core Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Radix UI components
- **Styling**: Tailwind CSS + DaisyUI
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State Management**: TanStack Query (React Query) + React Context
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts + Chart.js
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Build System & Commands
```bash
# Development
npm run dev              # Start dev server on port 8080
npm run build           # Production build
npm run build:dev       # Development build
npm run preview         # Preview production build
npm run lint            # ESLint check

# Database & Scripts
npm run migrate:users   # User migration script
node scripts/import-projects.js        # Import sample data
node scripts/reset-admin-password.js   # Reset admin password
node scripts/test-admin-signin.js      # Test admin authentication
```

## Environment Configuration
- Uses Vite environment variables (VITE_ prefix)
- Supabase configuration via VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Multiple environment files: .env, .env.local, .env.remote

## In Development phase:
- Use Local Supabase (check .env.local)

## Key Libraries & Patterns
- **Real-time Updates**: Supabase Realtime with selective subscriptions
- **Caching**: Custom cache service for performance optimization
- **Authentication**: Supabase Auth with role-based access control
- **File Uploads**: Supabase Storage integration
- **Notifications**: Sonner toasts + custom notification system
- **Theme System**: Adaptive theming with CSS custom properties

## Development Tools
- **IDE**: Cursor.sh (AI-first) or VS Code recommended
- **Linting**: ESLint with TypeScript support
- **Type Safety**: Strict TypeScript configuration
- **Component Tagging**: Lovable tagger for development mode