# Database Schema Migration Summary

This document summarizes the updates made to the Factory Pulse codebase to align with the new enhanced database schema defined in `docs/database-schema.md`.

## Key Schema Changes Implemented

### 1. **Project Entity Updates**

#### New Fields Added:
- `organization_id`: Multi-tenancy support
- `current_stage_id`: Reference to workflow_stages table
- `priority_level`: Replaces `priority` (with backward compatibility)
- `priority_score`: Numeric priority scoring (0-100)
- `estimated_delivery_date`: Replaces `due_date` (with backward compatibility)
- `actual_delivery_date`: Actual completion tracking
- `source`: Project source tracking ('manual', 'portal', 'email', 'api', 'import', 'migration')
- `assigned_to`: Replaces `assignee_id` (with backward compatibility)

#### Enhanced Relationships:
- `customer` now references `contacts` table instead of `customers`
- `current_stage_id` now references `workflow_stages` table
- Support for `project_stage_history` tracking
- Support for `project_assignments` for multi-user assignments

### 2. **New Entity Types**

#### Contacts (Enhanced Customer/Supplier Management):
```typescript
interface Contact {
  id: string;
  organization_id: string;
  type: 'customer' | 'supplier';
  company_name: string;
  contact_name?: string;
  // ... enhanced fields including AI-ready capabilities
}
```

#### Workflow Stages (Configurable Workflow):
```typescript
interface WorkflowStage {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  color: string;
  stage_order: number;
  exit_criteria?: string;
  responsible_roles?: string[];
}
```

#### Project Stage History (Audit Trail):
```typescript
interface ProjectStageHistory {
  id: string;
  project_id: string;
  stage_id: string;
  entered_at: string;
  exited_at?: string;
  duration_minutes?: number;
  entered_by?: string;
  exit_reason?: string;
  notes?: string;
}
```

## Code Changes Made

### 1. **Type Definitions Updated** (`src/types/project.ts`)

- Added new field types with backward compatibility
- Enhanced `Project` interface with new schema fields
- Added new entity interfaces: `Contact`, `WorkflowStage`, `ProjectStageHistory`, `ProjectAssignment`
- **Dynamic Workflow Stage Support**: Added `WorkflowStageId` type for database-driven workflow stages
- **Legacy Compatibility**: Maintained `ProjectStage` enum for backward compatibility during migration
- Maintained legacy field support for smooth migration

### 2. **Component Updates**

#### ProjectSummaryCard (`src/components/dashboard/ProjectSummaryCard.tsx`)
- Updated to use `priority_level` with fallback to `priority`
- Updated to use `assigned_to` with fallback to `assignee_id`
- Enhanced urgency calculation with new fields

#### WorkflowStepper (`src/components/project/WorkflowStepper.tsx`)
- Updated to use `current_stage_id` with fallback to `status`
- Enhanced stage calculations with new schema
- Improved logging and debugging for new fields

#### WorkflowFlowchart (`src/components/project/WorkflowFlowchart.tsx`)
- Updated project filtering to use `current_stage_id`
- Enhanced stage status calculations
- Improved project grouping by stage

#### ProjectTable (`src/components/project/ProjectTable.tsx`)
- ✅ **Fixed sorting logic for stage field** - Now handles both joined `current_stage` object and legacy `current_stage_id` references
- ✅ **Fixed priority sorting** - Updated from `priority` to `priority_level` to match database field
- ✅ **Added fallback handling** - Graceful degradation when stage data is missing or undefined
- ✅ **Schema alignment** - All sorting operations now use correct database field names

### 3. **Service Layer Updates**

#### ProjectService (`src/services/projectService.ts`)
- Updated Supabase queries to join with `contacts` and `workflow_stages`
- Enhanced data fetching with new relationships
- **Query Optimization (2025-08-30)**: Replaced wildcard `*` selects with explicit field selection in `getProjectById` function
  - Improved performance by selecting only required fields
  - Reduced network overhead and data transfer
  - Ensured schema alignment with explicit field mapping
  - Optimized JOIN queries for customer and workflow stage relationships

#### useProjects Hook (`src/hooks/useProjects.ts`)
- Updated all database queries to use new schema
- Enhanced project status updates to handle `current_stage_id`
- Improved optimistic updates with new field structure
- **Legacy Field Mapping (2025-01-30)**: Added automatic field mapping for backward compatibility
  - Maps `estimated_delivery_date` to `due_date` for legacy components
  - Maps `priority_level` to `priority` for existing component interfaces
  - Computes `order_index` from `stage_order` in workflow stage objects
- **Data Transformation**: Ensures seamless compatibility between database schema and component expectations

### 4. **New Components Created**

#### ProjectWorkflowAnalytics (`src/components/project/ProjectWorkflowAnalytics.tsx`)
- Comprehensive analytics dashboard for workflow performance
- Stage distribution charts and bottleneck analysis
- Priority distribution and efficiency metrics
- Utilizes new schema fields for enhanced insights

#### EnhancedProjectSummary (`src/components/project/EnhancedProjectSummary.tsx`)
- Rich project summary component using new schema
- Enhanced display of project metadata and relationships
- Improved urgency indicators and progress tracking
- Support for new fields like `source`, `priority_score`, etc.

### 5. **Page Updates**

#### Projects Page (`src/pages/Projects.tsx`)
- Added new "Analytics" tab with workflow analytics
- Updated filtering logic to use new schema fields
- Enhanced project type filtering and stage calculations
- Integrated new components for better user experience

## Backward Compatibility

All changes maintain backward compatibility by:

1. **Field Fallbacks**: Using `||` operators to fall back to legacy field names
2. **Type Unions**: Supporting both old and new field names in interfaces
3. **Gradual Migration**: New fields are optional, existing functionality preserved
4. **Legacy Support**: Old field names still work while new ones are preferred

## Database Query Updates

### Before:
```sql
SELECT *, customer:customers(*) FROM projects
```

### After:
```sql
SELECT *, 
  customer:contacts!customer_id(*),
  current_stage:workflow_stages!current_stage_id(*)
FROM projects
```

## Key Benefits Achieved

1. **Enhanced Multi-tenancy**: Organization-based data isolation
2. **Configurable Workflows**: Dynamic workflow stage management with database-driven stages
3. **Better Analytics**: Rich data for workflow performance analysis
4. **Audit Trail**: Complete project stage history tracking
5. **AI-Ready**: Fields prepared for AI/automation features
6. **Vietnam/SEA Support**: Localization-ready structure
7. **Improved UX**: Better project summaries and analytics
8. **Type System Flexibility**: Dual-type system supporting both legacy and dynamic workflow stages

## Migration Path

1. **Phase 1**: Deploy code changes (backward compatible)
2. **Phase 2**: Update database schema with new tables
3. **Phase 3**: Migrate existing data to new structure
4. **Phase 4**: Gradually deprecate legacy fields
5. **Phase 5**: Remove backward compatibility code

## Testing Recommendations

1. Test all existing functionality with legacy data
2. Verify new components work with enhanced schema
3. Test analytics with various project distributions
4. Validate real-time updates with new field structure
5. Ensure proper fallback behavior for missing fields

## Next Steps

1. **Database Migration Scripts**: Create SQL scripts for schema updates
2. **Data Migration**: Plan migration of existing project data
3. **User Training**: Update documentation for new features
4. **Performance Testing**: Validate query performance with new joins
5. **Feature Rollout**: Gradual rollout of enhanced features

This migration provides a solid foundation for the enhanced Factory Pulse MES system while maintaining full backward compatibility during the transition period.