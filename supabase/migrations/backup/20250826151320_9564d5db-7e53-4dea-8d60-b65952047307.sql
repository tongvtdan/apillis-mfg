-- Step 1: Add new enum values to existing enums (must be separate from usage)
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'inquiry_received';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'technical_review'; 
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'supplier_rfq_sent';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'order_confirmed';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'procurement_planning';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'in_production';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'shipped_closed';

ALTER TYPE rfq_status ADD VALUE IF NOT EXISTS 'inquiry_received';
ALTER TYPE rfq_status ADD VALUE IF NOT EXISTS 'technical_review';
ALTER TYPE rfq_status ADD VALUE IF NOT EXISTS 'supplier_rfq_sent'; 
ALTER TYPE rfq_status ADD VALUE IF NOT EXISTS 'order_confirmed';
ALTER TYPE rfq_status ADD VALUE IF NOT EXISTS 'procurement_planning';
ALTER TYPE rfq_status ADD VALUE IF NOT EXISTS 'in_production';
ALTER TYPE rfq_status ADD VALUE IF NOT EXISTS 'shipped_closed';