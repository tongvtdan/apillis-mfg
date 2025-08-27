-- Enhanced Factory Pulse Database Schema Migration
-- This migration creates the new enhanced schema while preserving existing data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. ORGANIZATIONS & USERS
-- =============================================

-- Organizations table (Multi-tenancy support)
CREATE TABLE IF NOT EXISTS organizations (
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

-- Create default organization if none exists
INSERT INTO organizations (name, slug, domain, is_active)
SELECT 'Factory Pulse', 'factory-pulse', 'factorypluse.com', true
WHERE NOT EXISTS (SELECT 1 FROM organizations);

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add organization_id to existing users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'organization_id') THEN
        ALTER TABLE users ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
        
        -- Set default organization for existing users
        UPDATE users SET organization_id = (SELECT id FROM organizations LIMIT 1) WHERE organization_id IS NULL;
    END IF;
END $$;

-- Update users table with enhanced fields
DO $$
BEGIN
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'customer' 
          CHECK (role IN ('customer', 'sales', 'procurement', 'engineering', 'qa', 'production', 'management', 'supplier', 'admin'));
    END IF;
    
    -- Add department column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'department') THEN
        ALTER TABLE users ADD COLUMN department VARCHAR(100);
    END IF;
    
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(50);
    END IF;
    
    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add last_login_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_at') THEN
        ALTER TABLE users ADD COLUMN last_login_at TIMESTAMPTZ;
    END IF;
    
    -- Add preferences column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'preferences') THEN
        ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
END $$;

-- =============================================
-- 2. CONTACTS (Enhanced Customer/Supplier Management)
-- =============================================

-- External contacts (customers and suppliers)
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

-- Create customers table if it doesn't exist (for backward compatibility)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    country VARCHAR(100) DEFAULT 'Vietnam',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate existing customers to contacts table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        INSERT INTO contacts (
            organization_id, type, company_name, contact_name, email, phone, 
            address, country, created_at, updated_at
        )
        SELECT 
            (SELECT id FROM organizations LIMIT 1) as organization_id,
            'customer' as type,
            COALESCE(company, name) as company_name,
            name as contact_name,
            email,
            phone,
            address,
            COALESCE(country, 'Vietnam') as country,
            created_at,
            updated_at
        FROM customers
        WHERE NOT EXISTS (
            SELECT 1 FROM contacts c 
            WHERE c.email = customers.email AND c.type = 'customer'
        );
    END IF;
END $$;

-- =============================================
-- 3. WORKFLOW STAGES
-- =============================================

-- Workflow stages (configurable per org)
CREATE TABLE IF NOT EXISTS workflow_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280' 
      CHECK (color ~* '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'),
    stage_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    exit_criteria TEXT,
    responsible_roles TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, slug),
    UNIQUE(organization_id, stage_order)
);

-- Insert default workflow stages
INSERT INTO workflow_stages (organization_id, name, slug, color, stage_order, exit_criteria, responsible_roles)
SELECT 
    org.id,
    stage_data.name,
    stage_data.slug,
    stage_data.color,
    stage_data.stage_order,
    stage_data.exit_criteria,
    stage_data.responsible_roles
FROM organizations org,
(VALUES 
    ('Inquiry Received', 'inquiry_received', '#3B82F6', 1, 'Customer details verified, Project scope defined, Technical requirements gathered', ARRAY['sales', 'customer']),
    ('Technical Review', 'technical_review', '#F97316', 2, 'All department reviews completed, Technical risks identified, Manufacturing process defined', ARRAY['engineering', 'qa', 'production']),
    ('Supplier RFQ Sent', 'supplier_rfq_sent', '#6366F1', 3, 'All critical supplier quotes received, Quote comparison completed, Supplier selection finalized', ARRAY['procurement']),
    ('Quoted', 'quoted', '#10B981', 4, 'Quote sent to customer, Follow-up schedule set, Customer response tracked', ARRAY['sales']),
    ('Order Confirmed', 'order_confirmed', '#8B5CF6', 5, 'Purchase order validated, Payment terms confirmed, Delivery schedule agreed', ARRAY['sales', 'management']),
    ('Procurement & Planning', 'procurement_planning', '#F59E0B', 6, 'All materials ordered, Production slots reserved, Delivery timeline confirmed', ARRAY['procurement', 'production']),
    ('In Production', 'in_production', '#14B8A6', 7, 'Production completed, Quality tests passed, Packaging and shipping prepared', ARRAY['production', 'qa']),
    ('Shipped & Closed', 'shipped_closed', '#6B7280', 8, 'Proof of delivery received, Customer satisfaction confirmed, Project documentation complete', ARRAY['sales', 'management'])
) AS stage_data(name, slug, color, stage_order, exit_criteria, responsible_roles)
WHERE NOT EXISTS (
    SELECT 1 FROM workflow_stages ws 
    WHERE ws.organization_id = org.id AND ws.slug = stage_data.slug
);

