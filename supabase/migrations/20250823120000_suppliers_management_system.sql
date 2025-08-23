-- Factory Pulse Enhancement: Supplier Management System
-- Phase 1.1: Create suppliers table with proper RLS policies

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  country VARCHAR(100),
  specialties TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
  response_rate DECIMAL(5,2) DEFAULT 0.0 CHECK (response_rate >= 0.0 AND response_rate <= 100.0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  
  -- Additional metadata for enhanced tracking
  last_contact_date TIMESTAMP WITH TIME ZONE,
  total_quotes_sent INTEGER DEFAULT 0,
  total_quotes_received INTEGER DEFAULT 0,
  average_turnaround_days DECIMAL(5,2) DEFAULT 0.0,
  notes TEXT,
  tags TEXT[] DEFAULT '{}'
);

-- Enable Row Level Security following existing patterns
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for suppliers
CREATE POLICY "Management can manage all suppliers" ON public.suppliers 
  FOR ALL USING (has_role(auth.uid(), 'Management'::user_role));

CREATE POLICY "Procurement can manage suppliers" ON public.suppliers 
  FOR ALL USING (
    has_role(auth.uid(), 'Procurement'::user_role) OR 
    has_role(auth.uid(), 'Procurement_Owner'::user_role)
  );

CREATE POLICY "Engineering can view suppliers" ON public.suppliers 
  FOR SELECT USING (
    has_role(auth.uid(), 'Management'::user_role) OR 
    has_role(auth.uid(), 'Procurement'::user_role) OR 
    has_role(auth.uid(), 'Procurement_Owner'::user_role) OR
    has_role(auth.uid(), 'Engineering'::user_role)
  );

