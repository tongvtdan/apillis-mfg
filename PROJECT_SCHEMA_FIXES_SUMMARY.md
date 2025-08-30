# Project Schema Fixes Summary

## Overview
This document summarizes the schema mismatches identified between the project components and the Supabase database, and the fixes applied to resolve them.

## Schema Mismatches Identified

### 1. Project Interface Mismatches

**Issues Found:**
- Components using `priority` field, but database has `priority_level`
- Components expecting `order_index` in WorkflowStage, but database has `stage_order`
- Components using `due_date` field, but database has `estimated_delivery_date`
- Missing computed fields like `days_in_stage`

**Fixes Applied:**
- Updated Project interface to match database schema exactly
- Added compatibility mappings in useProjects hook
- Added computed fields for backward compatibility

### 2. WorkflowStage Interface Mismatches

**Issues Found:**
- Database schema uses `stage_order` but components expected `order_index`
- Database has `slug`, `color`, `exit_criteria`, `responsible_roles` fields not properly mapped
- Components were using legacy PROJECT_STAGES enum instead of dynamic workflow stages

**Fixes Applied:**
- Updated WorkflowStage interface to match database schema
- Added computed `order_index` field for compatibility
- Updated components to use dynamic workflow stages from database

### 3. Component-Specific Fixes

#### ProjectTable.tsx
- Fixed sorting to use `priority_level` instead of `priority`
- Updated stage display to use `current_stage.name` from joined data
- Added fallback handling for missing stage data

#### ProjectCalendar.tsx
- Updated to use `estimated_delivery_date` as fallback for `due_date`
- Fixed priority display to use `priority_level`
- Updated stage display to use joined `current_stage` data
- Fixed overdue calculation to use correct status fields

#### WorkflowStepper.tsx
- Updated stage calculations to use `stage_order` for sorting
- Added proper stage mapping using both `current_stage_id` and legacy fields
- Fixed stage loading to sort by `stage_order` and add computed `order_index`

#### ProjectWorkflowAnalytics.tsx
- Updated to use dynamic workflow stages instead of static PROJECT_STAGES
- Fixed stage distribution calculation to use `current_stage_id`
- Updated bottleneck calculation to use proper stage matching
- Fixed completion status to check both `status` and stage slug

#### useProjects.ts
- Added computed field mapping in data transformation
- Added `due_date` mapping from `estimated_delivery_date`
- Added `priority` mapping from `priority_level`
- Added `order_index` to current_stage for compatibility

#### Projects.tsx (Main Page)
- Updated workflow stage sorting to use `stage_order`
- Fixed stage counting to use `current_stage_id`
- Updated project filtering to work with new schema

## Database Schema Alignment

### Projects Table Fields (Confirmed)
```typescript
{
  id: string;
  organization_id?: string;
  project_id: string;
  title: string;
  description?: string;
  customer_id?: string;
  current_stage_id?: string; // UUID reference to workflow_stages
  status: ProjectStatus;
  priority_level?: ProjectPriority; // NOT 'priority'
  source?: string;
  assigned_to?: string;
  created_by?: string;
  estimated_value?: number;
  estimated_delivery_date?: string; // NOT 'due_date'
  actual_delivery_date?: string;
  stage_entered_at?: string;
  project_type?: string;
  created_at: string;
  updated_at?: string;
}
```

### Workflow_Stages Table Fields (Confirmed)
```typescript
{
  id: string;
  name: string;
  slug: string;
  stage_order: number; // NOT 'order_index'
  description?: string;
  color?: string;
  exit_criteria?: string;
  responsible_roles?: string[];
  is_active: boolean;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}
```

## Compatibility Layer

To maintain backward compatibility while transitioning to the new schema, the following mappings are applied:

### In useProjects Hook
```typescript
// Computed fields for compatibility
due_date: project.estimated_delivery_date,
priority: project.priority_level,
current_stage: project.current_stage ? {
  ...project.current_stage,
  order_index: project.current_stage.stage_order
} : undefined
```

### In Components
- All components now check both new and legacy field names
- Fallback handling for missing data
- Graceful degradation when schema mismatches occur

## Testing Recommendations

1. **Verify Database Queries**: Ensure all queries use correct field names
2. **Test Stage Transitions**: Verify workflow stage updates work correctly
3. **Check Sorting**: Ensure project and stage sorting uses correct fields
4. **Validate Computed Fields**: Test that calculated fields like `days_in_stage` work
5. **Test Calendar View**: Verify date-based filtering works with new field mappings

## Migration Notes

- All changes are backward compatible
- Legacy field names are still supported through computed mappings
- Components gracefully handle missing or null data
- No database migrations required - only frontend code changes

## Next Steps

1. Test all project views (Kanban, Table, Calendar, Analytics)
2. Verify workflow stepper functionality
3. Test project creation and updates
4. Validate real-time updates work correctly
5. Consider removing legacy field support in future versions