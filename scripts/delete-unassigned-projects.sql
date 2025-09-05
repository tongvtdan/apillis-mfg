-- Factory Pulse - Delete Unassigned Projects SQL Script
-- 
-- This script deletes projects where assigned_to is NULL.
-- It includes safety checks and comprehensive logging.
-- 
-- IMPORTANT: 
-- - Run this script in the Supabase SQL Editor
-- - Review the queries before execution
-- - Consider creating a backup first
-- - Test with SELECT queries before DELETE operations
--
-- Usage:
-- 1. First run the SELECT queries to see what will be deleted
-- 2. If satisfied, run the DELETE operations
-- 3. Verify the results

-- =====================================================
-- STEP 1: ANALYSIS - See what will be deleted
-- =====================================================

-- Count unassigned projects
SELECT 
    COUNT(*) as total_unassigned_projects,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_unassigned,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_unassigned,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_unassigned,
    COUNT(CASE WHEN status = 'on_hold' THEN 1 END) as on_hold_unassigned
FROM projects 
WHERE assigned_to IS NULL;

-- Show detailed list of unassigned projects
SELECT 
    id,
    project_id,
    title,
    status,
    priority_level,
    created_at,
    organization_id,
    customer_id,
    current_stage_id
FROM projects 
WHERE assigned_to IS NULL
ORDER BY created_at DESC;

-- Check related data that will be deleted
-- (Most tables have ON DELETE CASCADE, so this is for information only)

-- Project sub-stage progress
SELECT 
    'project_sub_stage_progress' as table_name,
    COUNT(*) as record_count
FROM project_sub_stage_progress pssp
JOIN projects p ON pssp.project_id = p.id
WHERE p.assigned_to IS NULL

UNION ALL

-- Project stage history
SELECT 
    'project_stage_history' as table_name,
    COUNT(*) as record_count
FROM project_stage_history psh
JOIN projects p ON psh.project_id = p.id
WHERE p.assigned_to IS NULL

UNION ALL

-- Project assignments
SELECT 
    'project_assignments' as table_name,
    COUNT(*) as record_count
FROM project_assignments pa
JOIN projects p ON pa.project_id = p.id
WHERE p.assigned_to IS NULL

UNION ALL

-- Documents
SELECT 
    'documents' as table_name,
    COUNT(*) as record_count
FROM documents d
JOIN projects p ON d.project_id = p.id
WHERE p.assigned_to IS NULL

UNION ALL

-- Reviews
SELECT 
    'reviews' as table_name,
    COUNT(*) as record_count
FROM reviews r
JOIN projects p ON r.project_id = p.id
WHERE p.assigned_to IS NULL

UNION ALL

-- Messages
SELECT 
    'messages' as table_name,
    COUNT(*) as record_count
FROM messages m
JOIN projects p ON m.project_id = p.id
WHERE p.assigned_to IS NULL

UNION ALL

-- Notifications
SELECT 
    'notifications' as table_name,
    COUNT(*) as record_count
FROM notifications n
JOIN projects p ON n.project_id = p.id
WHERE p.assigned_to IS NULL

UNION ALL

-- Supplier RFQs
SELECT 
    'supplier_rfqs' as table_name,
    COUNT(*) as record_count
FROM supplier_rfqs sr
JOIN projects p ON sr.project_id = p.id
WHERE p.assigned_to IS NULL

UNION ALL

-- Activity log
SELECT 
    'activity_log' as table_name,
    COUNT(*) as record_count
FROM activity_log al
JOIN projects p ON al.project_id = p.id
WHERE p.assigned_to IS NULL

UNION ALL

-- BOM items
SELECT 
    'bom_items' as table_name,
    COUNT(*) as record_count
FROM bom_items bi
JOIN projects p ON bi.project_id = p.id
WHERE p.assigned_to IS NULL

UNION ALL

-- Supplier performance metrics
SELECT 
    'supplier_performance_metrics' as table_name,
    COUNT(*) as record_count
FROM supplier_performance_metrics spm
JOIN projects p ON spm.project_id = p.id
WHERE p.assigned_to IS NULL;

-- =====================================================
-- STEP 2: BACKUP (Optional but Recommended)
-- =====================================================

-- Create a backup table with unassigned projects
-- (Uncomment the following lines if you want to create a backup)

/*
CREATE TABLE projects_backup_unassigned AS
SELECT * FROM projects WHERE assigned_to IS NULL;

-- Verify backup
SELECT COUNT(*) as backup_count FROM projects_backup_unassigned;
*/

-- =====================================================
-- STEP 3: DELETION OPERATIONS
-- =====================================================

-- WARNING: The following DELETE operations are irreversible!
-- Make sure you have reviewed the SELECT queries above
-- and are satisfied with what will be deleted.

-- Delete unassigned projects
-- Note: Due to foreign key constraints with ON DELETE CASCADE,
-- related records will be automatically deleted

-- Option 1: Delete all unassigned projects
-- DELETE FROM projects WHERE assigned_to IS NULL;

-- Option 2: Delete only cancelled/completed unassigned projects (safer)
-- DELETE FROM projects 
-- WHERE assigned_to IS NULL 
-- AND status IN ('cancelled', 'completed');

-- Option 3: Delete with a limit (for testing)
-- DELETE FROM projects 
-- WHERE assigned_to IS NULL 
-- AND id IN (
--     SELECT id FROM projects 
--     WHERE assigned_to IS NULL 
--     ORDER BY created_at ASC 
--     LIMIT 5
-- );

-- =====================================================
-- STEP 4: VERIFICATION
-- =====================================================

-- Verify deletion
SELECT 
    COUNT(*) as remaining_unassigned_projects
FROM projects 
WHERE assigned_to IS NULL;

-- Show remaining projects
SELECT 
    project_id,
    title,
    status,
    created_at
FROM projects 
WHERE assigned_to IS NULL
ORDER BY created_at DESC;

-- =====================================================
-- STEP 5: CLEANUP (Optional)
-- =====================================================

-- If you created a backup table and no longer need it:
-- DROP TABLE IF EXISTS projects_backup_unassigned;

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================

/*
EXECUTION STEPS:

1. FIRST: Run all SELECT queries in STEP 1 to analyze what will be deleted
2. REVIEW: Check the results and ensure you're comfortable with the deletion
3. BACKUP: Optionally create a backup using the commands in STEP 2
4. DELETE: Uncomment and run ONE of the DELETE operations in STEP 3
5. VERIFY: Run the verification queries in STEP 4 to confirm deletion
6. CLEANUP: Optionally remove backup tables in STEP 5

SAFETY NOTES:
- Always test with SELECT queries first
- Consider deleting in smaller batches using LIMIT
- Start with cancelled/completed projects if unsure
- Keep backups until you're confident the deletion was correct
- Monitor your application after deletion to ensure no issues

RECOMMENDED APPROACH:
1. Run the analysis queries
2. Create a backup table
3. Delete cancelled/completed unassigned projects first
4. Verify results
5. If satisfied, delete remaining unassigned projects
6. Clean up backup table after verification
*/
