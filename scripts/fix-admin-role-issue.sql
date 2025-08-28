-- Fix Admin Role Issue - SQL Script
-- This script fixes the mismatch between auth.users and custom users table
-- Run this in your Supabase SQL Editor
-- Date: 2025-01-27

-- ============================================================================
-- STEP 1: Check current state
-- ============================================================================

-- Check what's in the auth.users table
SELECT 'Auth Users' as table_name, COUNT(*) as count FROM auth.users;

-- Check what's in the custom users table
SELECT 'Custom Users' as table_name, COUNT(*) as count FROM users;

-- Check the admin user specifically
SELECT 
    'admin@factorypulse.vn' as email,
    'auth.users' as source,
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'admin@factorypulse.vn'

UNION ALL

SELECT 
    'admin@factorypulse.vn' as email,
    'custom users' as source,
    id,
    email,
    created_at
FROM users 
WHERE email = 'admin@factorypulse.vn';

-- ============================================================================
-- STEP 2: Add user_id column to users table if it doesn't exist
-- ============================================================================

-- Add user_id column to link with auth.users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id UUID;

-- ============================================================================
-- STEP 3: Create mapping and update users table
-- ============================================================================

-- Update the admin user to link with the correct auth user
-- Replace 'AUTH_USER_ID_HERE' with the actual auth user ID from step 1
UPDATE users 
SET user_id = (
    SELECT id FROM auth.users WHERE email = 'admin@factorypulse.vn' LIMIT 1
)
WHERE email = 'admin@factorypulse.vn';

-- Update all other users as well
UPDATE users 
SET user_id = (
    SELECT id FROM auth.users WHERE email = users.email LIMIT 1
)
WHERE user_id IS NULL AND email IN (
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
    'support@factorypulse.vn'
);

-- ============================================================================
-- STEP 4: Verify the fix
-- ============================================================================

-- Check if admin user is now properly linked
SELECT 
    u.email,
    u.name,
    u.role,
    u.user_id,
    CASE 
        WHEN u.user_id IS NOT NULL THEN 'LINKED ✅'
        ELSE 'UNLINKED ❌'
    END as status
FROM users u
WHERE u.email = 'admin@factorypulse.vn';

-- Check all users linking status
SELECT 
    email,
    name,
    role,
    CASE 
        WHEN user_id IS NOT NULL THEN 'LINKED ✅'
        ELSE 'UNLINKED ❌'
    END as status
FROM users
ORDER BY email;

-- ============================================================================
-- STEP 5: Test the authentication flow
-- ============================================================================

-- This will show what the application should see when querying by email
SELECT 
    'Test Query Result' as test,
    u.email,
    u.name,
    u.role,
    u.status
FROM users u
WHERE u.email = 'admin@factorypulse.vn';

-- ============================================================================
-- STEP 6: If you need to manually create auth users
-- ============================================================================

-- If auth users are missing, you can create them manually
-- (This requires admin privileges and should be done carefully)

-- Example for admin user (replace with actual values):
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--     gen_random_uuid(),
--     'admin@factorypulse.vn',
--     crypt('Password123!', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW()
-- );

-- ============================================================================
-- STEP 7: Clean up and final verification
-- ============================================================================

-- Show final status
SELECT 
    'FINAL STATUS' as info,
    COUNT(*) as total_users,
    COUNT(user_id) as linked_users,
    COUNT(*) - COUNT(user_id) as unlinked_users
FROM users;

-- If all users are linked, you can make user_id NOT NULL
-- ALTER TABLE users ALTER COLUMN user_id SET NOT NULL;
