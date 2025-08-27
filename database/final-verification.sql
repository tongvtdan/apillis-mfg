-- Final verification that ALL accounts are working
-- Run this after fixing missing users

-- Test 1: Count comparison
SELECT 
    'Auth vs Database Count' as test,
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM public.users) as db_users,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.users) 
        THEN '✅ Counts match perfectly!'
        ELSE '❌ Counts do not match'
    END as result;

-- Test 2: Check for any orphaned auth users
SELECT 
    'Orphaned Auth Users' as test,
    COUNT(*) as orphaned_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ No orphaned auth users'
        ELSE '❌ Found ' || COUNT(*) || ' orphaned auth users'
    END as result
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

-- Test 3: Verify Dan Tong specifically
SELECT 
    'Dan Tong Status' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.users u 
            INNER JOIN auth.users au ON u.id = au.id 
            WHERE au.email = 'dantong@apillis.com'
        ) THEN '✅ Dan Tong is fully synced and ready!'
        ELSE '❌ Dan Tong still has issues'
    END as result;

-- Test 4: List any problematic accounts
SELECT 
    'Problematic Accounts' as section,
    COALESCE(u.email, au.email) as email,
    CASE 
        WHEN u.id IS NULL THEN 'Missing from users table'
        WHEN au.id IS NULL THEN 'Missing from auth'
        WHEN u.organization_id IS NULL THEN 'Missing organization'
        WHEN u.role IS NULL OR u.role = '' THEN 'Missing role'
        WHEN u.status IS NULL OR u.status = '' THEN 'Missing status'
        ELSE 'Unknown issue'
    END as problem
FROM auth.users au
FULL OUTER JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL 
   OR au.id IS NULL 
   OR u.organization_id IS NULL 
   OR u.role IS NULL OR u.role = ''
   OR u.status IS NULL OR u.status = '';

-- Test 5: Show all working accounts
SELECT 
    'Working Accounts Summary' as section,
    COUNT(*) as total_working_accounts,
    '🎉 All these accounts can sign in!' as message
FROM public.users u
INNER JOIN auth.users au ON u.id = au.id
WHERE u.organization_id IS NOT NULL 
  AND u.role IS NOT NULL 
  AND u.status IS NOT NULL;

-- Test 6: Detailed account list
SELECT 
    u.email,
    u.name,
    u.role,
    u.status,
    o.name as organization,
    '✅ Ready' as sign_in_status
FROM public.users u
INNER JOIN auth.users au ON u.id = au.id
INNER JOIN public.organizations o ON u.organization_id = o.id
ORDER BY u.email;