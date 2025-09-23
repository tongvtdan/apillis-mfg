# Reviews Table Foreign Key Fix - 2025-01-17

## Issue
The reviews query was returning 400 Bad Request error:
```
GET http://127.0.0.1:54321/rest/v1/reviews?select=*,projects:project_id(id,project_id,title,description,current_stage_id)&reviewer_id=eq.660e8400-e29b-41d4-a716-446655440003&status=eq.pending&order=created_at.desc 400 (Bad Request)
```

Error message: "No suitable key or wrong key type"

## Root Cause
The reviews view didn't have proper foreign key constraints that Supabase could recognize for automatic joins. Supabase's automatic join syntax (`projects:project_id(...)`) requires foreign key relationships to be properly defined.

## Solution
Replaced the reviews view with a proper reviews table that includes foreign key constraints:

### Migration: 20250117000009_create_reviews_table.sql
- **Dropped the reviews view** and created a proper table
- **Added foreign key constraints**:
  - `project_id` → `projects(id)`
  - `reviewer_id` → `users(id)`
  - `organization_id` → `organizations(id)`
- **Created proper indexes** for performance
- **Enabled Row Level Security (RLS)** with organization-based policies
- **Migrated existing data** from the approvals table
- **Created review_checklist_items table** with proper foreign key to reviews

### Key Changes
- **Table Structure**: Proper table instead of view
- **Foreign Keys**: All relationships properly defined
- **RLS Policies**: Organization-based security
- **Data Migration**: Existing approvals data migrated to reviews table
- **Performance**: Added indexes on key columns

### Field Mappings from Approvals
- `entity_id` → `project_id` (with FK constraint)
- `current_approver_id` → `reviewer_id` (with FK constraint)
- `current_approver_role` → `reviewer_role` (nullable)
- `approval_type` → `review_type`
- `decision_comments` → `comments`
- `request_metadata` → `risks`
- `decision_reason` → `recommendations`
- `decided_at` → `reviewed_at`

## Testing Results
- ✅ Basic reviews query works: `GET /rest/v1/reviews?select=*`
- ✅ Join query works: `GET /rest/v1/reviews?select=*,projects:project_id(...)`
- ✅ Filtered query works: `GET /rest/v1/reviews?select=*,projects:project_id(...)&reviewer_id=eq.xxx&status=eq.pending`
- ✅ Returns empty array `[]` when no matching records (expected behavior)
- ✅ Supabase automatic join syntax now works correctly

## Files Modified
- `supabase/migrations/20250117000008_add_entity_id_foreign_key.sql` - Added FK constraint to approvals
- `supabase/migrations/20250117000009_create_reviews_table.sql` - Created proper reviews table
- Replaced view with table for better Supabase compatibility

## Impact
- ✅ Fixes 400 Bad Request errors for reviews queries
- ✅ Enables Supabase automatic join syntax
- ✅ Maintains data integrity with proper foreign keys
- ✅ Improves performance with proper indexes
- ✅ Provides proper RLS security
- ✅ Dashboard should now load without errors
