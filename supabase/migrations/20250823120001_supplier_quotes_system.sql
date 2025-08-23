-- Factory Pulse Enhancement: Supplier Quote Management System
-- Phase 1.2: Create supplier_quotes table with foreign key relationships

-- Create supplier quote status enum
CREATE TYPE supplier_quote_status AS ENUM (
  'sent',         -- RFQ sent to supplier
  'received',     -- Quote received from supplier
  'rejected',     -- Quote rejected by supplier
  'accepted',     -- Quote accepted by us
  'expired',      -- Quote deadline passed
  'cancelled'     -- RFQ cancelled
);

-- Create supplier_quotes table
CREATE TABLE public.supplier_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  
  -- Quote details
  quote_amount DECIMAL(12,2),
  lead_time_days INTEGER,
  quote_valid_until DATE,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Status tracking
  status supplier_quote_status NOT NULL DEFAULT 'sent',
  rfq_sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  quote_received_at TIMESTAMP WITH TIME ZONE,
  quote_deadline TIMESTAMP WITH TIME ZONE,
  
  -- Communication tracking
  rfq_message TEXT,
  quote_notes TEXT,
  internal_notes TEXT,
  
  -- Attachments and documents
  attachments JSONB DEFAULT '[]'::jsonb,
  rfq_document_url TEXT,
  quote_document_url TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID DEFAULT auth.uid(),
  updated_by UUID,
  
  -- Performance tracking
  response_time_hours DECIMAL(8,2),
  is_competitive BOOLEAN,
  quality_score DECIMAL(3,2) CHECK (quality_score >= 0.0 AND quality_score <= 5.0),
  
  -- Additional quote details
  unit_price DECIMAL(12,2),
  minimum_quantity INTEGER,
  payment_terms TEXT,
  delivery_terms TEXT,
  warranty_terms TEXT,
  
  CONSTRAINT unique_project_supplier UNIQUE(project_id, supplier_id)
);

-- Enable Row Level Security
ALTER TABLE public.supplier_quotes ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for supplier_quotes
CREATE POLICY "Management can manage all supplier quotes" ON public.supplier_quotes 
  FOR ALL USING (has_role(auth.uid(), 'Management'::user_role));

CREATE POLICY "Procurement can manage supplier quotes" ON public.supplier_quotes 
  FOR ALL USING (
    has_role(auth.uid(), 'Procurement'::user_role) OR 
    has_role(auth.uid(), 'Procurement_Owner'::user_role)
  );

CREATE POLICY "Assigned users can view project quotes" ON public.supplier_quotes 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = supplier_quotes.project_id 
      AND (
        has_role(auth.uid(), 'Management'::user_role) OR 
        has_role(auth.uid(), 'Procurement'::user_role) OR 
        has_role(auth.uid(), 'Procurement_Owner'::user_role) OR
        has_role(auth.uid(), 'Engineering'::user_role) OR
        p.assignee_id = auth.uid()
      )
    )
  );

-- Create quote status change history table
CREATE TABLE public.supplier_quote_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_quote_id UUID NOT NULL REFERENCES public.supplier_quotes(id) ON DELETE CASCADE,
  old_status supplier_quote_status,
  new_status supplier_quote_status NOT NULL,
  changed_by UUID DEFAULT auth.uid(),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT,
  notes TEXT
);

-- Enable RLS on status history
ALTER TABLE public.supplier_quote_status_history ENABLE ROW LEVEL SECURITY;

