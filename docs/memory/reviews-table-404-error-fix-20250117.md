# Reviews Table 404 Error Fix - 2025-01-17

## Issue
The dashboard was showing 404 errors when trying to access the `reviews` table:
```
GET http://127.0.0.1:54321/rest/v1/reviews?select=*%2Cprojects%3Aproject_id%28id%2Cproject_id%2Ctitle%2Cdescription%2Ccurrent_stage_id%29&reviewer_id=eq.660e8400-e29b-41d4-a716-446655440003&status=eq.pending&order=created_at.desc 404 (Not Found)
```

## Root Cause
The codebase was trying to query a `reviews` table that didn't exist in the database. The database schema uses an `approvals` table instead, but multiple components were still referencing the non-existent `reviews` table.

## Solution
Created a database view that maps the `reviews` table to the `approvals` table for backward compatibility:

### Migration: 20250117000007_create_reviews_view.sql
- Created `reviews` view that maps to `approvals` table
- Maps relevant fields:
  - `entity_id` → `project_id`
  - `current_approver_id` → `reviewer_id`
  - `current_approver_role` → `reviewer_role`
  - `approval_type` → `review_type`
  - `decision_comments` → `comments`
  - `request_metadata` → `risks`
  - `decision_reason` → `recommendations`
  - `decided_at` → `reviewed_at`
- Added `tooling_required` computed field based on approval type
- Created empty `review_checklist_items` view as placeholder
- Granted proper permissions to authenticated users

### Field Mappings
- **Project ID**: `entity_id` from approvals → `project_id` in reviews
- **Reviewer**: `current_approver_id` → `reviewer_id`
- **Review Type**: `approval_type` → `review_type`
- **Status**: Direct mapping
- **Priority**: Direct mapping
- **Comments**: `decision_comments` → `comments`
- **Metadata**: `request_metadata` → `risks`

## Testing Results
- Reviews view successfully created and accessible
- Query returns 2 existing approval records
- Specific user query works (returns 0 rows as expected - no pending reviews for that user)
- Dashboard should now load without 404 errors

## Files Modified
- `supabase/migrations/20250117000007_create_reviews_view.sql` - New migration file
- Created database views for backward compatibility
- No code changes required - existing code continues to work

## Impact
- Fixes dashboard 404 errors
- Maintains backward compatibility with existing code
- Allows approval system to work seamlessly
- No breaking changes to frontend components
