-- IMMEDIATE CUSTOMER COUNT FIX
-- Copy and paste this into Supabase SQL Editor at http://localhost:54321

-- Step 1: Check current RLS policies
SELECT 
    policyname, 
    qual as policy_condition 
FROM pg_policies 
WHERE tablename = 'organizations';

-- Step 2: Drop broken policies (if they exist)
DROP POLICY IF EXISTS "org_select_policy" ON organizations;
DROP POLICY IF EXISTS "org_insert_policy" ON organizations;
DROP POLICY IF EXISTS "org_update_policy" ON organizations;
DROP POLICY IF EXISTS "org_delete_policy" ON organizations;

-- Step 3: Create working policies
CREATE POLICY "org_select_policy" ON organizations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "org_insert_policy" ON organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "org_update_policy" ON organizations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "org_delete_policy" ON organizations FOR DELETE USING (auth.uid() IS NOT NULL);

-- Step 4: Test the fix
SELECT 
    organization_type, 
    COUNT(*) as count 
FROM organizations 
GROUP BY organization_type;

-- Expected result after fix:
-- customer | 3
-- supplier | 1
-- internal | 1
