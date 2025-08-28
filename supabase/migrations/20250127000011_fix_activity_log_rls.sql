-- Migration: Fix RLS policies for activity_log table
-- Date: 2025-01-27
-- Issue: activity_log table has RLS enabled but no policies, causing 400 Bad Request errors

-- STEP 1: Add RLS policies for activity_log table
-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs" ON activity_log
FOR SELECT
TO public
USING (
  -- Users can view their own logs
  user_id = auth.uid()
  OR
  -- Admin users can view all logs (using the function)
  is_user_admin()
  OR
  -- Service role can view all logs
  auth.role() = 'service_role'
);

-- Users can insert their own activity logs
CREATE POLICY "Users can insert their own activity logs" ON activity_log
FOR INSERT
TO public
WITH CHECK (
  -- Users can insert logs for themselves
  user_id = auth.uid()
  OR
  -- Admin users can insert logs for any user
  is_user_admin()
  OR
  -- Service role can insert any logs
  auth.role() = 'service_role'
);

-- Users can update their own activity logs
CREATE POLICY "Users can update their own activity logs" ON activity_log
FOR UPDATE
TO public
USING (
  -- Users can update their own logs
  user_id = auth.uid()
  OR
  -- Admin users can update any logs
  is_user_admin()
  OR
  -- Service role can update any logs
  auth.role() = 'service_role'
);

-- Users can delete their own activity logs
CREATE POLICY "Users can delete their own activity logs" ON activity_log
FOR DELETE
TO public
USING (
  -- Users can delete their own logs
  user_id = auth.uid()
  OR
  -- Admin users can delete any logs
  is_user_admin()
  OR
  -- Service role can delete any logs
  auth.role() = 'service_role'
);

-- STEP 2: Add comment to the table
COMMENT ON TABLE activity_log IS 'Activity log table with RLS policies for user access control';
