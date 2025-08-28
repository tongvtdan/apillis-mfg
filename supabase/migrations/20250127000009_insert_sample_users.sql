-- Migration Script: Insert sample users data directly
-- This script inserts the sample user data that should exist in the users table
-- Date: 2025-01-27

-- ============================================================================
-- STEP 1: Clear existing users table (if any)
-- ============================================================================
DELETE FROM users;

-- ============================================================================
-- STEP 2: Insert sample users with correct Supabase auth user IDs
-- ============================================================================

-- CEO User
INSERT INTO users (
    id,
    organization_id,
    email,
    name,
    role,
    department,
    phone,
    avatar_url,
    status,
    description,
    employee_id,
    direct_manager_id,
    direct_reports,
    last_login_at,
    preferences,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'ceo@factorypulse.vn',
    'Nguyễn Văn Minh',
    'management',
    'Executive',
    '+84-28-7300-0001',
    'https://storage.googleapis.com/factory-pulse-assets/avatars/ceo.jpg',
    'active',
    'CEO and General Manager with 20+ years in manufacturing',
    'EMP-NVM-550e',
    NULL,
    ARRAY['550e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440012'::uuid, '550e8400-e29b-41d4-a716-446655440013'::uuid],
    '2025-01-27T07:30:00.000Z',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "dark", "notifications": {"email": true, "sms": true, "push": true}}',
    '2025-01-27T08:00:00.000Z',
    '2025-01-27T08:00:00.000Z'
);

-- Operations Manager
INSERT INTO users (
    id,
    organization_id,
    email,
    name,
    role,
    department,
    phone,
    avatar_url,
    status,
    description,
    employee_id,
    direct_manager_id,
    direct_reports,
    last_login_at,
    preferences,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'operations@factorypulse.vn',
    'Trần Thị Hương',
    'management',
    'Operations',
    '+84-28-7300-0002',
    'https://storage.googleapis.com/factory-pulse-assets/avatars/operations.jpg',
    'active',
    'Operations Manager overseeing production and quality',
    'EMP-TTH-550e',
    '550e8400-e29b-41d4-a716-446655440002',
    ARRAY['550e8400-e29b-41d4-a716-446655440009'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid, '550e8400-e29b-41d4-a716-446655440008'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid],
    '2025-01-27T07:45:00.000Z',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": false, "push": true}}',
    '2025-01-27T08:00:00.000Z',
    '2025-01-27T08:00:00.000Z'
);

-- Quality Manager
INSERT INTO users (
    id,
    organization_id,
    email,
    name,
    role,
    department,
    phone,
    avatar_url,
    status,
    description,
    employee_id,
    direct_manager_id,
    direct_reports,
    last_login_at,
    preferences,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440001',
    'quality@factorypulse.vn',
    'Lê Văn Tuấn',
    'management',
    'Quality',
    '+84-28-7300-0003',
    'https://storage.googleapis.com/factory-pulse-assets/avatars/quality.jpg',
    'active',
    'Quality Manager ensuring compliance and standards',
    'EMP-LVT-550e',
    '550e8400-e29b-41d4-a716-446655440002',
    ARRAY['550e8400-e29b-41d4-a716-446655440008'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid],
    '2025-01-27T07:50:00.000Z',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": true, "push": true}}',
    '2025-01-27T08:00:00.000Z',
    '2025-01-27T08:00:00.000Z'
);

-- Senior Engineer
INSERT INTO users (
    id,
    organization_id,
    email,
    name,
    role,
    department,
    phone,
    avatar_url,
    status,
    description,
    employee_id,
    direct_manager_id,
    direct_reports,
    last_login_at,
    preferences,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440001',
    'senior.engineer@factorypulse.vn',
    'Phạm Văn Hùng',
    'engineering',
    'Engineering',
    '+84-28-7300-0004',
    'https://storage.googleapis.com/factory-pulse-assets/avatars/engineer.jpg',
    'active',
    'Senior Engineer with expertise in mechanical design',
    'EMP-PVH-550e',
    '550e8400-e29b-41d4-a716-446655440002',
    ARRAY[],
    '2025-01-27T08:00:00.000Z',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": false, "push": true}}',
    '2025-01-27T08:00:00.000Z',
    '2025-01-27T08:00:00.000Z'
);

