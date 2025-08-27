-- Add project_type enum
CREATE TYPE project_type AS ENUM ('system_build', 'fabrication', 'manufacturing');

-- Add project_type column to projects table
ALTER TABLE projects 
ADD COLUMN project_type project_type NOT NULL DEFAULT 'fabrication';

-- Update existing projects with default type
UPDATE projects SET project_type = 'fabrication' WHERE project_type IS NULL;