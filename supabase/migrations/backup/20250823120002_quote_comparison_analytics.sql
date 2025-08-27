-- Factory Pulse Enhancement: Quote Comparison and Analytics System
-- Phase 1.3: Create quote_comparisons table and performance indexes

-- Create quote_comparisons table for tracking quote selection decisions
CREATE TABLE public.quote_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  selected_quote_id UUID REFERENCES public.supplier_quotes(id) ON DELETE SET NULL,
  
  -- Comparison metadata
  comparison_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  comparison_criteria JSONB DEFAULT '{}'::jsonb,
  evaluation_notes TEXT,
  decision_rationale TEXT,
  
  -- Scores for each quote (stored as JSONB for flexibility)
  quote_scores JSONB DEFAULT '{}'::jsonb, -- { "quote_id": { "price": 4.2, "quality": 3.8, ... } }
  total_scores JSONB DEFAULT '{}'::jsonb, -- { "quote_id": 3.9 }
  
  -- Decision makers
  evaluated_by UUID DEFAULT auth.uid(),
  approved_by UUID,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'draft', -- draft, pending_approval, approved, rejected
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID DEFAULT auth.uid(),
  
  -- Constraints
  CONSTRAINT unique_project_comparison UNIQUE(project_id) -- One comparison per project
);

-- Enable Row Level Security
ALTER TABLE public.quote_comparisons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quote_comparisons
CREATE POLICY "Management can manage all quote comparisons" ON public.quote_comparisons 
  FOR ALL USING (has_role(auth.uid(), 'Management'::user_role));

CREATE POLICY "Procurement can manage quote comparisons" ON public.quote_comparisons 
  FOR ALL USING (
    has_role(auth.uid(), 'Procurement'::user_role) OR 
    has_role(auth.uid(), 'Procurement_Owner'::user_role)
  );

CREATE POLICY "Assigned users can view project comparisons" ON public.quote_comparisons 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = quote_comparisons.project_id 
      AND (
        has_role(auth.uid(), 'Management'::user_role) OR 
        has_role(auth.uid(), 'Procurement'::user_role) OR 
        has_role(auth.uid(), 'Procurement_Owner'::user_role) OR
        has_role(auth.uid(), 'Engineering'::user_role) OR
        p.assignee_id = auth.uid()
      )
    )
  );

-- Create project workflow analytics table
CREATE TABLE public.project_workflow_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Stage timing data
  stage_name VARCHAR(100) NOT NULL,
  stage_entered_at TIMESTAMP WITH TIME ZONE NOT NULL,
  stage_exited_at TIMESTAMP WITH TIME ZONE,
  time_in_stage_hours DECIMAL(10,2),
  
  -- Performance indicators
  is_bottleneck BOOLEAN DEFAULT false,
  bottleneck_reason TEXT,
  sla_target_hours DECIMAL(10,2),
  sla_exceeded BOOLEAN DEFAULT false,
  
  -- Context data
  assignee_id UUID,
  reviewer_id UUID,
  stage_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on workflow analytics
ALTER TABLE public.project_workflow_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for workflow analytics
CREATE POLICY "Management can view all workflow analytics" ON public.project_workflow_analytics 
  FOR SELECT USING (has_role(auth.uid(), 'Management'::user_role));

CREATE POLICY "Procurement can view workflow analytics" ON public.project_workflow_analytics 
  FOR SELECT USING (
    has_role(auth.uid(), 'Management'::user_role) OR 
    has_role(auth.uid(), 'Procurement'::user_role) OR 
    has_role(auth.uid(), 'Procurement_Owner'::user_role)
  );

CREATE POLICY "System can insert workflow analytics" ON public.project_workflow_analytics 
  FOR INSERT WITH CHECK (true);

-- Create bottleneck detection configuration table
CREATE TABLE public.bottleneck_detection_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_name VARCHAR(100) NOT NULL UNIQUE,
  sla_hours DECIMAL(10,2) NOT NULL,
  warning_threshold_hours DECIMAL(10,2) NOT NULL,
  critical_threshold_hours DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bottleneck config
ALTER TABLE public.bottleneck_detection_config ENABLE ROW LEVEL SECURITY;

-- Create policies for bottleneck config
CREATE POLICY "Users can view bottleneck config" ON public.bottleneck_detection_config 
  FOR SELECT USING (true);

CREATE POLICY "Management can manage bottleneck config" ON public.bottleneck_detection_config 
  FOR ALL USING (has_role(auth.uid(), 'Management'::user_role));

