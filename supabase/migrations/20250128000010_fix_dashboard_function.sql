-- Migration: Fix dashboard summary function
-- Date: 2025-01-28
-- Description: Fixes the nested aggregate function issue in get_dashboard_summary

-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_dashboard_summary();

-- Recreate the dashboard summary function without nested aggregates
CREATE OR REPLACE FUNCTION public.get_dashboard_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    projects_summary JSONB;
    recent_projects JSONB;
    status_counts JSONB;
BEGIN
    -- Get projects summary (total count)
    SELECT jsonb_build_object(
        'total', COUNT(*)
    ) INTO projects_summary
    FROM projects;
    
    -- Get status counts separately to avoid nested aggregates
    SELECT jsonb_object_agg(
        COALESCE(status, 'unknown'), 
        status_count
    ) INTO status_counts
    FROM (
        SELECT status, COUNT(*) as status_count
        FROM projects
        GROUP BY status
    ) status_stats;
    
    -- Combine total and status counts
    projects_summary := projects_summary || jsonb_build_object('by_status', status_counts);
    
    -- Get recent projects (last 10, ordered by creation date)
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', p.id,
            'project_id', p.project_id,
            'title', p.title,
            'status', p.status,
            'priority', p.priority_level,
            'created_at', p.created_at,
            'customer_name', c.company_name
        )
    ) INTO recent_projects
    FROM (
        SELECT p.*, c.company_name
        FROM projects p
        LEFT JOIN contacts c ON p.customer_id = c.id
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
