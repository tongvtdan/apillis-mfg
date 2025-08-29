-- Update Factory Pulse Vietnam Users to Match Sample Data
-- This script updates existing users to have the correct names and IDs

-- First, update the organization to have the correct ID and details
UPDATE organizations 
SET id = '550e8400-e29b-41d4-a716-446655440001',
    name = 'Factory Pulse Vietnam Co., Ltd.',
    logo_url = 'https://storage.googleapis.com/factory-pulse-assets/logos/fpv-logo.png',
    description = 'Leading manufacturing company specializing in precision components for automotive and aerospace industries',
    industry = 'Manufacturing',
    settings = '{"timezone": "Asia/Ho_Chi_Minh", "default_language": "vi", "default_currency": "VND", "date_format": "DD/MM/YYYY", "time_format": "24h"}',
    subscription_plan = 'enterprise',
    created_at = '2025-01-27T08:00:00.000Z',
    updated_at = '2025-01-27T08:00:00.000Z'
WHERE slug = 'factory-pulse-vietnam';

-- Update existing users to have correct names and IDs
-- CEO
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440002',
    name = 'Nguyễn Quang Minh',
    description = 'CEO and General Manager with 20+ years in manufacturing',
    employee_id = 'EMP-NVM-550e',
    direct_reports = ARRAY['550e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440012'::uuid, '550e8400-e29b-41d4-a716-446655440013'::uuid],
    avatar_url = 'https://storage.googleapis.com/factory-pulse-assets/avatars/ceo.jpg',
    last_login_at = '2025-01-27T07:30:00.000Z',
    preferences = '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "dark", "notifications": {"email": true, "sms": true, "push": true}}',
    created_at = '2025-01-27T08:00:00.000Z',
    updated_at = '2025-01-27T08:00:00.000Z'
WHERE email = 'ceo@factorypulse.vn';

-- Operations Manager
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440003',
    name = 'Trần Ngọc Hương',
    role = 'management',
    department = 'Operations',
    description = 'Operations Manager overseeing production and quality',
    employee_id = 'EMP-TTH-550e',
    direct_reports = ARRAY['550e8400-e29b-41d4-a716-446655440009'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid, '550e8400-e29b-41d4-a716-446655440008'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid],
    avatar_url = 'https://storage.googleapis.com/factory-pulse-assets/avatars/operations.jpg',
    last_login_at = '2025-01-27T07:45:00.000Z',
    preferences = '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": false, "push": true}}',
    created_at = '2025-01-27T08:00:00.000Z',
    updated_at = '2025-01-27T08:00:00.000Z'
WHERE email = 'operations@factorypulse.vn';

-- Quality Manager
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440004',
    name = 'Lê Viết Tuấn',
    role = 'management',
    department = 'Quality',
    description = 'Quality Manager ensuring compliance and standards',
    employee_id = 'EMP-LVT-550e',
    direct_reports = ARRAY['550e8400-e29b-41d4-a716-446655440008'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid],
    avatar_url = 'https://storage.googleapis.com/factory-pulse-assets/avatars/quality.jpg',
    last_login_at = '2025-01-27T07:50:00.000Z',
    preferences = '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": true, "push": true}}',
    created_at = '2025-01-27T08:00:00.000Z',
    updated_at = '2025-01-27T08:00:00.000Z'
WHERE email = 'quality@factorypulse.vn';

-- Senior Engineer
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440005',
    name = 'Phạm Văn Dũng',
    role = 'engineering',
    department = 'Engineering',
    description = 'Senior Engineer with expertise in mechanical design',
    employee_id = 'EMP-PVD-550e',
    direct_reports = ARRAY[]::uuid[],
    avatar_url = 'https://storage.googleapis.com/factory-pulse-assets/avatars/senior-engineer.jpg',
    last_login_at = '2025-01-27T08:00:00.000Z',
    preferences = '{"language": "en", "timezone": "Asia/Ho_Chi_Minh", "theme": "dark", "notifications": {"email": true, "sms": false, "push": true}}',
    created_at = '2025-01-27T08:00:00.000Z',
    updated_at = '2025-01-27T08:00:00.000Z'
