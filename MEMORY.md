# Project Memory

This file contains important changes and updates made to the project.

## Latest Changes Summary

- Date: 2025-08-26
- What we completed / changed:
1. **Projects Page Header Improvements**: 
   - Enhanced tab styling with background color and visual distinction for selected tabs
   - Added `bg-muted/30` background to TabsList container with rounded corners and padding
   - Applied `data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground` styling to TabsTrigger components
   - Removed all test buttons (Test RT, Test State, Force Refresh) for cleaner production interface
   - Kept only the essential Refresh button for manual data refresh functionality
   - Added smooth transitions with `transition-all duration-200` for better user experience
   - Improved visual hierarchy and professional appearance of the header section
2. **Tooltip Background Styling Consistency**: 
   - Updated TooltipContent component to use the same background styling as dropdown menus
   - Changed tooltip styling from `bg-popover` to `bg-background backdrop-blur-lg border border-muted-foreground/20`
   - Ensured visual consistency across the application by applying the same backdrop blur effect and border styling used in dropdown menus to all tooltips
   - Maintained all existing tooltip animations and positioning while improving visual consistency
3. **Project Card Hover Effect Styling Consistency**: 
   - Updated all project card interactive elements to use consistent hover styling that matches dropdown button design
   - Changed hover effects from `hover:text-primary` to `hover:bg-accent hover:text-accent-foreground` for company names, contact info, due dates, estimated values, and time indicators
   - Added consistent padding (`px-1 py-0.5`) and rounded corners (`rounded`) to all hoverable elements
   - Ensured visual consistency across the application by using the same accent background styling as dropdown menus
   - Maintained smooth transitions with `transition-all duration-200` for all hover effects
4. **Project Card Interactive Actions and Calendar View Implementation**: 
   - Enhanced project cards with interactive actions: clickable company/contact names that navigate to customer pages
   - Added comprehensive tooltips for all project information: due dates, estimated values, days in stage, and contact details
   - Made due dates clickable with visual indicators (ExternalLink icon) that navigate to the new Calendar View
   - Created new ProjectCalendar component with full month view, project filtering, and interactive calendar grid
   - Added Calendar tab to Projects page alongside existing Kanban Flow and Table views
   - Implemented URL parameter handling for tab navigation and date-specific calendar views
   - Enhanced project card visual feedback with hover effects, cursor changes, and external link indicators
   - Calendar view shows projects by due dates, creation dates, and stage changes with color-coded status indicators
   - Added navigation between months, "Today" button, and responsive calendar grid with project cards
2. **Project Card UI Improvements - Removed Change Stage Button and Enhanced Visual Information**: 
   - Removed "Change Stage" button and dropdown from project cards as stage changes will now be handled automatically (based on current stage conditions) or manually in the Project Details page
   - Added visual icons to project card information for better clarity: Calendar icon for due dates, DollarSign icon for estimated values, Clock icon for days in stage, User icon for assignees, and Building2 icon for customer companies
   - Enhanced project card readability by making it clear what each piece of information represents (e.g., $95,000 is now clearly shown with a dollar sign icon, dates are shown with calendar icons)
   - Simplified project card interface by removing complex stage change functionality while maintaining all other project information display
   - Updated ProjectCardWrapper to remove unused stage change logic and props
