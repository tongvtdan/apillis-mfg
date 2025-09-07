-- =========================================
-- Apillis Sample Data Migration
-- Comprehensive sample dataset for testing and development
-- =========================================

-- =========================================
-- 1. AUTH.USERS ENTRIES (Must be created first)
-- =========================================

-- Create auth.users entries for sample users (with encrypted passwords)
-- Note: In production, use proper password hashing
-- Default password for all users: Password123!
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES
-- American Executives (CEO, CFO)
('660e8400-e29b-41d4-a716-446655440001', 'john.smith@apillis.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '3 years', NOW(), '{"display_name": "John Smith", "country": "USA"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440002', 'mary.johnson@apillis.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '2.5 years', NOW(), '{"display_name": "Mary Johnson", "country": "USA"}'::jsonb),

-- Vietnamese Management Team
('660e8400-e29b-41d4-a716-446655440003', 'nguyen.van.a@apillis.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '2 years', NOW(), '{"display_name": "Nguyen Van A", "country": "Vietnam"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440004', 'tran.thi.b@apillis.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '1.8 years', NOW(), '{"display_name": "Tran Thi B", "country": "Vietnam"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440005', 'le.van.c@apillis.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '1.5 years', NOW(), '{"display_name": "Le Van C", "country": "Vietnam"}'::jsonb),

-- Vietnamese Sales & Procurement Team
('660e8400-e29b-41d4-a716-446655440006', 'pham.thi.d@apillis.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '1.2 years', NOW(), '{"display_name": "Pham Thi D", "country": "Vietnam"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440007', 'hoang.van.e@apillis.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '1 year', NOW(), '{"display_name": "Hoang Van E", "country": "Vietnam"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440008', 'vu.thi.f@apillis.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '10 months', NOW(), '{"display_name": "Vu Thi F", "country": "Vietnam"}'::jsonb),

-- Vietnamese Engineering & QA Team
('660e8400-e29b-41d4-a716-446655440009', 'dinh.van.g@apillis.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '8 months', NOW(), '{"display_name": "Dinh Van G", "country": "Vietnam"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440010', 'bui.thi.h@apillis.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '6 months', NOW(), '{"display_name": "Bui Thi H", "country": "Vietnam"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440011', 'ngo.van.i@apillis.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '4 months', NOW(), '{"display_name": "Ngo Van I", "country": "Vietnam"}'::jsonb),

-- Vietnamese Production Team
('660e8400-e29b-41d4-a716-446655440012', 'do.thi.j@apillis.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '3 months', NOW(), '{"display_name": "Do Thi J", "country": "Vietnam"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440013', 'ly.van.k@apillis.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '2 months', NOW(), '{"display_name": "Ly Van K", "country": "Vietnam"}'::jsonb),

-- Customer Contacts (external users)
('660e8400-e29b-41d4-a716-446655440014', 'john.customer@acme.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '6 months', NOW(), '{"display_name": "John Customer", "country": "USA"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440015', 'mary.buyer@techcorp.com', crypt('Password123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '4 months', NOW(), '{"display_name": "Mary Buyer", "country": "USA"}'::jsonb);

-- =========================================
-- 2. ORGANIZATIONS
-- =========================================

INSERT INTO organizations (id, name, slug, description, industry, organization_type, is_active, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Apillis', 'apillis', 'Leading manufacturing technology company', 'Technology', 'internal', true, NOW() - INTERVAL '2 years'),
('550e8400-e29b-41d4-a716-446655440001', 'Acme Manufacturing Corp', 'acme-mfg', 'Leading manufacturer of precision components', 'Manufacturing', 'customer', true, NOW() - INTERVAL '1 year'),
('550e8400-e29b-41d4-a716-446655440002', 'TechCorp Solutions', 'techcorp', 'Technology solutions provider', 'Technology', 'customer', true, NOW() - INTERVAL '10 months'),
('550e8400-e29b-41d4-a716-446655440003', 'Global Industries Ltd', 'global-industries', 'Global manufacturing conglomerate', 'Manufacturing', 'customer', true, NOW() - INTERVAL '8 months'),
('550e8400-e29b-41d4-a716-446655440004', 'Precision Parts Inc', 'precision-parts', 'High-precision component supplier', 'Manufacturing', 'supplier', true, NOW() - INTERVAL '6 months');

-- =========================================
-- 3. USERS TABLE (Links to auth.users.id)
-- =========================================

INSERT INTO users (id, organization_id, email, name, role, department, status, created_at, phone, direct_manager_id, preferences) VALUES
-- Apillis Internal Users
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'john.smith@apillis.com', 'John Smith', 'admin', 'Executive', 'active', NOW() - INTERVAL '3 years', '+1-555-0101', NULL, '{"timezone": "America/New_York", "language": "en", "theme": "light"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'mary.johnson@apillis.com', 'Mary Johnson', 'management', 'Finance', 'active', NOW() - INTERVAL '2.5 years', '+1-555-0102', NULL, '{"timezone": "America/New_York", "language": "en", "theme": "light"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'nguyen.van.a@apillis.com', 'Nguyen Van A', 'management', 'Operations', 'active', NOW() - INTERVAL '2 years', '+84-123-456-789', '660e8400-e29b-41d4-a716-446655440001', '{"timezone": "Asia/Ho_Chi_Minh", "language": "vi", "theme": "light"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'tran.thi.b@apillis.com', 'Tran Thi B', 'management', 'Quality', 'active', NOW() - INTERVAL '1.8 years', '+84-987-654-321', '660e8400-e29b-41d4-a716-446655440001', '{"timezone": "Asia/Ho_Chi_Minh", "language": "vi", "theme": "light"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'le.van.c@apillis.com', 'Le Van C', 'management', 'Engineering', 'active', NOW() - INTERVAL '1.5 years', '+84-555-123-456', '660e8400-e29b-41d4-a716-446655440001', '{"timezone": "Asia/Ho_Chi_Minh", "language": "vi", "theme": "light"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'pham.thi.d@apillis.com', 'Pham Thi D', 'sales', 'Sales', 'active', NOW() - INTERVAL '1.2 years', '+84-555-987-654', '660e8400-e29b-41d4-a716-446655440003', '{"timezone": "Asia/Ho_Chi_Minh", "language": "vi", "theme": "light"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', 'hoang.van.e@apillis.com', 'Hoang Van E', 'procurement', 'Procurement', 'active', NOW() - INTERVAL '1 year', '+84-555-456-789', '660e8400-e29b-41d4-a716-446655440003', '{"timezone": "Asia/Ho_Chi_Minh", "language": "vi", "theme": "light"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'vu.thi.f@apillis.com', 'Vu Thi F', 'sales', 'Sales', 'active', NOW() - INTERVAL '10 months', '+84-555-321-098', '660e8400-e29b-41d4-a716-446655440003', '{"timezone": "Asia/Ho_Chi_Minh", "language": "vi", "theme": "light"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', 'dinh.van.g@apillis.com', 'Dinh Van G', 'engineering', 'Engineering', 'active', NOW() - INTERVAL '8 months', '+84-555-654-321', '660e8400-e29b-41d4-a716-446655440005', '{"timezone": "Asia/Ho_Chi_Minh", "language": "vi", "theme": "light"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'bui.thi.h@apillis.com', 'Bui Thi H', 'qa', 'Quality', 'active', NOW() - INTERVAL '6 months', '+84-555-789-012', '660e8400-e29b-41d4-a716-446655440004', '{"timezone": "Asia/Ho_Chi_Minh", "language": "vi", "theme": "light"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'ngo.van.i@apillis.com', 'Ngo Van I', 'qa', 'Quality', 'active', NOW() - INTERVAL '4 months', '+84-555-098-765', '660e8400-e29b-41d4-a716-446655440004', '{"timezone": "Asia/Ho_Chi_Minh", "language": "vi", "theme": "light"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'do.thi.j@apillis.com', 'Do Thi J', 'production', 'Production', 'active', NOW() - INTERVAL '3 months', '+84-555-135-792', '660e8400-e29b-41d4-a716-446655440003', '{"timezone": "Asia/Ho_Chi_Minh", "language": "vi", "theme": "light"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'ly.van.k@apillis.com', 'Ly Van K', 'production', 'Production', 'active', NOW() - INTERVAL '2 months', '+84-555-246-813', '660e8400-e29b-41d4-a716-446655440003', '{"timezone": "Asia/Ho_Chi_Minh", "language": "vi", "theme": "light"}'::jsonb),

-- Customer Contacts (as users)
('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'john.customer@acme.com', 'John Customer', 'sales', 'Purchasing', 'active', NOW() - INTERVAL '6 months', '+1-555-0103', NULL, '{"timezone": "America/New_York", "language": "en", "theme": "light"}'::jsonb),
('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440002', 'mary.buyer@techcorp.com', 'Mary Buyer', 'procurement', 'Procurement', 'active', NOW() - INTERVAL '4 months', '+1-555-0203', NULL, '{"timezone": "America/New_York", "language": "en", "theme": "light"}'::jsonb);

-- Update direct_reports arrays for management hierarchy
UPDATE users SET direct_reports = ARRAY['660e8400-e29b-41d4-a716-446655440003'::uuid, '660e8400-e29b-41d4-a716-446655440004'::uuid, '660e8400-e29b-41d4-a716-446655440005'::uuid] WHERE id = '660e8400-e29b-41d4-a716-446655440001';
UPDATE users SET direct_reports = ARRAY['660e8400-e29b-41d4-a716-446655440006'::uuid, '660e8400-e29b-41d4-a716-446655440007'::uuid, '660e8400-e29b-41d4-a716-446655440008'::uuid, '660e8400-e29b-41d4-a716-446655440012'::uuid, '660e8400-e29b-41d4-a716-446655440013'::uuid] WHERE id = '660e8400-e29b-41d4-a716-446655440003';
UPDATE users SET direct_reports = ARRAY['660e8400-e29b-41d4-a716-446655440010'::uuid, '660e8400-e29b-41d4-a716-446655440011'::uuid] WHERE id = '660e8400-e29b-41d4-a716-446655440004';
UPDATE users SET direct_reports = ARRAY['660e8400-e29b-41d4-a716-446655440009'::uuid] WHERE id = '660e8400-e29b-41d4-a716-446655440005';

-- =========================================
-- 4. CONTACTS
-- =========================================

INSERT INTO contacts (id, organization_id, type, company_name, contact_name, email, phone, role, is_primary_contact) VALUES
-- Acme Manufacturing Contacts
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'Acme Manufacturing Corp', 'John Customer', 'john.customer@acme.com', '+1-555-0101', 'Purchasing Manager', true),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'Acme Manufacturing Corp', 'Sarah Engineering', 'sarah.eng@acme.com', '+1-555-0102', 'Engineering Lead', false),

-- TechCorp Contacts
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'customer', 'TechCorp Solutions', 'Mary Buyer', 'mary.buyer@techcorp.com', '+1-555-0201', 'Senior Buyer', true),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'customer', 'TechCorp Solutions', 'Bob Tech', 'bob.tech@techcorp.com', '+1-555-0202', 'Technical Director', false),

-- Supplier Contacts
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'supplier', 'Precision Parts Inc', 'Alice Supplier', 'alice@precisionparts.com', '+1-555-0301', 'Sales Manager', true),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', 'supplier', 'Precision Parts Inc', 'Charlie Quality', 'charlie@precisionparts.com', '+1-555-0302', 'Quality Manager', false);

-- =========================================
-- 5. WORKFLOW STAGES
-- =========================================

INSERT INTO workflow_stages (id, organization_id, name, slug, description, color, stage_order, responsible_roles, estimated_duration_days) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Inquiry Received', 'inquiry_received', 'Customer RFQ submitted and initial review completed', '#3B82F6', 1, ARRAY['sales', 'procurement']::user_role[], 2),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Technical Review', 'technical_review', 'Engineering, QA, and Production teams review technical requirements', '#F59E0B', 2, ARRAY['engineering', 'qa', 'production']::user_role[], 3),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Supplier RFQ Sent', 'supplier_rfq_sent', 'RFQs sent to qualified suppliers for component pricing and lead times', '#F97316', 3, ARRAY['procurement']::user_role[], 1),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Quoted', 'quoted', 'Customer quote generated and sent based on supplier responses', '#10B981', 4, ARRAY['sales', 'procurement']::user_role[], 2),
('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Order Confirmed', 'order_confirmed', 'Customer accepted quote and order confirmed', '#6366F1', 5, ARRAY['sales', 'procurement', 'production']::user_role[], 1),
('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Procurement Planning', 'procurement_planning', 'BOM finalized, purchase orders issued, material planning completed', '#8B5CF6', 6, ARRAY['procurement', 'production']::user_role[], 2),
('880e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', 'Production', 'production', 'Manufacturing process initiated and quality control implemented', '#84CC16', 7, ARRAY['production', 'qa']::user_role[], 14),
('880e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'Completed', 'completed', 'Order fulfilled and delivered to customer', '#6B7280', 8, ARRAY['sales', 'production']::user_role[], 1);

-- =========================================
-- 6. SAMPLE PROJECTS
-- =========================================

INSERT INTO projects (id, organization_id, project_id, title, description, customer_organization_id, point_of_contacts, status, priority_level, created_by, estimated_delivery_date, project_type) VALUES
('220e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'P-25082001', 'Acme Manufacturing - Precision Components', 'High-precision mechanical components manufacturing project', '550e8400-e29b-41d4-a716-446655440001', ARRAY['770e8400-e29b-41d4-a716-446655440001'::uuid], 'inquiry', 'high', '660e8400-e29b-41d4-a716-446655440006', NOW() + INTERVAL '60 days', 'manufacturing'),
('220e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'P-25082002', 'TechCorp - System Integration', 'Complete system integration for TechCorp Solutions', '550e8400-e29b-41d4-a716-446655440002', ARRAY['770e8400-e29b-41d4-a716-446655440003'::uuid], 'inquiry', 'normal', '660e8400-e29b-41d4-a716-446655440008', NOW() + INTERVAL '45 days', 'system_build'),
('220e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'P-25082003', 'Global Industries - Automation Line', 'High-volume manufacturing line for industrial automation', '550e8400-e29b-41d4-a716-446655440003', ARRAY[]::uuid[], 'inquiry', 'urgent', '660e8400-e29b-41d4-a716-446655440006', NOW() + INTERVAL '90 days', 'manufacturing');

-- Assign projects to users
UPDATE projects SET assigned_to = '660e8400-e29b-41d4-a716-446655440006' WHERE id = '220e8400-e29b-41d4-a716-446655440001';
UPDATE projects SET assigned_to = '660e8400-e29b-41d4-a716-446655440008' WHERE id = '220e8400-e29b-41d4-a716-446655440002';
UPDATE projects SET assigned_to = '660e8400-e29b-41d4-a716-446655440006' WHERE id = '220e8400-e29b-41d4-a716-446655440003';

-- Set current workflow stage for projects
UPDATE projects SET current_stage_id = '880e8400-e29b-41d4-a716-446655440002' WHERE id = '220e8400-e29b-41d4-a716-446655440001';
UPDATE projects SET current_stage_id = '880e8400-e29b-41d4-a716-446655440001' WHERE id = '220e8400-e29b-41d4-a716-446655440002';
UPDATE projects SET current_stage_id = '880e8400-e29b-41d4-a716-446655440003' WHERE id = '220e8400-e29b-41d4-a716-446655440003';

-- =========================================
-- 7. WORKFLOW SUB-STAGES
-- =========================================

-- Inquiry Received Sub-stages
INSERT INTO workflow_sub_stages (id, organization_id, workflow_stage_id, name, slug, description, sub_stage_order, responsible_roles, estimated_duration_hours, is_required, requires_approval) VALUES
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', 'Initial Review', 'initial_review', 'Review customer requirements and feasibility', 1, ARRAY['sales', 'management']::user_role[], 4, true, false),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', 'Technical Assessment', 'technical_assessment', 'Assess technical requirements and capabilities', 2, ARRAY['engineering']::user_role[], 8, true, false),
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', 'Cost Estimation', 'cost_estimation', 'Initial cost estimation and budget planning', 3, ARRAY['sales', 'procurement']::user_role[], 6, true, false);

-- Technical Review Sub-stages
INSERT INTO workflow_sub_stages (id, organization_id, workflow_stage_id, name, slug, description, sub_stage_order, responsible_roles, estimated_duration_hours, is_required, requires_approval) VALUES
('990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440002', 'Design Review', 'design_review', 'Review design specifications and requirements', 1, ARRAY['engineering']::user_role[], 16, true, true),
('990e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440002', 'Quality Assessment', 'quality_assessment', 'Quality requirements and testing procedures', 2, ARRAY['qa']::user_role[], 8, true, true),
('990e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440002', 'Production Planning', 'production_planning', 'Production process planning and resource allocation', 3, ARRAY['production']::user_role[], 12, true, false);

-- Supplier RFQ Sent Sub-stages
INSERT INTO workflow_sub_stages (id, organization_id, workflow_stage_id, name, slug, description, sub_stage_order, responsible_roles, estimated_duration_hours, is_required, requires_approval) VALUES
('990e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440003', 'Supplier Selection', 'supplier_selection', 'Select qualified suppliers for component sourcing', 1, ARRAY['procurement']::user_role[], 4, true, false),
('990e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440003', 'RFQ Preparation', 'rfq_preparation', 'Prepare and send RFQs to selected suppliers', 2, ARRAY['procurement']::user_role[], 2, true, false),
('990e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440003', 'Supplier Responses', 'supplier_responses', 'Collect and analyze supplier responses', 3, ARRAY['procurement']::user_role[], 3, true, false);

-- =========================================
-- 8. PROJECT SUB-STAGE PROGRESS
-- =========================================

-- Sample progress records for active projects
INSERT INTO project_sub_stage_progress (id, organization_id, project_id, workflow_stage_id, sub_stage_id, status, assigned_to, started_at, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '220e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'completed', '660e8400-e29b-41d4-a716-446655440006', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '220e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', 'completed', '660e8400-e29b-41d4-a716-446655440009', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '220e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440003', 'in_progress', '660e8400-e29b-41d4-a716-446655440007', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '220e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440004', 'in_progress', '660e8400-e29b-41d4-a716-446655440009', NOW(), NOW());

-- =========================================
-- 9. SAMPLE APPROVALS
-- =========================================

INSERT INTO approvals (id, organization_id, approval_type, title, description, entity_type, entity_id, requested_by, current_approver_id, status, priority, due_date, request_reason) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'technical_review', 'Technical Review Approval', 'Approve technical specifications for Acme project', 'project', '220e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440005', 'pending', 'normal', NOW() + INTERVAL '3 days', 'Technical specifications require management approval'),
('dd0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'cost_approval', 'Cost Approval Request', 'Approve project budget for TechCorp integration', 'project', '220e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440002', 'approved', 'high', NOW() + INTERVAL '5 days', 'Budget exceeds standard approval threshold');

-- =========================================
-- 10. SAMPLE NOTIFICATIONS
-- =========================================

INSERT INTO notifications (id, organization_id, user_id, type, title, message, priority, action_url, is_read) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440005', 'approval', 'New Approval Request', 'Technical review approval needed for Acme project', 'normal', '/approvals/dd0e8400-e29b-41d4-a716-446655440001', false),
('ff0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440006', 'workflow', 'Project Stage Update', 'Acme project moved to Technical Review stage', 'low', '/projects/220e8400-e29b-41d4-a716-446655440001', false),
('ff0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440008', 'approval', 'Approval Approved', 'Your cost approval request has been approved', 'normal', '/approvals/dd0e8400-e29b-41d4-a716-446655440002', false);

-- =========================================
-- 11. SAMPLE ACTIVITY LOG
-- =========================================

INSERT INTO activity_log (id, organization_id, user_id, project_id, entity_type, entity_id, action, description) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440006', '220e8400-e29b-41d4-a716-446655440001', 'project', '220e8400-e29b-41d4-a716-446655440001', 'create', 'Created new project for Acme Manufacturing'),
('ee0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440009', '220e8400-e29b-41d4-a716-446655440001', 'project', '220e8400-e29b-41d4-a716-446655440001', 'update', 'Updated project technical specifications'),
('ee0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440007', '220e8400-e29b-41d4-a716-446655440001', 'project', '220e8400-e29b-41d4-a716-446655440001', 'update', 'Updated project cost estimation'),
('ee0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440005', '220e8400-e29b-41d4-a716-446655440002', 'approval', 'dd0e8400-e29b-41d4-a716-446655440001', 'approve', 'Approved technical review for Acme project');

DO $$
BEGIN
    RAISE NOTICE '✓ Apillis sample data migration completed successfully!';
END $$;
