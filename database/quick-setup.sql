-- Quick Setup for Factory Pulse Demo
-- Run this in your Supabase SQL Editor

-- Check if organization already exists
DO $$
DECLARE
    org_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO org_count FROM public.organizations WHERE slug = 'factory-pulse-demo';
    
    IF org_count = 0 THEN
        -- Create organization
        INSERT INTO public.organizations (id, name, slug, domain, is_active, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'Factory Pulse Demo',
            'factory-pulse-demo',
            'demo.factrypulse.com',
            true,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Organization created successfully';
    ELSE
        RAISE NOTICE 'Organization already exists';
    END IF;
END $$;

-- Create a test user for authentication
DO $$
DECLARE
    user_count INTEGER;
    org_id UUID;
BEGIN
    -- Get organization ID
    SELECT id INTO org_id FROM public.organizations WHERE slug = 'factory-pulse-demo' LIMIT 1;
    
    -- Check if user exists
    SELECT COUNT(*) INTO user_count FROM public.users WHERE email = 'demo@factrypulse.com';
    
    IF user_count = 0 THEN
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
            gen_random_uuid(),
            'demo@factrypulse.com',
            'Demo User',
            'Management',
            'active',
            org_id,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'User created successfully';
    ELSE
        -- Update existing user
        UPDATE public.users 
        SET 
            name = 'Demo User',
            role = 'Management',
            status = 'active',
            organization_id = org_id,
            updated_at = NOW()
        WHERE email = 'demo@factrypulse.com';
        RAISE NOTICE 'User updated successfully';
    END IF;
END $$;

-- Verify the setup
SELECT 
    'Setup Complete!' as status,
    u.name,
    u.email,
    u.role,
    u.status,
    o.name as organization_name
FROM users u
JOIN organizations o ON u.organization_id = o.id
WHERE u.email = 'demo@factrypulse.com';