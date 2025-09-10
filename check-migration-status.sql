-- Check if our RLS fix migration was applied
-- Look for evidence that the policy was dropped and recreated

-- Check current policies
SELECT
    policyname,
    qual as policy_condition,
    cmd as operation
FROM pg_policies
WHERE tablename = 'organizations'
ORDER BY policyname;

-- Check if the problematic auth.role() function is still being used
SELECT
    policyname,
    qual
FROM pg_policies
WHERE tablename = 'organizations'
AND qual LIKE '%auth.role%';

-- If no results above, the migration was applied successfully
-- If you see auth.role() in the policies, the migration failed
