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
