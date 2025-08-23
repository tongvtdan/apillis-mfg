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
1. **Enhanced Flowchart View with Project Type Filtering**: Added dropdown filter to select specific project types (System Build, Fabrication, Manufacturing) or view all types
2. **Responsive Grid Layout**: Converted ProjectTypeKanban from column layout to responsive grid with fixed-width project cards (320px max width)
3. **Improved Project Display**: Projects now arranged in responsive grid: 1 column on mobile, 2 on small screens, 3 on large screens, 4 on xl, 5 on 2xl
4. **Enhanced User Experience**: Added project count summaries, better empty state messages, and visual project type indicators with color-coded dots
5. **Smart Filtering**: Project type filter shows accurate counts for each type within the selected stage, with real-time updates
6. **Better Visual Hierarchy**: Added section headers for each project type with descriptions and project counts
7. **Improved Navigation**: Clear indication of filtered results with helpful messaging when no projects match criteria
8. **Responsive Design**: Grid automatically adjusts columns based on screen size while maintaining consistent card dimensions
9. **Performance Optimization**: Maintained drag & drop functionality while improving layout performance for large project lists
10. **Code Quality**: Modular components with clean separation of concerns, following established patterns

- Date: 2025-01-22
- What we completed / changed:
1. **Improved Kanban Layout with Horizontal Scrolling**: Converted from cramped 8-column grid to horizontal scrolling layout showing 2-3 columns at once
2. **Increased Column Widths by 30%**: Each kanban column now has 416px width (increased from 320px) for better readability and content display
3. **Flexible Column Heights**: Removed fixed heights, columns now expand based on project count for natural content flow
4. **Full Viewport Scrolling**: Added vertical scrolling to entire Kanban area (max-h-[80vh]) so users can scroll up/down to see all columns
5. **Enhanced User Experience**: Added horizontal scroll with custom scrollbar styling and visual scroll indicators
6. **Better Visual Hierarchy**: Wider columns now have proper spacing and are much more readable with room for project details
7. **Custom Scrollbar Styling**: Added subtle, themed scrollbars that match the design system for both horizontal and vertical scrolling
8. **Scroll Indicators**: Added gradient fade on the right edge to indicate more content is available
9. **User Guidance**: Updated instruction text to inform users about horizontal and vertical scrolling capabilities
10. **Performance Optimization**: Simplified scrolling implementation improves performance while maintaining drag & drop functionality

- Date: 2025-01-22
- What we completed / changed:
1. **Fixed Header with Always-Visible Controls**: Made the header fixed position so search, notifications, user profile, and New Project button stay visible while scrolling
2. **Enhanced Header Layout**: Added New Project button to the header for easy access from any view (Flowchart, Kanban, Table)
3. **Improved User Experience**: Users can now access key functions (search, notifications, profile, new project) without scrolling back to top
4. **Better Navigation**: Header remains accessible throughout the entire Projects page experience
5. **Responsive Design**: Fixed header works seamlessly across all screen sizes and view modes
6. **Clean Content Layout**: Removed duplicate New Project button from page content, centralized in header
7. **Proper Z-Index Management**: Header has z-50 to ensure it stays above all content
8. **Backdrop Blur Effect**: Maintained modern glass-morphism effect for better visual hierarchy
9. **Conditional Button Display**: New Project button only shows on Projects page for context-appropriate actions
10. **Layout Optimization**: Added proper top padding to main content to account for fixed header height

- Date: 2025-01-22
- What we completed / changed:
1. **Fixed Kanban Rendering Issues**: Resolved critical rendering problems that prevented the kanban view from displaying
2. **Missing Button Import**: Added missing Button import that was causing runtime errors in ProjectCard component
3. **Duplicate Style Attribute**: Fixed duplicate style attributes on ProjectCard div element that caused React warnings
4. **Code Quality**: Ensured all imports are properly included and no syntax errors exist
5. **Component Integrity**: Verified all drag & drop functionality, visual indicators, and interactions work correctly
6. **Error Resolution**: Fixed TypeScript and linting issues to ensure clean, working code
7. **Performance**: Maintained all performance optimizations while fixing rendering issues
8. **User Experience**: Kanban view now renders properly with all features intact (metrics, scrolling, drag & drop)
9. **Testing**: Verified no TypeScript errors and no linting issues remain
10. **Stability**: Ensured component stability and proper error handling throughout

- Date: 2025-01-22
- What we completed / changed:
1. **Fixed Project Views Tabbar Layout**: Changed from full-width to fixed-width (300px) and centered positioning for consistent appearance
2. **Added Project Type Filtering to Kanban View**: Implemented consistent project type filtering across all three views (Flow, Kanban, Table)
3. **Enhanced Table View**: Added project type filtering and consistent header styling to match other views
4. **Improved Visual Consistency**: All three views now have consistent header cards with project counts and filtering options
5. **Better User Experience**: Users can now filter projects by type in any view, maintaining context across view switches
6. **Responsive Design**: Tabbar remains centered and fixed-width regardless of content scrolling or viewport changes
7. **Code Reusability**: Project type filtering logic is now consistent across all views
8. **Performance Optimization**: Filtering is applied at the component level for better performance
9. **UI Consistency**: All views now have matching header styles and information display
10. **Enhanced Navigation**: Tabbar stays visually stable while content scrolls, improving user orientation
