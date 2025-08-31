-- Add estimated_duration_days to workflow_stages table
ALTER TABLE workflow_stages ADD COLUMN IF NOT EXISTS estimated_duration_days INTEGER DEFAULT 0;

-- Update existing records to have a default value
UPDATE workflow_stages SET estimated_duration_days = 0 WHERE estimated_duration_days IS NULL;

-- Add comment
COMMENT ON COLUMN workflow_stages.estimated_duration_days IS 'Estimated duration of this stage in days for project planning';