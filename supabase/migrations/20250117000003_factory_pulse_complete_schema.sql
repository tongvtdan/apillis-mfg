-- =========================================
-- Factory Pulse Database Schema - Complete Refactoring
-- Migration: Core Tables and Workflow Management
-- =========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =========================================
-- 1. ENUM DEFINITIONS
-- =========================================

-- User and organization enums
CREATE TYPE user_role AS ENUM (
    'admin', 'management', 'engineering', 'qa', 'procurement',
    'production', 'sales', 'finance', 'logistics', 'auditor'
);

CREATE TYPE user_status AS ENUM ('active', 'invited', 'suspended', 'disabled');
CREATE TYPE organization_type AS ENUM ('internal', 'customer', 'supplier', 'partner');

-- Project and workflow enums
CREATE TYPE project_status AS ENUM (
    'draft', 'inquiry', 'reviewing', 'quoted', 'confirmed',
    'procurement', 'production', 'completed', 'cancelled'
);

CREATE TYPE priority_level AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE sub_stage_status AS ENUM ('pending', 'in_progress', 'in_review', 'blocked', 'skipped', 'completed');

-- Approval enums
CREATE TYPE approval_type AS ENUM (
    'technical_review', 'quote_approval', 'po_approval', 'supplier_selection',
    'quality_review', 'shipment_release', 'final_signoff', 'engineering_change',
    'cost_approval', 'budget_approval', 'contract_approval', 'safety_review'
);

CREATE TYPE approval_status AS ENUM (
    'pending', 'in_review', 'approved', 'rejected', 'cancelled',
    'expired', 'delegated', 'auto_approved', 'escalated'
);

CREATE TYPE approval_priority AS ENUM ('low', 'normal', 'high', 'urgent', 'critical');
CREATE TYPE approval_action AS ENUM (
    'request', 'assign', 'reassign', 'approve', 'reject', 'comment',
    'escalate', 'cancel'
);

-- Document and contact enums
CREATE TYPE contact_type AS ENUM ('customer', 'supplier', 'internal');
CREATE TYPE document_category AS ENUM (
    'inquiry', 'rfq', 'design_spec', 'drawing', 'bom', 'supplier_rfq',
    'supplier_quote', 'costing', 'customer_quote', 'po', 'contract',
    'work_order', 'work_instruction', 'qa_report', 'test_result',
    'packing_list', 'shipping_doc', 'delivery_confirmation', 'invoice', 'other'
);

CREATE TYPE notification_type AS ENUM (
    'workflow', 'approval', 'document', 'message', 'system'
);

-- =========================================
-- 2. CORE ENTITIES
-- =========================================

-- Organizations table (enhanced)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    industry TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    website TEXT,
    logo_url TEXT,
    organization_type organization_type DEFAULT 'customer',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- New fields for enhanced functionality
    tax_id TEXT,
    payment_terms TEXT,
    credit_limit NUMERIC(18,2),
    default_currency TEXT DEFAULT 'USD',
    timezone TEXT DEFAULT 'UTC',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Users table (optimized - no redundant fields)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, -- Direct link to auth.users.id
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    role user_role DEFAULT 'sales',
    status user_status DEFAULT 'active',
    department TEXT,
    phone TEXT,
    avatar_url TEXT,
    employee_id TEXT,
    direct_manager_id UUID REFERENCES users(id),
    last_login_at TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Enhanced fields for better functionality
    description TEXT,
    direct_reports UUID[] DEFAULT ARRAY[]::UUID[],
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Contacts table (enhanced)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type contact_type DEFAULT 'customer',
    company_name TEXT,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    website TEXT,
    tax_id TEXT,
    payment_terms TEXT,
    credit_limit NUMERIC(18,2),
    is_active BOOLEAN DEFAULT true,
    role TEXT,
    is_primary_contact BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- New fields for enhanced functionality
    department TEXT,
    job_title TEXT,
    linkedin_url TEXT,
    twitter_handle TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,

    -- AI and analytics fields
    ai_category JSONB DEFAULT '{}'::jsonb,
    ai_capabilities TEXT[],
    ai_risk_score NUMERIC(5,2),
    ai_last_analyzed TIMESTAMPTZ,
    created_by UUID REFERENCES users(id)
);

