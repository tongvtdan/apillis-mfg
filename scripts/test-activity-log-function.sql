-- Test script for activity_log function
-- This script helps debug issues with the log_activity function

-- First, let's check if the function exists and its definition
\df+ public.log_activity

-- Check if triggers exist on projects table
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'projects'::regclass 
AND tgname = 'log_projects_activity';

-- Test the get_current_user_org_id function
SELECT public.get_current_user_org_id();

-- Test manual insert into activity_log
-- First get a valid organization_id
SELECT id FROM organizations LIMIT 1;

-- Replace 'YOUR_ORG_ID_HERE' with an actual organization ID from the query above
-- INSERT INTO activity_log (
--     organization_id,
--     user_id,
--     entity_type,
--     entity_id,
--     action,
--     description
-- ) VALUES (
--     'YOUR_ORG_ID_HERE',
--     'YOUR_USER_ID_HERE',
--     'test',
--     'test-id',
--     'test_action',
--     'Test activity log entry'
-- );

-- Check if any activity logs exist
SELECT COUNT(*) FROM activity_log;

-- Check recent activity logs
SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 10;

-- Check RLS policies on activity_log
SELECT * FROM pg_policy WHERE polrelid = 'activity_log'::regclass;