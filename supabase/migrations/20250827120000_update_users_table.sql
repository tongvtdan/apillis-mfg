-- Migration: Update users table structure
-- Add phone, role, description fields and change is_active to status

-- Add new columns if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS role VARCHAR(50),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Add CHECK constraint for role if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'users_role_check'
    ) THEN
        ALTER TABLE users 
        ADD CONSTRAINT users_role_check 
        CHECK (role IN ('customer', 'sales', 'procurement', 'engineering', 'qa', 'production', 'management', 'supplier', 'admin'));
    END IF;
END $$;

-- Add CHECK constraint for status if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'users_status_check'
    ) THEN
        ALTER TABLE users 
        ADD CONSTRAINT users_status_check 
        CHECK (status IN ('active', 'dismiss'));
    END IF;
END $$;

-- Migrate existing is_active values to status if is_active column exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_active'
    ) THEN
        -- Update status based on is_active values
        UPDATE users 
        SET status = CASE 
            WHEN is_active = true THEN 'active'
            WHEN is_active = false THEN 'dismiss'
            ELSE 'active'
        END
        WHERE status IS NULL;
        
        -- Drop the old is_active column
        ALTER TABLE users DROP COLUMN is_active;
    END IF;
END $$;

-- Make role NOT NULL if there are no NULL values
DO $$ 
BEGIN
    -- First, set a default role for any NULL values
    UPDATE users SET role = 'customer' WHERE role IS NULL;
    
    -- Then make the column NOT NULL
    ALTER TABLE users ALTER COLUMN role SET NOT NULL;
END $$;