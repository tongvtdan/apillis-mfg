# Project Memory

This file contains important changes and updates made to the project.

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
1. Created StageFlowchart.tsx for interactive workflow stages with selection
2. Created PriorityKanban.tsx to display projects by priority (High, Medium, Low) within a selected stage  
3. Updated Projects.tsx with new "Flowchart View" tab that combines stage selection with priority-based Kanban
4. Updated project workflow to 8 stages: added "Supplier RFQ Sent" between Technical Review and Quoted
5. Updated grid layouts from 7 to 8 columns in WorkflowKanban component

- Date: 2025-01-21
- What we completed / changed:
1. Simplified project workflow to 7-stage Kanban layout as requested: Inquiry Received → Technical Review → Quoted → Order Confirmed → Procurement & Planning → In Production → Shipped & Closed
2. Updated PROJECT_STAGES constant and ProjectStatus type to match the ASCII diagram layout
3. Modified WorkflowKanban component grid to show 7 columns instead of 11
4. Updated status mapping functions in useProjects hook for proper database compatibility
5. Enhanced project status display formatting throughout the application
6. Fixed all component files to use new status values (MonthlyProgress, PendingTasks, ProjectProgressView, Dashboard, Projects)
