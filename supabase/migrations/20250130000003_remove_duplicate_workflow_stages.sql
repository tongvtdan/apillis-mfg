-- Migration: Remove duplicate workflow stages
-- Date: 2025-01-30
-- Description: Remove duplicate workflow stages that were created at 15:46:33
--              Keep the newer records created at 15:55:11

-- First, let's identify the duplicates to be removed
-- We'll remove the older records (created at 15:46:33) and keep the newer ones (15:55:11)

-- Delete duplicate workflow stages (older versions)
DELETE FROM workflow_stages 
WHERE created_at = '2025-08-30 15:46:33.37807+00';

-- Verify the cleanup by checking remaining records
-- This should leave us with exactly 8 workflow stages
-- SELECT COUNT(*) FROM workflow_stages; -- Should return 8
-- SELECT name, order_index FROM workflow_stages ORDER BY order_index;
