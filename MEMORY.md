# Project Memory

This file contains important changes and updates made to the project.

## Latest Changes Summary

- Date: 2025-08-25
- What we completed / changed:
1. Created demo authentication accounts with 6-digit UUID endings for easy testing
2. Set up 7 demo accounts with different roles: Customer, Supplier, Engineering, QA, Production, Procurement, Management
3. All demo accounts use password "demo123" with email format: role@demo.com
4. Added avatar_url column to profiles table for user profile pictures
5. Updated all demo profiles with complete information: proper display names, departments, status, and avatar URLs using DiceBear API
6. Demo profiles now have realistic names: John Customer, Sarah Supplier, Mike Engineer, Lisa QA Lead, Tom Production, Anna Procurement, David Manager
7. Fixed runtime crash by removing duplicate Router and React Query providers (kept providers in App.tsx, simplified main.tsx)
8. Added safe debug logs in main.tsx to trace app initialization
9. Left queryClient utility available for future centralization but unused for now
10. Enhanced Settings page User Management section with improved UI, prominent call-to-action button, and detailed feature descriptions
11. Fixed User Management link in Settings page - corrected route from `/admin/users` to `/users` to match App.tsx routing
12. Resolved AdminUsers hooks order error by avoiding conditional returns before hooks; added canAccess guard and conditional data fetching

Demo Sign-in Accounts:

customer@demo.com / demo123 (Customer role)
supplier@demo.com / demo123 (Supplier role)
engineer@demo.com / demo123 (Engineering role)
qa@demo.com / demo123 (QA role)
production@demo.com / demo123 (Production role)
procurement@demo.com / demo123 (Procurement role)
manager@demo.com / demo123 (Management role)

### 2025-01-25
- **Database Performance Optimization Complete**: 
  1. Added comprehensive database indexes for faster queries (projects, RFQs, suppliers, customers)
  2. Created optimized `get_dashboard_summary()` RPC function to reduce server-side processing
  3. Implemented React Query with QueryClient for client-side caching and deduplication
  4. Created `useDashboardData` hook for efficient data fetching with 30s stale time
  5. Updated dashboard components to use optimized hooks instead of over-fetching
  6. Scoped real-time subscriptions to specific routes only (performance improvement)
  7. Reduced data payload by fetching only required fields in dashboard summary
  8. Fixed TypeScript compatibility issues with simplified dashboard data structure
  9. App launch performance significantly improved through optimized data fetching strategy

### Previous Changes
- Date: 2025-01-25
- What we completed / changed:
1. Enhanced status badge styling with vibrant colors, shadows, and hover effects
2. Made status badges more visually distinctive and prominent in OverviewCard component
3. Changed sidebar title from h2 to h4 for better hierarchy

- Date: 2025-01-21
- What we completed / changed:
1. Implemented modern Factory Pulse theme design system
2. Updated color palette to Pulse Teal (#14B8A6), Signal Purple (#8B5CF6), Alert Amber (#F59E0B)
3. Added Inter and Space Mono fonts via Google Fonts
4. Modernized CSS variables for light/dark mode with proper contrast ratios
5. Applied theme tokens throughout index.css and tailwind.config.ts
6. Replaced hard-coded colors system-wide with semantic tokens (text-primary, text-destructive, text-success, etc.)
7. Updated Dashboard, OverviewCard, StageMetrics, WorkflowKanban, and Analytics components to use theme tokens
8. Applied consistent theme across all UI components for better maintainability

- Date: 2025-01-26
- What we completed / changed:
1. Refactored Dashboard.tsx from 601 lines into smaller, focused components
2. Created OverviewCard component for reusable overview cards
3. Created ProjectSummaryCard component for project display with urgency indicators
4. Created PriorityActionItems component for priority projects section
5. Created QuickStats component for dashboard statistics
6. Improved code maintainability and reusability by breaking down monolithic component

- Date: 2025-08-24 (Latest)
- What we completed / changed:
1. **Optimized Grid Layout and Responsiveness (Step 3)**: Enhanced dashboard layout with responsive breakpoints (sm:grid-cols-2 xl:grid-cols-3)
2. **Improved Mobile Experience**: Made header responsive with flex-col on mobile, adjusted padding and spacing for different screen sizes
3. **Enhanced Visual Hierarchy**: Upgraded section headers with larger icons and better typography (text-xl, h-6 w-6 icons)
4. Added Loading States**: Implemented skeleton loading animation for overview cards with proper pulse animation during data loading
5. **Refined Quick Stats Design**: Enhanced Quick Stats with colored indicators, better spacing, and improved background styling
6. **Better Responsive Layout**: Optimized grid layouts for different screen sizes with proper column spanning and gap adjustments
7. **Replaced Workflow Section with Overview Cards (Step 2)**: Removed WorkflowKanban component and replaced with 6 overview cards (Projects, Customers, Suppliers, Purchase Orders, Inventory, Production)
8. **Added Overview Data Calculations**: Created overviewData array with real data from useProjects, useCustomers, useSuppliers hooks and mock data for PO/Inventory/Production
9. **Created OverviewCard Component**: Built reusable card component with click navigation, hover effects, count displays, and proper styling
10. **Updated Dashboard Layout**: Changed from 4-column Kanban layout to overview cards + 3-column stats/activities grid below