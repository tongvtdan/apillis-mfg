-- Factory Pulse Account Creation Script (Compatible with existing users table)
-- Works with the current users table structure

-- First, let's add the missing columns to the existing users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS employee_id VARCHAR(20),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS extension VARCHAR(10),
ADD COLUMN IF NOT EXISTS position VARCHAR(100),
ADD COLUMN IF NOT EXISTS direct_manager VARCHAR(100),
ADD COLUMN IF NOT EXISTS direct_reports TEXT[],
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS registration_date DATE,
ADD COLUMN IF NOT EXISTS location VARCHAR(200),
ADD COLUMN IF NOT EXISTS permissions TEXT[],
ADD COLUMN IF NOT EXISTS system_access_level VARCHAR(50) DEFAULT 'Standard User',
ADD COLUMN IF NOT EXISTS security_clearance VARCHAR(20) DEFAULT 'Level 1',
ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'internal',
ADD COLUMN IF NOT EXISTS company VARCHAR(100),
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS supplier_id VARCHAR(20),
ADD COLUMN IF NOT EXISTS customer_id VARCHAR(20),
ADD COLUMN IF NOT EXISTS primary_contact BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS account_manager VARCHAR(100);

-- Add unique constraints for new columns
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS users_employee_id_unique UNIQUE (employee_id),
ADD CONSTRAINT IF NOT EXISTS users_supplier_id_unique UNIQUE (supplier_id),
ADD CONSTRAINT IF NOT EXISTS users_customer_id_unique UNIQUE (customer_id);

