-- Factory Pulse Organization & User Enhancements Migration
-- Migration: 20250127000005_organization_user_enhancements.sql
-- Description: Add description and industry fields to organizations; add description, direct manager, direct reports, and employee ID to users
-- Date: 2025-01-27

-- 1. Add new columns to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS industry VARCHAR(100);

-- 2. Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS direct_manager_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS direct_reports UUID[] DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_industry ON organizations(industry);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_direct_manager_id ON users(direct_manager_id);

-- Update existing sample data with new fields for organizations
UPDATE organizations 
SET 
    description = 'Leading manufacturing company specializing in precision components for automotive and aerospace industries',
    industry = 'Manufacturing'
WHERE id = '550e8400-e29b-41d4-a716-446655440001' 
AND description IS NULL;

-- Update existing sample data with new fields for users
UPDATE users 
SET 
    employee_id = 'EMP-' || UPPER(LEFT(name, 3)) || '-' || SUBSTRING(id::text, 1, 4),
    description = CASE 
        WHEN role = 'management' AND department = 'Executive' THEN 'CEO and General Manager with 20+ years in manufacturing'
        WHEN role = 'management' AND department = 'Operations' THEN 'Operations Manager overseeing production and quality'
        WHEN role = 'management' AND department = 'Quality' THEN 'Quality Manager ensuring compliance and standards'
        WHEN role = 'engineering' THEN 'Engineer with expertise in ' || department || ' design'
        WHEN role = 'qa' THEN 'QA specialist ensuring product quality standards'
        WHEN role = 'production' THEN 'Production team member managing manufacturing operations'
        WHEN role = 'sales' THEN 'Sales representative managing customer relationships'
        WHEN role = 'procurement' THEN 'Procurement specialist managing supplier relationships'
        WHEN role = 'admin' THEN 'System administrator managing technical infrastructure'
        ELSE 'Valued team member'
    END
WHERE employee_id IS NULL;

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to update updated_at when records are modified
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON organizations
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();