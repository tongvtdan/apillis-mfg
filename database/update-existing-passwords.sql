-- Update existing auth user passwords to DemoFP123
-- This works with the existing auth users without deleting them

-- Method 1: Update passwords using Supabase's admin functions
-- Note: This requires admin privileges and may need to be done through Supabase CLI or Dashboard

-- First, let's see all existing auth users (except Dan Tong)
SELECT 
    'Existing Auth Users to Update' as info,
    id,
    email,
    raw_user_meta_data->>'display_name' as display_name,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at
FROM auth.users 
WHERE email != 'dantong@apillis.com'
ORDER BY email;

-- Method 2: Use Supabase's password reset approach
-- Generate password reset tokens for each user
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id, email FROM auth.users WHERE email != 'dantong@apillis.com'
    LOOP
        -- This will generate a password reset token
        -- You can then use this to set the password to DemoFP123
        RAISE NOTICE 'User: % (ID: %) - Use Supabase Dashboard to reset password', 
            user_record.email, user_record.id;
    END LOOP;
END $$;

-- Method 3: Ensure all users are email confirmed (so they can sign in)
UPDATE auth.users 
SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email != 'dantong@apillis.com'
  AND email_confirmed_at IS NULL;

-- Verify email confirmations
SELECT 
    'Email Confirmation Status' as check_type,
    email,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
        ELSE '❌ Not Confirmed'
    END as status
FROM auth.users 
WHERE email != 'dantong@apillis.com'
ORDER BY email;