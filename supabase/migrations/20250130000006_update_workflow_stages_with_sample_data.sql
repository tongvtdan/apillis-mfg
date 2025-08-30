-- Migration: Update workflow_stages with sample data
-- Date: 2025-01-30
-- Description: Update existing workflow stages with complete data from sample JSON
--              Update names, slugs, colors, exit_criteria, and responsible_roles

-- Update workflow stages with sample data
-- Stage 1: Inquiry Received
UPDATE workflow_stages 
SET 
    name = 'Inquiry Received',
    slug = 'inquiry_received',
    description = 'Customer RFQ submitted and initial review completed',
    color = '#3B82F6',
    exit_criteria = 'RFQ reviewed, customer requirements understood, initial feasibility assessment completed',
    responsible_roles = ARRAY['sales', 'procurement'],
    organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE stage_order = 1;

-- Stage 2: Technical Review
UPDATE workflow_stages 
SET 
    name = 'Technical Review',
    slug = 'technical_review',
    description = 'Engineering, QA, and Production teams review technical requirements',
    color = '#F59E0B',
    exit_criteria = 'All technical reviews completed, feasibility confirmed, requirements clarified',
    responsible_roles = ARRAY['engineering', 'qa', 'production'],
    organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE stage_order = 2;

-- Stage 3: Supplier RFQ Sent (was Cost Estimation)
UPDATE workflow_stages 
SET 
    name = 'Supplier RFQ Sent',
    slug = 'supplier_rfq_sent',
    description = 'RFQs sent to qualified suppliers for component pricing and lead times',
    color = '#F97316',
    exit_criteria = 'All supplier RFQs sent, responses received and evaluated',
    responsible_roles = ARRAY['procurement'],
    organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE stage_order = 3;

-- Stage 4: Quoted (was Customer Approval)
UPDATE workflow_stages 
SET 
    name = 'Quoted',
    slug = 'quoted',
    description = 'Customer quote generated and sent based on supplier responses',
    color = '#10B981',
    exit_criteria = 'Customer quote generated, pricing approved, terms negotiated',
    responsible_roles = ARRAY['sales', 'procurement'],
    organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE stage_order = 4;

-- Stage 5: Order Confirmed (was Production Planning)
UPDATE workflow_stages 
SET 
    name = 'Order Confirmed',
    slug = 'order_confirmed',
    description = 'Customer accepted quote and order confirmed',
    color = '#6366F1',
    exit_criteria = 'Customer PO received, contract signed, production planning initiated',
    responsible_roles = ARRAY['sales', 'procurement', 'production'],
    organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE stage_order = 5;

-- Stage 6: Procurement Planning (was Manufacturing)
UPDATE workflow_stages 
SET 
    name = 'Procurement Planning',
    slug = 'procurement_planning',
    description = 'BOM finalized, purchase orders issued, material planning completed',
    color = '#8B5CF6',
    exit_criteria = 'All POs issued, materials ordered, production schedule confirmed',
    responsible_roles = ARRAY['procurement', 'production'],
    organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE stage_order = 6;

-- Stage 7: In Production (was Final Inspection)
UPDATE workflow_stages 
SET 
    name = 'In Production',
    slug = 'in_production',
    description = 'Manufacturing, assembly, and quality control in progress',
    color = '#84CC16',
    exit_criteria = 'All manufacturing completed, quality checks passed, ready for shipping',
    responsible_roles = ARRAY['production', 'qa'],
    organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE stage_order = 7;

-- Stage 8: Shipped & Closed (was Delivery)
UPDATE workflow_stages 
SET 
    name = 'Shipped & Closed',
    slug = 'shipped_closed',
    description = 'Product shipped to customer and project completed',
    color = '#6B7280',
    exit_criteria = 'Product delivered, customer acceptance confirmed, project documentation archived',
    responsible_roles = ARRAY['sales', 'production'],
    organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE stage_order = 8;
