-- Delete all accounts except dantong@apillis.com
-- This will clean up both auth users and database users

-- First, let's see what we're about to delete
SELECT 
    'Accounts to be DELETED' as warning,
    COUNT(*) as total_accounts_to_delete
FROM auth.users 
WHERE email != 'dantong@apillis.com';

-- Show the specific accounts that will be deleted
SELECT 
    'WILL BE DELETED' as status,
    au.email,
    au.raw_user_meta_data->>'display_name' as display_name,
    u.name as db_name,
    u.role
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.email != 'dantong@apillis.com'
ORDER BY au.email;

-- Show what will remain (Dan Tong only)
SELECT 
    'WILL REMAIN' as status,
    au.email,
    au.raw_user_meta_data->>'display_name' as display_name,
    u.name as db_name,
    u.role
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.email = 'dantong@apillis.com';

-- Delete database users first (except Dan Tong)
DELETE FROM public.users 
WHERE email != 'dantong@apillis.com';

-- Delete auth users (except Dan Tong)
DELETE FROM auth.users 
WHERE email != 'dantong@apillis.com';

-- Verify deletion
SELECT 
    'DELETION COMPLETE' as status,
    'Auth users remaining' as type,
    COUNT(*) as count
FROM auth.users;

SELECT 
    'DELETION COMPLETE' as status,
    'Database users remaining' as type,
    COUNT(*) as count
FROM public.users;

-- Show final remaining accounts
SELECT 
    'FINAL REMAINING ACCOUNTS' as section,
    au.email,
    au.raw_user_meta_data->>'display_name' as auth_name,
    u.name as db_name,
    u.role,
    u.status,
    '✅ Safe and ready' as account_status
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
ORDER BY au.email;

-- Success message
SELECT 
    '🎉 CLEANUP COMPLETE!' as message,
    'Only Dan Tong account remains' as result,
    'You can now create fresh demo accounts' as next_step;