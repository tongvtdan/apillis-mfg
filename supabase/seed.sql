-- =========================================
-- Factory Pulse Sample Dataset
-- Comprehensive seed data for testing and development
-- =========================================

-- Clear existing data (in reverse dependency order)
TRUNCATE TABLE activity_log CASCADE;
TRUNCATE TABLE document_access_log CASCADE;
TRUNCATE TABLE document_versions CASCADE;
TRUNCATE TABLE documents CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE approval_history CASCADE;
TRUNCATE TABLE approval_attachments CASCADE;
TRUNCATE TABLE approvals CASCADE;
TRUNCATE TABLE project_sub_stage_progress CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE workflow_definition_sub_stages CASCADE;
TRUNCATE TABLE workflow_definition_stages CASCADE;
TRUNCATE TABLE workflow_definitions CASCADE;
TRUNCATE TABLE workflow_sub_stages CASCADE;
TRUNCATE TABLE workflow_stages CASCADE;
TRUNCATE TABLE contacts CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE organizations CASCADE;

-- =========================================
-- 1. ORGANIZATIONS
-- =========================================

INSERT INTO organizations (id, name, slug, description, industry, organization_type, is_active, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Acme Manufacturing Corp', 'acme-mfg', 'Leading manufacturer of precision components', 'Manufacturing', 'customer', true, NOW() - INTERVAL '1 year'),
('550e8400-e29b-41d4-a716-446655440002', 'TechCorp Solutions', 'techcorp', 'Technology solutions provider', 'Technology', 'customer', true, NOW() - INTERVAL '10 months'),
('550e8400-e29b-41d4-a716-446655440003', 'Global Industries Ltd', 'global-industries', 'Global manufacturing conglomerate', 'Manufacturing', 'customer', true, NOW() - INTERVAL '8 months'),
('550e8400-e29b-41d4-a716-446655440004', 'Precision Parts Inc', 'precision-parts', 'High-precision component supplier', 'Manufacturing', 'supplier', true, NOW() - INTERVAL '6 months'),
('550e8400-e29b-41d4-a716-446655440005', 'Factory Pulse Internal', 'factory-pulse', 'Internal Factory Pulse operations', 'Software', 'internal', true, NOW() - INTERVAL '2 years');

-- =========================================
-- 2. AUTH.USERS ENTRIES (Must be created first)
-- =========================================

-- Create auth.users entries for sample users (with encrypted passwords)
-- Note: In production, use proper password hashing
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES
-- Factory Pulse Internal Users
(
    '660e8400-e29b-41d4-a716-446655440001',
    'admin@factorypulse.com',
    crypt('Admin123!', gen_salt('bf')), -- Sample password (change in production)
    NOW(),
    NOW() - INTERVAL '2 years',
    NOW(),
    '{"display_name": "System Admin"}'::jsonb
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    'sarah.smith@factorypulse.com',
    crypt('Sarah123!', gen_salt('bf')),
    NOW(),
    NOW() - INTERVAL '1 year',
    NOW(),
    '{"display_name": "Sarah Smith"}'::jsonb
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    'mike.johnson@factorypulse.com',
    crypt('Mike123!', gen_salt('bf')),
    NOW(),
    NOW() - INTERVAL '1 year',
    NOW(),
    '{"display_name": "Mike Johnson"}'::jsonb
),
(
    '660e8400-e29b-41d4-a716-446655440004',
    'lisa.brown@factorypulse.com',
    crypt('Lisa123!', gen_salt('bf')),
    NOW(),
    NOW() - INTERVAL '1 year',
    NOW(),
    '{"display_name": "Lisa Brown"}'::jsonb
),
(
    '660e8400-e29b-41d4-a716-446655440005',
    'david.wilson@factorypulse.com',
    crypt('David123!', gen_salt('bf')),
    NOW(),
    NOW() - INTERVAL '1 year',
    NOW(),
    '{"display_name": "David Wilson"}'::jsonb
),
(
    '660e8400-e29b-41d4-a716-446655440006',
    'anna.davis@factorypulse.com',
    crypt('Anna123!', gen_salt('bf')),
    NOW(),
    NOW() - INTERVAL '1 year',
    NOW(),
    '{"display_name": "Anna Davis"}'::jsonb
),
(
    '660e8400-e29b-41d4-a716-446655440007',
    'tom.anderson@factorypulse.com',
    crypt('Tom123!', gen_salt('bf')),
    NOW(),
    NOW() - INTERVAL '1 year',
    NOW(),
    '{"display_name": "Tom Anderson"}'::jsonb
),
(
    '660e8400-e29b-41d4-a716-446655440008',
    'jane.roberts@factorypulse.com',
    crypt('Jane123!', gen_salt('bf')),
    NOW(),
    NOW() - INTERVAL '1 year',
    NOW(),
    '{"display_name": "Jane Roberts"}'::jsonb
),
-- Customer Contacts (external users)
(
    '660e8400-e29b-41d4-a716-446655440009',
    'john.customer@acme.com',
    crypt('John123!', gen_salt('bf')),
    NOW(),
    NOW() - INTERVAL '6 months',
    NOW(),
    '{"display_name": "John Customer"}'::jsonb
),
(
    '660e8400-e29b-41d4-a716-446655440010',
    'mary.buyer@techcorp.com',
    crypt('Mary123!', gen_salt('bf')),
    NOW(),
    NOW() - INTERVAL '4 months',
    NOW(),
    '{"display_name": "Mary Buyer"}'::jsonb
);

-- =========================================
-- 3. USERS TABLE (Links to auth.users.id)
-- =========================================

INSERT INTO users (id, organization_id, email, name, role, department, status, created_at) VALUES
-- Factory Pulse Internal Users
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'admin@factorypulse.com', 'System Admin', 'admin', 'IT', 'active', NOW() - INTERVAL '2 years'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'sarah.smith@factorypulse.com', 'Sarah Smith', 'management', 'Operations', 'active', NOW() - INTERVAL '1 year'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'mike.johnson@factorypulse.com', 'Mike Johnson', 'engineering', 'Engineering', 'active', NOW() - INTERVAL '1 year'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'lisa.brown@factorypulse.com', 'Lisa Brown', 'qa', 'Quality', 'active', NOW() - INTERVAL '1 year'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'david.wilson@factorypulse.com', 'David Wilson', 'procurement', 'Procurement', 'active', NOW() - INTERVAL '1 year'),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', 'anna.davis@factorypulse.com', 'Anna Davis', 'production', 'Production', 'active', NOW() - INTERVAL '1 year'),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', 'tom.anderson@factorypulse.com', 'Tom Anderson', 'sales', 'Sales', 'active', NOW() - INTERVAL '1 year'),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440005', 'jane.roberts@factorypulse.com', 'Jane Roberts', 'finance', 'Finance', 'active', NOW() - INTERVAL '1 year'),

