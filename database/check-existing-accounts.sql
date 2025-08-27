-- Check existing accounts in your system
-- Run this to see what accounts you currently have

-- Check Supabase Auth users
SELECT 
    'Auth Users' as table_name,
    COUNT(*) as count
FROM auth.users;

-- List all auth users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data->>'display_name' as display_name
FROM auth.users
ORDER BY created_at DESC;

-- Check users table
SELECT 
    'Users Table' as table_name,
    COUNT(*) as count
FROM public.users;

-- List all users in users table
SELECT 
    id,
    email,
    name,
    role,
    status,
    created_at
FROM public.users
ORDER BY created_at DESC;

-- Check for orphaned accounts (auth users without user records)
SELECT 
    'Orphaned Auth Users' as status,
    au.id,
    au.email,
    au.created_at,
    au.raw_user_meta_data->>'display_name' as display_name
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

-- Check for orphaned user records (user records without auth users)
SELECT 
    'Orphaned User Records' as status,
    u.id,
    u.email,
    u.name,
    u.created_at
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL;