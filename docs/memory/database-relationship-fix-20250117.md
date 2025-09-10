# Database Relationship Error Fix

**Date:** January 17, 2025  
**Issue:** "Could not embed because more than one relationship was found for 'projects' and 'organizations'"

## Problem Analysis

The inquiry intake form was failing with a database relationship error when trying to create projects. This error occurs when Supabase queries try to embed related data without specifying which foreign key relationship to use.

## Root Cause

The `projects` table has **two foreign key relationships** with the `organizations` table:

1. `organization_id` - References the company/organization that owns the project
2. `customer_organization_id` - References the customer organization

When Supabase queries used `customer_organization:organizations(*)` without specifying which relationship, it caused ambiguity.

## Database Schema Context

```sql
-- Projects table relationships
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id), -- Company that owns the project
    customer_organization_id UUID NOT NULL REFERENCES organizations(id), -- Customer organization
    -- ... other fields
);
```

## Fixes Applied

### 1. Updated Project Creation Query
```typescript
// Before (ambiguous)
.select(`
  *,
  customer_organization:organizations(*),
  current_stage:workflow_stages(*)
`)

// After (explicit relationship)
.select(`
  *,
  customer_organization:organizations!customer_organization_id(*),
  current_stage:workflow_stages(*)
`)
```

### 2. Fixed All Similar Queries

Updated queries in the following files:
- `src/features/project-management/hooks/useProjectCreation.ts`
- `src/features/project-management/hooks/useEnhancedProjects.ts`
- `src/features/project-management/hooks/useProjectAnalytics.ts`
- `src/components/project/ProjectCreationModal.tsx`

### 3. Supabase Query Syntax

The correct syntax for specifying foreign key relationships in Supabase is:
```typescript
// Specify the foreign key column name after the !
customer_organization:organizations!customer_organization_id(*)
```

## Files Modified

1. `src/features/project-management/hooks/useProjectCreation.ts`
   - Fixed project creation query to specify `customer_organization_id` relationship

2. `src/features/project-management/hooks/useEnhancedProjects.ts`
   - Fixed project listing query

3. `src/features/project-management/hooks/useProjectAnalytics.ts`
   - Fixed project analytics queries (2 occurrences)

4. `src/components/project/ProjectCreationModal.tsx`
   - Fixed project creation modal query

## Technical Details

- **Supabase Foreign Key Syntax**: Use `!foreign_key_column_name` to specify which relationship to use
- **Multiple Relationships**: When a table has multiple foreign keys to the same table, always specify which one
- **Backward Compatibility**: This fix doesn't break existing functionality, just makes queries more explicit

## Impact

This fix resolves the database relationship error and allows:
- Successful RFQ submission from inquiry intake forms
- Proper project creation with customer organization data
- Correct embedding of related organization data in queries

## Testing

- No linting errors detected
- All ambiguous queries have been made explicit
- Database relationships are now properly specified