-- =============================================
-- 4. ENHANCE PROJECTS TABLE
-- =============================================

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    customer_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'inquiry_received' 
      CHECK (status IN ('inquiry_received', 'technical_review', 'supplier_rfq_sent', 'quoted', 'order_confirmed', 'procurement_planning', 'in_production', 'shipped_closed')),
    priority VARCHAR(10) DEFAULT 'medium' 
      CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assignee_id UUID,
    estimated_value DECIMAL(15,2),
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    stage_entered_at TIMESTAMPTZ DEFAULT NOW(),
    days_in_stage INTEGER DEFAULT 0
);

-- Add new columns to projects table
DO $$
BEGIN
    -- Add organization_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'organization_id') THEN
        ALTER TABLE projects ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
        UPDATE projects SET organization_id = (SELECT id FROM organizations LIMIT 1) WHERE organization_id IS NULL;
    END IF;
    
    -- Add current_stage_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'current_stage_id') THEN
        ALTER TABLE projects ADD COLUMN current_stage_id UUID REFERENCES workflow_stages(id);
    END IF;
    
    -- Add priority_score if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'priority_score') THEN
        ALTER TABLE projects ADD COLUMN priority_score INTEGER DEFAULT 50 CHECK (priority_score BETWEEN 0 AND 100);
    END IF;
    
    -- Add priority_level if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'priority_level') THEN
        ALTER TABLE projects ADD COLUMN priority_level VARCHAR(10) DEFAULT 'medium' 
          CHECK (priority_level IN ('low', 'medium', 'high', 'urgent'));
    END IF;
    
    -- Add estimated_delivery_date if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'estimated_delivery_date') THEN
        ALTER TABLE projects ADD COLUMN estimated_delivery_date DATE;
    END IF;
    
    -- Add actual_delivery_date if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'actual_delivery_date') THEN
        ALTER TABLE projects ADD COLUMN actual_delivery_date DATE;
    END IF;
    
    -- Add source if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'source') THEN
        ALTER TABLE projects ADD COLUMN source VARCHAR(50) DEFAULT 'manual' 
          CHECK (source IN ('manual', 'portal', 'email', 'api', 'import', 'migration'));
    END IF;
    
    -- Add tags if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'tags') THEN
        ALTER TABLE projects ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add metadata if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'metadata') THEN
        ALTER TABLE projects ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
    
    -- Add assigned_to if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'assigned_to') THEN
        ALTER TABLE projects ADD COLUMN assigned_to UUID REFERENCES users(id);
    END IF;
END $$;

-- Update current_stage_id based on existing status
UPDATE projects 
SET current_stage_id = ws.id
FROM workflow_stages ws
WHERE projects.current_stage_id IS NULL 
  AND projects.organization_id = ws.organization_id
  AND (
    (projects.status = 'inquiry_received' AND ws.slug = 'inquiry_received') OR
    (projects.status = 'technical_review' AND ws.slug = 'technical_review') OR
    (projects.status = 'supplier_rfq_sent' AND ws.slug = 'supplier_rfq_sent') OR
    (projects.status = 'quoted' AND ws.slug = 'quoted') OR
    (projects.status = 'order_confirmed' AND ws.slug = 'order_confirmed') OR
    (projects.status = 'procurement_planning' AND ws.slug = 'procurement_planning') OR
    (projects.status = 'in_production' AND ws.slug = 'in_production') OR
    (projects.status = 'shipped_closed' AND ws.slug = 'shipped_closed')
  );