WHERE email = 'senior.engineer@factorypulse.vn';

-- Mechanical Engineer
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440006',
    name = 'Hoàng Thị Mai',
    role = 'engineering',
    department = 'Engineering',
    description = 'Mechanical Engineer specializing in fabrication',
    employee_id = 'EMP-HTM-550e',
    direct_reports = ARRAY['550e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440007'::uuid],
    avatar_url = 'https://storage.googleapis.com/factory-pulse-assets/avatars/mechanical-engineer.jpg',
    last_login_at = '2025-01-27T08:05:00.000Z',
    preferences = '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": false, "push": true}}',
    created_at = '2025-01-27T08:00:00.000Z',
    updated_at = '2025-01-27T08:00:00.000Z'
WHERE email = 'mechanical@factorypulse.vn';

-- Electrical Engineer
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440007',
    name = 'Vũ Văn Nam',
    role = 'engineering',
    department = 'Engineering',
    description = 'Electrical Engineer for controls and automation',
    employee_id = 'EMP-VVN-550e',
    direct_reports = ARRAY[]::uuid[],
    avatar_url = 'https://storage.googleapis.com/factory-pulse-assets/avatars/electrical-engineer.jpg',
    last_login_at = '2025-01-27T08:10:00.000Z',
    preferences = '{"language": "en", "timezone": "Asia/Ho_Chi_Minh", "theme": "dark", "notifications": {"email": true, "sms": false, "push": true}}',
    created_at = '2025-01-27T08:00:00.000Z',
    updated_at = '2025-01-27T08:00:00.000Z'
WHERE email = 'electrical@factorypulse.vn';

-- QA Engineer
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440008',
    name = 'Ngô Thị Lan',
    role = 'qa',
    department = 'Quality Assurance',
    description = 'QA Engineer ensuring product quality standards',
    employee_id = 'EMP-NTL-550e',
    direct_reports = ARRAY[]::uuid[],
    avatar_url = 'https://storage.googleapis.com/factory-pulse-assets/avatars/qa-engineer.jpg',
    last_login_at = '2025-01-27T08:15:00.000Z',
    preferences = '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": true, "push": true}}',
    created_at = '2025-01-27T08:00:00.000Z',
    updated_at = '2025-01-27T08:00:00.000Z'
WHERE email = 'qa.engineer@factorypulse.vn';

-- Production Supervisor
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440009',
    name = 'Đặng Văn Hùng',
    role = 'production',
    department = 'Production',
    description = 'Production Supervisor managing manufacturing operations',
    employee_id = 'EMP-DVH-550e',
    direct_reports = ARRAY['550e8400-e29b-41d4-a716-446655440010'::uuid],
    avatar_url = 'https://storage.googleapis.com/factory-pulse-assets/avatars/production-supervisor.jpg',
    last_login_at = '2025-01-27T08:20:00.000Z',
    preferences = '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": true, "push": true}}',
    created_at = '2025-01-27T08:00:00.000Z',
    updated_at = '2025-01-27T08:00:00.000Z'
WHERE email = 'production@factorypulse.vn';

-- Team Lead
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440010',
    name = 'Lý Văn Thành',
    role = 'production',
    department = 'Production',
    description = 'Team Lead coordinating assembly operations',
    employee_id = 'EMP-LVT-550e',
    direct_reports = ARRAY[]::uuid[],
    avatar_url = 'https://storage.googleapis.com/factory-pulse-assets/avatars/team-lead.jpg',
    last_login_at = '2025-01-27T08:25:00.000Z',
    preferences = '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": false, "push": true}}',
    created_at = '2025-01-27T08:00:00.000Z',
    updated_at = '2025-01-27T08:00:00.000Z'
WHERE email = 'team.lead@factorypulse.vn';

