-- QUICK FIX: Apply this SQL to resolve the 400 Bad Request errors
-- Copy and paste this into your Supabase SQL Editor at http://localhost:54321

-- Drop the broken policies
DROP POLICY IF EXISTS "org_select_policy" ON organizations;
DROP POLICY IF EXISTS "org_insert_policy" ON organizations;
DROP POLICY IF EXISTS "org_update_policy" ON organizations;
DROP POLICY IF EXISTS "org_delete_policy" ON organizations;

-- Create working policies
CREATE POLICY "org_select_policy" ON organizations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "org_insert_policy" ON organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "org_update_policy" ON organizations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "org_delete_policy" ON organizations FOR DELETE USING (auth.uid() IS NOT NULL);

-- Verify the fix
SELECT
    policyname,
    qual as policy_condition
FROM pg_policies
WHERE tablename = 'organizations';
