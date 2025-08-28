-- Migration Script: Create Authentication Users
-- This script creates auth users for existing database users
-- Date: 2025-01-27

-- ============================================================================
-- STEP 1: Create authentication users for existing database users
-- ============================================================================

-- Function to create auth user with default password
CREATE OR REPLACE FUNCTION create_auth_user_for_existing_user(
  user_id UUID,
  user_email TEXT,
  user_password TEXT DEFAULT 'Password123!'
) RETURNS UUID AS $$
DECLARE
  auth_user_id UUID;
BEGIN
  -- Create user in auth.users table using the existing UUID
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at,
    is_anonymous
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', -- default instance_id
    user_id, -- use the existing UUID from custom users table
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')), -- hash password with bcrypt
    NOW(), -- email_confirmed_at
    NULL, -- invited_at
    '', -- confirmation_token
    NULL, -- confirmation_sent_at
    '', -- recovery_token
    NULL, -- recovery_sent_at
    '', -- email_change_token_new
    '', -- email_change
    NULL, -- email_change_sent_at
    NULL, -- last_sign_in_at
    '{}', -- raw_app_meta_data
    '{}', -- raw_user_meta_data
    false, -- is_super_admin
    NOW(), -- created_at
    NOW(), -- updated_at
    NULL, -- phone
    NULL, -- phone_confirmed_at
    '', -- phone_change
    '', -- phone_change_token
    NULL, -- phone_change_sent_at
    '', -- email_change_token_current
    0, -- email_change_confirm_status
    NULL, -- banned_until
    '', -- reauthentication_token
    NULL, -- reauthentication_sent_at
    false, -- is_sso_user
    NULL, -- deleted_at
    false -- is_anonymous
  ) RETURNING id INTO auth_user_id;
  
  RETURN auth_user_id;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, return existing ID
    SELECT id INTO auth_user_id FROM auth.users WHERE email = user_email LIMIT 1;
    RETURN auth_user_id;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create auth user: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create auth users for existing database users
DO $$
DECLARE
  user_record RECORD;
  auth_user_id UUID;
BEGIN
  -- Loop through existing users and create auth users
  FOR user_record IN 
    SELECT id, email, name, role FROM users 
    WHERE email IS NOT NULL AND email != ''
  LOOP
    BEGIN
      -- Create auth user with default password using existing UUID
      auth_user_id := create_auth_user_for_existing_user(user_record.id, user_record.email, 'Password123!');
      
      -- Create identity record
      INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        user_record.id, -- use the same UUID
        user_record.id, -- use the same UUID
        user_record.email, -- provider_id should be the email for email auth
        jsonb_build_object(
          'sub', user_record.id,
          'email', user_record.email,
          'name', user_record.name,
          'role', user_record.role
        ),
        'email',
        NOW(),
        NOW(),
        NOW()
      ) ON CONFLICT (id) DO NOTHING;
      
      RAISE NOTICE 'Created auth user for: % (%) with ID: %', user_record.email, user_record.name, user_record.id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create auth user for %: %', user_record.email, SQLERRM;
    END;
  END LOOP;
END $$;

-- ============================================================================
-- STEP 2: Create user mapping table and trigger function
-- ============================================================================
-- Create mapping table to link emails with auth user IDs
CREATE TABLE IF NOT EXISTS email_to_user_id_mapping (
    email TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert mapping for existing auth users
INSERT INTO email_to_user_id_mapping (email, user_id)
SELECT 
    email,
    id as user_id
FROM auth.users 
WHERE email IN (
    'ceo@factorypulse.vn',
    'operations@factorypulse.vn',
    'quality@factorypulse.vn',
    'procurement@factorypulse.vn',
    'engineering@factorypulse.vn',
    'qa@factorypulse.vn',
    'production@factorypulse.vn',
    'sales@factorypulse.vn',
    'supplier@factorypulse.vn',
    'customer@factorypulse.vn',
    'admin@factorypulse.vn',
    'support@factorypulse.vn'
)
ON CONFLICT (email) DO UPDATE SET 
    user_id = EXCLUDED.user_id,
    created_at = NOW();

-- Update users table with the correct auth user IDs
UPDATE users 
SET user_id = mapping.user_id
FROM email_to_user_id_mapping mapping
WHERE users.email = mapping.email;

-- Create function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
BEGIN
    -- Get the default organization
    SELECT id INTO org_id FROM public.organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1;
    
    -- Insert new user into users table
    INSERT INTO public.users (
        id,
        user_id,
        organization_id,
        email,
        name,
        role,
        status,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(), -- Generate new UUID for custom users table
        NEW.id, -- Use auth user ID for linking
        org_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'customer', -- Default role for new users
        'active',
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 3: Clean up temporary function
-- ============================================================================
DROP FUNCTION IF EXISTS create_auth_user_for_existing_user(UUID, TEXT, TEXT);

-- ============================================================================
-- STEP 4: Add organization_id to admin users if missing
-- ============================================================================
UPDATE users 
SET organization_id = (
  SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1
)
WHERE organization_id IS NULL 
AND role = 'admin';

-- ============================================================================
-- STEP 5: Verify auth users were created and mapped
-- ============================================================================
-- This will show the count of auth users created and mapped
SELECT 
    'Auth users created and mapped' as status,
    COUNT(*) as total_users,
    COUNT(user_id) as linked_users,
    COUNT(*) - COUNT(user_id) as unlinked_users
FROM users;

-- Add comments for documentation
COMMENT ON TABLE email_to_user_id_mapping IS 'Mapping table linking email addresses to Supabase Auth user IDs';
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user profile when auth user is created';
