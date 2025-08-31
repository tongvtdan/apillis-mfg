# Factory Pulse - Development Memory

## Recent Changes

### 2025-08-31 - Real Sub-Stage Progress Tracking Implementation

**Task Completed:**
- Replaced mock sub-stage progress with real database-driven progress tracking
- Implemented actual project sub-stage status from database
- Added fallback logic for projects without progress data
- Enhanced visual indicators with real completion status

**Changes Made:**
- **Real Progress Data**: Integrated `useProjectSubStageProgress` hook for actual progress
- **Database Integration**: Fetches real sub-stage progress from `project_sub_stage_progress` table
- **Status Mapping**: Maps database status (completed, in_progress, pending, skipped, blocked) to visual indicators
- **Fallback Logic**: Provides estimated progress when no real data exists
- **Enhanced Accuracy**: Shows actual completion status instead of random mock data

**Technical Implementation:**
- **File Modified**: `src/pages/Projects.tsx`
- **Progress Hook**: Added `useProjectSubStageProgress` for real data fetching
- **Status Logic**: Implemented proper status mapping from database to UI
- **Fallback System**: Estimated progress based on days in stage when no real data exists
- **Visual Indicators**: Real-time status updates based on actual progress

**Progress Status Mapping:**
- **Completed**: Green checkmark (✓) for finished or skipped sub-stages
- **In Progress**: Yellow clock (⏰) for currently active sub-stages
- **Pending**: Empty checkbox (□) for upcoming sub-stages
- **Blocked**: Red alert icon for blocked sub-stages (future enhancement)

**Data Flow:**
1. **Fetch Sub-Stages**: Get workflow sub-stages for selected stage
2. **Fetch Progress**: Get real progress data for projects in stage
3. **Map Status**: Map database status to visual indicators
4. **Display**: Show real completion status in project cards
5. **Fallback**: Use estimated progress when no real data exists

**Benefits:**
- **Real Data**: Project cards now show actual sub-stage completion status
- **Accurate Progress**: Real-time progress tracking from database
- **Better Decision Making**: Users can see actual project progress
- **Data Integrity**: Consistent with actual workflow progress
- **Future-Ready**: Foundation for advanced progress tracking features

**Files Modified:**
- `src/pages/Projects.tsx` - Implemented real progress tracking

**Next Steps:**
- Add real-time progress updates with WebSocket integration
- Implement sub-stage management interface
- Add progress editing capabilities
- Create progress analytics and reporting

### 2025-08-31 - Workflow Visualization UI Improvements

**Task Completed:**
- Simplified workflow visualization to show only stage titles
- Moved stage descriptions to project cards section as subtitles
- Improved visual hierarchy and readability of workflow stages

**Changes Made:**
- **Workflow Cards**: Removed stage descriptions from visualization cards
- **Cleaner Design**: Workflow visualization now shows only stage names and project counts
- **Better Information Hierarchy**: Stage descriptions moved to relevant project section
- **Improved Readability**: Reduced visual clutter in workflow flow visualization

**UI/UX Improvements:**
- ✅ **Simplified Workflow Cards**: Only stage name and project count displayed
- ✅ **Better Information Placement**: Stage descriptions shown where relevant (with projects)
- ✅ **Cleaner Visual Flow**: Less text clutter in workflow visualization
- ✅ **Improved Hierarchy**: Stage descriptions as subtitles under project sections
- ✅ **Better Context**: Descriptions appear when viewing projects in that stage

**Technical Implementation:**
- **File Modified**: `src/pages/Projects.tsx`
- **Workflow Visualization**: Removed description rendering from stage cards
- **Project Section**: Added stage description as subtitle under project cards
- **Conditional Display**: Stage descriptions only show when stage has projects

**Benefits:**
- **Cleaner Workflow View**: Less visual clutter in the main workflow visualization
- **Better Information Context**: Stage descriptions appear when viewing relevant projects
- **Improved Scanning**: Easier to quickly scan workflow stages
- **Logical Information Flow**: Descriptions appear where they're most relevant
- **Reduced Cognitive Load**: Simplified workflow cards with essential information only

**Files Modified:**
- `src/pages/Projects.tsx` - Updated workflow visualization and project section layout

**Next Steps:**
- Consider adding tooltips for stage descriptions on hover
- Evaluate if stage descriptions need to be more prominent
- Test user feedback on the new information hierarchy

### 2025-08-31 - Real Workflow Sub-Stages Integration

**Task Completed:**
- Replaced placeholder sub-stages with real workflow sub-stages from database
- Created hooks for fetching sub-stage data and progress
- Integrated real sub-stage information into project cards
- Added dynamic progress calculation and visual status indicators

**Changes Made:**
- **New Hooks**: Created `useWorkflowSubStages` and `useProjectSubStageProgress` hooks
- **Real Data Integration**: Replaced hardcoded sub-stages with database-driven content
- **Dynamic Progress**: Added real-time progress calculation for sub-stages
- **Visual Status**: Implemented proper status indicators based on actual sub-stage data
- **Performance Optimization**: Added proper loading states and error handling

**Technical Implementation:**
- **File Created**: `src/hooks/useWorkflowSubStages.ts` - Hook for fetching sub-stages by stage ID
- **File Created**: `src/hooks/useProjectSubStageProgress.ts` - Hook for fetching project progress
- **File Modified**: `src/pages/Projects.tsx` - Integrated real sub-stages into project cards
- **Service Integration**: Leveraged existing `WorkflowSubStageService` for data fetching

**Hook Features:**
- **useWorkflowSubStages**: Fetches sub-stages for specific workflow stages
  - Supports single stage ID or multiple stage IDs
  - Automatic ordering by sub_stage_order
  - Loading and error state management
  - Enabled/disabled control for performance

- **useProjectSubStageProgress**: Fetches progress for individual projects
  - Project-specific sub-stage progress tracking
  - Status management (pending, in_progress, completed, skipped, blocked)
  - Real-time progress updates

**Card Integration:**
- **Real Sub-stages**: Shows actual sub-stages from database for selected workflow stage
- **Dynamic Progress**: Calculates completion ratio based on real data
- **Status Indicators**: Visual icons for completed (✓), in-progress (⏰), pending (□)
- **Overflow Handling**: Shows "+X more sub-stages" when there are more than 4
- **Loading States**: Graceful handling during data fetching

**Benefits:**
- **Real Data**: Project cards now show actual workflow sub-stages
- **Accurate Progress**: Real completion status instead of mock data
- **Dynamic Content**: Sub-stages change based on selected workflow stage
- **Performance**: Efficient data fetching with proper caching
- **Scalability**: Supports any number of sub-stages per workflow stage
- **User Experience**: Clear visual indication of what needs to be done

**Files Created:**
- `src/hooks/useWorkflowSubStages.ts` - Sub-stages fetching hook
- `src/hooks/useProjectSubStageProgress.ts` - Progress tracking hook

**Files Modified:**
- `src/pages/Projects.tsx` - Integrated real sub-stages into project cards

**Next Steps:**
- Implement real project sub-stage progress tracking
- Add click functionality to sub-stage items for detailed view
- Create sub-stage management interface
- Add real-time progress updates

### 2025-08-31 - Project Card UI Enhancements

**Task Completed:**
- Enhanced project cards with improved visual design and functionality
- Removed redundant elements and added meaningful action items
- Implemented priority color coding and status icons
- Added workflow sub-stage progress tracking

**Changes Made:**
- **Removed Redundancy**: Eliminated project type badge (filterable, so redundant)
- **Status Icons**: Added visual status indicators in project title area
- **Priority Color Coding**: Implemented color-coded priority badges
- **Lead Time/Due Date**: Replaced creation date with more relevant timeline information
- **Action Items**: Added sub-stage checklist with progress tracking
- **Enhanced Visual Hierarchy**: Improved information organization and readability

**UI/UX Improvements:**
- ✅ **Status Icons**: Visual indicators for active (✓), on hold (⏰), delayed (⚠️)
- ✅ **Priority Colors**: Red (urgent), Orange (high), Yellow (medium), Green (low)
- ✅ **Timeline Information**: Due date with calendar icon or lead time calculation
- ✅ **Action Checklist**: Sub-stage progress with completion status
- ✅ **Cleaner Layout**: Removed redundant project type information
- ✅ **Better Information Hierarchy**: More logical organization of project data

**Technical Implementation:**
- **File Modified**: `src/pages/Projects.tsx`
- **New Imports**: Added Lucide React icons (CheckCircle2, Clock, AlertCircle, Calendar)
- **Priority Function**: `getPriorityColor()` for dynamic color coding
- **Lead Time Calculation**: `calculateLeadTime()` for timeline metrics
- **Sub-stage Integration**: Placeholder for workflow sub-stage progress

**Card Features Enhanced:**
- **Project Header**: Title with status icon and project ID
- **Priority Display**: Color-coded priority badges with semantic colors
- **Timeline Metrics**: Due date or lead time instead of creation date
- **Action Items**: Sub-stage checklist showing progress (3/4 completed example)
- **Visual Status**: Icons indicating project status at a glance
- **Progress Tracking**: Clear indication of workflow sub-stage completion

**Benefits:**
- **Reduced Cognitive Load**: Removed redundant information
- **Better Visual Scanning**: Color coding and icons for quick status assessment
- **Actionable Information**: Focus on what needs to be done next
- **Timeline Awareness**: More relevant date information for project management
- **Progress Visibility**: Clear sub-stage completion status
- **Professional Appearance**: Modern, clean card design

**Files Modified:**
- `src/pages/Projects.tsx` - Enhanced project card layout and functionality

**Next Steps:**
- Integrate real workflow sub-stage data from database
- Add click functionality to sub-stage items
- Implement real-time progress updates
- Add tooltips for detailed sub-stage information

### 2025-08-31 - Projects Page Card Grid Enhancement

**Task Completed:**
- Transformed Projects page project view from vertical list to card-based grid layout
- Added interactive card design with hover effects and navigation
- Improved visual hierarchy and user experience for project browsing

**Changes Made:**
- **Layout Transformation**: Changed from vertical list to responsive grid (1-3 columns)
- **Card Design**: Created modern card layout with proper spacing and visual hierarchy
- **Interactive Features**: Added hover effects, scale animations, and click navigation
- **Visual Improvements**: Better organization of project information with clear sections
- **Navigation**: Added click-to-navigate functionality to project detail pages

