-- Factory Pulse Complete Account Creation Script
-- Creates both users table records and Supabase auth accounts
-- Based on Factory-Pulse-User-Accounts.md

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table with proper structure
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
    account_type VARCHAR(20) DEFAULT 'internal',
    company VARCHAR(100),
    company_address TEXT,
    supplier_id VARCHAR(20),
    customer_id VARCHAR(20),
    primary_contact BOOLEAN DEFAULT false,
    account_manager VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Admin policy (for system administrators)
CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_user_id = auth.uid() 
            AND system_access_level IN ('Executive', 'Director')
        )
    );

-- Function to create auth user and profile
CREATE OR REPLACE FUNCTION create_user_with_auth(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
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
    new_profile_id UUID;
BEGIN
    -- Create auth user
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role
    ) VALUES (
        gen_random_uuid(),
        p_email,
        crypt(p_password, gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('full_name', p_full_name),
        false,
        'authenticated'
    ) RETURNING id INTO new_user_id;

    -- Create user profile
    INSERT INTO public.users (
        auth_user_id,
        employee_id,
        full_name,
        email,
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
        account_manager
    ) VALUES (
        new_user_id,
        p_employee_id,
        p_full_name,
        p_email,
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
        p_account_manager
    ) RETURNING id INTO new_profile_id;

    RETURN new_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clear existing data (uncomment if needed)
-- DELETE FROM public.users;
-- DELETE FROM auth.users WHERE email LIKE '%@factoryplus.com' OR email LIKE '%@viettech.com.vn' OR email LIKE '%@autotech.com';

-- Create all Factory Pulse accounts

-- 1. Sales Staff - Nguyễn Thị Hương
SELECT create_user_with_auth(
    'nguyen.huong@factoryplus.com',
    'Sales2024!',
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
SELECT create_user_with_auth(
    'tran.minh@factoryplus.com',
    'SalesMgr2024!',
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
SELECT create_user_with_auth(
    'le.duc@factoryplus.com',
    'Proc2024!',
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
SELECT create_user_with_auth(
    'pham.lan@factoryplus.com',
    'ProcMgr2024!',
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
SELECT create_user_with_auth(
    'hoang.tuan@factoryplus.com',
    'Eng2024!',
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
SELECT create_user_with_auth(
    'vo.mai@factoryplus.com',
    'EngMgr2024!',
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
);-- 
7. QA Staff - Đặng Thị Linh
SELECT create_user_with_auth(
    'dang.linh@factoryplus.com',
    'QA2024!',
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
SELECT create_user_with_auth(
    'bui.hung@factoryplus.com',
    'QAMgr2024!',
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
SELECT create_user_with_auth(
    'ngo.thanh@factoryplus.com',
    'Prod2024!',
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
SELECT create_user_with_auth(
    'ly.hoa@factoryplus.com',
    'ProdMgr2024!',
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
SELECT create_user_with_auth(
    'dinh.khoa@factoryplus.com',
    'DeptMgr2024!',
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
SELECT create_user_with_auth(
    'cao.nga@factoryplus.com',
    'ExecMgr2024!',
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
SELECT create_user_with_auth(
    'vu.tam@viettech.com.vn',
    'Supplier2024!',
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
SELECT create_user_with_auth(
    'do.xuan@viettech.com.vn',
    'SupMgr2024!',
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
SELECT create_user_with_auth(
    'michael.johnson@autotech.com',
    'Customer2024!',
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
SELECT create_user_with_auth(
    'rachel.green@autotech.com',
    'CusMgr2024!',
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
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON public.users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
CREATE INDEX IF NOT EXISTS idx_users_account_type ON public.users(account_type);
CREATE INDEX IF NOT EXISTS idx_users_supplier_id ON public.users(supplier_id);
CREATE INDEX IF NOT EXISTS idx_users_customer_id ON public.users(customer_id);

-- Create helpful views
CREATE OR REPLACE VIEW internal_employees AS
SELECT 
    u.id,
    u.employee_id,
    u.full_name,
    u.email,
    u.phone,
    u.extension,
    u.department,
    u.position,
    u.direct_manager,
    u.direct_reports,
    u.start_date,
    u.location,
    u.system_access_level,
    u.security_clearance,
    u.is_active,
    au.email_confirmed_at IS NOT NULL as email_verified
FROM public.users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.account_type = 'internal'
ORDER BY u.department, u.position;

CREATE OR REPLACE VIEW external_partners AS
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.phone,
    u.position,
    u.company,
    u.company_address,
    COALESCE(u.supplier_id, u.customer_id) as partner_id,
    u.primary_contact,
    u.account_manager,
    u.registration_date,
    u.system_access_level,
    u.security_clearance,
    u.account_type,
    u.is_active,
    au.email_confirmed_at IS NOT NULL as email_verified
FROM public.users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE u.account_type IN ('supplier', 'customer')
ORDER BY u.account_type, u.company, u.position;

-- Create function to get user profile by auth ID
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE (
    id UUID,
    employee_id VARCHAR,
    full_name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    department VARCHAR,
    position VARCHAR,
    system_access_level VARCHAR,
    security_clearance VARCHAR,
    account_type VARCHAR,
    permissions TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.employee_id,
        u.full_name,
        u.email,
        u.phone,
        u.department,
        u.position,
        u.system_access_level,
        u.security_clearance,
        u.account_type,
        u.permissions
    FROM public.users u
    WHERE u.auth_user_id = user_id AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile(UUID) TO authenticated;

-- Success summary
SELECT 
    'Account creation completed!' as status,
    COUNT(*) as total_accounts_created,
    COUNT(*) FILTER (WHERE account_type = 'internal') as internal_accounts,
    COUNT(*) FILTER (WHERE account_type = 'supplier') as supplier_accounts,
    COUNT(*) FILTER (WHERE account_type = 'customer') as customer_accounts
FROM public.users;

-- Display login credentials summary
SELECT 
    full_name,
    email,
    CASE 
        WHEN account_type = 'internal' THEN 'Internal Employee'
        WHEN account_type = 'supplier' THEN 'Supplier Partner'
        WHEN account_type = 'customer' THEN 'Customer Partner'
    END as account_category,
    department,
    position,
    system_access_level
FROM public.users
ORDER BY 
    CASE account_type 
        WHEN 'internal' THEN 1 
        WHEN 'supplier' THEN 2 
        WHEN 'customer' THEN 3 
    END,
    department,
    position;