-- Insert default bottleneck detection configuration
INSERT INTO public.bottleneck_detection_config (stage_name, sla_hours, warning_threshold_hours, critical_threshold_hours) VALUES
('inquiry', 24.0, 18.0, 36.0),
('review', 48.0, 36.0, 72.0),
('quoted', 168.0, 120.0, 240.0), -- 1 week SLA for supplier quotes
('won', 24.0, 18.0, 48.0),
('production', 720.0, 600.0, 1200.0), -- 30 days for production
('completed', 0.0, 0.0, 0.0);

-- Functions for quote comparison and analytics

-- Function to calculate quote comparison scores
CREATE OR REPLACE FUNCTION public.calculate_quote_comparison_scores(p_project_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  quote_data RECORD;
  criteria_data RECORD;
  quote_scores JSONB := '{}'::jsonb;
  total_scores JSONB := '{}'::jsonb;
  price_quotes DECIMAL[];
  min_price DECIMAL;
  max_price DECIMAL;
  price_score DECIMAL;
  total_score DECIMAL;
BEGIN
  -- Get all quotes for the project
  SELECT array_agg(quote_amount ORDER BY quote_amount) 
  INTO price_quotes
  FROM public.supplier_quotes 
  WHERE project_id = p_project_id 
  AND status IN ('received', 'accepted')
  AND quote_amount IS NOT NULL;
  
  -- Calculate min/max for price normalization
  IF array_length(price_quotes, 1) > 0 THEN
    min_price := price_quotes[1];
    max_price := price_quotes[array_length(price_quotes, 1)];
  END IF;
  
  -- Calculate scores for each quote
  FOR quote_data IN 
    SELECT 
      sq.id,
      sq.quote_amount,
      sq.lead_time_days,
      sq.quality_score,
      s.rating as supplier_rating,
      s.response_rate
    FROM public.supplier_quotes sq
    JOIN public.suppliers s ON sq.supplier_id = s.id
    WHERE sq.project_id = p_project_id 
    AND sq.status IN ('received', 'accepted')
  LOOP
    total_score := 0.0;
    
    -- Calculate individual criterion scores
    FOR criteria_data IN 
      SELECT name, weight, criteria_type 
      FROM public.quote_evaluation_criteria 
      WHERE is_active = true 
    LOOP
      CASE criteria_data.criteria_type
        WHEN 'price' THEN
          -- Price score: lower is better (5 for lowest, scaling down)
          IF min_price > 0 AND max_price > min_price THEN
            price_score := 5.0 - ((quote_data.quote_amount - min_price) / (max_price - min_price)) * 4.0;
          ELSE
            price_score := 5.0;
          END IF;
          quote_scores := jsonb_set(
            quote_scores, 
            ('{' || quote_data.id || ',' || criteria_data.name || '}')::text[], 
            to_jsonb(ROUND(price_score, 2))
          );
          total_score := total_score + (price_score * criteria_data.weight);
          
        WHEN 'quality' THEN
          -- Quality score: use supplier rating
          quote_scores := jsonb_set(
            quote_scores, 
            ('{' || quote_data.id || ',' || criteria_data.name || '}')::text[], 
            to_jsonb(COALESCE(quote_data.supplier_rating, 0.0))
          );
          total_score := total_score + (COALESCE(quote_data.supplier_rating, 0.0) * criteria_data.weight);
          
        WHEN 'delivery' THEN
          -- Delivery score: shorter lead time is better
          price_score := GREATEST(0.0, 5.0 - (COALESCE(quote_data.lead_time_days, 30) / 10.0));
          quote_scores := jsonb_set(
            quote_scores, 
            ('{' || quote_data.id || ',' || criteria_data.name || '}')::text[], 
            to_jsonb(ROUND(price_score, 2))
          );
          total_score := total_score + (price_score * criteria_data.weight);
          
        WHEN 'service' THEN
          -- Service score: use response rate
          price_score := (COALESCE(quote_data.response_rate, 0.0) / 100.0) * 5.0;
          quote_scores := jsonb_set(
            quote_scores, 
            ('{' || quote_data.id || ',' || criteria_data.name || '}')::text[], 
            to_jsonb(ROUND(price_score, 2))
          );
          total_score := total_score + (price_score * criteria_data.weight);
      END CASE;
    END LOOP;
    
    -- Store total score
    total_scores := jsonb_set(
      total_scores, 
      ('{' || quote_data.id || '}')::text[], 
      to_jsonb(ROUND(total_score, 2))
    );
  END LOOP;
  
  RETURN jsonb_build_object(
    'quote_scores', quote_scores,
    'total_scores', total_scores
  );
END;
$function$;

-- Function to detect project bottlenecks
CREATE OR REPLACE FUNCTION public.detect_project_bottlenecks()
RETURNS TABLE(
  project_id UUID,
  project_title TEXT,
  current_stage TEXT,
  hours_in_stage DECIMAL,
  sla_hours DECIMAL,
  severity TEXT,
  recommended_actions TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.status::TEXT,
    EXTRACT(EPOCH FROM (now() - p.stage_entered_at)) / 3600.0 as hours_in_current_stage,
    COALESCE(bdc.sla_hours, 168.0) as sla_hours,
    CASE 
      WHEN EXTRACT(EPOCH FROM (now() - p.stage_entered_at)) / 3600.0 > COALESCE(bdc.critical_threshold_hours, 240.0) THEN 'critical'
      WHEN EXTRACT(EPOCH FROM (now() - p.stage_entered_at)) / 3600.0 > COALESCE(bdc.warning_threshold_hours, 120.0) THEN 'warning'
      ELSE 'normal'
    END as severity,
    CASE 
      WHEN p.status::TEXT = 'review' AND EXTRACT(EPOCH FROM (now() - p.stage_entered_at)) / 3600.0 > 48.0 THEN
        ARRAY['Assign technical reviewer', 'Request missing documentation', 'Schedule review meeting']
      WHEN p.status::TEXT = 'quoted' AND EXTRACT(EPOCH FROM (now() - p.stage_entered_at)) / 3600.0 > 168.0 THEN
        ARRAY['Follow up with suppliers', 'Send reminder emails', 'Consider additional suppliers']
      WHEN p.status::TEXT = 'inquiry' AND EXTRACT(EPOCH FROM (now() - p.stage_entered_at)) / 3600.0 > 24.0 THEN
        ARRAY['Assign project owner', 'Begin initial review', 'Contact customer for clarification']
      ELSE
        ARRAY['Monitor progress', 'Check for blockers']
    END as recommended_actions
  FROM public.projects p
  LEFT JOIN public.bottleneck_detection_config bdc ON bdc.stage_name = p.status::TEXT
  WHERE p.status NOT IN ('completed', 'cancelled', 'lost')
  AND EXTRACT(EPOCH FROM (now() - p.stage_entered_at)) / 3600.0 > COALESCE(bdc.warning_threshold_hours, 120.0)
  ORDER BY hours_in_current_stage DESC;
END;
$function$;

-- Function to get comprehensive project analytics
CREATE OR REPLACE FUNCTION public.get_project_analytics_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result JSONB;
  total_projects INTEGER;
  avg_cycle_time DECIMAL;
  supplier_response_rate DECIMAL;
  bottleneck_count INTEGER;
BEGIN
  -- Get basic project counts
  SELECT COUNT(*) INTO total_projects 
  FROM public.projects 
  WHERE created_at >= now() - INTERVAL '90 days';
  
  -- Calculate average cycle time
  SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400.0)
  INTO avg_cycle_time
  FROM public.projects
  WHERE status IN ('completed', 'won')
  AND created_at >= now() - INTERVAL '90 days';
  
  -- Calculate supplier response rate
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN
        (COUNT(*) FILTER (WHERE status IN ('received', 'accepted'))::DECIMAL / COUNT(*)::DECIMAL) * 100
      ELSE 0.0
    END
  INTO supplier_response_rate
  FROM public.supplier_quotes
  WHERE created_at >= now() - INTERVAL '90 days';
  
  -- Count current bottlenecks
  SELECT COUNT(*) INTO bottleneck_count
  FROM public.detect_project_bottlenecks()
  WHERE severity IN ('warning', 'critical');
  
  -- Build result object
  result := jsonb_build_object(
    'totalProjects', total_projects,
    'averageCycleTimeDays', ROUND(COALESCE(avg_cycle_time, 0.0), 1),
    'supplierResponseRate', ROUND(COALESCE(supplier_response_rate, 0.0), 1),
    'activeBottlenecks', bottleneck_count,
    'generatedAt', now(),
    'periodDays', 90
  );
  
  RETURN result;
END;
$function$;

-- Create comprehensive performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_status_stage_time 
  ON public.projects(status, stage_entered_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_assignee_status 
  ON public.projects(assignee_id, status) 
  WHERE status NOT IN ('completed', 'cancelled', 'lost');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_priority_created 
  ON public.projects(priority, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quote_comparisons_project 
  ON public.quote_comparisons(project_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_analytics_project_stage 
  ON public.project_workflow_analytics(project_id, stage_name, stage_entered_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workflow_analytics_bottleneck 
  ON public.project_workflow_analytics(is_bottleneck, sla_exceeded);

-- Create materialized view for analytics dashboard
CREATE MATERIALIZED VIEW public.project_analytics_summary AS
SELECT 
  DATE_TRUNC('week', p.created_at) as week_start,
  p.status,
  p.priority,
  COUNT(*) as project_count,
  AVG(p.days_in_stage) as avg_days_in_stage,
  AVG(p.estimated_value) as avg_estimated_value,
  COUNT(*) FILTER (WHERE p.days_in_stage > 14) as bottleneck_count,
  
  -- Supplier quote metrics
  AVG(sq_stats.quotes_per_project) as avg_quotes_per_project,
  AVG(sq_stats.response_rate) as avg_supplier_response_rate,
  AVG(sq_stats.avg_response_time) as avg_quote_response_time_hours
FROM public.projects p
LEFT JOIN (
  SELECT 
    sq.project_id,
    COUNT(*) as quotes_per_project,
    (COUNT(*) FILTER (WHERE sq.status IN ('received', 'accepted'))::DECIMAL / 
     NULLIF(COUNT(*)::DECIMAL, 0)) * 100 as response_rate,
    AVG(sq.response_time_hours) as avg_response_time
  FROM public.supplier_quotes sq
  GROUP BY sq.project_id
) sq_stats ON p.id = sq_stats.project_id
WHERE p.created_at >= now() - INTERVAL '180 days'
GROUP BY 
  DATE_TRUNC('week', p.created_at),
  p.status,
  p.priority;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_project_analytics_summary_unique 
  ON public.project_analytics_summary(week_start, status, priority);

-- Enable RLS on materialized view
ALTER MATERIALIZED VIEW public.project_analytics_summary SET (security_barrier = true);

-- Grant permissions
GRANT SELECT ON public.project_analytics_summary TO authenticated;

-- Create function to refresh analytics
CREATE OR REPLACE FUNCTION public.refresh_project_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.project_analytics_summary;
END;
$function$;

-- Add triggers for automatic updated_at timestamps
CREATE TRIGGER update_quote_comparisons_updated_at
  BEFORE UPDATE ON public.quote_comparisons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bottleneck_config_updated_at
  BEFORE UPDATE ON public.bottleneck_detection_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to track project stage transitions
CREATE OR REPLACE FUNCTION public.track_project_stage_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log stage transition in analytics table
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Close previous stage
    UPDATE public.project_workflow_analytics
    SET 
      stage_exited_at = now(),
      time_in_stage_hours = EXTRACT(EPOCH FROM (now() - stage_entered_at)) / 3600.0
    WHERE project_id = NEW.id 
    AND stage_name = OLD.status::TEXT 
    AND stage_exited_at IS NULL;
    
    -- Start new stage
    INSERT INTO public.project_workflow_analytics 
    (project_id, stage_name, stage_entered_at, assignee_id)
    VALUES (NEW.id, NEW.status::TEXT, now(), NEW.assignee_id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for stage tracking
CREATE TRIGGER track_project_stage_transition_trigger
  AFTER UPDATE OF status ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.track_project_stage_transition();

-- Add comments for documentation
COMMENT ON TABLE public.quote_comparisons IS 'Quote comparison and selection tracking for procurement decisions';
COMMENT ON TABLE public.project_workflow_analytics IS 'Detailed analytics for project workflow performance and bottleneck detection';
COMMENT ON TABLE public.bottleneck_detection_config IS 'Configuration for automated bottleneck detection and alerting';
COMMENT ON MATERIALIZED VIEW public.project_analytics_summary IS 'Aggregated project analytics for dashboard KPIs (refreshed periodically)';
COMMENT ON FUNCTION public.detect_project_bottlenecks() IS 'Identifies projects exceeding SLA thresholds and provides recommended actions';
COMMENT ON FUNCTION public.calculate_quote_comparison_scores(UUID) IS 'Calculates weighted scores for quote comparison based on evaluation criteria';