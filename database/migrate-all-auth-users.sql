-- Migrate ALL existing auth users to the users table
-- This will handle all the users you see in your Supabase Auth dashboard

-- First, let's see exactly what we're working with
SELECT 
    'Current Auth Users' as info,
    COUNT(*) as total_auth_users
FROM auth.users;

SELECT 
    'Current Database Users' as info,
    COUNT(*) as total_db_users  
FROM public.users;

-- Create organization if it doesn't exist
INSERT INTO public.organizations (id, name, slug, domain, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Factory Pulse',
    'factory-pulse-demo',
    'factrypulse.com',
    true,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Now migrate ALL auth users to the users table
DO $$
DECLARE
    org_id UUID;
    auth_user RECORD;
    migrated_count INTEGER := 0;
    skipped_count INTEGER := 0;
BEGIN
    -- Get organization ID
    SELECT id INTO org_id FROM public.organizations WHERE slug = 'factory-pulse-demo' LIMIT 1;
    
    RAISE NOTICE 'Starting migration of all auth users...';
    RAISE NOTICE 'Organization ID: %', org_id;
    
    -- Loop through ALL auth users
    FOR auth_user IN 
        SELECT 
            au.id,
            au.email,
            au.created_at,
            au.updated_at,
            au.email_confirmed_at,
            -- Extract display name from metadata or use email prefix
            COALESCE(
                au.raw_user_meta_data->>'display_name',
                au.raw_user_meta_data->>'full_name', 
                au.raw_user_meta_data->>'name',
                INITCAP(REPLACE(SPLIT_PART(au.email, '@', 1), '.', ' ')),
                au.email
            ) as display_name
        FROM auth.users au
        ORDER BY au.created_at
    LOOP
        -- Check if user already exists in users table
        IF EXISTS (SELECT 1 FROM public.users WHERE id = auth_user.id) THEN
            RAISE NOTICE 'User already exists, skipping: % (ID: %)', auth_user.email, auth_user.id;
            skipped_count := skipped_count + 1;
        ELSE
            -- Insert new user record
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
                auth_user.id,
                auth_user.email,
                auth_user.display_name,
                -- Assign roles based on email domain or default to Customer
                CASE 
                    WHEN auth_user.email LIKE '%@factoryplus.com' THEN 'Management'
                    WHEN auth_user.email LIKE '%@viettech.com.vn' THEN 'Supplier'
                    WHEN auth_user.email LIKE '%@autotech.com' THEN 'Customer'
                    ELSE 'Customer'
                END,
                CASE 
                    WHEN auth_user.email_confirmed_at IS NOT NULL THEN 'active'
                    ELSE 'pending'
                END,
                org_id,
                auth_user.created_at,
                COALESCE(auth_user.updated_at, NOW())
            );
            
            migrated_count := migrated_count + 1;
            RAISE NOTICE 'Migrated: % -> % (Role: %)', 
                auth_user.email, 
                auth_user.display_name,
                CASE 
                    WHEN auth_user.email LIKE '%@factoryplus.com' THEN 'Management'
                    WHEN auth_user.email LIKE '%@viettech.com.vn' THEN 'Supplier'
                    WHEN auth_user.email LIKE '%@autotech.com' THEN 'Customer'
                    ELSE 'Customer'
                END;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Migration completed!';
    RAISE NOTICE 'Migrated: % users', migrated_count;
    RAISE NOTICE 'Skipped (already existed): % users', skipped_count;
    
END $$;

-- Verify the migration results
SELECT 
    'Migration Results' as section,
    'Total Auth Users' as metric,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Migration Results',
    'Total Database Users',
    COUNT(*)
FROM public.users
UNION ALL
SELECT 
    'Migration Results',
    'Successfully Synced',
    COUNT(*)
FROM public.users u
INNER JOIN auth.users au ON u.id = au.id;

-- Show all migrated users with their details
SELECT 
    u.email,
    u.name as display_name,
    u.role,
    u.status,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
        ELSE '⏳ Pending'
    END as email_status,
    u.created_at::date as joined_date
FROM public.users u
INNER JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- Final summary
SELECT 
    '🎉 MIGRATION COMPLETE!' as message,
    COUNT(*) || ' users are now ready to sign in' as result
FROM public.users u
INNER JOIN auth.users au ON u.id = au.id;