-- =========================================
-- Add 'in_progress' to project_status enum
-- Migration: Update project status enum to include in_progress
-- Date: 2025-01-17
-- =========================================

-- Add 'in_progress' to the project_status enum
ALTER TYPE project_status ADD VALUE 'in_progress' AFTER 'inquiry';

-- Update any existing projects with 'inquiry' status to 'in_progress' if they have a current_stage_id
-- This makes semantic sense as projects with a stage are actively being worked on
UPDATE projects 
SET status = 'in_progress' 
WHERE status = 'inquiry' 
  AND current_stage_id IS NOT NULL 
  AND current_stage_id != '880e8400-e29b-41d4-a716-446655440001'; -- Don't update if still in inquiry_received stage

-- Projects that are still in the inquiry_received stage should remain as 'inquiry'
-- Projects that have moved beyond inquiry_received should be 'in_progress'
