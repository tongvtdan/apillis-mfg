-- Remove all RFQ-related tables as they are no longer used
-- The application now uses the projects table instead

-- Drop dependent tables first (foreign key constraints)
DROP TABLE IF EXISTS rfq_activities CASCADE;
DROP TABLE IF EXISTS rfq_attachments CASCADE;
DROP TABLE IF EXISTS rfq_clarifications CASCADE;
DROP TABLE IF EXISTS rfq_internal_reviews CASCADE;
DROP TABLE IF EXISTS rfq_risks CASCADE;

-- Drop main RFQ table
DROP TABLE IF EXISTS rfqs CASCADE;

-- Drop RFQ-related enums
DROP TYPE IF EXISTS rfq_status CASCADE;
DROP TYPE IF EXISTS rfq_priority CASCADE;

-- Update dashboard function to remove RFQ references
CREATE OR REPLACE FUNCTION public.get_dashboard_summary()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
  project_stats JSON;
  recent_projects JSON;
BEGIN
  -- Get project statistics
  SELECT json_build_object(
    'total', COUNT(*),
    'by_status', json_object_agg(current_stage, count)
  ) INTO project_stats
  FROM (
    SELECT current_stage, COUNT(*) as count
    FROM projects
    GROUP BY current_stage
  ) t;

  -- Get recent projects (limited fields)
  SELECT json_agg(
    json_build_object(
      'id', p.id,
      'project_id', p.project_id,
      'title', p.title,
      'status', p.current_stage,
      'priority', p.priority,
      'created_at', p.created_at,
      'customer_name', c.name
    )
  ) INTO recent_projects
  FROM (
    SELECT id, project_id, title, current_stage, priority, created_at, customer_id
    FROM projects
    ORDER BY created_at DESC
    LIMIT 10
  ) p
  LEFT JOIN customers c ON p.customer_id = c.id;

  -- Combine all results (removed RFQ references)
  result := json_build_object(
    'projects', project_stats,
    'recent_projects', COALESCE(recent_projects, '[]'::json),
    'generated_at', extract(epoch from now())
  );

  RETURN result;
END;
$function$;