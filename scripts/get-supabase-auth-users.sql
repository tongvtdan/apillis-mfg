-- Helper Script: Get Supabase Auth User IDs
-- Run this in your Supabase SQL editor to get the actual user IDs
-- Date: 2025-01-27

-- ============================================================================
-- Get all auth users with their emails
-- ============================================================================
SELECT 
    id as auth_user_id,
    email,
    created_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users
ORDER BY created_at;

-- ============================================================================
-- Get auth users for specific emails (if you know them)
-- ============================================================================
SELECT 
    id as auth_user_id,
    email,
    created_at
FROM auth.users
WHERE email IN (
    'ceo@factorypulse.vn',
    'operations@factorypulse.vn',
    'quality@factorypulse.vn',
    'procurement@factorypulse.vn',
    'engineering@factorypulse.vn',
    'qa@factorypulse.vn',
    'production@factorypulse.vn',
    'sales@factorypulse.vn',
    'supplier@factorypulse.vn',
    'customer@factorypulse.vn',
    'admin@factorypulse.vn',
    'support@factorypulse.vn'
)
ORDER BY email;

-- ============================================================================
-- Generate INSERT statements for the mapping table
-- ============================================================================
-- Copy the results from the above query and use them to populate the mapping table
-- Format: ('email@example.com', 'auth-user-uuid-here')

-- Example:
-- INSERT INTO email_to_user_id_mapping (email, user_id) VALUES
--     ('ceo@factorypulse.vn', 'actual-auth-user-id-here'),
--     ('operations@factorypulse.vn', 'actual-auth-user-id-here');

-- ============================================================================
-- Check if auth users exist for your application users
-- ============================================================================
-- This will show which application users have corresponding auth users
SELECT 
    u.email as app_user_email,
    u.name as app_user_name,
    CASE 
        WHEN au.id IS NOT NULL THEN 'Has Auth User'
        ELSE 'Missing Auth User'
    END as auth_status,
    au.id as auth_user_id,
    au.created_at as auth_created_at
FROM users u
LEFT JOIN auth.users au ON u.email = au.email
ORDER BY u.email;

-- ============================================================================
-- Count auth users vs application users
-- ============================================================================
SELECT 
    'Auth Users' as user_type,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Application Users' as user_type,
    COUNT(*) as count
FROM users
UNION ALL
SELECT 
    'Matched Users' as user_type,
    COUNT(*) as count
FROM users u
JOIN auth.users au ON u.email = au.email;
