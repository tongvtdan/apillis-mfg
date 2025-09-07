-- =========================================
-- REPLACE REVIEWS VIEW WITH TABLE
-- =========================================

-- Drop the existing view
DROP VIEW IF EXISTS reviews CASCADE;

-- Create a proper reviews table with foreign key constraints
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_role user_role,
    review_type approval_type NOT NULL,
    status approval_status NOT NULL DEFAULT 'pending',
    priority approval_priority NOT NULL DEFAULT 'normal',
    comments TEXT,
    risks JSONB DEFAULT '{}'::jsonb,
    recommendations TEXT,
    tooling_required BOOLEAN DEFAULT false,
    estimated_cost NUMERIC,
    estimated_lead_time NUMERIC,
    due_date DATE,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_reviews_project_id ON reviews(project_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_organization_id ON reviews(organization_id);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "reviews_select_policy" ON reviews
    FOR SELECT USING (organization_id = (SELECT get_current_user_org_id()));

CREATE POLICY "reviews_insert_policy" ON reviews
    FOR INSERT WITH CHECK (organization_id = (SELECT get_current_user_org_id()));

CREATE POLICY "reviews_update_policy" ON reviews
    FOR UPDATE USING (organization_id = (SELECT get_current_user_org_id()));

CREATE POLICY "reviews_delete_policy" ON reviews
    FOR DELETE USING (organization_id = (SELECT get_current_user_org_id()));

-- Migrate existing data from approvals table
INSERT INTO reviews (
    id,
    organization_id,
    project_id,
    reviewer_id,
    reviewer_role,
    review_type,
    status,
    priority,
    comments,
    risks,
    recommendations,
    tooling_required,
    due_date,
    reviewed_at,
    created_at,
    updated_at
)
SELECT 
    id,
    organization_id,
    entity_id as project_id,
    current_approver_id as reviewer_id,
    current_approver_role as reviewer_role,
    approval_type as review_type,
    status,
    priority,
    decision_comments as comments,
    request_metadata as risks,
    decision_reason as recommendations,
    CASE 
        WHEN approval_type = 'technical_review' THEN true
        WHEN approval_type = 'quality_review' THEN true
        WHEN approval_type = 'engineering_change' THEN true
        ELSE false
    END as tooling_required,
    due_date,
    decided_at as reviewed_at,
    created_at,
    updated_at
FROM approvals
WHERE entity_type = 'project';

-- Create the review_checklist_items table
CREATE TABLE review_checklist_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    is_checked BOOLEAN DEFAULT false,
    is_required BOOLEAN DEFAULT false,
    notes TEXT,
    checked_by UUID REFERENCES users(id),
    checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for review_checklist_items
ALTER TABLE review_checklist_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for review_checklist_items
CREATE POLICY "review_checklist_items_select_policy" ON review_checklist_items
    FOR SELECT USING (
        review_id IN (
            SELECT id FROM reviews WHERE organization_id = (SELECT get_current_user_org_id())
        )
    );

CREATE POLICY "review_checklist_items_insert_policy" ON review_checklist_items
    FOR INSERT WITH CHECK (
        review_id IN (
            SELECT id FROM reviews WHERE organization_id = (SELECT get_current_user_org_id())
        )
    );

CREATE POLICY "review_checklist_items_update_policy" ON review_checklist_items
    FOR UPDATE USING (
        review_id IN (
            SELECT id FROM reviews WHERE organization_id = (SELECT get_current_user_org_id())
        )
    );

CREATE POLICY "review_checklist_items_delete_policy" ON review_checklist_items
    FOR DELETE USING (
        review_id IN (
            SELECT id FROM reviews WHERE organization_id = (SELECT get_current_user_org_id())
        )
    );

-- Grant permissions
GRANT ALL ON reviews TO authenticated;
GRANT ALL ON review_checklist_items TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE reviews IS 'Reviews table with proper foreign key constraints for Supabase joins';
COMMENT ON TABLE review_checklist_items IS 'Checklist items for reviews';
