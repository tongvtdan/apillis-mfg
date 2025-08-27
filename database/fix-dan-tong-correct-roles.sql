-- Fix Dan Tong with correct role values
-- Using the roles from your UserProfile interface

-- First, let's see what roles are currently valid
SELECT 
    'Current Valid Roles' as info,
    DISTINCT role
FROM public.users 
WHERE role IS NOT NULL;

-- Fix Dan Tong and other missing users with correct roles
DO $$
DECLARE
    org_id UUID;
    missing_user RECORD;
    fixed_count INTEGER := 0;
BEGIN
    -- Get organization ID
    SELECT id INTO org_id FROM public.organizations WHERE slug = 'factory-pulse-demo' LIMIT 1;
    
    RAISE NOTICE 'Fixing missing users with organization ID: %', org_id;
    
    -- Fix each missing user with correct role values
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
        -- Insert the missing user with correct role values
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
            -- Use correct role values from your UserProfile interface
            CASE 
                WHEN missing_user.email LIKE '%@apillis.com' THEN 'Management'
                WHEN missing_user.email LIKE '%@factoryplus.com' THEN 'Engineering'
                WHEN missing_user.email LIKE '%@viettech.com.vn' THEN 'Supplier'
                WHEN missing_user.email LIKE '%@autotech.com' THEN 'Customer'
                ELSE 'Customer'
            END,
            -- Use correct status values
            CASE 
                WHEN missing_user.email_confirmed_at IS NOT NULL THEN 'Active'
                ELSE 'Pending'
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
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error occurred: %', SQLERRM;
        RAISE NOTICE 'Trying with different role values...';
        
        -- If the above fails, try with basic role values
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
            -- Try with the most basic valid role
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
                'Customer', -- Safe default
                'Active',   -- Safe default
                org_id,
                missing_user.created_at,
                COALESCE(missing_user.updated_at, NOW())
            );
            
            fixed_count := fixed_count + 1;
            RAISE NOTICE 'Fixed with default role: %', missing_user.email;
        END LOOP;
END $$;

-- Verify Dan Tong is now fixed
SELECT 
    'Dan Tong Final Status' as check_type,
    u.email,
    u.name,
    u.role,
    u.status,
    '✅ Successfully Added!' as result
FROM public.users u
WHERE u.email = 'dantong@apillis.com';