-- Clean up existing problematic auth users (except Dan Tong) and prepare for fresh demo accounts
-- This will remove the auth users that can't sign in, but keep their database records

-- First, let's see what we're working with
SELECT 
    'Current Auth Users (excluding Dan Tong)' as info,
    COUNT(*) as count
FROM auth.users 
WHERE email != 'dantong@apillis.com';

SELECT 
    'Current Database Users (excluding Dan Tong)' as info,
    COUNT(*) as count
FROM public.users 
WHERE email != 'dantong@apillis.com';

-- Show the users that will be affected
SELECT 
    'Users to be cleaned up' as section,
    au.email,
    au.raw_user_meta_data->>'display_name' as display_name,
    u.name as db_name,
    u.role
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.email != 'dantong@apillis.com'
ORDER BY au.email;

-- Optional: Remove problematic auth users (keep Dan Tong)
-- Uncomment the next line if you want to clean up the auth table
-- DELETE FROM auth.users WHERE email != 'dantong@apillis.com';

-- Keep the database user records but update them to be ready for new auth users
UPDATE public.users 
SET 
    status = 'pending',
    updated_at = NOW()
WHERE email != 'dantong@apillis.com';

-- Show what's left
SELECT 
    'After Cleanup' as section,
    'Auth users remaining' as type,
    COUNT(*) as count
FROM auth.users;

SELECT 
    'After Cleanup' as section,
    'Database users ready for new auth' as type,
    COUNT(*) as count
FROM public.users
WHERE status = 'pending';

-- Instructions for next steps
SELECT 
    '📋 NEXT STEPS' as instruction,
    'Create new auth users in Supabase Dashboard with password DemoFP123' as action,
    'The system will automatically link them to existing database records' as note;