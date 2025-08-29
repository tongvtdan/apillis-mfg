-- Migration: Fix dashboard summary function simple
-- Date: 2025-01-28
-- Description: Simplified dashboard function that avoids SQL complexity issues

-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_dashboard_summary();

-- Create a simple dashboard summary function
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
    
    -- Get recent projects (last 10)
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
        SELECT p.id, p.project_id, p.title, p.status, p.priority_level, p.created_at, c.company_name
        FROM projects p
        LEFT JOIN contacts c ON p.customer_id = c.id
        ORDER BY p.created_at DESC
        LIMIT 10
    ) p;
    
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
