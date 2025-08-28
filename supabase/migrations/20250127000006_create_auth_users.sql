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
-- STEP 2: Clean up temporary function
-- ============================================================================
DROP FUNCTION IF EXISTS create_auth_user_for_existing_user(UUID, TEXT, TEXT);

-- ============================================================================
-- STEP 3: Verify auth users were created
-- ============================================================================
-- This will show the count of auth users created
SELECT 
  'Auth users created' as status,
  COUNT(*) as count 
FROM auth.users 
WHERE email IN (SELECT email FROM users);
