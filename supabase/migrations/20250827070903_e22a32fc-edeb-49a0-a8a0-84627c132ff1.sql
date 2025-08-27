-- Phase 2A: Convert RFQs table ENUM types to VARCHAR + CHECK constraints

-- Step 1: Add new VARCHAR columns with CHECK constraints for RFQs
ALTER TABLE rfqs 
ADD COLUMN status_new VARCHAR(30) DEFAULT 'inquiry_received'
  CHECK (status_new IN (
    'inquiry_received', 'technical_review', 'supplier_rfq_sent', 
    'quoted', 'order_confirmed', 'procurement_planning', 
    'in_production', 'shipped_closed'
  ));

ALTER TABLE rfqs 
ADD COLUMN priority_new VARCHAR(20) DEFAULT 'medium'
  CHECK (priority_new IN ('low', 'medium', 'high', 'urgent'));

-- Step 2: Copy existing data to new columns
UPDATE rfqs SET status_new = status::text;
UPDATE rfqs SET priority_new = priority::text;

-- Step 3: Drop old columns and rename new ones
ALTER TABLE rfqs DROP COLUMN status;
ALTER TABLE rfqs RENAME COLUMN status_new TO status;

ALTER TABLE rfqs DROP COLUMN priority;
ALTER TABLE rfqs RENAME COLUMN priority_new TO priority;

-- Step 4: Add NOT NULL constraints
ALTER TABLE rfqs ALTER COLUMN status SET NOT NULL;
ALTER TABLE rfqs ALTER COLUMN priority SET NOT NULL;