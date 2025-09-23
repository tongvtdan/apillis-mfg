# auth-context-fix-202509091530 - Auth Context Organization Reference Fix

## Date & Time
September 9, 2025, 15:30

## Feature/Context
Fixed authentication context to correctly reference existing organization in database

## Problem/Situation
The UI project submission was failing while the test script worked. Investigation revealed that:
- Database has organizations including "Apillis" with slug 'apillis'
- AuthContext fallback profile creation was looking for organization with slug 'factory-pulse-vietnam' which doesn't exist
- This caused users to be created with empty organization_id
- Project creation failed due to foreign key constraint violations

## Solution/Changes
Updated all references in AuthContext from 'factory-pulse-vietnam' to 'apillis' to match the actual organization in the database.

## Technical Details
Modified `src/contexts/AuthContext.tsx`:
1. Line 126: Updated fetchProfile function to look for organization with slug 'apillis'
2. Line 215: Updated fallback profile creation to use organization with slug 'apillis'
3. Line 254: Updated createUserProfile function to use organization with slug 'apillis'
4. Lines 263-264: Updated organization creation to use name 'Apillis', slug 'apillis', and domain 'apillis.com'

## Files Modified
- `src/contexts/AuthContext.tsx`

## Challenges
- Identifying all locations where the incorrect organization slug was referenced
- Ensuring all references were updated consistently
- Verifying that the changes would not break existing functionality

## Results
- AuthContext now correctly finds the existing 'Apillis' organization
- Users will be properly associated with valid organization_id
- UI project submission should now work correctly like the test script
- No breaking changes to existing functionality

## Future Considerations
- Consider adding validation to check if organization exists before attempting to create user profiles
- Add better error handling for cases where expected organizations don't exist
- Document the organization setup process for new deployments