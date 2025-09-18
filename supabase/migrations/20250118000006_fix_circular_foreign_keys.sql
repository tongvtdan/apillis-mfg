-- Migration: Fix Circular Foreign Key Constraints Between Users and Organizations
-- This migration resolves the circular dependency issue that prevents proper data restoration
-- and future data insertion.

-- ============================================================================
-- STEP 1: Create helper functions for managing the circular dependency
-- ============================================================================

-- Function to get or create the bootstrap organization
CREATE OR REPLACE FUNCTION public.get_or_create_bootstrap_org()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    bootstrap_org_id uuid;
    admin_user_id uuid;
BEGIN
    -- Check if we already have an organization
    SELECT id INTO bootstrap_org_id FROM organizations LIMIT 1;
    
    IF bootstrap_org_id IS NOT NULL THEN
        RETURN bootstrap_org_id;
    END IF;
    
    -- Create bootstrap organization (no created_by initially)
    INSERT INTO organizations (
        id,
        name,
        slug,
        description,
        organization_type,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'Bootstrap Organization',
        'bootstrap',
        'Temporary organization for bootstrap process',
        'internal',
        true,
        now(),
        now()
    ) RETURNING id INTO bootstrap_org_id;
    
    RETURN bootstrap_org_id;
END;
$$;

-- Function to handle user insertion with automatic organization assignment
CREATE OR REPLACE FUNCTION public.handle_user_insertion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    bootstrap_org_id uuid;
BEGIN
    -- If organization_id is not provided, assign to bootstrap org
    IF NEW.organization_id IS NULL THEN
        bootstrap_org_id := public.get_or_create_bootstrap_org();
        NEW.organization_id := bootstrap_org_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Function to handle organization creation with automatic created_by assignment
CREATE OR REPLACE FUNCTION public.handle_organization_insertion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id uuid;
BEGIN
    -- If created_by is not provided, try to get current user
    IF NEW.created_by IS NULL THEN
        -- Try to get current user from auth context
        BEGIN
            current_user_id := auth.uid();
            
            -- If we have a current user, use it
            IF current_user_id IS NOT NULL THEN
                NEW.created_by := current_user_id;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                -- If we can't get current user, leave created_by as NULL
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$;

-- ============================================================================
-- STEP 2: Modify the organizations table to make created_by nullable
-- ============================================================================

-- First, drop the existing foreign key constraint
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_created_by_fkey;

-- Make created_by nullable (it should already be nullable, but let's be explicit)
ALTER TABLE organizations ALTER COLUMN created_by DROP NOT NULL;

-- Re-add the foreign key constraint as DEFERRABLE INITIALLY DEFERRED
-- This allows the constraint to be checked at the end of the transaction
ALTER TABLE organizations 
ADD CONSTRAINT organizations_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) 
ON DELETE SET NULL 
DEFERRABLE INITIALLY DEFERRED;

-- ============================================================================
-- STEP 3: Modify the users table constraint to be more flexible
-- ============================================================================

-- Drop and recreate the users foreign key constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_organization_id_fkey;

-- Re-add with ON DELETE SET NULL instead of CASCADE to prevent accidental data loss
ALTER TABLE users 
ADD CONSTRAINT users_organization_id_fkey 
FOREIGN KEY (organization_id) REFERENCES organizations(id) 
ON DELETE SET NULL 
DEFERRABLE INITIALLY DEFERRED;

-- ============================================================================
-- STEP 4: Create triggers to handle automatic assignment
-- ============================================================================

-- Trigger for user insertion
CREATE OR REPLACE TRIGGER users_insert_trigger
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_insertion();

-- Trigger for organization insertion
CREATE OR REPLACE TRIGGER organizations_insert_trigger
    BEFORE INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_organization_insertion();

-- ============================================================================
-- STEP 5: Create a function to safely bootstrap the system
-- ============================================================================

