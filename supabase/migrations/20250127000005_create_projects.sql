-- Create projects table (Step 5 of the sequence)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    customer_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    current_stage_id UUID REFERENCES workflow_stages(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' 
      CHECK (status IN ('active', 'on_hold', 'delayed', 'cancelled', 'completed')),
    priority_level VARCHAR(20) DEFAULT 'medium' 
      CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
    source VARCHAR(50) DEFAULT 'portal',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    estimated_value DECIMAL(15,2),
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    stage_entered_at TIMESTAMPTZ,
    project_type VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_project_id ON projects(project_id);
CREATE INDEX idx_projects_customer_id ON projects(customer_id);
CREATE INDEX idx_projects_current_stage_id ON projects(current_stage_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_assigned_to ON projects(assigned_to);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_priority_level ON projects(priority_level);

-- Add trigger for updated_at
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
