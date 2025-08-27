-- Factory Pulse Users Table Update Script
-- Based on Factory-Pulse-User-Accounts.md
-- Excludes username and password fields

-- First, let's create/update the users table structure if needed
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(20) UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    extension VARCHAR(10),
    department VARCHAR(50),
    position VARCHAR(100),
    direct_manager VARCHAR(100),
    direct_reports TEXT[],
    start_date DATE,
    registration_date DATE,
    location VARCHAR(200),
    permissions TEXT[],
    system_access_level VARCHAR(50),
    security_clearance VARCHAR(20),
    account_type VARCHAR(20) DEFAULT 'internal', -- internal, supplier, customer
    company VARCHAR(100), -- for external accounts
    company_address TEXT, -- for external accounts
    supplier_id VARCHAR(20), -- for suppliers
    customer_id VARCHAR(20), -- for customers
    primary_contact BOOLEAN DEFAULT false,
    account_manager VARCHAR(100), -- for external accounts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clear existing data (optional - remove this line if you want to keep existing data)
-- TRUNCATE TABLE users;

-- Insert Internal Company Accounts

-- Sales Department
INSERT INTO users (
    employee_id, full_name, email, phone, extension, department, position,
    direct_manager, start_date, location, permissions, system_access_level,
    security_clearance, account_type
) VALUES 
(
    'EMP-SAL-001',
    'Nguyễn Thị Hương',
    'nguyen.huong@factoryplus.com',
    '+84 (28) 123-4567',
    '1234',
    'Sales',
    'Sales Representative',
    'Trần Văn Minh (Sales Manager)',
    '2023-03-15',
    'Building A, Floor 2, Desk 201',
    ARRAY['Submit RFQs', 'Manage customer communication', 'Send quotes to customers', 'View customer history', 'Access CRM module', 'Generate sales reports'],
    'Standard User',
    'Level 2',
    'internal'
),
(
    'EMP-SAL-002',
    'Trần Văn Minh',
    'tran.minh@factoryplus.com',
    '+84 (28) 123-4568',
    '1235',
    'Sales',
    'Sales Manager',
    NULL,
    '2021-08-10',
    'Building A, Floor 2, Office 205',
    ARRAY['All Sales Staff permissions', 'Approve quotes over $50,000', 'Manage sales team', 'Access advanced analytics', 'Approve customer credit limits', 'Override pricing rules'],
    'Manager',
    'Level 3',
    'internal'
);

-- Update direct reports for Sales Manager
UPDATE users SET direct_reports = ARRAY['Nguyễn Thị Hương', '3 other sales reps'] 
WHERE employee_id = 'EMP-SAL-002';

-- Procurement Department
INSERT INTO users (
    employee_id, full_name, email, phone, extension, department, position,
    direct_manager, start_date, location, permissions, system_access_level,
    security_clearance, account_type
) VALUES 
(
    'EMP-PRO-001',
    'Lê Văn Đức',
    'le.duc@factoryplus.com',
    '+84 (28) 123-4569',
    '1236',
    'Procurement',
    'Procurement Specialist',
    'Phạm Thị Lan (Procurement Manager)',
    '2022-11-20',
    'Building B, Floor 1, Desk 105',
    ARRAY['Coordinate supplier quotes', 'Manage BOMs (Bill of Materials)', 'Track Purchase Orders', 'Communicate with suppliers', 'Generate procurement reports', 'Manage inventory levels'],
    'Standard User',
    'Level 2',
    'internal'
),
(
    'EMP-PRO-002',
    'Phạm Thị Lan',
    'pham.lan@factoryplus.com',
    '+84 (28) 123-4570',
    '1237',
    'Procurement',
    'Procurement Manager',
    NULL,
    '2020-05-12',
    'Building B, Floor 1, Office 110',
    ARRAY['All Procurement Staff permissions', 'Approve POs over $25,000', 'Manage supplier relationships', 'Set procurement policies', 'Access cost analysis tools', 'Approve new suppliers'],
    'Manager',
    'Level 3',
    'internal'
);

-- Update direct reports for Procurement Manager
UPDATE users SET direct_reports = ARRAY['Lê Văn Đức', '2 other procurement specialists'] 
WHERE employee_id = 'EMP-PRO-002';

-- Engineering Department
INSERT INTO users (
    employee_id, full_name, email, phone, extension, department, position,
    direct_manager, start_date, location, permissions, system_access_level,
    security_clearance, account_type
) VALUES 
(
    'EMP-ENG-001',
    'Hoàng Văn Tuấn',
    'hoang.tuan@factoryplus.com',
    '+84 (28) 123-4571',
    '1238',
    'Engineering',
    'Design Engineer',
    'Võ Thị Mai (Engineering Manager)',
    '2023-01-08',
    'Building C, Floor 3, Desk 301',
    ARRAY['Review technical designs', 'Assess project feasibility', 'Flag technical risks', 'Access CAD systems', 'Generate engineering reports', 'Collaborate on design reviews'],
    'Standard User',
    'Level 2',
    'internal'
),
(
    'EMP-ENG-002',
    'Võ Thị Mai',
    'vo.mai@factoryplus.com',
    '+84 (28) 123-4572',
    '1239',
    'Engineering',
    'Engineering Manager',
    NULL,
    '2019-09-25',
    'Building C, Floor 3, Office 315',
    ARRAY['All Engineering Staff permissions', 'Approve design changes', 'Manage engineering projects', 'Access advanced CAD tools', 'Approve technical specifications', 'Manage engineering resources'],
    'Manager',
    'Level 4',
    'internal'
);

