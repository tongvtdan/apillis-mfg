# Project Structure & Organization

## Root Structure
```
├── src/                    # Main application source
├── supabase/              # Database migrations & config
├── docs/                  # Product documentation & specs
├── scripts/               # Utility scripts for data management
├── sample-data/           # Sample data for development/testing
├── public/                # Static assets
└── .kiro/                 # Kiro AI assistant configuration
```

## Source Code Organization (`src/`)
```
src/
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard-specific components
│   ├── project/          # Project management components
│   ├── customer/         # Customer management components
│   ├── supplier/         # Supplier management components
│   ├── review/           # Review system components
│   ├── analytics/        # Analytics & reporting components
│   └── layout/           # Layout components (AppLayout, etc.)
├── pages/                # Route-level page components
├── hooks/                # Custom React hooks
├── contexts/             # React Context providers
├── types/                # TypeScript type definitions
├── lib/                  # Utility functions & configurations
├── services/             # Business logic & API services
├── integrations/         # External service integrations
└── styles/               # Additional CSS files
```

## Key Conventions

### Component Organization
- **UI Components**: Base components in `components/ui/` (shadcn/ui pattern)
- **Feature Components**: Organized by domain (project/, customer/, supplier/)
- **Page Components**: Top-level route components in `pages/`
- **Layout Components**: Shared layout structures in `components/layout/`

### File Naming
- **Components**: PascalCase (e.g., `ProjectTable.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useProjects.ts`)
- **Types**: camelCase (e.g., `project.ts`, `supplier.ts`)
- **Utilities**: camelCase (e.g., `auth-utils.ts`)

### Import Patterns
- Use `@/` alias for src imports (configured in Vite)
- Barrel exports in `types/index.ts` for centralized type imports
- Component imports follow feature-based organization

### Database Structure
- **Migrations**: Sequential numbered files in `supabase/migrations/`
- **Seed Data**: Sample data in `sample-data/backup/` with import scripts
- **Types**: Auto-generated Supabase types in `src/integrations/supabase/types.ts`

### State Management
- **Global State**: React Context for auth, theme
- **Server State**: TanStack Query for API data
- **Local State**: React useState/useReducer for component state
- **Caching**: Custom cache service for performance optimization

### Styling Approach
- **Primary**: Tailwind CSS utility classes
- **Components**: shadcn/ui + Radix UI primitives
- **Theme**: CSS custom properties with adaptive theming
- **Animations**: Framer Motion for complex animations, CSS for simple ones