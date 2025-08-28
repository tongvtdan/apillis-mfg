-- Migration Script: Create Core Tables
-- This script creates the core tables for organizations and users
-- Date: 2025-01-27

-- ============================================================================
-- STEP 1: Create organizations table
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
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

-- ============================================================================
-- STEP 2: Create users table
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
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

-- ============================================================================
-- STEP 3: Create contacts table
-- ============================================================================
CREATE TABLE IF NOT EXISTS contacts (
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

-- ============================================================================
-- STEP 4: Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON organizations(is_active);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_plan ON organizations(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_organizations_industry ON organizations(industry);

CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_direct_manager_id ON users(direct_manager_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_company_name ON contacts(company_name);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_is_active ON contacts(is_active);
CREATE INDEX IF NOT EXISTS idx_contacts_country ON contacts(country);
CREATE INDEX IF NOT EXISTS idx_contacts_ai_risk_score ON contacts(ai_risk_score);

-- ============================================================================
-- STEP 5: Insert sample organization
-- ============================================================================
INSERT INTO organizations (id, name, slug, domain, description, industry, is_active)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Factory Pulse Vietnam Co., Ltd.',
    'factory-pulse-vietnam',
    'factorypulse.vn',
    'Leading manufacturing solutions provider in Vietnam',
    'Manufacturing',
    true
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- STEP 6: Insert sample users
-- ============================================================================
INSERT INTO users (id, organization_id, email, name, role, department, phone, status, employee_id, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'ceo@factorypulse.vn', 'Nguyễn Văn Minh', 'management', 'Executive', '+84-28-7300-0001', 'active', 'EMP-NVM-550e', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'operations@factorypulse.vn', 'Trần Thị Hương', 'management', 'Operations', '+84-28-7300-0002', 'active', 'EMP-TTH-550e', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'quality@factorypulse.vn', 'Lê Văn Tuấn', 'management', 'Quality', '+84-28-7300-0003', 'active', 'EMP-LVT-550e', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'procurement@factorypulse.vn', 'Phạm Văn Hùng', 'procurement', 'Procurement', '+84-28-7300-0004', 'active', 'EMP-PVH-550e', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'engineering@factorypulse.vn', 'Nguyễn Thị Lan', 'engineering', 'Engineering', '+84-28-7300-0005', 'active', 'EMP-NTL-550e', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 'qa@factorypulse.vn', 'Trần Văn Dũng', 'qa', 'Quality Assurance', '+84-28-7300-0006', 'active', 'EMP-TVD-550e', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'production@factorypulse.vn', 'Lê Thị Mai', 'production', 'Production', '+84-28-7300-0007', 'active', 'EMP-LTM-550e', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', 'sales@factorypulse.vn', 'Võ Văn Nam', 'sales', 'Sales', '+84-28-7300-0008', 'active', 'EMP-VVN-550e', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'supplier@factorypulse.vn', 'Nguyễn Văn Thành', 'supplier', 'Procurement', '+84-28-7300-0009', 'active', 'EMP-NVT-550e', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'customer@factorypulse.vn', 'Trần Thị Kim', 'customer', 'Customer Relations', '+84-28-7300-0010', 'active', 'EMP-TTK-550e', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'admin@factorypulse.vn', 'Lê Văn Sơn', 'admin', 'IT', '+84-28-7300-0011', 'active', 'EMP-LVS-550e', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'support@factorypulse.vn', 'Phạm Thị Nga', 'customer', 'Support', '+84-28-7300-0012', 'active', 'EMP-PTN-550e', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- STEP 7: Enable Row Level Security
-- ============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
