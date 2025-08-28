-- Factory Pulse Core Tables Migration
-- Migration: 20250127000001_core_tables.sql
-- Description: Core tables for organizations, users, and contacts
-- Date: 2025-01-27

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Organizations (Multi-tenancy support)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    logo_url TEXT,
    description TEXT,
    industry VARCHAR(100),
    settings JSONB DEFAULT '{}',
    subscription_plan VARCHAR(50) DEFAULT 'starter' 
      CHECK (subscription_plan IN ('starter', 'growth', 'enterprise', 'trial', 'suspended', 'cancelled')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User profiles with role-based access
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL 
      CHECK (role IN ('customer', 'sales', 'procurement', 'engineering', 'qa', 'production', 'management', 'supplier', 'admin')),
    department VARCHAR(100),
    phone VARCHAR(50),
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'active' 
      CHECK (status IN ('active', 'dismiss')),
    description TEXT,
    employee_id VARCHAR(50),
    direct_manager_id UUID REFERENCES users(id),
    direct_reports UUID[] DEFAULT '{}',
    last_login_at TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. External contacts (customers and suppliers)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('customer', 'supplier')),
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Vietnam',
    postal_code VARCHAR(20),
    website VARCHAR(255),
    tax_id VARCHAR(100),
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    -- AI-ready fields
    ai_category JSONB DEFAULT '{}',
    ai_capabilities JSONB DEFAULT '[]',
    ai_risk_score DECIMAL(5,2), -- 0-100
    ai_last_analyzed TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_direct_manager_id ON users(direct_manager_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_company_name ON contacts(company_name);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_is_active ON contacts(is_active);
CREATE INDEX idx_contacts_country ON contacts(country);
CREATE INDEX idx_contacts_ai_risk_score ON contacts(ai_risk_score);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);
CREATE INDEX idx_organizations_subscription_plan ON organizations(subscription_plan);
CREATE INDEX idx_organizations_industry ON organizations(industry);

-- Enable Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create triggers for automation
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA INITIALIZATION FOR TESTING
-- ============================================================================
-- Initialize sample data for testing (optional - can be removed for production)
-- This provides a starting point for development and testing

-- Sample organization data
INSERT INTO organizations (id, name, slug, domain, logo_url, description, industry, settings, subscription_plan, is_active) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Factory Pulse Vietnam Co., Ltd.',
    'factory-pulse-vietnam',
    'factorypulse.vn',
    'https://storage.googleapis.com/factory-pulse-assets/logos/fpv-logo.png',
    'Leading manufacturing company specializing in precision components for automotive and aerospace industries',
    'Manufacturing',
    '{"timezone": "Asia/Ho_Chi_Minh", "default_language": "vi", "default_currency": "VND", "date_format": "DD/MM/YYYY", "working_hours": {"monday": {"start": "08:00", "end": "17:00"}, "tuesday": {"start": "08:00", "end": "17:00"}, "wednesday": {"start": "08:00", "end": "17:00"}, "thursday": {"start": "08:00", "end": "17:00"}, "friday": {"start": "08:00", "end": "17:00"}, "saturday": {"start": "08:00", "end": "12:00"}, "sunday": {"start": "00:00", "end": "00:00"}}, "holidays": ["2025-01-01", "2025-02-09", "2025-02-10", "2025-02-11", "2025-04-30", "2025-05-01", "2025-09-02", "2025-09-03"], "notification_preferences": {"email_notifications": true, "sms_notifications": true, "push_notifications": true, "auto_advance_workflow": true, "escalation_enabled": true}, "workflow_settings": {"auto_advance_enabled": true, "approval_required_for_stages": ["quoted", "order_confirmed"], "default_reviewers": {"engineering": ["senior_engineer", "mechanical_engineer"], "quality": ["qa_engineer", "quality_inspector"], "production": ["production_supervisor", "team_lead"]}}, "supplier_management": {"auto_qualification_enabled": true, "performance_tracking": true, "risk_assessment_enabled": true, "default_evaluation_criteria": ["price", "quality", "delivery", "service"]}, "document_management": {"auto_versioning": true, "approval_workflow": true, "access_control": true, "audit_trail": true, "file_size_limit_mb": 100, "allowed_file_types": ["pdf", "dwg", "step", "xlsx", "docx", "png", "jpg"]}, "ai_features": {"document_extraction": true, "supplier_categorization": true, "risk_assessment": true, "bom_generation": true, "quote_analysis": true}, "localization": {"supported_languages": ["vi", "en", "th", "ms", "id"], "supported_currencies": ["VND", "USD", "EUR", "THB", "MYR", "IDR", "PHP", "SGD"], "address_format": "vietnam", "phone_format": "vietnam"}}',
    'enterprise',
    true
);

