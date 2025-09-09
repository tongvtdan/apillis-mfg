-- Delete User Script for Factory Pulse
-- Use this script to safely delete a user account

-- IMPORTANT: Replace 'user@example.com' with the actual email you want to delete
-- This script will:
-- 1. Find the user in auth.users
-- 2. Delete from users table (if exists)
-- 3. Delete from auth.users (this removes the account completely)

-- First, verify the user exists
SELECT id, email, created_at
FROM auth.users
WHERE email = 'user@example.com';

-- If the user exists, proceed with deletion
-- Note: This will permanently delete the user account
-- Make sure you have a backup if needed

-- Delete from users table first (to maintain referential integrity)
DELETE FROM users
WHERE id IN (
    SELECT id FROM auth.users
    WHERE email = 'user@example.com'
);

-- Delete from auth.users (this removes the authentication account)
DELETE FROM auth.users
WHERE email = 'user@example.com';

-- Verify deletion
SELECT id, email, created_at
FROM auth.users
WHERE email = 'user@example.com';
