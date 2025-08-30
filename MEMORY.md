# Factory Pulse - Development Memory

## Recent Changes

### 2025-08-30 - Auth Users Creation Script Development

**Changes Made:**
- **Auth Users Creation Script**: Successfully created a comprehensive Node.js script to create Supabase authentication users with matching UUIDs
  - **Script Location**: `scripts/create-auth-users.js` - ES module compatible script for user management
  - **UUID Matching**: Creates auth users with exact UUIDs from sample data to maintain referential integrity
  - **Profile Linking**: Updates user profiles in `users` table to link with auth user IDs via `user_id` field
  - **Command Line Interface**: Full CLI with options for password, email domain, dry-run mode, and help
  - **Error Handling**: Comprehensive error handling with detailed logging and results export
  - **Dry Run Mode**: Safe testing mode to preview changes without executing them

**Technical Details:**
- **ES Module Compatibility**: Updated script to use ES modules matching project's `"type": "module"` configuration
  - Uses `import` statements instead of `require()`
  - Implements `fileURLToPath` for `__dirname` equivalent in ES modules
  - Proper export syntax for module functionality

- **Supabase Integration**: 
  - Uses `@supabase/supabase-js` client with service role key for admin operations
  - Creates auth users via `supabase.auth.admin.createUser()` with metadata
  - Updates user profiles via direct database queries to maintain consistency
  - Supports both service role key and anon key for flexibility

- **User Data Processing**:
  - Reads from `sample-data/03-users.json` to maintain data consistency
  - Normalizes email addresses (adds domain if missing)
  - Preserves all user metadata (name, role, department) in auth user creation
  - Maintains exact UUID matching between sample data and auth users

- **Command Line Options**:
  - `--password=PASSWORD`: Custom password for all users (default: "FactoryPulse2025!")
  - `--email-domain=DOMAIN`: Email domain for users without domains (default: "factorypulse.vn")
  - `--dry-run`: Preview mode without making changes
  - `--help`: Comprehensive help documentation

- **Output and Logging**:
  - Rich console output with emojis and clear status messages
  - Progress tracking for each user creation step
  - Detailed results summary with success/error counts
  - JSON results file export with timestamp for audit trail
  - Comprehensive error reporting with specific failure reasons

**Package Integration**:
- **NPM Script**: Added `"create:auth-users": "node scripts/create-auth-users.js"` to package.json
- **Easy Execution**: Can be run via `npm run create:auth-users` or direct node execution
- **Documentation**: Created comprehensive `scripts/README.md` with usage examples and troubleshooting

**Script Features**:
- **Environment Safety**: Checks for required environment variables before execution
- **Dry Run Support**: Safe testing mode for development and validation
- **Comprehensive Logging**: Clear progress indicators and status messages
- **Error Recovery**: Continues processing other users if individual operations fail
- **Results Export**: Saves detailed operation results to timestamped JSON files
- **Help System**: Built-in help with examples and usage instructions

**Usage Examples**:
```bash
# Basic execution
npm run create:auth-users

# Custom password
node scripts/create-auth-users.js --password=SecurePass123

# Custom email domain
node scripts/create-auth-users.js --email-domain=example.com

# Dry run (safe testing)
node scripts/create-auth-users.js --dry-run

# Help information
node scripts/create-auth-users.js --help
```

