-- Migration: Fix dashboard summary function ultra simple
-- Date: 2025-01-28
-- Description: Ultra-simple dashboard function that avoids all SQL complexity

-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_dashboard_summary();

-- Create the ultra-simple dashboard summary function
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
    project_record RECORD;
    projects_array JSONB := '[]'::jsonb;
BEGIN
    -- Get total projects count
    SELECT COUNT(*) INTO total_projects FROM projects;
    
    -- Get status counts manually
    status_counts := '{}'::jsonb;
    FOR project_record IN 
        SELECT status, COUNT(*) as count
        FROM projects 
        GROUP BY status
    LOOP
        status_counts := status_counts || jsonb_build_object(project_record.status, project_record.count);
    END LOOP;
    
    -- Get recent projects manually (last 10)
    projects_array := '[]'::jsonb;
    FOR project_record IN 
        SELECT 
            p.id,
            p.project_id,
            p.title,
            p.status,
            p.priority_level,
            p.created_at,
            c.company_name as customer_name
        FROM projects p
        LEFT JOIN contacts c ON p.customer_id = c.id
        ORDER BY p.created_at DESC
        LIMIT 10
    LOOP
        projects_array := projects_array || jsonb_build_object(
            'id', project_record.id,
            'project_id', project_record.project_id,
            'title', project_record.title,
            'status', project_record.status,
            'priority', project_record.priority_level,
            'created_at', project_record.created_at,
            'customer_name', project_record.customer_name
        );
    END LOOP;
    
    -- Build final result
    result := jsonb_build_object(
        'projects', jsonb_build_object(
            'total', total_projects,
            'by_status', status_counts
        ),
        'recent_projects', projects_array,
        'generated_at', EXTRACT(EPOCH FROM NOW())
    );
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_dashboard_summary() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_dashboard_summary() IS 'Returns dashboard summary data including project counts by status and recent projects';
