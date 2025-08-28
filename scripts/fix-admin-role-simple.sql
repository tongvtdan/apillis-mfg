-- Simple Fix for Admin Role Issue
-- Run this in your Supabase SQL Editor
-- This script will update your admin user to have the correct role

-- ============================================================================
-- STEP 1: Check current admin user status
-- ============================================================================

-- Check what role the admin user currently has
SELECT 
    email,
    name,
    role,
    status,
    user_id,
    organization_id
FROM users 
WHERE email = 'admin@factorypulse.vn';

-- ============================================================================
-- STEP 2: Update admin user role to 'admin'
-- ============================================================================

-- Update the admin user to have the 'admin' role
UPDATE users 
SET 
    role = 'admin',
    updated_at = NOW()
WHERE email = 'admin@factorypulse.vn';

-- ============================================================================
-- STEP 3: Verify the fix
-- ============================================================================

-- Check if the role was updated successfully
SELECT 
    email,
    name,
    role,
    status,
    user_id,
    organization_id,
    updated_at
FROM users 
WHERE email = 'admin@factorypulse.vn';

-- ============================================================================
-- STEP 4: Check all users with admin or management roles
-- ============================================================================

-- Show all users who should see the Admin tab
SELECT 
    email,
    name,
    role,
    status,
    CASE 
        WHEN role IN ('admin', 'management') THEN 'CAN SEE ADMIN TAB ✅'
        ELSE 'CANNOT SEE ADMIN TAB ❌'
    END as admin_access
FROM users 
WHERE role IN ('admin', 'management')
ORDER BY role, email;

-- ============================================================================
-- STEP 5: If no admin user exists, create one
-- ============================================================================

-- Only run this if no admin user exists
-- First, check if we need to create an admin user
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@factorypulse.vn') THEN
        -- Get the default organization
        INSERT INTO users (
            organization_id,
            email,
            name,
            role,
            status,
            created_at,
            updated_at
        )
        SELECT 
            o.id,
            'admin@factorypulse.vn',
            'System Administrator',
            'admin',
            'active',
            NOW(),
            NOW()
        FROM organizations o
        WHERE o.slug = 'factory-pulse-vietnam'
        LIMIT 1;
        
        RAISE NOTICE 'Admin user created successfully';
    ELSE
        RAISE NOTICE 'Admin user already exists';
    END IF;
END $$;
