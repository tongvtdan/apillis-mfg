-- Migration: Add dashboard summary function
-- Date: 2025-01-28
-- Description: Creates the get_dashboard_summary function for dashboard data aggregation

-- Create the dashboard summary function
CREATE OR REPLACE FUNCTION public.get_dashboard_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    projects_summary JSONB;
    recent_projects JSONB;
BEGIN
    -- Get projects summary (total count and by status)
    SELECT jsonb_build_object(
        'total', COUNT(*),
        'by_status', jsonb_object_agg(
            COALESCE(status, 'unknown'), 
            COUNT(*)
        )
    ) INTO projects_summary
    FROM projects;
    
    -- Get recent projects (last 10, ordered by creation date)
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', p.id,
            'project_id', p.project_id,
            'title', p.title,
            'status', p.status,
            'priority', p.priority,
            'created_at', p.created_at,
            'customer_name', c.company_name
        )
    ) INTO recent_projects
    FROM (
        SELECT p.*, c.company_name
        FROM projects p
        LEFT JOIN contacts c ON p.customer_contact_id = c.id
        ORDER BY p.created_at DESC
        LIMIT 10
    ) p;
    
    -- Build final result
    result := jsonb_build_object(
        'projects', projects_summary,
        'recent_projects', COALESCE(recent_projects, '[]'::jsonb),
        'generated_at', EXTRACT(EPOCH FROM NOW())
    );
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_dashboard_summary() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_dashboard_summary() IS 'Returns dashboard summary data including project counts by status and recent projects';