-- Copy assignee_id to assigned_to for backward compatibility
UPDATE projects 
SET assigned_to = assignee_id 
WHERE assigned_to IS NULL AND assignee_id IS NOT NULL;

-- Copy due_date to estimated_delivery_date
UPDATE projects 
SET estimated_delivery_date = due_date::date 
WHERE estimated_delivery_date IS NULL AND due_date IS NOT NULL;

-- Set priority_level based on existing priority
UPDATE projects 
SET priority_level = priority 
WHERE priority_level = 'medium' AND priority IS NOT NULL;

-- =============================================
-- 5. PROJECT STAGE HISTORY
-- =============================================

-- Project stage history
CREATE TABLE IF NOT EXISTS project_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES workflow_stages(id),
    entered_at TIMESTAMPTZ DEFAULT NOW(),
    exited_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    entered_by UUID REFERENCES users(id),
    exit_reason VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. PROJECT ASSIGNMENTS
-- =============================================

-- Project assignments
CREATE TABLE IF NOT EXISTS project_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(project_id, user_id, role)
);

-- =============================================
-- 7. ENHANCED DOCUMENTS
-- =============================================

-- Create documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(100),
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100),
    storage_path TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id)
);

-- Add new columns to documents table if they don't exist
DO $$
BEGIN
    -- Add document_type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'document_type') THEN
        ALTER TABLE documents ADD COLUMN document_type VARCHAR(50) 
          CHECK (document_type IN ('rfq', 'drawing', 'specification', 'quote', 'po', 'invoice', 'certificate', 'report', 'bom', 'other'));
    END IF;
    
    -- Add access_level if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'access_level') THEN
        ALTER TABLE documents ADD COLUMN access_level VARCHAR(20) DEFAULT 'internal' 
          CHECK (access_level IN ('public', 'customer', 'supplier', 'internal', 'restricted'));
    END IF;
    
    -- Add version if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'version') THEN
        ALTER TABLE documents ADD COLUMN version INTEGER DEFAULT 1;
    END IF;
    
    -- Add is_latest if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'is_latest') THEN
        ALTER TABLE documents ADD COLUMN is_latest BOOLEAN DEFAULT true;
    END IF;
    
    -- Add checksum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'checksum') THEN
        ALTER TABLE documents ADD COLUMN checksum VARCHAR(64);
    END IF;
    
    -- Add metadata if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'metadata') THEN
        ALTER TABLE documents ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
    
    -- Add AI processing fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'ai_extracted_data') THEN
        ALTER TABLE documents ADD COLUMN ai_extracted_data JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'ai_processing_status') THEN
        ALTER TABLE documents ADD COLUMN ai_processing_status VARCHAR(20) DEFAULT 'pending' 
          CHECK (ai_processing_status IN ('pending', 'processing', 'completed', 'failed', 'skipped'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'ai_confidence_score') THEN
        ALTER TABLE documents ADD COLUMN ai_confidence_score DECIMAL(5,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'ai_processed_at') THEN
        ALTER TABLE documents ADD COLUMN ai_processed_at TIMESTAMPTZ;
    END IF;
END $$;

-- =============================================
-- 8. DOCUMENT VERSIONS
-- =============================================

-- Document versions (improved from parent-child)
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    change_description TEXT,
    metadata JSONB DEFAULT '{}',
    UNIQUE(document_id, version_number)
);

-- =============================================
-- 9. DOCUMENT COMMENTS
-- =============================================

