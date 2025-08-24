# Project Memory

This file contains important changes and updates made to the project.

- Date: 2025-08-24
- What we completed / changed:
1. **Database Schema Cleanup**: Cleared all existing data and removed all mock data files and test components
2. **Suppliers Table**: Created suppliers table with ratings, capabilities, industry types, and RLS policies
3. **Sample Data**: Generated 10 customers, 10 suppliers, and 10 projects with proper relationships
4. **Project Relations**: Added supplier_id to projects table and updated types to include supplier relationships
5. **Code Cleanup**: Removed mock data files, test components, and simplified project service
6. **UI Updates**: Updated project detail page to display supplier information alongside customer data
7. **Build Fixes**: Fixed TypeScript compilation errors and removed unused imports

- Date: 2025-08-22
- What we completed / changed:
1. Implemented User Authentication & Role Management with Supabase
2. Set up role-based access control (RBAC) system
3. Created authentication pages (login, signup) 
4. Implemented protected routes and navigation
5. Added user profile management
6. Set up audit logging for security events

- Date: 2025-08-22
- What we completed / changed:
1. Implemented Internal Review System with database schema for reviews, risks, and clarifications
2. Created ReviewForm component for Engineering, QA, and Production departments
3. Built ReviewStatusPanel for consolidated review status tracking
4. Added ClarificationModal for customer clarification requests
5. Created RFQDetail page with tabs for overview, reviews, documents, and activity
6. Integrated review system with existing RFQ workflow and Kanban dashboard
7. Set up proper RLS policies for secure access to review data

- Date: 2025-08-22
- What we completed / changed:
1. **Dashboard & Sidebar Enhancement**: Redesigned dashboard layout matching reference design with Recent Activities, Pending Tasks, and Monthly Progress sections
2. **Enhanced Navigation**: Updated sidebar with comprehensive MES modules (Vendors, Purchase Orders, Inventory, Production, Customers, Reports)
3. **Improved Statistics Cards**: Streamlined from 6 to 4 key metric cards with better spacing and visual hierarchy
4. **Factory Pulse Branding**: Completed rebrand from "Apillis" to "Factory Pulse" with updated logo and messaging
5. **Component Architecture**: Created reusable dashboard components (RecentActivities, PendingTasks, MonthlyProgress)
6. **Navigation System**: Added all new routes and placeholder pages for future Phase 2 development
7. **Layout Optimization**: Implemented responsive grid layout with proper card spacing and typography
8. **Welcome Message**: Updated dashboard header with procurement operations focus matching reference design

- Date: 2025-08-22
- What we completed / changed:
1. Fixed runtime error in AppSidebar (systemItems not defined) by renaming to systemNavItems and updating references
2. Ensured sidebar "System" section renders reliably with defined navigation list
3. Kept all recent dashboard and navigation enhancements intact

- Date: 2025-01-22
- What we completed / changed:
1. Updated Dashboard to show real project data instead of static mock data
2. Modified summary header cards to display actual project counts (active, won, high priority, total)
3. Updated RecentActivities component to show recent project updates with real timestamps
4. Modified PendingTasks to generate tasks from projects in 'inquiry' and 'review' status
5. Updated MonthlyProgress to calculate percentages based on actual project status distribution

- Date: 2025-01-22
- What we completed / changed:
1. Created new progress-based project workflow UI with step indicators following reference design
2. Built ProjectProgressCard component showing projects as cards with visual progress steps
3. Implemented workflow steps: Intake → Internal Review → Quoted → Production → Delivered
4. Added project metrics display (BOM Items, Documents, Vendors Matched, Quotes Received)
5. Replaced Kanban workflow with progress-based card layout for better visual project tracking
6. Simplified Dashboard to show project overview cards with vertical progress steps
7. Updated Projects page to use detailed ProjectProgressCard for full functionality
8. Modified project information display to prioritize due date and lead time over created date
9. Moved Monthly Progress Overview section to the bottom of the dashboard
10. Redesigned ProjectProgressCard to match reference design with only 3 progress steps (completed, current, next) visible for better card layout

