# Admin Role Display Issue - Fix Guide

## Issue Description

The `admin@factorypulse.vn` user is showing as "customer" role instead of "admin" role in the application, even though the database correctly shows the admin role.

## Root Cause

**UUID Mismatch**: There's a mismatch between the `auth.users` table (Supabase authentication) and the custom `users` table (application data). When users sign up, Supabase generates new UUIDs, but the custom users table has predefined UUIDs.

## Symptoms

- ✅ Database shows: `admin@factorypulse.vn` with role `admin`
- ❌ Application displays: User as `customer` role
- 📝 Console logs show: "No user data found in database for email: admin@factorypulse.vn"

## Quick Fix (Immediate Resolution)

### Step 1: Run the Quick Fix SQL Script

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `scripts/fix-admin-role-issue.sql`
4. Run the script

This script will:
- Add a `user_id` column to link with auth users
- Update all users to link with their corresponding auth users
- Verify the fix was applied

### Step 2: Test the Fix

1. Sign out completely from the application
2. Sign back in with:
   - **Email**: `admin@factorypulse.vn`
   - **Password**: `Password123!`
3. Verify the user now shows as "admin" role

## Diagnostic Tools

### Run the Diagnosis Script

If you need to investigate further:

```bash
# Set environment variables
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run diagnosis
node scripts/diagnose-auth-issue.js
```

This will show you:
- What's in the auth.users table
- What's in the custom users table
- Any mismatches between the two
- Specific status of admin@factorypulse.vn

## Long-term Solution

### Apply the Full Migration

For a complete fix that prevents future issues:

1. Run the migration: `supabase/migrations/20250127000007_fix_auth_user_mapping.sql`
2. This creates proper user linking and RLS policies
3. Ensures new users are automatically created with proper mapping

## Technical Details

### How the Fix Works

1. **User ID Linking**: Creates a `user_id` field that links custom users with auth users
2. **Email Fallback**: Maintains email-based lookup as fallback
3. **Automatic Creation**: New users get profiles created automatically
4. **Proper Security**: RLS policies ensure users can only access their own data

### Database Schema Changes

```sql
-- Add user_id column to link with auth.users
ALTER TABLE users ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update existing users to link with auth users
UPDATE users 
SET user_id = (SELECT id FROM auth.users WHERE email = users.email LIMIT 1)
WHERE user_id IS NULL;
```

## Verification

After applying the fix, you should see:

```sql
-- Check admin user status
SELECT 
    email,
    name,
    role,
    CASE 
        WHEN user_id IS NOT NULL THEN 'LINKED ✅'
        ELSE 'UNLINKED ❌'
    END as status
FROM users 
WHERE email = 'admin@factorypulse.vn';
```

Expected result:
```
| email                 | name       | role  | status   |
| --------------------- | ---------- | ----- | -------- |
| admin@factorypulse.vn | Lê Văn Sơn | admin | LINKED ✅ |
```

## Troubleshooting

### If the fix doesn't work:

1. **Check auth users exist**: Verify admin@factorypulse.vn exists in auth.users
2. **Check custom users exist**: Verify admin@factorypulse.vn exists in users table
3. **Check linking**: Verify user_id field is populated
4. **Check RLS policies**: Ensure proper access policies are in place

### Common Issues:

- **Auth user missing**: Run `supabase db reset` to recreate auth users
- **Custom user missing**: Run `supabase db reset` to recreate custom users
- **Permission denied**: Check RLS policies and user authentication status

## Prevention

To prevent this issue in the future:

1. **Always use migrations**: Don't manually modify database schema
2. **Test authentication flow**: Verify user roles display correctly after changes
3. **Monitor console logs**: Watch for authentication errors during development
4. **Use proper user linking**: Maintain consistent user ID mapping between auth and application data

## Support

If you continue to experience issues:

1. Run the diagnostic script to identify the problem
2. Check the console logs for specific error messages
3. Verify database state matches expected schema
4. Test with a fresh database reset if necessary

---

**Last Updated**: 2025-01-27  
**Status**: ✅ Fix implemented and documented
