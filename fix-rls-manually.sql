-- Manual RLS Policy Fix for Organizations Table
-- Run this directly in Supabase SQL Editor if migration didn't work

-- Step 1: Drop the problematic policies
DROP POLICY IF EXISTS "org_select_policy" ON organizations;
DROP POLICY IF EXISTS "org_insert_policy" ON organizations;
DROP POLICY IF EXISTS "org_update_policy" ON organizations;
DROP POLICY IF EXISTS "org_delete_policy" ON organizations;

-- Step 2: Create correct policies
CREATE POLICY "org_select_policy" ON organizations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "org_insert_policy" ON organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "org_update_policy" ON organizations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "org_delete_policy" ON organizations FOR DELETE USING (auth.uid() IS NOT NULL);

-- Step 3: Verify the fix
SELECT
    policyname,
    qual as policy_condition,
    cmd as operation
FROM pg_policies
WHERE tablename = 'organizations'
ORDER BY policyname;
