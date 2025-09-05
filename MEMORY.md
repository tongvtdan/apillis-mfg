# Factory Pulse - Development Memory

## Recent Changes

## Check current date to add 

### [done] 2025-09-05 - Projects Page Loading Issue Debug and Fix ✅
**Problem**: Projects page showed 0 active projects while dashboard summary worked correctly
**Root Cause**: AuthContext fallback profile creation was setting `organization_id: ''` (empty string) when user profile wasn't found in database
**Solution**: 
- ✅ Fixed AuthContext fallback profile to fetch default organization_id from database
- ✅ Added fallback logic to useProjects hook similar to dashboard function
- ✅ Enhanced error logging for better debugging
- ✅ Verified database contains 20 active projects with correct organization_id

**Technical Details**:
- Dashboard function uses `SECURITY DEFINER` with fallback logic to get first organization
- useProjects hook was failing because `profile.organization_id` was empty string
- Database contains projects with `organization_id: '550e8400-e29b-41d4-a716-446655440001'`
- All users have correct organization_id pointing to Factory Pulse Vietnam

**Files Modified**:
- `src/contexts/AuthContext.tsx` - Fixed fallback profile organization_id
- `src/hooks/useProjects.ts` - Added fallback logic, better error handling, and fixed query joins

**Additional Fix**: Removed non-existent `project_contact_points` table join from query that was causing database errors

**Result**: Projects page now loads correctly and shows all active projects

