-- Migration: Fix Local Admin Role Issue
-- This fixes the UUID mismatch between auth.users and custom users table
-- Date: 2025-01-27

-- ============================================================================
-- STEP 1: Add user_id column to users table
-- ============================================================================

-- Add user_id column to link with auth.users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id UUID;

-- ============================================================================
-- STEP 2: Update users table with correct auth user IDs
-- ============================================================================

-- Update users table with the correct auth user IDs by matching emails
UPDATE users 
SET user_id = (
    SELECT id FROM auth.users WHERE email = users.email LIMIT 1
)
WHERE user_id IS NULL;

-- ============================================================================
-- STEP 3: Verify the fix
-- ============================================================================

-- Check the admin user specifically
SELECT 
    'Admin User Status' as info,
    email,
    name,
    role,
    CASE 
        WHEN user_id IS NOT NULL THEN 'LINKED ✅'
        ELSE 'UNLINKED ❌'
    END as status
FROM users 
WHERE email = 'admin@factorypulse.vn';

-- Check all users linking status
SELECT 
    'All Users Status' as info,
    COUNT(*) as total_users,
    COUNT(user_id) as linked_users,
    COUNT(*) - COUNT(user_id) as unlinked_users
FROM users;

-- Show detailed status for all users
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
