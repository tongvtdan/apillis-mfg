-- Test if setup is working
-- Run this to verify your database setup

-- Check organizations
SELECT 'Organizations:' as table_name, COUNT(*) as count FROM organizations;
SELECT * FROM organizations WHERE slug = 'factory-pulse-demo';

-- Check users
SELECT 'Users:' as table_name, COUNT(*) as count FROM users;
SELECT 
    name,
    email,
    role,
    status,
    organization_id,
    created_at
FROM users 
WHERE email = 'demo@factrypulse.com';

-- Check if user has organization link
SELECT 
    u.name as user_name,
    u.email,
    u.role,
    o.name as organization_name,
    o.slug as org_slug
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id
WHERE u.email = 'demo@factrypulse.com';