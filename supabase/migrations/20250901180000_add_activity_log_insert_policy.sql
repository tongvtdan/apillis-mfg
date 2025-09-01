-- Add INSERT policy for activity_log table
CREATE POLICY "Users can create activity logs" 
ON "public"."activity_log" 
FOR INSERT 
WITH CHECK (
  ("organization_id" = "public"."get_current_user_org_id"()) 
  AND ("user_id" = "auth"."uid"())
);