-- Quality Inspector
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440011',
    name = 'Bùi Thị Hoa',
    role = 'qa',
    department = 'Quality Assurance',
    description = 'Quality Inspector performing final quality checks',
    employee_id = 'EMP-BTH-550e',
    direct_reports = ARRAY[]::uuid[],
    avatar_url = 'https://storage.googleapis.com/factory-pulse-assets/avatars/quality-inspector.jpg',
    last_login_at = '2025-01-27T08:30:00.000Z',
    preferences = '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": true, "push": true}}',
    created_at = '2025-01-27T08:00:00.000Z',
    updated_at = '2025-01-27T08:00:00.000Z'
WHERE email = 'quality.inspector@factorypulse.vn';

-- Sales Manager
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440012',
    name = 'Trịnh Văn Sơn',
    role = 'sales',
    department = 'Sales',
    description = 'Sales Manager managing customer relationships',
    employee_id = 'EMP-TVS-550e',
    direct_reports = ARRAY['550e8400-e29b-41d4-a716-446655440016'::uuid],
    avatar_url = 'https://storage.googleapis.com/factory-pulse-assets/avatars/sales-manager.jpg',
    last_login_at = '2025-01-27T08:35:00.000Z',
    preferences = '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": true, "push": true}}',
    created_at = '2025-01-27T08:00:00.000Z',
    updated_at = '2025-01-27T08:00:00.000Z'
WHERE email = 'sales@factorypulse.vn';

-- Procurement Specialist
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440013',
    name = 'Đỗ Thị Nga',
    role = 'procurement',
    department = 'Procurement',
    description = 'Procurement Specialist managing supplier relationships',
    employee_id = 'EMP-ĐTN-550e',
    direct_reports = ARRAY['550e8400-e29b-41d4-a716-446655440014'::uuid],
    avatar_url = 'https://storage.googleapis.com/factory-pulse-assets/avatars/procurement-specialist.jpg',
    last_login_at = '2025-01-27T08:40:00.000Z',
    preferences = '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": false, "push": true}}',
    created_at = '2025-01-27T08:00:00.000Z',
    updated_at = '2025-01-27T08:00:00.000Z'
WHERE email = 'procurement@factorypulse.vn';

-- Project Coordinator
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440014',
    name = 'Võ Văn Phúc',
    role = 'procurement',
    department = 'Project Management',
    description = 'Project Coordinator tracking project progress',
    employee_id = 'EMP-VVP-550e',
    direct_reports = ARRAY[]::uuid[],
    avatar_url = 'https://storage.googleapis.com/factory-pulse-assets/avatars/project-coordinator.jpg',
    last_login_at = '2025-01-27T08:45:00.000Z',
    preferences = '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": true, "push": true}}',
    created_at = '2025-01-27T08:00:00.000Z',
    updated_at = '2025-01-27T08:00:00.000Z'
WHERE email = 'coordinator@factorypulse.vn';

-- System Administrator
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440015',
    name = 'Lê Văn An',
    role = 'admin',
    department = 'IT',
    description = 'System Administrator managing technical infrastructure',
    employee_id = 'EMP-LVA-550e',
    direct_reports = ARRAY[]::uuid[],
    avatar_url = 'https://storage.googleapis.com/factory-pulse-assets/avatars/system-admin.jpg',
    last_login_at = '2025-01-27T08:50:00.000Z',
    preferences = '{"language": "en", "timezone": "Asia/Ho_Chi_Minh", "theme": "dark", "notifications": {"email": true, "sms": true, "push": true}}',
    created_at = '2025-01-27T08:00:00.000Z',
    updated_at = '2025-01-27T08:00:00.000Z'
WHERE email = 'admin@factorypulse.vn';

-- Customer Service
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440016',
    name = 'Phan Thị Thảo',
    role = 'sales',
    department = 'Customer Service',
    description = 'Customer Service representative providing support',
    employee_id = 'EMP-PTT-550e',
    direct_reports = ARRAY[]::uuid[],
    avatar_url = 'https://storage.googleapis.com/factory-pulse-assets/avatars/customer-service.jpg',
    last_login_at = '2025-01-27T08:55:00.000Z',
    preferences = '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": false, "push": true}}',
    created_at = '2025-01-27T08:00:00.000Z',
    updated_at = '2025-01-27T08:00:00.000Z'
WHERE email = 'support@factorypulse.vn';
