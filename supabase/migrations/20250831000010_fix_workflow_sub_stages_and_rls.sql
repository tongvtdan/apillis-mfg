-- Fix Workflow Sub-Stages and RLS Policy Issues
-- This migration creates the workflow_sub_stages table and fixes the type casting error

-- Create workflow_sub_stages table
CREATE TABLE workflow_sub_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workflow_stage_id UUID NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    sub_stage_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    exit_criteria TEXT,
    responsible_roles user_role[] DEFAULT '{}',
    estimated_duration_hours INTEGER,
    is_required BOOLEAN DEFAULT true,
    can_skip BOOLEAN DEFAULT false,
    auto_advance BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    approval_roles user_role[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workflow_stage_id, slug),
    UNIQUE(workflow_stage_id, sub_stage_order)
);

-- Add indexes for performance
CREATE INDEX idx_workflow_sub_stages_organization_id ON workflow_sub_stages(organization_id);
CREATE INDEX idx_workflow_sub_stages_workflow_stage_id ON workflow_sub_stages(workflow_stage_id);
CREATE INDEX idx_workflow_sub_stages_is_active ON workflow_sub_stages(is_active);
CREATE INDEX idx_workflow_sub_stages_order ON workflow_sub_stages(workflow_stage_id, sub_stage_order);

-- Add RLS policies for workflow_sub_stages
ALTER TABLE workflow_sub_stages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view sub-stages for their organization
CREATE POLICY "Users can view sub-stages for their organization" ON workflow_sub_stages
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Policy: Admin and management can manage sub-stages
CREATE POLICY "Admin and management can manage sub-stages" ON workflow_sub_stages
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'management')
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER set_workflow_sub_stages_updated_at
    BEFORE UPDATE ON workflow_sub_stages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add sub_stages_count to workflow_stages table for quick reference
ALTER TABLE workflow_stages 
ADD COLUMN IF NOT EXISTS sub_stages_count INTEGER DEFAULT 0;

-- Create function to update sub_stages_count
CREATE OR REPLACE FUNCTION update_workflow_stage_sub_stages_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the count when sub-stages are inserted, updated, or deleted
    UPDATE workflow_stages 
    SET sub_stages_count = (
        SELECT COUNT(*) 
        FROM workflow_sub_stages 
        WHERE workflow_stage_id = COALESCE(NEW.workflow_stage_id, OLD.workflow_stage_id)
        AND is_active = true
    )
    WHERE id = COALESCE(NEW.workflow_stage_id, OLD.workflow_stage_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update sub_stages_count
CREATE TRIGGER trigger_update_workflow_stage_sub_stages_count
    AFTER INSERT OR UPDATE OR DELETE ON workflow_sub_stages
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_stage_sub_stages_count();

-- Create project_sub_stage_progress table to track sub-stage progress
CREATE TABLE project_sub_stage_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    workflow_stage_id UUID NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
    sub_stage_id UUID NOT NULL REFERENCES workflow_sub_stages(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'blocked')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES users(id),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, sub_stage_id)
);

-- Add indexes for project_sub_stage_progress
CREATE INDEX idx_project_sub_stage_progress_project_id ON project_sub_stage_progress(project_id);
CREATE INDEX idx_project_sub_stage_progress_workflow_stage_id ON project_sub_stage_progress(workflow_stage_id);
CREATE INDEX idx_project_sub_stage_progress_sub_stage_id ON project_sub_stage_progress(sub_stage_id);
CREATE INDEX idx_project_sub_stage_progress_status ON project_sub_stage_progress(status);
CREATE INDEX idx_project_sub_stage_progress_assigned_to ON project_sub_stage_progress(assigned_to);

-- Add RLS policies for project_sub_stage_progress
ALTER TABLE project_sub_stage_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view progress for their organization's projects
CREATE POLICY "Users can view sub-stage progress for their organization" ON project_sub_stage_progress
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Policy: Users can update progress for assigned sub-stages
CREATE POLICY "Users can update assigned sub-stage progress" ON project_sub_stage_progress
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        ) AND (
            assigned_to = auth.uid() OR 
            EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() 
                AND role IN ('admin', 'management')
            )
        )
    );

-- Policy: Admin and management can manage all progress
CREATE POLICY "Admin and management can manage sub-stage progress" ON project_sub_stage_progress
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'management')
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER set_project_sub_stage_progress_updated_at
    BEFORE UPDATE ON project_sub_stage_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create sub-stage progress when project enters a stage
CREATE OR REPLACE FUNCTION create_project_sub_stage_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- When a project's current_stage_id changes, create progress records for all sub-stages
    IF NEW.current_stage_id IS DISTINCT FROM OLD.current_stage_id AND NEW.current_stage_id IS NOT NULL THEN
        INSERT INTO project_sub_stage_progress (
            organization_id,
            project_id,
            workflow_stage_id,
            sub_stage_id,
            status
        )
        SELECT 
            NEW.organization_id,
            NEW.id,
            NEW.current_stage_id,
            ws.id,
            CASE 
                WHEN ws.sub_stage_order = 1 THEN 'in_progress'
                ELSE 'pending'
            END
        FROM workflow_sub_stages ws
        WHERE ws.workflow_stage_id = NEW.current_stage_id
        AND ws.is_active = true
        AND ws.is_required = true
        ON CONFLICT (project_id, sub_stage_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create sub-stage progress
CREATE TRIGGER trigger_create_project_sub_stage_progress
    AFTER UPDATE OF current_stage_id ON projects
    FOR EACH ROW
    EXECUTE FUNCTION create_project_sub_stage_progress();

-- Fix the reviews RLS policy type casting issue
DROP POLICY IF EXISTS "Users can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can modify reviews" ON reviews;

-- Recreate the reviews policies with correct type casting using string comparison
CREATE POLICY "Users can view reviews" ON reviews
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE can_access_project(id)
        ) AND
        (
            get_current_user_role() IN ('admin', 'management') OR
            reviewer_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM workflow_stages 
                WHERE id = (
                    SELECT current_stage_id FROM projects WHERE id = reviews.project_id
                )
                AND get_current_user_role() = ANY(
                    SELECT unnest(responsible_roles)::text
                )
            )
        )
    );

CREATE POLICY "Users can modify reviews" ON reviews
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects WHERE can_access_project(id)
        ) AND
        (
            get_current_user_role() IN ('admin', 'management') OR
            reviewer_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM workflow_stages 
                WHERE id = (
                    SELECT current_stage_id FROM projects WHERE id = reviews.project_id
                )
                AND get_current_user_role() = ANY(
                    SELECT unnest(responsible_roles)::text
                )
            )
        )
    );
