-- Add intake_type field to projects table
-- This field will store the intake classification (RFQ, Purchase Order, Project Idea)
-- Separate from project_type which stores business classification (fabrication, manufacturing, system_build)

-- Create enum for intake types
CREATE TYPE intake_type AS ENUM ('rfq', 'purchase_order', 'project_idea', 'direct_request');

-- Add intake_type column to projects table
ALTER TABLE projects ADD COLUMN intake_type intake_type;

-- Add intake_source column to track where the intake came from
ALTER TABLE projects ADD COLUMN intake_source VARCHAR(50) DEFAULT 'portal';

-- Add index for better query performance
CREATE INDEX idx_projects_intake_type ON projects(intake_type);
CREATE INDEX idx_projects_intake_source ON projects(intake_source);

-- Add comment for documentation
COMMENT ON COLUMN projects.intake_type IS 'Classification of how the project was submitted (RFQ, Purchase Order, Project Idea, etc.)';
COMMENT ON COLUMN projects.intake_source IS 'Source of the project intake (portal, email, api, etc.)';