-- Create supplier performance tracking table
CREATE TABLE public.supplier_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  quotes_sent INTEGER DEFAULT 0,
  quotes_received INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0.0,
  average_turnaround_hours DECIMAL(8,2) DEFAULT 0.0,
  quotes_accepted INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0.0,
  on_time_delivery_rate DECIMAL(5,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on supplier performance metrics
ALTER TABLE public.supplier_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for supplier performance metrics
CREATE POLICY "Management can view all supplier metrics" ON public.supplier_performance_metrics 
  FOR SELECT USING (has_role(auth.uid(), 'Management'::user_role));

CREATE POLICY "Procurement can view supplier metrics" ON public.supplier_performance_metrics 
  FOR SELECT USING (
    has_role(auth.uid(), 'Management'::user_role) OR 
    has_role(auth.uid(), 'Procurement'::user_role) OR 
    has_role(auth.uid(), 'Procurement_Owner'::user_role)
  );

CREATE POLICY "System can insert supplier metrics" ON public.supplier_performance_metrics 
  FOR INSERT WITH CHECK (true);

-- Create functions for supplier management
CREATE OR REPLACE FUNCTION public.update_supplier_performance_metrics(supplier_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  quotes_sent_count INTEGER;
  quotes_received_count INTEGER;
  calc_response_rate DECIMAL(5,2);
  avg_turnaround DECIMAL(5,2);
BEGIN
  -- Calculate performance metrics from supplier_quotes table (will be created in next migration)
  SELECT 
    COUNT(*) FILTER (WHERE status IN ('sent', 'received', 'expired', 'rejected')),
    COUNT(*) FILTER (WHERE status IN ('received', 'accepted')),
    CASE 
      WHEN COUNT(*) FILTER (WHERE status IN ('sent', 'received', 'expired', 'rejected')) > 0 THEN
        (COUNT(*) FILTER (WHERE status IN ('received', 'accepted'))::DECIMAL / 
         COUNT(*) FILTER (WHERE status IN ('sent', 'received', 'expired', 'rejected'))::DECIMAL) * 100
      ELSE 0.0
    END,
    COALESCE(
      AVG(EXTRACT(EPOCH FROM (quote_received_at - rfq_sent_at)) / 86400) 
      FILTER (WHERE quote_received_at IS NOT NULL), 
      0.0
    )
  INTO quotes_sent_count, quotes_received_count, calc_response_rate, avg_turnaround
  FROM public.supplier_quotes sq
  WHERE sq.supplier_id = supplier_uuid
  AND sq.created_at >= now() - INTERVAL '90 days';
  
  -- Update supplier with calculated metrics
  UPDATE public.suppliers 
  SET 
    total_quotes_sent = quotes_sent_count,
    total_quotes_received = quotes_received_count,
    response_rate = calc_response_rate,
    average_turnaround_days = avg_turnaround,
    updated_at = now()
  WHERE id = supplier_uuid;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Handle case where supplier_quotes table doesn't exist yet
    NULL;
END;
$function$;

-- Function to calculate supplier rating based on performance
CREATE OR REPLACE FUNCTION public.calculate_supplier_rating(supplier_uuid UUID)
RETURNS DECIMAL(3,2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  calculated_rating DECIMAL(3,2) := 0.0;
  response_weight DECIMAL(3,2) := 0.3;
  turnaround_weight DECIMAL(3,2) := 0.3;
  win_weight DECIMAL(3,2) := 0.4;
  supplier_data RECORD;
BEGIN
  -- Get supplier performance data
  SELECT 
    response_rate,
    average_turnaround_days,
    CASE 
      WHEN total_quotes_sent > 0 THEN 
        (total_quotes_received::DECIMAL / total_quotes_sent::DECIMAL) * 100
      ELSE 0.0
    END as win_rate
  INTO supplier_data
  FROM public.suppliers
  WHERE id = supplier_uuid;
  
  -- Calculate rating components (0-5 scale)
  -- Response rate component (0-5 based on 0-100%)
  calculated_rating := calculated_rating + (supplier_data.response_rate / 20.0) * response_weight;
  
  -- Turnaround time component (5 for <= 2 days, decreasing to 0 for >= 10 days)
  calculated_rating := calculated_rating + 
    GREATEST(0, LEAST(5, (10 - supplier_data.average_turnaround_days) / 1.6)) * turnaround_weight;
  
  -- Win rate component (0-5 based on acceptance rate)
  calculated_rating := calculated_rating + (supplier_data.win_rate / 20.0) * win_weight;
  
  RETURN LEAST(5.0, calculated_rating);
END;
$function$;

-- Add trigger for automatic updated_at timestamp
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_active_rating 
  ON public.suppliers(is_active, rating DESC, response_rate DESC);
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_specialties 
  ON public.suppliers USING GIN(specialties);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_country_active 
  ON public.suppliers(country, is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supplier_performance_metrics_supplier_period 
  ON public.supplier_performance_metrics(supplier_id, period_start, period_end);

-- Insert sample suppliers for testing (can be removed in production)
INSERT INTO public.suppliers (name, company, email, phone, country, specialties, rating, response_rate, is_active) VALUES
('John Smith', 'Precision Metals Co.', 'john@precisionmetals.com', '+1-555-0101', 'USA', ARRAY['machining', 'fabrication'], 4.2, 85.5, true),
('Maria Garcia', 'Advanced Manufacturing Ltd.', 'maria@advmfg.com', '+1-555-0102', 'USA', ARRAY['casting', 'finishing'], 3.8, 78.2, true),
('David Chen', 'Quality Components Inc.', 'david@qualitycomp.com', '+1-555-0103', 'USA', ARRAY['injection_molding', 'assembly'], 4.5, 92.1, true),
('Sarah Johnson', 'Rapid Prototyping Solutions', 'sarah@rapidproto.com', '+1-555-0104', 'USA', ARRAY['3d_printing', 'prototyping'], 4.0, 88.7, true),
('Michael Brown', 'Industrial Coatings Specialist', 'mike@indcoat.com', '+1-555-0105', 'USA', ARRAY['coating', 'finishing', 'painting'], 3.6, 72.3, true);

-- Create audit logging for supplier changes
CREATE OR REPLACE FUNCTION public.log_supplier_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log significant changes to supplier records
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_values, new_values, user_id)
    VALUES (
      'suppliers',
      NEW.id,
      'CREATE',
      NULL,
      to_jsonb(NEW),
      auth.uid()
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if significant fields changed
    IF (OLD.name IS DISTINCT FROM NEW.name OR 
        OLD.email IS DISTINCT FROM NEW.email OR 
        OLD.is_active IS DISTINCT FROM NEW.is_active OR
        OLD.rating IS DISTINCT FROM NEW.rating) THEN
      INSERT INTO public.audit_logs (table_name, record_id, action, old_values, new_values, user_id)
      VALUES (
        'suppliers',
        NEW.id,
        'UPDATE',
        jsonb_build_object(
          'name', OLD.name,
          'email', OLD.email,
          'is_active', OLD.is_active,
          'rating', OLD.rating
        ),
        jsonb_build_object(
          'name', NEW.name,
          'email', NEW.email,
          'is_active', NEW.is_active,
          'rating', NEW.rating
        ),
        auth.uid()
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    -- Handle case where audit_logs table doesn't exist yet
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create trigger for supplier audit logging
CREATE TRIGGER log_supplier_activity_trigger
  AFTER INSERT OR UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.log_supplier_activity();

-- Add comments for documentation
COMMENT ON TABLE public.suppliers IS 'Supplier management table for RFQ tracking and performance analytics';
COMMENT ON COLUMN public.suppliers.rating IS 'Calculated supplier rating (0.0-5.0) based on performance metrics';
COMMENT ON COLUMN public.suppliers.response_rate IS 'Percentage of RFQs that received responses (0.0-100.0)';
COMMENT ON COLUMN public.suppliers.specialties IS 'Array of supplier specialties/capabilities for matching';
COMMENT ON TABLE public.supplier_performance_metrics IS 'Historical performance tracking for supplier analytics';