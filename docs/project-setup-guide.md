# Factory Pulse - Project Setup Guide

## Overview

Factory Pulse is built with a modern, minimal technology stack focused on essential dependencies and efficient development workflows. This guide covers the complete setup process for the Factory Pulse Manufacturing Execution System.

## Technology Stack

### Core Technologies
- **Frontend Framework**: React 18 + TypeScript
- **Build System**: Vite 5.0+ (ES modules, fast HMR, port 8080)
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Environment Management**: dotenv for configuration
- **Code Quality**: ESLint for linting and code standards

### Essential Dependencies
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "eslint": "^8.0.0"
  }
}
```

## Project Structure

```
factory-pulse/
├── src/                           # Application source code
│   ├── components/               # React components
│   ├── pages/                   # Route-level pages
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities and configurations
│   ├── types/                   # TypeScript type definitions
│   └── integrations/            # External service integrations
├── supabase/                    # Database configuration
│   ├── migrations/              # Database schema migrations
│   └── config.toml             # Supabase configuration
├── scripts/                     # Utility scripts
│   ├── seed-organizations.js    # Organization seeding script
│   └── migrate-users.js        # User migration script
├── sample-data/                 # Development seed data
├── docs/                        # Project documentation
├── public/                      # Static assets
├── .env.local                   # Local environment variables
├── package.json                 # Project configuration
└── vite.config.ts              # Vite build configuration
```

## Setup Instructions

### 1. Project Initialization

```bash
# Clone or create the project
git clone <repository-url> factory-pulse
cd factory-pulse

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### 2. Environment Configuration

Create `.env.local` with your Supabase credentials:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Development Settings
NODE_ENV=development
```

### 3. Database Setup

```bash
# Start local Supabase (requires Supabase CLI)
supabase start

# Run database migrations
supabase db reset

# Seed organizations data
npm run seed:organizations

# Migrate users (if needed)
npm run migrate:users
```

### 4. Development Server

```bash
# Start development server on port 8080
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Available Scripts

### Development Scripts
- `npm run dev` - Start Vite development server on port 8080
- `npm run build` - Create production build
- `npm run build:dev` - Create development build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code quality checks

### Database Scripts
- `npm run seed:organizations` - Seed organizations data
- `npm run seed:organizations:force` - Force reseed organizations (overwrites existing)
- `npm run migrate:users` - Run user migration script

## Build System Features

### Vite Configuration
- **Fast Development**: Hot Module Replacement (HMR) for instant updates
- **Port Configuration**: Development server runs on port 8080
- **ES Modules**: Modern JavaScript module system
- **TypeScript Support**: Built-in TypeScript compilation
- **Path Aliases**: Configured `@/` alias for src imports

### Environment Management
- **dotenv Integration**: Automatic environment variable loading
- **Multiple Environments**: Support for .env, .env.local, .env.production
- **Vite Variables**: Uses VITE_ prefix for client-side variables
- **Type Safety**: Environment variables with TypeScript definitions

## Database Architecture

### Multi-Tenant Foundation
- **Organizations Table**: Root entity for multi-tenancy
- **User Management**: Extends Supabase auth with organizational context
- **Workflow Stages**: Configurable manufacturing process stages
- **Project Management**: Core business entity with workflow integration

### Key Tables
1. **organizations** - Multi-tenant root entities
2. **workflow_stages** - Configurable process stages
3. **users** - Internal employees with roles and hierarchy
4. **contacts** - External customers and suppliers
5. **projects** - Core manufacturing projects
6. **documents** - File management with versioning
7. **reviews** - Internal approval workflows
8. **messages** - Communication system
9. **notifications** - User notification system
10. **activity_log** - Comprehensive audit trail

## Development Workflow

### 1. Local Development
```bash
# Start local Supabase
supabase start

# Start development server
npm run dev

# Access application at http://localhost:8080
```

### 2. Database Changes
```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

### 3. Data Management
```bash
# Seed fresh data
npm run seed:organizations:force

# Import sample data
node scripts/import-sample-data.js
```

## Production Deployment

### Frontend Deployment (Vercel)
```bash
# Build production version
npm run build

# Deploy to Vercel
vercel --prod
```

### Backend Deployment (Supabase)
```bash
# Link to production project
supabase link --project-ref your-project-ref

# Deploy migrations
supabase db push

# Deploy functions (if any)
supabase functions deploy
```

## Troubleshooting

### Common Issues

1. **Port 8080 in use**
   ```bash
   # Kill process using port 8080
   lsof -ti:8080 | xargs kill -9
   ```

2. **Supabase connection issues**
   - Verify VITE_SUPABASE_URL and keys in .env.local
   - Ensure local Supabase is running: `supabase status`

3. **Build errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear Vite cache: `rm -rf node_modules/.vite`

4. **Database migration issues**
   - Reset database: `supabase db reset`
   - Check migration files for syntax errors

### Performance Optimization

1. **Development**
   - Use Vite's fast refresh for instant updates
   - Leverage ES modules for tree shaking
   - Enable source maps for debugging

2. **Production**
   - Minimize bundle size with Vite's optimization
   - Use environment-specific builds
   - Enable compression and caching

## Next Steps

1. **Frontend Development**: Add React components and pages
2. **UI Framework**: Install and configure Tailwind CSS + shadcn/ui
3. **State Management**: Add TanStack Query for server state
4. **Authentication**: Implement Supabase Auth integration
5. **Real-time Features**: Add Supabase Realtime subscriptions

## Support

- **Documentation**: Check `/docs` folder for detailed guides
- **Database Schema**: See `docs/database-schema.md`
- **Implementation Plan**: See `docs/implementation-plan.md`
- **Memory/Changelog**: See `MEMORY.md` for recent changes