-- Create or get default organization (Factory Plus)
INSERT INTO public.organizations (id, name, slug, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Factory Plus Manufacturing',
    'factory-plus',
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Function to create users with auth (simplified for existing structure)
CREATE OR REPLACE FUNCTION create_factory_user(
    p_email TEXT,
    p_name TEXT,
    p_employee_id TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_extension TEXT DEFAULT NULL,
    p_department TEXT DEFAULT NULL,
    p_position TEXT DEFAULT NULL,
    p_direct_manager TEXT DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_registration_date DATE DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_permissions TEXT[] DEFAULT NULL,
    p_system_access_level TEXT DEFAULT 'Standard User',
    p_security_clearance TEXT DEFAULT 'Level 1',
    p_account_type TEXT DEFAULT 'internal',
    p_company TEXT DEFAULT NULL,
    p_company_address TEXT DEFAULT NULL,
    p_supplier_id TEXT DEFAULT NULL,
    p_customer_id TEXT DEFAULT NULL,
    p_primary_contact BOOLEAN DEFAULT false,
    p_account_manager TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
    org_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
BEGIN
    -- Insert user profile
    INSERT INTO public.users (
        email,
        name,
        organization_id,
        employee_id,
        phone,
        extension,
        department,
        position,
        direct_manager,
        start_date,
        registration_date,
        location,
        permissions,
        system_access_level,
        security_clearance,
        account_type,
        company,
        company_address,
        supplier_id,
        customer_id,
        primary_contact,
        account_manager,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        p_email,
        p_name,
        org_id,
        p_employee_id,
        p_phone,
        p_extension,
        p_department,
        p_position,
        p_direct_manager,
        p_start_date,
        p_registration_date,
        p_location,
        p_permissions,
        p_system_access_level,
        p_security_clearance,
        p_account_type,
        p_company,
        p_company_address,
        p_supplier_id,
        p_customer_id,
        p_primary_contact,
        p_account_manager,
        true,
        NOW(),
        NOW()
    ) RETURNING id INTO new_user_id;

    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clear existing Factory Pulse users (optional)
DELETE FROM public.users WHERE email LIKE '%@factoryplus.com' OR email LIKE '%@viettech.com.vn' OR email LIKE '%@autotech.com';

-- Create all Factory Pulse accounts

-- 1. Sales Staff - Nguyễn Thị Hương
SELECT create_factory_user(
    'nguyen.huong@factoryplus.com',
    'Nguyễn Thị Hương',
    'EMP-SAL-001',
    '+84 (28) 123-4567',
    '1234',
    'Sales',
    'Sales Representative',
    'Trần Văn Minh (Sales Manager)',
    '2023-03-15'::DATE,
    NULL,
    'Building A, Floor 2, Desk 201',
    ARRAY['Submit RFQs', 'Manage customer communication', 'Send quotes to customers', 'View customer history', 'Access CRM module', 'Generate sales reports'],
    'Standard User',
    'Level 2'
);

-- 2. Sales Manager - Trần Văn Minh
SELECT create_factory_user(
    'tran.minh@factoryplus.com',
    'Trần Văn Minh',
    'EMP-SAL-002',
    '+84 (28) 123-4568',
    '1235',
    'Sales',
    'Sales Manager',
    NULL,
    '2021-08-10'::DATE,
    NULL,
    'Building A, Floor 2, Office 205',
    ARRAY['All Sales Staff permissions', 'Approve quotes over $50,000', 'Manage sales team', 'Access advanced analytics', 'Approve customer credit limits', 'Override pricing rules'],
    'Manager',
    'Level 3'
);

-- 3. Procurement Staff - Lê Văn Đức
SELECT create_factory_user(
    'le.duc@factoryplus.com',
    'Lê Văn Đức',
    'EMP-PRO-001',
    '+84 (28) 123-4569',
    '1236',
    'Procurement',
    'Procurement Specialist',
    'Phạm Thị Lan (Procurement Manager)',
    '2022-11-20'::DATE,
    NULL,
    'Building B, Floor 1, Desk 105',
    ARRAY['Coordinate supplier quotes', 'Manage BOMs (Bill of Materials)', 'Track Purchase Orders', 'Communicate with suppliers', 'Generate procurement reports', 'Manage inventory levels'],
    'Standard User',
    'Level 2'
);

-- 4. Procurement Manager - Phạm Thị Lan
SELECT create_factory_user(
    'pham.lan@factoryplus.com',
    'Phạm Thị Lan',
    'EMP-PRO-002',
    '+84 (28) 123-4570',
    '1237',
    'Procurement',
    'Procurement Manager',
    NULL,
    '2020-05-12'::DATE,
    NULL,
    'Building B, Floor 1, Office 110',
    ARRAY['All Procurement Staff permissions', 'Approve POs over $25,000', 'Manage supplier relationships', 'Set procurement policies', 'Access cost analysis tools', 'Approve new suppliers'],
    'Manager',
    'Level 3'
);

-- 5. Engineering Staff - Hoàng Văn Tuấn
SELECT create_factory_user(
    'hoang.tuan@factoryplus.com',
    'Hoàng Văn Tuấn',
    'EMP-ENG-001',
    '+84 (28) 123-4571',
    '1238',
    'Engineering',
    'Design Engineer',
    'Võ Thị Mai (Engineering Manager)',
    '2023-01-08'::DATE,
    NULL,
    'Building C, Floor 3, Desk 301',
    ARRAY['Review technical designs', 'Assess project feasibility', 'Flag technical risks', 'Access CAD systems', 'Generate engineering reports', 'Collaborate on design reviews'],
    'Standard User',
    'Level 2'
);

-- 6. Engineering Manager - Võ Thị Mai
SELECT create_factory_user(
    'vo.mai@factoryplus.com',
    'Võ Thị Mai',
    'EMP-ENG-002',
    '+84 (28) 123-4572',
    '1239',
    'Engineering',
    'Engineering Manager',
    NULL,
    '2019-09-25'::DATE,
    NULL,
    'Building C, Floor 3, Office 315',
    ARRAY['All Engineering Staff permissions', 'Approve design changes', 'Manage engineering projects', 'Access advanced CAD tools', 'Approve technical specifications', 'Manage engineering resources'],
    'Manager',
    'Level 4'
);

-- 7. QA Staff - Đặng Thị Linh
SELECT create_factory_user(
    'dang.linh@factoryplus.com',
    'Đặng Thị Linh',
    'EMP-QA-001',
    '+84 (28) 123-4573',
    '1240',
    'Quality Assurance',
    'Quality Inspector',
    'Bùi Văn Hùng (QA Manager)',
    '2022-07-14'::DATE,
    NULL,
    'Building D, Floor 1, Lab 102',
    ARRAY['Define inspection plans', 'Log non-conformances', 'Conduct quality tests', 'Generate quality reports', 'Access testing equipment', 'Document quality procedures'],
    'Standard User',
    'Level 2'
);

-- 8. QA Manager - Bùi Văn Hùng
SELECT create_factory_user(
    'bui.hung@factoryplus.com',
    'Bùi Văn Hùng',
    'EMP-QA-002',
    '+84 (28) 123-4574',
    '1241',
    'Quality Assurance',
    'QA Manager',
    NULL,
    '2018-12-03'::DATE,
    NULL,
    'Building D, Floor 1, Office 115',
    ARRAY['All QA Staff permissions', 'Approve quality plans', 'Manage quality processes', 'Access advanced analytics', 'Approve quality certifications', 'Set quality standards'],
    'Manager',
    'Level 3'
);

-- 9. Production Staff - Ngô Văn Thành
SELECT create_factory_user(
    'ngo.thanh@factoryplus.com',
    'Ngô Văn Thành',
    'EMP-PRD-001',
    '+84 (28) 123-4575',
    '1242',
    'Production',
    'Production Operator',
    'Lý Thị Hoa (Production Manager)',
    '2023-05-22'::DATE,
    NULL,
    'Building E, Floor 1, Station 15',
    ARRAY['Execute work orders', 'Report equipment downtime', 'Track production progress', 'Log production data', 'Access work instructions', 'Report safety incidents'],
    'Standard User',
    'Level 1'
);

-- 10. Production Manager - Lý Thị Hoa
SELECT create_factory_user(
    'ly.hoa@factoryplus.com',
    'Lý Thị Hoa',
    'EMP-PRD-002',
    '+84 (28) 123-4576',
    '1243',
    'Production',
    'Production Manager',
    NULL,
    '2020-02-18'::DATE,
    NULL,
    'Building E, Floor 2, Office 201',
    ARRAY['All Production Staff permissions', 'Plan production schedules', 'Manage production resources', 'Approve overtime', 'Access production analytics', 'Manage work order priorities'],
    'Manager',
    'Level 3'
);

-- 11. Operations Director - Đinh Văn Khoa
SELECT create_factory_user(
    'dinh.khoa@factoryplus.com',
    'Đinh Văn Khoa',
    'EMP-MGT-001',
    '+84 (28) 123-4577',
    '1244',
    'Management',
    'Operations Director',
    'Cao Thị Nga (General Manager)',
    '2017-06-30'::DATE,
    NULL,
    'Building A, Floor 3, Office 301',
    ARRAY['Monitor departmental KPIs', 'Approve departmental budgets', 'Access cross-departmental reports', 'Manage resource allocation', 'Approve policy changes', 'Access financial data'],
    'Director',
    'Level 4'
);

-- 12. General Manager - Cao Thị Nga
SELECT create_factory_user(
    'cao.nga@factoryplus.com',
    'Cao Thị Nga',
    'EMP-EXE-001',
    '+84 (28) 123-4578',
    '1245',
    'Executive',
    'General Manager',
    NULL,
    '2015-01-15'::DATE,
    NULL,
    'Building A, Floor 4, Executive Suite',
    ARRAY['Monitor overall company KPIs', 'Make strategic decisions', 'Access all system modules', 'Approve major expenditures', 'Set company policies', 'Full system administrator access'],
    'Executive',
    'Level 5'
);

-- 13. Supplier Contact - Vũ Minh Tâm
SELECT create_factory_user(
    'vu.tam@viettech.com.vn',
    'Vũ Minh Tâm',
    NULL,
    '+84 (274) 987-6543',
    NULL,
    NULL,
    'Sales Representative',
    NULL,
    NULL,
    '2023-02-10'::DATE,
    NULL,
    ARRAY['View assigned RFQs', 'Submit quotes', 'Communicate securely with procurement', 'Access supplier portal', 'Download technical specifications', 'Track quote status'],
    'External User',
    'Supplier Level',
    'supplier',
    'VietTech Manufacturing Co., Ltd',
    '123 Công Nghiệp Street, Bình Dương Province, Vietnam',
    'SUP-001',
    NULL,
    true,
    'Lê Văn Đức (Internal)'
);

-- 14. Supplier Manager - Đỗ Thị Xuân
SELECT create_factory_user(
    'do.xuan@viettech.com.vn',
    'Đỗ Thị Xuân',
    NULL,
    '+84 (274) 987-6544',
    NULL,
    NULL,
    'Account Manager',
    NULL,
    NULL,
    '2023-02-10'::DATE,
    NULL,
    ARRAY['All Supplier Contact permissions', 'Manage supplier relationship', 'Approve quotes over $10,000', 'Access supplier analytics', 'Manage supplier team access', 'Negotiate contract terms'],
    'External Manager',
    'Supplier Manager Level',
    'supplier',
    'VietTech Manufacturing Co., Ltd',
    '123 Công Nghiệp Street, Bình Dương Province, Vietnam',
    'SUP-001-MGR',
    NULL,
    false,
    'Phạm Thị Lan (Internal)'
);

-- 15. Customer Contact - Michael Johnson
SELECT create_factory_user(
    'michael.johnson@autotech.com',
    'Michael Johnson',
    NULL,
    '+1 (555) 456-7890',
    NULL,
    NULL,
    'Procurement Specialist',
    NULL,
    NULL,
    '2023-04-05'::DATE,
    NULL,
    ARRAY['Submit RFQs through customer portal', 'Track RFQ status', 'Receive quotes', 'Access order history', 'Download invoices', 'Communicate with sales team'],
    'External User',
    'Customer Level',
    'customer',
    'AutoTech Solutions LLC',
    '5678 Business Park Dr, Auto City, AC 67890',
    NULL,
    'CUS-001',
    true,
    'Nguyễn Thị Hương (Internal)'
);

-- 16. Customer Manager - Rachel Green
SELECT create_factory_user(
    'rachel.green@autotech.com',
    'Rachel Green',
    NULL,
    '+1 (555) 456-7891',
    NULL,
    NULL,
    'Purchasing Manager',
    NULL,
    NULL,
    '2023-04-05'::DATE,
    NULL,
    ARRAY['All Customer Contact permissions', 'Oversee customer relationship', 'Approve orders over $25,000', 'Access customer analytics', 'Manage customer team access', 'Negotiate pricing terms'],
    'External Manager',
    'Customer Manager Level',
    'customer',
    'AutoTech Solutions LLC',
    '5678 Business Park Dr, Auto City, AC 67890',
    NULL,
    'CUS-001-MGR',
    false,
    'Trần Văn Minh (Internal)'
);

-- Update direct reports for managers
UPDATE public.users SET direct_reports = ARRAY['Nguyễn Thị Hương', '3 other sales reps'] 
WHERE employee_id = 'EMP-SAL-002';

UPDATE public.users SET direct_reports = ARRAY['Lê Văn Đức', '2 other procurement specialists'] 
WHERE employee_id = 'EMP-PRO-002';

UPDATE public.users SET direct_reports = ARRAY['Hoàng Văn Tuấn', '4 other engineers'] 
WHERE employee_id = 'EMP-ENG-002';

UPDATE public.users SET direct_reports = ARRAY['Đặng Thị Linh', '3 other QA inspectors'] 
WHERE employee_id = 'EMP-QA-002';

UPDATE public.users SET direct_reports = ARRAY['Ngô Văn Thành', '12 other production operators'] 
WHERE employee_id = 'EMP-PRD-002';

UPDATE public.users SET direct_reports = ARRAY['All department managers'] 
WHERE employee_id = 'EMP-MGT-001';

UPDATE public.users SET direct_reports = ARRAY['Đinh Văn Khoa', 'All Directors'] 
WHERE employee_id = 'EMP-EXE-001';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON public.users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_account_type ON public.users(account_type);
CREATE INDEX IF NOT EXISTS idx_users_supplier_id ON public.users(supplier_id);
CREATE INDEX IF NOT EXISTS idx_users_customer_id ON public.users(customer_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);

-- Success summary
SELECT 
    'Factory Pulse accounts created successfully!' as status,
    COUNT(*) as total_accounts_created,
    COUNT(*) FILTER (WHERE account_type = 'internal') as internal_accounts,
    COUNT(*) FILTER (WHERE account_type = 'supplier') as supplier_accounts,
    COUNT(*) FILTER (WHERE account_type = 'customer') as customer_accounts
FROM public.users
WHERE email LIKE '%@factoryplus.com' OR email LIKE '%@viettech.com.vn' OR email LIKE '%@autotech.com';

-- Display created accounts summary
SELECT 
    name,
    email,
    CASE 
        WHEN account_type = 'internal' THEN 'Internal Employee'
        WHEN account_type = 'supplier' THEN 'Supplier Partner'
        WHEN account_type = 'customer' THEN 'Customer Partner'
        ELSE 'Unknown'
    END as account_category,
    department,
    position,
    system_access_level
FROM public.users
WHERE email LIKE '%@factoryplus.com' OR email LIKE '%@viettech.com.vn' OR email LIKE '%@autotech.com'
ORDER BY 
    CASE account_type 
        WHEN 'internal' THEN 1 
        WHEN 'supplier' THEN 2 
        WHEN 'customer' THEN 3 
        ELSE 4
    END,
    department,
    position;