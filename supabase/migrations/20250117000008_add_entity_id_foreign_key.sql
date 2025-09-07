-- =========================================
-- ADD FOREIGN KEY CONSTRAINT FOR ENTITY_ID
-- =========================================

-- Add foreign key constraint for entity_id to projects table
-- This enables proper joins in Supabase queries
ALTER TABLE approvals 
ADD CONSTRAINT approvals_entity_id_fkey 
FOREIGN KEY (entity_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Add comment for documentation
COMMENT ON CONSTRAINT approvals_entity_id_fkey ON approvals IS 'Foreign key constraint linking entity_id to projects table for proper joins';
