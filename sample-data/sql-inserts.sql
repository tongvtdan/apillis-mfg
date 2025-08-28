-- Factory Pulse Sample Data - Database Seeding Script
-- This script populates the database with sample data for development and testing
-- Generated on: 2025-01-27
-- Total records: 67 activity logs, 34 notifications, 25 messages, 25 reviews, 38 documents, 17 projects, 20 contacts, 8 users, 1 organization, 4 workflow stages

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================
INSERT INTO organizations (id, name, description, industry, size, status, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Apillis Manufacturing Solutions', 'Leading manufacturing solutions provider in Vietnam specializing in automotive, aerospace, and electronics sectors', 'Manufacturing', 'large', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z');

-- ============================================================================
-- WORKFLOW STAGES
-- ============================================================================
INSERT INTO workflow_stages (id, organization_id, name, description, order_index, status, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Planning', 'Project planning and requirements gathering phase', 1, 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Design', 'Design and engineering phase', 2, 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440001', 'Production', 'Manufacturing and production phase', 3, 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440001', 'Quality Control', 'Quality assurance and testing phase', 4, 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440001', 'Completed', 'Project completion and delivery phase', 5, 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z');

-- ============================================================================
-- USERS
-- ============================================================================
INSERT INTO users (id, organization_id, email, first_name, last_name, role, status, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'nguyen.van.a@apillis.com', 'Nguyen', 'Van A', 'engineer', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'tran.thi.b@apillis.com', 'Tran', 'Thi B', 'technician', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 'le.van.c@apillis.com', 'Le', 'Van C', 'engineer', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'pham.thi.d@apillis.com', 'Pham', 'Thi D', 'quality_manager', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', 'hoang.van.e@apillis.com', 'Hoang', 'Van E', 'production_manager', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'vu.thi.f@apillis.com', 'Vu', 'Thi F', 'technician', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'dang.van.g@apillis.com', 'Dang', 'Van G', 'safety_officer', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'bui.thi.h@apillis.com', 'Bui', 'Thi H', 'project_manager', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'do.van.i@apillis.com', 'Do', 'Van I', 'procurement_specialist', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z');

