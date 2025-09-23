# Project assigned_to Field Investigation and Debugging

**Date:** January 17, 2025  
**Issue:** User questioning whether project.assigned_to is being read when opening project details page

## Investigation Summary

The user correctly questioned whether the `project.assigned_to` field is actually being populated when fetching project data. This is a crucial question because if the field is not being selected from the database or is null/undefined, then our fix to use `assigned_to` instead of `created_by` won't work properly.

## Database Query Analysis

I examined all the project fetching hooks to verify that `assigned_to` is being selected:

### 1. useProjectAnalytics.getProjectById
```sql
SELECT *, customer_organization:organizations!customer_organization_id(*), current_stage:workflow_stages(*)
```
- Uses `SELECT *` - **Should include assigned_to**

### 2. useProjectListing
```sql
SELECT id, organization_id, project_id, title, description, customer_organization_id, 
       point_of_contacts, current_stage_id, status, priority_level, source, 
       assigned_to, created_by, estimated_value, ...
```
- **Explicitly selects assigned_to** ✅

### 3. useEnhancedProjects
```sql
SELECT *, customer_organization:organizations!customer_organization_id(*), current_stage:workflow_stages(*)
```
- Uses `SELECT *` - **Should include assigned_to**

### 4. useProjectsOptimized
```sql
SELECT id, organization_id, project_id, title, description, customer_organization_id,
       point_of_contacts, current_stage_id, status, priority_level, source,
       assigned_to, created_by, estimated_value, ...
```
- **Explicitly selects assigned_to** ✅

## Potential Issues

Even though `assigned_to` is being selected in the queries, there could be several reasons why it might not be working:

1. **Database Schema**: The `assigned_to` field might not exist in the database
2. **Data Population**: The field might exist but be null/undefined for existing projects
3. **Type Mapping**: The field might be selected but not properly mapped to the Project type
4. **RLS Policies**: Row Level Security might be filtering out the field

## Debugging Added

I've added comprehensive debugging to track the actual values:

### ProjectDetail Component
```typescript
console.log('🔍 ProjectDetail: Project data debug:', {
  id,
  specificProject: specificProject ? { 
    id: specificProject.id, 
    title: specificProject.title,
    assigned_to: specificProject.assigned_to,  // ← Debug assigned_to
    created_by: specificProject.created_by     // ← Debug created_by
  } : null,
  // ... similar for other project sources
});
```

### ProjectDetailHeader Component
```typescript
console.log('🔍 ProjectDetailHeader: Owner fields debug:', {
  projectId: project.id,
  assigned_to: project.assigned_to,      // ← Debug assigned_to value
  created_by: project.created_by,        // ← Debug created_by value
  ownerDisplayName: ownerDisplayName     // ← Debug final display name
});
```

## Expected Debug Output

When you open a project details page, you should now see console logs like:

```
🔍 ProjectDetail: Project data debug: {
  id: "220e8400-e29b-41d4-a716-446655440001",
  specificProject: {
    id: "220e8400-e29b-41d4-a716-446655440001",
    title: "Acme Manufacturing - Precision Components",
    assigned_to: "660e8400-e29b-41d4-a716-446655440003",  // ← Should show UUID or null
    created_by: "660e8400-e29b-41d4-a716-446655440003"     // ← Should show UUID or null
  },
  // ...
}

🔍 ProjectDetailHeader: Owner fields debug: {
  projectId: "220e8400-e29b-41d4-a716-446655440001",
  assigned_to: "660e8400-e29b-41d4-a716-446655440003",    // ← Should show UUID or null
  created_by: "660e8400-e29b-41d4-a716-446655440003",     // ← Should show UUID or null
  ownerDisplayName: "Nguyen Van A"                        // ← Should show user name
}
```

## Next Steps

1. **Check Console Logs**: Open a project details page and check the console for these debug logs
2. **Verify Field Values**: Look at the `assigned_to` and `created_by` values in the logs
3. **Identify Issue**: Determine if:
   - `assigned_to` is null/undefined (field not populated in database)
   - `assigned_to` has a value but user lookup fails
   - Both fields have values but the wrong one is being used

## Files Modified

### `src/pages/ProjectDetail.tsx`
- Added debugging for `assigned_to` and `created_by` fields in project data

### `src/components/project/ProjectDetailHeader.tsx`
- Added debugging for owner field values and display name

## Testing

- No linting errors detected
- Debug logging added to track field values
- Ready to identify the root cause of the owner display issue
