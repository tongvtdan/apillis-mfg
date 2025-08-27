-- Debug Factory Pulse Users Creation
-- Run this in Supabase SQL Editor to diagnose login issues

-- 1. Check if users exist in public.users table
SELECT 
    'PUBLIC USERS' as table_name,
    COUNT(*) as total_count
FROM public.users;

SELECT 
    'Factory Pulse Users' as description,
    employee_id,
    name,
    email,
    role,
    department,
    status,
    created_at
FROM public.users 
WHERE email LIKE '%factoryplus.com' 
   OR email LIKE '%viettech.com.vn' 
   OR email LIKE '%autotech.com'
ORDER BY created_at DESC;

-- 2. Check if users exist in auth.users table (authentication)
SELECT 
    'AUTH USERS' as table_name,
    COUNT(*) as total_count
FROM auth.users;

SELECT 
    'Factory Pulse Auth Users' as description,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data->>'full_name' as full_name
FROM auth.users 
WHERE email LIKE '%factoryplus.com' 
   OR email LIKE '%viettech.com.vn' 
   OR email LIKE '%autotech.com'
ORDER BY created_at DESC;

-- 3. Check if there's a mismatch between auth.users and public.users
SELECT 
    'MISSING IN AUTH' as issue,
    u.email,
    u.name
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL
AND (u.email LIKE '%factoryplus.com' 
     OR u.email LIKE '%viettech.com.vn' 
     OR u.email LIKE '%autotech.com');

SELECT 
    'MISSING IN PUBLIC' as issue,
    au.email,
    au.raw_user_meta_data->>'full_name' as full_name
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL
AND (au.email LIKE '%factoryplus.com' 
     OR au.email LIKE '%viettech.com.vn' 
     OR au.email LIKE '%autotech.com');

-- 4. Check organizations
SELECT 
    'ORGANIZATIONS' as table_name,
    id,
    name,
    slug,
    created_at
FROM organizations
WHERE slug = 'factory-pulse';

-- 5. Test password verification (this will show if password hashing worked)
-- Try with one user - this should return true if password is correct
SELECT 
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    -- Test password verification
    encrypted_password = crypt('FactoryPulse2024!', encrypted_password) as password_matches
FROM auth.users 
WHERE email = 'nguyen.huong@factoryplus.com';