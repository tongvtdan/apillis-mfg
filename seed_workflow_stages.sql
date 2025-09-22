-- Seed Workflow Stages
-- Run this script to manually create default workflow stages for organizations

-- Insert default workflow stages for organization 550e8400-e29b-41d4-a716-446655440000
INSERT INTO workflow_stages (
    organization_id,
    name,
    slug,
    description,
    stage_order,
    estimated_duration_days,
    responsible_roles,
    is_active,
    created_at,
    updated_at
) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Inquiry Received', 'inquiry_received', 'Default inquiry received stage', 1, 1, ARRAY['admin'::user_role, 'sales'::user_role], true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', 'Technical Review', 'technical_review', 'Default technical review stage', 2, 3, ARRAY['admin'::user_role, 'engineering'::user_role], true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', 'Supplier RFQ Sent', 'supplier_rfq_sent', 'Default supplier rfq sent stage', 3, 5, ARRAY['admin'::user_role, 'procurement'::user_role], true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', 'Quoted', 'quoted', 'Default quoted stage', 4, 2, ARRAY['admin'::user_role, 'sales'::user_role], true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', 'Order Confirmed', 'order_confirmed', 'Default order confirmed stage', 5, 1, ARRAY['admin'::user_role, 'procurement'::user_role], true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', 'Procurement Planning', 'procurement_planning', 'Default procurement planning stage', 6, 7, ARRAY['admin'::user_role, 'procurement'::user_role], true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', 'In Production', 'in_production', 'Default in production stage', 7, 14, ARRAY['admin'::user_role, 'production'::user_role], true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', 'Shipped & Closed', 'shipped_closed', 'Default shipped closed stage', 8, 1, ARRAY['admin'::user_role], true, NOW(), NOW())
ON CONFLICT (organization_id, slug) DO NOTHING;

-- Verify the stages were created
SELECT COUNT(*) as stages_created FROM workflow_stages WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000';
