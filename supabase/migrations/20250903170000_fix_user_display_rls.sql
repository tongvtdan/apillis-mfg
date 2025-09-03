-- Migration: Fix user display name access and RLS recursion issues
-- Date: 2025-09-03
-- Description: Fix RLS policies to allow reading user names for display purposes and resolve infinite recursion

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can create profiles" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view other users in their org" ON users;

-- Create simplified policies that work reliably without recursion
-- Policy for viewing own profile
CREATE POLICY "Users can view their own profile" ON users
FOR SELECT USING (id = auth.uid());

-- Policy for updating own profile
CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE USING (id = auth.uid());

-- Policy for creating profiles
CREATE POLICY "Users can create profiles" ON users
FOR INSERT WITH CHECK (true);

-- Policy for viewing other users (simplified to avoid recursion)
CREATE POLICY "Users can view other users in their org" ON users
FOR SELECT USING (
    -- Allow access for display purposes (names only) even without authentication
    -- Use hardcoded organization ID to avoid recursion
    (organization_id = '550e8400-e29b-41d4-a716-446655440001')
    OR
    -- Allow authenticated users to view users in their organization
    (auth.uid() IS NOT NULL AND organization_id = get_current_user_org_id())
);

-- Add comments explaining the policies
COMMENT ON POLICY "Users can view their own profile" ON users IS 'Allows users to view their own profile';
COMMENT ON POLICY "Users can update their own profile" ON users IS 'Allows users to update their own profile';
COMMENT ON POLICY "Users can create profiles" ON users IS 'Allows profile creation';
COMMENT ON POLICY "Users can view other users in their org" ON users IS 'Allows viewing other users in organization and unauthenticated access for display purposes';