-- Sample user data with enhanced fields
INSERT INTO users (id, organization_id, email, name, role, department, phone, status, description, employee_id, preferences) VALUES
(
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'ceo@factorypulse.vn',
    'Nguyen Van A',
    'management',
    'Executive',
    '+84-28-7300-1001',
    'active',
    'CEO and General Manager with 20+ years in manufacturing',
    'EMP-NGU-550e',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"email": true, "sms": false, "push": true}}'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'operations@factorypulse.vn',
    'Tran Thi B',
    'management',
    'Operations',
    '+84-28-7300-1002',
    'active',
    'Operations Manager overseeing production and quality',
    'EMP-TRA-550e',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"email": true, "sms": true, "push": true}}'
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440001',
    'quality@factorypulse.vn',
    'Le Van C',
    'management',
    'Quality',
    '+84-28-7300-1003',
    'active',
    'Quality Manager ensuring compliance and standards',
    'EMP-LEV-550e',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"email": true, "sms": false, "push": true}}'
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440001',
    'senior.engineer@factorypulse.vn',
    'Pham Thi D',
    'engineering',
    'Mechanical',
    '+84-28-7300-1004',
    'active',
    'Engineer with expertise in Mechanical design',
    'EMP-PHA-550e',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"email": true, "sms": false, "push": true}}'
),
(
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440001',
    'mechanical@factorypulse.vn',
    'Hoang Van E',
    'engineering',
    'Mechanical',
    '+84-28-7300-1005',
    'active',
    'Engineer with expertise in Mechanical design',
    'EMP-HOA-550e',
    '{"language": "vi", "timezone": "Asia/Ho_Chi_Minh", "notifications": {"email": true, "sms": false, "push": true}}'
);

-- Sample contact data
INSERT INTO contacts (id, organization_id, type, company_name, contact_name, email, phone, address, city, country, is_active, notes, ai_category, ai_capabilities, ai_risk_score) VALUES
(
    '550e8400-e29b-41d4-a716-446655440101',
    '550e8400-e29b-41d4-a716-446655440001',
    'customer',
    'Toyota Vietnam',
    'Nguyen Van F',
    'procurement@toyota.vn',
    '+84-28-7300-2001',
    '123 Đường Võ Văn Ngân, Quận Thủ Đức',
    'Ho Chi Minh City',
    'Vietnam',
    true,
    'Major automotive manufacturer, reliable customer',
    '{"industry": "automotive", "size": "enterprise", "region": "vietnam"}',
    '["automotive_manufacturing", "quality_standards", "just_in_time"]',
    15.5
),
(
    '550e8400-e29b-41d4-a716-446655440102',
    '550e8400-e29b-41d4-a716-446655440001',
    'customer',
    'Honda Vietnam',
    'Tran Thi G',
    'purchasing@honda.vn',
    '+84-28-7300-2002',
    '456 Đường Lê Văn Việt, Quận 9',
    'Ho Chi Minh City',
    'Vietnam',
    true,
    'Motorcycle manufacturer, expanding operations',
    '{"industry": "automotive", "size": "enterprise", "region": "vietnam"}',
    '["motorcycle_manufacturing", "quality_standards", "lean_manufacturing"]',
    18.2
),
(
    '550e8400-e29b-41d4-a716-446655440109',
    '550e8400-e29b-41d4-a716-446655440001',
    'supplier',
    'Precision Machining Co.',
    'Le Van H',
    'sales@precisionmachining.vn',
    '+84-28-7300-3001',
    '123 Đường Tân Phú, Quận 7',
    'Ho Chi Minh City',
    'Vietnam',
    true,
    'High-precision machining supplier, ISO certified',
    '{"industry": "machining", "size": "medium", "region": "vietnam"}',
    '["precision_machining", "cnc_turning", "quality_certification"]',
    25.8
);

