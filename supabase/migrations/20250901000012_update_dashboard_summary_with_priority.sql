-- Update Dashboard Summary Function with Priority Counts
-- This migration enhances the dashboard summary function to include priority counts and more project details

CREATE OR REPLACE FUNCTION public.get_dashboard_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_org_id UUID;
    result JSONB;
    project_counts JSONB;
    recent_projects JSONB;
    status_counts JSONB;
    type_counts JSONB;
    priority_counts JSONB;
    project_record RECORD;
BEGIN
    -- Get user's organization ID
    SELECT organization_id INTO user_org_id 
    FROM users 
    WHERE id = auth.uid();

    -- If no organization found, return empty result
    IF user_org_id IS NULL THEN
        RETURN jsonb_build_object(
            'projects', jsonb_build_object('total', 0, 'by_status', '{}', 'by_type', '{}', 'by_priority', '{}'),
            'recent_projects', '[]',
            'generated_at', extract(epoch from now())
        );
    END IF;

    -- Get project counts by status
    status_counts := '{}';
    FOR project_record IN 
        SELECT 
            status,
            COUNT(*) as count
        FROM projects 
        WHERE organization_id = user_org_id
        GROUP BY status
    LOOP
        status_counts := status_counts || jsonb_build_object(project_record.status, project_record.count);
    END LOOP;

    -- Get project counts by type
    type_counts := '{}';
    FOR project_record IN 
        SELECT 
            project_type,
            COUNT(*) as count
        FROM projects 
        WHERE organization_id = user_org_id
        GROUP BY project_type
    LOOP
        type_counts := type_counts || jsonb_build_object(COALESCE(project_record.project_type, 'unspecified'), project_record.count);
    END LOOP;

    -- Get project counts by priority
    priority_counts := '{}';
    FOR project_record IN 
        SELECT 
            priority_level,
            COUNT(*) as count
        FROM projects 
        WHERE organization_id = user_org_id
        GROUP BY priority_level
    LOOP
        priority_counts := priority_counts || jsonb_build_object(COALESCE(project_record.priority_level, 'unspecified'), project_record.count);
    END LOOP;

    -- Build project counts object
    project_counts := jsonb_build_object(
        'total', (SELECT COUNT(*) FROM projects WHERE organization_id = user_org_id),
        'by_status', status_counts,
        'by_type', type_counts,
        'by_priority', priority_counts
    );

    -- Get recent projects with customer information
    recent_projects := (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', p.id,
                'project_id', p.project_id,
                'title', p.title,
                'status', p.status,
                'priority_level', p.priority_level,
                'project_type', p.project_type,
                'created_at', p.created_at,
                'customer_name', c.company_name,
                'estimated_delivery_date', p.estimated_delivery_date,
                'current_stage', p.current_stage_id,
                'days_in_stage', 
                CASE 
                    WHEN p.stage_entered_at IS NOT NULL THEN
                        EXTRACT(DAY FROM (NOW() - p.stage_entered_at))
                    ELSE NULL
                END
            )
        )
        FROM (
            SELECT *
            FROM projects 
            WHERE organization_id = user_org_id
            ORDER BY created_at DESC
            LIMIT 10
        ) p
        LEFT JOIN contacts c ON p.customer_id = c.id
    );

    -- If no recent projects, set to empty array
    IF recent_projects IS NULL THEN
        recent_projects := '[]';
    END IF;

    -- Build final result
    result := jsonb_build_object(
        'projects', project_counts,
        'recent_projects', recent_projects,
        'generated_at', extract(epoch from now())
    );

    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_dashboard_summary() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_dashboard_summary() IS 
'Returns enhanced dashboard summary data including project counts by status, type, and priority, and recent projects with customer information. 
Requires user to be authenticated and have an organization_id.';