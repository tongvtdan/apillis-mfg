-- Phase 1: Convert projects table ENUM types to VARCHAR + CHECK constraints

-- Step 1: Add new VARCHAR columns with CHECK constraints
ALTER TABLE projects 
ADD COLUMN status_new VARCHAR(20) DEFAULT 'active' 
  CHECK (status_new IN ('active', 'delayed', 'on_hold', 'cancelled', 'completed', 'archived'));

ALTER TABLE projects 
ADD COLUMN current_stage_new VARCHAR(30) DEFAULT 'inquiry_received'
  CHECK (current_stage_new IN (
    'inquiry_received', 'technical_review', 'supplier_rfq_sent', 
    'quoted', 'order_confirmed', 'procurement_planning', 
    'in_production', 'shipped_closed'
  ));

ALTER TABLE projects 
ADD COLUMN priority_new VARCHAR(20) DEFAULT 'medium'
  CHECK (priority_new IN ('low', 'medium', 'high', 'urgent'));

ALTER TABLE projects 
ADD COLUMN project_type_new VARCHAR(30) DEFAULT 'fabrication'
  CHECK (project_type_new IN ('system_build', 'fabrication', 'manufacturing'));

-- Step 2: Copy existing data to new columns
UPDATE projects SET status_new = status::text;
UPDATE projects SET current_stage_new = current_stage::text;
UPDATE projects SET priority_new = priority::text;
UPDATE projects SET project_type_new = project_type::text;

-- Step 3: Drop old columns and rename new ones
ALTER TABLE projects DROP COLUMN status;
ALTER TABLE projects RENAME COLUMN status_new TO status;

ALTER TABLE projects DROP COLUMN current_stage;
ALTER TABLE projects RENAME COLUMN current_stage_new TO current_stage;

ALTER TABLE projects DROP COLUMN priority;
ALTER TABLE projects RENAME COLUMN priority_new TO priority;

ALTER TABLE projects DROP COLUMN project_type;
ALTER TABLE projects RENAME COLUMN project_type_new TO project_type;

-- Step 4: Add NOT NULL constraints
ALTER TABLE projects ALTER COLUMN status SET NOT NULL;
ALTER TABLE projects ALTER COLUMN current_stage SET NOT NULL;
ALTER TABLE projects ALTER COLUMN priority SET NOT NULL;
ALTER TABLE projects ALTER COLUMN project_type SET NOT NULL;