-- Create policies for status history
CREATE POLICY "Users can view quote status history" ON public.supplier_quote_status_history 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.supplier_quotes sq
      JOIN public.projects p ON sq.project_id = p.id
      WHERE sq.id = supplier_quote_status_history.supplier_quote_id 
      AND (
        has_role(auth.uid(), 'Management'::user_role) OR 
        has_role(auth.uid(), 'Procurement'::user_role) OR 
        has_role(auth.uid(), 'Procurement_Owner'::user_role) OR
        p.assignee_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert status history" ON public.supplier_quote_status_history 
  FOR INSERT WITH CHECK (true);

-- Create quote comparison criteria table
CREATE TABLE public.quote_evaluation_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  weight DECIMAL(5,2) NOT NULL CHECK (weight >= 0.0 AND weight <= 1.0),
  criteria_type VARCHAR(50) NOT NULL, -- 'price', 'quality', 'delivery', 'service'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on evaluation criteria
ALTER TABLE public.quote_evaluation_criteria ENABLE ROW LEVEL SECURITY;

-- Create policies for evaluation criteria
CREATE POLICY "Users can view evaluation criteria" ON public.quote_evaluation_criteria 
  FOR SELECT USING (true);

CREATE POLICY "Management can manage evaluation criteria" ON public.quote_evaluation_criteria 
  FOR ALL USING (has_role(auth.uid(), 'Management'::user_role));

-- Insert default evaluation criteria
INSERT INTO public.quote_evaluation_criteria (name, weight, criteria_type, description) VALUES
('Price Competitiveness', 0.40, 'price', 'How competitive the quoted price is compared to others'),
('Quality Rating', 0.25, 'quality', 'Supplier quality score and track record'),
('Delivery Time', 0.20, 'delivery', 'Lead time and on-time delivery performance'),
('Service Level', 0.15, 'service', 'Responsiveness and customer service quality');

-- Functions for supplier quote management
CREATE OR REPLACE FUNCTION public.calculate_quote_response_time(quote_id UUID)
RETURNS DECIMAL(8,2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  response_hours DECIMAL(8,2);
BEGIN
  SELECT 
    EXTRACT(EPOCH FROM (quote_received_at - rfq_sent_at)) / 3600.0
  INTO response_hours
  FROM public.supplier_quotes
  WHERE id = quote_id
  AND quote_received_at IS NOT NULL;
  
  RETURN COALESCE(response_hours, 0.0);
END;
$function$;

-- Function to update supplier performance when quote status changes
CREATE OR REPLACE FUNCTION public.update_supplier_quote_performance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Calculate response time when quote is received
  IF NEW.status = 'received' AND OLD.status = 'sent' AND NEW.quote_received_at IS NOT NULL THEN
    NEW.response_time_hours := EXTRACT(EPOCH FROM (NEW.quote_received_at - NEW.rfq_sent_at)) / 3600.0;
    
    -- Update supplier's last contact date
    UPDATE public.suppliers 
    SET last_contact_date = NEW.quote_received_at,
        updated_at = now()
    WHERE id = NEW.supplier_id;
  END IF;
  
  -- Log status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.supplier_quote_status_history 
    (supplier_quote_id, old_status, new_status, changed_by, reason)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), 'Status updated');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for quote performance tracking
CREATE TRIGGER update_supplier_quote_performance_trigger
  BEFORE UPDATE ON public.supplier_quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_supplier_quote_performance();

-- Function to automatically expire overdue quotes
CREATE OR REPLACE FUNCTION public.expire_overdue_quotes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.supplier_quotes
  SET 
    status = 'expired',
    updated_at = now(),
    updated_by = NULL -- System update
  WHERE status = 'sent' 
  AND quote_deadline < now()
  AND quote_deadline IS NOT NULL;
  
  -- Log expired quotes
  INSERT INTO public.supplier_quote_status_history 
  (supplier_quote_id, old_status, new_status, changed_by, reason)
  SELECT 
    sq.id, 
    'sent'::supplier_quote_status, 
    'expired'::supplier_quote_status, 
    NULL,
    'Automatically expired due to deadline'
  FROM public.supplier_quotes sq
  WHERE sq.status = 'expired' 
  AND sq.updated_at >= now() - INTERVAL '1 minute'; -- Recently updated
END;
$function$;

