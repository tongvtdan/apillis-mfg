-- Fix RLS policy for contacts to allow viewing customer contacts from other organizations
-- This is needed for project intake where users need to select customer contacts

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view contacts in their org" ON "public"."contacts";

-- Create a new policy that allows users to view:
-- 1. Contacts from their own organization (existing behavior)
-- 2. Customer contacts from other organizations (needed for project intake)
CREATE POLICY "Users can view contacts for project intake" ON "public"."contacts" 
FOR SELECT USING (
    -- Allow viewing contacts from user's own organization
    ("organization_id" IN ( 
        SELECT "users"."organization_id"
        FROM "public"."users"
        WHERE ("users"."id" = "auth"."uid"())
    ))
    OR
    -- Allow viewing customer contacts from other organizations for project intake
    ("type" = 'customer' AND "is_active" = true)
);
