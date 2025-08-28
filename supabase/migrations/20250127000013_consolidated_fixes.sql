-- Migration: Consolidated Fixes for Authentication, RLS, and Dashboard
-- Date: 2025-01-27
-- This migration consolidates all the fixes from previous migrations into one clean file

-- ============================================================================
-- SECTION 1: Authentication User Mapping Fixes
-- ============================================================================

-- Add user_id column to link with auth.users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create mapping table to link emails with auth user IDs
CREATE TABLE IF NOT EXISTS email_to_user_id_mapping (
    email TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert mapping for existing auth users
INSERT INTO email_to_user_id_mapping (email, user_id)
SELECT 
    email,
    id as user_id
FROM auth.users 
WHERE email IN (
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
    'admin@factorypulse.vn',
    'support@factorypulse.vn'
)
ON CONFLICT (email) DO UPDATE SET 
    user_id = EXCLUDED.user_id,
    created_at = NOW();

-- Update users table with the correct auth user IDs
UPDATE users 
SET user_id = mapping.user_id
FROM email_to_user_id_mapping mapping
WHERE users.email = mapping.email;

-- Create function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
BEGIN
    -- Get the default organization
    SELECT id INTO org_id FROM public.organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1;
    
    -- Insert new user into users table
    INSERT INTO public.users (
        id,
        user_id,
        organization_id,
        email,
        name,
        role,
        status,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(), -- Generate new UUID for custom users table
        NEW.id, -- Use auth user ID for linking
        org_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'customer', -- Default role for new users
        'active',
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 2: RLS Recursion Fixes
-- ============================================================================

-- Create a function to check if user is admin without recursion
CREATE OR REPLACE FUNCTION is_user_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role in users table
  -- Use a direct query with bypass to avoid RLS recursion
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = user_uuid 
    AND role = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- If there's any error, return false to be safe
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO public;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admin users can view all profiles" ON users;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Create simplified policies that don't cause recursion
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON users
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE
TO public
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON users
FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);

-- Admin users can view all profiles (using the function)
CREATE POLICY "Admin users can view all profiles" ON users
FOR SELECT
TO public
USING (
  is_user_admin() 
  OR 
  auth.role() = 'service_role'
);

-- Admin users can update all profiles (using the function)
CREATE POLICY "Admin users can update all profiles" ON users
FOR UPDATE
TO public
USING (
  is_user_admin() 
  OR 
  auth.role() = 'service_role'
);

-- ============================================================================
-- SECTION 3: Activity Log RLS Policies
-- ============================================================================

-- Add RLS policies for activity_log table
-- Users can view their own activity logs
DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_log;
CREATE POLICY "Users can view their own activity logs" ON activity_log
FOR SELECT
TO public
USING (
  -- Users can view their own logs
  user_id = auth.uid()
  OR
  -- Admin users can view all logs (using the function)
  is_user_admin()
  OR
  -- Service role can view all logs
  auth.role() = 'service_role'
);

-- Users can insert their own activity logs
DROP POLICY IF EXISTS "Users can insert their own activity logs" ON activity_log;
CREATE POLICY "Users can insert their own activity logs" ON activity_log
FOR INSERT
TO public
WITH CHECK (
  -- Users can insert logs for themselves
  user_id = auth.uid()
  OR
  -- Admin users can insert logs for any user
  is_user_admin()
  OR
  -- Service role can insert any logs
  auth.role() = 'service_role'
);

-- Users can update their own activity logs
DROP POLICY IF EXISTS "Users can update their own activity logs" ON activity_log;
CREATE POLICY "Users can update their own activity logs" ON activity_log
FOR UPDATE
TO public
USING (
  -- Users can update their own logs
  user_id = auth.uid()
  OR
  -- Admin users can update any logs
  is_user_admin()
  OR
  -- Service role can update any logs
  auth.role() = 'service_role'
);

-- Users can delete their own activity logs
DROP POLICY IF EXISTS "Users can delete their own activity logs" ON activity_log;
CREATE POLICY "Users can delete their own activity logs" ON activity_log
FOR DELETE
TO public
USING (
  -- Users can delete their own logs
  user_id = auth.uid()
  OR
  -- Admin users can delete any logs
  is_user_admin()
  OR
  -- Service role can delete any logs
  auth.role() = 'service_role'
);

-- ============================================================================
-- SECTION 4: Dashboard Functions
-- ============================================================================

-- Create the get_dashboard_summary function
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Get projects summary
  SELECT json_build_object(
    'projects', json_build_object(
      'total', (SELECT COUNT(*) FROM projects),
      'by_status', (
        SELECT json_object_agg(status, count)
        FROM (
          SELECT status, COUNT(*) as count
          FROM projects
          GROUP BY status
        ) status_counts
      )
    ),
    'recent_projects', (
      SELECT json_agg(
        json_build_object(
          'id', p.id,
          'project_id', p.project_id,
          'title', p.title,
          'status', p.status,
          'priority', p.priority_level,
          'created_at', p.created_at,
          'customer_name', p.customer_name
        )
      )
      FROM (
        SELECT p.id, p.project_id, p.title, p.status, p.priority_level, p.created_at, c.company_name as customer_name
        FROM projects p
        LEFT JOIN contacts c ON p.customer_id = c.id
        ORDER BY p.created_at DESC
        LIMIT 5
      ) p
    ),
    'generated_at', extract(epoch from now())
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_dashboard_summary() TO authenticated;

-- ============================================================================
-- SECTION 5: Final Cleanup and Verification
-- ============================================================================

-- Add organization_id to admin users if missing
UPDATE users 
SET organization_id = (
  SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1
)
WHERE organization_id IS NULL 
AND role = 'admin';

-- Add comments for documentation
COMMENT ON FUNCTION is_user_admin(UUID) IS 'Function to check if user is admin without causing RLS recursion';
COMMENT ON TABLE users IS 'Users table with consolidated fixes for authentication, RLS, and organization mapping';
COMMENT ON TABLE activity_log IS 'Activity log table with RLS policies for user access control';
COMMENT ON FUNCTION get_dashboard_summary() IS 'Returns dashboard summary data including project counts and recent projects';
COMMENT ON TABLE email_to_user_id_mapping IS 'Mapping table linking email addresses to Supabase Auth user IDs';

-- Verify the consolidated fix
SELECT 
    'Consolidated Fix Status' as info,
    COUNT(*) as total_users,
    COUNT(user_id) as linked_users,
    COUNT(*) - COUNT(user_id) as unlinked_users
FROM users;
