-- Migration Script: Restore users data from backup
-- This script restores the users data that was lost during the previous migration
-- Date: 2025-01-27

-- ============================================================================
-- STEP 1: Check if backup table exists and has data
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users_backup') THEN
        RAISE EXCEPTION 'Backup table users_backup does not exist. Cannot restore data.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM users_backup LIMIT 1) THEN
        RAISE EXCEPTION 'Backup table users_backup is empty. Cannot restore data.';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Restore users data from backup
-- ============================================================================
-- First, clear the current users table (it should be empty anyway)
-- Use DELETE instead of TRUNCATE to avoid foreign key constraint issues
DELETE FROM users;

-- Restore all data from backup
INSERT INTO users (
    id,
    organization_id,
    email,
    name,
    role,
    department,
    phone,
    avatar_url,
    status,
    description,
    employee_id,
    direct_manager_id,
    direct_reports,
    last_login_at,
    preferences,
    created_at,
    updated_at
)
SELECT 
    id,
    organization_id,
    email,
    name,
    role,
    department,
    phone,
    avatar_url,
    status,
    description,
    employee_id,
    direct_manager_id,
    direct_reports,
    last_login_at,
    preferences,
    created_at,
    updated_at
FROM users_backup;

-- ============================================================================
-- STEP 3: Verify data restoration
-- ============================================================================
-- Check how many users were restored
SELECT COUNT(*) as restored_users FROM users;

-- Check if CEO user exists
SELECT id, email, role, name FROM users WHERE email = 'ceo@factorypulse.vn';

-- ============================================================================
-- STEP 4: Update the id column to match Supabase auth user IDs
-- ============================================================================
-- This is a simplified approach: we'll update the existing IDs to match auth user IDs
-- based on email matching

-- Update CEO user ID to match auth user ID
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440002'
WHERE email = 'ceo@factorypulse.vn';

-- Update other users based on the auth table mapping
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440003'
WHERE email = 'operations@factorypulse.vn';

UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440004'
WHERE email = 'quality@factorypulse.vn';

UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440005'
WHERE email = 'senior.engineer@factorypulse.vn';

UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440006'
WHERE email = 'mechanical@factorypulse.vn';

UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440007'
WHERE email = 'qa@factorypulse.vn';

UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440008'
WHERE email = 'production@factorypulse.vn';

UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440009'
WHERE email = 'sales@factorypulse.vn';

UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440010'
WHERE email = 'supplier@factorypulse.vn';

UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440011'
WHERE email = 'customer@factorypulse.vn';

UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440012'
WHERE email = 'admin@factorypulse.vn';

UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440013'
WHERE email = 'support@factorypulse.vn';

-- ============================================================================
-- STEP 5: Final verification
-- ============================================================================
-- Check if CEO user now has the correct ID
SELECT id, email, role, name FROM users WHERE email = 'ceo@factorypulse.vn';

-- Count total users
SELECT COUNT(*) as total_users FROM users;

-- Show all users with their new IDs
SELECT id, email, role, name FROM users ORDER BY email;
