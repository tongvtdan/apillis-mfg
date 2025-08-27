-- Verify Factory Pulse Users Creation
-- Run this in Supabase SQL Editor to check if users were created successfully

-- Check all created users
SELECT 
    employee_id,
    name,
    email,
    role,
    department,
    phone,
    description,
    status,
    created_at
FROM users 
WHERE email LIKE '%factoryplus.com' 
   OR email LIKE '%viettech.com.vn' 
   OR email LIKE '%autotech.com'
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1
        WHEN 'management' THEN 2
        WHEN 'sales' THEN 3
        WHEN 'procurement' THEN 4
        WHEN 'engineering' THEN 5
        WHEN 'qa' THEN 6
        WHEN 'production' THEN 7
        WHEN 'supplier' THEN 8
        WHEN 'customer' THEN 9
        ELSE 10
    END,
    name;

-- Count users by role
SELECT 
    role,
    COUNT(*) as user_count
FROM users 
WHERE email LIKE '%factoryplus.com' 
   OR email LIKE '%viettech.com.vn' 
   OR email LIKE '%autotech.com'
GROUP BY role
ORDER BY user_count DESC;

-- Check organization
SELECT 
    o.name as organization_name,
    o.slug,
    COUNT(u.id) as total_users
FROM organizations o
LEFT JOIN users u ON o.id = u.organization_id
WHERE o.slug = 'factory-pulse'
GROUP BY o.id, o.name, o.slug;