-- ============================================================================
-- AUTHENTICATION SETUP FOR TESTING
-- ============================================================================
-- Create authentication accounts for internal users and external contacts
-- This allows testing the frontend from different user perspectives

-- Create authentication accounts for internal users (Factory Pulse staff)
-- Note: These will be created in the auth.users table by Supabase
-- Passwords are set to 'password123' for testing (change in production)

-- CEO Account
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'ceo@factorypulse.vn',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"], "role": "management", "department": "Executive", "user_type": "internal"}',
    '{"name": "Nguyen Van A", "organization_id": "550e8400-e29b-41d4-a716-446655440001", "phone": "+84-28-7300-1001"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Operations Manager Account
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'operations@factorypulse.vn',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"], "role": "management", "department": "Operations", "user_type": "internal"}',
    '{"name": "Tran Thi B", "organization_id": "550e8400-e29b-41d4-a716-446655440001", "phone": "+84-28-7300-1002"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Quality Manager Account
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'quality@factorypulse.vn',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"], "role": "management", "department": "Quality", "user_type": "internal"}',
    '{"name": "Le Van C", "organization_id": "550e8400-e29b-41d4-a716-446655440001", "phone": "+84-28-7300-1003"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Senior Engineer Account
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'senior.engineer@factorypulse.vn',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"], "role": "engineering", "department": "Mechanical", "user_type": "internal"}',
    '{"name": "Pham Thi D", "organization_id": "550e8400-e29b-41d4-a716-446655440001", "phone": "+84-28-7300-1004"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Mechanical Engineer Account
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440006',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'mechanical@factorypulse.vn',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"], "role": "engineering", "department": "Mechanical", "user_type": "internal"}',
    '{"name": "Hoang Van E", "organization_id": "550e8400-e29b-41d4-a716-446655440001", "phone": "+84-28-7300-1005"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- ============================================================================
-- EXTERNAL CONTACT AUTHENTICATION ACCOUNTS
-- ============================================================================
-- Create authentication accounts for external contacts (customers and suppliers)
-- This allows testing the frontend from customer and supplier perspectives

-- Toyota Vietnam Customer Account
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440101',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'procurement@toyota.vn',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"], "role": "customer", "user_type": "external", "contact_id": "550e8400-e29b-41d4-a716-446655440101"}',
    '{"name": "Nguyen Van F", "company_name": "Toyota Vietnam", "organization_id": "550e8400-e29b-41d4-a716-446655440001", "phone": "+84-28-7300-2001", "type": "customer"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Honda Vietnam Customer Account
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440102',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'purchasing@honda.vn',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"], "role": "customer", "user_type": "external", "contact_id": "550e8400-e29b-41d4-a716-446655440102"}',
    '{"name": "Tran Thi G", "company_name": "Honda Vietnam", "organization_id": "550e8400-e29b-41d4-a716-446655440001", "phone": "+84-28-7300-2002", "type": "customer"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Precision Machining Supplier Account
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440109',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'sales@precisionmachining.vn',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"], "role": "supplier", "user_type": "external", "contact_id": "550e8400-e29b-41d4-a716-446655440109"}',
    '{"name": "Le Van H", "company_name": "Precision Machining Co.", "organization_id": "550e8400-e29b-41d4-a716-446655440001", "phone": "+84-28-7300-3001", "type": "supplier"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- ============================================================================
-- AUTHENTICATION TESTING INFORMATION
-- ============================================================================
-- All accounts created with password: 'password123'
-- 
-- INTERNAL USERS (Factory Pulse Staff):
-- - ceo@factorypulse.vn (CEO - Management)
-- - operations@factorypulse.vn (Operations Manager)
-- - quality@factorypulse.vn (Quality Manager)
-- - senior.engineer@factorypulse.vn (Senior Engineer)
-- - mechanical@factorypulse.vn (Mechanical Engineer)
--
-- EXTERNAL CONTACTS (Customers & Suppliers):
-- - procurement@toyota.vn (Toyota Vietnam - Customer)
-- - purchasing@honda.vn (Honda Vietnam - Customer)
-- - sales@precisionmachining.vn (Precision Machining - Supplier)
--
-- These accounts allow testing the frontend from different user perspectives
-- and testing role-based access control and multi-tenancy features.