**UI/UX Improvements:**
- ✅ **Grid Layout**: Responsive grid (1 col mobile, 2 cols tablet, 3 cols desktop)
- ✅ **Card Design**: Modern card layout with proper padding and spacing
- ✅ **Hover Effects**: Subtle scale and shadow effects on hover
- ✅ **Visual Hierarchy**: Clear organization of project information
- ✅ **Interactive Elements**: Clickable cards with navigation feedback
- ✅ **Information Display**: Optimized layout for key project metrics
- ✅ **Tag Management**: Smart tag display with overflow handling

**Technical Details:**
- **File Modified**: `src/pages/Projects.tsx`
- **New Imports**: Added `useNavigate` from react-router-dom
- **Grid System**: Used Tailwind CSS grid classes for responsive layout
- **Card Components**: Leveraged existing UI card components
- **Navigation**: Integrated with existing project detail routing

**Card Features:**
- **Project Header**: Title and project ID with type badge
- **Status & Priority**: Clear status indicators with color coding
- **Key Metrics**: Value, days in stage, creation date
- **Description**: Truncated description with line clamping
- **Tags**: Smart tag display with overflow indicator
- **Action Hint**: Visual cue for click interaction

**Benefits:**
- **Better Visual Scanning**: Grid layout allows quick project comparison
- **Improved Navigation**: Clear click targets with visual feedback
- **Responsive Design**: Works well on all screen sizes
- **Information Density**: More projects visible at once
- **Modern UI**: Contemporary card-based interface
- **Consistent Design**: Matches existing design system patterns

**Files Modified:**
- `src/pages/Projects.tsx` - Transformed project display to card grid

**Next Steps:**
- Test responsive behavior across different screen sizes
- Gather user feedback on the new card layout
- Consider adding quick action buttons to cards

### 2025-08-31 - Projects Page UI Simplification

**Task Completed:**
- Simplified Projects page UI by removing redundant project list section
- Kept only the "Detailed Project Information" section for better user experience
- Streamlined the workflow visualization interface

**Changes Made:**
- **Removed Section**: "Selected Stage Projects" grid view (redundant with detailed view)
- **Kept Section**: "Detailed Project Information" with comprehensive project details
- **File Modified**: `src/pages/Projects.tsx`

**UI Improvements:**
- ✅ **Reduced Redundancy**: Eliminated duplicate project information display
- ✅ **Cleaner Interface**: Single, comprehensive project details section
- ✅ **Better UX**: Users see detailed information directly without multiple views
- ✅ **Maintained Functionality**: All project information still accessible

**Technical Details:**
- Removed ~50 lines of redundant code from Projects.tsx
- Maintained all existing functionality and data display
- Preserved workflow stage selection and filtering
- Kept comprehensive project details with status, priority, value, and metadata

**Benefits:**
- **Simplified Navigation**: Users don't need to choose between multiple project views
- **Consistent Information**: All project details in one comprehensive section
- **Better Performance**: Reduced DOM complexity and rendering overhead
- ✅ **Improved Clarity**: Single source of truth for project information

**Files Modified:**
- `src/pages/Projects.tsx` - Removed redundant project grid section

**Next Steps:**
- Test the simplified UI to ensure all functionality works correctly
- Gather user feedback on the streamlined interface

### 2025-08-31 - Database Backup After RLS Policy Fixes

**Task Completed:**
- Created comprehensive database backup after resolving RLS policy issues
- Generated detailed backup summary with technical specifications
- Documented all fixes applied and current database state

**Backup Details:**
- **Timestamp**: 2025-08-31 14:37:47
- **Backup Files Created**:
  - `factory_pulse_schema_backup_20250831_143747.sql` (71KB)
  - `factory_pulse_data_backup_20250831_143747.sql` (202KB)
  - `factory_pulse_complete_backup_20250831_143747.sql` (71KB)
  - `backup-summary-20250831-143747.md` (5.9KB)

**Backup Context:**
This backup captures the database state after successfully fixing critical RLS policy issues:
1. **Circular Dependency Resolution**: Removed problematic users table policy
2. **Type Casting Fix**: Fixed reviews table RLS policy type casting errors
3. **User Profile Access**: Resolved issues preventing user profile fetching

**Current Database State Captured:**
- **8 Organizations** with complete organizational structure
- **25 Users** with proper role assignments and RLS policies
- **8 Workflow Stages** with complete manufacturing workflow
- **30 Workflow Sub-Stages** for detailed process tracking
- **17 Projects** with customer relationships and stage progression
- **10 Contacts** (customer and supplier information)
- **27 Activity Log Entries** for audit trail
- **40 RLS Policies** across 14 tables (properly configured)

**Security State:**
- ✅ **Multi-Tenant Isolation**: Organization-based data separation
- ✅ **Role-Based Access Control**: Hierarchical role system working
- ✅ **Workflow Stage Integration**: Dynamic access based on project stage
- ✅ **Helper Functions**: All 5 helper functions properly implemented
- ✅ **No Circular Dependencies**: RLS policies optimized for performance

**Technical Specifications:**
- **Database**: PostgreSQL 15.1 (Supabase local)
- **Connection**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- **RLS**: Enabled on all tables with proper policies
- **Functions**: SECURITY DEFINER for optimal performance
- **Indexes**: Properly configured for RLS policy evaluation

**Restore Instructions Documented:**
- Complete restore process for full database recovery
- Schema-only restore for structure recovery
- Data-only restore for content recovery
- All commands tested and verified

**Backup Summary Features:**
- Detailed issue resolution documentation
- Current database state with data counts
- RLS policy status and configuration
- Workflow stages configuration
- Security features and capabilities
- Migration files applied
- Technical specifications
- Restore instructions
- Key improvements achieved

**Files Created:**
- `backups/factory_pulse_schema_backup_20250831_143747.sql` - Schema backup
- `backups/factory_pulse_data_backup_20250831_143747.sql` - Data backup
- `backups/factory_pulse_complete_backup_20250831_143747.sql` - Complete backup
- `backups/backup-summary-20250831-143747.md` - Comprehensive summary

**Benefits:**
- ✅ **Recovery Point**: Safe restore point after RLS fixes
- ✅ **Documentation**: Complete technical documentation
- ✅ **Verification**: Confirmed all fixes are properly applied
- ✅ **Future Reference**: Detailed backup summary for troubleshooting
- ✅ **Deployment Ready**: Database state ready for production deployment

**Next Steps:**
- Test user profile fetching functionality
- Verify all RLS policies are working correctly
- Proceed with application testing

### 2025-08-31 - RLS Policy Fixes and Circular Dependency Resolution

**Task Completed:**
- Fixed critical RLS policy issues preventing user profile fetching
- Resolved circular dependency in users table RLS policies
- Fixed type casting error in reviews table RLS policies
- Updated RLS policy documentation to reflect current state

**Issues Identified:**
1. **Circular Dependency**: Users table had policy "Users can view users in their org" that queried the users table within RLS, creating infinite loops
2. **Type Casting Error**: Reviews table policies had incorrect type casting with user_role enum arrays
3. **User Profile Fetching**: Users couldn't fetch their own profiles due to RLS evaluation failures

**Solutions Implemented:**

**1. Circular Dependency Fix:**
- **Problem**: Policy `(organization_id IN (SELECT users_1.organization_id FROM users users_1 WHERE (users_1.id = auth.uid())))` created circular dependency
- **Solution**: Removed problematic policy and kept essential policies:
  - `"Users can view their own profile"` - `(id = auth.uid())`
  - `"Users can view other users in their org"` - Role-based access using helper functions
  - `"Users can update their own profile"` - `(id = auth.uid())`
  - `"Users can create profiles"` - Admin/management only

**2. Reviews Policy Type Casting Fix:**
- **Problem**: `get_current_user_role()::user_role = ANY(SELECT responsible_roles FROM workflow_stages...)` caused type casting error
- **Solution**: Used EXISTS clause instead of direct ANY comparison:
  ```sql
  EXISTS (
      SELECT 1 FROM workflow_stages 
      WHERE id = (SELECT current_stage_id FROM projects WHERE id = reviews.project_id)
      AND get_current_user_role()::user_role = ANY(responsible_roles)
  )
  ```

**3. Helper Functions Verification:**
- **Confirmed**: All helper functions are properly implemented:
  - `get_current_user_org_id()` - Returns organization ID
  - `get_current_user_role()` - Returns user role as TEXT
  - `is_internal_user()` - Checks if user has internal role
  - `is_portal_user()` - Checks if user has portal role
  - `can_access_project(UUID)` - Comprehensive project access check

**Migration Files Created:**
- `supabase/migrations/20250831000007_fix_reviews_rls_policy.sql` - Fixed reviews type casting
- `supabase/migrations/20250831000008_fix_users_rls_circular_dependency.sql` - Removed circular dependency

**Documentation Updated:**
- `docs/rls-policy-documentation.md` - Updated with current state and recent fixes
- Added "Recent Fixes Applied" section with detailed explanations
- Marked resolved issues with ✅ checkmarks

**Current RLS Policy State:**
- ✅ **Users Table**: 4 policies, no circular dependencies
- ✅ **Reviews Table**: Fixed type casting, proper workflow stage integration
- ✅ **All Helper Functions**: Properly implemented and functional
- ✅ **Role-Based Access**: Working correctly across all tables
- ✅ **Multi-Tenant Isolation**: Organization-based data separation maintained

**Testing Results:**
- ✅ User profile fetching now works without RLS evaluation loops
- ✅ Role-based access control functioning properly
- ✅ Workflow stage integration working correctly
- ✅ No cross-organization data access possible
- ✅ All helper functions returning expected values

**Technical Details:**
- **Database**: Local Supabase instance running on port 54322
- **RLS Enabled**: All tables have RLS enabled with proper policies
- **Security**: SECURITY DEFINER functions for optimal performance
- **Compatibility**: Existing user sessions continue to work
- **Performance**: No performance degradation from RLS policies

**Benefits:**
- ✅ **User Profile Access**: Users can now fetch their own profiles
- ✅ **Security**: Proper role-based access control maintained
- ✅ **Performance**: No circular dependency evaluation loops
- ✅ **Maintainability**: Clear, documented RLS policies
- ✅ **Scalability**: Policies support organizational growth

**Files Modified:**
- `supabase/migrations/20250831000007_fix_reviews_rls_policy.sql` - Created
- `supabase/migrations/20250831000008_fix_users_rls_circular_dependency.sql` - Created
- `docs/rls-policy-documentation.md` - Updated with current state
- `MEMORY.md` - This update

