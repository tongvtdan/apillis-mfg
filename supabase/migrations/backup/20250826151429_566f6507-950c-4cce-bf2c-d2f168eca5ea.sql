-- Step 2: Update existing records to use new status values
UPDATE projects SET status = 'inquiry_received'::project_status WHERE status = 'inquiry'::project_status;
UPDATE projects SET status = 'technical_review'::project_status WHERE status = 'review'::project_status;
UPDATE projects SET status = 'supplier_rfq_sent'::project_status WHERE status = 'supplier_rfq'::project_status;
UPDATE projects SET status = 'order_confirmed'::project_status WHERE status = 'won'::project_status;
UPDATE projects SET status = 'procurement_planning'::project_status WHERE status = 'procurement'::project_status;
UPDATE projects SET status = 'in_production'::project_status WHERE status = 'production'::project_status;
UPDATE projects SET status = 'shipped_closed'::project_status WHERE status = 'completed'::project_status;
UPDATE projects SET status = 'shipped_closed'::project_status WHERE status = 'lost'::project_status;
UPDATE projects SET status = 'shipped_closed'::project_status WHERE status = 'cancelled'::project_status;

-- Update existing RFQ records to use new status values  
UPDATE rfqs SET status = 'inquiry_received'::rfq_status WHERE status = 'inquiry'::rfq_status;
UPDATE rfqs SET status = 'technical_review'::rfq_status WHERE status = 'review'::rfq_status;
UPDATE rfqs SET status = 'supplier_rfq_sent'::rfq_status WHERE status = 'supplier_rfq'::rfq_status;
UPDATE rfqs SET status = 'order_confirmed'::rfq_status WHERE status = 'won'::rfq_status;
UPDATE rfqs SET status = 'procurement_planning'::rfq_status WHERE status = 'procurement'::rfq_status;
UPDATE rfqs SET status = 'in_production'::rfq_status WHERE status = 'production'::rfq_status;
UPDATE rfqs SET status = 'shipped_closed'::rfq_status WHERE status = 'completed'::rfq_status;
UPDATE rfqs SET status = 'shipped_closed'::rfq_status WHERE status = 'cancelled'::rfq_status;

-- Update default values for new records
ALTER TABLE projects ALTER COLUMN status SET DEFAULT 'inquiry_received'::project_status;
ALTER TABLE rfqs ALTER COLUMN status SET DEFAULT 'inquiry_received'::rfq_status;