-- Mechanical Engineer
INSERT INTO users (
    id,
    organization_id,
    email,
    name,
    role,
    department,
    phone,
    avatar_url,
    status,
    description,
    employee_id,
    direct_manager_id,
    direct_reports,
    last_login_at,
    preferences,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440001',
    'mechanical@factorypulse.vn',
    'Nguyễn Thị Lan',
    'engineering',
    'Engineering',
    '+84-28-7300-0005',
    'https://storage.googleapis.com/factory-pulse-assets/avatars/mechanical.jpg',
    'active',
    'Mechanical Engineer specializing in manufacturing processes',
    'EMP-NTL-550e',
    '550e8400-e29b-41d4-a716-446655440002',
    ARRAY[],
    '2025-01-27T08:05:00.000Z',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": true, "push": false}}',
    '2025-01-27T08:00:00.000Z',
    '2025-01-27T08:00:00.000Z'
);

-- QA Engineer
INSERT INTO users (
    id,
    organization_id,
    email,
    name,
    role,
    department,
    phone,
    avatar_url,
    status,
    description,
    employee_id,
    direct_manager_id,
    direct_reports,
    last_login_at,
    preferences,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440001',
    'qa@factorypulse.vn',
    'Trần Văn Dũng',
    'qa',
    'Quality Assurance',
    '+84-28-7300-0006',
    'https://storage.googleapis.com/factory-pulse-assets/avatars/qa.jpg',
    'active',
    'QA Engineer ensuring product quality standards',
    'EMP-TVD-550e',
    '550e8400-e29b-41d4-a716-446655440004',
    ARRAY[],
    '2025-01-27T08:10:00.000Z',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": false, "push": true}}',
    '2025-01-27T08:00:00.000Z',
    '2025-01-27T08:00:00.000Z'
);

-- Production Manager
INSERT INTO users (
    id,
    organization_id,
    email,
    name,
    role,
    department,
    phone,
    avatar_url,
    status,
    description,
    employee_id,
    direct_manager_id,
    direct_reports,
    last_login_at,
    preferences,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440001',
    'production@factorypulse.vn',
    'Lê Thị Mai',
    'production',
    'Production',
    '+84-28-7300-0007',
    'https://storage.googleapis.com/factory-pulse-assets/avatars/production.jpg',
    'active',
    'Production Manager overseeing manufacturing operations',
    'EMP-LTM-550e',
    '550e8400-e29b-41d4-a716-446655440003',
    ARRAY[],
    '2025-01-27T08:15:00.000Z',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": true, "push": true}}',
    '2025-01-27T08:00:00.000Z',
    '2025-01-27T08:00:00.000Z'
);

-- Sales Manager
INSERT INTO users (
    id,
    organization_id,
    email,
    name,
    role,
    department,
    phone,
    avatar_url,
    status,
    description,
    employee_id,
    direct_manager_id,
    direct_reports,
    last_login_at,
    preferences,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440009',
    '550e8400-e29b-41d4-a716-446655440001',
    'sales@factorypulse.vn',
    'Phạm Thị Hoa',
    'sales',
    'Sales',
    '+84-28-7300-0008',
    'https://storage.googleapis.com/factory-pulse-assets/avatars/sales.jpg',
    'active',
    'Sales Manager handling customer relationships',
    'EMP-PTH-550e',
    '550e8400-e29b-41d4-a716-446655440003',
    ARRAY[],
    '2025-01-27T08:20:00.000Z',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": true, "push": true}}',
    '2025-01-27T08:00:00.000Z',
    '2025-01-27T08:00:00.000Z'
);

