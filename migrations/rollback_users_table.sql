-- Rollback Migration: Revert users table structure changes
-- Date: 2025-08-27
-- Description: Rollback phone, role, description fields and revert status to is_active

BEGIN;

-- Add back is_active column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Migrate status values back to is_active
UPDATE users 
SET is_active = CASE 
    WHEN status = 'active' THEN true
    WHEN status = 'dismiss' THEN false
    ELSE true
END;

-- Drop the new columns
ALTER TABLE users DROP COLUMN IF EXISTS status;
ALTER TABLE users DROP COLUMN IF EXISTS description;
ALTER TABLE users DROP COLUMN IF EXISTS phone;
ALTER TABLE users DROP COLUMN IF EXISTS role;

-- Drop constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;

COMMIT;