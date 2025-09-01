# Workflow Transition Bug Fix

## Issue Description
When attempting to transition a project between workflow stages, users encountered a 403 Forbidden error with the message:
```
new row violates row-level security policy for table "activity_log"
```

This prevented successful stage transitions and caused a poor user experience.

## Root Cause Analysis
The issue was caused by missing Row Level Security (RLS) policies on the `activity_log` table. While the table had a SELECT policy defined, there was no INSERT policy, which caused all insert operations to be blocked by RLS.

### Error Flow
1. User initiates a workflow stage transition
2. System attempts to record the transition in the `activity_log` table
3. INSERT operation is blocked by RLS due to missing INSERT policy
4. 403 Forbidden error is returned
5. Workflow transition fails

## Solution Implemented

### 1. Database Fix
Created a new migration file `supabase/migrations/20250901180000_add_activity_log_insert_policy.sql` that adds the missing INSERT policy:

```sql
CREATE POLICY "Users can create activity logs" 
ON "public"."activity_log" 
FOR INSERT 
WITH CHECK (
  ("organization_id" = "public"."get_current_user_org_id"()) 
  AND ("user_id" = "auth"."uid"())
);
```

This policy ensures that:
- Users can only insert records for their own organization
- Users can only insert records with their own user ID
- Authenticated users can insert records (subject to the above constraints)

### 2. Frontend Resilience Improvements
Updated error handling in the frontend to make the system more resilient to non-critical failures:

#### StageHistoryService.ts
Modified to log errors but continue with the workflow transition:
```typescript
if (error) {
    console.error('Error recording stage transition:', error);
    // Instead of throwing an error that stops the workflow, we'll log it and continue
    console.warn('Failed to record stage transition in activity log, continuing with transition');
    return;
}
```

#### StageTransitionValidator.tsx
Added proper error handling with user feedback:
```typescript
catch (error) {
    console.error('Error recording stage transition:', error);
    // Show a warning but still proceed with the transition
    toast({
        title: "Warning",
        description: "Could not record transition in activity log, but proceeding with stage change",
        variant: "warning"
    });
    
    // Still proceed with the transition even if history recording fails
    // ...
}
```

#### useStageTransition.ts
Added try/catch block around the history recording:
```typescript
// Record the stage transition in history
try {
    await stageHistoryService.recordStageTransition({
        // ...
    });
} catch (error) {
    console.warn('Failed to record stage transition in activity log:', error);
    // Continue with transition even if logging fails
}
```

### 3. Testing
Created comprehensive tests to verify the fix:
- Test for graceful handling of activity log insertion errors
- Test for successful recording when policies are correct

### 4. Prevention Measures
Added a validation script `scripts/validate-activity-log-policy.js` that can be run to check for proper RLS policies on the activity_log table.

Added to package.json:
```json
"validate:policies": "node scripts/validate-activity-log-policy.js"
```

## Verification
The fix has been verified through:
1. Unit tests that confirm error handling works correctly
2. Manual testing of workflow transitions
3. Verification that activity logs are properly recorded when policies are in place

## Impact
- Workflow transitions now work reliably
- System is more resilient to non-critical database errors
- Users receive appropriate feedback when non-critical errors occur
- Added protection against similar issues in the future

## Rollout Instructions
1. Apply the database migration to add the INSERT policy
2. Deploy the updated frontend code
3. Run the validation script to confirm policies are correctly applied