-- Supplier Manager
INSERT INTO users (
    id,
    organization_id,
    email,
    name,
    role,
    department,
    phone,
    avatar_url,
    status,
    description,
    employee_id,
    direct_manager_id,
    direct_reports,
    last_login_at,
    preferences,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440001',
    'supplier@factorypulse.vn',
    'Nguyễn Văn Thành',
    'supplier',
    'Procurement',
    '+84-28-7300-0009',
    'https://storage.googleapis.com/factory-pulse-assets/avatars/supplier.jpg',
    'active',
    'Supplier Manager managing vendor relationships',
    'EMP-NVT-550e',
    '550e8400-e29b-41d4-a716-446655440003',
    ARRAY[],
    '2025-01-27T08:25:00.000Z',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": false, "push": true}}',
    '2025-01-27T08:00:00.000Z',
    '2025-01-27T08:00:00.000Z'
);

-- Customer Manager
INSERT INTO users (
    id,
    organization_id,
    email,
    name,
    role,
    department,
    phone,
    avatar_url,
    status,
    description,
    employee_id,
    direct_manager_id,
    direct_reports,
    last_login_at,
    preferences,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440001',
    'customer@factorypulse.vn',
    'Trần Thị Kim',
    'customer',
    'Customer Relations',
    '+84-28-7300-0010',
    'https://storage.googleapis.com/factory-pulse-assets/avatars/customer.jpg',
    'active',
    'Customer Manager ensuring customer satisfaction',
    'EMP-TTK-550e',
    '550e8400-e29b-41d4-a716-446655440003',
    ARRAY[],
    '2025-01-27T08:30:00.000Z',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": true, "push": false}}',
    '2025-01-27T08:00:00.000Z',
    '2025-01-27T08:00:00.000Z'
);

-- Admin User
INSERT INTO users (
    id,
    organization_id,
    email,
    name,
    role,
    department,
    phone,
    avatar_url,
    status,
    description,
    employee_id,
    direct_manager_id,
    direct_reports,
    last_login_at,
    preferences,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440001',
    'admin@factorypulse.vn',
    'Lê Văn Sơn',
    'admin',
    'IT',
    '+84-28-7300-0011',
    'https://storage.googleapis.com/factory-pulse-assets/avatars/admin.jpg',
    'active',
    'System Administrator managing IT infrastructure',
    'EMP-LVS-550e',
    '550e8400-e29b-41d4-a716-446655440002',
    ARRAY[],
    '2025-01-27T08:35:00.000Z',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "dark", "notifications": {"email": true, "sms": true, "push": true}}',
    '2025-01-27T08:00:00.000Z',
    '2025-01-27T08:00:00.000Z'
);

-- Support User
INSERT INTO users (
    id,
    organization_id,
    email,
    name,
    role,
    department,
    phone,
    avatar_url,
    status,
    description,
    employee_id,
    direct_manager_id,
    direct_reports,
    last_login_at,
    preferences,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440001',
    'support@factorypulse.vn',
    'Phạm Thị Nga',
    'customer',
    'Support',
    '+84-28-7300-0012',
    'https://storage.googleapis.com/factory-pulse-assets/avatars/support.jpg',
    'active',
    'Support Specialist providing customer assistance',
    'EMP-PTN-550e',
    '550e8400-e29b-41d4-a716-446655440002',
    ARRAY[],
    '2025-01-27T08:40:00.000Z',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": false, "push": true}}',
    '2025-01-27T08:00:00.000Z',
    '2025-01-27T08:00:00.000Z'
);

-- ============================================================================
-- STEP 3: Verify data insertion
-- ============================================================================
-- Check total users
SELECT COUNT(*) as total_users FROM users;

-- Check CEO user specifically
SELECT id, email, role, name, department FROM users WHERE email = 'ceo@factorypulse.vn';

-- Check all management users
SELECT id, email, role, name FROM users WHERE role = 'management' ORDER BY email;
