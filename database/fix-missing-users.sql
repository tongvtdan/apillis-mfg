-- Fix specific missing users like Dan Tong
-- This will migrate any auth users that weren't caught in the previous migration

-- First, let's see who's missing
SELECT 
    'Missing Users Analysis' as section,
    au.email,
    au.id,
    au.raw_user_meta_data->>'display_name' as display_name,
    au.created_at,
    'Missing from users table' as status
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL
ORDER BY au.created_at;

-- Get organization ID
DO $$
DECLARE
    org_id UUID;
    missing_user RECORD;
    fixed_count INTEGER := 0;
BEGIN
    -- Get organization ID
    SELECT id INTO org_id FROM public.organizations WHERE slug = 'factory-pulse-demo' LIMIT 1;
    
    RAISE NOTICE 'Fixing missing users with organization ID: %', org_id;
    
    -- Fix each missing user
    FOR missing_user IN 
        SELECT 
            au.id,
            au.email,
            au.created_at,
            au.updated_at,
            au.email_confirmed_at,
            COALESCE(
                au.raw_user_meta_data->>'display_name',
                au.raw_user_meta_data->>'full_name', 
                au.raw_user_meta_data->>'name',
                INITCAP(REPLACE(SPLIT_PART(au.email, '@', 1), '.', ' ')),
                au.email
            ) as display_name
        FROM auth.users au
        LEFT JOIN public.users u ON au.id = u.id
        WHERE u.id IS NULL
    LOOP
        -- Insert the missing user
        INSERT INTO public.users (
            id,
            email,
            name,
            role,
            status,
            organization_id,
            created_at,
            updated_at
        ) VALUES (
            missing_user.id,
            missing_user.email,
            missing_user.display_name,
            -- Assign role based on email domain
            CASE 
                WHEN missing_user.email LIKE '%@apillis.com' THEN 'Management'
                WHEN missing_user.email LIKE '%@factoryplus.com' THEN 'Management'
                WHEN missing_user.email LIKE '%@viettech.com.vn' THEN 'Supplier'
                WHEN missing_user.email LIKE '%@autotech.com' THEN 'Customer'
                ELSE 'Customer'
            END,
            CASE 
                WHEN missing_user.email_confirmed_at IS NOT NULL THEN 'active'
                ELSE 'pending'
            END,
            org_id,
            missing_user.created_at,
            COALESCE(missing_user.updated_at, NOW())
        );
        
        fixed_count := fixed_count + 1;
        RAISE NOTICE 'Fixed missing user: % -> % (ID: %)', 
            missing_user.email, 
            missing_user.display_name,
            missing_user.id;
    END LOOP;
    
    RAISE NOTICE 'Fixed % missing users', fixed_count;
END $$;

-- Verify Dan Tong specifically
SELECT 
    'Dan Tong Verification' as check_type,
    au.email,
    au.raw_user_meta_data->>'display_name' as auth_name,
    u.name as db_name,
    u.role,
    u.status,
    CASE 
        WHEN u.id IS NOT NULL THEN '✅ Fixed!'
        ELSE '❌ Still Missing'
    END as fix_status
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.email = 'dantong@apillis.com';

-- Final verification - should show NO missing users
SELECT 
    'Final Check' as section,
    COUNT(*) as missing_users_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ All users migrated successfully!'
        ELSE '❌ Still have ' || COUNT(*) || ' missing users'
    END as result
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

-- Show all users now properly synced
SELECT 
    'All Synced Users' as section,
    u.email,
    u.name,
    u.role,
    u.status,
    '✅ Ready for sign-in' as account_status
FROM public.users u
INNER JOIN auth.users au ON u.id = au.id
ORDER BY u.email;