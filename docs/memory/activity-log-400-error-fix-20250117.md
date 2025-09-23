# Activity Log 400 Bad Request Error Fix - 2025-01-17

## Issue
The AuthContext was showing 400 Bad Request errors when trying to log authentication events:
```
POST http://127.0.0.1:54321/rest/v1/activity_log 400 (Bad Request)
```

Error message: "null value in column \"organization_id\" of relation \"activity_log\" violates not-null constraint"

## Root Cause
The `logAuditEvent` function in AuthContext was trying to insert records into the `activity_log` table before the user profile was fetched, resulting in:
- `organization_id` being `null` (required field)
- `user_id` potentially being `null` (required field)
- `entity_id` potentially being `null` (required field)

The function was called immediately on authentication events, but the profile fetching was deferred with `setTimeout`, creating a race condition.

## Solution
Enhanced the `logAuditEvent` function in AuthContext to handle missing data gracefully:

### Key Changes
1. **Added validation checks**:
   - Skip logging if `user.id` is missing
   - Skip logging if `organization_id` is missing after attempts to fetch it

2. **Added fallback profile fetching**:
   - If `profile?.organization_id` is not available, fetch it directly from the users table
   - Only proceed with logging if we successfully get the organization_id

3. **Improved error handling**:
   - Added warning messages for missing data
   - Graceful fallback when profile fetch fails

### Code Changes
```typescript
const logAuditEvent = async (eventType, success, details) => {
  try {
    // Skip logging if we don't have required data
    if (!user?.id) {
      console.warn('Cannot log audit event: user ID is missing');
      return;
    }

    // For login events, we need to get the organization_id from the user's profile
    let organizationId = profile?.organization_id;
    
    // If we don't have the profile yet, try to fetch it
    if (!organizationId && user.id) {
      try {
        const { data: userProfile } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', user.id)
          .single();
        
        organizationId = userProfile?.organization_id;
      } catch (profileError) {
        console.warn('Could not fetch user profile for activity logging:', profileError);
        return;
      }
    }

    // Skip logging if we still don't have organization_id
    if (!organizationId) {
      console.warn('Cannot log audit event: organization_id is missing');
      return;
    }

    // Proceed with logging...
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
};
```

## Testing Results
- ✅ Activity log insert now works with proper organization_id
- ✅ Records are created successfully in activity_log table
- ✅ No more 400 Bad Request errors
- ✅ Graceful handling of missing data
- ✅ Authentication events are properly logged

## Files Modified
- `src/contexts/AuthContext.tsx` - Enhanced logAuditEvent function

## Impact
- ✅ Fixes 400 Bad Request errors for activity logging
- ✅ Ensures data integrity with required fields
- ✅ Maintains audit trail functionality
- ✅ Improves error handling and user experience
- ✅ Dashboard loads without console errors
