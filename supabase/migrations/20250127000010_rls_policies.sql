-- Migration Script: Add Row Level Security Policies
-- This script adds proper RLS policies for the users table
-- Date: 2025-01-27

-- ============================================================================
-- STEP 1: Drop existing policies if they exist
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Management can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Management can update all users" ON users;
DROP POLICY IF EXISTS "Management can insert users" ON users;
DROP POLICY IF EXISTS "Management can delete users" ON users;

-- ============================================================================
-- STEP 2: Create RLS policies for users table
-- ============================================================================

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy 2: Management users can view all users in their organization
CREATE POLICY "Management can view all users" ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('management', 'admin')
            AND u.organization_id = users.organization_id
        )
    );

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy 4: Management users can update all users in their organization
CREATE POLICY "Management can update all users" ON users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('management', 'admin')
            AND u.organization_id = users.organization_id
        )
    );

-- Policy 5: Management users can insert new users
CREATE POLICY "Management can insert users" ON users
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('management', 'admin')
            AND u.organization_id = users.organization_id
        )
    );

-- Policy 6: Management users can delete users
CREATE POLICY "Management can delete users" ON users
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('management', 'admin')
            AND u.organization_id = users.organization_id
        )
    );

-- ============================================================================
-- STEP 3: Create RLS policies for organizations table
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Management can view organization details" ON organizations;

-- Policy: Users can view their own organization
CREATE POLICY "Users can view their organization" ON organizations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.organization_id = organizations.id
        )
    );

-- Policy: Management can view organization details
CREATE POLICY "Management can view organization details" ON organizations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('management', 'admin')
            AND u.organization_id = organizations.id
        )
    );

-- ============================================================================
-- STEP 4: Create RLS policies for contacts table
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view contacts in their organization" ON contacts;
DROP POLICY IF EXISTS "Management can manage contacts" ON contacts;

-- Policy: Users can view contacts in their organization
CREATE POLICY "Users can view contacts in their organization" ON contacts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.organization_id = contacts.organization_id
        )
    );

-- Policy: Management can manage contacts
CREATE POLICY "Management can manage contacts" ON contacts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('management', 'admin')
            AND u.organization_id = contacts.organization_id
        )
    );

-- ============================================================================
-- STEP 5: Verify policies were created
-- ============================================================================

-- Check users table policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd 
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY policyname;

-- Check organizations table policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd 
FROM pg_policies 
WHERE tablename = 'organizations' 
ORDER BY policyname;
