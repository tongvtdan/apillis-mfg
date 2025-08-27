-- Create new test accounts with known passwords for all existing users
-- This creates new auth entries with password DemoFP123

-- First, let's see what users we need to recreate
SELECT 
    'Existing Users to Recreate' as info,
    u.email,
    u.name,
    u.role,
    u.status
FROM public.users u
WHERE u.email != 'dantong@apillis.com'
ORDER BY u.email;

-- Note: You'll need to run these INSERT statements one by one in Supabase
-- or use the Supabase Dashboard to create users with password DemoFP123

-- Create a function to help with user creation
CREATE OR REPLACE FUNCTION create_demo_user(
    user_email TEXT,
    user_name TEXT,
    user_role TEXT DEFAULT 'customer'
) RETURNS TEXT AS $$
BEGIN
    -- This function will help track what users need to be created
    -- You'll still need to create them manually in Supabase Dashboard
    
    RETURN 'Create user: ' || user_email || ' with password DemoFP123 and name: ' || user_name;
END;
$$ LANGUAGE plpgsql;

-- Generate the list of users that need to be created manually
SELECT 
    create_demo_user(u.email, u.name, u.role) as instruction
FROM public.users u
WHERE u.email != 'dantong@apillis.com'
ORDER BY u.email;