# Factory Pulse - Development Todo

## Current Sprint: Supplier Quote Management Phase 1

### [done] 2025-01-25: Project Details Page Improvements - Communication System and UI Updates - Changed header "Status" to "Stage" for better clarity and consistency with workflow terminology. Added new "Communication" navigation item below "Supplier" in the project details sidebar. Created comprehensive ProjectCommunication component with tabs for emails, chat, comments, and notifications. Implemented communication overview dashboard with metrics for emails (12), chat messages (8), comments (15), and pending items (3). Added communication history view with filtering by type (All, Emails, Chat, Comments). Created new message composition interface with template support for RFQ follow-ups and status updates. Built communication types system supporting email, chat, comment, and notification types with priority levels and status tracking. Added mock communication data for demonstration including RFQ follow-ups, engineering reviews, and customer inquiries. Enhanced project details page with real-time data fetching from Supabase database (already implemented in projectService). Maintained existing project data structure while adding new communication capabilities. All changes maintain consistent UI/UX patterns and responsive design principles.

### [done] 2025-08-26: Projects Page Header Improvements - Enhanced tab styling with background color and visual distinction for selected tabs. Added bg-muted/30 background to TabsList container with rounded corners and padding. Applied data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground styling to TabsTrigger components. Removed all test buttons (Test RT, Test State, Force Refresh) for cleaner production interface. Kept only the essential Refresh button for manual data refresh functionality. Added smooth transitions with transition-all duration-200 for better user experience. Improved visual hierarchy and professional appearance of the header section.

### [done] 2025-08-26: Tooltip Background Styling Consistency - Updated TooltipContent component to use the same background styling as dropdown menus. Changed tooltip styling from bg-popover to bg-background backdrop-blur-lg border border-muted-foreground/20. Ensured visual consistency across the application by applying the same backdrop blur effect and border styling used in dropdown menus to all tooltips. Maintained all existing tooltip animations and positioning while improving visual consistency.

### [done] 2025-08-26: Project Card Hover Effect Styling Consistency - Updated all project card interactive elements to use consistent hover styling that matches dropdown button design. Changed hover effects from hover:text-primary to hover:bg-accent hover:text-accent-foreground for company names, contact info, due dates, estimated values, and time indicators. Added consistent padding (px-1 py-0.5) and rounded corners (rounded) to all hoverable elements. Ensured visual consistency across the application by using the same accent background styling as dropdown menus. Maintained smooth transitions with transition-all duration-200 for all hover effects.

### [done] 2025-08-26: Project Card Interactive Actions and Calendar View Implementation - Enhanced project cards with interactive actions: clickable company/contact names that navigate to customer pages, comprehensive tooltips for all project information, clickable due dates that navigate to the new Calendar View, created new ProjectCalendar component with full month view and project filtering, added Calendar tab to Projects page alongside existing Kanban Flow and Table views, implemented URL parameter handling for tab navigation and date-specific calendar views, enhanced project card visual feedback with hover effects and external link indicators, calendar view shows projects by due dates with color-coded status indicators, added navigation between months and responsive calendar grid with project cards.

### [done] 2025-01-25: Fixed Project Calendar Duplicate Projects Issue - Identified and resolved issue where projects appeared multiple times across different calendar days due to checking multiple date fields (due_date, created_at, stage_entered_at). Implemented date display mode selector allowing users to choose between "Due Dates", "Created Dates", or "Stage Entry Dates". Modified getProjectsForDate function to show projects only on their primary date based on selected mode. Added clear visual indicators and enhanced calendar legend with contextual information about the selected date display mode. Resolved user confusion and improved calendar view usability.

### [done] 2025-08-26: Project Card UI Improvements - Removed Change Stage Button and Enhanced Visual Information - Removed "Change Stage" button and dropdown from project cards as stage changes will now be handled automatically (based on current stage conditions) or manually in the Project Details page. Added visual icons to project card information for better clarity: Calendar icon for due dates, DollarSign icon for estimated values, Clock icon for days in stage, User icon for assignees, and Building2 icon for customer companies. Enhanced project card readability by making it clear what each piece of information represents (e.g., $95,000 is now clearly shown with a dollar sign icon, dates are shown with calendar icons). Simplified project card interface by removing complex stage change functionality while maintaining all other project information display. Updated ProjectCardWrapper to remove unused stage change logic and props.

### [done] 2025-01-25: Project Card Stage Requirements Enhancement - Improved project card view to show stage requirements with current status indicators (Completed, In Progress, Pending) and visual icons. Simplified stage change dropdown to show "Blocked" with info icon instead of detailed requirements text. Added tooltip functionality to show why stages are blocked, providing cleaner UI while maintaining accessibility to detailed information.

### [done] 2025-01-25: Project Card State Control Optimization - Fixed whole screen refresh issues by implementing granular state management, selective real-time subscriptions, and removing unnecessary refetch calls. Created useProjectUpdate hook for individual project updates, enhanced cache service with differential updates, optimized real-time subscriptions, created ProjectCardWrapper component for better state isolation, and removed unnecessary refetch calls from status change handlers.

