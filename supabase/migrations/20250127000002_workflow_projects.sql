-- Migration Script: Create Workflow and Projects Tables
-- This script creates the workflow stages and projects tables
-- Date: 2025-01-27

-- ============================================================================
-- STEP 1: Create workflow_stages table
-- ============================================================================
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

-- ============================================================================
-- STEP 2: Create projects table
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id VARCHAR(20) UNIQUE NOT NULL, -- P-25082001
    title VARCHAR(255) NOT NULL,
    description TEXT,
    customer_id UUID REFERENCES contacts(id),
    current_stage_id UUID REFERENCES workflow_stages(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active' 
      CHECK (status IN ('active', 'delayed', 'on_hold', 'cancelled', 'completed', 'archived')),
    priority_score INTEGER DEFAULT 50 CHECK (priority_score BETWEEN 0 AND 100),
    priority_level VARCHAR(10) DEFAULT 'medium' 
      CHECK (priority_level IN ('low', 'medium', 'high', 'urgent', 'critical')),
    estimated_delivery_date TIMESTAMPTZ,
    actual_delivery_date TIMESTAMPTZ,
    source VARCHAR(20) DEFAULT 'manual' 
      CHECK (source IN ('manual', 'portal', 'email', 'api', 'import', 'migration')),
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: Create project_stage_history table
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES workflow_stages(id),
    entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    exited_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    entered_by UUID REFERENCES users(id),
    exit_reason VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: Create project_assignments table
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    UNIQUE(project_id, user_id, role)
);

-- ============================================================================
-- STEP 5: Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_workflow_stages_organization_id ON workflow_stages(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_stages_slug ON workflow_stages(slug);
CREATE INDEX IF NOT EXISTS idx_workflow_stages_stage_order ON workflow_stages(stage_order);
CREATE INDEX IF NOT EXISTS idx_workflow_stages_is_active ON workflow_stages(is_active);

CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_current_stage_id ON projects(current_stage_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_project_id ON projects(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority_level ON projects(priority_level);
CREATE INDEX IF NOT EXISTS idx_projects_estimated_delivery_date ON projects(estimated_delivery_date);
CREATE INDEX IF NOT EXISTS idx_projects_actual_delivery_date ON projects(actual_delivery_date);
CREATE INDEX IF NOT EXISTS idx_projects_source ON projects(source);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON projects(assigned_to);

CREATE INDEX IF NOT EXISTS idx_project_stage_history_project_id ON project_stage_history(project_id);
CREATE INDEX IF NOT EXISTS idx_project_stage_history_stage_id ON project_stage_history(stage_id);
CREATE INDEX IF NOT EXISTS idx_project_stage_history_entered_at ON project_stage_history(entered_at);
CREATE INDEX IF NOT EXISTS idx_project_stage_history_entered_by ON project_stage_history(entered_by);

CREATE INDEX IF NOT EXISTS idx_project_assignments_project_id ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_user_id ON project_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_role ON project_assignments(role);
CREATE INDEX IF NOT EXISTS idx_project_assignments_is_active ON project_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_project_assignments_assigned_at ON project_assignments(assigned_at);

-- ============================================================================
-- STEP 6: Insert sample workflow stages
-- ============================================================================
INSERT INTO workflow_stages (id, organization_id, name, slug, description, color, stage_order, is_active, responsible_roles)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001', 'Project Initiation', 'initiation', 'Project setup and requirements gathering', '#3B82F6', 1, true, ARRAY['management', 'engineering']),
    ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', 'Design & Planning', 'design', 'Technical design and project planning', '#10B981', 2, true, ARRAY['engineering', 'management']),
    ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440001', 'Procurement', 'procurement', 'Supplier selection and material procurement', '#F59E0B', 3, true, ARRAY['procurement', 'management']),
    ('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440001', 'Production', 'production', 'Manufacturing and assembly', '#EF4444', 4, true, ARRAY['production', 'engineering']),
    ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440001', 'Quality Control', 'quality', 'Testing and quality assurance', '#8B5CF6', 5, true, ARRAY['qa', 'engineering']),
    ('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440001', 'Delivery', 'delivery', 'Final delivery and customer acceptance', '#06B6D4', 6, true, ARRAY['sales', 'management'])
ON CONFLICT (organization_id, slug) DO NOTHING;

-- ============================================================================
-- STEP 7: Insert sample projects
-- ============================================================================
INSERT INTO projects (id, organization_id, project_id, title, description, customer_id, current_stage_id, status, priority_score, priority_level, estimated_delivery_date, created_by)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440001', 'P-25082001', 'Automotive Component Manufacturing', 'High-precision automotive parts manufacturing project', NULL, '550e8400-e29b-41d4-a716-446655440020', 'active', 75, 'high', '2025-03-15', '550e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440001', 'P-25082002', 'Electronics Assembly Line', 'Complete electronics assembly line setup', NULL, '550e8400-e29b-41d4-a716-446655440021', 'active', 60, 'medium', '2025-04-20', '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (project_id) DO NOTHING;

-- ============================================================================
-- STEP 8: Enable Row Level Security
-- ============================================================================
ALTER TABLE workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