-- Customer Contacts (as users)
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', 'john.customer@acme.com', 'John Customer', 'sales', 'Purchasing', 'active', NOW() - INTERVAL '6 months'),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'mary.buyer@techcorp.com', 'Mary Buyer', 'procurement', 'Procurement', 'active', NOW() - INTERVAL '4 months');

-- =========================================
-- 4. CONTACTS
-- =========================================

INSERT INTO contacts (id, organization_id, type, company_name, contact_name, email, phone, role, is_primary_contact, created_by) VALUES
-- Acme Manufacturing Contacts
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'Acme Manufacturing Corp', 'John Customer', 'john.customer@acme.com', '+1-555-0101', 'Purchasing Manager', true, '660e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'Acme Manufacturing Corp', 'Sarah Engineering', 'sarah.eng@acme.com', '+1-555-0102', 'Engineering Lead', false, '660e8400-e29b-41d4-a716-446655440001'),

-- TechCorp Contacts
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'customer', 'TechCorp Solutions', 'Mary Buyer', 'mary.buyer@techcorp.com', '+1-555-0201', 'Senior Buyer', true, '660e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'customer', 'TechCorp Solutions', 'Bob Tech', 'bob.tech@techcorp.com', '+1-555-0202', 'Technical Director', false, '660e8400-e29b-41d4-a716-446655440001'),

