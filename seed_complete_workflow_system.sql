-- Complete Workflow System Seeding Script
-- This script seeds all workflow-related tables for proper project functionality

-- Organization ID (replace with your actual organization ID if different)
-- Current: 550e8400-e29b-41d4-a716-446655440000

DO $$
DECLARE
    org_id UUID := '550e8400-e29b-41d4-a716-446655440000';
    workflow_def_id UUID;
    stage_id_inquiry UUID;
    stage_id_technical UUID;
    stage_id_supplier UUID;
    stage_id_quoted UUID;
    stage_id_order UUID;
    stage_id_procurement UUID;
    stage_id_production UUID;
    stage_id_closed UUID;

    -- Sub-stage IDs
    sub_stage_ids UUID[];
BEGIN
    -- 1. Create the main workflow definition
    INSERT INTO workflow_definitions (
        organization_id,
        name,
        version,
        description,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        org_id,
        'Default Manufacturing Workflow',
        1,
        'Standard workflow for manufacturing projects with 8 stages and sub-stages',
        true,
        NOW(),
        NOW()
    ) RETURNING id INTO workflow_def_id;

    RAISE NOTICE 'Created workflow definition: %', workflow_def_id;

    -- 2. Create workflow stages (these should already exist from previous script)
    -- But let's ensure they exist
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
        (org_id, 'Inquiry Received', 'inquiry_received', 'Initial inquiry received from customer', 1, 1, ARRAY['admin', 'sales']::user_role[], true, NOW(), NOW()),
        (org_id, 'Technical Review', 'technical_review', 'Technical review and feasibility assessment', 2, 3, ARRAY['admin', 'engineering'], true, NOW(), NOW()),
        (org_id, 'Supplier RFQ Sent', 'supplier_rfq_sent', 'Request for quotes sent to suppliers', 3, 5, ARRAY['admin', 'procurement'], true, NOW(), NOW()),
        (org_id, 'Quoted', 'quoted', 'Project quoted and ready for approval', 4, 2, ARRAY['admin', 'sales'], true, NOW(), NOW()),
        (org_id, 'Order Confirmed', 'order_confirmed', 'Order confirmed and ready for procurement', 5, 1, ARRAY['admin', 'procurement'], true, NOW(), NOW()),
        (org_id, 'Procurement Planning', 'procurement_planning', 'Procurement and material planning', 6, 7, ARRAY['admin', 'procurement'], true, NOW(), NOW()),
        (org_id, 'In Production', 'in_production', 'Manufacturing in progress', 7, 14, ARRAY['admin', 'production'], true, NOW(), NOW()),
        (org_id, 'Shipped & Closed', 'shipped_closed', 'Project completed and shipped', 8, 1, ARRAY['admin'], true, NOW(), NOW())
    ON CONFLICT (organization_id, slug) DO NOTHING;

    RAISE NOTICE 'Ensured workflow stages exist';

    -- Get stage IDs for reference
    SELECT id INTO stage_id_inquiry FROM workflow_stages WHERE organization_id = org_id AND slug = 'inquiry_received';
    SELECT id INTO stage_id_technical FROM workflow_stages WHERE organization_id = org_id AND slug = 'technical_review';
    SELECT id INTO stage_id_supplier FROM workflow_stages WHERE organization_id = org_id AND slug = 'supplier_rfq_sent';
    SELECT id INTO stage_id_quoted FROM workflow_stages WHERE organization_id = org_id AND slug = 'quoted';
    SELECT id INTO stage_id_order FROM workflow_stages WHERE organization_id = org_id AND slug = 'order_confirmed';
    SELECT id INTO stage_id_procurement FROM workflow_stages WHERE organization_id = org_id AND slug = 'procurement_planning';
    SELECT id INTO stage_id_production FROM workflow_stages WHERE organization_id = org_id AND slug = 'in_production';
    SELECT id INTO stage_id_closed FROM workflow_stages WHERE organization_id = org_id AND slug = 'shipped_closed';

    RAISE NOTICE 'Retrieved stage IDs';

    -- 3. Create workflow sub-stages for each stage
    -- Inquiry Received sub-stages
    INSERT INTO workflow_sub_stages (
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        sub_stage_order,
        is_active,
        is_required,
        can_skip,
        auto_advance,
        estimated_duration_hours,
        responsible_roles,
        created_at,
        updated_at
    ) VALUES
        (org_id, stage_id_inquiry, 'Initial Contact', 'initial_contact', 'Initial customer contact recorded', 1, true, true, false, false, 2, ARRAY['admin']::user_role[], NOW(), NOW()),
        (org_id, stage_id_inquiry, 'Requirement Gathering', 'requirement_gathering', 'Gather project requirements', 2, true, true, false, false, 4, ARRAY['admin', 'sales']::user_role[], NOW(), NOW()),
        (org_id, stage_id_inquiry, 'Feasibility Check', 'feasibility_check', 'Check technical feasibility', 3, true, false, true, false, 2, ARRAY['admin', 'engineering']::user_role[], NOW(), NOW())
    ON CONFLICT (organization_id, slug) DO NOTHING;

    -- Technical Review sub-stages
    INSERT INTO workflow_sub_stages (
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        sub_stage_order,
        is_active,
        is_required,
        can_skip,
        auto_advance,
        estimated_duration_hours,
        responsible_roles,
        created_at,
        updated_at
    ) VALUES
        (org_id, stage_id_technical, 'Design Review', 'design_review', 'Review design requirements', 1, true, true, false, false, 8, ARRAY['admin', 'engineering']::user_role[], NOW(), NOW()),
        (org_id, stage_id_technical, 'Material Analysis', 'material_analysis', 'Analyze material requirements', 2, true, true, false, false, 6, ARRAY['admin', 'engineering']::user_role[], NOW(), NOW()),
        (org_id, stage_id_technical, 'Cost Estimation', 'cost_estimation', 'Estimate project costs', 3, true, true, false, false, 4, ARRAY['admin', 'engineering']::user_role[], NOW(), NOW())
    ON CONFLICT (organization_id, slug) DO NOTHING;

    -- Supplier RFQ Sent sub-stages
    INSERT INTO workflow_sub_stages (
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        sub_stage_order,
        is_active,
        is_required,
        can_skip,
        auto_advance,
        estimated_duration_hours,
        responsible_roles,
        created_at,
        updated_at
    ) VALUES
        (org_id, stage_id_supplier, 'Supplier Selection', 'supplier_selection', 'Select appropriate suppliers', 1, true, true, false, false, 4, ARRAY['admin', 'procurement']::user_role[], NOW(), NOW()),
        (org_id, stage_id_supplier, 'RFQ Preparation', 'rfq_preparation', 'Prepare RFQ documents', 2, true, true, false, false, 8, ARRAY['admin', 'procurement']::user_role[], NOW(), NOW()),
        (org_id, stage_id_supplier, 'RFQ Distribution', 'rfq_distribution', 'Send RFQ to suppliers', 3, true, true, false, false, 2, ARRAY['admin', 'procurement']::user_role[], NOW(), NOW())
    ON CONFLICT (organization_id, slug) DO NOTHING;

    -- Procurement Planning sub-stages
    INSERT INTO workflow_sub_stages (
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        sub_stage_order,
        is_active,
        is_required,
        can_skip,
        auto_advance,
        estimated_duration_hours,
        responsible_roles,
        created_at,
        updated_at
    ) VALUES
        (org_id, stage_id_procurement, 'Material Procurement', 'material_procurement', 'Procure required materials', 1, true, true, false, false, 16, ARRAY['admin', 'procurement']::user_role[], NOW(), NOW()),
        (org_id, stage_id_procurement, 'Quality Check', 'quality_check', 'Quality assurance check', 2, true, true, false, false, 8, ARRAY['admin', 'procurement']::user_role[], NOW(), NOW()),
        (org_id, stage_id_procurement, 'Inventory Management', 'inventory_management', 'Manage inventory', 3, true, true, false, false, 4, ARRAY['admin', 'procurement']::user_role[], NOW(), NOW())
    ON CONFLICT (organization_id, slug) DO NOTHING;

    -- In Production sub-stages
    INSERT INTO workflow_sub_stages (
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        sub_stage_order,
        is_active,
        is_required,
        can_skip,
        auto_advance,
        estimated_duration_hours,
        responsible_roles,
        created_at,
        updated_at
    ) VALUES
        (org_id, stage_id_production, 'Setup', 'setup', 'Production setup and preparation', 1, true, true, false, false, 8, ARRAY['admin', 'production']::user_role[], NOW(), NOW()),
        (org_id, stage_id_production, 'Manufacturing', 'manufacturing', 'Main manufacturing process', 2, true, true, false, false, 48, ARRAY['admin', 'production']::user_role[], NOW(), NOW()),
        (org_id, stage_id_production, 'Quality Control', 'quality_control', 'Final quality control', 3, true, true, false, false, 8, ARRAY['admin', 'production']::user_role[], NOW(), NOW()),
        (org_id, stage_id_production, 'Packaging', 'packaging', 'Product packaging', 4, true, true, false, false, 4, ARRAY['admin', 'production']::user_role[], NOW(), NOW())
    ON CONFLICT (organization_id, slug) DO NOTHING;

    RAISE NOTICE 'Created workflow sub-stages';

    -- 4. Link workflow definition to stages
    INSERT INTO workflow_definition_stages (
        workflow_definition_id,
        workflow_stage_id,
        is_included,
        stage_order_override,
        created_at,
        updated_at
    ) VALUES
        (workflow_def_id, stage_id_inquiry, true, 1, NOW(), NOW()),
        (workflow_def_id, stage_id_technical, true, 2, NOW(), NOW()),
        (workflow_def_id, stage_id_supplier, true, 3, NOW(), NOW()),
        (workflow_def_id, stage_id_quoted, true, 4, NOW(), NOW()),
        (workflow_def_id, stage_id_order, true, 5, NOW(), NOW()),
        (workflow_def_id, stage_id_procurement, true, 6, NOW(), NOW()),
        (workflow_def_id, stage_id_production, true, 7, NOW(), NOW()),
        (workflow_def_id, stage_id_closed, true, 8, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Linked workflow definition to stages';

    -- 5. Link workflow definition to sub-stages
    -- Get sub-stage IDs for linking
    SELECT ARRAY(
        SELECT id FROM workflow_sub_stages WHERE organization_id = org_id ORDER BY workflow_stage_id, sub_stage_order
    ) INTO sub_stage_ids;

    IF array_length(sub_stage_ids, 1) > 0 THEN
        -- Link all sub-stages to the workflow definition
        INSERT INTO workflow_definition_sub_stages (
            workflow_definition_id,
            workflow_sub_stage_id,
            is_included,
            sub_stage_order_override,
            created_at,
            updated_at
        )
        SELECT
            workflow_def_id,
            id,
            true,
            sub_stage_order,
            NOW(),
            NOW()
        FROM workflow_sub_stages
        WHERE organization_id = org_id
        ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Linked workflow definition to sub-stages: %', array_length(sub_stage_ids, 1);
    END IF;

    -- 6. Verification queries
    RAISE NOTICE '=== VERIFICATION ===';
    RAISE NOTICE 'Workflow definition count: %', (SELECT COUNT(*) FROM workflow_definitions WHERE organization_id = org_id);
    RAISE NOTICE 'Workflow stages count: %', (SELECT COUNT(*) FROM workflow_stages WHERE organization_id = org_id);
    RAISE NOTICE 'Workflow sub-stages count: %', (SELECT COUNT(*) FROM workflow_sub_stages WHERE organization_id = org_id);
    RAISE NOTICE 'Workflow definition stages count: %', (SELECT COUNT(*) FROM workflow_definition_stages WHERE workflow_definition_id = workflow_def_id);
    RAISE NOTICE 'Workflow definition sub-stages count: %', (SELECT COUNT(*) FROM workflow_definition_sub_stages WHERE workflow_definition_id = workflow_def_id);

    RAISE NOTICE '=== COMPLETE WORKFLOW SYSTEM SEEDED SUCCESSFULLY ===';

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error seeding workflow system: %', SQLERRM;
END $$;
