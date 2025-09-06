# Workflow Stages Dropdown Fix - 2025-01-17

## Issue Summary
The stages dropdown in the project list was showing empty and not updating when selected, despite workflow stages existing in the database.

## Root Cause
The `workflowStageService` was trying to get the `organization_id` from the user's metadata (`user_metadata.organization_id`), but this field was not present in the auth user's metadata. Instead, the `organization_id` is stored in the `users` table.

## Solution Applied
1. **Updated workflowStageService**: Modified to fetch `organization_id` from the `users` table instead of user metadata
2. **Added debugging logs**: Enhanced logging to track organization ID usage
3. **Added force refresh method**: Created `forceRefresh()` method for debugging and cache clearing
4. **Updated Projects.tsx**: Used `forceRefresh()` to ensure latest stages are loaded

## Technical Details

### Code Changes
```typescript
// Before: Getting organization_id from metadata (not present)
const organizationId = userData.user?.user_metadata?.organization_id;

// After: Getting organization_id from users table
const { data: userProfile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', userId)
    .single();

if (userProfile?.organization_id) {
    query = query.eq('organization_id', userProfile.organization_id);
}
```

### Database Structure
- **auth.users**: Contains user authentication data, metadata doesn't include organization_id
- **public.users**: Contains user profile data including organization_id
- **workflow_stages**: Filtered by organization_id to show only relevant stages

## Results
✅ Workflow stages now load correctly
✅ Stages dropdown shows all available stages
✅ Stage filtering works properly
✅ Console logs show successful stage loading

## Files Modified
- `src/services/workflowStageService.ts` - Fixed organization_id fetching
- `src/pages/Projects.tsx` - Added force refresh for stages

## Console Logs Expected
```
Fetched workflow stages: (8) [{…}, {…}, ...]
Organization ID used: 550e8400-e29b-41d4-a716-446655440001
Workflow stages loaded: (8) [{…}, {…}, ...]
```

## Migration Applied
No database migration needed - this was a code logic fix.