-- =========================================
-- 3. WORKFLOW MANAGEMENT
-- =========================================

-- Workflow stages (organization-level catalog)
CREATE TABLE IF NOT EXISTS workflow_stages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    color TEXT,
    stage_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    exit_criteria TEXT,
    responsible_roles user_role[],
    estimated_duration_days INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(organization_id, slug)
);

-- Workflow sub-stages (organization-level catalog)
CREATE TABLE IF NOT EXISTS workflow_sub_stages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workflow_stage_id UUID NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    color TEXT,
    sub_stage_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    exit_criteria TEXT,
    responsible_roles user_role[],
    estimated_duration_hours INTEGER,
    is_required BOOLEAN DEFAULT true,
    can_skip BOOLEAN DEFAULT false,
    auto_advance BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    approval_roles user_role[],
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(organization_id, slug)
);

-- Workflow definitions (versioned templates)
CREATE TABLE IF NOT EXISTS workflow_definitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    version INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(organization_id, name, version)
);

-- Workflow definition stages (template stage overrides)
CREATE TABLE IF NOT EXISTS workflow_definition_stages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workflow_definition_id UUID NOT NULL REFERENCES workflow_definitions(id) ON DELETE CASCADE,
    workflow_stage_id UUID NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
    is_included BOOLEAN DEFAULT true,
    stage_order_override INTEGER,
    responsible_roles_override user_role[],
    estimated_duration_days_override INTEGER,
    requires_approval_override BOOLEAN,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(workflow_definition_id, workflow_stage_id)
);

-- Workflow definition sub-stages (template sub-stage overrides)
CREATE TABLE IF NOT EXISTS workflow_definition_sub_stages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workflow_definition_id UUID NOT NULL REFERENCES workflow_definitions(id) ON DELETE CASCADE,
    workflow_sub_stage_id UUID NOT NULL REFERENCES workflow_sub_stages(id) ON DELETE CASCADE,
    is_included BOOLEAN DEFAULT true,
    sub_stage_order_override INTEGER,
    responsible_roles_override user_role[],
    requires_approval_override BOOLEAN,
    can_skip_override BOOLEAN,
    auto_advance_override BOOLEAN,
    estimated_duration_hours_override INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(workflow_definition_id, workflow_sub_stage_id)
);

-- =========================================
-- 4. PROJECT MANAGEMENT
-- =========================================

-- Projects table (enhanced)
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL UNIQUE, -- Human-friendly ID like P-25082001
    title TEXT NOT NULL,
    description TEXT,
    customer_organization_id UUID NOT NULL REFERENCES organizations(id),
    point_of_contacts UUID[] DEFAULT ARRAY[]::UUID[], -- Array of contact IDs
    current_stage_id UUID REFERENCES workflow_stages(id),
    workflow_definition_id UUID REFERENCES workflow_definitions(id),
    status project_status DEFAULT 'draft',
    priority_level priority_level DEFAULT 'normal',
    priority_score NUMERIC(5,2) DEFAULT 0,

    -- Timing fields
    stage_entered_at TIMESTAMPTZ,
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    requested_due_date DATE,
    promised_due_date DATE,

    -- Assignment and tracking
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),

    -- Financial fields
    estimated_value NUMERIC(18,2),
    actual_value NUMERIC(18,2),

    -- Categorization
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    project_type TEXT,
    intake_type TEXT,
    intake_source TEXT,

    -- Additional metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Legacy compatibility fields
    source TEXT,
    description_legacy TEXT
);

-- Project sub-stage progress (per-project tracking)
CREATE TABLE IF NOT EXISTS project_sub_stage_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    workflow_stage_id UUID NOT NULL REFERENCES workflow_stages(id),
    sub_stage_id UUID NOT NULL REFERENCES workflow_sub_stages(id),
    status sub_stage_status DEFAULT 'pending',
    assigned_to UUID REFERENCES users(id),
    started_at TIMESTAMPTZ,
    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    blocked_reason TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(project_id, sub_stage_id)
);

-- =========================================
-- 5. APPROVAL SYSTEM
-- =========================================

