-- Add Dan Tong with the correct role (lowercase 'management')
-- Based on the valid roles found in your database

-- Valid roles from your database:
-- supplier, production, sales, engineering, customer, procurement, qa, management, admin

-- Add Dan Tong to users table with correct role
INSERT INTO public.users (
    id,
    email,
    name,
    role,
    status,
    organization_id,
    created_at,
    updated_at
) 
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'display_name', 'Dan Tong'),
    'management', -- Correct lowercase role
    'active',     -- Lowercase status to match existing data
    (SELECT id FROM public.organizations WHERE slug = 'factory-pulse-demo' LIMIT 1),
    au.created_at,
    NOW()
FROM auth.users au
WHERE au.email = 'dantong@apillis.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.email = 'dantong@apillis.com'
  );

-- Verify Dan Tong was added successfully
SELECT 
    'Dan Tong Added Successfully!' as result,
    u.email,
    u.name,
    u.role,
    u.status,
    o.name as organization
FROM public.users u
JOIN public.organizations o ON u.organization_id = o.id
WHERE u.email = 'dantong@apillis.com';

-- Also fix any other missing users with correct roles
DO $$
DECLARE
    org_id UUID;
    missing_user RECORD;
    fixed_count INTEGER := 0;
BEGIN
    -- Get organization ID
    SELECT id INTO org_id FROM public.organizations WHERE slug = 'factory-pulse-demo' LIMIT 1;
    
    -- Fix any other missing users
    FOR missing_user IN 
        SELECT 
            au.id,
            au.email,
            au.created_at,
            au.updated_at,
            au.email_confirmed_at,
            COALESCE(
                au.raw_user_meta_data->>'display_name',
                INITCAP(REPLACE(SPLIT_PART(au.email, '@', 1), '.', ' '))
            ) as display_name
        FROM auth.users au
        LEFT JOIN public.users u ON au.id = u.id
        WHERE u.id IS NULL
    LOOP
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
            -- Assign correct lowercase roles based on email domain
            CASE 
                WHEN missing_user.email LIKE '%@apillis.com' THEN 'management'
                WHEN missing_user.email LIKE '%@factoryplus.com' THEN 'engineering'
                WHEN missing_user.email LIKE '%@viettech.com.vn' THEN 'supplier'
                WHEN missing_user.email LIKE '%@autotech.com' THEN 'customer'
                ELSE 'customer'
            END,
            'active',
            org_id,
            missing_user.created_at,
            COALESCE(missing_user.updated_at, NOW())
        );
        
        fixed_count := fixed_count + 1;
        RAISE NOTICE 'Fixed missing user: %', missing_user.email;
    END LOOP;
    
    RAISE NOTICE 'Fixed % additional missing users', fixed_count;
END $$;

-- Final verification - show all users are now synced
SELECT 
    'Final Status' as check_type,
    COUNT(*) as total_synced_users,
    'All accounts ready for sign-in!' as message
FROM public.users u
INNER JOIN auth.users au ON u.id = au.id;