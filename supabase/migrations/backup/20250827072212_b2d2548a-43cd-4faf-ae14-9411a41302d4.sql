-- Fix function search path security issues
-- Update all functions to have proper search_path set for security

-- Fix get_dashboard_summary function
CREATE OR REPLACE FUNCTION public.get_dashboard_summary()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

  -- Combine all results
  result := json_build_object(
    'projects', project_stats,
    'recent_projects', COALESCE(recent_projects, '[]'::json),
    'generated_at', extract(epoch from now())
  );

  RETURN result;
END;
$function$;

-- Fix generate_project_id function
CREATE OR REPLACE FUNCTION public.generate_project_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_year TEXT;
  current_month TEXT;
  current_day TEXT;
  sequence_num TEXT;
  max_sequence INTEGER;
BEGIN
  current_year := EXTRACT(year FROM now())::TEXT;
  current_month := LPAD(EXTRACT(month FROM now())::TEXT, 2, '0');
  current_day := LPAD(EXTRACT(day FROM now())::TEXT, 2, '0');
  
  -- Get the maximum sequence number for this date
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(project_id FROM 'P-' || current_year || current_month || current_day || '(\d+)') AS INTEGER)), 
    0
  ) INTO max_sequence
  FROM projects
  WHERE project_id LIKE 'P-' || current_year || current_month || current_day || '%';
  
  -- Generate the next sequence number
  sequence_num := LPAD((max_sequence + 1)::TEXT, 2, '0');
  
  RETURN 'P-' || current_year || current_month || current_day || sequence_num;
END;
$function$;

-- Fix log_project_activity function
CREATE OR REPLACE FUNCTION public.log_project_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Log current_stage changes
  IF TG_OP = 'UPDATE' AND OLD.current_stage IS DISTINCT FROM NEW.current_stage THEN
    INSERT INTO project_activities (project_id, activity_type, description, old_values, new_values, created_by)
    VALUES (
      NEW.id,
      'stage_change',
      'Stage changed from ' || OLD.current_stage || ' to ' || NEW.current_stage,
      jsonb_build_object('current_stage', OLD.current_stage),
      jsonb_build_object('current_stage', NEW.current_stage),
      auth.uid()
    );
  END IF;
  
  -- Log status changes
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO project_activities (project_id, activity_type, description, old_values, new_values, created_by)
    VALUES (
      NEW.id,
      'status_change',
      'Status changed from ' || OLD.status || ' to ' || NEW.status,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      auth.uid()
    );
  END IF;
  
  -- Log assignee changes
  IF TG_OP = 'UPDATE' AND OLD.assignee_id IS DISTINCT FROM NEW.assignee_id THEN
    INSERT INTO project_activities (project_id, activity_type, description, old_values, new_values, created_by)
    VALUES (
      NEW.id,
      'assignee_change',
      'Assignee changed',
      jsonb_build_object('assignee_id', OLD.assignee_id),
      jsonb_build_object('assignee_id', NEW.assignee_id),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix update_project_days_in_stage function
CREATE OR REPLACE FUNCTION public.update_project_days_in_stage()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  -- If current_stage changed, reset stage tracking
  IF OLD.current_stage IS DISTINCT FROM NEW.current_stage THEN
    NEW.days_in_stage := 0;
    NEW.stage_entered_at := now();
  ELSE
    -- Update days in stage based on time difference
    NEW.days_in_stage := EXTRACT(DAY FROM now() - NEW.stage_entered_at)::INTEGER;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix set_project_id function
CREATE OR REPLACE FUNCTION public.set_project_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.project_id IS NULL OR NEW.project_id = '' THEN
    NEW.project_id := generate_project_id();
  END IF;
  RETURN NEW;
END;
$function$;