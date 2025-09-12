-- =========================================
-- Create Default Workflow Definition for Apillis Organization
-- This migration creates a comprehensive workflow definition for the manufacturing process
-- =========================================

-- Get the Apillis organization ID
DO $$
DECLARE
    apillis_org_id UUID;
    workflow_def_id UUID;
BEGIN
    -- Get Apillis organization ID
    SELECT id INTO apillis_org_id 
    FROM organizations 
    WHERE slug = 'apillis' AND organization_type = 'internal';
    
    IF apillis_org_id IS NULL THEN
        RAISE EXCEPTION 'Apillis organization not found';
    END IF;
    
    -- Create the default workflow definition
    INSERT INTO workflow_definitions (
        organization_id,
        name,
        version,
        description,
        is_active,
        created_by
    ) VALUES (
        apillis_org_id,
        'Default Manufacturing Workflow',
        1,
        'Standard manufacturing workflow for all projects',
        true,
        NULL
    ) RETURNING id INTO workflow_def_id;
    
    -- Link all existing workflow stages to this definition
    INSERT INTO workflow_definition_stages (
        workflow_definition_id,
        workflow_stage_id,
        is_included,
        created_at,
        updated_at
    )
    SELECT 
        workflow_def_id,
        id,
        true,
        NOW(),
        NOW()
    FROM workflow_stages
    WHERE organization_id = apillis_org_id
    ORDER BY stage_order;
    
    -- Link all existing workflow sub-stages to this definition
    INSERT INTO workflow_definition_sub_stages (
        workflow_definition_id,
        workflow_sub_stage_id,
        is_included,
        created_at,
        updated_at
    )
    SELECT 
        workflow_def_id,
        id,
        true,
        NOW(),
        NOW()
    FROM workflow_sub_stages
    WHERE organization_id = apillis_org_id;
    
    RAISE NOTICE '✓ Default workflow definition created for Apillis organization';
    RAISE NOTICE '✓ Linked % workflow stages to the definition', (SELECT COUNT(*) FROM workflow_definition_stages WHERE workflow_definition_id = workflow_def_id);
    RAISE NOTICE '✓ Linked % workflow sub-stages to the definition', (SELECT COUNT(*) FROM workflow_definition_sub_stages WHERE workflow_definition_id = workflow_def_id);
END $$;