-- SQL script to delete all projects with project_status = 'draft'
-- WARNING: This operation is irreversible. Please backup your data before running.

-- First, let's see what will be deleted
SELECT 
    id,
    project_id,
    title,
    status,
    created_at
FROM projects 
WHERE status = 'draft';

-- Count of draft projects to be deleted
SELECT COUNT(*) as draft_projects_count
FROM projects 
WHERE status = 'draft';

-- Delete all related activity logs for draft projects first
DELETE FROM activity_log 
WHERE project_id IN (
    SELECT id 
    FROM projects 
    WHERE status = 'draft'
);

-- Delete all projects with status = 'draft'
DELETE FROM projects WHERE status = 'draft';