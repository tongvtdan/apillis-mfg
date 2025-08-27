-- Reset all user passwords to DemoFP123 for easy testing
-- This will update all auth users except dantong@apillis.com

-- First, let's see all the users that need password reset
SELECT 
    'Users that will get password reset' as info,
    email,
    raw_user_meta_data->>'display_name' as display_name,
    created_at
FROM auth.users 
WHERE email != 'dantong@apillis.com'
ORDER BY email;

-- Update all user passwords to DemoFP123
-- Note: This uses Supabase's internal password hashing
UPDATE auth.users 
SET 
    encrypted_password = crypt('DemoFP123', gen_salt('bf')),
    updated_at = NOW()
WHERE email != 'dantong@apillis.com';

-- Verify the update
SELECT 
    'Password Reset Complete' as status,
    COUNT(*) as users_updated,
    'All users can now sign in with password: DemoFP123' as message
FROM auth.users 
WHERE email != 'dantong@apillis.com';

-- Show all users that can now sign in
SELECT 
    'Ready to Sign In' as section,
    au.email,
    au.raw_user_meta_data->>'display_name' as display_name,
    u.role,
    u.status,
    'Password: DemoFP123' as password_info
FROM auth.users au
JOIN public.users u ON au.id = u.id
WHERE au.email != 'dantong@apillis.com'
ORDER BY au.email;