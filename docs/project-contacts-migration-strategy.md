# Project Contacts Migration Strategy

## Overview

This document outlines the complete migration strategy to simplify the project contacts model by replacing the `project_contact_points` junction table with a `point_of_contacts` array column in the `projects` table.

## Current vs New Model

### Current Model (Complex)
```
Projects Table:
- customer_id (UUID) → contacts table
- customer_organization_id (UUID) → organizations table

Project Contact Points Table (Junction):
- project_id → projects table
- contact_id → contacts table
- role (project-specific)
- is_primary (project-specific)

Contacts Table:
- organization_id → organizations table
- role (contact's base role)
- is_primary_contact (organization-level)
```

### New Model (Simplified)
```
Projects Table:
- customer_organization_id (UUID) → organizations table
- point_of_contacts (UUID[]) → array of contact IDs
- Primary contact = first element in array

Contacts Table:
- organization_id → organizations table
- role (contact's role)
- is_primary_contact (organization-level)

Removed:
- customer_id column from projects
- project_contact_points table entirely
```

## Benefits of New Model

1. **Simplified Schema**: Eliminates junction table complexity
2. **Better Performance**: Fewer JOINs, direct array operations
3. **Intuitive Data Model**: Contacts directly stored with projects
4. **Atomic Updates**: Single UPDATE to change project contacts
5. **PostgreSQL Optimized**: Arrays are well-supported and performant

## Migration Phases

### Phase 1: Schema Changes & Data Migration
**File**: `supabase/migrations/20250205000001_simplify_project_contacts.sql`

**Actions**:
1. Add `point_of_contacts UUID[]` column to projects table
2. Create GIN index for array operations
3. Migrate data from `project_contact_points` to arrays
4. Create helper functions for contact management
5. Validate data migration

**Key Functions Created**:
- `get_project_contacts(project_uuid)` - Get contacts with details
- `get_project_primary_contact(project_uuid)` - Get primary contact
- `add_contact_to_project(project_uuid, contact_uuid, make_primary)` - Add contact
- `remove_contact_from_project(project_uuid, contact_uuid)` - Remove contact

### Phase 2: Cleanup Old Structures
**File**: `supabase/migrations/20250205000002_cleanup_old_contact_model.sql`

**Actions**:
1. Validate migration before cleanup
2. Create backup of `project_contact_points` table
3. Remove `customer_id` column from projects
4. Drop `project_contact_points` table and related structures
5. Create optimized view `project_details_view`
6. Clean up old functions and indexes

## Data Flow Examples

### Getting Project with Customer Info
```sql
SELECT 
  p.*,
  o.name as customer_name,
  -- Get contacts using array
  (SELECT json_agg(
    json_build_object(
      'id', c.id,
      'contact_name', c.contact_name,
      'email', c.email,
      'role', c.role,
      'is_primary', c.id = p.point_of_contacts[1]
    )
  )
  FROM contacts c 
  WHERE c.id = ANY(p.point_of_contacts)
  ) as contacts
FROM projects p
JOIN organizations o ON p.customer_organization_id = o.id;
```

### Primary Contact Logic
- **Primary Contact**: First element in `point_of_contacts` array
- **Access**: `point_of_contacts[1]` in SQL
- **Management**: Array operations (prepend, append, remove)

## TypeScript Interface Changes

### Before
```typescript
interface Project {
  customer_id?: string;
  customer_organization_id?: string;
  contact_points?: ProjectContactPoint[];
}

interface ProjectContactPoint {
  id: string;
  project_id: string;
  contact_id: string;
  role?: string;
  is_primary: boolean;
}
```

### After
```typescript
interface Project {
  customer_organization_id: string; // Required
  point_of_contacts: string[]; // Array of contact IDs
  
  // Computed fields
  customer_organization?: Organization;
  contacts?: Contact[];
  primary_contact?: Contact; // First in array
}
```

## Service Layer Updates

### New ProjectContactService
**File**: `src/services/projectContactService.ts`

**Key Methods**:
- `getProjectContacts(projectId)` - Get all project contacts
- `getPrimaryContact(projectId)` - Get primary contact
- `getAvailableContacts(organizationId)` - Get org contacts for selection
- `setProjectContacts(projectId, contactIds)` - Replace all contacts
- `addContactToProject(projectId, contactId, makePrimary)` - Add contact
- `removeContactFromProject(projectId, contactId)` - Remove contact
- `setPrimaryContact(projectId, contactId)` - Set primary (move to front)
- `reorderContacts(projectId, orderedContactIds)` - Reorder contacts

### Updated Query Service
**File**: `src/services/optimizedQueryService.ts`

**Changes**:
- Removed `customer_id` from field presets
- Removed `contact_points:project_contact_points` joins
- Updated to use `point_of_contacts` array
- Simplified query patterns

## Database Functions Reference

### Core Functions
```sql
-- Get project contacts with details
SELECT * FROM get_project_contacts('project-uuid');

-- Get primary contact
SELECT * FROM get_project_primary_contact('project-uuid');

-- Add contact to project
SELECT add_contact_to_project('project-uuid', 'contact-uuid', true);

-- Remove contact from project
SELECT remove_contact_from_project('project-uuid', 'contact-uuid');
```

