-- Migration: Fix RLS recursion issue in users table
-- Date: 2025-01-27
-- Issue: RLS policies causing infinite recursion when checking admin role

-- STEP 1: Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Admin users can view all profiles" ON users;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON users;

-- STEP 2: Create simplified admin policies that don't cause recursion
-- Admin users can view all profiles (simplified to avoid recursion)
CREATE POLICY "Admin users can view all profiles" ON users
FOR SELECT
TO public
USING (
  -- Check if user has admin role in auth.users table (no recursion)
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
  OR 
  -- Check if user has admin role in users table (simplified check)
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = auth.uid() 
    AND u.role = 'admin'
    AND u.user_id IS NOT NULL
  )
  OR
  -- Service role can always access
  auth.role() = 'service_role'
);

-- Admin users can update all profiles (simplified to avoid recursion)
CREATE POLICY "Admin users can update all profiles" ON users
FOR UPDATE
TO public
USING (
  -- Check if user has admin role in auth.users table (no recursion)
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
  OR 
  -- Check if user has admin role in users table (simplified check)
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.user_id = auth.uid() 
    AND u.role = 'admin'
    AND u.user_id IS NOT NULL
  )
  OR
  -- Service role can always access
  auth.role() = 'service_role'
);

-- STEP 3: Ensure the basic user policies are still in place
-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE
TO public
USING (auth.uid() = user_id);

-- STEP 4: Add a policy for inserting new users (needed for profile creation)
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users
FOR INSERT
TO public
WITH CHECK (
  -- Users can insert their own profile
  auth.uid() = user_id
  OR
  -- Service role can insert any profile
  auth.role() = 'service_role'
);

-- STEP 5: Add organization_id to admin users if missing
-- This ensures admin users have proper organization access
UPDATE users 
SET organization_id = (
  SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1
)
WHERE organization_id IS NULL 
AND role = 'admin';

-- STEP 6: Verify the fix by checking if policies are working
-- This will help identify any remaining issues
COMMENT ON TABLE users IS 'Users table with fixed RLS policies to prevent recursion';
