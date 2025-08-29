-- Factory Pulse Database Seed File - Clean Version
-- This version excludes problematic user references that create foreign key constraints

-- Step 1: Organizations
-- Creating organizations first as they are referenced by other tables

-- 1. Factory Pulse Vietnam (Main organization)
INSERT INTO organizations (id, name, slug, domain, description, industry, is_active) VALUES 
(uuid_generate_v4(), 'Factory Pulse Vietnam', 'factory-pulse-vietnam', 'factorypulse.vn', 'Leading manufacturing solutions provider in Vietnam', 'manufacturing', true);

-- 2. Customer Organizations
INSERT INTO organizations (id, name, slug, domain, description, industry, is_active) VALUES 
(uuid_generate_v4(), 'Toyota Vietnam', 'toyota-vietnam', 'toyota.com.vn', 'Major automotive manufacturer in Vietnam', 'automotive', true),
(uuid_generate_v4(), 'Honda Vietnam', 'honda-vietnam', 'honda.com.vn', 'Motorcycle and automotive parts manufacturer', 'automotive', true),
(uuid_generate_v4(), 'Boeing Vietnam', 'boeing-vietnam', 'boeing.com.vn', 'Aerospace components manufacturing', 'aerospace', true),
(uuid_generate_v4(), 'Samsung Vietnam', 'samsung-vietnam', 'samsung.com.vn', 'Electronics manufacturing and assembly', 'electronics', true),
(uuid_generate_v4(), 'Siemens Vietnam', 'siemens-vietnam', 'siemens.com.vn', 'Industrial automation and power systems', 'industrial', true),
(uuid_generate_v4(), 'LG Vietnam', 'lg-vietnam', 'lg.com.vn', 'Electronics and home appliance manufacturing', 'electronics', true),
(uuid_generate_v4(), 'Airbus Vietnam', 'airbus-vietnam', 'airbus.com.vn', 'Aerospace engineering and manufacturing', 'aerospace', true),
(uuid_generate_v4(), 'ABB Vietnam', 'abb-vietnam', 'abb.com.vn', 'Power and automation technology', 'power_systems', true);

-- 3. Supplier Organizations
INSERT INTO organizations (id, name, slug, domain, description, industry, is_active) VALUES 
(uuid_generate_v4(), 'Precision Machining Co.', 'precision-machining', 'precisionmachining.vn', 'High-precision CNC machining services', 'manufacturing', true),
(uuid_generate_v4(), 'Metal Fabrication Ltd.', 'metal-fabrication', 'metalfab.vn', 'Custom metal fabrication and welding', 'manufacturing', true),
(uuid_generate_v4(), 'Assembly Solutions', 'assembly-solutions', 'assemblysolutions.vn', 'Product assembly and testing services', 'manufacturing', true),
(uuid_generate_v4(), 'Surface Finishing Pro', 'surface-finishing', 'surfacefinishing.vn', 'Surface treatment and finishing services', 'manufacturing', true),
(uuid_generate_v4(), 'Electronics Assembly', 'electronics-assembly', 'electronicsassembly.vn', 'PCB assembly and electronics manufacturing', 'electronics', true),
(uuid_generate_v4(), 'Quality Control Services', 'quality-control', 'qualitycontrol.vn', 'Quality assurance and testing services', 'quality_control', true),
(uuid_generate_v4(), 'Logistics Solutions', 'logistics-solutions', 'logisticssolutions.vn', 'Supply chain and logistics services', 'logistics', true),
(uuid_generate_v4(), 'Material Supply Co.', 'material-supply', 'materialsupply.vn', 'Raw materials and component supply', 'supply_chain', true),
(uuid_generate_v4(), 'Tooling Solutions', 'tooling-solutions', 'toolingsolutions.vn', 'Custom tooling and fixture design', 'manufacturing', true),
(uuid_generate_v4(), 'Packaging Services', 'packaging-services', 'packagingservices.vn', 'Custom packaging and labeling', 'packaging', true),
(uuid_generate_v4(), 'Calibration Lab', 'calibration-lab', 'calibrationlab.vn', 'Measurement and calibration services', 'quality_control', true),
(uuid_generate_v4(), 'Training Institute', 'training-institute', 'traininginstitute.vn', 'Technical training and certification', 'education', true);

-- Step 2: Users and Authentication
-- Creating internal users for Factory Pulse Vietnam organization

