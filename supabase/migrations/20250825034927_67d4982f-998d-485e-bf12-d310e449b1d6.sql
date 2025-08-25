-- Add database indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_assignee_id ON projects(assignee_id) WHERE assignee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_status_created_at ON projects(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_created_at ON rfqs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rfqs_assignee_id ON rfqs(assignee_id) WHERE assignee_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Create optimized dashboard summary RPC function
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS JSON AS $$
DECLARE
  result JSON;
  project_stats JSON;
  rfq_stats JSON;
  recent_projects JSON;
  recent_rfqs JSON;
BEGIN
  -- Get project statistics
  SELECT json_build_object(
    'total', COUNT(*),
    'by_status', json_object_agg(status, count)
  ) INTO project_stats
  FROM (
    SELECT status, COUNT(*) as count
    FROM projects
    GROUP BY status
  ) t;

  -- Get RFQ statistics  
  SELECT json_build_object(
    'total', COUNT(*),
    'by_status', json_object_agg(status, count)
  ) INTO rfq_stats
  FROM (
    SELECT status, COUNT(*) as count
    FROM rfqs
    GROUP BY status
  ) t;

  -- Get recent projects (limited fields)
  SELECT json_agg(
    json_build_object(
      'id', p.id,
      'project_id', p.project_id,
      'title', p.title,
      'status', p.status,
      'priority', p.priority,
      'created_at', p.created_at,
      'customer_name', c.name
    )
  ) INTO recent_projects
  FROM (
    SELECT id, project_id, title, status, priority, created_at, customer_id
    FROM projects
    ORDER BY created_at DESC
    LIMIT 10
  ) p
  LEFT JOIN customers c ON p.customer_id = c.id;

  -- Get recent RFQs (limited fields)
  SELECT json_agg(
    json_build_object(
      'id', id,
      'rfq_number', rfq_number,
      'project_name', project_name,
      'company_name', company_name,
      'status', status,
      'priority', priority,
      'created_at', created_at
    )
  ) INTO recent_rfqs
  FROM (
    SELECT id, rfq_number, project_name, company_name, status, priority, created_at
    FROM rfqs
    ORDER BY created_at DESC
    LIMIT 10
  ) r;

  -- Combine all results
  result := json_build_object(
    'projects', project_stats,
    'rfqs', rfq_stats,
    'recent_projects', COALESCE(recent_projects, '[]'::json),
    'recent_rfqs', COALESCE(recent_rfqs, '[]'::json),
    'generated_at', extract(epoch from now())
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;