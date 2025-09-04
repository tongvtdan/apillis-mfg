-- Migration: Add missing fields to projects table for enhanced intake form
-- Date: 2025-09-04
-- Description: Add volume, target_price_per_unit, project_reference, and desired_delivery_date fields

-- Add volume field for multi-tier volumes (JSONB)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS volume JSONB;

-- Add target price per unit field
ALTER TABLE projects ADD COLUMN IF NOT EXISTS target_price_per_unit NUMERIC(15,2);

-- Add project reference field for PO types
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_reference TEXT;

-- Add desired delivery date field (separate from estimated_delivery_date)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS desired_delivery_date DATE;

-- Add comments for documentation
COMMENT ON COLUMN projects.volume IS 'Multi-tier volume data with quantity, unit, and frequency (JSONB format)';
COMMENT ON COLUMN projects.target_price_per_unit IS 'Target price per unit in USD';
COMMENT ON COLUMN projects.project_reference IS 'External project reference (e.g., PO-2025-TECHNOVA-001)';
COMMENT ON COLUMN projects.desired_delivery_date IS 'Customer desired delivery date (separate from estimated_delivery_date)';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_volume ON projects USING GIN (volume);
CREATE INDEX IF NOT EXISTS idx_projects_target_price ON projects (target_price_per_unit);
CREATE INDEX IF NOT EXISTS idx_projects_project_reference ON projects (project_reference);
CREATE INDEX IF NOT EXISTS idx_projects_desired_delivery_date ON projects (desired_delivery_date);
