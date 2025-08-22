-- Fix the generate_project_id function
CREATE OR REPLACE FUNCTION public.generate_project_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  FROM public.projects
  WHERE project_id LIKE 'P-' || current_year || current_month || current_day || '%';
  
  -- Generate the next sequence number
  sequence_num := LPAD((max_sequence + 1)::TEXT, 2, '0');
  
  RETURN 'P-' || current_year || current_month || current_day || sequence_num;
END;
$function$;