-- Migration Script: Add RLS Policies for Activity Log Table
-- This script adds proper RLS policies for the activity_log table
-- Date: 2025-01-27

-- ============================================================================
-- STEP 1: Enable RLS on activity_log table if not already enabled
-- ============================================================================
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Create RLS policies for activity_log table
-- ============================================================================

-- Policy 1: Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs" ON activity_log
    FOR SELECT
    USING (user_id = auth.uid());

-- Policy 2: Management users can view all activity logs in their organization
CREATE POLICY "Management can view all activity logs" ON activity_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('management', 'admin')
            AND u.organization_id = activity_log.organization_id
        )
    );

-- Policy 3: Users can insert their own activity logs
CREATE POLICY "Users can insert their own activity logs" ON activity_log
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Policy 4: Management users can insert activity logs for their organization
CREATE POLICY "Management can insert activity logs" ON activity_log
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('management', 'admin')
            AND u.organization_id = activity_log.organization_id
        )
    );

-- Policy 5: System can insert activity logs (for triggers and automated processes)
CREATE POLICY "System can insert activity logs" ON activity_log
    FOR INSERT
    WITH CHECK (true); -- Allow system processes to insert logs

-- ============================================================================
-- STEP 3: Verify policies were created
-- ============================================================================
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd 
FROM pg_policies 
WHERE tablename = 'activity_log' 
ORDER BY policyname;
