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
-- 2. CUSTOMERS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    website TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect', 'archived')),
    annual_revenue NUMERIC(18,2),
    industry TEXT,
    customer_since DATE,
    credit_limit NUMERIC(18,2),
    payment_terms TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================
-- 3. SUPPLIERS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    website TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'archived')),
    supplier_type TEXT DEFAULT 'component' CHECK (supplier_type IN ('component', 'service', 'material', 'equipment')),
    capabilities TEXT[],
    certifications TEXT[],
    quality_rating NUMERIC(3,2) CHECK (quality_rating >= 0 AND quality_rating <= 5),
    delivery_rating NUMERIC(3,2) CHECK (delivery_rating >= 0 AND delivery_rating <= 5),
    price_rating NUMERIC(3,2) CHECK (price_rating >= 0 AND price_rating <= 5),
    overall_rating NUMERIC(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
    lead_time_days INTEGER,
    minimum_order_value NUMERIC(18,2),
    payment_terms TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================
-- 4. INDEXES FOR PERFORMANCE
-- =========================================

-- Dashboard layouts indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_org_id ON dashboard_layouts(organization_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_created_by ON dashboard_layouts(created_by);
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_is_default ON dashboard_layouts(is_default);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_org_id ON customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_company_name ON customers(company_name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Suppliers indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_org_id ON suppliers(organization_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_supplier_type ON suppliers(supplier_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_overall_rating ON suppliers(overall_rating);

-- =========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =========================================

-- Enable RLS
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

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

-- Customers RLS policies
CREATE POLICY "Users can view customers in their organization" ON customers
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create customers in their organization" ON customers
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update customers in their organization" ON customers
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete customers in their organization" ON customers
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Suppliers RLS policies
CREATE POLICY "Users can view suppliers in their organization" ON suppliers
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create suppliers in their organization" ON suppliers
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update suppliers in their organization" ON suppliers
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete suppliers in their organization" ON suppliers
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- =========================================
-- 6. SAMPLE DATA FOR TESTING
-- =========================================

-- Insert sample customers
INSERT INTO customers (id, organization_id, name, company_name, email, status, annual_revenue, industry, created_by) VALUES
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'John Smith', 'TechCorp Industries', 'john.smith@techcorp.com', 'active', 5000000.00, 'Technology', '660e8400-e29b-41d4-a716-446655440003'),
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Sarah Johnson', 'Manufacturing Solutions', 'sarah.johnson@manusol.com', 'active', 3200000.00, 'Manufacturing', '660e8400-e29b-41d4-a716-446655440003'),
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Mike Chen', 'Precision Parts Co', 'mike.chen@precisionparts.com', 'prospect', 1800000.00, 'Automotive', '660e8400-e29b-41d4-a716-446655440003'),
('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'Lisa Brown', 'Industrial Systems', 'lisa.brown@indsys.com', 'active', 7500000.00, 'Industrial', '660e8400-e29b-41d4-a716-446655440003'),
('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', 'David Wilson', 'Aerospace Components', 'david.wilson@aerocomp.com', 'active', 12000000.00, 'Aerospace', '660e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- Insert sample suppliers
INSERT INTO suppliers (id, organization_id, name, company_name, email, status, supplier_type, quality_rating, delivery_rating, price_rating, overall_rating, lead_time_days, created_by) VALUES
('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Precision Manufacturing Ltd', 'Precision Manufacturing Ltd', 'contact@precisionmfg.com', 'active', 'component', 4.8, 4.5, 4.2, 4.5, 14, '660e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Quality Components Inc', 'Quality Components Inc', 'sales@qualitycomp.com', 'active', 'component', 4.6, 4.7, 4.0, 4.4, 21, '660e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Fast Delivery Parts', 'Fast Delivery Parts', 'orders@fastdelivery.com', 'active', 'component', 4.2, 4.9, 3.8, 4.3, 7, '660e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'Reliable Materials Co', 'Reliable Materials Co', 'info@reliablematerials.com', 'active', 'material', 4.7, 4.3, 4.1, 4.4, 10, '660e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', 'Tech Services Group', 'Tech Services Group', 'services@techservices.com', 'active', 'service', 4.5, 4.6, 4.3, 4.5, 5, '660e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- 7. COMMENTS FOR DOCUMENTATION
-- =========================================

COMMENT ON TABLE dashboard_layouts IS 'Stores user dashboard configurations and widget layouts';
COMMENT ON TABLE customers IS 'Customer information and relationship data';
COMMENT ON TABLE suppliers IS 'Supplier information and performance ratings';

COMMENT ON COLUMN dashboard_layouts.widgets IS 'JSON array of widget configurations';
COMMENT ON COLUMN customers.annual_revenue IS 'Customer annual revenue for business intelligence';
COMMENT ON COLUMN suppliers.overall_rating IS 'Calculated overall supplier performance rating';