-- Document comments
CREATE TABLE IF NOT EXISTS document_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    comment TEXT NOT NULL,
    page_number INTEGER,
    coordinates JSONB,
    is_resolved BOOLEAN DEFAULT false,
    parent_comment_id UUID REFERENCES document_comments(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. DOCUMENT ACCESS LOG
-- =============================================

-- Document access log
CREATE TABLE IF NOT EXISTS document_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(20) NOT NULL 
      CHECK (action IN ('view', 'download', 'upload', 'delete', 'share', 'comment', 'approve')),
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 11. REVIEWS & APPROVALS
-- =============================================

-- Internal reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    reviewer_role VARCHAR(50) NOT NULL,
    review_type VARCHAR(50) DEFAULT 'standard' 
      CHECK (review_type IN ('standard', 'technical', 'quality', 'production', 'cost', 'compliance', 'safety')),
    status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'needs_info', 'on_hold')),
    priority VARCHAR(10) DEFAULT 'medium' 
      CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    comments TEXT,
    risks JSONB DEFAULT '[]',
    recommendations TEXT,
    tooling_required BOOLEAN DEFAULT false,
    estimated_cost DECIMAL(15,2),
    estimated_lead_time INTEGER,
    due_date DATE,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review checklist items
CREATE TABLE IF NOT EXISTS review_checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    is_checked BOOLEAN DEFAULT false,
    is_required BOOLEAN DEFAULT true,
    notes TEXT,
    checked_by UUID REFERENCES users(id),
    checked_at TIMESTAMPTZ
);

-- =============================================
-- 12. SUPPLIER MANAGEMENT
-- =============================================

-- Supplier RFQs
CREATE TABLE IF NOT EXISTS supplier_rfqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES contacts(id),
    rfq_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' 
      CHECK (status IN ('draft', 'sent', 'viewed', 'quoted', 'declined', 'expired', 'cancelled')),
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    expected_response_date DATE,
    priority VARCHAR(10) DEFAULT 'medium',
    requirements TEXT,
    special_instructions TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier quotes
CREATE TABLE IF NOT EXISTS supplier_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_rfq_id UUID REFERENCES supplier_rfqs(id) ON DELETE CASCADE,
    quote_number VARCHAR(50),
    unit_price DECIMAL(15,4),
    total_price DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'VND' 
      CHECK (currency IN ('USD', 'EUR', 'VND', 'THB', 'MYR', 'IDR', 'PHP', 'CNY', 'JPY', 'KRW', 'SGD', 'AUD', 'CAD', 'GBP')),
    quantity INTEGER,
    lead_time_days INTEGER,
    valid_until DATE,
    payment_terms VARCHAR(100),
    shipping_terms VARCHAR(100),
    notes TEXT,
    quote_file_url TEXT,
    is_selected BOOLEAN DEFAULT false,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    evaluated_at TIMESTAMPTZ,
    evaluated_by UUID REFERENCES users(id),
    evaluation_score INTEGER CHECK (evaluation_score BETWEEN 1 AND 10),
    evaluation_notes TEXT
);

-- =============================================
-- 13. COMMUNICATION SYSTEM
-- =============================================

-- Messages (simplified thread model)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    thread_id UUID DEFAULT uuid_generate_v4(), -- All messages in same thread share ID
    sender_id UUID REFERENCES users(id),
    sender_type VARCHAR(20) NOT NULL 
      CHECK (sender_type IN ('user', 'contact', 'system')),
    sender_contact_id UUID REFERENCES contacts(id),
    recipient_type VARCHAR(20) NOT NULL 
      CHECK (recipient_type IN ('user', 'contact', 'department', 'role')),
    recipient_id UUID, -- user_id or contact_id
    recipient_role VARCHAR(50),
    recipient_department VARCHAR(100),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'message' 
      CHECK (message_type IN ('message', 'notification', 'alert', 'reminder', 'system', 'announcement')),
    priority VARCHAR(10) DEFAULT 'normal' 
      CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    project_id UUID REFERENCES projects(id),
    priority VARCHAR(10) DEFAULT 'normal' 
      CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    delivery_method VARCHAR(20) DEFAULT 'in_app' 
      CHECK (delivery_method IN ('in_app', 'email', 'sms', 'push', 'webhook')),
    delivered_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 14. ACTIVITY & AUDIT TRAIL
-- =============================================

