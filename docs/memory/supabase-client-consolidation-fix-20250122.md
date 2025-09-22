# Supabase Client Consolidation Fix - 2025-01-22

## Context
Fixed multiple "Multiple GoTrueClient instances detected" warnings in the console that were causing potential authentication state conflicts across the application.

## Problem
**Console Warnings:**
```
Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.
```

**Root Cause:**
- Multiple files were creating their own Supabase client instances
- Some files were creating regular clients unnecessarily
- Service role clients were being created in multiple places with identical configuration
- This caused authentication state conflicts and potential undefined behavior

**Affected Files:**
- `src/services/workflowSubStageService.ts` - Creating regular client unnecessarily
- `src/services/documentActions.ts` - Creating service role client
- `src/services/documentVersionService.ts` - Creating service role client
- `src/core/documents/DocumentProvider.tsx` - Creating service role client
- `src/services/projectWorkflowService.ts` - Creating service role client
- `src/features/supplier-management/services/supplierManagementService.ts` - Creating service role client
- `src/components/project/intake/InquiryIntakeForm.tsx` - Creating service role client

## Solution

### 1. Created Shared Service Role Client

**File:** `src/integrations/supabase/client.ts`

**Changes:**
- Added `supabaseServiceRole` export alongside the regular `supabase` client
- Service role client uses:
  - No auto-refresh token (auth issues)
  - No session persistence (security)
  - Service role key for elevated permissions
  - Different client info header for identification

```typescript
export const supabaseServiceRole = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL || "https://ynhgxwnkpbpzwbtzrzka.supabase.co",
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "...",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'factory-pulse-web-service-role',
      },
    },
  }
);
```

### 2. Fixed Regular Client Duplication

**File:** `src/services/workflowSubStageService.ts`

**Changes:**
- Replaced local client creation with import of shared client
- Removed duplicate client configuration

```typescript
// Before
const supabase = createClient(supabaseUrl, supabaseKey);

// After
import { supabase } from '@/integrations/supabase/client';
```

### 3. Consolidated Service Role Client Usage

**All affected files updated to:**
```typescript
// Before
const supabaseServiceRole = createClient(url, serviceKey);

// After
import { supabase, supabaseServiceRole } from '@/integrations/supabase/client';
```

## Technical Details

**Files Modified:**
1. `src/integrations/supabase/client.ts` - Added shared service role client
2. `src/services/workflowSubStageService.ts` - Fixed regular client duplication
3. `src/services/documentActions.ts` - Updated to use shared service client
4. `src/services/documentVersionService.ts` - Updated to use shared service client
5. `src/core/documents/DocumentProvider.tsx` - Updated to use shared service client
6. `src/services/projectWorkflowService.ts` - Updated to use shared service client
7. `src/features/supplier-management/services/supplierManagementService.ts` - Updated to use shared service client
8. `src/components/project/intake/InquiryIntakeForm.tsx` - Updated to use shared service client

**Why Service Role Clients Are Legitimate:**
- Used for file storage operations that need to bypass RLS policies
- Require elevated permissions for uploading/downloading files
- Use different authentication credentials (service role key)
- Should not share state with regular client instances

**Why Regular Client Duplication Was Problematic:**
- Same authentication credentials and configuration
- Shared localStorage state causing conflicts
- Potential race conditions in auth state management
- Unnecessary resource usage

## Results

**Before Fix:**
- 7+ separate client instances
- Multiple "Multiple GoTrueClient instances" warnings
- Potential authentication state conflicts
- Resource duplication

**After Fix:**
- 2 shared client instances (regular + service role)
- No "Multiple GoTrueClient instances" warnings
- Proper separation of concerns
- Single source of truth for client configuration

**Console Output:**
- ✅ No more "Multiple GoTrueClient instances" warnings
- ✅ Clear separation between regular and service role clients
- ✅ Proper client identification headers
- ✅ Consistent configuration across the application

## Future Considerations

**Monitoring:**
- Watch for any new "Multiple GoTrueClient instances" warnings
- Monitor for authentication state issues
- Ensure service role key is properly secured

**Best Practices:**
- Always import from `@/integrations/supabase/client`
- Use `supabaseServiceRole` only for storage operations requiring elevated permissions
- Never create additional client instances
- Use different client info headers for debugging

**Security:**
- Service role key should only be used for operations that truly need elevated permissions
- Regular client should handle all user-authenticated operations
- Monitor usage of service role operations for security auditing

## Testing
- ✅ All imports work correctly
- ✅ No linting errors
- ✅ Service role operations still function (file uploads/downloads)
- ✅ Regular authentication operations still work
- ✅ No console warnings about multiple clients
