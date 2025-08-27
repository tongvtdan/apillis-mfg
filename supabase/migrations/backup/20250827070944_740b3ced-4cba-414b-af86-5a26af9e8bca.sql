-- Phase 2A: Add missing values to RFQ ENUMs and then convert to VARCHAR

-- First, extend the RFQ status enum to include the 'quoted' value
ALTER TYPE rfq_status ADD VALUE 'quoted' AFTER 'supplier_rfq_sent';

-- Update the data to use the correct value
UPDATE rfqs SET status = 'quoted' WHERE status = 'quote';

-- Now add new VARCHAR columns with CHECK constraints for RFQs
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

-- Copy existing data to new columns
UPDATE rfqs SET status_new = status::text;
UPDATE rfqs SET priority_new = priority::text;

-- Drop old columns and rename new ones
ALTER TABLE rfqs DROP COLUMN status;
ALTER TABLE rfqs RENAME COLUMN status_new TO status;

ALTER TABLE rfqs DROP COLUMN priority;
ALTER TABLE rfqs RENAME COLUMN priority_new TO priority;

-- Add NOT NULL constraints
ALTER TABLE rfqs ALTER COLUMN status SET NOT NULL;
ALTER TABLE rfqs ALTER COLUMN priority SET NOT NULL;