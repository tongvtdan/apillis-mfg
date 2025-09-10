-- URGENT: Apply this SQL immediately to fix the 400 errors
-- Copy this entire block and paste into Supabase SQL Editor

-- Check current policies first
SELECT policyname, qual FROM pg_policies WHERE tablename = 'organizations';

-- Drop all existing policies
DROP POLICY IF EXISTS "org_select_policy" ON organizations;
DROP POLICY IF EXISTS "org_insert_policy" ON organizations;
DROP POLICY IF EXISTS "org_update_policy" ON organizations;
DROP POLICY IF EXISTS "org_delete_policy" ON organizations;

-- Create new working policies
CREATE POLICY "org_select_policy" ON organizations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "org_insert_policy" ON organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "org_update_policy" ON organizations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "org_delete_policy" ON organizations FOR DELETE USING (auth.uid() IS NOT NULL);

-- Verify the fix worked
SELECT policyname, qual FROM pg_policies WHERE tablename = 'organizations';

-- Test the organizations query
SELECT organization_type, COUNT(*) FROM organizations GROUP BY organization_type;
