-- =========================================
-- Dashboard Tables Migration
-- Migration: Add missing tables for dashboard functionality
-- =========================================

-- =========================================
-- 1. DASHBOARD LAYOUTS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS dashboard_layouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    widgets JSONB DEFAULT '[]'::jsonb,
    background_color TEXT,
    theme TEXT DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
    is_default BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 2. INDEXES FOR PERFORMANCE
-- =========================================

-- Dashboard layouts indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_org_id ON dashboard_layouts(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_created_by ON dashboard_layouts(created_by);
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_is_default ON dashboard_layouts(is_default);

-- =========================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =========================================

-- Enable RLS
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- Dashboard layouts RLS policies
CREATE POLICY "Users can view dashboard layouts in their organization" ON dashboard_layouts
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create dashboard layouts in their organization" ON dashboard_layouts
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        ) AND created_by = auth.uid()
    );

CREATE POLICY "Users can update their own dashboard layouts" ON dashboard_layouts
    FOR UPDATE USING (
        created_by = auth.uid() AND
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own dashboard layouts" ON dashboard_layouts
    FOR DELETE USING (
        created_by = auth.uid() AND
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- =========================================
-- 4. SAMPLE DATA FOR TESTING
-- =========================================

-- Insert sample customer organizations
INSERT INTO organizations (id, name, organization_type, industry, is_active, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440010', 'TechCorp Industries', 'customer', 'Technology', true, NOW()),
('660e8400-e29b-41d4-a716-446655440011', 'Manufacturing Solutions', 'customer', 'Manufacturing', true, NOW()),
('660e8400-e29b-41d4-a716-446655440012', 'Precision Parts Co', 'customer', 'Automotive', true, NOW()),
('660e8400-e29b-41d4-a716-446655440013', 'Industrial Systems', 'customer', 'Industrial', true, NOW()),
('660e8400-e29b-41d4-a716-446655440014', 'Aerospace Components', 'customer', 'Aerospace', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample supplier organizations
INSERT INTO organizations (id, name, organization_type, industry, is_active, created_at) VALUES
('770e8400-e29b-41d4-a716-446655440010', 'Precision Manufacturing Ltd', 'supplier', 'Manufacturing', true, NOW()),
('770e8400-e29b-41d4-a716-446655440011', 'Quality Components Inc', 'supplier', 'Manufacturing', true, NOW()),
('770e8400-e29b-41d4-a716-446655440012', 'Fast Delivery Parts', 'supplier', 'Logistics', true, NOW()),
('770e8400-e29b-41d4-a716-446655440013', 'Reliable Materials Co', 'supplier', 'Materials', true, NOW()),
('770e8400-e29b-41d4-a716-446655440014', 'Tech Services Group', 'supplier', 'Services', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample contacts for customer organizations
INSERT INTO contacts (id, organization_id, type, company_name, contact_name, email, is_active, created_by) VALUES
('880e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440010', 'customer', 'TechCorp Industries', 'John Smith', 'john.smith@techcorp.com', true, '660e8400-e29b-41d4-a716-446655440003'),
('880e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440011', 'customer', 'Manufacturing Solutions', 'Sarah Johnson', 'sarah.johnson@manusol.com', true, '660e8400-e29b-41d4-a716-446655440003'),
('880e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440012', 'customer', 'Precision Parts Co', 'Mike Chen', 'mike.chen@precisionparts.com', true, '660e8400-e29b-41d4-a716-446655440003'),
('880e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440013', 'customer', 'Industrial Systems', 'Lisa Brown', 'lisa.brown@indsys.com', true, '660e8400-e29b-41d4-a716-446655440003'),
('880e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440014', 'customer', 'Aerospace Components', 'David Wilson', 'david.wilson@aerocomp.com', true, '660e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- Insert sample contacts for supplier organizations
INSERT INTO contacts (id, organization_id, type, company_name, contact_name, email, is_active, created_by) VALUES
('990e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440010', 'supplier', 'Precision Manufacturing Ltd', 'Contact Person', 'contact@precisionmfg.com', true, '660e8400-e29b-41d4-a716-446655440003'),
('990e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440011', 'supplier', 'Quality Components Inc', 'Sales Team', 'sales@qualitycomp.com', true, '660e8400-e29b-41d4-a716-446655440003'),
('990e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440012', 'supplier', 'Fast Delivery Parts', 'Orders Team', 'orders@fastdelivery.com', true, '660e8400-e29b-41d4-a716-446655440003'),
('990e8400-e29b-41d4-a716-446655440013', '770e8400-e29b-41d4-a716-446655440013', 'supplier', 'Reliable Materials Co', 'Info Team', 'info@reliablematerials.com', true, '660e8400-e29b-41d4-a716-446655440003'),
('990e8400-e29b-41d4-a716-446655440014', '770e8400-e29b-41d4-a716-446655440014', 'supplier', 'Tech Services Group', 'Services Team', 'services@techservices.com', true, '660e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- 5. COMMENTS FOR DOCUMENTATION
-- =========================================

COMMENT ON TABLE dashboard_layouts IS 'Stores user dashboard configurations and widget layouts';
COMMENT ON COLUMN dashboard_layouts.widgets IS 'JSON array of widget configurations';
