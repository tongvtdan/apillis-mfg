-- Complete account recovery and sync script
-- This handles all possible scenarios for existing accounts

-- Step 1: Ensure organization exists
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

-- Step 2: Set up RLS policies (run production setup first)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view users" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 3: Sync all accounts
DO $$
DECLARE
    org_id UUID;
    auth_user RECORD;
    db_user RECORD;
    synced_count INTEGER := 0;
BEGIN
    -- Get organization ID
    SELECT id INTO org_id FROM public.organizations WHERE slug = 'factory-pulse-demo' LIMIT 1;
    
    RAISE NOTICE 'Starting account sync with organization: %', org_id;
    
    -- Scenario 1: Auth users without database records
    RAISE NOTICE 'Syncing auth users to database...';
    FOR auth_user IN 
        SELECT 
            au.id,
            au.email,
            au.created_at,
            au.updated_at,
            COALESCE(au.raw_user_meta_data->>'display_name', 
                     SPLIT_PART(au.email, '@', 1)) as display_name
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
            'Customer',
            'active',
            org_id,
            auth_user.created_at,
            COALESCE(auth_user.updated_at, NOW())
        ) ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            organization_id = EXCLUDED.organization_id,
            updated_at = NOW();
        
        synced_count := synced_count + 1;
        RAISE NOTICE 'Synced auth user: % (ID: %)', auth_user.email, auth_user.id;
    END LOOP;
    
    -- Scenario 2: Database users without proper organization
    RAISE NOTICE 'Updating users without organization...';
    UPDATE public.users 
    SET organization_id = org_id, updated_at = NOW()
    WHERE organization_id IS NULL;
    
    -- Scenario 3: Update any users with missing or invalid data
    RAISE NOTICE 'Cleaning up user data...';
    UPDATE public.users 
    SET 
        name = COALESCE(NULLIF(name, ''), SPLIT_PART(email, '@', 1)),
        role = COALESCE(NULLIF(role, ''), 'Customer'),
        status = COALESCE(NULLIF(status, ''), 'active'),
        updated_at = NOW()
    WHERE name IS NULL OR name = '' OR role IS NULL OR role = '' OR status IS NULL OR status = '';
    
    RAISE NOTICE 'Account sync completed. Synced % accounts.', synced_count;
END $$;

-- Step 4: Verify everything is working
SELECT 
    'Final Status' as check_type,
    'Auth Users' as category,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Final Status',
    'Database Users',
    COUNT(*)
FROM public.users
UNION ALL
SELECT 
    'Final Status',
    'Properly Synced',
    COUNT(*)
FROM public.users u
INNER JOIN auth.users au ON u.id = au.id
UNION ALL
SELECT 
    'Final Status',
    'Organizations',
    COUNT(*)
FROM public.organizations;

-- Show all accounts with their sync status
SELECT 
    COALESCE(u.email, au.email) as email,
    COALESCE(u.name, au.raw_user_meta_data->>'display_name', 'No Name') as name,
    u.role,
    u.status,
    CASE 
        WHEN u.id IS NOT NULL AND au.id IS NOT NULL THEN '✅ Fully Synced'
        WHEN u.id IS NOT NULL AND au.id IS NULL THEN '⚠️ DB Only'
        WHEN u.id IS NULL AND au.id IS NOT NULL THEN '⚠️ Auth Only'
        ELSE '❌ Error'
    END as sync_status,
    COALESCE(u.created_at, au.created_at) as created_at
FROM public.users u
FULL OUTER JOIN auth.users au ON u.id = au.id
ORDER BY created_at DESC;

RAISE NOTICE 'Account recovery completed! All existing accounts should now work with the new system.';