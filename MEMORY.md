# Factory Pulse - Development Memory

## Recent Changes

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

## Development Guidelines

### Type Safety
- Always import the correct types for the context
- Use `ProjectStatus` for project lifecycle status ('active', 'completed', etc.)
- Use `ProjectStage` for legacy workflow stages (backward compatibility only)
- Use `WorkflowStage` for current database-driven workflow stages
- Ensure interface fields match database schema exactly for new features
- Use computed fields (`order_index`) for legacy compatibility when needed

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