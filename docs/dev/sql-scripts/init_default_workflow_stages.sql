-- Migration: Initialize Default Workflow Stages for Organizations
-- This script creates default workflow stages for organizations that don't have any

-- First, create a function to initialize default workflow stages for an organization
CREATE OR REPLACE FUNCTION initialize_default_workflow_stages(org_id UUID, created_by_user_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    stage_record RECORD;
    created_count INTEGER := 0;
    default_stages JSONB := '[
        {"name": "Inquiry Received", "slug": "inquiry_received", "stage_order": 1, "estimated_duration_days": 1, "responsible_roles": ["admin", "sales"]},
        {"name": "Technical Review", "slug": "technical_review", "stage_order": 2, "estimated_duration_days": 3, "responsible_roles": ["admin", "engineering"]},
        {"name": "Supplier RFQ Sent", "slug": "supplier_rfq_sent", "stage_order": 3, "estimated_duration_days": 5, "responsible_roles": ["admin", "procurement"]},
        {"name": "Quoted", "slug": "quoted", "stage_order": 4, "estimated_duration_days": 2, "responsible_roles": ["admin", "sales"]},
        {"name": "Order Confirmed", "slug": "order_confirmed", "stage_order": 5, "estimated_duration_days": 1, "responsible_roles": ["admin", "procurement"]},
        {"name": "Procurement Planning", "slug": "procurement_planning", "stage_order": 6, "estimated_duration_days": 7, "responsible_roles": ["admin", "procurement"]},
        {"name": "In Production", "slug": "in_production", "stage_order": 7, "estimated_duration_days": 14, "responsible_roles": ["admin", "production"]},
        {"name": "Shipped & Closed", "slug": "shipped_closed", "stage_order": 8, "estimated_duration_days": 1, "responsible_roles": ["admin"]}
    ]'::jsonb;
BEGIN
    -- Check if organization already has stages
    IF EXISTS (SELECT 1 FROM workflow_stages WHERE organization_id = org_id) THEN
        RAISE NOTICE 'Organization % already has workflow stages', org_id;
        RETURN 0;
    END IF;

    -- Create default stages
    FOR stage_record IN SELECT * FROM jsonb_array_elements(default_stages) LOOP
        INSERT INTO workflow_stages (
            organization_id,
            name,
            slug,
            description,
            stage_order,
            estimated_duration_days,
            responsible_roles,
            is_active,
            created_by,
            created_at,
            updated_at
        ) VALUES (
            org_id,
            stage_record.value->>'name',
            stage_record.value->>'slug',
            'Default ' || lower(stage_record.value->>'name') || ' stage',
            (stage_record.value->>'stage_order')::integer,
            (stage_record.value->>'estimated_duration_days')::integer,
            ARRAY(SELECT jsonb_array_elements_text(stage_record.value->'responsible_roles')),
            true,
            created_by_user_id,
            NOW(),
            NOW()
        );
        created_count := created_count + 1;
    END LOOP;

    RAISE NOTICE 'Created % default workflow stages for organization %', created_count, org_id;
    RETURN created_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to initialize default stages for all organizations without stages
CREATE OR REPLACE FUNCTION initialize_default_stages_for_all_organizations()
RETURNS TABLE(organization_id UUID, stages_created INTEGER) AS $$
DECLARE
    org_record RECORD;
BEGIN
    -- Find all organizations that don't have workflow stages
    FOR org_record IN
        SELECT DISTINCT o.id
        FROM organizations o
        LEFT JOIN workflow_stages ws ON o.id = ws.organization_id
        WHERE ws.id IS NULL
    LOOP
        RETURN QUERY SELECT org_record.id, initialize_default_workflow_stages(org_record.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Usage examples:
-- 1. Initialize stages for a specific organization:
-- SELECT initialize_default_workflow_stages('your-org-id-here'::UUID, 'your-user-id-here'::UUID);

-- 2. Initialize stages for all organizations that don't have any:
-- SELECT * FROM initialize_default_stages_for_all_organizations();

-- After running the initialization, clean up the functions (optional):
-- DROP FUNCTION IF EXISTS initialize_default_workflow_stages(UUID, UUID);
-- DROP FUNCTION IF EXISTS initialize_default_stages_for_all_organizations();
