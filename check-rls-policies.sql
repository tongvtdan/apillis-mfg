-- Check current RLS policies on organizations table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'organizations'
ORDER BY policyname;

-- Also check if RLS is enabled on the table
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'organizations' AND schemaname = 'public';

-- Check the actual policies content
SELECT * FROM pg_policies WHERE tablename = 'organizations';
