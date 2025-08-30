-- Factory Pulse Complete Database Schema
-- Migration: 20250130000001_create_complete_schema.sql
-- Description: Creates complete database schema for Factory Pulse manufacturing system

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('sales', 'procurement', 'engineering', 'qa', 'production', 'management', 'admin');
CREATE TYPE contact_type AS ENUM ('customer', 'supplier');
CREATE TYPE project_status AS ENUM ('active', 'delayed', 'cancelled', 'completed');
CREATE TYPE workflow_stage_status AS ENUM ('pending', 'in_progress', 'completed', 'blocked');
CREATE TYPE document_status AS ENUM ('draft', 'review', 'approved', 'rejected', 'archived');
CREATE TYPE notification_type AS ENUM ('assignment', 'review', 'approval', 'message', 'system');
CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE message_type AS ENUM ('text', 'file', 'system', 'notification');

-- 1. Organizations & Users (Multi-tenant architecture)
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

-- User profiles with role-based access (internal users only)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
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

-- External contacts (customers and suppliers)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type contact_type NOT NULL,
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workflow Management
CREATE TABLE workflow_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    estimated_duration_hours INTEGER,
    required_approvals INTEGER DEFAULT 0,
    auto_advance BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Projects & RFQs
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    customer_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    customer_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'active',
    current_stage_id UUID REFERENCES workflow_stages(id),
    priority VARCHAR(20) DEFAULT 'normal' 
      CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    estimated_value DECIMAL(15,2),
    actual_value DECIMAL(15,2),
    start_date DATE,
    target_completion_date DATE,
    actual_completion_date DATE,
    industry VARCHAR(100),
    requirements TEXT,
    specifications TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    notes TEXT
);

-- 4. Document Management
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    status document_status DEFAULT 'draft',
    version VARCHAR(20) DEFAULT '1.0',
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    is_public BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    change_summary TEXT,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    is_current BOOLEAN DEFAULT false
);

-- 5. Review & Approval System
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES workflow_stages(id) ON DELETE SET NULL,
    status workflow_stage_status DEFAULT 'pending',
    comments TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    reviewed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Communication & Messaging
CREATE TABLE message_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title VARCHAR(255),
    participants UUID[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_type message_type DEFAULT 'text',
    content TEXT,
    file_attachment_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    is_system_message BOOLEAN DEFAULT false,
    read_by UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    priority notification_priority DEFAULT 'normal',
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Activity Log & Audit
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AI & Automation
CREATE TABLE ai_processing_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    priority INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Supplier Management & RFQ Engine
CREATE TABLE supplier_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    supplier_contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    quote_number VARCHAR(100) UNIQUE,
    total_amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'VND',
    delivery_terms TEXT,
    payment_terms TEXT,
    validity_period_days INTEGER,
    status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quote_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID REFERENCES supplier_quotes(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2),
    unit_price DECIMAL(15,2),
    total_price DECIMAL(15,2),
    unit_of_measure VARCHAR(20),
    delivery_lead_time_days INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Metrics & Analytics
CREATE TABLE project_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(15,4),
    target_value DECIMAL(15,4),
    unit VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_current_stage_id ON projects(current_stage_id);
CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_reviews_organization_id ON reviews(organization_id);
CREATE INDEX idx_reviews_project_id ON reviews(project_id);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_activity_log_organization_id ON activity_log(organization_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_ai_processing_queue_status ON ai_processing_queue(status);
CREATE INDEX idx_supplier_quotes_project_id ON supplier_quotes(project_id);
CREATE INDEX idx_supplier_quotes_status ON supplier_quotes(status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_stages_updated_at BEFORE UPDATE ON workflow_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_threads_updated_at BEFORE UPDATE ON message_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_processing_queue_updated_at BEFORE UPDATE ON ai_processing_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplier_quotes_updated_at BEFORE UPDATE ON supplier_quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_metrics ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be enhanced later)
CREATE POLICY "Users can view their own organization data" ON users
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can view their own organization projects" ON projects
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Insert default workflow stages
INSERT INTO workflow_stages (organization_id, name, description, order_index, estimated_duration_hours, required_approvals, auto_advance) VALUES
    (NULL, 'Inquiry Received', 'Initial customer inquiry or RFQ received', 1, 2, 0, true),
    (NULL, 'Technical Review', 'Engineering team reviews technical requirements', 2, 24, 1, false),
    (NULL, 'Cost Estimation', 'Detailed cost analysis and quotation preparation', 3, 48, 1, false),
    (NULL, 'Customer Approval', 'Customer reviews and approves quotation', 4, 72, 0, false),
    (NULL, 'Production Planning', 'Production team plans manufacturing process', 5, 24, 1, false),
    (NULL, 'Manufacturing', 'Actual production and quality control', 6, 168, 2, false),
    (NULL, 'Final Inspection', 'Final quality check and testing', 7, 8, 1, false),
    (NULL, 'Delivery', 'Product delivery and customer acceptance', 8, 4, 0, true);

-- Insert default Factory Pulse organization
INSERT INTO organizations (id, name, slug, domain, description, industry, subscription_plan) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Factory Pulse Vietnam', 'factory-pulse-vn', 'factorypulse.vn', 'Leading manufacturing solutions provider in Vietnam', 'Manufacturing', 'enterprise');