-- Approvals table (centralized)
CREATE TABLE IF NOT EXISTS approvals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    approval_type approval_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    reference_id TEXT, -- External reference ID
    entity_type TEXT NOT NULL, -- 'project', 'document', 'quotation', etc.
    entity_id UUID NOT NULL,
    approval_chain_id UUID,

    -- Workflow fields
    step_number INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 1,

    -- Requester information
    requested_by UUID NOT NULL REFERENCES users(id),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    request_reason TEXT,
    request_metadata JSONB DEFAULT '{}'::jsonb,

    -- Current approver
    current_approver_id UUID REFERENCES users(id),
    current_approver_role user_role,
    current_approver_department TEXT,

    -- Status and timing
    status approval_status DEFAULT 'pending',
    priority approval_priority DEFAULT 'normal',
    due_date DATE,
    expires_at TIMESTAMPTZ,
    sla_due_at TIMESTAMPTZ,

    -- Decision information
    decision_comments TEXT,
    decision_reason TEXT,
    decision_metadata JSONB DEFAULT '{}'::jsonb,
    decided_at TIMESTAMPTZ,
    decided_by UUID REFERENCES users(id),

    -- Escalation and delegation
    escalated_from UUID REFERENCES users(id),
    escalated_to UUID REFERENCES users(id),
    escalated_at TIMESTAMPTZ,
    escalation_reason TEXT,

    -- Delegation information
    delegated_from UUID REFERENCES users(id),
    delegated_to UUID REFERENCES users(id),
    delegated_at TIMESTAMPTZ,
    delegation_reason TEXT,
    delegation_end_date DATE,

    -- Auto-approval
    auto_approval_rules JSONB DEFAULT '{}'::jsonb,
    auto_approved_at TIMESTAMPTZ,
    auto_approval_reason TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================

