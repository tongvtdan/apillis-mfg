-- Simple script to add Dan Tong with safe default values

-- Get Dan Tong's auth info
SELECT 
    'Dan Tong Auth Info' as info,
    id,
    email,
    raw_user_meta_data->>'display_name' as display_name,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email = 'dantong@apillis.com';

-- Add Dan Tong to users table with safe values
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
    'Cusmanagementtomer', -- Safe default role
    'Active',   -- Safe default status
    (SELECT id FROM public.organizations WHERE slug = 'factory-pulse-demo' LIMIT 1),
    au.created_at,
    NOW()
FROM auth.users au
WHERE au.email = 'dantong@apillis.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.email = 'dantong@apillis.com'
  );

-- Verify Dan Tong was added
SELECT 
    'Verification' as check_type,
    u.email,
    u.name,
    u.role,
    u.status,
    o.name as organization,
    '✅ Ready for sign-in!' as result
FROM public.users u
JOIN public.organizations o ON u.organization_id = o.id
WHERE u.email = 'dantong@apillis.com';