**Environment Requirements**:
```bash
# .env.local
VITE_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# OR
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Benefits**:
- **Referential Integrity**: Maintains exact UUID matching between auth users and profiles
- **Automated Setup**: Eliminates manual user creation process
- **Safe Testing**: Dry-run mode prevents accidental changes during development
- **Comprehensive Logging**: Full audit trail of all operations
- **Error Handling**: Graceful failure handling with detailed error reporting
- **Flexibility**: Customizable passwords and email domains for different environments
- **Integration Ready**: Works seamlessly with existing sample data structure

**Files Created**:
- `scripts/create-auth-users.js` - Main script for auth user creation
- `scripts/README.md` - Comprehensive documentation and usage guide

**Files Modified**:
- `package.json` - Added `create:auth-users` npm script

**Next Steps**:
- Test script with actual Supabase instance to verify user creation
- Consider adding user role validation and permission setup
- Explore adding user group/team assignment functionality
- Consider adding user preference and setting initialization

### 2025-08-30 - Separated Seed Data Structure Creation

**Changes Made:**
- **Seed Data Reorganization**: Successfully separated the monolithic sample data into individual, properly structured seed data files
  - **File Separation**: Converted single large JSON files into 10 separate, focused seed data files
  - **Referential Integrity**: Maintained all foreign key relationships and UUID references across tables
  - **Import Order**: Established proper import sequence to respect database dependencies
  - **Documentation**: Created comprehensive README explaining the new structure and usage

**Technical Details:**
- **File Structure Created**:
  - `01-organizations.json` - Base organizations (Factory Pulse + customers/suppliers)
  - `02-workflow-stages.json` - 8 workflow stages with colors and responsibilities
  - `03-users.json` - 16 internal Factory Pulse employees with roles and hierarchy
  - `04-contacts.json` - 10 external customers and suppliers with AI categorization
  - `05-projects.json` - 7 sample projects across different industries
  - `06-documents.json` - 8 project documents with AI processing data
  - `07-reviews.json` - 9 project reviews with risk assessments
  - `08-messages.json` - 10 communication messages with thread structure
  - `09-notifications.json` - 13 user notifications with delivery methods
  - `10-activity-log.json` - 18 system activity log entries for audit trail

- **Data Relationships Maintained**:
  - All UUIDs preserved to maintain referential integrity
  - Foreign key relationships properly established across all tables
  - Organization-based multi-tenancy structure maintained
  - User hierarchy and direct reports preserved
  - Project-stage relationships maintained

- **Import Sequence Established**:
  1. Organizations (base entities)
  2. Workflow Stages (referenced by projects)
  3. Users (referenced by multiple tables)
  4. Contacts (referenced by projects)
  5. Projects (central entity)
  6. Documents (referenced by projects)
  7. Reviews (referenced by projects)
  8. Messages (referenced by projects)
  9. Notifications (referenced by users/projects)
  10. Activity Log (references all entities)

**Benefits of New Structure:**
- **Easier Management**: Individual files are easier to maintain and update
- **Selective Import**: Can import specific tables without affecting others
- **Better Testing**: Can test individual table data independently
- **Clearer Dependencies**: Import order clearly shows table relationships
- **Version Control**: Better tracking of changes to specific data types
- **Development Workflow**: Easier to work with specific data sets during development

**Files Created:**
- `sample-data/01-organizations.json` - Organizations seed data
- `sample-data/02-workflow-stages.json` - Workflow stages seed data
- `sample-data/03-users.json` - Users seed data
- `sample-data/04-contacts.json` - Contacts seed data
- `sample-data/05-projects.json` - Projects seed data
- `sample-data/06-documents.json` - Documents seed data
- `sample-data/07-reviews.json` - Reviews seed data
- `sample-data/08-messages.json` - Messages seed data
- `sample-data/09-notifications.json` - Notifications seed data
- `sample-data/10-activity-log.json` - Activity log seed data
- `sample-data/README-separated-seed-data.md` - Comprehensive documentation

**Data Overview:**
- **Organizations**: 5 total (1 main + 4 customers/suppliers)
- **Users**: 16 internal employees across 8 departments
- **Projects**: 7 active projects in various industries
- **Documents**: 8 documents with AI processing capabilities
- **Reviews**: 9 reviews with comprehensive feedback
- **Messages**: 10 messages with thread-based communication
- **Notifications**: 13 notifications with multiple delivery methods
- **Activity Log**: 18 entries providing complete audit trail

**Important Notes:**
- **Local Development Only**: All data configured for local Supabase development
- **Vietnamese Context**: Realistic Vietnamese manufacturing industry data
- **Multi-tenant Ready**: Structure supports multiple organizations with proper isolation
- **AI Integration**: Includes AI processing fields for future automation
- **Complete Audit Trail**: Full activity logging for compliance and debugging

### 2025-01-30 - Workflow Stages Table Schema Alignment

**Changes Made:**
- **Database Schema Alignment**: Successfully aligned the `workflow_stages` table in Supabase with the expected database schema and sample data
  - **Missing Columns Added**: Added `organization_id`, `slug`, `color`, `exit_criteria`, and `responsible_roles` columns
  - **Column Renaming**: Renamed `order_index` to `stage_order` to match expected schema
  - **Data Migration**: Preserved existing workflow stage IDs while adding missing data for new columns
  - **Seed Data Update**: Updated seed.sql to include all required columns with proper sample data

**Important Lesson Learned:**
- **NEVER reset the entire database** when working with existing data - this destroys user authentication, projects, and other important data
- **Always use targeted migrations** that only add/modify specific columns without affecting existing data
- **Work with local Supabase only** unless explicitly configured for remote deployment
- **Preserve existing IDs** to maintain referential integrity with other tables

**Technical Details:**
- **Migration File**: Created `20250130000002_add_missing_workflow_stages_columns.sql` migration
  - Added `organization_id` as UUID FK to organizations table
  - Added `slug` as VARCHAR(100) for URL-friendly stage names
  - Added `color` as VARCHAR(7) for stage visualization
  - Added `exit_criteria` as TEXT for stage completion requirements
  - Added `responsible_roles` as TEXT[] for role assignments
  - Renamed `order_index` to `stage_order` for schema consistency

- **Data Population**:
  - Set default `organization_id` to Factory Pulse Vietnam organization
  - Applied color scheme matching sample data (blue, amber, orange, emerald, indigo, violet, lime, gray)
  - Generated slugs from stage names (e.g., "Inquiry Received" → "inquiry_received")
  - Set comprehensive exit criteria for each workflow stage
  - Assigned appropriate responsible roles for each stage

- **Indexes and Constraints**:
  - Added indexes for `organization_id` and `slug` columns
  - Maintained existing foreign key relationships
  - Preserved all existing workflow stage IDs to maintain referential integrity

**Impact:**
- ✅ Workflow stages table now matches expected database schema exactly
- ✅ All 8 workflow stages have complete data including colors, slugs, and exit criteria
- ✅ Maintained backward compatibility with existing project references
- ✅ Database schema now aligns with application expectations
- ✅ Sample data structure matches actual database implementation

**Files Modified:**
- `supabase/migrations/20250130000002_add_missing_workflow_stages_columns.sql` - New migration for missing columns
- `supabase/seed.sql` - Updated workflow stages INSERT statement with all required columns

**Database Schema Now Includes:**
- `id` (UUID, PK) - Preserved existing IDs for referential integrity
- `organization_id` (UUID, FK) - Links to organizations table
- `name` (VARCHAR(100)) - Stage display name
- `slug` (VARCHAR(100)) - URL-friendly identifier
- `description` (TEXT) - Stage description
- `color` (VARCHAR(7)) - Hex color for visualization
- `stage_order` (INTEGER) - Renamed from order_index
- `is_active` (BOOLEAN) - Stage availability flag
- `exit_criteria` (TEXT) - Stage completion requirements
- `responsible_roles` (TEXT[]) - Array of responsible roles
- `estimated_duration_days` (INTEGER) - Expected stage duration
- `required_approvals` (JSONB) - Approval requirements
- `auto_advance_conditions` (JSONB) - Auto-advance rules
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `updated_at` (TIMESTAMPTZ) - Last update timestamp

### 2025-01-30 - Projects Page Enhanced Component Integration

**Changes Made:**
- **Enhanced Component Integration**: Successfully integrated sophisticated project components from `components/project` folder into the main Projects page
  - **ProjectWorkflowAnalytics**: Replaced basic analytics cards with enhanced analytics component providing dynamic workflow analysis, bottleneck detection, and priority distribution charts
  - **ProjectCalendar**: Replaced placeholder calendar with full-featured calendar component supporting monthly views, project filtering, and multiple date display modes
  - **ProjectTable**: Successfully integrated enhanced table component with sorting, filtering, and status update capabilities
  - **Component Imports**: Added imports for WorkflowStepper, AnimatedProjectCard, ProjectTable, ProjectCalendar, and ProjectWorkflowAnalytics

**Technical Details:**
- **Analytics Tab Enhancement**: 
  - Replaced static 4-card layout with dynamic ProjectWorkflowAnalytics component
  - Component automatically calculates stage distribution, bottlenecks, and workflow efficiency metrics
  - Provides interactive charts and visualizations for project data analysis

- **Calendar Tab Enhancement**:
  - Replaced "Coming Soon" placeholder with functional ProjectCalendar component
  - Supports project type filtering and multiple date display modes (due dates, created dates, stage entry dates)
  - Provides interactive monthly calendar navigation and project overview

- **Table Tab Enhancement**:
  - Successfully integrated ProjectTable component with proper props interface
  - Replaced basic HTML table with sophisticated table component
  - Maintains project type filtering and provides enhanced table functionality

- **Flowchart Tab Enhancement**:
  - **Workflow Visualization**: Completely redesigned to match the image design with horizontal flow layout
  - **Horizontal Stage Flow**: Shows all 8 workflow stages in a horizontal sequence with arrow connectors
  - **Stage Selection**: Clickable stage cards with visual feedback (ring highlight, shadow)
  - **Project Counts**: Color-coded badges showing project counts for each stage
  - **Progress Bar**: Dynamic progress bar that shows workflow progress based on selected stage
  - **Enhanced Project Display**: Comprehensive project information when a stage is selected
  - **Responsive Design**: Horizontal scrolling for smaller screens while maintaining visual flow
  - **Database Integration**: Fixed to show all 8 workflow stages from database instead of only stages with projects

- **Component Architecture**:
  - Maintained existing tab structure and navigation
  - Preserved project type filtering functionality across all tabs
  - Integrated components with existing error handling and loading states
  - Components automatically handle project data filtering and display

**Impact:**
- ✅ Analytics tab now provides sophisticated project workflow analysis with interactive charts
- ✅ Calendar tab now offers full calendar functionality instead of placeholder content
- ✅ Table tab now uses enhanced ProjectTable component with better functionality
- ✅ **Flowchart tab now provides professional workflow visualization matching the design image**
- ✅ **Shows all 8 workflow stages in proper horizontal flow with project counts**
- ✅ **Fixed database integration to display all stages, not just those with projects**
- ✅ **Interactive stage selection with visual feedback and progress tracking**
- ✅ **Enhanced project details display when stages are selected**
- ✅ Improved user experience with professional-grade project management tools
- ✅ Maintained existing functionality while adding advanced features
- ✅ Ready for further integration of WorkflowStepper and AnimatedProjectCard components

**Files Modified:**
- `src/pages/Projects.tsx` - Added component imports and integrated ProjectWorkflowAnalytics, ProjectCalendar, and ProjectTable
- **Enhanced flowchart tab with professional workflow visualization matching the image design**
- **Added horizontal stage flow, progress bar, and enhanced project display**
- **Fixed workflow stages loading to show all 8 stages from database**

**Next Steps for Full Integration:**
- Integrate WorkflowStepper component into flowchart tab for individual project workflow visualization
- Use AnimatedProjectCard for better project visualization in stage overview
- Integrate StageFlowchart component for improved stage navigation

### 2025-01-30 - WorkflowFlowchart Component Database Integration

**Changes Made:**
- **Dynamic Workflow Stages**: Updated `WorkflowFlowchart.tsx` to use database-driven workflow stages instead of static `PROJECT_STAGES` constant
  - Integrated `workflowStageService` for dynamic stage loading from database
  - Added loading state for workflow stages with proper error handling
  - Replaced all references to legacy `PROJECT_STAGES` with dynamic `workflowStages` state
  - Updated stage filtering and project grouping to use database stage IDs

**Technical Details:**
- **Service Integration**: 
  - Added `workflowStageService` import and usage for stage management
  - Implemented `useEffect` hook to load workflow stages on component mount
  - Added `stagesLoading` state to handle async stage loading

- **Stage Management**:
  - Updated `projectsByStage` calculation to use dynamic workflow stages
  - Fixed stage selection to work with database stage IDs instead of legacy enum values
  - Updated stage transition validation to use `workflowStageService.validateStageTransition`
  - Improved stage color handling with fallback to database `color` field

- **Component Architecture**:
  - Removed unused imports (`DropdownMenu`, `Progress`, `Tooltip`, navigation utilities)
  - Cleaned up unused state variables (`isUpdating`, `updatingProjects`, `navigate`)
  - Simplified component props interface to focus on essential functionality
  - Added proper loading state handling for better user experience

- **Type Safety Improvements**:
  - Fixed type mismatches between `ProjectStatus` and workflow stage IDs
  - Updated function signatures to work with string stage IDs instead of enum values
  - Improved error handling with proper type checking for stage operations

**Impact:**
- ✅ Component now fully supports database-driven workflow configuration
- ✅ Eliminates dependency on hardcoded `PROJECT_STAGES` constant
- ✅ Enables dynamic workflow customization without code changes
- ✅ Improves type safety and reduces runtime errors
- ✅ Provides better user experience with loading states and error handling

**Files Modified:**
- `src/components/project/WorkflowFlowchart.tsx` - Complete refactor for database integration

### 2025-01-30 - WorkflowStage Interface Database Schema Alignment

**Changes Made:**
- **WorkflowStage Interface Refactoring**: Updated `src/types/project.ts` to align with actual database schema
  - Moved `slug`, `stage_order`, `color`, `exit_criteria`, `responsible_roles` from legacy to core fields
  - Made `order_index` and other computed fields optional for backward compatibility
  - Aligned field names with database column names from `workflow_stages` table

**Technical Details:**
- **Core Database Fields**: 
  - `slug: string` - URL-friendly stage identifier
  - `stage_order: number` - Numeric ordering for stage sequence
  - `color?: string` - Visual color coding for UI display
  - `exit_criteria?: string` - Conditions required to exit this stage
  - `responsible_roles?: string[]` - Roles responsible for this stage
  - `organization_id?: string` - Multi-tenant organization association

- **Computed Fields for Compatibility**:
  - `order_index?: number` - Computed from `stage_order` for legacy compatibility
  - `estimated_duration_days?: number` - Optional duration estimates
  - `required_approvals?: any[]` - Approval requirements (future feature)
  - `auto_advance_conditions?: Record<string, any>` - Automation rules (future feature)

- **Database Schema Alignment**:
  - Interface now matches `workflow_stages` table structure exactly
  - Supports dynamic workflow configuration from database
  - Maintains backward compatibility with legacy enum-based system

**Impact:**
- ✅ Type system now accurately reflects database schema
- ✅ Supports dynamic workflow stages configured in database
- ✅ Maintains backward compatibility with existing code
- ✅ Enables future workflow customization features
- ✅ Fixes type mismatches in WorkflowFlowchart and related components

**Files Modified:**
- `src/types/project.ts` - Updated WorkflowStage interface structure

### 2025-01-30 - Projects Page Table View Simplification

**Changes Made:**
- **Table View Refactoring**: Replaced complex `ProjectTable` component with simplified HTML table in `src/pages/Projects.tsx`
  - Removed dependency on `ProjectTable` component for table tab view
  - Implemented basic HTML table with essential project information
  - Maintained project type filtering functionality
  - Preserved responsive design with overflow-x-auto wrapper

**Technical Details:**
- **Component Simplification**: 
  - Removed: `ProjectTable` component usage in table tab
  - Added: Basic HTML table with inline styling using Tailwind CSS
  - Maintained: Project filtering by type and status

- **Table Structure**:
  - Columns: Project ID, Title, Status, Stage, Type, Value
  - Styling: Gray borders, hover effects, responsive badges
  - Data: Filtered by `selectedProjectType` and active projects only
  - Formatting: Currency formatting for estimated values

- **UI Consistency**:
  - Uses existing Badge components for status and project type
  - Maintains consistent styling with rest of application
  - Preserves project type filtering functionality

**Impact:**
- ✅ Simplified table implementation reduces component complexity
- ✅ Maintains all essential project information display
- ✅ Preserves filtering and responsive design
- ✅ Reduces potential for component-level errors in table view

**Files Modified:**
- `src/pages/Projects.tsx` - Replaced ProjectTable component with HTML table

### 2025-01-30 - Projects Page Type System Refactoring

**Changes Made:**
- **Type System Alignment**: Updated `src/pages/Projects.tsx` to properly use the new type system
  - Removed incorrect `ProjectStatus` import (which refers to project status like 'active', 'completed')
  - Added proper `WorkflowStage` import for workflow stage management
  - Fixed type mismatches between legacy `ProjectStage` enum and new `WorkflowStage` interface

**Technical Details:**
- **Import Changes**: 
  - Removed: `ProjectStatus` (project lifecycle status)
  - Added: `WorkflowStage` (workflow stage interface from database)
  - Kept: `ProjectStage` (legacy enum for backward compatibility)

- **Function Signature Updates**:
  - Updated `updateProjectStatusOptimistic` in `useProjects.ts` to return `Promise<boolean>` instead of `void`
  - This aligns with component expectations in `WorkflowFlowchart.tsx` and `ProjectTable.tsx`

- **Stage Management**:
  - Updated stage counting logic to use new `WorkflowStage` system
  - Maintained backward compatibility with legacy `ProjectStage` enum
  - Fixed stage selection to work with workflow stage IDs

- **Component Props**:
  - Fixed `ProjectWorkflowAnalytics` component to receive required `projects` prop
  - Cleaned up unused imports (`StageFlowchart`, `EnhancedProjectSummary`)

**Impact:**
- ✅ Build now passes without TypeScript errors
- ✅ Projects page properly handles new workflow stage system
- ✅ Maintains backward compatibility with existing data
- ✅ Improved type safety and consistency

**Files Modified:**
- `src/pages/Projects.tsx` - Main projects page component
- `src/hooks/useProjects.ts` - Updated function signature for optimistic updates

### 2025-01-30 - Data Mapping and Legacy Compatibility Enhancement

**Changes Made:**
- **Legacy Field Mapping**: Enhanced `useProjects.ts` to provide comprehensive legacy field compatibility
  - Added `due_date` mapping from `estimated_delivery_date` for backward compatibility
  - Added `priority` mapping from `priority_level` for legacy component support
  - Enhanced `current_stage` object with computed `order_index` from `stage_order`

**Technical Details:**
- **Field Mappings**:
  - `due_date`: Maps to `estimated_delivery_date` for components expecting legacy field names
  - `priority`: Maps to `priority_level` for components using old priority field structure
  - `order_index`: Computed from `stage_order` in workflow stage objects for sorting compatibility

- **Data Transformation**:
  - Applied during project data fetching in `fetchProjects` function
  - Ensures all legacy components continue to work without modification
  - Maintains database schema alignment while providing backward compatibility

- **Workflow Stage Enhancement**:
  - Current stage objects now include both database fields (`stage_order`) and computed fields (`order_index`)
  - Enables seamless transition between old and new workflow systems
  - Supports existing sorting and ordering logic in components

**Impact:**
- ✅ Full backward compatibility with legacy component expectations
- ✅ Seamless data flow between database schema and component interfaces
- ✅ Eliminates need to update all legacy components immediately
- ✅ Maintains type safety while providing flexible field access

**Files Modified:**
- `src/hooks/useProjects.ts` - Enhanced data mapping and legacy field support

## Architecture Notes

### Type System Evolution
The project has completed transition from a legacy enum-based stage system to a dynamic database-driven workflow system:

- **Legacy System**: `ProjectStage` enum with hardcoded stages (maintained for backward compatibility)
- **Current System**: `WorkflowStage` interface aligned with database schema
- **Database-Driven**: Workflow stages are now configurable via `workflow_stages` table
- **Status vs Stage**: `ProjectStatus` refers to project lifecycle (active/completed), while stages refer to workflow position
- **Schema Alignment**: Interface fields now match database columns exactly (`slug`, `stage_order`, `color`, etc.)
- **Computed Fields**: Legacy fields like `order_index` are computed from database fields for compatibility

### Component Architecture
- **Error Boundaries**: Comprehensive error handling with `ProjectErrorBoundary`
- **Optimistic Updates**: UI updates immediately, then syncs with database
- **Real-time Updates**: Uses Supabase real-time subscriptions for live data
- **Caching**: Intelligent caching system for performance optimization
- **Table Views**: Simplified HTML tables for better performance and maintainability
- **Legacy Compatibility**: Automatic field mapping for backward compatibility with existing components
- **Dynamic Workflow Stages**: Components now use database-driven workflow stages via `workflowStageService`
- **Service Layer**: Business logic encapsulated in service classes for better separation of concerns

## Development Guidelines

### Type Safety
- Always import the correct types for the context
- Use `ProjectStatus` for project lifecycle status ('active', 'completed', etc.)
- Use `ProjectStage` for legacy workflow stages (backward compatibility only)
- Use `WorkflowStage` for current database-driven workflow stages
- Use string IDs for workflow stage references (not enum values)
- Ensure interface fields match database schema exactly for new features
- Use computed fields (`order_index`) for legacy compatibility when needed
- Prefer `workflowStageService` methods over direct database queries for stage operations

### Error Handling
- Wrap components in appropriate error boundaries
- Use optimistic updates for better UX
- Provide fallback mechanisms for offline/error states

### Performance
- Leverage caching for frequently accessed data
- Use selective subscriptions for real-time updates
- Implement progressive loading for large datasets
- Prefer simple HTML tables over complex components for basic data display

### Data Compatibility
- Use automatic field mapping in data hooks for legacy component support
- Map database field names to expected component field names during data transformation
- Maintain both new database-aligned fields and legacy compatibility fields
- Ensure computed fields (like `order_index`) are available for existing sorting logic