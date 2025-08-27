-- Factory Pulse Auth Accounts Migration
-- Creates all 16 Factory Pulse user accounts with Supabase Auth for login
-- Default password: FactoryPulse2024!

-- Function to create users with Supabase Auth accounts (enhanced)
CREATE OR REPLACE FUNCTION create_factory_user_with_auth(
    p_email TEXT,
    p_password TEXT,
    p_name TEXT,
    p_employee_id TEXT DEFAULT NULL,
    p_role TEXT DEFAULT 'customer',
    p_department TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    new_auth_user_id UUID;
    new_user_id UUID;
    org_id UUID;
BEGIN
    -- Get or create organization
    SELECT id INTO org_id FROM public.organizations WHERE slug = 'factory-pulse';
    IF org_id IS NULL THEN
        INSERT INTO public.organizations (id, name, slug, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Factory Pulse', 'factory-pulse', NOW(), NOW())
        RETURNING id INTO org_id;
    END IF;

    -- Create Supabase Auth user (check if exists first)
    SELECT id INTO new_auth_user_id FROM auth.users WHERE email = p_email;
    
    IF new_auth_user_id IS NULL THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role,
            aud
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            p_email,
            crypt(p_password, gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            jsonb_build_object('full_name', p_name),
            false,
            'authenticated',
            'authenticated'
        ) RETURNING id INTO new_auth_user_id;
    ELSE
        -- Update existing user password
        UPDATE auth.users SET 
            encrypted_password = crypt(p_password, gen_salt('bf')),
            updated_at = NOW()
        WHERE id = new_auth_user_id;
    END IF;

    -- Insert user profile linked to auth user (with employee_id)
    INSERT INTO public.users (
        id,
        email,
        name,
        organization_id,
        employee_id,
        role,
        department,
        phone,
        description,
        status,
        created_at,
        updated_at
    ) VALUES (
        new_auth_user_id,
        p_email,
        p_name,
        org_id,
        p_employee_id,
        p_role,
        p_department,
        p_phone,
        p_description,
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        employee_id = EXCLUDED.employee_id,
        role = EXCLUDED.role,
        department = EXCLUDED.department,
        phone = EXCLUDED.phone,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        updated_at = NOW()
    RETURNING id INTO new_user_id;

    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create all Factory Pulse accounts with authentication
-- Default password for all accounts: FactoryPulse2024!

-- Create Factory Pulse user accounts with complete details
-- Default password for all accounts: FactoryPulse2024!

-- Internal Staff (12 accounts)
-- Sales Department
SELECT create_factory_user_with_auth('nguyen.huong@factoryplus.com', 'FactoryPulse2024!', 'Nguyễn Thị Hương', 'EMP-SAL-001', 'sales', 'Sales', '+84 (28) 123-4567', 'Sales Representative - Handles customer inquiries and RFQ submissions');
SELECT create_factory_user_with_auth('tran.minh@factoryplus.com', 'FactoryPulse2024!', 'Trần Văn Minh', 'EMP-SAL-002', 'sales', 'Sales', '+84 (28) 123-4568', 'Sales Manager - Oversees sales team and approves large quotes');

-- Procurement Department  
SELECT create_factory_user_with_auth('le.duc@factoryplus.com', 'FactoryPulse2024!', 'Lê Văn Đức', 'EMP-PRO-001', 'procurement', 'Procurement', '+84 (28) 123-4569', 'Procurement Specialist - Coordinates supplier quotes and manages BOMs');
SELECT create_factory_user_with_auth('pham.lan@factoryplus.com', 'FactoryPulse2024!', 'Phạm Thị Lan', 'EMP-PRO-002', 'procurement', 'Procurement', '+84 (28) 123-4570', 'Procurement Manager - Manages supplier relationships and approves POs');

-- Engineering Department
SELECT create_factory_user_with_auth('hoang.tuan@factoryplus.com', 'FactoryPulse2024!', 'Hoàng Văn Tuấn', 'EMP-ENG-001', 'engineering', 'Engineering', '+84 (28) 123-4571', 'Design Engineer - Reviews technical designs and assesses project feasibility');
SELECT create_factory_user_with_auth('vo.mai@factoryplus.com', 'FactoryPulse2024!', 'Võ Thị Mai', 'EMP-ENG-002', 'engineering', 'Engineering', '+84 (28) 123-4572', 'Engineering Manager - Approves design changes and manages engineering projects');

-- Quality Assurance Department
SELECT create_factory_user_with_auth('dang.linh@factoryplus.com', 'FactoryPulse2024!', 'Đặng Thị Linh', 'EMP-QA-001', 'qa', 'Quality Assurance', '+84 (28) 123-4573', 'Quality Inspector - Defines inspection plans and conducts quality tests');
SELECT create_factory_user_with_auth('bui.hung@factoryplus.com', 'FactoryPulse2024!', 'Bùi Văn Hùng', 'EMP-QA-002', 'qa', 'Quality Assurance', '+84 (28) 123-4574', 'QA Manager - Approves quality plans and manages quality processes');

-- Production Department
SELECT create_factory_user_with_auth('ngo.thanh@factoryplus.com', 'FactoryPulse2024!', 'Ngô Văn Thành', 'EMP-PRD-001', 'production', 'Production', '+84 (28) 123-4575', 'Production Operator - Executes work orders and tracks production progress');
SELECT create_factory_user_with_auth('ly.hoa@factoryplus.com', 'FactoryPulse2024!', 'Lý Thị Hoa', 'EMP-PRD-002', 'production', 'Production', '+84 (28) 123-4576', 'Production Manager - Plans production schedules and manages resources');

-- Management
SELECT create_factory_user_with_auth('dinh.khoa@factoryplus.com', 'FactoryPulse2024!', 'Đinh Văn Khoa', 'EMP-MGT-001', 'management', 'Management', '+84 (28) 123-4577', 'Operations Director - Monitors departmental KPIs and approves budgets');
SELECT create_factory_user_with_auth('cao.nga@factoryplus.com', 'FactoryPulse2024!', 'Cao Thị Nga', 'EMP-EXE-001', 'admin', 'Executive', '+84 (28) 123-4578', 'General Manager - Makes strategic decisions and has full system access');

-- External Partners (4 accounts)
-- VietTech Manufacturing (Supplier)
SELECT create_factory_user_with_auth('vu.tam@viettech.com.vn', 'FactoryPulse2024!', 'Vũ Minh Tâm', 'SUP-VT-001', 'supplier', 'Sales', '+84 (274) 987-6543', 'VietTech Sales Representative - Handles RFQs and submits quotes');
SELECT create_factory_user_with_auth('do.xuan@viettech.com.vn', 'FactoryPulse2024!', 'Đỗ Thị Xuân', 'SUP-VT-002', 'supplier', 'Management', '+84 (274) 987-6544', 'VietTech Account Manager - Manages supplier relationship');

-- AutoTech Solutions (Customer)
SELECT create_factory_user_with_auth('michael.johnson@autotech.com', 'FactoryPulse2024!', 'Michael Johnson', 'CUS-AT-001', 'customer', 'Procurement', '+1 (555) 456-7890', 'AutoTech Procurement Specialist - Submits RFQs and tracks orders');
SELECT create_factory_user_with_auth('rachel.green@autotech.com', 'FactoryPulse2024!', 'Rachel Green', 'CUS-AT-002', 'customer', 'Management', '+1 (555) 456-7891', 'AutoTech Purchasing Manager - Oversees customer relationship');

-- Factory Pulse accounts created successfully

-- Clean up the function
DROP FUNCTION IF EXISTS create_factory_user_with_auth;