-- Core entity indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(is_active);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_contacts_org_type ON contacts(organization_id, type);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Workflow indexes
CREATE INDEX IF NOT EXISTS idx_workflow_stages_org_order ON workflow_stages(organization_id, stage_order);
CREATE INDEX IF NOT EXISTS idx_workflow_sub_stages_stage_order ON workflow_sub_stages(workflow_stage_id, sub_stage_order);
CREATE INDEX IF NOT EXISTS idx_workflow_sub_stages_active ON workflow_sub_stages(is_active);

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(current_stage_id);
CREATE INDEX IF NOT EXISTS idx_projects_definition ON projects(workflow_definition_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Progress tracking indexes
CREATE INDEX IF NOT EXISTS idx_pssp_project ON project_sub_stage_progress(project_id);
CREATE INDEX IF NOT EXISTS idx_pssp_stage ON project_sub_stage_progress(project_id, workflow_stage_id);
CREATE INDEX IF NOT EXISTS idx_pssp_status ON project_sub_stage_progress(status);
CREATE INDEX IF NOT EXISTS idx_pssp_due ON project_sub_stage_progress(due_at);

-- Approval indexes
CREATE INDEX IF NOT EXISTS idx_approvals_entity ON approvals(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_due ON approvals(sla_due_at);
CREATE INDEX IF NOT EXISTS idx_approvals_current_approver ON approvals(current_approver_id);

-- =========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_sub_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_definition_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_definition_sub_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_sub_stage_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Organization-scoped policies (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "org_select_policy" ON organizations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "org_insert_policy" ON organizations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "org_update_policy" ON organizations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "org_delete_policy" ON organizations FOR DELETE USING (auth.role() = 'authenticated');

-- User policies
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (
    organization_id = (SELECT get_current_user_org_id())
);
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (
    organization_id = (SELECT get_current_user_org_id())
);
CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (
    organization_id = (SELECT get_current_user_org_id())
);

-- Contact policies
CREATE POLICY "contacts_select_policy" ON contacts FOR SELECT USING (
    organization_id = (SELECT get_current_user_org_id())
);
CREATE POLICY "contacts_insert_policy" ON contacts FOR INSERT WITH CHECK (
    organization_id = (SELECT get_current_user_org_id())
);
CREATE POLICY "contacts_update_policy" ON contacts FOR UPDATE USING (
    organization_id = (SELECT get_current_user_org_id())
);

-- Workflow policies
CREATE POLICY "workflow_stages_select_policy" ON workflow_stages FOR SELECT USING (
    organization_id = (SELECT get_current_user_org_id())
);
CREATE POLICY "workflow_stages_insert_policy" ON workflow_stages FOR INSERT WITH CHECK (
    organization_id = (SELECT get_current_user_org_id())
);
CREATE POLICY "workflow_stages_update_policy" ON workflow_stages FOR UPDATE USING (
    organization_id = (SELECT get_current_user_org_id())
);

CREATE POLICY "workflow_sub_stages_select_policy" ON workflow_sub_stages FOR SELECT USING (
    organization_id = (SELECT get_current_user_org_id())
);
CREATE POLICY "workflow_sub_stages_insert_policy" ON workflow_sub_stages FOR INSERT WITH CHECK (
    organization_id = (SELECT get_current_user_org_id())
);
CREATE POLICY "workflow_sub_stages_update_policy" ON workflow_sub_stages FOR UPDATE USING (
    organization_id = (SELECT get_current_user_org_id())
);

-- Project policies
CREATE POLICY "projects_select_policy" ON projects FOR SELECT USING (
    organization_id = (SELECT get_current_user_org_id())
);
CREATE POLICY "projects_insert_policy" ON projects FOR INSERT WITH CHECK (
    organization_id = (SELECT get_current_user_org_id())
);
CREATE POLICY "projects_update_policy" ON projects FOR UPDATE USING (
    organization_id = (SELECT get_current_user_org_id())
);

-- Progress tracking policies
CREATE POLICY "progress_select_policy" ON project_sub_stage_progress FOR SELECT USING (
    organization_id = (SELECT get_current_user_org_id())
);
CREATE POLICY "progress_insert_policy" ON project_sub_stage_progress FOR INSERT WITH CHECK (
    organization_id = (SELECT get_current_user_org_id())
);
CREATE POLICY "progress_update_policy" ON project_sub_stage_progress FOR UPDATE USING (
    organization_id = (SELECT get_current_user_org_id())
);

-- Approval policies
CREATE POLICY "approvals_select_policy" ON approvals FOR SELECT USING (
    organization_id = (SELECT get_current_user_org_id())
);
CREATE POLICY "approvals_insert_policy" ON approvals FOR INSERT WITH CHECK (
    organization_id = (SELECT get_current_user_org_id())
);
CREATE POLICY "approvals_update_policy" ON approvals FOR UPDATE USING (
    organization_id = (SELECT get_current_user_org_id())
);

-- =========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =========================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_stages_updated_at BEFORE UPDATE ON workflow_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_sub_stages_updated_at BEFORE UPDATE ON workflow_sub_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_definitions_updated_at BEFORE UPDATE ON workflow_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- HELPER FUNCTIONS
-- =========================================

-- Function to get current user's organization ID
CREATE OR REPLACE FUNCTION get_current_user_org_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT organization_id
        FROM users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate human-friendly project IDs
CREATE OR REPLACE FUNCTION generate_project_id()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    sequence_number INTEGER;
    project_id TEXT;
BEGIN
    -- Get current year in YYMM format
    current_year := TO_CHAR(NOW(), 'YYMM');

    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(project_id FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO sequence_number
    FROM projects
    WHERE project_id LIKE 'P-' || current_year || '%';

    -- Format as P-YYMMXXX (e.g., P-2501001)
    project_id := 'P-' || current_year || LPAD(sequence_number::TEXT, 3, '0');

    RETURN project_id;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- OPTIMIZED AUTH/USER DATA FUNCTIONS
-- =========================================

-- Function to get combined user data efficiently
CREATE OR REPLACE FUNCTION get_combined_user_data(p_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    name TEXT,
    role user_role,
    status user_status,
    organization_id UUID,
    organization_name TEXT,
    organization_slug TEXT,
    department TEXT,
    preferences JSONB,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.email,
        u.name,
        u.role,
        u.status,
        u.organization_id,
        o.name,
        o.slug,
        u.department,
        u.preferences,
        u.last_login_at,
        u.created_at,
        u.updated_at
    FROM users u
    LEFT JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user permissions by role
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
    user_role user_role;
    permissions TEXT[];
BEGIN
    -- Get user's role
    SELECT role INTO user_role
    FROM users
    WHERE id = p_user_id;

    -- Return permissions based on role
    CASE user_role
        WHEN 'admin' THEN
            permissions := ARRAY['*'];
        WHEN 'management' THEN
            permissions := ARRAY[
                'read:*', 'create:projects', 'update:projects', 'delete:projects',
                'approve:*', 'manage:users', 'read:analytics'
            ];
        WHEN 'engineering' THEN
            permissions := ARRAY[
                'read:projects', 'update:projects', 'create:documents',
                'read:documents', 'update:documents', 'review:projects'
            ];
        WHEN 'qa' THEN
            permissions := ARRAY[
                'read:projects', 'review:projects', 'create:documents',
                'read:documents', 'approve:quality', 'read:analytics'
            ];
        WHEN 'procurement' THEN
            permissions := ARRAY[
                'read:projects', 'update:projects', 'create:suppliers',
                'read:suppliers', 'update:suppliers', 'approve:purchase_orders'
            ];
        WHEN 'production' THEN
            permissions := ARRAY[
                'read:projects', 'update:projects', 'read:production',
                'update:production', 'create:documents'
            ];
        WHEN 'sales' THEN
            permissions := ARRAY[
                'read:projects', 'create:projects', 'update:projects',
                'read:customers', 'create:customers', 'update:customers'
            ];
        ELSE
            permissions := ARRAY[]::TEXT[];
    END CASE;

    RETURN permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user permission
CREATE OR REPLACE FUNCTION has_user_permission(p_user_id UUID, p_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions TEXT[];
    permission_parts TEXT[];
    action_part TEXT;
    resource_part TEXT;
    wildcard_permission TEXT;
BEGIN
    -- Get user permissions
    SELECT get_user_permissions(p_user_id) INTO user_permissions;

    -- Check for wildcard permissions
    IF '*' = ANY(user_permissions) THEN
        RETURN TRUE;
    END IF;

    -- Check for exact permission match
    IF p_permission = ANY(user_permissions) THEN
        RETURN TRUE;
    END IF;

    -- Check for wildcard patterns (e.g., 'read:*' covers 'read:projects')
    permission_parts := string_to_array(p_permission, ':');
    IF array_length(permission_parts, 1) = 2 THEN
        action_part := permission_parts[1];
        resource_part := permission_parts[2];
        wildcard_permission := action_part || ':*';

        IF wildcard_permission = ANY(user_permissions) THEN
            RETURN TRUE;
        END IF;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get users by organization (optimized)
CREATE OR REPLACE FUNCTION get_users_by_organization(p_org_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    role user_role,
    department TEXT,
    status user_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.department,
        u.status
    FROM users u
    WHERE u.organization_id = p_org_id
    AND u.status = 'active'
    ORDER BY u.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile with validation
CREATE OR REPLACE FUNCTION update_user_profile(
    p_user_id UUID,
    p_updates JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    update_sql TEXT;
    field_name TEXT;
    field_value JSONB;
BEGIN
    -- Build dynamic update SQL
    update_sql := 'UPDATE users SET updated_at = NOW()';

    -- Add fields from JSONB
    FOR field_name IN SELECT jsonb_object_keys(p_updates)
    LOOP
        field_value := p_updates->field_name;

        -- Skip certain fields that shouldn't be updated directly
        IF field_name NOT IN ('id', 'organization_id', 'created_at') THEN
            update_sql := update_sql || ', ' || field_name || ' = ' ||
                         CASE
                             WHEN jsonb_typeof(field_value) = 'string' THEN quote_literal(field_value->>0)
                             WHEN jsonb_typeof(field_value) = 'boolean' THEN (field_value->>0)::TEXT
                             WHEN jsonb_typeof(field_value) = 'number' THEN (field_value->>0)::TEXT
                             WHEN jsonb_typeof(field_value) = 'object' THEN quote_literal(field_value::TEXT)
                             WHEN jsonb_typeof(field_value) = 'array' THEN quote_literal(field_value::TEXT)
                             ELSE 'NULL'
                         END;
        END IF;
    END LOOP;

    update_sql := update_sql || ' WHERE id = ' || quote_literal(p_user_id::TEXT);

    -- Execute the update
    EXECUTE update_sql;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