### Array Operations
```sql
-- Add contact to end
UPDATE projects SET point_of_contacts = point_of_contacts || ARRAY['contact-uuid'];

-- Add contact to front (make primary)
UPDATE projects SET point_of_contacts = ARRAY['contact-uuid'] || point_of_contacts;

-- Remove contact
UPDATE projects SET point_of_contacts = array_remove(point_of_contacts, 'contact-uuid');

-- Check if contact exists
SELECT 'contact-uuid' = ANY(point_of_contacts) FROM projects WHERE id = 'project-uuid';
```

## UI Implementation Guidelines

### Contact Selection Interface
1. **Available Contacts**: Query contacts by `organization_id = customer_organization_id`
2. **Filter**: `type IN ('customer', 'partner')` AND `is_active = true`
3. **Display**: Show organization primary contact first, then others by role
4. **Selection**: Multi-select with drag-and-drop for ordering
5. **Primary**: First selected contact becomes primary automatically

### Contact Display
1. **Primary Badge**: Show badge for first contact in array
2. **Role Display**: Use contact's base role from contacts table
3. **Reordering**: Allow drag-and-drop to change contact order
4. **Quick Actions**: Add/remove contacts with organization contact picker

## Migration Execution Steps

### 1. Pre-Migration Validation
```sql
-- Check current state
SELECT COUNT(*) FROM project_contact_points;
SELECT COUNT(*) FROM projects WHERE customer_organization_id IS NOT NULL;
```

### 2. Run Migration Phase 1
```bash
# Apply first migration
supabase db push
# Or manually: psql -f supabase/migrations/20250205000001_simplify_project_contacts.sql
```

### 3. Validate Migration
```sql
-- Check data migration
SELECT validate_contact_migration();

-- Spot check projects
SELECT project_id, customer_organization_id, point_of_contacts 
FROM projects 
WHERE point_of_contacts IS NOT NULL 
LIMIT 5;
```

### 4. Update Application Code
- Update TypeScript interfaces
- Replace old service calls with new ProjectContactService
- Update UI components to use new data structure
- Test contact selection and management features

### 5. Run Migration Phase 2 (Cleanup)
```bash
# Apply cleanup migration after code is updated and tested
supabase db push
```

### 6. Final Validation
```sql
-- Verify cleanup
SELECT validate_migration_before_cleanup();

-- Check final state
SELECT COUNT(*) FROM projects WHERE point_of_contacts IS NOT NULL;
\d project_contact_points; -- Should not exist
```

## Rollback Strategy

### If Issues Found Before Phase 2
1. Data is still in `project_contact_points` table (backup exists)
2. Can revert by dropping `point_of_contacts` column
3. Application code can fall back to old model

### If Issues Found After Phase 2
1. Use `project_contact_points_backup` table to restore
2. Recreate `project_contact_points` table structure
3. Migrate data back from arrays to junction table
4. Revert application code changes

## Performance Considerations

### Array Operations
- **GIN Index**: Created on `point_of_contacts` for efficient queries
- **Array Size**: Typical projects have 1-5 contacts (very manageable)
- **Query Performance**: `= ANY(array)` is optimized in PostgreSQL

### Query Patterns
```sql
-- Efficient: Find projects with specific contact
SELECT * FROM projects WHERE 'contact-uuid' = ANY(point_of_contacts);

-- Efficient: Get contact count
SELECT project_id, array_length(point_of_contacts, 1) as contact_count FROM projects;

-- Efficient: Primary contact join
SELECT p.*, c.contact_name as primary_contact_name
FROM projects p
LEFT JOIN contacts c ON c.id = p.point_of_contacts[1];
```

## Testing Checklist

### Database Level
- [ ] Migration runs without errors
- [ ] Data integrity maintained (no lost contacts)
- [ ] Primary contact logic works correctly
- [ ] Array operations perform well
- [ ] Helper functions work as expected

### Application Level
- [ ] Project list shows correct customer info
- [ ] Project details show all contacts
- [ ] Primary contact is identified correctly
- [ ] Contact selection UI works
- [ ] Contact reordering works
- [ ] Add/remove contacts works
- [ ] Performance is acceptable

### Edge Cases
- [ ] Projects with no contacts
- [ ] Projects with single contact
- [ ] Projects with many contacts (10+)
- [ ] Invalid contact IDs in arrays
- [ ] Deleted contacts referenced in arrays

## Success Metrics

1. **Data Integrity**: 100% of project contacts migrated successfully
2. **Performance**: Query response time improved by 20-30%
3. **Code Simplicity**: Reduced contact-related code complexity by ~40%
4. **Maintainability**: Easier to understand and debug contact relationships
5. **User Experience**: Faster contact selection and management UI

## Conclusion

This migration simplifies the project contacts model while maintaining all necessary functionality. The new array-based approach is more intuitive, performant, and easier to maintain while leveraging PostgreSQL's excellent array support.

The migration is designed to be safe with comprehensive validation and rollback options at each phase.