-- Activity log
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    user_id UUID REFERENCES users(id),
    contact_id UUID REFERENCES contacts(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System events and integrations
CREATE TABLE IF NOT EXISTS system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    source VARCHAR(50) NOT NULL, -- 'system', 'api', 'webhook', etc.
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'retrying')),
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 15. CONFIGURATION & SETTINGS
-- =============================================

-- User preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, preference_key)
);

-- Organization-wide settings
CREATE TABLE IF NOT EXISTS organization_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id),
    UNIQUE(organization_id, setting_key)
);

-- Email templates for notifications
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    template_key VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, template_key)
);

-- Workflow stage transitions (configurable)
CREATE TABLE IF NOT EXISTS workflow_stage_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    from_stage_id UUID REFERENCES workflow_stages(id) ON DELETE CASCADE,
    to_stage_id UUID REFERENCES workflow_stages(id) ON DELETE CASCADE,
    is_allowed BOOLEAN DEFAULT true,
    conditions JSONB DEFAULT '{}', -- JSON conditions for transition
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, from_stage_id, to_stage_id)
);

-- Business rules for workflow automation
CREATE TABLE IF NOT EXISTS workflow_business_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN (
        'auto_advance', 'approval_required', 'notification', 'assignment', 'validation'
    )),
    trigger_conditions JSONB NOT NULL, -- When to trigger the rule
    actions JSONB NOT NULL, -- What actions to take
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 100, -- Lower number = higher priority
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Rule execution log for audit and debugging
CREATE TABLE IF NOT EXISTS workflow_rule_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES workflow_business_rules(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    triggered_by UUID REFERENCES users(id),
    trigger_event VARCHAR(100) NOT NULL,
    conditions_met JSONB NOT NULL,
    actions_taken JSONB NOT NULL,
    execution_status VARCHAR(20) DEFAULT 'success' CHECK (execution_status IN (
        'success', 'failed', 'partial', 'skipped'
    )),
    error_message TEXT,
    execution_time_ms INTEGER,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configurable approval chains
CREATE TABLE IF NOT EXISTS approval_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    chain_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'project', 'quote', 'document', etc.
    conditions JSONB NOT NULL, -- When this chain applies
    steps JSONB NOT NULL, -- Array of approval steps
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Individual approval requests
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain_id UUID REFERENCES approval_chains(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    step_number INTEGER NOT NULL,
    approver_id UUID REFERENCES users(id),
    approver_role VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'delegated', 'expired'
    )),
    comments TEXT,
    approved_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 16. SUPPLIER QUALIFICATION & PERFORMANCE
-- =============================================

-- Supplier qualification and scoring system
CREATE TABLE IF NOT EXISTS supplier_qualifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    qualification_type VARCHAR(50) NOT NULL CHECK (qualification_type IN (
        'initial', 'annual', 'project_specific', 'audit', 'certification'
    )),
    overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    quality_score DECIMAL(5,2) CHECK (quality_score >= 0 AND quality_score <= 100),
    delivery_score DECIMAL(5,2) CHECK (delivery_score >= 0 AND delivery_score <= 100),
    cost_score DECIMAL(5,2) CHECK (cost_score >= 0 AND cost_score <= 100),
    communication_score DECIMAL(5,2) CHECK (communication_score >= 0 AND communication_score <= 100),
    technical_capability_score DECIMAL(5,2) CHECK (technical_capability_score >= 0 AND technical_capability_score <= 100),
    financial_stability_score DECIMAL(5,2) CHECK (financial_stability_score >= 0 AND financial_stability_score <= 100),
    compliance_score DECIMAL(5,2) CHECK (compliance_score >= 0 AND compliance_score <= 100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
        'active', 'probation', 'suspended', 'blacklisted', 'pending_review'
    )),
    tier VARCHAR(20) DEFAULT 'standard' CHECK (tier IN (
        'preferred', 'standard', 'conditional', 'restricted'
    )),
    capabilities JSONB DEFAULT '[]', -- Array of capabilities
    certifications JSONB DEFAULT '[]', -- Array of certifications
    risk_factors JSONB DEFAULT '[]', -- Array of identified risks
    improvement_areas JSONB DEFAULT '[]', -- Areas needing improvement
    notes TEXT,
    next_review_date DATE,
    qualified_by UUID REFERENCES users(id),
    qualified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier performance tracking
