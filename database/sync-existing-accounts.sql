-- Sync existing accounts with the new system
-- This will create user records for existing auth users and vice versa

-- First, ensure we have the default organization
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

-- Get the organization ID for use in the migration
DO $$
DECLARE
    org_id UUID;
    auth_user RECORD;
    user_count INTEGER;
BEGIN
    -- Get organization ID
    SELECT id INTO org_id FROM public.organizations WHERE slug = 'factory-pulse-demo' LIMIT 1;
    
    RAISE NOTICE 'Using organization ID: %', org_id;
    
    -- Create user records for existing auth users that don't have them
    FOR auth_user IN 
        SELECT 
            au.id,
            au.email,
            au.created_at,
            COALESCE(au.raw_user_meta_data->>'display_name', au.email) as display_name
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
            auth_user.id,
            auth_user.email,
            auth_user.display_name,
            'Customer', -- Default role for migrated users
            'active',
            org_id,
            auth_user.created_at,
            NOW()
        );
        
        RAISE NOTICE 'Created user record for: %', auth_user.email;
    END LOOP;
    
    -- Count how many users we now have
    SELECT COUNT(*) INTO user_count FROM public.users;
    RAISE NOTICE 'Total users after migration: %', user_count;
    
END $$;

-- Verify the migration
SELECT 
    'Migration Complete' as status,
    COUNT(*) as total_users
FROM public.users;

-- Show all synced accounts
SELECT 
    u.email,
    u.name,
    u.role,
    u.status,
    CASE 
        WHEN au.id IS NOT NULL THEN 'Synced'
        ELSE 'Missing Auth'
    END as auth_status,
    u.created_at
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;