-- Migration Script: Convert users table to use user_id from Supabase auth
-- This script should be run step by step in your database
-- Date: 2025-01-27

-- ============================================================================
-- STEP 1: Backup current data (IMPORTANT - Run this first!)
-- ============================================================================
-- Create a backup of the current users table
CREATE TABLE users_backup AS SELECT * FROM users;

-- ============================================================================
-- STEP 2: Add user_id column
-- ============================================================================
-- Add user_id column to users table
ALTER TABLE users ADD COLUMN user_id UUID;

-- ============================================================================
-- STEP 3: Create mapping table for email to user_id
-- ============================================================================
-- This table will store the mapping between emails and actual Supabase auth user IDs
CREATE TABLE email_to_user_id_mapping (
    email VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: Populate mapping table with actual Supabase auth user IDs
-- ============================================================================
-- IMPORTANT: Replace these UUIDs with actual Supabase auth user IDs
-- You can get these by running: SELECT id, email FROM auth.users;
-- in your Supabase dashboard or via SQL

INSERT INTO email_to_user_id_mapping (email, user_id) VALUES
    ('ceo@factorypulse.vn', 'REPLACE_WITH_ACTUAL_SUPABASE_AUTH_USER_ID'),
    ('operations@factorypulse.vn', 'REPLACE_WITH_ACTUAL_SUPABASE_AUTH_USER_ID'),
    ('quality@factorypulse.vn', 'REPLACE_WITH_ACTUAL_SUPABASE_AUTH_USER_ID'),
    ('procurement@factorypulse.vn', 'REPLACE_WITH_ACTUAL_SUPABASE_AUTH_USER_ID'),
    ('engineering@factorypulse.vn', 'REPLACE_WITH_ACTUAL_SUPABASE_AUTH_USER_ID'),
    ('qa@factorypulse.vn', 'REPLACE_WITH_ACTUAL_SUPABASE_AUTH_USER_ID'),
    ('production@factorypulse.vn', 'REPLACE_WITH_ACTUAL_SUPABASE_AUTH_USER_ID'),
    ('sales@factorypulse.vn', 'REPLACE_WITH_ACTUAL_SUPABASE_AUTH_USER_ID'),
    ('supplier@factorypulse.vn', 'REPLACE_WITH_ACTUAL_SUPABASE_AUTH_USER_ID'),
    ('customer@factorypulse.vn', 'REPLACE_WITH_ACTUAL_SUPABASE_AUTH_USER_ID'),
    ('admin@factorypulse.vn', 'REPLACE_WITH_ACTUAL_SUPABASE_AUTH_USER_ID'),
    ('support@factorypulse.vn', 'REPLACE_WITH_ACTUAL_SUPABASE_AUTH_USER_ID');

-- ============================================================================
-- STEP 5: Update user_id column with mapped values
-- ============================================================================
UPDATE users 
SET user_id = mapping.user_id
FROM email_to_user_id_mapping mapping
WHERE users.email = mapping.email;

-- ============================================================================
-- STEP 6: Verify all users have been mapped
-- ============================================================================
-- Check if any users don't have a user_id
SELECT email, name, user_id 
FROM users 
WHERE user_id IS NULL;

-- If any users are missing user_id, you need to add them to the mapping table
-- and run the UPDATE again

-- ============================================================================
-- STEP 7: Make user_id NOT NULL and add constraints
-- ============================================================================
-- Only proceed if all users have been mapped
ALTER TABLE users ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_user_id_unique UNIQUE (user_id);

-- ============================================================================
-- STEP 8: Handle foreign key references
-- ============================================================================
-- Update direct_manager_id references
UPDATE users 
SET direct_manager_id = mapping.user_id
FROM email_to_user_id_mapping mapping
WHERE users.direct_manager_id = mapping.user_id;

-- Note: direct_reports array will need application-level handling
-- as PostgreSQL arrays don't support direct updates in this way

-- ============================================================================
-- STEP 9: Drop old id column and rename user_id to id
-- ============================================================================
-- Drop the primary key constraint
ALTER TABLE users DROP CONSTRAINT users_pkey;

-- Drop the old id column
ALTER TABLE users DROP COLUMN id;

-- Rename user_id to id
ALTER TABLE users RENAME COLUMN user_id TO id;

-- Add primary key constraint
ALTER TABLE users ADD PRIMARY KEY (id);

-- ============================================================================
-- STEP 10: Update indexes and constraints
-- ============================================================================
-- Drop and recreate indexes
DROP INDEX IF EXISTS idx_users_employee_id;
DROP INDEX IF EXISTS idx_users_direct_manager_id;

CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_direct_manager_id ON users(direct_manager_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_status ON users(status);

-- Update foreign key constraints
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_direct_manager_id_fkey;

ALTER TABLE users 
ADD CONSTRAINT users_direct_manager_id_fkey 
FOREIGN KEY (direct_manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- Update contacts table created_by reference
ALTER TABLE contacts 
DROP CONSTRAINT IF EXISTS contacts_created_by_fkey;

ALTER TABLE contacts 
ADD CONSTRAINT contacts_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- STEP 11: Clean up
-- ============================================================================
-- Drop the mapping table
DROP TABLE email_to_user_id_mapping;

-- Add documentation comment
COMMENT ON TABLE users IS 'Users table now uses Supabase auth user_id as primary key for consistency across the application';

-- ============================================================================
-- STEP 12: Verification
-- ============================================================================
-- Verify the new structure
\d users;

-- Verify data integrity
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as users_with_roles FROM users WHERE role IS NOT NULL;
SELECT role, COUNT(*) FROM users GROUP BY role;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================
-- If something goes wrong, you can restore from backup:
-- DROP TABLE users;
-- ALTER TABLE users_backup RENAME TO users;
-- ALTER TABLE users ADD PRIMARY KEY (id);
