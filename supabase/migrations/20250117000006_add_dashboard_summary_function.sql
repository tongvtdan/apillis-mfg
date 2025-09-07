-- =========================================
-- DASHBOARD SUMMARY RPC FUNCTION
-- =========================================

-- Function to get dashboard summary data for the frontend
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS JSON AS $$
DECLARE
    result JSON;
    user_org_id UUID;
    current_user_id UUID;
BEGIN
    -- Get current user and organization
    current_user_id := auth.uid();
    
    -- Get user's organization from users table
    SELECT organization_id INTO user_org_id
    FROM users
    WHERE id = current_user_id;
    
    -- If no organization found, return empty result
    IF user_org_id IS NULL THEN
        RETURN json_build_object(
            'projects', json_build_object(
                'total', 0,
                'by_status', '{}',
                'by_type', '{}',
                'by_priority', '{}',
                'by_stage', '{}'
            ),
            'recent_projects', '[]',
            'generated_at', extract(epoch from now()),
            'debug', json_build_object(
                'user_id', current_user_id,
                'organization_id', user_org_id,
                'error', 'No organization found for user'
            )
        );
    END IF;

    -- Build the dashboard summary
    WITH project_stats AS (
        SELECT
            COUNT(*) as total_projects,
            COUNT(CASE WHEN status = 'inquiry' THEN 1 END) as inquiry_count,
            COUNT(CASE WHEN status = 'reviewing' THEN 1 END) as reviewing_count,
            COUNT(CASE WHEN status = 'quoted' THEN 1 END) as quoted_count,
            COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
            COUNT(CASE WHEN status = 'procurement' THEN 1 END) as procurement_count,
            COUNT(CASE WHEN status = 'production' THEN 1 END) as production_count,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count,
            COUNT(CASE WHEN priority_level = 'low' THEN 1 END) as low_priority_count,
            COUNT(CASE WHEN priority_level = 'normal' THEN 1 END) as normal_priority_count,
            COUNT(CASE WHEN priority_level = 'high' THEN 1 END) as high_priority_count,
            COUNT(CASE WHEN priority_level = 'urgent' THEN 1 END) as urgent_priority_count,
            COUNT(CASE WHEN project_type = 'system_build' THEN 1 END) as system_build_count,
            COUNT(CASE WHEN project_type = 'fabrication' THEN 1 END) as fabrication_count,
            COUNT(CASE WHEN project_type = 'manufacturing' THEN 1 END) as manufacturing_count
        FROM projects
        WHERE organization_id = user_org_id
    ),
    stage_stats AS (
        SELECT
            ws.name as stage_name,
            COUNT(p.id) as stage_count
        FROM projects p
        LEFT JOIN workflow_stages ws ON p.current_stage_id = ws.id
        WHERE p.organization_id = user_org_id
        GROUP BY ws.name
    ),
    recent_projects AS (
        SELECT
            p.id,
            p.organization_id,
            p.project_id,
            p.title,
            p.status,
            p.priority_level,
            p.project_type,
            p.created_at,
            p.estimated_delivery_date,
            CASE 
                WHEN p.stage_entered_at IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (NOW() - p.stage_entered_at)) / 86400 
                ELSE NULL 
            END as days_in_stage,
            ws.name as current_stage_name,
            cust_org.name as customer_name
        FROM projects p
        LEFT JOIN workflow_stages ws ON p.current_stage_id = ws.id
        LEFT JOIN organizations cust_org ON p.customer_organization_id = cust_org.id
        WHERE p.organization_id = user_org_id
        ORDER BY p.created_at DESC
        LIMIT 10
    )
    SELECT json_build_object(
        'projects', json_build_object(
            'total', ps.total_projects,
            'by_status', json_build_object(
                'inquiry', ps.inquiry_count,
                'reviewing', ps.reviewing_count,
                'quoted', ps.quoted_count,
                'confirmed', ps.confirmed_count,
                'procurement', ps.procurement_count,
                'production', ps.production_count,
                'completed', ps.completed_count,
                'cancelled', ps.cancelled_count
            ),
            'by_type', json_build_object(
                'system_build', ps.system_build_count,
                'fabrication', ps.fabrication_count,
                'manufacturing', ps.manufacturing_count
            ),
            'by_priority', json_build_object(
                'low', ps.low_priority_count,
                'normal', ps.normal_priority_count,
                'high', ps.high_priority_count,
                'urgent', ps.urgent_priority_count
            ),
            'by_stage', (
                SELECT json_object_agg(
                    COALESCE(stage_name, 'no_stage'), 
                    stage_count
                )
                FROM stage_stats
            )
        ),
        'recent_projects', (
            SELECT json_agg(
                json_build_object(
                    'id', rp.id,
                    'organization_id', rp.organization_id,
                    'project_id', rp.project_id,
                    'title', rp.title,
                    'status', rp.status,
                    'priority_level', rp.priority_level,
                    'project_type', rp.project_type,
                    'created_at', rp.created_at,
                    'customer_name', rp.customer_name,
                    'estimated_delivery_date', rp.estimated_delivery_date,
                    'days_in_stage', rp.days_in_stage,
                    'current_stage', rp.current_stage_name
                )
            )
            FROM recent_projects rp
        ),
        'generated_at', extract(epoch from now()),
        'debug', json_build_object(
            'user_id', current_user_id,
            'organization_id', user_org_id,
            'query_timestamp', now()
        )
    ) INTO result
    FROM project_stats ps;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_dashboard_summary() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_dashboard_summary() IS 'Returns dashboard summary data including project statistics and recent projects for the current user organization';
