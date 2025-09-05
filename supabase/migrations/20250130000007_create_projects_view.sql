-- Create a view that resolves the ambiguous column issue
-- This view will provide a clean interface for the frontend to query projects

CREATE OR REPLACE VIEW projects_view AS
SELECT 
    p.id,
    p.organization_id,
    p.project_id,
    p.title,
    p.description,
    p.customer_organization_id,
    p.current_stage_id,
    p.status,
    p.priority_level,
    p.source,
    p.assigned_to,
    p.created_by,
    p.estimated_value,
    p.estimated_delivery_date,
    p.actual_delivery_date,
    p.tags,
    p.metadata,
    p.stage_entered_at,
    p.project_type,
    p.notes,
    p.created_at,
    p.updated_at,
    -- Customer organization info
    o.name as customer_organization_name,
    o.slug as customer_organization_slug,
    o.description as customer_organization_description,
    o.industry as customer_organization_industry,
    o.address as customer_organization_address,
    o.city as customer_organization_city,
    o.state as customer_organization_state,
    o.country as customer_organization_country,
    o.postal_code as customer_organization_postal_code,
    o.website as customer_organization_website,
    o.logo_url as customer_organization_logo_url,
    o.is_active as customer_organization_is_active,
    o.created_at as customer_organization_created_at,
    o.updated_at as customer_organization_updated_at,
    -- Current stage info
    ws.name as current_stage_name,
    ws.description as current_stage_description,
    ws.stage_order as current_stage_order,
    ws.is_active as current_stage_is_active,
    ws.created_at as current_stage_created_at,
    ws.updated_at as current_stage_updated_at
FROM projects p
LEFT JOIN organizations o ON p.customer_organization_id = o.id
LEFT JOIN workflow_stages ws ON p.current_stage_id = ws.id;

-- Grant access to the view
GRANT SELECT ON projects_view TO authenticated;
GRANT SELECT ON projects_view TO anon;