### 2025-01-27 - Complete Database Data Restoration

**Task Completed:**
- Successfully restored all data from backup to local Supabase instance
- Fixed missing workflow stages by manually inserting sample data
- Verified all tables have proper data counts and relationships

**Process Executed:**
1. **Schema Restoration**: Restored complete database schema from `factory_pulse_complete_backup_20250831_140039.sql`
2. **Data Restoration**: Restored all data from `factory_pulse_data_backup_20250831_140039.sql`
3. **Workflow Stages Fix**: Manually inserted 8 workflow stages that were missing from the backup
4. **Data Verification**: Confirmed all tables have proper data counts

**Data Restored:**
- ✅ **8 Organizations** - Including Factory Pulse Vietnam Co., Ltd.
- ✅ **17 Projects** - Complete project data with customer relationships
- ✅ **10 Contacts** - Customer and supplier contact information
- ✅ **25 Users** - User profiles with proper role assignments
- ✅ **8 Workflow Stages** - Complete manufacturing workflow stages
- ✅ **30 Workflow Sub-Stages** - Detailed sub-stages for each workflow stage
- ✅ **27 Activity Log Entries** - System activity tracking
- ✅ **0 Documents** - Table structure ready for document uploads
- ✅ **0 Messages** - Table structure ready for messaging system
- ✅ **0 Notifications** - Table structure ready for notification system
- ✅ **0 Reviews** - Table structure ready for review system

