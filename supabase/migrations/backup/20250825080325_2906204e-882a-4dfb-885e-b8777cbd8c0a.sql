-- Create demo auth users with simple email/password combinations for testing
-- Note: These will be created in auth.users and will trigger the profile creation

-- First, let's create the auth users directly (this is a special case for demo data)
-- We'll use a function to create users with known passwords for testing

-- Create a function to insert demo users into auth.users for testing
CREATE OR REPLACE FUNCTION create_demo_auth_user(
  user_email TEXT,
  user_password TEXT,
  user_id UUID,
  user_display_name TEXT
) RETURNS UUID AS $$
DECLARE
  encrypted_pw TEXT;
  user_uuid UUID;
BEGIN
  -- Create encrypted password (simplified for demo - in production use proper hashing)
  encrypted_pw := crypt(user_password, gen_salt('bf'));
  
  -- Insert into auth.users (this is normally handled by Supabase Auth, but for demo data we do it directly)
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    user_id,
    user_email,
    encrypted_pw,
    NOW(),
    NOW(),
    NOW(),
    jsonb_build_object('display_name', user_display_name),
    false,
    'authenticated'
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;
    
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create demo users with simple credentials
SELECT create_demo_auth_user('customer@demo.com', 'demo123', '00000000-0000-0000-0000-000000000001', 'Demo Customer');
SELECT create_demo_auth_user('supplier@demo.com', 'demo123', '00000000-0000-0000-0000-000000000002', 'Demo Supplier');
SELECT create_demo_auth_user('engineer@demo.com', 'demo123', '00000000-0000-0000-0000-000000000003', 'Demo Engineer');
SELECT create_demo_auth_user('qa@demo.com', 'demo123', '00000000-0000-0000-0000-000000000004', 'Demo QA Analyst');
SELECT create_demo_auth_user('production@demo.com', 'demo123', '00000000-0000-0000-0000-000000000005', 'Demo Production Manager');
SELECT create_demo_auth_user('procurement@demo.com', 'demo123', '00000000-0000-0000-0000-000000000006', 'Demo Procurement Specialist');
SELECT create_demo_auth_user('manager@demo.com', 'demo123', '00000000-0000-0000-0000-000000000007', 'Demo Manager');

-- Drop the helper function after use
DROP FUNCTION create_demo_auth_user(TEXT, TEXT, UUID, TEXT);