INSERT INTO users (id, organization_id, email, name, role, department, phone, status, description, employee_id) VALUES 
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1), 'admin@factorypulse.vn', 'Nguyễn Văn Admin', 'admin', 'Management', '+84-28-7300-1000', 'active', 'System Administrator', 'EMP001'),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1), 'ceo@factorypulse.vn', 'Trần Thị CEO', 'management', 'Management', '+84-28-7300-1001', 'active', 'Chief Executive Officer', 'EMP002'),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1), 'sales@factorypulse.vn', 'Lê Văn Sales', 'sales', 'Sales', '+84-28-7300-1002', 'active', 'Sales Manager', 'EMP003'),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1), 'procurement@factorypulse.vn', 'Phạm Thị Procurement', 'procurement', 'Procurement', '+84-28-7300-1003', 'active', 'Procurement Manager', 'EMP004'),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1), 'engineering@factorypulse.vn', 'Hoàng Văn Engineering', 'engineering', 'Engineering', '+84-28-7300-1004', 'active', 'Engineering Manager', 'EMP005'),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1), 'production@factorypulse.vn', 'Vũ Thị Production', 'production', 'Production', '+84-28-7300-1005', 'active', 'Production Manager', 'EMP006'),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1), 'qa@factorypulse.vn', 'Đặng Văn QA', 'qa', 'Quality Assurance', '+84-28-7300-1006', 'active', 'Quality Assurance Manager', 'EMP007'),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1), 'sales2@factorypulse.vn', 'Bùi Thị Sales2', 'sales', 'Sales', '+84-28-7300-1007', 'active', 'Sales Representative', 'EMP008'),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1), 'procurement2@factorypulse.vn', 'Ngô Văn Procurement2', 'procurement', 'Procurement', '+84-28-7300-1008', 'active', 'Procurement Specialist', 'EMP009'),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1), 'engineering2@factorypulse.vn', 'Lý Thị Engineering2', 'engineering', 'Engineering', '+84-28-7300-1009', 'active', 'Senior Engineer', 'EMP010'),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1), 'production2@factorypulse.vn', 'Hồ Văn Production2', 'production', 'Production', '+84-28-7300-1010', 'active', 'Production Supervisor', 'EMP011'),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1), 'qa2@factorypulse.vn', 'Trương Thị QA2', 'qa', 'Quality Assurance', '+84-28-7300-1011', 'active', 'Quality Inspector', 'EMP012');

-- Step 3: Contacts and Customer/Supplier Accounts
-- Each external organization has 1 account for portal authentication

-- Customer Contacts
INSERT INTO contacts (id, organization_id, type, company_name, contact_name, email, phone, address, city, country, is_active) VALUES 
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'toyota-vietnam' LIMIT 1), 'customer', 'Toyota Vietnam', 'Nguyễn Văn An', 'procurement@toyota.vn', '+84-28-7300-1001', '123 Đường Võ Văn Ngân, Quận Thủ Đức', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'honda-vietnam' LIMIT 1), 'customer', 'Honda Vietnam', 'Trần Thị Bình', 'purchasing@honda.vn', '+84-28-7300-1002', '456 Đường Lê Văn Việt, Quận 9', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'boeing-vietnam' LIMIT 1), 'customer', 'Boeing Vietnam', 'Lê Văn Cường', 'supply.chain@boeing.vn', '+84-28-7300-1003', '789 Đường Mai Chí Thọ, Quận 2', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'samsung-vietnam' LIMIT 1), 'customer', 'Samsung Vietnam', 'Phạm Thị Dung', 'procurement@samsung.vn', '+84-28-7300-1004', '321 Đường Nguyễn Thị Thập, Quận 7', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'siemens-vietnam' LIMIT 1), 'customer', 'Siemens Vietnam', 'Hoàng Văn Em', 'procurement@siemens.vn', '+84-28-7300-1005', '654 Đường Nguyễn Hữu Thọ, Quận 7', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'lg-vietnam' LIMIT 1), 'customer', 'LG Vietnam', 'Vũ Thị Phương', 'purchasing@lg.vn', '+84-28-7300-1006', '987 Đường Huỳnh Tấn Phát, Quận 7', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'airbus-vietnam' LIMIT 1), 'customer', 'Airbus Vietnam', 'Đặng Văn Giang', 'supply.chain@airbus.vn', '+84-28-7300-1007', '147 Đường Nguyễn Thị Định, Quận 2', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'abb-vietnam' LIMIT 1), 'customer', 'ABB Vietnam', 'Bùi Thị Hương', 'procurement@abb.vn', '+84-28-7300-1008', '258 Đường Mai Chí Thọ, Quận 2', 'Ho Chi Minh City', 'Vietnam', true);

