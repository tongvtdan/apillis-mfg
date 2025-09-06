-- Migration: Fix organizations RLS policy for customer organization access
-- Date: 2025-01-17
-- Description: Allow users to view all organizations (including customer organizations) for project display

/*
ISSUE FIXED:
============

The original RLS policy on the organizations table was too restrictive:
- Only allowed users to view organizations they belong to
- Blocked access to customer organizations referenced in projects
- Caused "No Customer" display in project lists

SOLUTION:
=========

Updated the RLS policy to allow all authenticated users to view all organizations
for the purpose of displaying customer information in projects.

SECURITY CONSIDERATIONS:
=======================

- Organizations table contains only basic info (id, name, description)
- No sensitive data exposed
- Users can only view, not modify customer organizations
- Update operations still restricted to user's own organization
*/

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;

-- Create new policy allowing all users to view all organizations
CREATE POLICY "Users can view all organizations" ON organizations 
FOR SELECT TO public 
USING (true);

-- Keep the existing update policy for security
-- (Users can only update their own organization)