-- Supplier Contacts
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'supplier', 'Precision Parts Inc', 'Alice Supplier', 'alice@precisionparts.com', '+1-555-0301', 'Sales Manager', true, '660e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', 'supplier', 'Precision Parts Inc', 'Charlie Quality', 'charlie@precisionparts.com', '+1-555-0302', 'Quality Manager', false, '660e8400-e29b-41d4-a716-446655440001');

-- =========================================
-- 5. WORKFLOW STAGES
-- =========================================

INSERT INTO workflow_stages (id, organization_id, name, slug, description, color, stage_order, responsible_roles, estimated_duration_days, created_by) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'Inquiry Received', 'inquiry_received', 'Customer RFQ submitted and initial review completed', '#3B82F6', 1, ARRAY['sales', 'procurement']::user_role[], 20, '660e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'Technical Review', 'technical_review', 'Engineering, QA, and Production teams review technical requirements', '#F59E0B', 2, ARRAY['engineering', 'qa', 'production']::user_role[], 10, '660e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'Supplier RFQ Sent', 'supplier_rfq_sent', 'RFQs sent to qualified suppliers for component pricing and lead times', '#F97316', 3, ARRAY['procurement']::user_role[], 5, '660e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'Quoted', 'quoted', 'Customer quote generated and sent based on supplier responses', '#10B981', 4, ARRAY['sales', 'procurement']::user_role[], 5, '660e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Order Confirmed', 'order_confirmed', 'Customer accepted quote and order confirmed', '#6366F1', 5, ARRAY['sales', 'procurement', 'production']::user_role[], 5, '660e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', 'Procurement Planning', 'procurement_planning', 'BOM finalized, purchase orders issued, material planning completed', '#8B5CF6', 6, ARRAY['procurement', 'production']::user_role[], 5, '660e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', 'Production', 'production', 'Manufacturing process initiated and quality control implemented', '#84CC16', 7, ARRAY['production', 'qa']::user_role[], 4, '660e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440005', 'Completed', 'completed', 'Order fulfilled and delivered to customer', '#6B7280', 8, ARRAY['sales', 'production']::user_role[], 3, '660e8400-e29b-41d4-a716-446655440001');

-- =========================================
-- 6. WORKFLOW SUB-STAGES
-- =========================================

-- Inquiry Received Sub-stages
INSERT INTO workflow_sub_stages (id, organization_id, workflow_stage_id, name, slug, description, sub_stage_order, responsible_roles, estimated_duration_hours, is_required, requires_approval, created_by) VALUES
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440001', 'RFQ Documentation Review', 'rfq_documentation_review', 'Review and validate all customer RFQ documents and requirements', 1, ARRAY['sales', 'procurement']::user_role[], 2, true, false, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440001', 'Initial Feasibility Assessment', 'initial_feasibility_assessment', 'Quick assessment of project feasibility and resource availability', 2, ARRAY['sales', 'engineering']::user_role[], 4, true, false, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440001', 'Customer Requirements Clarification', 'customer_requirements_clarification', 'Contact customer to clarify any unclear requirements', 3, ARRAY['sales']::user_role[], 3, false, false, '660e8400-e29b-41d4-a716-446655440001'),

