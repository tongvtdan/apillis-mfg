-- Migration: Add missing columns to workflow_stages table
-- Date: 2025-01-30
-- Description: Add missing columns to align with expected schema
--              Add slug, color, exit_criteria, and responsible_roles columns

-- Add missing columns to workflow_stages table
ALTER TABLE workflow_stages 
ADD COLUMN slug VARCHAR(100),
ADD COLUMN color VARCHAR(7) DEFAULT '#6B7280',
ADD COLUMN exit_criteria TEXT,
ADD COLUMN responsible_roles TEXT[] DEFAULT '{}';

-- Add constraint for color format (hex color)
ALTER TABLE workflow_stages 
ADD CONSTRAINT workflow_stages_color_check 
CHECK (color ~* '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$');

-- Add unique constraint on (name, order_index) to prevent future duplicates
ALTER TABLE workflow_stages 
ADD CONSTRAINT workflow_stages_name_order_unique 
UNIQUE (name, order_index);

-- Create indexes for new columns
CREATE INDEX idx_workflow_stages_slug ON workflow_stages(slug);
CREATE INDEX idx_workflow_stages_color ON workflow_stages(color);