-- Update direct reports for Engineering Manager
UPDATE users SET direct_reports = ARRAY['Hoàng Văn Tuấn', '4 other engineers'] 
WHERE employee_id = 'EMP-ENG-002';-
- Quality Assurance Department
INSERT INTO users (
    employee_id, full_name, email, phone, extension, department, position,
    direct_manager, start_date, location, permissions, system_access_level,
    security_clearance, account_type
) VALUES 
(
    'EMP-QA-001',
    'Đặng Thị Linh',
    'dang.linh@factoryplus.com',
    '+84 (28) 123-4573',
    '1240',
    'Quality Assurance',
    'Quality Inspector',
    'Bùi Văn Hùng (QA Manager)',
    '2022-07-14',
    'Building D, Floor 1, Lab 102',
    ARRAY['Define inspection plans', 'Log non-conformances', 'Conduct quality tests', 'Generate quality reports', 'Access testing equipment', 'Document quality procedures'],
    'Standard User',
    'Level 2',
    'internal'
),
(
    'EMP-QA-002',
    'Bùi Văn Hùng',
    'bui.hung@factoryplus.com',
    '+84 (28) 123-4574',
    '1241',
    'Quality Assurance',
    'QA Manager',
    NULL,
    '2018-12-03',
    'Building D, Floor 1, Office 115',
    ARRAY['All QA Staff permissions', 'Approve quality plans', 'Manage quality processes', 'Access advanced analytics', 'Approve quality certifications', 'Set quality standards'],
    'Manager',
    'Level 3',
    'internal'
);

-- Update direct reports for QA Manager
UPDATE users SET direct_reports = ARRAY['Đặng Thị Linh', '3 other QA inspectors'] 
WHERE employee_id = 'EMP-QA-002';

-- Production Department
INSERT INTO users (
    employee_id, full_name, email, phone, extension, department, position,
    direct_manager, start_date, location, permissions, system_access_level,
    security_clearance, account_type
) VALUES 
(
    'EMP-PRD-001',
    'Ngô Văn Thành',
    'ngo.thanh@factoryplus.com',
    '+84 (28) 123-4575',
    '1242',
    'Production',
    'Production Operator',
    'Lý Thị Hoa (Production Manager)',
    '2023-05-22',
    'Building E, Floor 1, Station 15',
    ARRAY['Execute work orders', 'Report equipment downtime', 'Track production progress', 'Log production data', 'Access work instructions', 'Report safety incidents'],
    'Standard User',
    'Level 1',
    'internal'
),
(
    'EMP-PRD-002',
    'Lý Thị Hoa',
    'ly.hoa@factoryplus.com',
    '+84 (28) 123-4576',
    '1243',
    'Production',
    'Production Manager',
    NULL,
    '2020-02-18',
    'Building E, Floor 2, Office 201',
    ARRAY['All Production Staff permissions', 'Plan production schedules', 'Manage production resources', 'Approve overtime', 'Access production analytics', 'Manage work order priorities'],
    'Manager',
    'Level 3',
    'internal'
);

-- Update direct reports for Production Manager
UPDATE users SET direct_reports = ARRAY['Ngô Văn Thành', '12 other production operators'] 
WHERE employee_id = 'EMP-PRD-002';

-- Management/Executive
INSERT INTO users (
    employee_id, full_name, email, phone, extension, department, position,
    direct_manager, start_date, location, permissions, system_access_level,
    security_clearance, account_type
) VALUES 
(
    'EMP-MGT-001',
    'Đinh Văn Khoa',
    'dinh.khoa@factoryplus.com',
    '+84 (28) 123-4577',
    '1244',
    'Management',
    'Operations Director',
    'Cao Thị Nga (General Manager)',
    '2017-06-30',
    'Building A, Floor 3, Office 301',
    ARRAY['Monitor departmental KPIs', 'Approve departmental budgets', 'Access cross-departmental reports', 'Manage resource allocation', 'Approve policy changes', 'Access financial data'],
    'Director',
    'Level 4',
    'internal'
),
(
    'EMP-EXE-001',
    'Cao Thị Nga',
    'cao.nga@factoryplus.com',
    '+84 (28) 123-4578',
    '1245',
    'Executive',
    'General Manager',
    NULL,
    '2015-01-15',
    'Building A, Floor 4, Executive Suite',
    ARRAY['Monitor overall company KPIs', 'Make strategic decisions', 'Access all system modules', 'Approve major expenditures', 'Set company policies', 'Full system administrator access'],
    'Executive',
    'Level 5',
    'internal'
);

