# Activity Log Enhancement - Project ID Implementation

## Overview

This update enhances the Factory Pulse application's activity logging capabilities by adding a dedicated [project_id](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L175-L175) column to the [activity_log](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L155-L155) table. This improvement enables more efficient project-based analytics and reporting.

## Changes Made

### 1. Database Schema Changes

**File**: `supabase/migrations/20250901190000_add_project_id_to_activity_log.sql`

- Added [project_id](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L175-L175) column of type `uuid` to the [activity_log](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L155-L155) table
- Added foreign key constraint referencing `projects.id`
- Added index on [project_id](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L175-L175) for improved query performance
- Added column comment for documentation

### 2. Database Function Update

**File**: `supabase/migrations/20250901191000_update_log_activity_function.sql`

- Updated the `log_activity()` function to automatically populate the [project_id](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L175-L175) column
- Enhanced logic to detect project_id from various entity types:
  - For `projects` table: Uses the entity's own ID
  - For `documents`, `messages`, `project_assignments`, `project_sub_stage_progress`: Extracts from the entity's [project_id](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L175-L175) field
  - For direct [activity_log](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L155-L155) inserts: Preserves existing [project_id](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L175-L175)

### 3. TypeScript Type Definitions

**File**: `src/integrations/supabase/types.ts`

- Updated the [ActivityLog](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/hooks/useActivityLogs.ts#L7-L17) interface to include the new [project_id](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L175-L175) property
- Updated Row, Insert, and Update types for the [activity_log](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L155-L155) table

### 4. Application Code Updates

#### Stage History Service

**File**: `src/services/stageHistoryService.ts`

- Added [project_id](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L175-L175) to manual activity log entries for stage transitions

#### Audit Logger Hook

**File**: `src/hooks/useAuditLogger.ts`

- Added [projectId](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/components/dashboard/RecentActivities.tsx#L20-L20) property to [AuditLogEntry](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/hooks/useAuditLogger.ts#L11-L18) interface
- Updated audit logging to populate the [project_id](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L175-L175) column when provided

#### Activity Logs Hook

**File**: `src/hooks/useActivityLogs.ts`

- Added [project_id](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L175-L175) to the [ActivityLog](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/hooks/useActivityLogs.ts#L7-L17) interface
- Updated query to include [project_id](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L175-L175) in the select statement

#### Recent Activities Component

**File**: `src/components/dashboard/RecentActivities.tsx`

- Updated activity mapping logic to prioritize [project_id](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L175-L175) from the new column
- Maintained backward compatibility with existing metadata-based project ID extraction

### 5. New Analytics Service

**File**: `src/services/activityAnalyticsService.ts`

- Created new service for project activity analytics
- Implemented methods for:
  - Project activity statistics
  - User activity statistics
  - Activity trends over time
  - Most active projects

### 6. Analytics Visualization Component

**File**: `src/components/analytics/ProjectActivityChart.tsx`

- Created new component to visualize project activity data
- Implemented bar chart for top projects by activity
- Implemented pie chart for activity type distribution
- Added detailed project activity table

## Benefits

1. **Improved Query Performance**: Direct [project_id](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L175-L175) column eliminates need to parse JSON metadata
2. **Enhanced Analytics**: More efficient project-based reporting and analysis
3. **Better Data Integrity**: Direct foreign key relationship ensures data consistency
4. **Automatic Population**: Database function automatically populates [project_id](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L175-L175) for relevant activities
5. **Backward Compatibility**: Existing metadata-based approaches continue to work
6. **Scalability**: Indexed column supports efficient querying of large datasets

## Migration Notes

1. Run the new migrations in order:
   - `20250901190000_add_project_id_to_activity_log.sql`
   - `20250901191000_update_log_activity_function.sql`

2. The changes are backward compatible - existing data and code will continue to work

3. New activities will automatically populate the [project_id](file:///Volumes/Work/Projects/Apillis/Apillis-MFG/source/src/integrations/supabase/types.ts#L175-L175) column when applicable

4. For existing analytics that relied on metadata, consider updating to use the new column for better performance