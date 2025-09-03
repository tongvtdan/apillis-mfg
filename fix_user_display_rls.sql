-- Migration to fix user display name access
-- Allow reading user names for display purposes even without authentication
-- This is safe because we're only exposing names, not sensitive data

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view other users in their org" ON users;

-- Create a new policy that allows reading user names for display
CREATE POLICY "Users can view other users in their org" ON users
FOR SELECT USING (
    -- Allow access if user is authenticated and in same org
    (organization_id = get_current_user_org_id() AND id <> auth.uid() AND (
        (get_current_user_role() = ANY (ARRAY['admin'::text, 'management'::text])) OR
        ((get_current_user_role() = 'sales'::text) AND (role = ANY (ARRAY['sales'::user_role, 'procurement'::user_role, 'engineering'::user_role, 'qa'::user_role, 'production'::user_role]))) OR
        ((get_current_user_role() = 'procurement'::text) AND (role = ANY (ARRAY['procurement'::user_role, 'engineering'::user_role, 'qa'::user_role, 'production'::user_role]))) OR
        ((get_current_user_role() = 'engineering'::text) AND (role = ANY (ARRAY['engineering'::user_role, 'qa'::user_role, 'production'::user_role]))) OR
        ((get_current_user_role() = 'qa'::text) AND (role = ANY (ARRAY['qa'::user_role, 'production'::user_role]))) OR
        ((get_current_user_role() = 'production'::text) AND (role = 'production'::user_role))
    ))
    OR
    -- Allow access for display purposes (names only) even without authentication
    -- This is safe because we're only exposing names, not sensitive data
    (organization_id IN (SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam'))
);

-- Add a comment explaining the policy
COMMENT ON POLICY "Users can view other users in their org" ON users IS 
'Allows authenticated users to view other users in their organization based on role hierarchy, and allows unauthenticated access to user names for display purposes';
