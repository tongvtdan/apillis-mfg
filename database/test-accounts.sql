-- Test existing accounts to make sure they work
-- Run this after the sync to verify everything is working

-- Test 1: Check if all auth users have corresponding database records
SELECT 
    'Test 1: Auth-DB Sync' as test_name,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS - All auth users have database records'
        ELSE '❌ FAIL - ' || COUNT(*) || ' auth users missing database records'
    END as result
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

-- Test 2: Check if all database users have valid organizations
SELECT 
    'Test 2: Organization Links' as test_name,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS - All users have valid organizations'
        ELSE '❌ FAIL - ' || COUNT(*) || ' users missing organization'
    END as result
FROM public.users u
LEFT JOIN public.organizations o ON u.organization_id = o.id
WHERE o.id IS NULL;

-- Test 3: Check for users with missing required fields
SELECT 
    'Test 3: Required Fields' as test_name,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS - All users have required fields'
        ELSE '❌ FAIL - ' || COUNT(*) || ' users missing required fields'
    END as result
FROM public.users
WHERE email IS NULL OR email = '' 
   OR name IS NULL OR name = ''
   OR role IS NULL OR role = ''
   OR status IS NULL OR status = '';

-- Test 4: List all working accounts
SELECT 
    'Working Accounts' as section,
    u.email,
    u.name,
    u.role,
    u.status,
    o.name as organization,
    '✅ Ready to use' as account_status
FROM public.users u
JOIN public.organizations o ON u.organization_id = o.id
JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- Summary
SELECT 
    'SUMMARY' as section,
    COUNT(DISTINCT u.id) as total_working_accounts,
    COUNT(DISTINCT o.id) as organizations,
    'All accounts should now work with sign-in!' as message
FROM public.users u
JOIN public.organizations o ON u.organization_id = o.id
JOIN auth.users au ON u.id = au.id;