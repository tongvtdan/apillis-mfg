-- After deletion, create fresh demo accounts with known structure
-- Run this after deleting all accounts except Dan Tong

-- Ensure we have the organization
INSERT INTO public.organizations (id, name, slug, domain, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Factory Pulse Demo',
    'factory-pulse-demo',
    'factrypulse.com',
    true,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Create a helper function to show what demo accounts to create
CREATE OR REPLACE FUNCTION show_demo_accounts_to_create() 
RETURNS TABLE(
    email TEXT,
    display_name TEXT,
    role TEXT,
    password TEXT,
    instructions TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        demo.email::TEXT,
        demo.display_name::TEXT,
        demo.role::TEXT,
        'Demo@123'::TEXT as password,
        'Create in Supabase Dashboard'::TEXT as instructions
    FROM (VALUES
        -- Factory Plus Team
        ('demo.manager@factoryplus.com', 'Demo Manager', 'management'),
        ('demo.engineer@factoryplus.com', 'Demo Engineer', 'engineering'),
        ('demo.qa@factoryplus.com', 'Demo QA', 'qa'),
        ('demo.production@factoryplus.com', 'Demo Production', 'production'),
        ('demo.procurement@factoryplus.com', 'Demo Procurement', 'procurement'),
        ('demo.sales@factoryplus.com', 'Demo Sales', 'sales'),
        
        -- External Partners
        ('demo.supplier@viettech.com.vn', 'Demo Supplier', 'supplier'),
        ('demo.customer@autotech.com', 'Demo Customer', 'customer'),
        
        -- Admin
        ('admin@factoryplus.com', 'System Admin', 'admin')
    ) AS demo(email, display_name, role);
END;
$$ LANGUAGE plpgsql;

-- Show the demo accounts to create
SELECT * FROM show_demo_accounts_to_create();

-- Instructions
SELECT 
    '📋 INSTRUCTIONS' as section,
    'Go to Supabase Dashboard → Authentication → Users' as step_1,
    'Click "Add user" for each account above' as step_2,
    'Use password: DemoFP123 for all accounts' as step_3,
    'Check "Email confirmed" for immediate access' as step_4,
    'The system will auto-create database records' as step_5;

-- Clean up the helper function
DROP FUNCTION show_demo_accounts_to_create();