### [ ] Priority 1: Supplier Quote Management System
- [ ] Create SupplierQuoteModal.tsx - Send RFQ to suppliers
- [ ] Create SupplierQuoteTable.tsx - Track quote status  
- [ ] Create SupplierQuoteDashboard.tsx - Supplier response metrics
- [ ] Implement useSupplierQuotes.ts hook for CRUD operations
- [ ] Add email notification system for supplier RFQs

### [ ] Priority 3: Comprehensive Notification Engine
- [ ] Create NotificationBell.tsx - Header notification indicator
- [ ] Create NotificationDropdown.tsx - Notification list with actions
- [ ] Create NotificationContext.tsx - Real-time notification management

### [ ] Priority 4: Business Intelligence & Metrics
- [ ] Create AnalyticsDashboard.tsx - KPI overview with trend indicators
- [ ] Create SupplierMetrics.tsx - Supplier performance tracking
- [ ] Create WorkflowAnalytics.tsx - Stage efficiency analysis
- [ ] Create ExportTools.tsx - CSV/PDF export functionality

### [ ] Priority 5: Advanced Document Control
- [ ] Create DocumentVersionControl.tsx - Version history and comparison
- [ ] Create BOMEditor.tsx - Bill of Materials management
- [ ] Create DocumentApproval.tsx - Review and approval workflows

### [ ] Priority 6: System Administration & Quality Assurance
- [ ] Create WorkflowConfig.tsx - Configure workflow stages and transitions
- [ ] Create UserManagement.tsx - Role and permission management
- [ ] Create SystemSettings.tsx - Global configuration options

## Recently Completed
- [done] 2025-08-26: Fixed Interactive Info Button in Stage Change Dropdown - Resolved issue where the information button (ℹ️) in blocked stage dropdown items was disabled along with the dropdown item. Now users can click the info button to see why a stage is blocked, even when the stage itself cannot be selected. Added proper event handling with preventDefault and stopPropagation to ensure the info button remains interactive.
- [done] 2025-08-26: Project Card Stage Requirements Enhancement - Improved project card view to show stage requirements with current status indicators (Completed, In Progress, Pending) and visual icons. Simplified stage change dropdown to show "Blocked" with info icon instead of detailed requirements text. Added tooltip functionality to show why stages are blocked, providing cleaner UI while maintaining accessibility to detailed information.
- [done] 2025-08-25: Project Card State Control Optimization - Fixed whole screen refresh issues by implementing granular state management, selective real-time subscriptions, and removing unnecessary refetch calls. Created useProjectUpdate hook for individual project updates, enhanced cache service with differential updates, optimized real-time subscriptions, created ProjectCardWrapper component for better state isolation, and removed unnecessary refetch calls from status change handlers.
- [done] 2025-01-25: Complete ProjectUpdateAnimation Removal and Unused Component Cleanup - removed ProjectUpdateAnimation component and all its usages from the entire codebase, cleaned up unused state variables and imports, optimized ProjectTable component, deleted unused PriorityKanban and ProjectTypeKanban components, removed duplicate RFQ components (RFQIntakeForm.tsx, RFQIntakePortal.tsx), removed development tab from Settings page, removed unused PublicRFQ.tsx file, and removed unused theme showcase components (ThemeShowcase.tsx, ThemeToggle.tsx, FactoryPulseLanding.tsx)
- [done] 2025-01-22: Fixed duplicate Workflow Visualization sections in WorkflowFlowchart component - removed duplicate UI elements causing confusion
- [done] 2025-01-22: Fixed real-time update bug in useProjects hook that prevented automatic project stage updates from working properly
- [done] 2025-01-22: Enhanced refresh button with explanatory text about when manual refresh is needed vs automatic updates
- [done] 2025-01-22: Enhanced floating header with project type filter for complete always-visible navigation and filtering
- [done] 2025-01-22: Enhanced Project Views with fixed-width centered tabbar and consistent project type filtering across all views (Flow, Kanban, Table)
- [done] 2025-01-22: Fixed Kanban rendering issues - resolved missing imports and duplicate style attributes that prevented proper display
- [done] 2025-01-22: Fixed header with always-visible search, notifications, user profile, and New Project button for better navigation
- [done] 2025-01-22: Improved Kanban view layout with horizontal scrolling, 30% wider columns, and flexible heights with full viewport scrolling
- [done] 2025-01-22: Enhanced Flowchart view with project type filtering and responsive grid layout for better project visualization
- [done] 2025-01-22: Enhanced WorkflowKanban with virtual scrolling, time tracking, bottleneck detection, and performance optimizations
- [done] 2025-01-22: Created WorkflowMetrics and StageMetrics widget components for better modularity
- [done] 2025-01-22: Enhanced project workflow to 8-stage process with "Supplier RFQ Sent" stage
- [done] 2025-01-22: Added stage change functionality to ProjectTable with dropdown select
- [done] 2025-01-22: Implemented data sync across all views (Flowchart, Kanban, Table) using useProjects hook
- [done] 2025-01-22: Fixed "React is not defined" error by adding React import to Projects.tsx
- [done] 2025-01-22: Added localStorage persistence for selected stage in Projects page

## Future Ideas (Backlog)
- Multi-tenancy architecture support
- Advanced reporting and analytics
- Mobile application development
- AI-powered workflow optimization
- Integration with external ERP systems
