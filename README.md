# Factory Pulse - Manufacturing Project Management System

## Project Overview

**Factory Pulse** is a comprehensive Manufacturing Execution System (MES) designed for small-to-midsize manufacturers. The system provides workflow management, document handling, approval systems, and real-time collaboration features for manufacturing organizations.

## Current Project Status

### ✅ Implemented Features
- **User Authentication & Role Management** - Multi-role system with RBAC
- **Project Management** - Complete workflow with Kanban-style interface
- **Document Management** - File upload, version control, and categorization
- **Dashboard & Analytics** - Real-time project statistics and progress tracking
- **Approval System** - Configurable approval workflows with role-based permissions
- **Workflow Definitions** - Versioned, reusable workflow templates ([docs](docs/workflow-definitions.md))
- **Real-time Updates** - Live data synchronization across all components
- **Multi-tenant Architecture** - Organization-based data isolation

### 🚧 In Development
- **Supplier Management** - RFQ engine and supplier portal
- **Inventory Management** - Stock tracking and material management
- **Purchase Order System** - Automated PO generation and tracking
- **Customer Portal** - External access for customers to track projects

### 📋 Planned Features
- **Mobile Application** - Shop floor mobile interface
- **Advanced Analytics** - Predictive analytics and performance insights
- **Integration APIs** - Third-party system integrations
- **Advanced Workflow Features** - Custom workflow builder

## Technology Stack

### Frontend
- **React 18** - Modern UI framework with concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Vite 5.0.0** - Fast build tool and development server
- **React Router DOM** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library built on Tailwind CSS

### Backend & Database
- **Supabase** - Complete backend solution
  - **PostgreSQL 17** - Primary database
  - **Real-time Subscriptions** - Live data updates
  - **Authentication System** - User management and security
  - **Storage API** - File upload and management
  - **Row Level Security (RLS)** - Data access control

### State Management & Data Fetching
- **TanStack Query (React Query)** - Server state management and caching
- **React Context API** - Client-side state management
- **Custom Hooks** - Reusable logic and state patterns
- **Layered Service Architecture** - Business logic and data access separation

### Development Tools
- **ESLint 8.0.0** - Code linting and quality enforcement
- **SWC** - Fast JavaScript/TypeScript compiler (via Vite)
- **Bun** - Package manager and runtime environment

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Local Supabase instance (for development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd factory-pulse

# Install dependencies
npm install

# Set up environment variables
cp env.local.example env.local
# Edit env.local with your Supabase configuration

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Database Setup

The project uses a local Supabase instance for development:

```bash
# Start local Supabase
supabase start

# Apply database schema (if migrations exist)
supabase db reset

# Seed sample data
npm run seed:organizations
npm run seed:contacts
npm run seed:workflow-stages
npm run seed:projects
```

## Available Scripts

### Development
```bash
npm run dev          # Start development server (port 8080)
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Database Management
```bash
npm run seed:organizations     # Seed organization data
npm run seed:contacts         # Seed contact data
npm run seed:workflow-stages  # Seed workflow stages
npm run seed:projects         # Seed project data
npm run seed:approvals        # Seed approval data
```

### Testing
```bash
npm test              # Run tests in watch mode
npm run test:run      # Run all tests once
npm run test:ui       # Launch interactive test UI
npm run test:coverage # Generate coverage reports
```

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── admin/      # Admin-specific components
│   │   ├── WorkflowDefinitionManagement.tsx  # Workflow definition management
│   │   └── ...
│   ├── approval/   # Approval workflow components
│   ├── dashboard/  # Dashboard components
│   ├── project/   # Project management components
│   ├── ui/        # Base UI components
│   └── ...
├── pages/         # Page-level components
├── hooks/         # Custom React hooks
├── services/      # Layered service architecture (data & business logic)
├── contexts/      # React context providers
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── lib/           # Core library functions
├── styles/        # CSS and styling files
├── integrations/  # Third-party integrations
└── test/         # Test files
```

## Service Architecture

The application uses a layered service architecture for clean separation of concerns:

### Business Logic Layer
- **ProjectActionServiceSimplified** - High-level project operations with authentication
- **Comprehensive Operations** - Create, update, duplicate, archive, bulk operations
- **Automatic Context** - User authentication and organization resolution
- **Error Handling** - Consistent error management and logging

### Data Access Layer
- **ProjectServiceSimplified** - Core CRUD operations for projects
- **ProjectContactService** - Specialized contact management with arrays
- **Optimized Queries** - Efficient database operations with proper indexing

### Key Benefits
- **Simplified Contact Model** - Array-based storage instead of junction tables
- **Organization-based Customers** - Stable relationships via customer organizations
- **Performance Optimized** - Direct array operations and reduced JOINs
- **Type Safety** - Full TypeScript integration across all layers

## Key Features

### Project Management
- **Kanban Workflow** - Visual project tracking with drag-and-drop
- **Real-time Updates** - Live synchronization across all users
- **Document Management** - File upload, version control, and categorization
- **Role-based Access** - Granular permissions for different user roles
- **Workflow Definitions** - Versioned, reusable workflow templates
- **Simplified Contact Model** - Array-based contact management with primary contact logic
- **Organization-based Customers** - Stable customer relationships via organizations

### Dashboard & Analytics
- **Project Statistics** - Real-time project counts and progress
- **Workflow Analytics** - Stage completion times and bottlenecks
- **User Activity** - Recent activities and pending tasks
- **Performance Metrics** - Key performance indicators

### Approval System
- **Configurable Workflows** - Role-based approval processes
- **Delegation Support** - Temporary approval delegation
- **Audit Trail** - Complete history of approvals and decisions
- **Notification System** - Automated alerts for pending approvals

## User Roles

The system supports multiple user roles with different permissions:

- **Admin** - Full system access and user management
- **Management** - Strategic oversight and approval authority
- **Engineering** - Technical review and design approval
- **QA** - Quality assurance and testing
- **Production** - Manufacturing execution and progress tracking
- **Procurement** - Supplier management and purchase orders
- **Sales** - Customer interaction and project intake
- **Supplier** - External access for quote submission
- **Customer** - Project status tracking and communication

## Development Guidelines

### Code Quality
- Use TypeScript for all new code
- Follow ESLint configuration
- Write tests for new features
- Use functional components with hooks

### Database Practices
- Use Row Level Security (RLS) for data access control
- Implement proper foreign key relationships
- Use custom types for data consistency
- Maintain audit trails for important changes

### Component Architecture
- Keep components small and focused
- Use composition over inheritance
- Implement proper error boundaries
- Follow React best practices

## Deployment

### Local Development
- Uses local Supabase instance
- Hot module replacement enabled
- Environment variables in `env.local`

### Production Deployment
- Static build with Vite
- Supabase cloud instance
- Environment-specific configuration
- CDN-ready assets

## Contributing

1. Follow the established code style and patterns
2. Write tests for new features
3. Update documentation for significant changes
4. Use conventional commit messages
5. Create feature branches for new development

## Support

For development questions or issues:
- Check the documentation in the `docs/` folder
- Review the `MEMORY.md` file for recent changes
- Examine the `docs/todo.md` for current development status

## License

This project is proprietary software. All rights reserved.
