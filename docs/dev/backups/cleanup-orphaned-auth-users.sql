-- Cleanup Orphaned Auth Users Script
-- This script removes auth.users records that don't have corresponding records in the users table
-- Created: 2025-09-06
-- Purpose: Sync authentication system with application user data

-- IMPORTANT: This script will DELETE auth users that don't exist in the users table!
-- This affects the Supabase authentication system

BEGIN;

-- Show orphaned auth users before deletion (for verification)
SELECT 'Orphaned auth users to be deleted:' as info;
SELECT au.id, au.email, au.created_at 
FROM auth.users au 
LEFT JOIN users u ON au.id = u.id 
WHERE u.id IS NULL 
ORDER BY au.created_at;

-- Delete orphaned auth users
-- Note: This will cascade delete related auth data (sessions, etc.)
DELETE FROM auth.users 
WHERE id NOT IN (SELECT id FROM users);

-- Show remaining auth users count
SELECT 'Remaining auth users:' as info, COUNT(*) as count FROM auth.users;

-- Show remaining app users count  
SELECT 'Remaining app users:' as info, COUNT(*) as count FROM users;

COMMIT;

-- Verification: Check that auth.users and users tables are now in sync
-- SELECT 
--     (SELECT COUNT(*) FROM auth.users) as auth_users_count,
--     (SELECT COUNT(*) FROM users) as app_users_count,
--     CASE 
--         WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM users) 
--         THEN 'SYNCED' 
--         ELSE 'NOT SYNCED' 
--     END as sync_status;