-- Update direct reports for Management
UPDATE users SET direct_reports = ARRAY['All department managers'] 
WHERE employee_id = 'EMP-MGT-001';

UPDATE users SET direct_reports = ARRAY['Đinh Văn Khoa', 'All Directors'] 
WHERE employee_id = 'EMP-EXE-001';

-- External Partner Accounts

-- Supplier Accounts
INSERT INTO users (
    full_name, email, phone, position, company, company_address,
    supplier_id, primary_contact, account_manager, registration_date,
    permissions, system_access_level, security_clearance, account_type
) VALUES 
(
    'Vũ Minh Tâm',
    'vu.tam@viettech.com.vn',
    '+84 (274) 987-6543',
    'Sales Representative',
    'VietTech Manufacturing Co., Ltd',
    '123 Công Nghiệp Street, Bình Dương Province, Vietnam',
    'SUP-001',
    true,
    'Lê Văn Đức (Internal)',
    '2023-02-10',
    ARRAY['View assigned RFQs', 'Submit quotes', 'Communicate securely with procurement', 'Access supplier portal', 'Download technical specifications', 'Track quote status'],
    'External User',
    'Supplier Level',
    'supplier'
),
(
    'Đỗ Thị Xuân',
    'do.xuan@viettech.com.vn',
    '+84 (274) 987-6544',
    'Account Manager',
    'VietTech Manufacturing Co., Ltd',
    '123 Công Nghiệp Street, Bình Dương Province, Vietnam',
    'SUP-001-MGR',
    false,
    'Phạm Thị Lan (Internal)',
    '2023-02-10',
    ARRAY['All Supplier Contact permissions', 'Manage supplier relationship', 'Approve quotes over $10,000', 'Access supplier analytics', 'Manage supplier team access', 'Negotiate contract terms'],
    'External Manager',
    'Supplier Manager Level',
    'supplier'
);

-- Customer Accounts
INSERT INTO users (
    full_name, email, phone, position, company, company_address,
    customer_id, primary_contact, account_manager, registration_date,
    permissions, system_access_level, security_clearance, account_type
) VALUES 
(
    'Michael Johnson',
    'michael.johnson@autotech.com',
    '+1 (555) 456-7890',
    'Procurement Specialist',
    'AutoTech Solutions LLC',
    '5678 Business Park Dr, Auto City, AC 67890',
    'CUS-001',
    true,
    'Nguyễn Thị Hương (Internal)',
    '2023-04-05',
    ARRAY['Submit RFQs through customer portal', 'Track RFQ status', 'Receive quotes', 'Access order history', 'Download invoices', 'Communicate with sales team'],
    'External User',
    'Customer Level',
    'customer'
),
(
    'Rachel Green',
    'rachel.green@autotech.com',
    '+1 (555) 456-7891',
    'Purchasing Manager',
    'AutoTech Solutions LLC',
    '5678 Business Park Dr, Auto City, AC 67890',
    'CUS-001-MGR',
    false,
    'Trần Văn Minh (Internal)',
    '2023-04-05',
    ARRAY['All Customer Contact permissions', 'Oversee customer relationship', 'Approve orders over $25,000', 'Access customer analytics', 'Manage customer team access', 'Negotiate pricing terms'],
    'External Manager',
    'Customer Manager Level',
    'customer'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type);
CREATE INDEX IF NOT EXISTS idx_users_supplier_id ON users(supplier_id);
CREATE INDEX IF NOT EXISTS idx_users_customer_id ON users(customer_id);

-- Create a view for easy querying of internal employees
CREATE OR REPLACE VIEW internal_employees AS
SELECT 
    id,
    employee_id,
    full_name,
    email,
    phone,
    extension,
    department,
    position,
    direct_manager,
    direct_reports,
    start_date,
    location,
    system_access_level,
    security_clearance
FROM users 
WHERE account_type = 'internal'
ORDER BY department, position;

-- Create a view for external partners
CREATE OR REPLACE VIEW external_partners AS
SELECT 
    id,
    full_name,
    email,
    phone,
    position,
    company,
    company_address,
    COALESCE(supplier_id, customer_id) as partner_id,
    primary_contact,
    account_manager,
    registration_date,
    system_access_level,
    security_clearance,
    account_type
FROM users 
WHERE account_type IN ('supplier', 'customer')
ORDER BY account_type, company, position;

-- Add comments to the table
COMMENT ON TABLE users IS 'Factory Pulse system users including internal employees and external partners';
COMMENT ON COLUMN users.account_type IS 'Type of account: internal, supplier, or customer';
COMMENT ON COLUMN users.permissions IS 'Array of permissions granted to the user';
COMMENT ON COLUMN users.system_access_level IS 'System access level: Standard User, Manager, Director, Executive, External User, External Manager';
COMMENT ON COLUMN users.security_clearance IS 'Security clearance level for access control';

-- Success message
SELECT 'Users table updated successfully with ' || COUNT(*) || ' records' as result
FROM users;