-- Supplier Contacts
INSERT INTO contacts (id, organization_id, type, company_name, contact_name, email, phone, address, city, country, is_active) VALUES 
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'precision-machining' LIMIT 1), 'supplier', 'Precision Machining Co.', 'Ngô Văn Tâm', 'sales@precisionmachining.vn', '+84-28-7300-2001', '369 Đường Võ Văn Ngân, Quận Thủ Đức', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'metal-fabrication' LIMIT 1), 'supplier', 'Metal Fabrication Ltd.', 'Lý Thị Lan', 'sales@metalfab.vn', '+84-28-7300-2002', '741 Đường Lê Văn Việt, Quận 9', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'assembly-solutions' LIMIT 1), 'supplier', 'Assembly Solutions', 'Hồ Văn Minh', 'sales@assemblysolutions.vn', '+84-28-7300-2003', '852 Đường Mai Chí Thọ, Quận 2', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'surface-finishing' LIMIT 1), 'supplier', 'Surface Finishing Pro', 'Trương Thị Mai', 'sales@surfacefinishing.vn', '+84-28-7300-2004', '963 Đường Nguyễn Thị Thập, Quận 7', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'electronics-assembly' LIMIT 1), 'supplier', 'Electronics Assembly', 'Nguyễn Văn Sơn', 'sales@electronicsassembly.vn', '+84-28-7300-2005', '159 Đường Nguyễn Hữu Thọ, Quận 7', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'quality-control' LIMIT 1), 'supplier', 'Quality Control Services', 'Trần Thị Hoa', 'sales@qualitycontrol.vn', '+84-28-7300-2006', '357 Đường Huỳnh Tấn Phát, Quận 7', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'logistics-solutions' LIMIT 1), 'supplier', 'Logistics Solutions', 'Lê Văn Dũng', 'sales@logisticssolutions.vn', '+84-28-7300-2007', '486 Đường Nguyễn Thị Định, Quận 2', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'material-supply' LIMIT 1), 'supplier', 'Material Supply Co.', 'Phạm Thị Thảo', 'sales@materialsupply.vn', '+84-28-7300-2008', '753 Đường Mai Chí Thọ, Quận 2', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'tooling-solutions' LIMIT 1), 'supplier', 'Tooling Solutions', 'Hoàng Văn Nam', 'sales@toolingsolutions.vn', '+84-28-7300-2009', '951 Đường Võ Văn Ngân, Quận Thủ Đức', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'packaging-services' LIMIT 1), 'supplier', 'Packaging Services', 'Vũ Thị Linh', 'sales@packagingservices.vn', '+84-28-7300-2010', '264 Đường Lê Văn Việt, Quận 9', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'calibration-lab' LIMIT 1), 'supplier', 'Calibration Lab', 'Đặng Văn Hùng', 'sales@calibrationlab.vn', '+84-28-7300-2011', '837 Đường Mai Chí Thọ, Quận 2', 'Ho Chi Minh City', 'Vietnam', true),
(uuid_generate_v4(), (SELECT id FROM organizations WHERE slug = 'training-institute' LIMIT 1), 'supplier', 'Training Institute', 'Bùi Thị Nga', 'sales@traininginstitute.vn', '+84-28-7300-2012', '462 Đường Nguyễn Thị Thập, Quận 7', 'Ho Chi Minh City', 'Vietnam', true);

-- Step 4: Workflow Stages
-- Creating workflow stages (no user references)

INSERT INTO workflow_stages (id, name, description, order_index, is_active, estimated_duration_days) VALUES 
(uuid_generate_v4(), 'Inquiry Received', 'Initial customer inquiry received and logged', 1, true, 1),
(uuid_generate_v4(), 'Technical Review', 'Engineering team reviews technical requirements', 2, true, 3),
(uuid_generate_v4(), 'Supplier RFQ', 'Request for quotes from suppliers', 3, true, 5),
(uuid_generate_v4(), 'Quoted', 'Price and timeline provided to customer', 4, true, 2),
(uuid_generate_v4(), 'Order Confirmed', 'Customer confirms order and payment', 5, true, 1),
(uuid_generate_v4(), 'Procurement Planning', 'Materials and resources planning', 6, true, 3),
(uuid_generate_v4(), 'In Production', 'Manufacturing and assembly in progress', 7, true, 15),
(uuid_generate_v4(), 'Shipped & Closed', 'Product shipped and project closed', 8, true, 2);

-- Note: Projects and other tables with user references are excluded to avoid foreign key constraints
-- These will be created dynamically as needed by the application