CREATE TABLE IF NOT EXISTS supplier_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN (
        'on_time_delivery', 'quality_rating', 'cost_variance', 'response_time',
        'defect_rate', 'lead_time_accuracy', 'communication_rating'
    )),
    metric_value DECIMAL(10,4) NOT NULL,
    target_value DECIMAL(10,4),
    measurement_period VARCHAR(20) NOT NULL CHECK (measurement_period IN (
        'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    )),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    project_id UUID REFERENCES projects(id), -- Optional: project-specific metrics
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 17. BOM MANAGEMENT
-- =============================================

-- Bill of Materials (BOM) management
CREATE TABLE IF NOT EXISTS bom_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    parent_item_id UUID REFERENCES bom_items(id), -- For hierarchical BOM
    item_number VARCHAR(100) NOT NULL,
    part_number VARCHAR(100),
    description TEXT NOT NULL,
    material VARCHAR(255),
    quantity DECIMAL(10,4) NOT NULL DEFAULT 1,
    unit_of_measure VARCHAR(20) DEFAULT 'pcs',
    unit_cost DECIMAL(15,4),
    total_cost DECIMAL(15,2),
    supplier_id UUID REFERENCES contacts(id),
    lead_time_days INTEGER,
    minimum_order_qty DECIMAL(10,4),
    specifications JSONB DEFAULT '{}',
    tolerances JSONB DEFAULT '{}',
    notes TEXT,
    is_critical BOOLEAN DEFAULT false,
    is_long_lead BOOLEAN DEFAULT false,
    -- AI-extracted fields
    ai_extracted BOOLEAN DEFAULT false,
    ai_confidence DECIMAL(5,2),
    ai_source_document_id UUID REFERENCES documents(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- =============================================
-- 18. AI PROCESSING SYSTEM
-- =============================================

-- AI processing queue and results
CREATE TABLE IF NOT EXISTS ai_processing_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN (
        'document', 'supplier', 'project', 'bom', 'quote'
    )),
    entity_id UUID NOT NULL,
    processing_type VARCHAR(50) NOT NULL CHECK (processing_type IN (
        'document_extraction', 'supplier_categorization', 'bom_generation',
        'quote_analysis', 'risk_assessment', 'compliance_check'
    )),
    priority INTEGER DEFAULT 100, -- Lower number = higher priority
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN (
        'queued', 'processing', 'completed', 'failed', 'cancelled'
    )),
    input_data JSONB NOT NULL,
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    processing_time_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI model configurations and versions
CREATE TABLE IF NOT EXISTS ai_model_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN (
        'document_extraction', 'classification', 'scoring', 'prediction', 'nlp'
    )),
    version VARCHAR(20) NOT NULL,
    configuration JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(organization_id, model_name, version)
);

-- =============================================
-- 19. CLOUD STORAGE INTEGRATIONS
-- =============================================

-- Cloud storage integrations
CREATE TABLE IF NOT EXISTS cloud_storage_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- User who set up the integration
    provider VARCHAR(50) NOT NULL CHECK (provider IN (
        'google_drive', 'dropbox', 'onedrive', 's3', 'azure_blob'
    )),
    integration_name VARCHAR(255) NOT NULL,
    credentials JSONB NOT NULL, -- Encrypted credentials
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    sync_status VARCHAR(20) DEFAULT 'active' CHECK (sync_status IN (
        'active', 'error', 'disabled', 'expired'
    )),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document sync log for cloud storage
CREATE TABLE IF NOT EXISTS document_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES cloud_storage_integrations(id) ON DELETE CASCADE,
    sync_action VARCHAR(20) NOT NULL CHECK (sync_action IN (
        'upload', 'download', 'update', 'delete', 'conflict_resolution'
    )),
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'success', 'failed', 'pending', 'conflict'
    )),
    error_message TEXT,
    file_size_bytes BIGINT,
    sync_duration_ms INTEGER,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COMMIT TRANSACTION
-- =============================================

COMMIT;