- Date: 2025-01-22
- What we completed / changed:
1. Updated project workflow to 8-stage process with "Supplier RFQ Sent" stage
2. Added stage change functionality to ProjectTable with dropdown select for direct stage changes
3. Implemented data sync across all views (Flowchart, Kanban, Table) using useProjects hook
4. Fixed "React is not defined" error by adding React import to Projects.tsx  
5. Added localStorage persistence for selected stage in Projects page
6. Updated status variants in ProjectTable to match new 8-stage workflow

- Date: 2025-01-21
- What we completed / changed:
1. Simplified project workflow to 7-stage Kanban layout as requested: Inquiry Received → Technical Review → Quoted → Order Confirmed → Procurement & Planning → In Production → Shipped & Closed
2. Updated PROJECT_STAGES constant and ProjectStatus type to match the ASCII diagram layout
3. Modified WorkflowKanban component grid to show 7 columns instead of 11
4. Updated status mapping functions in useProjects hook for proper database compatibility
5. Enhanced project status display formatting throughout the application
6. Fixed all component files to use new status values (MonthlyProgress, PendingTasks, ProjectProgressView, Dashboard, Projects)

- Date: 2025-01-22
- What we completed / changed:
1. Added project_type column to projects database with enum values: system_build, fabrication, manufacturing
2. Updated Project TypeScript interface to include project_type field  
3. Created ProjectTypeKanban component to group projects by type instead of priority
4. Added new "Type Kanban" tab to Projects page that displays projects grouped by System Build, Fabrication, and Manufacturing
5. Updated flowchart view to show projects grouped by type when a stage is selected

- Date: 2025-01-22
- What we completed / changed:
1. **Enhanced WorkflowKanban with Advanced Features**: Implemented virtual scrolling for performance optimization using @tanstack/react-virtual
2. **Improved Drag & Drop**: Enhanced drag & drop functionality with better visual feedback, measuring strategy, and performance optimizations
3. **Time-in-Stage Tracking**: Added comprehensive time tracking with visual indicators (green for on-time, yellow for approaching deadline, orange for overdue, red for bottlenecks)
4. **Bottleneck Detection**: Implemented automatic bottleneck detection for projects spending >14 days in a stage with visual alerts and metrics
5. **Performance Metrics**: Created WorkflowMetrics widget component showing total projects, average cycle time, overdue count, and bottleneck percentages
6. **Stage Performance Tracking**: Built StageMetrics widget component for individual stage performance with average time and issue counts
7. **Modular Architecture**: Separated metrics into reusable widget components following user rule #10b for better maintainability
8. **Enhanced Visual Feedback**: Added smooth animations, better hover effects, and performance indicators throughout the kanban interface
9. **Performance Optimization**: Implemented virtual scrolling for large project lists, reducing DOM nodes and improving rendering performance
10. **Code Quality**: Maintained clean, functional code with <300 LOC per file and proper TypeScript interfaces

- Date: 2025-01-22
- What we completed / changed:
1. **Enhanced Floating Header**: Added project type filter to the floating header alongside view tabs for complete always-visible navigation
2. **Unified Control Center**: Both view switching and project filtering are now in one floating header that's always accessible
3. **Eliminated Duplicate Filters**: Removed individual project type filters from each view header to prevent redundancy
4. **Improved Header Layout**: Changed from horizontal to vertical layout to accommodate both tabs and filter in the floating header
5. **Better Visual Hierarchy**: Increased padding and spacing for better readability and professional appearance
6. **Consistent User Experience**: Users can now access all navigation and filtering controls from any scroll position
7. **Enhanced Accessibility**: Project type filtering is always visible regardless of horizontal or vertical scrolling
8. **Cleaner View Headers**: Individual view headers now only show title and project count, reducing clutter
9. **Optimized Spacing**: Increased bottom margin (mb-24) to accommodate the larger floating header
10. **Professional Design**: Floating header now serves as a complete control center for the entire Projects page