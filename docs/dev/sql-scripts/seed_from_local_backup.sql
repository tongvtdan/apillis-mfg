-- Seed Remote Database from Local Backup Data
-- This script extracts and seeds workflow system data from the local backup
-- Run this on your remote database to replicate the working local setup

DO $$
DECLARE
    org_id UUID := '550e8400-e29b-41d4-a716-446655440000';
    workflow_def_id UUID;
    stage_ids UUID[];
    sub_stage_ids UUID[];
    project_ids UUID[];
BEGIN
    RAISE NOTICE '=== SEEDING REMOTE DATABASE FROM LOCAL BACKUP ===';
    RAISE NOTICE 'Organization ID: %', org_id;

    -- 1. Create the main workflow definition (from local backup)
    INSERT INTO workflow_definitions (
        id,
        organization_id,
        name,
        version,
        description,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        '5ab31fd7-a443-41f8-b2d5-c60a808fedf6',
        org_id,
        'Default Manufacturing Workflow',
        1,
        'Standard manufacturing workflow for all projects',
        true,
        '2025-09-13 02:08:38.408391+00',
        '2025-09-13 02:08:38.408391+00'
    ) ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE '✅ Created workflow definition';

    -- 2. Create workflow stages (from local backup)
    INSERT INTO workflow_stages (
        id,
        organization_id,
        name,
        slug,
        description,
        color,
        stage_order,
        is_active,
        exit_criteria,
        responsible_roles,
        estimated_duration_days,
        created_at,
        updated_at
    ) VALUES
        ('880e8400-e29b-41d4-a716-446655440001', org_id, 'Inquiry Received', 'inquiry_received', 'Customer RFQ submitted and initial review completed', '#3B82F6', 1, true, NULL, ARRAY['sales'::user_role, 'procurement'::user_role], 2, NOW(), NOW()),
        ('880e8400-e29b-41d4-a716-446655440002', org_id, 'Technical Review', 'technical_review', 'Engineering, QA, and Production teams review technical requirements', '#F59E0B', 2, true, NULL, ARRAY['engineering'::user_role, 'qa'::user_role, 'production'::user_role], 3, NOW(), NOW()),
        ('880e8400-e29b-41d4-a716-446655440003', org_id, 'Supplier RFQ Sent', 'supplier_rfq_sent', 'RFQs sent to qualified suppliers for component pricing and lead times', '#F97316', 3, true, NULL, ARRAY['procurement'::user_role], 1, NOW(), NOW()),
        ('880e8400-e29b-41d4-a716-446655440004', org_id, 'Quoted', 'quoted', 'Customer quote generated and sent based on supplier responses', '#10B981', 4, true, NULL, ARRAY['sales'::user_role, 'procurement'::user_role], 2, NOW(), NOW()),
        ('880e8400-e29b-41d4-a716-446655440005', org_id, 'Order Confirmed', 'order_confirmed', 'Customer accepted quote and order confirmed', '#6366F1', 5, true, NULL, ARRAY['sales'::user_role, 'procurement'::user_role, 'production'::user_role], 1, NOW(), NOW()),
        ('880e8400-e29b-41d4-a716-446655440006', org_id, 'Procurement Planning', 'procurement_planning', 'Procurement and material planning phase', '#EAB308', 6, true, NULL, ARRAY['procurement'::user_role], 7, NOW(), NOW()),
        ('880e8400-e29b-41d4-a716-446655440007', org_id, 'In Production', 'in_production', 'Manufacturing and production phase', '#14B8A6', 7, true, NULL, ARRAY['production'::user_role], 14, NOW(), NOW()),
        ('880e8400-e29b-41d4-a716-446655440008', org_id, 'Shipped & Closed', 'shipped_closed', 'Project completed and shipped to customer', '#6B7280', 8, true, NULL, ARRAY['sales'::user_role, 'logistics'::user_role], 1, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE '✅ Created workflow stages';

    -- 3. Create workflow sub-stages (from local backup)
    INSERT INTO workflow_sub_stages (
        id,
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        color,
        sub_stage_order,
        is_active,
        exit_criteria,
        responsible_roles,
        estimated_duration_hours,
        is_required,
        can_skip,
        auto_advance,
        requires_approval,
        approval_roles,
        metadata,
        created_at,
        updated_at
    ) VALUES
        -- Inquiry Received sub-stages
        ('990e8400-e29b-41d4-a716-446655440001', org_id, '880e8400-e29b-41d4-a716-446655440001', 'Initial Review', 'initial_review', 'Review customer requirements and feasibility', NULL, 1, true, NULL, ARRAY['sales'::user_role, 'management'::user_role], 4, true, false, false, false, NULL, '{}', NOW(), NOW()),
        ('990e8400-e29b-41d4-a716-446655440002', org_id, '880e8400-e29b-41d4-a716-446655440001', 'Technical Assessment', 'technical_assessment', 'Assess technical requirements and capabilities', NULL, 2, true, NULL, ARRAY['engineering'::user_role], 8, true, false, false, false, NULL, '{}', NOW(), NOW()),
        ('990e8400-e29b-41d4-a716-446655440003', org_id, '880e8400-e29b-41d4-a716-446655440001', 'Cost Estimation', 'cost_estimation', 'Initial cost estimation and budget planning', NULL, 3, true, NULL, ARRAY['sales'::user_role, 'procurement'::user_role], 6, true, false, false, false, NULL, '{}', NOW(), NOW()),

        -- Technical Review sub-stages
        ('990e8400-e29b-41d4-a716-446655440004', org_id, '880e8400-e29b-41d4-a716-446655440002', 'Design Review', 'design_review', 'Review design specifications and requirements', NULL, 1, true, NULL, ARRAY['engineering'::user_role], 16, true, false, false, true, NULL, '{}', NOW(), NOW()),
        ('990e8400-e29b-41d4-a716-446655440005', org_id, '880e8400-e29b-41d4-a716-446655440002', 'Quality Assessment', 'quality_assessment', 'Quality requirements and testing procedures', NULL, 2, true, NULL, ARRAY['qa'::user_role], 8, true, false, false, true, NULL, '{}', NOW(), NOW()),
        ('990e8400-e29b-41d4-a716-446655440006', org_id, '880e8400-e29b-41d4-a716-446655440002', 'Production Planning', 'production_planning', 'Production process planning and setup', NULL, 3, true, NULL, ARRAY['production'::user_role], 12, true, false, false, true, NULL, '{}', NOW(), NOW()),

        -- Supplier RFQ Sent sub-stages
        ('990e8400-e29b-41d4-a716-446655440007', org_id, '880e8400-e29b-41d4-a716-446655440003', 'Supplier Selection', 'supplier_selection', 'Select appropriate suppliers for components', NULL, 1, true, NULL, ARRAY['procurement'::user_role], 4, true, false, false, false, NULL, '{}', NOW(), NOW()),
        ('990e8400-e29b-41d4-a716-446655440008', org_id, '880e8400-e29b-41d4-a716-446655440003', 'RFQ Preparation', 'rfq_preparation', 'Prepare RFQ documents and specifications', NULL, 2, true, NULL, ARRAY['procurement'::user_role], 8, true, false, false, false, NULL, '{}', NOW(), NOW()),
        ('990e8400-e29b-41d4-a716-446655440009', org_id, '880e8400-e29b-41d4-a716-446655440003', 'RFQ Distribution', 'rfq_distribution', 'Send RFQ to selected suppliers', NULL, 3, true, NULL, ARRAY['procurement'::user_role], 2, true, false, false, false, NULL, '{}', NOW(), NOW()),

        -- Procurement Planning sub-stages
        ('990e8400-e29b-41d4-a716-446655440010', org_id, '880e8400-e29b-41d4-a716-446655440006', 'Material Procurement', 'material_procurement', 'Procure required materials and components', NULL, 1, true, NULL, ARRAY['procurement'::user_role], 16, true, false, false, false, NULL, '{}', NOW(), NOW()),
        ('990e8400-e29b-41d4-a716-446655440011', org_id, '880e8400-e29b-41d4-a716-446655440006', 'Quality Check', 'quality_check', 'Quality assurance and material inspection', NULL, 2, true, NULL, ARRAY['procurement'::user_role, 'qa'::user_role], 8, true, false, false, false, NULL, '{}', NOW(), NOW()),
        ('990e8400-e29b-41d4-a716-446655440012', org_id, '880e8400-e29b-41d4-a716-446655440006', 'Inventory Management', 'inventory_management', 'Manage material inventory and storage', NULL, 3, true, NULL, ARRAY['procurement'::user_role], 4, true, false, false, false, NULL, '{}', NOW(), NOW()),

        -- In Production sub-stages
        ('990e8400-e29b-41d4-a716-446655440013', org_id, '880e8400-e29b-41d4-a716-446655440007', 'Setup', 'setup', 'Production setup and preparation', NULL, 1, true, NULL, ARRAY['production'::user_role], 8, true, false, false, false, NULL, '{}', NOW(), NOW()),
        ('990e8400-e29b-41d4-a716-446655440014', org_id, '880e8400-e29b-41d4-a716-446655440007', 'Manufacturing', 'manufacturing', 'Main manufacturing process', NULL, 2, true, NULL, ARRAY['production'::user_role], 48, true, false, false, false, NULL, '{}', NOW(), NOW()),
        ('990e8400-e29b-41d4-a716-446655440015', org_id, '880e8400-e29b-41d4-a716-446655440007', 'Quality Control', 'quality_control', 'Final quality control and testing', NULL, 3, true, NULL, ARRAY['production'::user_role, 'qa'::user_role], 8, true, false, false, false, NULL, '{}', NOW(), NOW()),
        ('990e8400-e29b-41d4-a716-446655440016', org_id, '880e8400-e29b-41d4-a716-446655440007', 'Packaging', 'packaging', 'Product packaging and preparation', NULL, 4, true, NULL, ARRAY['production'::user_role], 4, true, false, false, false, NULL, '{}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE '✅ Created workflow sub-stages';

    -- 4. Link workflow definition to stages
    INSERT INTO workflow_definition_stages (
        workflow_definition_id,
        workflow_stage_id,
        is_included,
        stage_order_override,
        created_at,
        updated_at
    ) VALUES
        ('5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '880e8400-e29b-41d4-a716-446655440001', true, 1, NOW(), NOW()),
        ('5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '880e8400-e29b-41d4-a716-446655440002', true, 2, NOW(), NOW()),
        ('5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '880e8400-e29b-41d4-a716-446655440003', true, 3, NOW(), NOW()),
        ('5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '880e8400-e29b-41d4-a716-446655440004', true, 4, NOW(), NOW()),
        ('5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '880e8400-e29b-41d4-a716-446655440005', true, 5, NOW(), NOW()),
        ('5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '880e8400-e29b-41d4-a716-446655440006', true, 6, NOW(), NOW()),
        ('5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '880e8400-e29b-41d4-a716-446655440007', true, 7, NOW(), NOW()),
        ('5ab31fd7-a443-41f8-b2d5-c60a808fedf6', '880e8400-e29b-41d4-a716-446655440008', true, 8, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Linked workflow definition to stages';

    -- 5. Link workflow definition to sub-stages
    INSERT INTO workflow_definition_sub_stages (
        workflow_definition_id,
        workflow_sub_stage_id,
        is_included,
        sub_stage_order_override,
        created_at,
        updated_at
    )
    SELECT
        '5ab31fd7-a443-41f8-b2d5-c60a808fedf6',
        id,
        true,
        sub_stage_order,
        NOW(),
        NOW()
    FROM workflow_sub_stages
    WHERE organization_id = org_id
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Linked workflow definition to sub-stages';

    -- 6. Verification
    RAISE NOTICE '=== VERIFICATION ===';
    RAISE NOTICE 'Workflow definitions: %', (SELECT COUNT(*) FROM workflow_definitions WHERE organization_id = org_id);
    RAISE NOTICE 'Workflow stages: %', (SELECT COUNT(*) FROM workflow_stages WHERE organization_id = org_id);
    RAISE NOTICE 'Workflow sub-stages: %', (SELECT COUNT(*) FROM workflow_sub_stages WHERE organization_id = org_id);
    RAISE NOTICE 'Workflow definition stages: %', (SELECT COUNT(*) FROM workflow_definition_stages WHERE workflow_definition_id = '5ab31fd7-a443-41f8-b2d5-c60a808fedf6');
    RAISE NOTICE 'Workflow definition sub-stages: %', (SELECT COUNT(*) FROM workflow_definition_sub_stages WHERE workflow_definition_id = '5ab31fd7-a443-41f8-b2d5-c60a808fedf6');

    RAISE NOTICE '=== REMOTE DATABASE SEEDED SUCCESSFULLY ===';
    RAISE NOTICE 'You can now create projects without errors!';

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error seeding remote database: %', SQLERRM;
END $$;