-- Technical Review Sub-stages
('990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440002', 'Engineering Technical Review', 'engineering_technical_review', 'Engineering team reviews technical specifications', 1, ARRAY['engineering']::user_role[], 8, true, true, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440002', 'QA Requirements Review', 'qa_requirements_review', 'QA team reviews quality requirements', 2, ARRAY['qa']::user_role[], 6, true, true, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440002', 'Production Capability Assessment', 'production_capability_assessment', 'Production team assesses manufacturing capabilities', 3, ARRAY['production']::user_role[], 4, true, true, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440002', 'Cross-Team Review Meeting', 'cross_team_review_meeting', 'Final cross-team review meeting', 4, ARRAY['engineering', 'qa', 'production']::user_role[], 2, true, true, '660e8400-e29b-41d4-a716-446655440001'),

-- Supplier RFQ Sent Sub-stages
('990e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440003', 'Supplier Identification', 'supplier_identification', 'Identify and qualify potential suppliers', 1, ARRAY['procurement']::user_role[], 4, true, false, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440003', 'RFQ Preparation', 'rfq_preparation', 'Prepare detailed RFQ documents', 2, ARRAY['procurement']::user_role[], 6, true, false, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440003', 'RFQ Distribution', 'rfq_distribution', 'Send RFQs to qualified suppliers', 3, ARRAY['procurement']::user_role[], 2, true, false, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440003', 'Supplier Response Collection', 'supplier_response_collection', 'Collect and organize supplier responses', 4, ARRAY['procurement']::user_role[], 8, true, false, '660e8400-e29b-41d4-a716-446655440001'),

-- Quoted Sub-stages
('990e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440004', 'Cost Analysis', 'cost_analysis', 'Analyze supplier quotes and calculate costs', 1, ARRAY['procurement', 'sales']::user_role[], 6, true, true, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440004', 'Quote Preparation', 'quote_preparation', 'Prepare customer quote with pricing', 2, ARRAY['sales']::user_role[], 4, true, true, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440004', 'Quote Review and Approval', 'quote_review_and_approval', 'Internal review and approval of quote', 3, ARRAY['sales', 'management']::user_role[], 2, true, true, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440004', 'Quote Submission', 'quote_submission', 'Submit quote to customer', 4, ARRAY['sales']::user_role[], 1, true, false, '660e8400-e29b-41d4-a716-446655440001'),

-- Order Confirmed Sub-stages
('990e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440005', 'Customer PO Review', 'customer_po_review', 'Review customer purchase order', 1, ARRAY['sales', 'procurement']::user_role[], 4, true, true, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440005', 'Contract Finalization', 'contract_finalization', 'Finalize contract terms', 2, ARRAY['sales', 'management']::user_role[], 8, true, true, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440005', 'Production Planning Initiation', 'production_planning_initiation', 'Initiate production planning', 3, ARRAY['production', 'sales']::user_role[], 6, true, false, '660e8400-e29b-41d4-a716-446655440001'),

-- Procurement Planning Sub-stages
('990e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440006', 'BOM Finalization', 'bom_finalization', 'Finalize Bill of Materials', 1, ARRAY['engineering', 'procurement']::user_role[], 8, true, true, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440006', 'Purchase Order Issuance', 'purchase_order_issuance', 'Issue purchase orders to suppliers', 2, ARRAY['procurement']::user_role[], 6, true, false, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440006', 'Material Planning', 'material_planning', 'Plan material requirements', 3, ARRAY['procurement', 'production']::user_role[], 4, true, false, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440006', 'Production Schedule Confirmation', 'production_schedule_confirmation', 'Confirm production schedule', 4, ARRAY['production']::user_role[], 4, true, true, '660e8400-e29b-41d4-a716-446655440001'),

-- Production Sub-stages
('990e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440007', 'Manufacturing Setup', 'manufacturing_setup', 'Set up manufacturing equipment', 1, ARRAY['production']::user_role[], 8, true, false, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440007', 'Assembly Process', 'assembly_process', 'Execute assembly process', 2, ARRAY['production']::user_role[], 16, true, false, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440007', 'Quality Control Testing', 'quality_control_testing', 'Perform quality control tests', 3, ARRAY['qa', 'production']::user_role[], 8, true, true, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440007', 'Final Assembly and Packaging', 'final_assembly_and_packaging', 'Complete final assembly and packaging', 4, ARRAY['production']::user_role[], 4, true, false, '660e8400-e29b-41d4-a716-446655440001'),

-- Completed Sub-stages
('990e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440008', 'Shipping Preparation', 'shipping_preparation', 'Prepare shipping documentation', 1, ARRAY['sales', 'production']::user_role[], 4, true, false, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440008', 'Product Delivery', 'product_delivery', 'Deliver product to customer', 2, ARRAY['sales']::user_role[], 2, true, false, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440008', 'Project Documentation', 'project_documentation', 'Complete project documentation', 3, ARRAY['sales', 'production']::user_role[], 4, true, false, '660e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440008', 'Project Closure', 'project_closure', 'Final project closure', 4, ARRAY['sales']::user_role[], 2, true, true, '660e8400-e29b-41d4-a716-446655440001');

-- =========================================
-- 7. WORKFLOW DEFINITIONS (Default Template)
-- =========================================

INSERT INTO workflow_definitions (id, organization_id, name, version, description, is_active, created_by) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'Default Manufacturing Workflow', 1, 'Standard workflow for manufacturing projects', true, '660e8400-e29b-41d4-a716-446655440001');

-- Include all stages in the default definition
INSERT INTO workflow_definition_stages (workflow_definition_id, workflow_stage_id, is_included) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', true),
('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440002', true),
('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440003', true),
('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440004', true),
('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440005', true),
('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440006', true),
('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440007', true),
('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440008', true);

-- Include all sub-stages in the default definition
INSERT INTO workflow_definition_sub_stages (workflow_definition_id, workflow_sub_stage_id, is_included) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440003', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440004', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440005', true),
('aa0e8400-e29b-41d4-a716-446655440006', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440007', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440008', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440009', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440010', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440011', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440012', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440013', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440014', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440015', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440016', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440017', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440018', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440019', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440020', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440021', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440022', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440023', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440024', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440025', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440026', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440027', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440028', true),
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440029', true);

-- =========================================
-- 8. SAMPLE PROJECTS
-- =========================================

INSERT INTO projects (id, organization_id, project_id, title, description, customer_organization_id, point_of_contacts, current_stage_id, workflow_definition_id, status, priority_level, estimated_delivery_date, requested_due_date, created_by, assigned_to, estimated_value) VALUES
-- Active projects in different stages
('bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'P-2501001', 'High-Precision Gear Assembly', 'Manufacturing of custom high-precision gear assembly for robotics application', '550e8400-e29b-41d4-a716-446655440001', ARRAY['770e8400-e29b-41d4-a716-446655440001']::UUID[], '880e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440001', 'inquiry', 'high', NOW() + INTERVAL '45 days', NOW() + INTERVAL '60 days', '660e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440007', 125000.00),

('bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'P-2501002', 'Medical Device Components', 'Precision machined components for medical imaging equipment', '550e8400-e29b-41d4-a716-446655440002', ARRAY['770e8400-e29b-41d4-a716-446655440003']::UUID[], '880e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440001', 'quoting', 'urgent', NOW() + INTERVAL '30 days', NOW() + INTERVAL '45 days', '660e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440003', 89000.00),

('bb0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'P-2501003', 'Automotive Sensor Housing', 'Injection molded sensor housings for electric vehicles', '550e8400-e29b-41d4-a716-446655440003', ARRAY['770e8400-e29b-41d4-a716-446655440004']::UUID[], '880e8400-e29b-41d4-a716-446655440006', 'aa0e8400-e29b-41d4-a716-446655440001', 'procurement', 'normal', NOW() + INTERVAL '25 days', NOW() + INTERVAL '40 days', '660e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440005', 67000.00),

('bb0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'P-2501004', 'Aerospace Fastener Kit', 'Certified aerospace fasteners with full traceability', '550e8400-e29b-41d4-a716-446655440001', ARRAY['770e8400-e29b-41d4-a716-446655440002']::UUID[], '880e8400-e29b-41d4-a716-446655440007', 'aa0e8400-e29b-41d4-a716-446655440001', 'production', 'high', NOW() + INTERVAL '20 days', NOW() + INTERVAL '35 days', '660e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440006', 156000.00),

('bb0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'P-2501005', 'Industrial Pump Components', 'Heavy-duty pump components for oil & gas industry', '550e8400-e29b-41d4-a716-446655440003', ARRAY['770e8400-e29b-41d4-a716-446655440003']::UUID[], '880e8400-e29b-41d4-a716-446655440008', 'aa0e8400-e29b-41d4-a716-446655440001', 'completed', 'normal', NOW() - INTERVAL '5 days', NOW() - INTERVAL '10 days', '660e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440006', 98000.00),

('bb0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', 'P-2501006', 'Electronic Enclosure System', 'Shielded electronic enclosures for military applications', '550e8400-e29b-41d4-a716-446655440002', ARRAY['770e8400-e29b-41d4-a716-446655440004']::UUID[], '880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 'draft', 'low', NOW() + INTERVAL '60 days', NOW() + INTERVAL '75 days', '660e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440007', 134000.00);

-- =========================================
-- 9. PROJECT SUB-STAGE PROGRESS
-- =========================================

-- Project 1 (High-Precision Gear Assembly) - Currently in Technical Review
INSERT INTO project_sub_stage_progress (id, organization_id, project_id, workflow_stage_id, sub_stage_id, status, assigned_to, started_at, due_at, completed_at, notes) VALUES
-- Inquiry Received (completed)
('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'completed', '660e8400-e29b-41d4-a716-446655440007', NOW() - INTERVAL '15 days', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days', 'RFQ documents reviewed and validated'),
('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', 'completed', '660e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '14 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', 'Feasibility assessment completed - project viable'),
('cc0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440003', 'skipped', NULL, NULL, NULL, NULL, 'Requirements were clear - clarification not needed'),

-- Technical Review (in progress)
('cc0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440004', 'in_progress', '660e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '3 days', NOW() + INTERVAL '5 days', NULL, 'Engineering review in progress'),
('cc0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440005', 'pending', '660e8400-e29b-41d4-a716-446655440004', NULL, NOW() + INTERVAL '7 days', NULL, 'Waiting for engineering review completion'),
('cc0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440006', 'pending', '660e8400-e29b-41d4-a716-446655440006', NULL, NOW() + INTERVAL '9 days', NULL, 'Pending engineering review'),
('cc0e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440007', 'pending', NULL, NULL, NOW() + INTERVAL '11 days', NULL, 'Cross-team review meeting scheduled');

-- Project 2 (Medical Device Components) - Currently in Quoted stage
INSERT INTO project_sub_stage_progress (id, organization_id, project_id, workflow_stage_id, sub_stage_id, status, assigned_to, started_at, due_at, completed_at, notes) VALUES
-- Inquiry Received (completed)
('cc0e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'completed', '660e8400-e29b-41d4-a716-446655440007', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days', 'Medical device RFQ reviewed'),
('cc0e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', 'completed', '660e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '19 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', 'Medical device feasibility confirmed'),

-- Technical Review (completed)
('cc0e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440004', 'completed', '660e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '14 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', 'Engineering review completed'),
('cc0e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440005', 'completed', '660e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '13 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', 'QA requirements reviewed'),
('cc0e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440006', 'completed', '660e8400-e29b-41d4-a716-446655440006', NOW() - INTERVAL '12 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', 'Production capability confirmed'),
('cc0e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440007', 'completed', NULL, NOW() - INTERVAL '11 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days', 'Cross-team review completed'),

-- Supplier RFQ Sent (completed)
('cc0e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440008', 'completed', '660e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '8 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 'Suppliers identified'),
('cc0e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440009', 'completed', '660e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'RFQs prepared'),
('cc0e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440010', 'completed', '660e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 'RFQs distributed'),
('cc0e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440011', 'completed', '660e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'Supplier responses collected'),

-- Quoted (in progress)
('cc0e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440012', 'completed', '660e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '2 days', NOW() + INTERVAL '4 days', NOW() - INTERVAL '1 day', 'Cost analysis completed'),
('cc0e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440013', 'in_progress', '660e8400-e29b-41d4-a716-446655440007', NOW() - INTERVAL '1 day', NOW() + INTERVAL '3 days', NULL, 'Quote preparation in progress'),
('cc0e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440014', 'pending', '660e8400-e29b-41d4-a716-446655440002', NULL, NOW() + INTERVAL '5 days', NULL, 'Pending quote preparation'),
('cc0e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440015', 'pending', '660e8400-e29b-41d4-a716-446655440007', NULL, NOW() + INTERVAL '6 days', NULL, 'Waiting for internal approval');

-- =========================================
-- 10. APPROVALS
-- =========================================

INSERT INTO approvals (id, organization_id, approval_type, title, description, entity_type, entity_id, requested_by, current_approver_id, status, priority, due_date, sla_due_at, request_reason) VALUES
-- Technical Review Approval for Project 1
('dd0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'technical_review', 'Technical Review Approval - High-Precision Gear Assembly', 'Engineering review approval for precision gear manufacturing', 'project_sub_stage', 'cc0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 'in_review', 'high', NOW() + INTERVAL '2 days', NOW() + INTERVAL '48 hours', 'Technical specifications require engineering approval'),

-- Quote Approval for Project 2
('dd0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'quote_approval', 'Quote Approval - Medical Device Components', 'Customer quote approval for medical device components', 'project_sub_stage', 'cc0e8400-e29b-41d4-a716-446655440018', '660e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 'pending', 'normal', NOW() + INTERVAL '3 days', NOW() + INTERVAL '72 hours', 'Quote value exceeds normal approval threshold'),

-- Completed approval
('dd0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'quality_review', 'Quality Review Approval - Industrial Pump Components', 'Final quality review for completed pump components', 'project', 'bb0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', 'approved', 'normal', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days', 'Quality inspection completed successfully');

-- =========================================
-- 11. DOCUMENTS
-- =========================================

INSERT INTO documents (id, organization_id, project_id, title, description, file_name, file_path, category, version, uploaded_by, checksum) VALUES
-- RFQ Documents for Project 1
('ee0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440001', 'High-Precision Gear RFQ', 'Customer RFQ for precision gear assembly', 'gear-rfq.pdf', '/org/factory-pulse/projects/P-2501001/rfq/gear-rfq.pdf', 'rfq', 1, '660e8400-e29b-41d4-a716-446655440007', 'abc123def456'),

-- Technical Drawings for Project 1
('ee0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440001', 'Gear Assembly Drawings', 'Technical drawings for gear assembly', 'gear-drawings.dwg', '/org/factory-pulse/projects/P-2501001/drawing/gear-drawings.dwg', 'drawing', 1, '660e8400-e29b-41d4-a716-446655440003', 'def456ghi789'),

-- Medical Device Specifications for Project 2
('ee0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', 'Medical Device Specifications', 'Technical specifications for medical imaging components', 'medical-specs.pdf', '/org/factory-pulse/projects/P-2501002/design_spec/medical-specs.pdf', 'design_spec', 1, '660e8400-e29b-41d4-a716-446655440007', 'ghi789jkl012'),

-- Quote Document for Project 2
('ee0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', 'Medical Components Quote', 'Customer quote for medical device components', 'medical-quote.pdf', '/org/factory-pulse/projects/P-2501002/customer_quote/medical-quote.pdf', 'customer_quote', 1, '660e8400-e29b-41d4-a716-446655440007', 'jkl012mno345');

-- =========================================
-- 12. NOTIFICATIONS
-- =========================================

INSERT INTO notifications (id, organization_id, user_id, type, title, message, priority, action_url, is_read) VALUES
-- Engineering notification for Project 1
('ff0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', 'workflow', 'Technical Review Due', 'Technical review for High-Precision Gear Assembly is due in 2 days', 'high', '/projects/P-2501001', false),

-- QA notification for Project 1
('ff0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440004', 'approval', 'Approval Request', 'New technical review approval request for gear assembly project', 'normal', '/approvals/dd0e8400-e29b-41d4-a716-446655440001', false),

-- Sales notification for Project 2
('ff0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440007', 'workflow', 'Quote Ready for Review', 'Quote for Medical Device Components is ready for internal review', 'normal', '/projects/P-2501002', true),

-- Management notification
('ff0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'approval', 'Quote Approval Required', 'Quote approval needed for medical device components project', 'high', '/approvals/dd0e8400-e29b-41d4-a716-446655440002', false);

-- =========================================
-- 13. ACTIVITY LOG ENTRIES
-- =========================================

INSERT INTO activity_log (organization_id, user_id, project_id, entity_type, entity_id, action, description, old_values, new_values) VALUES
-- Project creation activities
('550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440001', 'projects', 'bb0e8400-e29b-41d4-a716-446655440001', 'create', 'Created new project: High-Precision Gear Assembly', NULL, '{"title": "High-Precision Gear Assembly", "status": "inquiry"}'),

-- Progress updates
('550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440001', 'project_sub_stage_progress', 'cc0e8400-e29b-41d4-a716-446655440004', 'update', 'Started engineering technical review', '{"status": "pending"}', '{"status": "in_progress"}'),

-- Approval activities
('550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440001', 'approvals', 'dd0e8400-e29b-41d4-a716-446655440001', 'create', 'Created technical review approval request', NULL, '{"approval_type": "technical_review", "status": "in_review"}'),

-- Document activities
('550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440001', 'documents', 'ee0e8400-e29b-41d4-a716-446655440001', 'create', 'Uploaded RFQ document', NULL, '{"title": "High-Precision Gear RFQ", "category": "rfq"}');

-- =========================================
-- 14. MESSAGES
-- =========================================

INSERT INTO messages (id, organization_id, project_id, sender_id, recipient_id, subject, content, is_read, priority) VALUES
-- Internal communication about Project 1
('gg0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440007', 'Technical Review Update', 'Engineering review is progressing well. Should be completed by end of week.', true, 'normal'),

-- Customer communication
('gg0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440007', NULL, 'Quote Ready for Review', 'Medical device components quote has been prepared and is ready for your review.', false, 'normal'),

-- Quality team communication
('gg0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440006', 'Quality Inspection Results', 'Aerospace fastener quality inspection completed. All tests passed.', true, 'high');

-- =========================================
-- REFRESH MATERIALIZED VIEWS
-- =========================================

SELECT refresh_dashboard_materialized_views();

-- =========================================
-- SEED COMPLETE
-- =========================================

DO $$
BEGIN
    RAISE NOTICE 'Factory Pulse sample dataset seeded successfully!';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '  - 5 organizations';
    RAISE NOTICE '  - 10 users';
    RAISE NOTICE '  - 6 contacts';
    RAISE NOTICE '  - 8 workflow stages';
    RAISE NOTICE '  - 29 workflow sub-stages';
    RAISE NOTICE '  - 1 workflow definition';
    RAISE NOTICE '  - 6 sample projects';
    RAISE NOTICE '  - 21 project sub-stage progress entries';
    RAISE NOTICE '  - 3 approvals';
    RAISE NOTICE '  - 4 documents';
    RAISE NOTICE '  - 4 notifications';
    RAISE NOTICE '  - 4 activity log entries';
    RAISE NOTICE '  - 3 messages';
    RAISE NOTICE '  - Materialized views refreshed';
END $$;
