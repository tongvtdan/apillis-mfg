-- Migration: Create dashboard summary functions
-- Date: 2025-01-27
-- Issue: get_dashboard_summary function missing, causing 404 errors

-- STEP 1: Create the get_dashboard_summary function
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Get projects summary
  SELECT json_build_object(
    'projects', json_build_object(
      'total', (SELECT COUNT(*) FROM projects),
      'by_status', (
        SELECT json_object_agg(status, count)
        FROM (
          SELECT status, COUNT(*) as count
          FROM projects
          GROUP BY status
        ) status_counts
      )
    ),
    'recent_projects', (
      SELECT json_agg(
        json_build_object(
          'id', p.id,
          'project_id', p.project_id,
          'title', p.title,
          'status', p.status,
          'priority', p.priority_level,
          'created_at', p.created_at,
          'customer_name', p.customer_name
        )
      )
      FROM (
        SELECT p.id, p.project_id, p.title, p.status, p.priority_level, p.created_at, c.company_name as customer_name
        FROM projects p
        LEFT JOIN contacts c ON p.customer_id = c.id
        ORDER BY p.created_at DESC
        LIMIT 5
      ) p
    ),
    'generated_at', extract(epoch from now())
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 2: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_dashboard_summary() TO authenticated;

-- STEP 3: Add comment
COMMENT ON FUNCTION get_dashboard_summary() IS 'Returns dashboard summary data including project counts and recent projects';