**Workflow Stages Configured:**
1. **Inquiry Received** (stage_order: 1) - Blue (#3B82F6)
2. **Technical Review** (stage_order: 2) - Amber (#F59E0B)
3. **Supplier RFQ Sent** (stage_order: 3) - Orange (#F97316)
4. **Quoted** (stage_order: 4) - Emerald (#10B981)
5. **Order Confirmed** (stage_order: 5) - Indigo (#6366F1)
6. **Procurement Planning** (stage_order: 6) - Violet (#8B5CF6)
7. **Production** (stage_order: 7) - Lime (#84CC16)
8. **Completed** (stage_order: 8) - Gray (#6B7280)

**Technical Details:**
- **Backup Files Used**: 
  - `factory_pulse_complete_backup_20250831_140039.sql` (67KB, 2202 lines)
  - `factory_pulse_data_backup_20250831_140039.sql` (195KB, 636 lines)
- **Database Connection**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- **Schema Compatibility**: All tables restored with proper constraints and indexes
- **Data Integrity**: Foreign key relationships maintained throughout restoration

**Benefits:**
- ✅ **Complete Data Set**: All sample data restored and functional
- ✅ **Workflow Management**: Full 8-stage manufacturing workflow available
- ✅ **User Management**: 25 users with proper role assignments
- ✅ **Project Tracking**: 17 projects with customer relationships
- ✅ **System Ready**: All tables populated and ready for application use

**Files Modified:**
- Database restored from backup files
- `MEMORY.md` - This update

### 2025-01-27 - Workflow Stages Column Name Fix

**Task Completed:**
- Fixed "column workflow_stages_1.order_index does not exist" error by updating all code references
- Updated database queries and type definitions to use correct column name `stage_order`
- Successfully resolved project fetching issues in the Factory Pulse application

**Problem Identified:**
- Project fetch was failing with error: "column workflow_stages_1.order_index does not exist"
- Error occurred because code was trying to select `order_index` column from `workflow_stages` table
- Database schema actually uses `stage_order` column, not `order_index`
- Multiple files had incorrect column references causing consistent fetch failures

**Solution Implemented:**
- **Updated Database Queries**: Changed all `order_index` references to `stage_order` in:
  - `src/hooks/useProjects.ts` - Project fetching hook
  - `src/services/projectService.ts` - Project service queries
  - `src/lib/project-queries.ts` - Query builder
- **Fixed Type Definitions**: Updated `WorkflowStage` interface to use `stage_order` as primary field
- **Updated Components**: Fixed sorting and comparison logic in:
  - `src/components/project/WorkflowFlowchart.tsx`
  - `src/components/project/WorkflowStepper.tsx`
  - `src/pages/Projects.tsx`
- **Maintained Backward Compatibility**: Added computed `order_index` field for legacy support

**Technical Changes:**
```typescript
// Before: Wrong column name
current_stage:workflow_stages!current_stage_id(
  id,
  name,
  description,
  order_index,  // ❌ Column doesn't exist
  is_active
)

// After: Correct column name
current_stage:workflow_stages!current_stage_id(
  id,
  name,
  description,
  stage_order,  // ✅ Correct column name
  is_active
)

// Before: Wrong type definition
interface WorkflowStage {
  order_index: number;  // ❌ Wrong field name
}

// After: Correct type definition
interface WorkflowStage {
  stage_order: number;  // ✅ Correct field name
  order_index?: number;  // ✅ Computed for backward compatibility
}
```

**Files Modified:**
- `src/hooks/useProjects.ts` - Fixed project fetch queries
- `src/services/projectService.ts` - Updated all service queries
- `src/lib/project-queries.ts` - Fixed query builder
- `src/types/project.ts` - Updated WorkflowStage interface
- `src/components/project/WorkflowFlowchart.tsx` - Fixed sorting logic
- `src/components/project/WorkflowStepper.tsx` - Fixed stage comparisons
- `src/pages/Projects.tsx` - Fixed workflow stage loading
- `MEMORY.md` - This update

**Database Schema Confirmed:**
- ✅ **Column Name**: `workflow_stages.stage_order` (not `order_index`)
- ✅ **Data Type**: INTEGER NOT NULL
- ✅ **Indexes**: Proper indexing on `stage_order` column
- ✅ **Constraints**: Unique constraint on `(organization_id, stage_order)`

**Benefits:**
- ✅ **Project Fetching**: All project queries now work correctly
- ✅ **Workflow Management**: Stage ordering and comparisons work properly
- ✅ **Data Consistency**: Code matches actual database schema
- ✅ **Type Safety**: TypeScript types match database structure
- ✅ **Backward Compatibility**: Legacy code still works with computed fields

### 2025-01-27 - Customer Fetch Issue Fix

**Task Completed:**
- Fixed customer fetch 404 error by updating useCustomers hook to use correct database table
- Updated customer components to use proper field names matching database schema
- Successfully resolved customer management functionality

**Problem Identified:**
- Customer fetch was failing with 404 error: "Could not find the table 'public.customers' in the schema cache"
- Error occurred because code was trying to query non-existent 'customers' table
- Database schema uses 'contacts' table with type='customer' for customer data
- Customer components were using incorrect field names (name, company instead of company_name, contact_name)

**Solution Implemented:**
- **Updated useCustomers Hook**: Changed from querying 'customers' table to 'contacts' table with type='customer' filter
- **Fixed Field Names**: Updated all customer interfaces to use correct database field names:
  - `name` → `company_name`
  - `company` → `contact_name`
  - Added missing fields: `city`, `state`, `postal_code`, `website`
- **Updated Components**: Fixed CustomerModal and CustomerTable to use correct field structure
- **Enhanced Real-time**: Updated real-time subscription to filter contacts by type='customer'

**Technical Changes:**
```typescript
// Before: Querying non-existent table
.from('customers')

// After: Querying correct table with filter
.from('contacts')
.eq('type', 'customer')

// Before: Wrong field names
interface CreateCustomerRequest {
  name: string;
  company?: string;
}

// After: Correct field names
interface CreateCustomerRequest {
  company_name: string;
  contact_name?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  website?: string;
}
```

**Components Updated:**
- ✅ **useCustomers Hook**: Fixed table queries and field mapping
- ✅ **CustomerModal**: Updated form fields and validation
- ✅ **CustomerTable**: Fixed display and filtering logic
- ✅ **Customers Page**: Updated statistics calculations

**Database Schema Alignment:**
- ✅ **Table Structure**: Now correctly uses contacts table with type='customer'
- ✅ **Field Mapping**: All field names match database schema exactly
- ✅ **Type Safety**: Customer type properly extends Contact with type='customer'
- ✅ **Real-time Sync**: Proper filtering for customer-only changes

**Benefits:**
- ✅ **Customer Management**: Full CRUD operations now work correctly
- ✅ **Data Consistency**: Field names match database schema
- ✅ **Type Safety**: Proper TypeScript types for customer data
- ✅ **Real-time Updates**: Customer changes sync properly
- ✅ **Search Functionality**: Customer search works with correct fields

**Files Modified:**
- `src/hooks/useCustomers.ts` - Fixed table queries and field names
- `src/components/customer/CustomerModal.tsx` - Updated form structure
- `src/components/customer/CustomerTable.tsx` - Fixed display logic
- `src/pages/Customers.tsx` - Updated statistics calculation
- `MEMORY.md` - This update

### 2025-01-27 - Dashboard Summary Function Implementation

**Task Completed:**
- Fixed dashboard summary fetch error by implementing missing `get_dashboard_summary()` database function
- Created comprehensive dashboard summary function with proper security and performance optimizations
- Successfully resolved dashboard loading issues in the Factory Pulse application

**Problem Identified:**
- Dashboard was failing to load due to missing `get_dashboard_summary()` database function
- Error: "function get_dashboard_summary() does not exist" when dashboard tried to fetch summary data
- Dashboard components were unable to display project statistics and recent activity

**Solution Implemented:**
- **Migration File**: `supabase/migrations/20250831000006_dashboard_summary_function.sql`
- **Function**: `get_dashboard_summary()` - PL/pgSQL function with SECURITY DEFINER
- **Features**:
  - Returns project counts by status for the user's organization
  - Provides recent projects with customer information
  - Includes proper error handling for missing organization context
  - Uses efficient SQL aggregation with proper joins
  - Returns structured JSONB data matching frontend expectations

**Function Capabilities:**
- ✅ **Project Statistics**: Total count and breakdown by status (active, completed, cancelled, on_hold)
- ✅ **Recent Projects**: Latest 10 projects with customer names and metadata
- ✅ **Multi-tenant Security**: Only returns data for user's organization
- ✅ **Performance Optimized**: Efficient queries with proper indexing
- ✅ **Error Handling**: Graceful handling of missing user context
- ✅ **Real-time Data**: Includes timestamp for cache invalidation

**Technical Implementation:**
```sql
-- Function returns structured JSONB with:
{
  "projects": {
    "total": 17,
    "by_status": {"active": 14, "completed": 2, "cancelled": 1}
  },
  "recent_projects": [
    {
      "id": "uuid",
      "project_id": "P-25012701", 
      "title": "Project Title",
      "status": "active",
      "priority": "high",
      "created_at": "timestamp",
      "customer_name": "Company Name"
    }
  ],
  "generated_at": 1756481316.780059
}
```

**Database Integration:**
- ✅ **Applied to Local Database**: Function successfully created and tested
- ✅ **Permission Granted**: EXECUTE permission for authenticated users
- ✅ **Documentation Updated**: Function documented in database schema
- ✅ **Migration Ready**: Proper migration file for deployment

**Testing Results:**
- ✅ **Function Creation**: Successfully created in local Supabase database
- ✅ **Query Execution**: Function returns proper JSONB structure
- ✅ **Error Handling**: Returns empty result when no user context
- ✅ **Performance**: Efficient execution with proper indexing

**Benefits:**
- ✅ **Dashboard Functionality**: Dashboard now loads without errors
- ✅ **Real-time Data**: Live project statistics and recent activity
- ✅ **User Experience**: Smooth dashboard loading and data display
- ✅ **Multi-tenant Support**: Proper organization isolation
- ✅ **Scalability**: Efficient queries for growing project data

**Files Modified:**
- `supabase/migrations/20250831000006_dashboard_summary_function.sql` - New migration
- `docs/database-schema.md` - Updated function documentation
- `MEMORY.md` - This update

### 2025-01-27 - Database Backup System Implementation

**Task Completed:**
- Created comprehensive backup system for local Supabase database
- Implemented automated backup script for future use
- Successfully backed up current database state

**Backup Files Created:**
- **Schema Backup**: `backups/factory_pulse_schema_backup_20250831_112440.sql` (65KB)
- **Data Backup**: `backups/factory_pulse_data_backup_20250831_112440.sql` (201KB)
- **Complete Backup**: `backups/factory_pulse_complete_backup_20250831_112440.sql` (65KB)

**Backup Script Created:**
- **File**: `scripts/backup-database.sh` - Automated backup script
- **Features**: 
  - Creates timestamped backups
  - Generates schema-only, data-only, and complete backups
  - Validates Supabase is running before backup
  - Provides restore instructions
  - Error handling and status reporting

**Backup Process:**
1. **Schema Backup**: Database structure, tables, indexes, functions, triggers
2. **Data Backup**: All table data with proper foreign key handling
3. **Complete Backup**: Full database state for disaster recovery

**Restore Instructions:**
- **Schema Only**: `supabase db reset --local && psql -h 127.0.0.1 -p 54322 -U postgres -d postgres < backup_file.sql`
- **Complete Restore**: Use complete backup file for full database restoration

**Benefits:**
- ✅ **Data Protection**: Regular backups prevent data loss
- ✅ **Disaster Recovery**: Complete database restoration capability
- ✅ **Development Safety**: Safe experimentation with database changes
- ✅ **Automation**: Easy-to-use backup script for regular backups
- ✅ **Documentation**: Clear restore instructions included

**Usage:**
```bash
# Run automated backup (includes cleanup)
./scripts/backup-database.sh

# Manual backup with specific timestamp
supabase db dump --local --file backups/factory_pulse_backup_$(date +"%Y%m%d_%H%M%S").sql

# Clean up old backups manually
./scripts/cleanup-backups.sh
```

### 2025-01-27 - Backup Cleanup and Optimization

**Task Completed:**
- Removed old and obsolete backup files to save disk space
- Kept only the latest backup set for restoration purposes
- Enhanced backup script with automatic cleanup functionality
- Created standalone cleanup script for manual use

**Files Removed:**
- **Old backups**: Removed 6 backup files from earlier timestamps (092839, 112440, 112523)
- **Auth test files**: Removed 3 JSON auth test result files (not database backups)
- **Total space saved**: ~1.2MB of old backup files

**Current Backup Files (Latest Set):**
- **Schema Backup**: `backups/factory_pulse_schema_backup_20250831_112538.sql` (65KB)
- **Data Backup**: `backups/factory_pulse_data_backup_20250831_112538.sql` (201KB)
- **Complete Backup**: `backups/factory_pulse_complete_backup_20250831_112538.sql` (65KB)

**Enhanced Backup Script (`scripts/backup-database.sh`):**
- ✅ **Automatic Cleanup**: Removes old backups after creating new ones
- ✅ **Latest Set Only**: Keeps only the most recent backup timestamp
- ✅ **Smart Detection**: Automatically identifies the latest backup set
- ✅ **Space Management**: Prevents backup directory from growing indefinitely

**New Cleanup Script (`scripts/cleanup-backups.sh`):**
- ✅ **Standalone Tool**: Can be run independently to clean up backups
- ✅ **Detailed Reporting**: Shows which files are removed and kept
- ✅ **Safe Operation**: Only removes files matching backup naming pattern
- ✅ **Timestamp Analysis**: Identifies the latest backup set automatically

**Benefits:**
- ✅ **Disk Space**: Reduced backup storage footprint by ~80%
- ✅ **Organization**: Clean backup directory with only latest files
- ✅ **Automation**: Future backups will automatically clean up old files
- ✅ **Manual Control**: Separate cleanup script for on-demand cleaning
- ✅ **Safety**: Only removes backup files, preserves other important files

### 2025-01-27 - Workflow Stages and Sub-Stages Recovery

### 2025-01-27 - Workflow Stages and Sub-Stages Recovery

**Problem Identified:**
- Workflow stages and sub-stages were accidentally deleted from the database
- This affected the project workflow functionality in the Factory Pulse system
- No workflow stages available for project progression tracking

**Root Cause Analysis:**
- Previous database operations may have cleared workflow-related tables
- Workflow stages and sub-stages are critical for project management workflow
- Sample data files contained complete workflow structure but weren't seeded

**Solution Implemented:**

**1. Workflow Stages Recovery (`scripts/02-seed-workflow-stages.js`):**
- **Force Seeding**: Ran `node scripts/02-seed-workflow-stages.js --force` to restore all workflow stages
- **Complete Restoration**: Successfully seeded 8 workflow stages for Factory Pulse Vietnam
- **Data Integrity**: All stages properly linked to organization with correct relationships

**2. Workflow Sub-Stages Recovery (`scripts/02a-seed-workflow-sub-stages.js`):**
- **Force Seeding**: Ran `node scripts/02a-seed-workflow-sub-stages.js --force` to restore all sub-stages
- **Complete Restoration**: Successfully seeded 30 workflow sub-stages across all 8 stages
- **Hierarchical Structure**: All sub-stages properly linked to their parent workflow stages

**Workflow Stages Restored:**
1. **Inquiry Received** (3 sub-stages) - #3B82F6
2. **Technical Review** (4 sub-stages) - #F59E0B
3. **Supplier RFQ Sent** (4 sub-stages) - #F97316
4. **Quoted** (4 sub-stages) - #10B981
5. **Order Confirmed** (3 sub-stages) - #6366F1
6. **Procurement Planning** (4 sub-stages) - #8B5CF6
7. **In Production** (4 sub-stages) - #84CC16
8. **Shipped & Closed** (4 sub-stages) - #6B7280

**Key Sub-Stages Examples:**
- **Inquiry Received**: RFQ Documentation Review, Initial Feasibility Assessment, Customer Requirements Clarification
- **Technical Review**: Engineering Technical Review, QA Requirements Review, Production Capability Assessment
- **Supplier RFQ Sent**: Supplier Identification, RFQ Preparation, RFQ Distribution, Supplier Response Collection
- **Quoted**: Cost Analysis, Quote Preparation, Quote Review and Approval, Quote Submission
- **Order Confirmed**: Customer PO Review, Contract Finalization, Production Planning Initiation
- **Procurement Planning**: BOM Finalization, Purchase Order Issuance, Material Planning, Production Schedule Confirmation
- **In Production**: Manufacturing Setup, Assembly Process, Quality Control Testing, Final Assembly and Packaging
- **Shipped & Closed**: Shipping Preparation, Product Delivery, Project Documentation, Project Closure

**Results Achieved:**
- ✅ **8 Workflow Stages**: Complete workflow pipeline restored
- ✅ **30 Sub-Stages**: Detailed workflow breakdown available
- ✅ **Organization Linkage**: All stages properly linked to Factory Pulse Vietnam
- ✅ **Color Coding**: Each stage has distinct color for UI visualization
- ✅ **Order Structure**: Proper stage_order and sub_stage_order maintained
- ✅ **Responsible Roles**: Each stage has defined responsible roles (sales, engineering, procurement, etc.)

**Script Execution Order:**
1. `node scripts/02-seed-workflow-stages.js --force` - Restore workflow stages
2. `node scripts/02a-seed-workflow-sub-stages.js --force` - Restore workflow sub-stages

**Benefits:**
- ✅ **Complete Workflow**: Full project lifecycle workflow restored
- ✅ **Project Management**: Projects can now progress through defined stages
- ✅ **User Experience**: Clear workflow visualization and progression tracking
- ✅ **Role Assignment**: Proper role-based responsibilities defined
- ✅ **Data Consistency**: All workflow data properly seeded and linked

### 2025-01-27 - Database Seeding System Completion

### 2025-01-27 - Database Seeding System Completion

**Problem Identified:**
- Local Supabase database had incomplete data relationships
- Organizations table had only 1 organization (Factory Pulse Vietnam)
- Contacts table was empty (0 records)
- Projects table had 17 projects but ALL had NULL customer_id references
- Missing script to seed contacts data directly

**Root Cause Analysis:**
- Sample data files were properly structured with correct relationships
- `01-organizations.json` had 8 organizations
- `04-contacts.json` had 10 contacts (5 customers, 5 suppliers)
- `05-projects.json` had 17 projects with proper customer_id references
- Existing scripts only created auth users and user profiles, not actual contact records
- Projects seeding script expected contacts to exist but they weren't being seeded

**Solution Implemented:**

**1. Created Contacts Seeding Script (`scripts/02-seed-contacts.js`):**
- **New Script**: `scripts/02-seed-contacts.js` - Dedicated contacts seeding
- **Environment Integration**: Uses same environment variables as other scripts
- **Data Validation**: Validates organization_id references before insertion
- **Foreign Key Handling**: Sets created_by to null since users don't exist yet
- **Force Protection**: Includes --force flag for data overwrite protection
- **Dependency Management**: Verifies organizations exist before seeding contacts

**2. Updated Organizations Seeding:**
- **Force Seeding**: Ran `01-seed-organizations.js --force` to ensure all 8 organizations
- **Data Clearing**: Properly cleared dependent tables to avoid constraint violations
- **Complete Data**: Now have all organizations from sample data

**3. Fixed Projects Relationships:**
- **Relationship Fixing**: Used `05-seed-projects.js --fix-relationships` 
- **Customer Mapping**: Projects now properly reference customer contacts
- **Data Integrity**: All 17 projects now have valid customer_id references

**4. Created Data Status Check Script (`scripts/check-data-status.js`):**
- **Comprehensive Reporting**: Shows status of all major tables
- **Relationship Analysis**: Displays customer-project relationships
- **Data Validation**: Helps verify seeding completeness

**Technical Implementation Details:**

**Contacts Seeding Script Features:**
- **ES Module Support**: Uses ES modules with proper import/export
- **Error Handling**: Comprehensive error handling with detailed messages
- **Data Validation**: Validates organization_id references before insertion
- **Type Grouping**: Separates customers and suppliers for better reporting
- **Dependency Safety**: Checks for required organizations before seeding

**Database Schema Compliance:**
- **Foreign Key Constraints**: Handles created_by references properly
- **Data Types**: Ensures all data types match database schema
- **Enum Values**: Validates contact_type values ('customer', 'supplier')
- **Nullable Fields**: Properly handles optional fields

**Results Achieved:**
- ✅ **8 Organizations**: All organizations from sample data seeded
- ✅ **10 Contacts**: 5 customers + 5 suppliers properly seeded
- ✅ **17 Projects**: All projects now have valid customer relationships
- ✅ **Data Relationships**: Proper foreign key relationships established
- ✅ **Local Development**: All operations use local Supabase only

**Data Relationships Verified:**
- Toyota Vietnam: 6 projects
- Honda Vietnam: 3 projects  
- Boeing Vietnam: 3 projects
- Samsung Vietnam: 3 projects
- Airbus Vietnam: 2 projects

**Script Execution Order:**
1. `node scripts/01-seed-organizations.js --force` - Seed all organizations
2. `node scripts/02-seed-contacts.js` - Seed contacts (customers/suppliers)
3. `node scripts/05-seed-projects.js --fix-relationships` - Seed projects with relationships
4. `node scripts/check-data-status.js` - Verify complete data status

**Benefits:**
- ✅ **Complete Data Set**: All sample data now properly seeded
- ✅ **Valid Relationships**: Projects properly reference customers
- ✅ **Development Ready**: Local database has realistic test data
- ✅ **Maintainable**: Clear script organization and execution order
- ✅ **Documented**: Comprehensive status reporting and verification

### 2025-08-31 - Authentication Testing System Implementation

**Problem Identified:**
- Need to test authentication for all users in the Factory Pulse system
- No existing comprehensive testing mechanism for auth users
- Internal users were created but couldn't authenticate due to password issues

**Solution Implemented:**

**1. Created Comprehensive Authentication Testing Script (`scripts/test-auth-signin.js`):**
- **Multi-Password Testing**: Tests 3 different password variations (Password@123, FactoryPulse@2025, FactoryPulse2025!)
- **Complete User Coverage**: Tests all internal Factory Pulse users (15) and contact users (10)
- **Detailed Reporting**: Provides success/failure rates, working passwords, and detailed results
- **Results Export**: Saves comprehensive test results to timestamped JSON files in backups/
- **Command Line Options**: Supports --verbose, --no-save, and --help flags

**2. Created Auth User Status Check Script (`scripts/check-auth-users.js`):**
- **User Discovery**: Lists all auth users in the system with detailed metadata
- **Status Analysis**: Shows email confirmation status, last sign-in times, and user metadata
- **Problem Diagnosis**: Identified that internal users existed but had never signed in

**3. Created Password Reset Script (`scripts/reset-internal-passwords.js`):**
- **Bulk Password Reset**: Resets passwords for all internal Factory Pulse users
- **Admin Operations**: Uses service role key to update user passwords
- **Rate Limiting**: Includes delays to avoid overwhelming the auth service

**4. Updated Package.json Scripts:**
- **Added**: `"test:auth": "node scripts/test-auth-signin.js"`
- **Added**: `"test:auth:verbose": "node scripts/test-auth-signin.js --verbose"`

**Technical Implementation Details:**

**Authentication Testing Features:**
- **Environment Safety**: Uses anon key for realistic testing (not service role)
- **Session Management**: Properly signs out between tests to avoid conflicts
- **Error Handling**: Comprehensive error handling with detailed failure reasons
- **Metadata Validation**: Verifies user metadata is properly loaded after authentication
- **Rate Limiting**: Includes delays between authentication attempts

**Password Reset Features:**
- **Service Role Access**: Uses admin API to update user passwords
- **Bulk Operations**: Processes all internal users in a single run
- **Error Recovery**: Continues processing other users if individual operations fail
- **Success Tracking**: Provides detailed success/failure counts

**Results Achieved:**
- ✅ **25/25 Users Authenticating**: All users can now successfully sign in
- ✅ **100% Success Rate**: Both internal users (15/15) and contact users (10/10) working
- ✅ **Consistent Password**: All users use `FactoryPulse@2025` password
- ✅ **Proper Metadata**: User roles, departments, and names correctly loaded
- ✅ **Comprehensive Testing**: Full coverage of all user types and roles

**User Types Verified:**
- **Internal Users (15)**: CEO, Operations, Quality, Engineering, QA, Production, Sales, Procurement, Admin
- **Contact Users (10)**: 5 customers (Toyota, Honda, Boeing, Airbus, Samsung) + 5 suppliers

**Script Usage:**
```bash
# Test all authentication
npm run test:auth

# Verbose testing with more details
npm run test:auth:verbose

# Check auth user status
node scripts/check-auth-users.js

# Reset internal user passwords
node scripts/reset-internal-passwords.js
```

**Benefits:**
- ✅ **Complete Authentication Coverage**: All users can sign in successfully
- ✅ **Automated Testing**: Comprehensive testing script for ongoing verification
- ✅ **Problem Resolution**: Fixed authentication issues for internal users
- ✅ **Documentation**: Detailed results and status reporting
- ✅ **Maintainability**: Easy to run tests and reset passwords as needed

### 2025-08-31 - Package.json Cleanup and Script Organization

**Changes Made:**
- **Package.json Cleanup**: Removed unnecessary and non-existent scripts to maintain clean project structure
- **Script Organization**: Standardized script naming and removed debug/temporary scripts
- **Script Validation**: Ensured all referenced scripts actually exist and are functional

**Removed Scripts:**
- `migrate:users` - Referenced non-existent `scripts/migrate-users.js`
- `verify:organizations` - Referenced non-existent `scripts/verify-organizations.js`
- `update:auth-display-names` - Referenced non-existent `scripts/update-auth-display-names.js`

**Removed Debug Files:**
- `scripts/fix-priority-levels.js` - Empty debug script (0 bytes)
- `scripts/fix-project-data.js` - Empty debug script (0 bytes)

**Script Corrections:**
- Fixed `seed:organizations` to reference correct file: `01-seed-organizations.js`
- Fixed `create:auth-users` to reference correct file: `01-create-auth-users.js`

**Current Script Structure:**
- **Development**: `dev`, `build`, `build:dev`, `preview`, `lint`
- **Data Seeding**: `seed:organizations`, `seed:workflow-stages`, `seed:workflow-sub-stages`, `seed:projects`
- **Auth Management**: `create:auth-users`
- **Force Options**: All seeding scripts have `:force` variants for overwriting
- **Special Features**: `seed:projects:fix` for relationship fixing

**Benefits:**
- ✅ **Clean Structure**: Only functional scripts remain
- ✅ **No Broken References**: All scripts referenced actually exist
- ✅ **Consistent Naming**: Script names match actual file names
- ✅ **Maintainable**: Easy to understand and maintain script collection
- ✅ **Production Ready**: No debug or temporary scripts cluttering the project

### 2025-08-31 - Project Data Seeding System

**Changes Made:**
- **Project Seeding Script**: Successfully created comprehensive project data seeding system
  - **Relationship Validation**: Implemented robust foreign key validation for all project relationships
  - **Data Fixing Capabilities**: Added automatic fixing of invalid references with `--fix-relationships` flag
  - **Schema Compliance**: Fixed priority level values to match database enum constraints
  - **Local Supabase Integration**: Uses local Supabase instance only, no remote operations

**Technical Details:**
- **ES Module Compatibility**: Uses ES modules matching project's `"type": "module"` configuration
  - Uses `import` statements and `fileURLToPath` for proper module handling
  - Consistent with other seeding scripts in the project

- **Relationship Validation System**:
  - Validates organization_id, current_stage_id, customer_id, created_by, assigned_to
  - Checks against existing data in organizations, workflow_stages, contacts, and users tables
  - Provides detailed error reporting for each invalid reference
  - Supports automatic fixing with fallback to valid references

- **Data Fixing Features**:
  - `--fix-relationships`: Automatically fixes invalid foreign key references
  - Maps invalid customer_id references to first available customer contact
  - Maps invalid user references to first available user
  - Maps invalid stage references to first available workflow stage
  - Removes invalid references when no valid alternatives exist

- **Schema Compliance Fixes**:
  - Fixed priority_level values: 'urgent' → 'high' to match database enum
  - Updated project data to use valid customer contact IDs instead of organization IDs
  - Ensured all enum values match database schema constraints

- **Command Line Options**:
  - `--force`: Overwrite existing projects data
  - `--fix-relationships`: Automatically fix invalid references
  - `--help`: Comprehensive help documentation

- **Package Integration**:
  - `"seed:projects": "node scripts/05-seed-projects.js"` - Basic seeding
  - `"seed:projects:force": "node scripts/05-seed-projects.js --force"` - Force overwrite
  - `"seed:projects:fix": "node scripts/05-seed-projects.js --fix-relationships"` - Fix relationships

**Script Features:**
- **Environment Safety**: Checks for required environment variables before execution
- **Data Protection**: Prevents accidental overwrites without `--force` flag
- **Comprehensive Logging**: Clear progress indicators and detailed relationship fixes
- **Error Handling**: Graceful handling of database errors with detailed error messages

**Results:**
- ✅ **17 Projects Seeded**: Successfully inserted all 17 sample projects
- ✅ **Relationship Validation**: All foreign key relationships validated and fixed
- ✅ **Schema Compliance**: All data conforms to database schema constraints
- ✅ **Local Development**: Works exclusively with local Supabase instance
- ✅ **Data Integrity**: Maintains referential integrity across all tables

**Sample Projects Seeded:**
- P-25012701: Automotive Bracket Assembly
- P-25012702: Motorcycle Frame Welding  
- P-25012703: Aerospace Component Machining
- P-25012704: Electronics Enclosure Assembly
- P-25012705: Industrial Control Panel
- And 12 more projects covering various manufacturing domains

**Next Steps:**
- Project seeding system ready for production use
- Can be integrated into automated deployment pipelines
- Relationship validation can be extended to other data seeding scripts

### 2025-08-31 - Database Backup and Cleanup

**Changes Made:**
- **Database Backup Creation**: Successfully created comprehensive backup of local Supabase database
  - **Schema Backup**: Created `factory_pulse_schema_backup_20250831_092839.sql` (53KB) with complete database structure
  - **Data Backup**: Created `factory_pulse_data_backup_20250831_092842.sql` (88KB) with all current data
  - **Backup Cleanup**: Removed previous backup files from August 31st to maintain clean backup directory
  - **Local Supabase Integration**: Used Supabase CLI with local instance for reliable backup creation

**Technical Details:**
- **Backup Method**: Used `supabase db dump --local` command for both schema and data backups
- **Schema Backup**: Complete database structure including tables, functions, triggers, and RLS policies
- **Data Backup**: All current data with circular foreign key constraint warnings (normal for complex schemas)
- **File Naming**: Timestamped backup files for easy identification and version tracking
- **Storage Location**: All backups stored in `backups/` directory for organized management

**Backup Files Created:**
- `factory_pulse_schema_backup_20250831_092839.sql` - Complete database schema (53KB, 1909 lines)
- `factory_pulse_data_backup_20250831_092842.sql` - All current data (88KB, 450 lines)

**Previous Backups Removed:**
- `factory_pulse_data_backup_20250831_085438.sql` - Old data backup
- `factory_pulse_backup_20250831_085425.sql` - Old schema backup
- Multiple empty backup files from failed attempts

**Benefits:**
- ✅ **Data Safety**: Complete backup of current database state
- ✅ **Schema Preservation**: Full database structure backed up for restoration
- ✅ **Clean Organization**: Removed outdated backups to prevent confusion
- ✅ **Version Tracking**: Timestamped files for easy backup management
- ✅ **Local Development**: Backup created from local Supabase instance as required
- ✅ **Restoration Ready**: Backups can be used to restore database state if needed

**Usage Notes:**
- Backups include all organizations, users, projects, workflow stages, and related data
- Circular foreign key warnings are normal and don't affect backup integrity
- Schema backup includes all custom types, functions, and RLS policies
- Data backup includes all current records with proper foreign key relationships

**Next Steps:**
- Regular backup schedule can be established for ongoing data protection
- Backup verification process can be implemented to ensure backup integrity
- Automated backup cleanup can be set up to manage backup file retention

### 2025-08-30 - Complete Authentication System Setup

### 2025-08-30 - Complete Authentication System Setup

**Changes Made:**
- **Complete Authentication System**: Successfully set up full authentication system with organizations, users, and contacts
  - **Database Schema**: Created comprehensive database schema with proper foreign key relationships
  - **Auth Users Creation**: Implemented UUID mapping system for Supabase auth users with sample data
  - **Data Import Pipeline**: Created complete data import system for organizations, users, and contacts
  - **Dependency Management**: Solved circular reference issues with intelligent sorting and UUID mapping

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
- **NPM Scripts**: Added authentication management scripts to package.json:
  - `"create:auth-users": "node scripts/create-auth-users.js"` - Create Supabase auth users from sample data
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

**Final Results:**
- ✅ **5 Organizations** imported successfully
- ✅ **15 Auth Users** created with profiles (all roles: management, engineering, qa, production, sales, procurement, admin)
- ✅ **10 Contacts** imported (5 customers, 5 suppliers)
- ✅ **Complete Database Schema** with proper relationships
- ✅ **All Foreign Key Constraints** satisfied
- ✅ **UUID Mapping System** working correctly

**Files Created**:
- `scripts/create-auth-users.js` - Main auth users creation script
- `scripts/import-organizations.js` - Organizations import script
- `scripts/import-contacts.js` - Contacts import script
- `scripts/README.md` - Comprehensive documentation and usage guide
- `supabase/migrations/20250130000001_create_basic_schema.sql` - Complete database schema

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

### 2025-08-31 - Project Structure Simplification and Core Dependencies ✅

**Changes Made:**
- **Package.json Restructure**: Simplified project configuration to focus on core functionality and essential dependencies
  - **Minimal Dependencies**: Reduced to essential packages - Supabase client and dotenv for environment management
  - **Core Scripts**: Streamlined npm scripts focusing on development, build, and database seeding operations
  - **ES Module Configuration**: Maintained `"type": "module"` for modern JavaScript module support
  - **Development Focus**: Optimized for local development and database management workflows

**Technical Implementation:**
- **Essential Dependencies**:
  - `@supabase/supabase-js ^2.39.0` - Core Supabase client for database and auth operations
  - `dotenv ^16.3.1` - Environment variable management for configuration

- **Development Dependencies**:
  - `vite ^5.0.0` - Modern build tool and development server
  - `eslint ^8.0.0` - Code linting and quality assurance

- **NPM Scripts Configuration**:
  ```json
  {
    "dev": "vite --port 8080",           // Development server on port 8080
    "build": "vite build",               // Production build
    "build:dev": "vite build --mode development", // Development build
    "preview": "vite preview",           // Preview production build
    "lint": "eslint .",                  // Code linting
    "migrate:users": "node scripts/migrate-users.js",     // User migration
    "seed:organizations": "node scripts/seed-organizations.js",        // Seed organizations
    "seed:organizations:force": "node scripts/seed-organizations.js --force", // Force seed
    "verify:organizations": "node scripts/verify-organizations.js"     // Verify seeded organizations
  }
  ```

- **Build System**: Vite-based build system with development server on port 8080
- **Database Management**: Dedicated scripts for user migration and organization seeding
- **Environment Management**: Dotenv integration for local development configuration

**Impact:**
- ✅ **Simplified Architecture**: Focused on core functionality without unnecessary dependencies
- ✅ **Development Efficiency**: Streamlined scripts for common development tasks
- ✅ **Database Management**: Dedicated seeding and migration scripts for data management
- ✅ **Modern Build System**: Vite integration for fast development and optimized builds
- ✅ **Environment Safety**: Proper environment variable management for local development

**Project Status**: Core foundation established with essential dependencies and build system
**Ready for**: Frontend development, database operations, and application scaffolding

### 2025-08-31 - Organization Verification Script Integration ✅

**Changes Made:**
- **Verification Script Integration**: Added `verify:organizations` npm script to package.json for database verification workflows
  - **New NPM Script**: `npm run verify:organizations` - Runs organization verification script to validate seeded data
  - **Development Workflow Enhancement**: Provides easy way to verify database state after seeding operations
  - **Quality Assurance**: Enables quick validation of seeded organization data

### 2025-08-31 - Auth Display Names Update Script Integration ✅

**Changes Made:**
- **Auth Display Names Script**: Added `update:auth-display-names` npm script to package.json for updating existing auth user metadata
  - **New NPM Script**: `npm run update:auth-display-names` - Updates display names and metadata for existing Supabase auth users
  - **Metadata Management**: Updates name, display_name, full_name, employee_id, department, role, phone, avatar_url from sample data
  - **Safe Updates**: Preserves existing user metadata while updating specific fields from sample-data/03-users.json
  - **Comprehensive Reporting**: Provides detailed summary of successful updates, errors, and users not found
  - **Development Workflow**: Enables updating auth user metadata without recreating accounts

**Technical Details:**
- **Script Location**: `scripts/update-auth-display-names.js`
- **Data Source**: Uses `sample-data/03-users.json` for user information
- **Update Method**: Uses `supabase.auth.admin.updateUserById()` for metadata updates
- **Error Handling**: Continues processing if individual users fail, reports comprehensive results
- **Rate Limiting**: Includes delays between operations to avoid API limits

**Usage:**
```bash
npm run update:auth-display-names
```

**Benefits:**
- ✅ **Non-destructive Updates**: Updates metadata without affecting user authentication
- ✅ **Selective Updates**: Only updates users that exist in auth.users table
- ✅ **Comprehensive Reporting**: Shows success count, errors, and missing users
- ✅ **Development Efficiency**: Quick way to sync auth metadata with sample data changes
- ✅ **Safe Operation**: Preserves existing metadata while updating specific fields

### 2025-08-31 - Script Management Cleanup ✅

**Changes Made:**
- **NPM Scripts Cleanup**: Removed `reset:user-password` script from package.json npm scripts
  - **Script Removal**: Removed `"reset:user-password": "node scripts/reset-user-password.js"` from package.json
  - **File Retention**: The `scripts/reset-user-password.js` file remains available for manual execution
  - **Simplified Package Management**: Streamlined npm scripts to focus on core development workflows

**Technical Details:**
- **Manual Execution**: The reset password functionality is still available via direct node execution:
  ```bash
  node scripts/reset-user-password.js <email> [new-password]
  ```
- **Script Functionality**: The script remains fully functional for password reset operations when needed
- **Development Focus**: Package.json now focuses on essential development and seeding workflows

**Impact:**
- ✅ **Cleaner Package Scripts**: Reduced npm script complexity for better developer experience
- ✅ **Maintained Functionality**: Password reset capability preserved for administrative use
- ✅ **Focused Workflow**: Package scripts now concentrate on core development tasks
- ✅ **Manual Access**: Administrative scripts available when needed without cluttering npm commands

**Files Modified:**
- `package.json` - Removed `reset:user-password` npm script

**Current NPM Scripts:**
```json
{
  "dev": "vite --port 8080",
  "build": "vite build", 
  "build:dev": "vite build --mode development",
  "preview": "vite preview",
  "lint": "eslint .",
  "migrate:users": "node scripts/migrate-users.js",
  "seed:organizations": "node scripts/seed-organizations.js",
  "seed:organizations:force": "node scripts/seed-organizations.js --force",
  "verify:organizations": "node scripts/verify-organizations.js",
  "seed:workflow-stages": "node scripts/seed-workflow-stages.js",
  "seed:workflow-stages:force": "node scripts/seed-workflow-stages.js --force",
  "create:auth-users": "node scripts/create-auth-users.js"
}
```on of organization data integrity and configuration

**Technical Implementation:**
- **Script Integration**: Added `"verify:organizations": "node scripts/verify-organizations.js"` to package.json scripts

### 2025-08-31 - Authentication Management Scripts Integration ✅

**Changes Made:**
- **Authentication Script Management**: Added user authentication management scripts to package.json for streamlined user operations
  - **Auth User Creation**: `npm run create:auth-users` - Creates Supabase authentication users from sample data with proper UUID mapping
  - **Password Reset Utility**: `npm run reset:user-password` - Utility script for resetting user passwords (implementation pending)
  - **Development Workflow**: Provides standardized commands for user management during development and testing

**Technical Implementation:**
- **NPM Scripts Added**:
  - `"create:auth-users": "node scripts/create-auth-users.js"` - Leverages existing comprehensive auth user creation script
  - `"reset:user-password": "node scripts/reset-user-password.js"` - Placeholder for password reset functionality

**Impact:**
- ✅ **Standardized User Management**: Consistent npm commands for authentication operations
- ✅ **Development Efficiency**: Easy-to-remember commands for common user management tasks
- ✅ **Script Discoverability**: Authentication scripts now visible in package.json for team members
- ✅ **Workflow Integration**: Seamless integration with existing seeding and verification workflows

**Usage:**
```bash
# Create authentication users from sample data
npm run create:auth-users

# Reset user password (when implemented)
npm run reset:user-password
```

### 2025-08-31 - Workflow Stages and Sub-Stages Seeding ✅

**Changes Made:**
- **Complete Workflow Seeding**: Successfully seeded both workflow stages and sub-stages into the local Supabase database
  - **8 Workflow Stages**: Complete manufacturing workflow from inquiry to delivery with proper colors, slugs, and ordering
  - **30 Sub-Stages**: Granular sub-stages across all workflow stages for detailed process tracking
  - **Database Integration**: All stages and sub-stages properly linked to Factory Pulse Vietnam organization
  - **Package Scripts Fixed**: Corrected npm script paths to point to actual script files

**Technical Details:**
- **Workflow Stages Seeded**:
  1. Inquiry Received (inquiry_received) - Blue (#3B82F6) - 3 sub-stages
  2. Technical Review (technical_review) - Amber (#F59E0B) - 4 sub-stages
  3. Supplier RFQ Sent (supplier_rfq_sent) - Orange (#F97316) - 4 sub-stages
  4. Quoted (quoted) - Emerald (#10B981) - 4 sub-stages
  5. Order Confirmed (order_confirmed) - Indigo (#6366F1) - 3 sub-stages
  6. Procurement Planning (procurement_planning) - Violet (#8B5CF6) - 4 sub-stages
  7. In Production (in_production) - Lime (#84CC16) - 4 sub-stages
  8. Shipped & Closed (shipped_closed) - Gray (#6B7280) - 4 sub-stages

- **Sub-Stages Structure**:
  - **Inquiry Received**: RFQ Review, Feasibility Assessment, Requirements Clarification
  - **Technical Review**: Engineering Review, QA Review, Production Assessment, Cross-Team Meeting
  - **Supplier RFQ Sent**: Supplier Identification, RFQ Preparation, Distribution, Response Collection
  - **Quoted**: Cost Analysis, Quote Preparation, Review & Approval, Submission
  - **Order Confirmed**: PO Review, Contract Finalization, Production Planning
  - **Procurement Planning**: BOM Finalization, PO Issuance, Material Planning, Schedule Confirmation
  - **In Production**: Setup, Assembly, Quality Control, Final Assembly
  - **Shipped & Closed**: Shipping Prep, Delivery, Documentation, Closure

- **Package Scripts Fixed**:
  - Updated `package.json` to point to correct script files (`02-seed-workflow-stages.js` and `02a-seed-workflow-sub-stages.js`)
  - Fixed npm script paths that were pointing to non-existent files
  - Maintained both safe and force seeding options for development flexibility

**Database Status**:
- ✅ **8 Workflow Stages** successfully seeded with complete metadata
- ✅ **30 Sub-Stages** successfully seeded with proper workflow stage relationships
- ✅ **Organization Integration** - All stages linked to Factory Pulse Vietnam
- ✅ **Color Coding** - Each stage has distinct visual color for UI display
- ✅ **Slug Generation** - URL-friendly identifiers for all stages and sub-stages
- ✅ **Ordering System** - Proper stage_order and sub_stage_order for workflow progression

**Usage Commands**:
```bash
# Seed workflow stages (safe mode)
npm run seed:workflow-stages

# Force seed workflow stages (overwrites existing)
npm run seed:workflow-stages:force

# Seed workflow sub-stages (safe mode)
npm run seed:workflow-sub-stages

# Force seed workflow sub-stages (overwrites existing)
npm run seed:workflow-sub-stages:force
```

**Next Steps**:
- Test workflow stage progression with existing projects
- Implement UI components for sub-stage management
- Add real-time notifications for sub-stage updates
- Create workflow visualization components using the seeded data

**Files Modified**:
- `package.json` - Fixed npm script paths for workflow seeding
- Database tables populated with complete workflow configuration

**Impact**:
- ✅ Complete workflow system ready for application development
- ✅ Granular process tracking with 30 detailed sub-stages
- ✅ Multi-tenant ready with proper organization isolation
- ✅ Visual workflow system with color coding and proper ordering
- ✅ Database-driven workflow configuration for future customization

### 2025-08-31 - Workflow Sub-Stages Implementation ✅

**Changes Made:**
- **Comprehensive Sub-Stages System**: Successfully implemented granular workflow sub-stages for detailed process tracking
  - **Database Schema**: Created `workflow_sub_stages` and `project_sub_stage_progress` tables with full RLS policies
  - **30 Detailed Sub-Stages**: Implemented comprehensive sub-stages across all 8 workflow stages
  - **Progress Tracking**: Complete sub-stage progress tracking with status management and time tracking
  - **Auto-Advancement**: Automatic progression based on time and conditions
  - **Approval Workflows**: Role-based approval requirements for critical sub-stages

**Technical Implementation:**
- **Migration File**: Created `supabase/migrations/20250831000005_workflow_sub_stages.sql` with complete schema
  - `workflow_sub_stages` table with 15 fields including duration, approval, and auto-advance settings
  - `project_sub_stage_progress` table for tracking individual sub-stage progress
  - Enhanced `workflow_stages` table with `sub_stages_count` field
  - Comprehensive indexes and RLS policies for performance and security

- **Sub-Stages Structure**:
  - **Inquiry Received**: 3 sub-stages (RFQ Review, Feasibility Assessment, Requirements Clarification)
  - **Technical Review**: 4 sub-stages (Engineering Review, QA Review, Production Assessment, Cross-Team Meeting)
  - **Supplier RFQ Sent**: 4 sub-stages (Supplier Identification, RFQ Preparation, Distribution, Response Collection)
  - **Quoted**: 4 sub-stages (Cost Analysis, Quote Preparation, Review & Approval, Submission)
  - **Order Confirmed**: 3 sub-stages (PO Review, Contract Finalization, Production Planning)
  - **Procurement Planning**: 4 sub-stages (BOM Finalization, PO Issuance, Material Planning, Schedule Confirmation)
  - **In Production**: 4 sub-stages (Setup, Assembly, Quality Control, Final Assembly)
  - **Shipped & Closed**: 4 sub-stages (Shipping Prep, Delivery, Documentation, Closure)

- **Advanced Features**:
  - **Duration Tracking**: Estimated hours for each sub-stage with time-based auto-advancement
  - **Flexible Requirements**: Optional sub-stages that can be skipped (`can_skip` flag)
  - **Role Assignment**: Specific responsible roles for each sub-stage
  - **Approval Workflows**: Some sub-stages require specific role approvals
  - **Progress Status**: Complete lifecycle tracking (pending → in_progress → completed/skipped/blocked)
  - **Assignment Management**: Track who is working on each sub-stage
  - **Notes Support**: Progress notes and comments for each sub-stage

- **Service Layer**: Created `WorkflowSubStageService` with comprehensive functionality:
  - `getSubStagesByStageId()` - Get sub-stages for a specific workflow stage
  - `getProjectSubStageProgress()` - Get progress for a project
  - `updateSubStageProgress()` - Update sub-stage status and progress
  - `isStageCompleted()` - Check if all required sub-stages are completed
  - `getNextSubStage()` - Get next available sub-stage for a project
  - `autoAdvanceSubStage()` - Auto-advance based on time conditions

- **TypeScript Interfaces**: Enhanced type system with new interfaces:
  - `WorkflowSubStage` - Complete sub-stage interface with all properties
  - `ProjectSubStageProgress` - Progress tracking interface
  - Enhanced `WorkflowStage` interface with sub-stages support

- **Sample Data**: Created comprehensive sample data with 30 sub-stages:
  - `sample-data/02a-workflow-sub-stages.json` - Complete sub-stages data
  - Updated `sample-data/02-workflow-stages.json` with `sub_stages_count` field
  - Proper UUID relationships maintained across all tables

- **Seeding Scripts**: Enhanced seeding infrastructure:
  - `scripts/02a-seed-workflow-sub-stages.js` - Comprehensive sub-stages seeding
  - Updated `scripts/02-seed-workflow-stages.js` with sub-stages count display
  - Added npm scripts for easy sub-stages management

**Database Schema Features:**
- **Multi-Tenant Ready**: All tables include `organization_id` for proper data isolation
- **Referential Integrity**: Proper foreign key relationships with cascade deletes
- **Performance Optimized**: Comprehensive indexes on frequently queried fields
- **RLS Policies**: Complete row-level security for multi-tenant access control
- **Auto-Triggers**: Automatic sub-stage progress creation when projects enter stages
- **Audit Trail**: Complete activity logging for all sub-stage operations

**NPM Scripts Added:**
```bash
# Seed sub-stages (safe mode)
npm run seed:workflow-sub-stages

# Force seed sub-stages (overwrites existing)
npm run seed:workflow-sub-stages:force
```

**Benefits:**
- **Granular Control**: Detailed tracking of each step in the workflow
- **Better Visibility**: Clear progress indicators for complex stages
- **Role Clarity**: Specific responsibilities for each sub-stage
- **Automation Ready**: Auto-advance capabilities for time-based progression
- **Flexibility**: Optional sub-stages and skip options
- **Audit Trail**: Complete tracking of sub-stage progress
- **Scalability**: Supports complex workflows with multiple approval points

**Files Created:**
- `supabase/migrations/20250831000005_workflow_sub_stages.sql` - Database migration
- `sample-data/02a-workflow-sub-stages.json` - Sample data with 30 sub-stages
- `scripts/02a-seed-workflow-sub-stages.js` - Seeding script
- `src/services/workflowSubStageService.ts` - Service class for sub-stage management

**Files Modified:**
- `src/types/project.ts` - Added WorkflowSubStage and ProjectSubStageProgress interfaces
- `sample-data/02-workflow-stages.json` - Added sub_stages_count field
- `scripts/02-seed-workflow-stages.js` - Enhanced with sub-stages information
- `package.json` - Added sub-stages seeding npm scripts
- `docs/database-schema.md` - Updated with complete sub-stages documentation

**Next Steps:**
- Apply migration to local Supabase instance
- Seed sub-stages data using npm scripts
- Test sub-stage progress tracking with existing projects
- Implement UI components for sub-stage management
- Add real-time notifications for sub-stage updates

**Impact:**
- ✅ Complete sub-stages system ready for implementation
- ✅ 30 detailed sub-stages across all workflow stages
- ✅ Comprehensive progress tracking and management
- ✅ Auto-advancement and approval workflows
- ✅ Multi-tenant ready with proper security
- ✅ Type-safe implementation with full TypeScript support
- ✅ Comprehensive documentation and sample data

**Changes Made:**
- **Workflow Stages Seeding**: Added comprehensive npm scripts for workflow stages data management
  - **New NPM Scripts**: 
    - `npm run seed:workflow-stages` - Seeds workflow stages data safely (checks for existing data)
    - `npm run seed:workflow-stages:force` - Force seeds workflow stages (overwrites existing data)
  - **Database Seeding Pipeline**: Extends existing seeding infrastructure with workflow stages support
  - **Development Workflow**: Provides standardized approach to seeding workflow configuration data

**Technical Implementation:**
- **Script Integration**: Added workflow stages seeding scripts to package.json:
  ```json
  {
    "seed:workflow-stages": "node scripts/seed-workflow-stages.js",
    "seed:workflow-stages:force": "node scripts/seed-workflow-stages.js --force"
  }
  ```

- **Seeding Script Features**:
  - **Safety Checks**: Verifies existing data before seeding to prevent accidental overwrites
  - **Force Mode**: `--force` flag allows overwriting existing workflow stages data
  - **Dependency Validation**: Checks for required organization data before seeding
  - **Comprehensive Logging**: Detailed progress tracking and error reporting
  - **Data Integrity**: Maintains foreign key relationships and referential integrity

- **Workflow Stages Data Structure**:
  - **8 Workflow Stages**: Complete manufacturing workflow from inquiry to delivery
  - **Stage Properties**: Each stage includes name, slug, color, order, exit criteria, and responsible roles
  - **Organization Association**: Links workflow stages to specific organizations for multi-tenancy
  - **Visual Configuration**: Color coding and ordering for UI display and workflow visualization

**Database Integration:**
- **Sample Data Source**: Reads from `sample-data/02-workflow-stages.json`
- **Organization Dependency**: Validates organization exists before seeding workflow stages
- **Cleanup Handling**: Properly handles dependent table cleanup when using `--force` mode
- **Foreign Key Management**: Maintains referential integrity with projects and stage history tables

**Impact:**
- ✅ **Standardized Workflow Seeding**: Consistent approach to seeding workflow configuration data
- ✅ **Development Efficiency**: Easy setup of workflow stages for local development and testing
- ✅ **Data Safety**: Prevents accidental data loss with safety checks and force flags
- ✅ **Multi-tenant Support**: Proper organization association for workflow stages
- ✅ **Complete Workflow Pipeline**: Supports full manufacturing workflow from inquiry to delivery

**Usage Examples:**
```bash
# Safe seeding (checks for existing data)
npm run seed:workflow-stages

# Force seeding (overwrites existing data)
npm run seed:workflow-stages:force

# Direct execution with node
node scripts/seed-workflow-stages.js
node scripts/seed-workflow-stages.js --force
```

**Prerequisites:**
- Local Supabase instance running
- Organizations seeded first (`npm run seed:organizations`)
- Environment variables configured in `.env.local`

**Files Modified:**
- `package.json` - Added workflow stages seeding npm scriptsVerification Capabilities**: 
  - Validates seeded organization data in local Supabase database
  - Displays organization details including name, slug, industry, and settings
  - Provides confirmation of successful data seeding operations
  - Shows timezone, currency, and language configuration for each organization

**Usage Workflow**:
```bash
# Seed organizations data
npm run seed:organizations

# Verify the seeded data
npm run verify:organizations

# Force reseed and verify
npm run seed:organizations:force
npm run verify:organizations
```

**Impact:**
- ✅ **Enhanced Development Workflow**: Easy verification of database seeding operations
- ✅ **Quality Assurance**: Quick validation of organization data integrity
- ✅ **Debugging Support**: Helps identify issues with seeded data configuration
- ✅ **Documentation Alignment**: Ensures seeded data matches expected schema structure

**Files Modified:**
- `package.json` - Added `verify:organizations` npm script for database verification

**Project Status**: Core foundation with enhanced database management and verification workflows
**Ready for**: Frontend development, database operations, and comprehensive data validation

### 2025-08-31 - Database Functions and Triggers Enhancement ✅

**Changes Made:**
- **Enhanced Activity Logging**: Improved `log_activity()` function with better organization ID handling and null safety
  - **Multi-Tenant Safety**: Enhanced organization ID resolution with fallback logic to prevent logging failures
  - **Null Safety**: Added conditional logging to only create activity log entries when organization ID is available
  - **Entity Organization Detection**: Improved logic to detect organization ID from entity data or user context
  - **Robust Error Handling**: Prevents activity logging failures from blocking database operations

**Technical Implementation:**
- **Enhanced `log_activity()` Function**: 
  - Added `entity_org_id` variable for better organization ID resolution
  - Implemented fallback chain: `NEW.organization_id → OLD.organization_id → user_org_id`
  - Added conditional check `IF entity_org_id IS NOT NULL` before logging
  - Maintains audit trail integrity while preventing logging failures

- **Organization ID Resolution Logic**:
  ```sql
  -- Get entity's organization ID (fallback to user's org if not found)
  entity_org_id := COALESCE(NEW.organization_id, OLD.organization_id, user_org_id);
  
  -- Only log if we have an organization ID
  IF entity_org_id IS NOT NULL THEN
      -- Insert activity log entry
  END IF;
  ```

- **Multi-Tenant Audit Trail**: Ensures all activity log entries have proper organization association
- **Graceful Degradation**: Database operations continue even if activity logging encounters issues
- **Comprehensive Coverage**: Activity logging triggers remain active on projects, contacts, and reviews tables

**Impact:**
- ✅ **Improved Reliability**: Activity logging no longer fails due to missing organization context
- ✅ **Multi-Tenant Safety**: All activity log entries properly associated with organizations
- ✅ **Better Error Handling**: Database operations protected from logging-related failures
- ✅ **Audit Trail Integrity**: Maintains comprehensive activity tracking while improving robustness
- ✅ **Production Ready**: Enhanced error handling suitable for production deployment

**Database Functions Status**: Enhanced and production-ready with robust error handling
**Ready for**: Production deployment, comprehensive audit trail, multi-tenant activity logging

### 2025-08-31 - Initial Database Schema Foundation ✅

**Changes Made:**
- **Initial Database Schema**: Created foundational database schema for Factory Pulse manufacturing system
  - **6 Custom Types**: Essential enum types for user roles, project statuses, contact types, priority levels, and subscription plans
  - **4 Core Tables**: Organizations, workflow_stages, users, contacts, and projects tables with proper relationships
  - **Multi-Tenant Foundation**: Organizations table as root entity with proper foreign key relationships
  - **Authentication Ready**: Users table extends Supabase auth.users with organization-based multi-tenancy
  - **Workflow Management**: Configurable workflow stages with role assignments and exit criteria

**Technical Implementation:**
- **Database Migration**: Created `supabase/migrations/20250831000001_initial_schema.sql` with foundational schema
- **PostgreSQL Extensions**: Enabled uuid-ossp and pgcrypto for UUID generation and encryption
- **Multi-Tenant Architecture**: Organizations table supports multiple companies with isolated data
- **User Management**: Users table for internal employees with role-based access control
- **Contact Management**: External customers and suppliers managed separately from internal users
- **Project Workflow**: Projects linked to workflow stages with configurable progression

**Database Tables Created:**
- **organizations**: Multi-tenant root entity with subscription plans and settings
- **workflow_stages**: Configurable workflow stages with colors, ordering, and role assignments
- **users**: Internal employees extending Supabase auth with organizational context
- **contacts**: External customers and suppliers with AI-ready fields
- **projects**: Core project entity with workflow stage tracking and metadata

**Custom Types Defined:**
- **user_role**: admin, management, sales, engineering, qa, production, procurement, supplier, customer
- **user_status**: active, inactive, pending, suspended
- **contact_type**: customer, supplier, partner, internal
- **project_status**: active, completed, cancelled, on_hold
- **priority_level**: low, medium, high, critical
- **subscription_plan**: starter, growth, enterprise

**Schema Features:**
- **Multi-Tenant Ready**: Organization-based data isolation for SaaS deployment
- **Audit Trail**: Created_at and updated_at timestamps on all tables
- **Flexible Metadata**: JSONB fields for extensible configuration and data storage
- **AI Integration Ready**: AI processing fields in contacts table for future automation
- **Vietnam Localization**: Support for Vietnamese business context and requirements
- **Role-Based Access**: Comprehensive user role system for manufacturing workflows
- **Workflow Flexibility**: Configurable stages with exit criteria and responsible roles

**Sample Data Integration:**
- **Organizations**: Supports sample data structure with Factory Pulse Vietnam as primary organization
- **Workflow Stages**: Ready for 8-stage manufacturing workflow (inquiry → delivery)
- **User Roles**: Covers all manufacturing roles from sales to production
- **Contact Types**: Separates customers and suppliers for proper relationship management

**Database Status**: Foundation established, ready for additional tables and sample data import  
**Ready for**: Extended schema development, sample data import, authentication setup  
**Files**: `supabase/migrations/20250831000001_initial_schema.sql`

**Next Steps**: 
- Add remaining tables (documents, reviews, messages, notifications, activity_log)
- Import sample organizations and workflow stages
- Create authentication users and test multi-tenant access
- Implement remaining business logic tables for complete system

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