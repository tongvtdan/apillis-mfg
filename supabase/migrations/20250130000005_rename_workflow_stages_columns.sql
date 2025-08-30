-- Migration: Rename columns in workflow_stages table
-- Date: 2025-01-30
-- Description: Rename order_index to stage_order for consistency with expected schema

-- Rename order_index column to stage_order
ALTER TABLE workflow_stages 
RENAME COLUMN order_index TO stage_order;

-- Update the unique constraint to use the new column name
ALTER TABLE workflow_stages 
DROP CONSTRAINT workflow_stages_name_order_unique;

ALTER TABLE workflow_stages 
ADD CONSTRAINT workflow_stages_name_stage_order_unique 
UNIQUE (name, stage_order);

-- Update the index name to reflect the new column name
DROP INDEX IF EXISTS idx_workflow_stages_order_index;
CREATE INDEX idx_workflow_stages_stage_order ON workflow_stages(stage_order);
