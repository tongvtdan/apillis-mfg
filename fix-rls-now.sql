-- IMMEDIATE FIX: Copy and paste this into Supabase SQL Editor
-- This will fix the 400 Bad Request errors immediately

-- Step 1: Drop the broken policies
DROP POLICY IF EXISTS "org_select_policy" ON organizations;
DROP POLICY IF EXISTS "org_insert_policy" ON organizations;
DROP POLICY IF EXISTS "org_update_policy" ON organizations;
DROP POLICY IF EXISTS "org_delete_policy" ON organizations;

-- Step 2: Create working policies
CREATE POLICY "org_select_policy" ON organizations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "org_insert_policy" ON organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "org_update_policy" ON organizations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "org_delete_policy" ON organizations FOR DELETE USING (auth.uid() IS NOT NULL);

-- Step 3: Verify (optional - you can run this to confirm)
SELECT policyname, qual FROM pg_policies WHERE tablename = 'organizations';
