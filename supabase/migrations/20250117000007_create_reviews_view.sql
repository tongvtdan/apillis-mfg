-- =========================================
-- CREATE REVIEWS VIEW AS ALIAS FOR APPROVALS
-- =========================================

-- Create a view that maps the reviews table to the approvals table
-- This allows existing code to work without modification
CREATE OR REPLACE VIEW reviews AS
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
    NULL::numeric as estimated_cost,
    NULL::numeric as estimated_lead_time,
    due_date,
    decided_at as reviewed_at,
    created_at,
    updated_at
FROM approvals
WHERE entity_type = 'project';

-- Create a view for review_checklist_items (empty for now)
CREATE OR REPLACE VIEW review_checklist_items AS
SELECT 
    NULL::uuid as id,
    NULL::uuid as review_id,
    NULL::text as item_text,
    NULL::boolean as is_checked,
    NULL::boolean as is_required,
    NULL::text as notes,
    NULL::uuid as checked_by,
    NULL::timestamp with time zone as checked_at
WHERE false; -- This creates an empty view

-- Grant permissions on the views
GRANT SELECT, INSERT, UPDATE, DELETE ON reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON review_checklist_items TO authenticated;

-- Add comments for documentation
COMMENT ON VIEW reviews IS 'View that maps reviews table to approvals table for backward compatibility';
COMMENT ON VIEW review_checklist_items IS 'Empty view for review checklist items - placeholder for future implementation';
