-- Migration: Fix dashboard summary function final v2
-- Date: 2025-01-28
-- Description: Final fix for the dashboard function with correct subquery structure

-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_dashboard_summary();

-- Create the working dashboard summary function
CREATE OR REPLACE FUNCTION public.get_dashboard_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    total_projects INTEGER;
    status_counts JSONB;
    recent_projects JSONB;
BEGIN
    -- Get total projects count
    SELECT COUNT(*) INTO total_projects FROM projects;
    
    -- Get status counts
    SELECT jsonb_object_agg(
        COALESCE(status, 'unknown'), 
        status_count
    ) INTO status_counts
    FROM (
        SELECT status, COUNT(*) as status_count
        FROM projects
        GROUP BY status
    ) status_stats;
    
    -- Get recent projects (last 10) - simplified approach
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', projects.id,
            'project_id', projects.project_id,
            'title', projects.title,
            'status', projects.status,
            'priority', projects.priority_level,
            'created_at', projects.created_at,
            'customer_name', contacts.company_name
        )
    ) INTO recent_projects
    FROM projects
    LEFT JOIN contacts ON projects.customer_id = contacts.id
    ORDER BY projects.created_at DESC
    LIMIT 10;
    
    -- Build final result
    result := jsonb_build_object(
        'projects', jsonb_build_object(
            'total', total_projects,
            'by_status', COALESCE(status_counts, '{}'::jsonb)
        ),
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
