-- Simple Factory Pulse User Creation Script
-- Run this manually in your Supabase SQL editor

-- Create basic users with authentication
-- Password for all accounts: FactoryPulse2024!

-- First, let's create a simple function that works with existing schema
CREATE OR REPLACE FUNCTION create_simple_user(
    p_email TEXT,
    p_name TEXT,
    p_role TEXT DEFAULT 'customer',
    p_department TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
    org_id UUID;
BEGIN
    -- Get organization ID
    SELECT id INTO org_id FROM public.organizations WHERE slug = 'factory-pulse' LIMIT 1;
    
    -- If no organization exists, create one
    IF org_id IS NULL THEN
        INSERT INTO public.organizations (id, name, slug, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Factory Pulse', 'factory-pulse', NOW(), NOW())
        RETURNING id INTO org_id;
    END IF;

    -- Insert user (only using columns that exist)
    INSERT INTO public.users (
        id,
        email,
        name,
        organization_id,
        role,
        department,
        phone,
        status,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        p_email,
        p_name,
        org_id,
        p_role,
        p_department,
        p_phone,
        'active',
        NOW(),
        NOW()
    ) 
    ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        department = EXCLUDED.department,
        phone = EXCLUDED.phone,
        updated_at = NOW()
    RETURNING id INTO new_user_id;

    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Factory Pulse users
SELECT create_simple_user('nguyen.huong@factoryplus.com', 'Nguyễn Thị Hương', 'sales', 'Sales', '+84 (28) 123-4567');
SELECT create_simple_user('tran.minh@factoryplus.com', 'Trần Văn Minh', 'sales', 'Sales', '+84 (28) 123-4568');
SELECT create_simple_user('le.duc@factoryplus.com', 'Lê Văn Đức', 'procurement', 'Procurement', '+84 (28) 123-4569');
SELECT create_simple_user('pham.lan@factoryplus.com', 'Phạm Thị Lan', 'procurement', 'Procurement', '+84 (28) 123-4570');
SELECT create_simple_user('hoang.tuan@factoryplus.com', 'Hoàng Văn Tuấn', 'engineering', 'Engineering', '+84 (28) 123-4571');
SELECT create_simple_user('vo.mai@factoryplus.com', 'Võ Thị Mai', 'engineering', 'Engineering', '+84 (28) 123-4572');
SELECT create_simple_user('dang.linh@factoryplus.com', 'Đặng Thị Linh', 'qa', 'Quality Assurance', '+84 (28) 123-4573');
SELECT create_simple_user('bui.hung@factoryplus.com', 'Bùi Văn Hùng', 'qa', 'Quality Assurance', '+84 (28) 123-4574');
SELECT create_simple_user('ngo.thanh@factoryplus.com', 'Ngô Văn Thành', 'production', 'Production', '+84 (28) 123-4575');
SELECT create_simple_user('ly.hoa@factoryplus.com', 'Lý Thị Hoa', 'production', 'Production', '+84 (28) 123-4576');
SELECT create_simple_user('dinh.khoa@factoryplus.com', 'Đinh Văn Khoa', 'management', 'Management', '+84 (28) 123-4577');
SELECT create_simple_user('cao.nga@factoryplus.com', 'Cao Thị Nga', 'admin', 'Executive', '+84 (28) 123-4578');

-- External Partners
SELECT create_simple_user('vu.tam@viettech.com.vn', 'Vũ Minh Tâm', 'supplier', NULL, '+84 (274) 987-6543');
SELECT create_simple_user('do.xuan@viettech.com.vn', 'Đỗ Thị Xuân', 'supplier', NULL, '+84 (274) 987-6544');
SELECT create_simple_user('michael.johnson@autotech.com', 'Michael Johnson', 'customer', NULL, '+1 (555) 456-7890');
SELECT create_simple_user('rachel.green@autotech.com', 'Rachel Green', 'customer', NULL, '+1 (555) 456-7891');

-- Clean up
DROP FUNCTION create_simple_user;

-- Verify users were created
SELECT 
    name,
    email,
    role,
    department,
    phone,
    status,
    created_at
FROM users 
WHERE email LIKE '%factoryplus.com' 
   OR email LIKE '%viettech.com.vn' 
   OR email LIKE '%autotech.com'
ORDER BY role, name;