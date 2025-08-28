-- Migration: Fix RLS recursion issue in users table - Version 2
-- Date: 2025-01-27
-- Issue: RLS policies still causing infinite recursion when checking admin role

-- STEP 1: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admin users can view all profiles" ON users;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- STEP 2: Create a function to check if user is admin without recursion
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

-- STEP 3: Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO public;

-- STEP 4: Create simplified policies that don't cause recursion
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

-- STEP 5: Add comments
COMMENT ON FUNCTION is_user_admin(UUID) IS 'Function to check if user is admin without causing RLS recursion';
COMMENT ON TABLE users IS 'Users table with fixed RLS policies using function-based admin check';
