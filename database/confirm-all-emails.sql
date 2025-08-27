-- Confirm all user emails so they can sign in immediately
-- This ensures no email verification is required

-- First, check current email confirmation status
SELECT 
    'Current Email Status' as info,
    email,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
        ELSE '❌ Not Confirmed'
    END as status,
    email_confirmed_at
FROM auth.users 
ORDER BY email;

-- Confirm all emails (except those already confirmed)
UPDATE auth.users 
SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Verify all emails are now confirmed
SELECT 
    'After Update' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
    CASE 
        WHEN COUNT(*) = COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) 
        THEN '✅ All emails confirmed!'
        ELSE '❌ Some emails still not confirmed'
    END as result
FROM auth.users;

-- Show final status
SELECT 
    'Final Email Status' as section,
    email,
    '✅ Ready for sign-in (after password reset)' as status
FROM auth.users 
ORDER BY email;