3. **Unified Toast Notification Background Styling**: Updated all toast notification components to use the same background styling as dropdown menus with `bg-background backdrop-blur-lg border border-muted-foreground/20`. This ensures visual consistency across the application by applying the same backdrop blur effect and border styling used in dropdown menus to all toast notifications. Updated both Sonner and Radix UI toast systems, along with their CSS files, to maintain consistent theming.
4. **Fixed Interactive Info Button in Stage Change Dropdown**: Resolved issue where the information button (ℹ️) in blocked stage dropdown items was disabled along with the dropdown item. Now users can click the info button to see why a stage is blocked, even when the stage itself cannot be selected. Added proper event handling with preventDefault and stopPropagation to ensure the info button remains interactive.
5. **Enhanced Project Card Stage Requirements Display**: Improved project card view to show stage requirements with current status indicators (Completed, In Progress, Pending) instead of just listing requirements. Added visual icons (CheckCircle, Clock, XCircle) and status badges for better user understanding of requirement completion status.
6. **Simplified Stage Change Dropdown**: Streamlined the "Change Stage" dropdown to show "Blocked" with an information icon instead of detailed requirements text. Added tooltip functionality that shows specific reasons why a stage is blocked when hovering over the info icon, providing cleaner UI while maintaining accessibility to detailed information.
7. **Improved User Experience**: Enhanced project cards with better visual hierarchy, clearer status indicators, and more intuitive information display. Users can now quickly see which requirements are completed, in progress, or pending, and understand why certain stages are blocked through interactive tooltips.
8. **Code Cleanup**: Removed unused AnimatedProjectCardNew.tsx component to reduce codebase confusion and maintain consistency across project card implementations.
9. **Global Dropdown Menu Theme Consistency**: Updated all dropdown menus to use consistent theme styling with background, backdrop blur, and borders, matching the "Change Stage" dropdown design across the entire application
10. **Enhanced Header Icon Buttons**: Improved notification button with red background for attention-grabbing, and profile button with teal border and amber hover background for better visual definition
11. **Updated Theme Design System with Teal/Cyan Primary Color and Gradients**: Implemented new teal/cyan-based theme system based on the landing page image reference, replacing the previous blue color scheme with vibrant teal/cyan (#0EA5E9) for buttons, selected items, and primary UI elements, now including subtle vertical gradients
12. **Enhanced Color Palette**: Added comprehensive teal/cyan color variants (50-950) to Tailwind config and CSS custom properties for consistent theming across all components
13. **Updated Toast Component**: Modified toast variants to use the new teal/cyan primary color instead of blue, ensuring visual consistency with the new theme
14. **Created Teal/Cyan Theme CSS**: Added new theme-adaptive.css with teal/cyan color system, utility classes, button variants with gradients, and consistent theming
15. **Integrated with Existing System**: Updated index.css to use the new teal/cyan theme system while maintaining compatibility with existing Tailwind classes and CSS variables
16. **Added Gradient Support**: Implemented subtle vertical gradients for buttons that match the image reference, with hover effects and smooth transitions
17. **Maintained Accessibility**: Ensured all new color combinations meet WCAG contrast requirements for manufacturing environments
18. **Project Card State Control Optimization**: Fixed whole screen refresh issues by implementing granular state management, selective real-time subscriptions, and removing unnecessary refetch calls
19. **Created useProjectUpdate Hook**: Built specialized hook for individual project updates with local state management and optimistic updates
20. **Enhanced Cache Service**: Implemented differential updates and increased cache duration from 5 to 15 minutes for better stability
21. **Optimized Real-time Subscriptions**: Replaced broad subscriptions with selective project-specific subscriptions to prevent unnecessary updates
22. **Created ProjectCardWrapper Component**: Built wrapper component for better state isolation and reduced re-renders
23. **Removed Unnecessary Refetch Calls**: Eliminated refetch(true) calls from status change handlers that were causing full screen refreshes
24. **Implemented Smooth Project Stage Transition Animations**: Added comprehensive fade in/out animations and smooth transitions when project stages change to eliminate jarring screen refreshes
25. **Fixed Project Table Stage Change Issues**: Resolved stage change functionality in table view by properly connecting updateProjectStatusOptimistic and refetch functions, added workflow validation, and implemented comprehensive debugging
26. **Enhanced Project Table with Sorting**: Added sorting functionality for name, stage, and priority columns with visual indicators and enhanced user experience
27. **Improved Project Table Column Headers**: Changed "Status" column to "Stage" for better clarity and added interactive sorting buttons with arrow indicators
28. **Created AnimatedProjectCard Component**: Built reusable animated project card component with smooth transitions, loading states, and enhanced user experience
29. **Created AnimatedTableRow Component**: Built animated table row component for smooth stage changes in table view with fade in/out effects
30. **Enhanced WorkflowFlowchart Animations**: Added motion animations to stage counts, workflow visualization, and project grid with staggered entrance effects
31. **Enhanced StageFlowchart Animations**: Added smooth hover effects and entrance animations to stage selection cards
32. **Added Project Animation CSS**: Created comprehensive CSS file with smooth transitions, enhanced hover effects, and loading states
33. **Improved User Experience**: Projects now smoothly animate between stages instead of abrupt refreshes, providing professional and polished feel
34. **ProjectTable Component Optimization**: Cleaned up unused state variables, removed unused imports, extracted utility functions, and improved code organization for better maintainability
35. **Fixed Duplicate Workflow Visualization Issue**: Removed duplicate "Workflow Visualization" and "Kanban-style project list" sections from WorkflowFlowchart component that were causing UI duplication
36. **Improved Real-time Updates**: Fixed bug in useProjects hook where real-time subscription cache updates were using stale state, preventing automatic project stage updates
37. **Enhanced Refresh Button**: Added explanatory text and improved refresh button to clarify that real-time updates should happen automatically
38. **UI Cleanup**: Streamlined WorkflowFlowchart component to show single workflow visualization and project list sections
39. **Better User Experience**: Users now see only one workflow visualization and understand when manual refresh is needed
40. **Added debugging for project status update issues**: Added console logs to track optimistic updates and stage count recalculations to debug UI update problems
41. **Enhanced reactivity for WorkflowFlowchart**: Wrapped projectsByStage calculation in useMemo with proper dependencies for better reactivity when projects change
42. **CRITICAL FIX - Project Status Update Issue**: Identified and fixed root cause where `technical_review` and `supplier_rfq_sent` were both mapped to same database value `review`, causing optimistic updates to be reverted by real-time subscription
43. **Database Schema Update**: Added missing `supplier_rfq` and `procurement` status values to project_status enum to support complete workflow with distinct database values for each stage
44. **Enhanced Database Update Logging**: Added comprehensive logging for database updates and real-time subscription events to track status change issues
45. **FIXED - Supplier RFQ to Quoted Transition**: Resolved validation error blocking transition from "Supplier RFQ Sent" to "Quoted" by making supplier quotes optional for MVP and converting hard errors to warnings

### 2025-08-25
- **Smooth Project Stage Transition Animations Implementation Complete**:
  1. **Created AnimatedProjectCard Component**: Built reusable animated project card with framer-motion animations, smooth fade in/out transitions, and loading states for stage changes
  2. **Created AnimatedTableRow Component**: Built animated table row component for smooth stage changes in table view with fade in/out effects and enhanced user experience
  3. **Enhanced WorkflowFlowchart Animations**: Added motion animations to stage counts with pulse effects, workflow visualization with staggered entrance animations, and project grid with smooth layout transitions
  4. **Enhanced StageFlowchart Animations**: Added smooth hover effects, entrance animations, and enhanced stage selection indicators with motion components
  5. **Added Project Animation CSS**: Created comprehensive CSS file with smooth transitions, enhanced hover effects, loading states, and professional animation curves
  6. **Improved User Experience**: Projects now smoothly animate between stages instead of abrupt refreshes, providing professional and polished feel with 300ms cubic-bezier transitions
  7. **Individual Project Update Tracking**: Implemented per-project update state tracking to show loading animations only on projects being updated, not entire screen
  8. **Enhanced Visual Feedback**: Added loading spinners, opacity changes, and smooth transitions during status updates to provide clear user feedback
  9. **Optimized Animation Performance**: Used AnimatePresence with mode="wait" and layout animations for optimal performance during project stage transitions
  10. **Consistent Animation System**: Established unified animation system across all project views (Kanban, Table, Flowchart) with consistent timing and easing functions

- **Project Table Enhancements and Bug Fixes Complete**:
  1. **Fixed Stage Change Functionality**: Resolved critical issue where project table stage changes were not working by properly connecting updateProjectStatusOptimistic and refetch functions from Projects page
  2. **Added Workflow Validation**: Integrated WorkflowValidator into ProjectTable to ensure stage changes follow proper workflow rules and prevent invalid transitions
  3. **Implemented Comprehensive Sorting**: Added sorting functionality for name, stage, and priority columns with visual indicators (arrows) and enhanced user experience
  4. **Enhanced Column Headers**: Changed "Status" column to "Stage" for better clarity and added interactive sorting buttons with arrow indicators for better UX
  5. **Added Sorting Summary**: Implemented sorting summary display showing current sort field, direction, and project count for better user awareness
  6. **Improved Debugging**: Added comprehensive console logging throughout the stage change process to track validation, updates, and any potential issues
  7. **Enhanced Table Interactivity**: Made table headers clickable for sorting with visual feedback and proper state management
  8. **Optimized Performance**: Used useMemo for sorted projects to prevent unnecessary re-sorting on every render
  9. **Better Error Handling**: Improved error handling and user feedback during stage change operations
  10. **Unified Data Flow**: Established consistent data flow between Projects page, ProjectTable, and useProjects hook for reliable updates

- **ProjectTable Component Optimization Complete**:
  1. Removed unused state variables: `validationErrors` and `isUpdating` that were declared but never used
  2. Cleaned up unused imports: removed `formatDistanceToNow` from date-fns and tooltip-related imports
  3. Extracted utility functions: `calculateLeadTime` and `formatCurrency` for better code organization and reusability
  4. Simplified status display: removed unused validation error tooltips and simplified badge rendering
  5. Improved code readability: better formatting and consistent spacing throughout the component
  6. Maintained all existing functionality while reducing component complexity and improving maintainability
  7. **Removed unnecessary ProjectUpdateAnimation**: Eliminated disruptive fixed overlay animation that was redundant with existing toast notifications from useProjects hook
  8. **Complete ProjectUpdateAnimation Removal**: Removed ProjectUpdateAnimation component and all its usages from the entire codebase (PriorityKanban, ProjectTypeKanban, Projects.tsx, AppHeader.tsx)
  9. **Cleaned up unused state variables**: Removed `isUpdating` state from Projects.tsx and `showUpdateAnimation`/`updateMessage` states from AppHeader.tsx
  10. **Removed unused imports**: Cleaned up React hooks (useState, useEffect) that were no longer needed after animation removal
  11. **Removed unused components**: Deleted PriorityKanban and ProjectTypeKanban components that were imported but never used in the codebase
  12. **Cleaned up duplicate RFQ components**: Removed unused RFQIntakeForm.tsx and RFQIntakePortal.tsx from src/components/rfq/ directory, eliminating duplicate functionality with ProjectIntakeForm and ProjectIntakePortal
  13. **Removed development tab from Settings**: Eliminated development tab and its related code from Settings page, cleaned up unused imports (Database icon) and variables (isDev), and updated grid layout for better tab distribution
  14. **Removed unused PublicRFQ.tsx**: Deleted unused PublicRFQ.tsx file that was imported but never routed to, cleaned up unused import from App.tsx, and maintained NewRFQ.tsx for active /rfq/new route
  15. **Removed unused theme showcase components**: Deleted unused ThemeShowcase.tsx, ThemeToggle.tsx, and FactoryPulseLanding.tsx components, removed /theme-showcase route, and cleaned up theme directory while maintaining active theme system functionality
  16. **Implemented optimistic updates with cache synchronization**: Enhanced immediate UI updates for project status changes by passing optimistic update functions from Projects.tsx to WorkflowFlowchart component, updated useProjects hook to write changes immediately to local storage cache, and established single source of truth for project data to ensure stage counts and project cards update instantly

### 2025-08-22
- **Workflow Visualization Duplication Fix**:
  1. Identified and removed duplicate "Workflow Visualization" sections in WorkflowFlowchart component
  2. Removed duplicate "Kanban-style project list" sections that were causing UI clutter
  3. Fixed real-time subscription cache update bug in useProjects hook that prevented automatic project stage updates
  4. Enhanced refresh button with explanatory text about real-time updates
  5. Streamlined component structure for better maintainability and user experience

## Project Workflow System Implementation Complete

I've successfully implemented a comprehensive workflow system to control and manage project status changes across all views (Flow, Kanban, and Table). Here's what was accomplished:

### Key Components Created:

1. **Workflow Validator** ([src/lib/workflow-validator.ts](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/lib/workflow-validator.ts)):
   - Enforces exit criteria validation for each stage
   - Prevents invalid backward movement in the workflow
   - Defines validation rules for stage progression

2. **Workflow Flowchart Component** ([src/components/project/WorkflowFlowchart.tsx](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/components/project/WorkflowFlowchart.tsx)):
   - Visual representation of the workflow stages
   - Project selection and detailed workflow management
   - Direct stage progression with validation

3. **Comprehensive Documentation** ([docs/workflow-system.md](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/docs/workflow-system.md)):
   - Detailed documentation of the workflow system
   - Explanation of all components and implementation details

### Key Enhancements Made:

1. **Enhanced useProjects Hook**:
   - Integrated workflow validation before any status updates
   - Added validation for both regular and optimistic updates
   - Implemented proper error handling and user feedback

2. **Updated WorkflowKanban Component**:
   - Added validation for drag-and-drop operations
   - Prevents invalid stage changes during drag operations

3. **Enhanced ProjectTable Component**:
   - Integrated workflow validation for dropdown status changes
   - Improved user feedback for validation results

4. **Updated Projects Page**:
   - Integrated the new WorkflowFlowchart component
   - Added project selection functionality for detailed workflow management

### Workflow Stages Implemented:

1. Inquiry Received
2. Technical Review
3. Supplier RFQ Sent
4. Quoted
5. Order Confirmed
6. Procurement & Planning
7. In Production
8. Shipped & Closed

Each stage now has specific exit criteria that must be met before a project can progress to the next stage. The system prevents invalid movements and provides clear feedback to users when validation fails.

### Validation Features:

- **Stage Progression Rules**: Projects cannot move backward in the workflow (except for specific allowed cases)
- **Exit Criteria Validation**: Each stage has defined criteria that must be met before progression
- **Real-time Validation**: Validation occurs immediately when a user attempts to change a project's status
- **User Feedback**: Clear error and warning messages via toast notifications
- **Error Prevention**: Invalid status changes are prevented with descriptive error messages

The workflow system is now fully integrated across all project views (Flow, Kanban, and Table), ensuring consistent validation and a better user experience when managing project lifecycles.

### 2025-08-25
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

### 2025-08-22
- **Refresh Button and Notification Cleanup Complete**:
  1. Removed all "Refresh Projects" buttons from all project views (WorkflowFlowchart, ProjectTable, ProjectTypeKanban, PriorityKanban)
  2. Removed unused `showUpdateNotificationWithTimeout` function from update-notification.ts
  3. Cleaned up unused imports (RefreshCw, useProjects, useState) from components where refresh buttons were removed
  4. Removed unused state variables and functions related to refresh functionality
  5. Simplified component logic by removing manual refresh capabilities, relying on automatic real-time updates
  6. Streamlined user experience by removing redundant manual refresh options

### Previous Changes
- Date: 2025-08-25
- What we completed / changed:
1. Enhanced status badge styling with vibrant colors, shadows, and hover effects
2. Made status badges more visually distinctive and prominent in OverviewCard component
3. Changed sidebar title from h2 to h4 for better hierarchy

- Date: 2025-08-21
- What we completed / changed:
1. Implemented modern Factory Pulse theme design system
2. Updated color palette to Pulse Teal (#14B8A6), Signal Purple (#8B5CF6), Alert Amber (#F59E0B)
3. Added Inter and Space Mono fonts via Google Fonts
4. Modernized CSS variables for light/dark mode with proper contrast ratios
5. Applied theme tokens throughout index.css and tailwind.config.ts
6. Replaced hard-coded colors system-wide with semantic tokens (text-primary, text-destructive, text-success, etc.)
7. Updated Dashboard, OverviewCard, StageMetrics, WorkflowKanban, and Analytics components to use theme tokens
8. Applied consistent theme across all UI components for better maintainability

- Date: 2025-08-26
- What we completed / changed:
1. Refactored Dashboard.tsx from 601 lines into smaller, focused components
2. Created OverviewCard component for reusable overview cards
3. Created ProjectSummaryCard component for project display with urgency indicators
4. Created PriorityActionItems component for priority projects section
5. Created QuickStats component for dashboard statistics
6. Improved code maintainability and reusability by breaking down monolithic component

- Date: 2025-08-24
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