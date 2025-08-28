-- Factory Pulse Workflow & Projects Migration
-- Migration: 20250127000002_workflow_projects.sql
-- Description: Workflow stages and projects tables
-- Date: 2025-01-27

-- 1. Workflow stages (configurable per org)
CREATE TABLE workflow_stages (
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

-- 2. Main projects table
CREATE TABLE projects (
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
      CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
    estimated_value DECIMAL(15,2),
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    source VARCHAR(50) DEFAULT 'manual' 
      CHECK (source IN ('manual', 'portal', 'email', 'api', 'import', 'migration')),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id)
);

-- 3. Project stage history
CREATE TABLE project_stage_history (
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

-- 4. Project assignments
CREATE TABLE project_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(project_id, user_id, role)
);

-- Create indexes for performance
CREATE INDEX idx_workflow_stages_organization_id ON workflow_stages(organization_id);
CREATE INDEX idx_workflow_stages_slug ON workflow_stages(slug);
CREATE INDEX idx_workflow_stages_stage_order ON workflow_stages(stage_order);
CREATE INDEX idx_workflow_stages_is_active ON workflow_stages(is_active);

CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_customer_id ON projects(customer_id);
CREATE INDEX idx_projects_current_stage_id ON projects(current_stage_id);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_project_id ON projects(project_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority_level ON projects(priority_level);
CREATE INDEX idx_projects_priority_score ON projects(priority_score);
CREATE INDEX idx_projects_assigned_to ON projects(assigned_to);
CREATE INDEX idx_projects_source ON projects(source);
CREATE INDEX idx_projects_estimated_delivery_date ON projects(estimated_delivery_date);
CREATE INDEX idx_projects_actual_delivery_date ON projects(actual_delivery_date);

CREATE INDEX idx_project_stage_history_project_id ON project_stage_history(project_id);
CREATE INDEX idx_project_stage_history_stage_id ON project_stage_history(stage_id);
CREATE INDEX idx_project_stage_history_entered_at ON project_stage_history(entered_at);
CREATE INDEX idx_project_stage_history_exited_at ON project_stage_history(exited_at);
CREATE INDEX idx_project_stage_history_entered_by ON project_stage_history(entered_by);

CREATE INDEX idx_project_assignments_project_id ON project_assignments(project_id);
CREATE INDEX idx_project_assignments_user_id ON project_assignments(user_id);
CREATE INDEX idx_project_assignments_role ON project_assignments(role);
CREATE INDEX idx_project_assignments_is_active ON project_assignments(is_active);
CREATE INDEX idx_project_assignments_assigned_at ON project_assignments(assigned_at);

-- Enable Row Level Security (RLS)
ALTER TABLE workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;

-- Create triggers for automation
CREATE TRIGGER update_workflow_stages_updated_at BEFORE UPDATE ON workflow_stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate project IDs
CREATE OR REPLACE FUNCTION generate_project_id()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT;
    sequence_num INTEGER;
    new_project_id TEXT;
BEGIN
    -- Generate date part (YYMMDD)
    date_part := TO_CHAR(NOW(), 'YYMMDD');
    
    -- Get next sequence number for today
    SELECT COALESCE(MAX(CAST(RIGHT(project_id, 2) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM projects
    WHERE project_id LIKE 'P-' || date_part || '%';
    
    -- Generate new project ID
    new_project_id := 'P-' || date_part || LPAD(sequence_num::TEXT, 2, '0');
    
    NEW.project_id := new_project_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_project_id_trigger
    BEFORE INSERT ON projects
    FOR EACH ROW
    WHEN (NEW.project_id IS NULL)
    EXECUTE FUNCTION generate_project_id();
