-- =========================================
-- Complete Workflow Stages for Apillis Organization
-- This migration creates the full set of workflow stages as defined in the Factory Pulse blueprint
-- =========================================

DO $$
DECLARE
    apillis_org_id UUID;
    stage_id UUID;
BEGIN
    -- Get Apillis organization ID
    SELECT id INTO apillis_org_id 
    FROM organizations 
    WHERE slug = 'apillis' AND organization_type = 'internal';
    
    IF apillis_org_id IS NULL THEN
        RAISE EXCEPTION 'Apillis organization not found';
    END IF;
    
    -- Clear existing workflow stages for Apillis (if any)
    DELETE FROM workflow_definition_sub_stages WHERE workflow_definition_id IN (
        SELECT id FROM workflow_definitions WHERE organization_id = apillis_org_id
    );
    
    DELETE FROM workflow_definition_stages WHERE workflow_definition_id IN (
        SELECT id FROM workflow_definitions WHERE organization_id = apillis_org_id
    );
    
    DELETE FROM workflow_sub_stages WHERE organization_id = apillis_org_id;
    DELETE FROM workflow_stages WHERE organization_id = apillis_org_id;
    
    -- Create Intake Stage
    INSERT INTO workflow_stages (
        organization_id,
        name,
        slug,
        description,
        color,
        stage_order,
        responsible_roles,
        estimated_duration_days
    ) VALUES (
        apillis_org_id,
        'Intake',
        'intake',
        'Customer inquiry received and initial review completed',
        '#3B82F6',
        1,
        ARRAY['sales', 'procurement']::user_role[],
        2
    ) RETURNING id INTO stage_id;
    
    -- Create Intake Sub-stages
    INSERT INTO workflow_sub_stages (
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        color,
        sub_stage_order,
        responsible_roles,
        estimated_duration_hours,
        is_required,
        can_skip,
        auto_advance,
        requires_approval
    ) VALUES 
    (apillis_org_id, stage_id, 'Initial Review', 'initial_review', 'Review customer requirements and feasibility', '#3B82F6', 1, ARRAY['sales']::user_role[], 4, true, false, false, false),
    (apillis_org_id, stage_id, 'Technical Assessment', 'technical_assessment', 'Assess technical requirements and capabilities', '#3B82F6', 2, ARRAY['engineering']::user_role[], 8, true, false, false, true),
    (apillis_org_id, stage_id, 'Cost Estimation', 'cost_estimation', 'Initial cost estimation and budget planning', '#3B82F6', 3, ARRAY['sales', 'procurement']::user_role[], 6, true, false, false, false);
    
    -- Create Qualification Stage
    INSERT INTO workflow_stages (
        organization_id,
        name,
        slug,
        description,
        color,
        stage_order,
        responsible_roles,
        estimated_duration_days
    ) VALUES (
        apillis_org_id,
        'Qualification',
        'qualification',
        'Internal reviews (engineering, QA, production) completed',
        '#F59E0B',
        2,
        ARRAY['engineering', 'qa', 'production']::user_role[],
        5
    ) RETURNING id INTO stage_id;
    
    -- Create Qualification Sub-stages
    INSERT INTO workflow_sub_stages (
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        color,
        sub_stage_order,
        responsible_roles,
        estimated_duration_hours,
        is_required,
        can_skip,
        auto_advance,
        requires_approval
    ) VALUES 
    (apillis_org_id, stage_id, 'Engineering Review', 'engineering_review', 'Detailed engineering analysis and design validation', '#F59E0B', 1, ARRAY['engineering']::user_role[], 16, true, false, false, true),
    (apillis_org_id, stage_id, 'QA Review', 'qa_review', 'Quality assurance requirements and testing procedures', '#F59E0B', 2, ARRAY['qa']::user_role[], 8, true, false, false, true),
    (apillis_org_id, stage_id, 'Production Review', 'production_review', 'Production process planning and resource allocation', '#F59E0B', 3, ARRAY['production']::user_role[], 12, true, false, false, true);
    
    -- Create Quotation Stage
    INSERT INTO workflow_stages (
        organization_id,
        name,
        slug,
        description,
        color,
        stage_order,
        responsible_roles,
        estimated_duration_days
    ) VALUES (
        apillis_org_id,
        'Quotation',
        'quotation',
        'Quotation approved and sent to customer',
        '#10B981',
        3,
        ARRAY['sales', 'procurement']::user_role[],
        3
    ) RETURNING id INTO stage_id;
    
    -- Create Quotation Sub-stages
    INSERT INTO workflow_sub_stages (
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        color,
        sub_stage_order,
        responsible_roles,
        estimated_duration_hours,
        is_required,
        can_skip,
        auto_advance,
        requires_approval
    ) VALUES 
    (apillis_org_id, stage_id, 'Quote Preparation', 'quote_preparation', 'Prepare detailed quotation with pricing and terms', '#10B981', 1, ARRAY['sales', 'procurement']::user_role[], 8, true, false, false, false),
    (apillis_org_id, stage_id, 'Quote Review', 'quote_review', 'Management review and approval of quotation', '#10B981', 2, ARRAY['management']::user_role[], 4, true, false, false, true),
    (apillis_org_id, stage_id, 'Quote Sent', 'quote_sent', 'Quotation sent to customer for acceptance', '#10B981', 3, ARRAY['sales']::user_role[], 2, true, false, false, false);
    
    -- Create Sales Order Stage
    INSERT INTO workflow_stages (
        organization_id,
        name,
        slug,
        description,
        color,
        stage_order,
        responsible_roles,
        estimated_duration_days
    ) VALUES (
        apillis_org_id,
        'Sales Order',
        'sales_order',
        'Customer acceptance or PO received',
        '#6366F1',
        4,
        ARRAY['sales', 'procurement', 'production']::user_role[],
        2
    ) RETURNING id INTO stage_id;
    
    -- Create Sales Order Sub-stages
    INSERT INTO workflow_sub_stages (
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        color,
        sub_stage_order,
        responsible_roles,
        estimated_duration_hours,
        is_required,
        can_skip,
        auto_advance,
        requires_approval
    ) VALUES 
    (apillis_org_id, stage_id, 'Order Confirmation', 'order_confirmation', 'Confirm customer order and payment terms', '#6366F1', 1, ARRAY['sales']::user_role[], 4, true, false, false, false),
    (apillis_org_id, stage_id, 'Order Review', 'order_review', 'Review order requirements and resource allocation', '#6366F1', 2, ARRAY['procurement', 'production']::user_role[], 4, true, false, false, false);
    
    -- Create Engineering Stage
    INSERT INTO workflow_stages (
        organization_id,
        name,
        slug,
        description,
        color,
        stage_order,
        responsible_roles,
        estimated_duration_days
    ) VALUES (
        apillis_org_id,
        'Engineering',
        'engineering',
        'EBOM/MBOM baselined and engineering changes approved',
        '#8B5CF6',
        5,
        ARRAY['engineering']::user_role[],
        10
    ) RETURNING id INTO stage_id;
    
    -- Create Engineering Sub-stages
    INSERT INTO workflow_sub_stages (
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        color,
        sub_stage_order,
        responsible_roles,
        estimated_duration_hours,
        is_required,
        can_skip,
        auto_advance,
        requires_approval
    ) VALUES 
    (apillis_org_id, stage_id, 'Design Finalization', 'design_finalization', 'Finalize product design and engineering drawings', '#8B5CF6', 1, ARRAY['engineering']::user_role[], 24, true, false, false, true),
    (apillis_org_id, stage_id, 'BOM Creation', 'bom_creation', 'Create engineering and manufacturing bill of materials', '#8B5CF6', 2, ARRAY['engineering']::user_role[], 16, true, false, false, true),
    (apillis_org_id, stage_id, 'Design Approval', 'design_approval', 'Management approval of final design and BOM', '#8B5CF6', 3, ARRAY['management']::user_role[], 8, true, false, false, true);
    
    -- Create Procurement Stage
    INSERT INTO workflow_stages (
        organization_id,
        name,
        slug,
        description,
        color,
        stage_order,
        responsible_roles,
        estimated_duration_days
    ) VALUES (
        apillis_org_id,
        'Procurement',
        'procurement',
        'POs released and critical suppliers qualified',
        '#EC4899',
        6,
        ARRAY['procurement']::user_role[],
        7
    ) RETURNING id INTO stage_id;
    
    -- Create Procurement Sub-stages
    INSERT INTO workflow_sub_stages (
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        color,
        sub_stage_order,
        responsible_roles,
        estimated_duration_hours,
        is_required,
        can_skip,
        auto_advance,
        requires_approval
    ) VALUES 
    (apillis_org_id, stage_id, 'Supplier Selection', 'supplier_selection', 'Select and qualify suppliers for components', '#EC4899', 1, ARRAY['procurement']::user_role[], 8, true, false, false, true),
    (apillis_org_id, stage_id, 'PO Creation', 'po_creation', 'Create and release purchase orders to suppliers', '#EC4899', 2, ARRAY['procurement']::user_role[], 4, true, false, false, false),
    (apillis_org_id, stage_id, 'PO Confirmation', 'po_confirmation', 'Confirm PO acceptance and delivery schedules', '#EC4899', 3, ARRAY['procurement']::user_role[], 4, true, false, false, false);
    
    -- Create Production Planning Stage
    INSERT INTO workflow_stages (
        organization_id,
        name,
        slug,
        description,
        color,
        stage_order,
        responsible_roles,
        estimated_duration_days
    ) VALUES (
        apillis_org_id,
        'Production Planning',
        'planning',
        'WO(s) released and materials planned',
        '#F97316',
        7,
        ARRAY['production']::user_role[],
        5
    ) RETURNING id INTO stage_id;
    
    -- Create Production Planning Sub-stages
    INSERT INTO workflow_sub_stages (
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        color,
        sub_stage_order,
        responsible_roles,
        estimated_duration_hours,
        is_required,
        can_skip,
        auto_advance,
        requires_approval
    ) VALUES 
    (apillis_org_id, stage_id, 'Work Order Creation', 'wo_creation', 'Create work orders for production runs', '#F97316', 1, ARRAY['production']::user_role[], 4, true, false, false, false),
    (apillis_org_id, stage_id, 'Material Planning', 'material_planning', 'Plan and allocate materials for production', '#F97316', 2, ARRAY['production']::user_role[], 8, true, false, false, false),
    (apillis_org_id, stage_id, 'Resource Allocation', 'resource_allocation', 'Allocate personnel and equipment resources', '#F97316', 3, ARRAY['production']::user_role[], 4, true, false, false, false);
    
    -- Create Production Stage
    INSERT INTO workflow_stages (
        organization_id,
        name,
        slug,
        description,
        color,
        stage_order,
        responsible_roles,
        estimated_duration_days
    ) VALUES (
        apillis_org_id,
        'Production',
        'production',
        'Operations executed and in-process inspections pass',
        '#84CC16',
        8,
        ARRAY['production', 'qa']::user_role[],
        20
    ) RETURNING id INTO stage_id;
    
    -- Create Production Sub-stages
    INSERT INTO workflow_sub_stages (
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        color,
        sub_stage_order,
        responsible_roles,
        estimated_duration_hours,
        is_required,
        can_skip,
        auto_advance,
        requires_approval
    ) VALUES 
    (apillis_org_id, stage_id, 'Production Start', 'production_start', 'Begin production operations', '#84CC16', 1, ARRAY['production']::user_role[], 2, true, false, false, false),
    (apillis_org_id, stage_id, 'In-Process Inspections', 'in_process_inspections', 'Conduct in-process quality inspections', '#84CC16', 2, ARRAY['qa']::user_role[], 16, true, false, false, true),
    (apillis_org_id, stage_id, 'Production Completion', 'production_completion', 'Complete production operations', '#84CC16', 3, ARRAY['production']::user_role[], 2, true, false, false, false);
    
    -- Create Quality Final Stage
    INSERT INTO workflow_stages (
        organization_id,
        name,
        slug,
        description,
        color,
        stage_order,
        responsible_roles,
        estimated_duration_days
    ) VALUES (
        apillis_org_id,
        'Quality Final',
        'final_qc',
        'Final inspection pass and QA documents ready',
        '#06B6D4',
        9,
        ARRAY['qa']::user_role[],
        3
    ) RETURNING id INTO stage_id;
    
    -- Create Quality Final Sub-stages
    INSERT INTO workflow_sub_stages (
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        color,
        sub_stage_order,
        responsible_roles,
        estimated_duration_hours,
        is_required,
        can_skip,
        auto_advance,
        requires_approval
    ) VALUES 
    (apillis_org_id, stage_id, 'Final Inspection', 'final_inspection', 'Conduct final quality inspection', '#06B6D4', 1, ARRAY['qa']::user_role[], 8, true, false, false, true),
    (apillis_org_id, stage_id, 'Documentation', 'documentation', 'Prepare final quality documentation', '#06B6D4', 2, ARRAY['qa']::user_role[], 4, true, false, false, false),
    (apillis_org_id, stage_id, 'Certificate of Conformance', 'coc', 'Generate certificate of conformance', '#06B6D4', 3, ARRAY['qa']::user_role[], 4, true, false, false, false);
    
    -- Create Shipping Stage
    INSERT INTO workflow_stages (
        organization_id,
        name,
        slug,
        description,
        color,
        stage_order,
        responsible_roles,
        estimated_duration_days
    ) VALUES (
        apillis_org_id,
        'Shipping',
        'shipping',
        'Packed and shipping documentation completed',
        '#F43F5E',
        10,
        ARRAY['logistics']::user_role[],
        2
    ) RETURNING id INTO stage_id;
    
    -- Create Shipping Sub-stages
    INSERT INTO workflow_sub_stages (
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        color,
        sub_stage_order,
        responsible_roles,
        estimated_duration_hours,
        is_required,
        can_skip,
        auto_advance,
        requires_approval
    ) VALUES 
    (apillis_org_id, stage_id, 'Packing', 'packing', 'Pack products for shipment', '#F43F5E', 1, ARRAY['logistics']::user_role[], 4, true, false, false, false),
    (apillis_org_id, stage_id, 'Shipping Documentation', 'shipping_docs', 'Prepare shipping documents and labels', '#F43F5E', 2, ARRAY['logistics']::user_role[], 2, true, false, false, false),
    (apillis_org_id, stage_id, 'Shipment Dispatch', 'shipment_dispatch', 'Dispatch shipment to customer', '#F43F5E', 3, ARRAY['logistics']::user_role[], 2, true, false, false, false);
    
    -- Create Delivered/Closed Stage
    INSERT INTO workflow_stages (
        organization_id,
        name,
        slug,
        description,
        color,
        stage_order,
        responsible_roles,
        estimated_duration_days
    ) VALUES (
        apillis_org_id,
        'Delivered/Closed',
        'delivered',
        'Delivery confirmed and project completed',
        '#6B7280',
        11,
        ARRAY['sales', 'logistics']::user_role[],
        1
    ) RETURNING id INTO stage_id;
    
    -- Create Delivered/Closed Sub-stages
    INSERT INTO workflow_sub_stages (
        organization_id,
        workflow_stage_id,
        name,
        slug,
        description,
        color,
        sub_stage_order,
        responsible_roles,
        estimated_duration_hours,
        is_required,
        can_skip,
        auto_advance,
        requires_approval
    ) VALUES 
    (apillis_org_id, stage_id, 'Delivery Confirmation', 'delivery_confirmation', 'Confirm delivery with customer', '#6B7280', 1, ARRAY['logistics']::user_role[], 2, true, false, false, false),
    (apillis_org_id, stage_id, 'Project Closure', 'project_closure', 'Close project and archive documentation', '#6B7280', 2, ARRAY['sales']::user_role[], 2, true, false, false, false);
    
    RAISE NOTICE '✓ Complete workflow stages created for Apillis organization';
    RAISE NOTICE '✓ Created 11 workflow stages with 33 sub-stages';
END $$;