-- Function to create the first user and organization safely
CREATE OR REPLACE FUNCTION public.bootstrap_system(
    user_email text,
    user_name text DEFAULT NULL,
    org_name text DEFAULT 'Apillis',
    org_slug text DEFAULT 'apillis'
)
RETURNS TABLE(user_id uuid, organization_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id uuid;
    new_org_id uuid;
    existing_user_id uuid;
    existing_org_id uuid;
BEGIN
    -- Check if system is already bootstrapped
    SELECT id INTO existing_user_id FROM users WHERE email = user_email LIMIT 1;
    SELECT id INTO existing_org_id FROM organizations WHERE slug = org_slug LIMIT 1;
    
    IF existing_user_id IS NOT NULL AND existing_org_id IS NOT NULL THEN
        RETURN QUERY SELECT existing_user_id, existing_org_id;
        RETURN;
    END IF;
    
    -- Start transaction block
    BEGIN
        -- Create organization first (without created_by)
        INSERT INTO organizations (
            id,
            name,
            slug,
            description,
            organization_type,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            org_name,
            org_slug,
            'Leading manufacturing technology company',
            'internal',
            true,
            now(),
            now()
        ) RETURNING id INTO new_org_id;
        
        -- Create user (will be assigned to the organization by trigger)
        INSERT INTO users (
            id,
            email,
            name,
            role,
            department,
            status,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            user_email,
            COALESCE(user_name, 'Admin User'),
            'admin',
            'IT',
            'active',
            now(),
            now()
        ) RETURNING id INTO new_user_id;
        
        -- Update organization to set created_by
        UPDATE organizations 
        SET created_by = new_user_id,
            updated_at = now()
        WHERE id = new_org_id;
        
        -- Update user to set organization_id
        UPDATE users 
        SET organization_id = new_org_id,
            updated_at = now()
        WHERE id = new_user_id;
        
        RETURN QUERY SELECT new_user_id, new_org_id;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback on error
            RAISE EXCEPTION 'Failed to bootstrap system: %', SQLERRM;
    END;
END;
$$;

-- ============================================================================
-- STEP 6: Create a function to safely restore data
-- ============================================================================

-- Function to safely restore users and organizations
CREATE OR REPLACE FUNCTION public.safe_restore_user_org_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    org_record RECORD;
BEGIN
    -- Temporarily disable triggers to avoid conflicts during restoration
    ALTER TABLE users DISABLE TRIGGER users_insert_trigger;
    ALTER TABLE organizations DISABLE TRIGGER organizations_insert_trigger;
    
    -- Set session to defer constraint checking
    SET CONSTRAINTS ALL DEFERRED;
    
    BEGIN
        -- Process organizations first (without created_by)
        FOR org_record IN 
            SELECT * FROM organizations 
            WHERE created_by IS NOT NULL 
            AND NOT EXISTS (SELECT 1 FROM users WHERE id = org_record.created_by)
        LOOP
            -- Temporarily set created_by to NULL
            UPDATE organizations 
            SET created_by = NULL 
            WHERE id = org_record.id;
        END LOOP;
        
        -- Process users
        FOR user_record IN 
            SELECT * FROM users 
            WHERE organization_id IS NOT NULL 
            AND NOT EXISTS (SELECT 1 FROM organizations WHERE id = user_record.organization_id)
        LOOP
            -- Assign to bootstrap organization
            UPDATE users 
            SET organization_id = public.get_or_create_bootstrap_org()
            WHERE id = user_record.id;
        END LOOP;
        
        -- Now update organizations with valid created_by references
        FOR org_record IN 
            SELECT * FROM organizations 
            WHERE created_by IS NULL
        LOOP
            -- Find a user from the same organization to be the creator
            UPDATE organizations 
            SET created_by = (
                SELECT id FROM users 
                WHERE organization_id = org_record.id 
                LIMIT 1
            )
            WHERE id = org_record.id;
        END LOOP;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Re-enable triggers on error
            ALTER TABLE users ENABLE TRIGGER users_insert_trigger;
            ALTER TABLE organizations ENABLE TRIGGER organizations_insert_trigger;
            RAISE EXCEPTION 'Failed to restore user/org data: %', SQLERRM;
    END;
    
    -- Re-enable triggers
    ALTER TABLE users ENABLE TRIGGER users_insert_trigger;
    ALTER TABLE organizations ENABLE TRIGGER organizations_insert_trigger;
    
    -- Reset constraint checking
    SET CONSTRAINTS ALL IMMEDIATE;
END;
$$;

-- ============================================================================
-- STEP 7: Add comments for documentation
-- ============================================================================

COMMENT ON FUNCTION public.get_or_create_bootstrap_org() IS 
'Creates a temporary bootstrap organization for handling circular dependencies during system initialization';

COMMENT ON FUNCTION public.handle_user_insertion() IS 
'Trigger function that automatically assigns users to organizations, preventing circular dependency issues';

COMMENT ON FUNCTION public.handle_organization_insertion() IS 
'Trigger function that automatically sets created_by for organizations when possible';

COMMENT ON FUNCTION public.bootstrap_system(text, text, text, text) IS 
'Safely creates the first user and organization in the system, handling circular dependencies';

COMMENT ON FUNCTION public.safe_restore_user_org_data() IS 
'Safely restores user and organization data, resolving circular dependency conflicts';

-- ============================================================================
-- STEP 8: Update existing data to ensure consistency
-- ============================================================================

-- Ensure all existing users have valid organization references
UPDATE users 
SET organization_id = COALESCE(organization_id, public.get_or_create_bootstrap_org())
WHERE organization_id IS NULL;

-- Ensure all existing organizations have valid created_by references
UPDATE organizations 
SET created_by = COALESCE(created_by, (
    SELECT id FROM users 
    WHERE organization_id = organizations.id 
    LIMIT 1
))
WHERE created_by IS NULL;

-- ============================================================================
-- STEP 9: Create indexes for better performance
-- ============================================================================

-- Index on users.organization_id for faster joins
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);

-- Index on organizations.created_by for faster joins
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);

-- ============================================================================
-- STEP 10: Grant necessary permissions
-- ============================================================================

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.get_or_create_bootstrap_org() TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_system(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_restore_user_org_data() TO authenticated;

-- ============================================================================
-- Migration completed successfully
-- ============================================================================

-- Log the completion
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: Circular foreign key constraints between users and organizations have been resolved';
    RAISE NOTICE 'Key improvements:';
    RAISE NOTICE '1. Foreign key constraints are now DEFERRABLE INITIALLY DEFERRED';
    RAISE NOTICE '2. Automatic triggers handle organization assignment for users';
    RAISE NOTICE '3. Bootstrap function safely creates first user/organization';
    RAISE NOTICE '4. Safe restore function handles data restoration conflicts';
    RAISE NOTICE '5. All constraints now use ON DELETE SET NULL to prevent accidental data loss';
END $$;