-- Function to send RFQ to multiple suppliers
CREATE OR REPLACE FUNCTION public.send_rfq_to_suppliers(
  p_project_id UUID,
  p_supplier_ids UUID[],
  p_quote_deadline TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_rfq_message TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  supplier_id UUID;
  quotes_created INTEGER := 0;
  default_deadline TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Set default deadline if not provided (7 days from now)
  default_deadline := COALESCE(p_quote_deadline, now() + INTERVAL '7 days');
  
  -- Create quote records for each supplier
  FOREACH supplier_id IN ARRAY p_supplier_ids
  LOOP
    INSERT INTO public.supplier_quotes 
    (project_id, supplier_id, quote_deadline, rfq_message, status, created_by)
    VALUES 
    (p_project_id, supplier_id, default_deadline, p_rfq_message, 'sent', auth.uid())
    ON CONFLICT (project_id, supplier_id) DO UPDATE SET
      quote_deadline = default_deadline,
      rfq_message = p_rfq_message,
      status = 'sent',
      rfq_sent_at = now(),
      updated_at = now(),
      updated_by = auth.uid();
    
    quotes_created := quotes_created + 1;
  END LOOP;
  
  -- Update project status to supplier_rfq_sent if currently in technical_review
  UPDATE public.projects 
  SET 
    status = 'quoted'::project_status,
    updated_at = now(),
    updated_by = auth.uid()
  WHERE id = p_project_id 
  AND status = 'review'::project_status;
  
  RETURN quotes_created;
END;
$function$;

-- Function to get quote readiness score for a project
CREATE OR REPLACE FUNCTION public.get_project_quote_readiness(p_project_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  readiness_data JSONB;
  total_suppliers INTEGER;
  received_quotes INTEGER;
  pending_quotes INTEGER;
  overdue_quotes INTEGER;
  readiness_percentage DECIMAL(5,2);
BEGIN
  -- Calculate quote statistics
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status IN ('received', 'accepted')) as received,
    COUNT(*) FILTER (WHERE status = 'sent' AND (quote_deadline IS NULL OR quote_deadline > now())) as pending,
    COUNT(*) FILTER (WHERE status = 'sent' AND quote_deadline < now()) as overdue
  INTO total_suppliers, received_quotes, pending_quotes, overdue_quotes
  FROM public.supplier_quotes
  WHERE project_id = p_project_id;
  
  -- Calculate readiness percentage
  readiness_percentage := CASE 
    WHEN total_suppliers > 0 THEN (received_quotes::DECIMAL / total_suppliers::DECIMAL) * 100
    ELSE 0.0
  END;
  
  -- Build response object
  readiness_data := jsonb_build_object(
    'totalSuppliers', total_suppliers,
    'receivedQuotes', received_quotes,
    'pendingQuotes', pending_quotes,
    'overdueQuotes', overdue_quotes,
    'readinessPercentage', readiness_percentage,
    'statusText', 
    CASE 
      WHEN total_suppliers = 0 THEN 'No RFQs sent'
      WHEN overdue_quotes > 0 THEN received_quotes || '/' || total_suppliers || ' quotes in – ' || overdue_quotes || ' overdue'
      WHEN pending_quotes > 0 THEN received_quotes || '/' || total_suppliers || ' quotes in – ' || pending_quotes || ' pending'
      ELSE 'All quotes received'
    END,
    'colorCode',
    CASE 
      WHEN total_suppliers = 0 THEN 'gray'
      WHEN overdue_quotes > 0 THEN 'red'
      WHEN readiness_percentage >= 80 THEN 'green'
      WHEN readiness_percentage >= 50 THEN 'yellow'
      ELSE 'orange'
    END
  );
  
  RETURN readiness_data;
END;
$function$;

-- Add trigger for automatic updated_at timestamp
CREATE TRIGGER update_supplier_quotes_updated_at
  BEFORE UPDATE ON public.supplier_quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_quotes_project_status 
  ON public.supplier_quotes(project_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_quotes_supplier_status 
  ON public.supplier_quotes(supplier_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_quotes_deadline 
  ON public.supplier_quotes(quote_deadline) 
  WHERE status = 'sent';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_quotes_response_time 
  ON public.supplier_quotes(response_time_hours) 
  WHERE response_time_hours IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_quote_status_history_quote_id 
  ON public.supplier_quote_status_history(supplier_quote_id, changed_at);

-- Create a view for quote analytics
CREATE OR REPLACE VIEW public.supplier_quote_analytics AS
SELECT 
  sq.supplier_id,
  s.name as supplier_name,
  s.company as supplier_company,
  COUNT(*) as total_quotes,
  COUNT(*) FILTER (WHERE sq.status = 'received') as quotes_received,
  COUNT(*) FILTER (WHERE sq.status = 'accepted') as quotes_accepted,
  COUNT(*) FILTER (WHERE sq.status = 'expired') as quotes_expired,
  ROUND(
    (COUNT(*) FILTER (WHERE sq.status IN ('received', 'accepted'))::DECIMAL / 
     NULLIF(COUNT(*)::DECIMAL, 0)) * 100, 2
  ) as response_rate_percent,
  ROUND(
    (COUNT(*) FILTER (WHERE sq.status = 'accepted')::DECIMAL / 
     NULLIF(COUNT(*) FILTER (WHERE sq.status IN ('received', 'accepted'))::DECIMAL, 0)) * 100, 2
  ) as win_rate_percent,
  ROUND(AVG(sq.response_time_hours), 2) as avg_response_time_hours,
  MIN(sq.created_at) as first_quote_date,
  MAX(sq.updated_at) as last_activity_date
FROM public.supplier_quotes sq
JOIN public.suppliers s ON sq.supplier_id = s.id
WHERE sq.created_at >= now() - INTERVAL '90 days'
GROUP BY sq.supplier_id, s.name, s.company;

-- Enable RLS on the view
ALTER VIEW public.supplier_quote_analytics SET (security_barrier = true);

-- Grant appropriate permissions
GRANT SELECT ON public.supplier_quote_analytics TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.supplier_quotes IS 'Supplier quote tracking and management for RFQ workflows';
COMMENT ON COLUMN public.supplier_quotes.response_time_hours IS 'Time taken by supplier to respond to RFQ in hours';
COMMENT ON COLUMN public.supplier_quotes.is_competitive IS 'Flag indicating if quote is competitive compared to others';
COMMENT ON TABLE public.supplier_quote_status_history IS 'Historical tracking of quote status changes';
COMMENT ON VIEW public.supplier_quote_analytics IS 'Aggregated supplier performance metrics for the last 90 days';