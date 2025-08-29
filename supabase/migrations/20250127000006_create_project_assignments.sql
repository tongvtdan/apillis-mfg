-- Create project assignments table (Step 6 of the sequence)
CREATE TABLE project_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_project_assignments_project_id ON project_assignments(project_id);
CREATE INDEX idx_project_assignments_user_id ON project_assignments(user_id);
CREATE INDEX idx_project_assignments_role ON project_assignments(role);
CREATE INDEX idx_project_assignments_is_active ON project_assignments(is_active);

-- Add trigger for updated_at
CREATE TRIGGER update_project_assignments_updated_at 
    BEFORE UPDATE ON project_assignments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
