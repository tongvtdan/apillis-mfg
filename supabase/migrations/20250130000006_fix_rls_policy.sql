-- Fix RLS policy issue by dropping and recreating the problematic policy
-- This will resolve the ambiguous column reference in can_access_project function

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can modify projects" ON projects;

-- Create a simpler policy that doesn't use the problematic function
CREATE POLICY "Users can access projects" ON projects
FOR SELECT
USING (
  -- Allow access to projects in the same organization
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Create a separate policy for modifications
CREATE POLICY "Users can modify projects" ON projects
FOR ALL
USING (
  -- Allow access to projects in the same organization
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid()
  )
);
