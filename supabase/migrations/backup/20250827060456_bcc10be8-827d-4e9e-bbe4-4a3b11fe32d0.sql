-- First, let's check current structure and update projects table according to specification

-- Add the new columns first
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS current_stage project_status DEFAULT 'inquiry_received',
ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS actual_completion TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Update current_stage from existing status column
UPDATE public.projects SET current_stage = status;

-- Create new status enum for project lifecycle status
CREATE TYPE IF NOT EXISTS project_lifecycle_status AS ENUM (
  'active',
  'delayed', 
  'on_hold',
  'cancelled',
  'completed',
  'archived'
);

-- Add new status column with default active
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS new_status project_lifecycle_status DEFAULT 'active';

-- Set status based on current stage
UPDATE public.projects 
SET new_status = CASE 
  WHEN current_stage = 'shipped_closed' THEN 'completed'::project_lifecycle_status
  ELSE 'active'::project_lifecycle_status
END;

-- Drop the old status column and rename new_status to status
ALTER TABLE public.projects DROP COLUMN IF EXISTS status;
ALTER TABLE public.projects RENAME COLUMN new_status TO status;

-- Rename the enum to project_stage for clarity
ALTER TYPE project_status RENAME TO project_stage;

-- Update column type reference
ALTER TABLE public.projects ALTER COLUMN current_stage TYPE project_stage;