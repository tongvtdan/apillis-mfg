-- Fix activity_log RLS policies to ensure proper access

-- First drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view activity in their org" ON "public"."activity_log";
DROP POLICY IF EXISTS "Users can create activity logs" ON "public"."activity_log";

-- Create policy for SELECT - users can view activity in their organization
CREATE POLICY "Users can view activity in their org" 
ON "public"."activity_log" 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Create policy for INSERT - users can create activity logs for their organization
CREATE POLICY "Users can create activity logs" 
ON "public"."activity_log" 
FOR INSERT 
WITH CHECK (
  organization_id = public.get_current_user_org_id() 
  AND (user_id = auth.uid() OR user_id IS NULL)
);

-- Ensure RLS is enabled
ALTER TABLE "public"."activity_log" ENABLE ROW LEVEL SECURITY;