-- ============================================================================
-- CONTACTS (Customers and Suppliers)
-- ============================================================================
INSERT INTO contacts (id, organization_id, contact_type, name, email, phone, address, city, country, status, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'Toyota Vietnam', 'contact@toyota.vn', '+84-24-1234-5678', '123 Nguyen Trai Street, Dong Da District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'Honda Vietnam', 'info@honda.vn', '+84-24-2345-6789', '456 Le Loi Street, Hoan Kiem District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'Boeing Vietnam', 'contact@boeing.vn', '+84-24-3456-7890', '789 Tran Phu Street, Ba Dinh District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'Samsung Vietnam', 'info@samsung.vn', '+84-24-4567-8901', '321 Cau Giay Street, Cau Giay District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'Siemens Vietnam', 'contact@siemens.vn', '+84-24-5678-9012', '654 Lang Ha Street, Dong Da District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'LG Vietnam', 'info@lg.vn', '+84-24-6789-0123', '987 Kim Ma Street, Ba Dinh District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'Airbus Vietnam', 'contact@airbus.vn', '+84-24-7890-1234', '147 Pham Van Dong Street, Cau Giay District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440001', 'customer', 'ABB Vietnam', 'info@abb.vn', '+84-24-8901-2345', '258 Xuan Thuy Street, Cau Giay District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440109', '550e8400-e29b-41d4-a716-446655440001', 'supplier', 'Precision Machining Co.', 'sales@precision.vn', '+84-24-9012-3456', '369 Nguyen Van Cu Street, Long Bien District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440001', 'supplier', 'Advanced Welding Solutions', 'info@welding.vn', '+84-24-0123-4567', '741 Giai Phong Street, Hoang Mai District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440001', 'supplier', 'Surface Finishing Pro', 'contact@finishing.vn', '+84-24-1234-5678', '852 Minh Khai Street, Hai Ba Trung District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440001', 'supplier', 'Electronics Assembly Co.', 'sales@electronics.vn', '+84-24-2345-6789', '963 Bach Mai Street, Dong Da District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440113', '550e8400-e29b-41d4-a716-446655440001', 'supplier', 'Quality Control Services', 'info@qcservices.vn', '+84-24-3456-7890', '159 Thai Ha Street, Dong Da District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440114', '550e8400-e29b-41d4-a716-446655440001', 'supplier', 'Logistics Solutions', 'contact@logistics.vn', '+84-24-4567-8901', '753 Nguyen Thi Dinh Street, Nam Tu Liem District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440115', '550e8400-e29b-41d4-a716-446655440001', 'supplier', 'Material Supply Co.', 'sales@materials.vn', '+84-24-5678-9012', '951 Pham Van Bach Street, Cau Giay District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440116', '550e8400-e29b-41d4-a716-446655440001', 'supplier', 'Tooling Solutions', 'info@tooling.vn', '+84-24-6789-0123', '357 Hoang Quoc Viet Street, Cau Giay District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440117', '550e8400-e29b-41d4-a716-446655440001', 'supplier', 'Packaging Services', 'contact@packaging.vn', '+84-24-7890-1234', '486 Duong Quang Ham Street, Cau Giay District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440118', '550e8400-e29b-41d4-a716-446655440001', 'supplier', 'Calibration Lab', 'sales@calibration.vn', '+84-24-8901-2345', '753 Nghia Tan Street, Cau Giay District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440119', '550e8400-e29b-41d4-a716-446655440001', 'supplier', 'Training Institute', 'info@training.vn', '+84-24-9012-3456', '159 Ngo Thi Nham Street, Hai Ba Trung District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440120', '550e8400-e29b-41d4-a716-446655440001', 'supplier', 'Maintenance Services', 'contact@maintenance.vn', '+84-24-0123-4567', '357 Tran Duy Hung Street, Cau Giay District', 'Hanoi', 'Vietnam', 'active', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z');

-- ============================================================================
-- PROJECTS
-- ============================================================================
INSERT INTO projects (id, organization_id, customer_id, title, description, project_type, status, current_stage_id, priority, start_date, due_date, budget, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', 'Automotive Bracket Assembly', 'Manufacturing of automotive bracket assembly for Toyota Vietnam', 'fabrication', 'active', '550e8400-e29b-41d4-a716-446655440201', 'high', '2025-01-27', '2025-02-15', 50000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440102', 'Honda Engine Components', 'Production of engine components for Honda Vietnam', 'fabrication', 'active', '550e8400-e29b-41d4-a716-446655440201', 'high', '2025-01-27', '2025-02-20', 75000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440103', 'Boeing Avionics Housing', 'Fabrication of avionics housing for Boeing Vietnam', 'fabrication', 'active', '550e8400-e29b-41d4-a716-446655440201', 'critical', '2025-01-27', '2025-03-01', 120000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440104', 'Samsung Electronics Assembly', 'Electronics assembly for Samsung Vietnam', 'manufacturing', 'active', '550e8400-e29b-41d4-a716-446655440201', 'medium', '2025-01-27', '2025-02-10', 45000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440105', 'Siemens Control Panel', 'Manufacturing of control panel for Siemens Vietnam', 'manufacturing', 'active', '550e8400-e29b-41d4-a716-446655440201', 'medium', '2025-01-27', '2025-02-25', 60000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440106', 'LG Home Appliance Parts', 'Production of home appliance parts for LG Vietnam', 'manufacturing', 'active', '550e8400-e29b-41d4-a716-446655440201', 'medium', '2025-01-27', '2025-02-18', 55000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440307', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440107', 'Airbus Aircraft Control Systems', 'System build for Airbus aircraft control systems', 'system_build', 'active', '550e8400-e29b-41d4-a716-446655440201', 'critical', '2025-01-27', '2025-03-15', 150000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440308', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440108', 'ABB Power Systems', 'System build for ABB power systems', 'system_build', 'active', '550e8400-e29b-41d4-a716-446655440201', 'high', '2025-01-27', '2025-03-10', 100000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440309', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440104', 'Samsung Display Assembly', 'Manufacturing of display assembly for Samsung Vietnam', 'manufacturing', 'active', '550e8400-e29b-41d4-a716-446655440201', 'medium', '2025-01-27', '2025-02-12', 48000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440310', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440102', 'Honda Engine Components', 'Production of engine components for Honda Vietnam', 'manufacturing', 'active', '550e8400-e29b-41d4-a716-446655440201', 'high', '2025-01-27', '2025-02-22', 70000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440311', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440103', 'Boeing Avionics Housing', 'Fabrication of avionics housing for Boeing Vietnam', 'fabrication', 'active', '550e8400-e29b-41d4-a716-446655440201', 'critical', '2025-01-27', '2025-03-05', 125000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440312', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440104', 'Samsung Electronic Components', 'Manufacturing of electronic components for Samsung Vietnam', 'manufacturing', 'active', '550e8400-e29b-41d4-a716-446655440201', 'medium', '2025-01-27', '2025-02-08', 42000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440313', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440106', 'LG Smart Home', 'System build for LG smart home solutions', 'system_build', 'active', '550e8400-e29b-41d4-a716-446655440201', 'medium', '2025-01-27', '2025-02-28', 80000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440314', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440107', 'Airbus Engine Mount', 'Fabrication of engine mount for Airbus Vietnam', 'fabrication', 'active', '550e8400-e29b-41d4-a716-446655440201', 'high', '2025-01-27', '2025-03-08', 95000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440315', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440108', 'ABB Motor Production', 'Manufacturing of motors for ABB Vietnam', 'manufacturing', 'active', '550e8400-e29b-41d4-a716-446655440201', 'medium', '2025-01-27', '2025-02-20', 65000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440316', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', 'Toyota Transmission Housing', 'Fabrication of transmission housing for Toyota Vietnam', 'fabrication', 'active', '550e8400-e29b-41d4-a716-446655440201', 'high', '2025-01-27', '2025-02-25', 85000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440317', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440102', 'Honda Chassis Assembly', 'Fabrication of chassis assembly for Honda Vietnam', 'fabrication', 'active', '550e8400-e29b-41d4-a716-446655440201', 'high', '2025-01-27', '2025-03-01', 110000.00, '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z');

-- ============================================================================
-- NOTE: Additional data tables are available as JSON files
-- ============================================================================
-- The following tables contain large amounts of data and are provided as separate JSON files:
-- - documents.json (38 records) - Contains project documents, RFQs, drawings, BOMs, etc.
-- - reviews.json (25 records) - Contains engineering, quality, and safety reviews
-- - messages.json (25 records) - Contains internal communication messages
-- - notifications.json (34 records) - Contains system notifications and alerts
-- - activity-log.json (67 records) - Contains audit trail and user activity logs
--
-- To import these additional tables, use your database's JSON import functionality
-- or convert the JSON data to SQL INSERT statements as needed.
--
-- Total sample data summary:
-- - 1 organization
-- - 5 workflow stages  
-- - 9 users
-- - 20 contacts (8 customers, 12 suppliers)
-- - 17 projects
-- - 38 documents
-- - 25 reviews
-- - 25 messages
-- - 34 notifications
-- - 67 activity logs
-- ============================================================================
