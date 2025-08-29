-- Fix Factory Pulse Vietnam Users - Comprehensive Update
-- This script updates existing users and creates missing ones to match our sample data

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

-- Update existing users to match our sample data
-- CEO (update existing ceo@factorypulse.vn)
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

-- Operations Manager (create new)
INSERT INTO users (id, organization_id, email, name, role, department, phone, avatar_url, status, description, employee_id, direct_reports, last_login_at, preferences, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'operations@factorypulse.vn', 'Trần Ngọc Hương', 'management', 'Operations', '+84-28-7300-0002', 'https://storage.googleapis.com/factory-pulse-assets/avatars/operations.jpg', 'active', 'Operations Manager overseeing production and quality', 'EMP-TTH-550e', ARRAY['550e8400-e29b-41d4-a716-446655440009'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid, '550e8400-e29b-41d4-a716-446655440008'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid], '2025-01-27T07:45:00.000Z', '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": false, "push": true}}', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Quality Manager (create new)
INSERT INTO users (id, organization_id, email, name, role, department, phone, avatar_url, status, description, employee_id, direct_reports, last_login_at, preferences, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'quality@factorypulse.vn', 'Lê Viết Tuấn', 'management', 'Quality', '+84-28-7300-0003', 'https://storage.googleapis.com/factory-pulse-assets/avatars/quality.jpg', 'active', 'Quality Manager ensuring compliance and standards', 'EMP-LVT-550e', ARRAY['550e8400-e29b-41d4-a716-446655440008'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid], '2025-01-27T07:50:00.000Z', '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": true, "push": true}}', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Senior Engineer (create new)
INSERT INTO users (id, organization_id, email, name, role, department, phone, avatar_url, status, description, employee_id, direct_reports, last_login_at, preferences, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'senior.engineer@factorypulse.vn', 'Phạm Văn Dũng', 'engineering', 'Engineering', '+84-28-7300-0004', 'https://storage.googleapis.com/factory-pulse-assets/avatars/senior-engineer.jpg', 'active', 'Senior Engineer with expertise in mechanical design', 'EMP-PVD-550e', ARRAY[]::uuid[], '2025-01-27T08:00:00.000Z', '{"language": "en", "timezone": "Asia/Ho_Chi_Minh", "theme": "dark", "notifications": {"email": true, "sms": false, "push": true}}', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Mechanical Engineer (update existing engineering@factorypulse.vn)
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440006',
    email = 'mechanical@factorypulse.vn',
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
WHERE email = 'engineering@factorypulse.vn';

-- Electrical Engineer (create new)
INSERT INTO users (id, organization_id, email, name, role, department, phone, avatar_url, status, description, employee_id, direct_reports, last_login_at, preferences, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 'electrical@factorypulse.vn', 'Vũ Văn Nam', 'engineering', 'Engineering', '+84-28-7300-0006', 'https://storage.googleapis.com/factory-pulse-assets/avatars/electrical-engineer.jpg', 'active', 'Electrical Engineer for controls and automation', 'EMP-VVN-550e', ARRAY[]::uuid[], '2025-01-27T08:10:00.000Z', '{"language": "en", "timezone": "Asia/Ho_Chi_Minh", "theme": "dark", "notifications": {"email": true, "sms": false, "push": true}}', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- QA Engineer (update existing qa@factorypulse.vn)
UPDATE users 
SET id = '550e8400-e29b-41d4-a716-446655440008',
    email = 'qa.engineer@factorypulse.vn',
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
WHERE email = 'qa@factorypulse.vn';

-- Production Supervisor (update existing production@factorypulse.vn)
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

-- Team Lead (create new)
INSERT INTO users (id, organization_id, email, name, role, department, phone, avatar_url, status, description, employee_id, direct_reports, last_login_at, preferences, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'team.lead@factorypulse.vn', 'Lý Văn Thành', 'production', 'Production', '+84-28-7300-0009', 'https://storage.googleapis.com/factory-pulse-assets/avatars/team-lead.jpg', 'active', 'Team Lead coordinating assembly operations', 'EMP-LVT-550e', ARRAY[]::uuid[], '2025-01-27T08:25:00.000Z', '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": false, "push": true}}', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Quality Inspector (create new)
INSERT INTO users (id, organization_id, email, name, role, department, phone, avatar_url, status, description, employee_id, direct_reports, last_login_at, preferences, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'quality.inspector@factorypulse.vn', 'Bùi Thị Hoa', 'qa', 'Quality Assurance', '+84-28-7300-0010', 'https://storage.googleapis.com/factory-pulse-assets/avatars/quality-inspector.jpg', 'active', 'Quality Inspector performing final quality checks', 'EMP-BTH-550e', ARRAY[]::uuid[], '2025-01-27T08:30:00.000Z', '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": true, "push": true}}', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Sales Manager (update existing sales@factorypulse.vn)
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

-- Procurement Specialist (update existing procurement@factorypulse.vn)
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

-- Project Coordinator (create new)
INSERT INTO users (id, organization_id, email, name, role, department, phone, avatar_url, status, description, employee_id, direct_reports, last_login_at, preferences, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'coordinator@factorypulse.vn', 'Võ Văn Phúc', 'procurement', 'Project Management', '+84-28-7300-0013', 'https://storage.googleapis.com/factory-pulse-assets/avatars/project-coordinator.jpg', 'active', 'Project Coordinator tracking project progress', 'EMP-VVP-550e', ARRAY[]::uuid[], '2025-01-27T08:45:00.000Z', '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": true, "push": true}}', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- System Administrator (update existing admin@factorypulse.vn)
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

-- Customer Service (create new)
INSERT INTO users (id, organization_id, email, name, role, department, phone, avatar_url, status, description, employee_id, direct_reports, last_login_at, preferences, created_at, updated_at) VALUES 
('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440001', 'support@factorypulse.vn', 'Phan Thị Thảo', 'sales', 'Customer Service', '+84-28-7300-0015', 'https://storage.googleapis.com/factory-pulse-assets/avatars/customer-service.jpg', 'active', 'Customer Service representative providing support', 'EMP-PTT-550e', ARRAY[]::uuid[], '2025-01-27T08:55:00.000Z', '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "theme": "light", "notifications": {"email": true, "sms": false, "push": true}}', '2025-01-27T08:00:00.000Z', '2025-01-27T08:00:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- Delete the extra users that were created by the seed file but are not needed
DELETE FROM users WHERE email IN (
    'engineering2@factorypulse.vn',
    'procurement2@factorypulse.vn', 
    'production2@factorypulse.vn',
    'qa2@factorypulse.vn',
    'sales2@factorypulse.vn'
);
