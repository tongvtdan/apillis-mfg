-- Check what roles are actually allowed in your database
-- This will show us the valid role values

-- Method 1: Check the constraint definition
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'users_role_check';

-- Method 2: Check existing roles in the users table
SELECT 
    'Existing Roles in Database' as info,
    role,
    COUNT(*) as count
FROM public.users 
WHERE role IS NOT NULL
GROUP BY role
ORDER BY count DESC;

-- Method 3: Check the enum type if it exists
SELECT 
    enumlabel as valid_role
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'user_role'
)
ORDER BY enumsortorder;