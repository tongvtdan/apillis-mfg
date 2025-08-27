-- Add missing role types to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Procurement';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Engineering';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'QA';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Production';

-- Create RFQ Management Tables

-- Create enum types for RFQ system
CREATE TYPE rfq_status AS ENUM ('inquiry', 'review', 'quote', 'production', 'completed', 'cancelled');
CREATE TYPE rfq_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create RFQ table
CREATE TABLE public.rfqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_number TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  description TEXT,
  priority rfq_priority NOT NULL DEFAULT 'medium',
  status rfq_status NOT NULL DEFAULT 'inquiry',
  assignee_id UUID,
  estimated_value DECIMAL(15,2),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  
  -- Customer contact information
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Internal tracking
  days_in_stage INTEGER DEFAULT 0,
  stage_entered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Additional metadata
  tags TEXT[],
  notes TEXT
);

-- Create RFQ attachments table
CREATE TABLE public.rfq_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID
);

-- Create RFQ activity log table
CREATE TABLE public.rfq_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable Row Level Security
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for RFQs
CREATE POLICY "Users can view RFQs" ON public.rfqs FOR SELECT USING (
  has_role(auth.uid(), 'Management'::user_role) OR
  has_role(auth.uid(), 'Procurement'::user_role) OR
  has_role(auth.uid(), 'Engineering'::user_role) OR
  assignee_id = auth.uid()
);

CREATE POLICY "Management can manage all RFQs" ON public.rfqs FOR ALL USING (
  has_role(auth.uid(), 'Management'::user_role)
);

CREATE POLICY "Procurement can manage RFQs" ON public.rfqs FOR ALL USING (
  has_role(auth.uid(), 'Procurement'::user_role)
);

CREATE POLICY "Users can update assigned RFQs" ON public.rfqs FOR UPDATE USING (
  assignee_id = auth.uid()
);

-- Create RLS policies for attachments
CREATE POLICY "Users can view RFQ attachments" ON public.rfq_attachments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.rfqs r 
    WHERE r.id = rfq_id AND (
      has_role(auth.uid(), 'Management'::user_role) OR
      has_role(auth.uid(), 'Procurement'::user_role) OR
      has_role(auth.uid(), 'Engineering'::user_role) OR
      r.assignee_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can manage attachments for accessible RFQs" ON public.rfq_attachments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.rfqs r 
    WHERE r.id = rfq_id AND (
      has_role(auth.uid(), 'Management'::user_role) OR
      has_role(auth.uid(), 'Procurement'::user_role) OR
      r.assignee_id = auth.uid()
    )
  )
);

-- Create RLS policies for activities
CREATE POLICY "Users can view RFQ activities" ON public.rfq_activities FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.rfqs r 
    WHERE r.id = rfq_id AND (
      has_role(auth.uid(), 'Management'::user_role) OR
      has_role(auth.uid(), 'Procurement'::user_role) OR
      has_role(auth.uid(), 'Engineering'::user_role) OR
      r.assignee_id = auth.uid()
    )
  )
);

CREATE POLICY "System can insert activities" ON public.rfq_activities FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_rfqs_status ON public.rfqs(status);
CREATE INDEX idx_rfqs_assignee ON public.rfqs(assignee_id);
CREATE INDEX idx_rfqs_created_at ON public.rfqs(created_at);
CREATE INDEX idx_rfqs_due_date ON public.rfqs(due_date);
CREATE INDEX idx_rfq_attachments_rfq_id ON public.rfq_attachments(rfq_id);
CREATE INDEX idx_rfq_activities_rfq_id ON public.rfq_activities(rfq_id);

-- Create function to generate RFQ numbers
CREATE OR REPLACE FUNCTION generate_rfq_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  sequence_num TEXT;
BEGIN
  current_year := EXTRACT(year FROM now())::TEXT;
  
  -- Get the next sequence number for this year
  SELECT LPAD((
    COALESCE(
      (SELECT MAX(CAST(SUBSTRING(rfq_number FROM 'RFQ-' || current_year || '(\d+)') AS INTEGER)), 0) + 1,
      1
    )
  )::TEXT, 4, '0') INTO sequence_num
  FROM public.rfqs
  WHERE rfq_number LIKE 'RFQ-' || current_year || '%';
  
  RETURN 'RFQ-' || current_year || sequence_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-generate RFQ numbers
CREATE OR REPLACE FUNCTION set_rfq_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rfq_number IS NULL OR NEW.rfq_number = '' THEN
    NEW.rfq_number := generate_rfq_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_rfq_number
  BEFORE INSERT ON public.rfqs
  FOR EACH ROW
  EXECUTE FUNCTION set_rfq_number();

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_rfqs_updated_at
  BEFORE UPDATE ON public.rfqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to track days in stage
CREATE OR REPLACE FUNCTION update_days_in_stage()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed, reset stage tracking
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.days_in_stage := 0;
    NEW.stage_entered_at := now();
  ELSE
    -- Update days in stage based on time difference
    NEW.days_in_stage := EXTRACT(DAY FROM now() - NEW.stage_entered_at)::INTEGER;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rfqs_days_in_stage
  BEFORE UPDATE ON public.rfqs
  FOR EACH ROW
  EXECUTE FUNCTION update_days_in_stage();

-- Create function to log RFQ activities
CREATE OR REPLACE FUNCTION log_rfq_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.rfq_activities (rfq_id, activity_type, description, old_values, new_values, created_by)
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
    INSERT INTO public.rfq_activities (rfq_id, activity_type, description, old_values, new_values, created_by)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_rfq_activity
  AFTER UPDATE ON public.rfqs
  FOR EACH ROW
  EXECUTE FUNCTION log_rfq_activity();

-- Insert some sample data
INSERT INTO public.rfqs (
  rfq_number, company_name, project_name, description, priority, status, 
  assignee_id, estimated_value, due_date, contact_name, contact_email,
  tags, notes
) VALUES 
(
  'RFQ-20250001',
  'Acme Manufacturing',
  'Automotive Component Series A',
  'High-precision automotive components requiring specialized machining',
  'high',
  'inquiry',
  (SELECT id FROM auth.users WHERE email = 'dantong@apillis.com' LIMIT 1),
  125000.00,
  '2025-01-15 00:00:00+00',
  'John Smith',
  'john.smith@acme-mfg.com',
  ARRAY['automotive', 'precision', 'machining'],
  'Customer requires ISO certification'
),
(
  'RFQ-20250002', 
  'TechCorp Industries',
  'Precision Machined Parts',
  'Custom precision parts for industrial equipment',
  'medium',
  'review',
  (SELECT id FROM auth.users WHERE email = 'dantong@apillis.com' LIMIT 1),
  75000.00,
  '2025-01-20 00:00:00+00',
  'Jane Doe',
  'jane.doe@techcorp.com',
  ARRAY['industrial', 'custom'],
  'Rush order - customer needs by end of month'
),
(
  'RFQ-20250003',
  'Global Aerospace',
  'Titanium Brackets',
  'Aerospace-grade titanium brackets with tight tolerances',
  'urgent',
  'quote',
  (SELECT id FROM auth.users WHERE email = 'dantong@apillis.com' LIMIT 1),
  200000.00,
  '2025-12-10 00:00:00+00',
  'Mike Johnson',
  'mike.johnson@global-aero.com',
  ARRAY['aerospace', 'titanium', 'critical'],
  'AS9100 certification required'
),
(
  'RFQ-20250004',
  'Marine Systems Ltd',
  'Stainless Steel Fittings',
  'Marine-grade stainless steel fittings',
  'low',
  'production',
  (SELECT id FROM auth.users WHERE email = 'dantong@apillis.com' LIMIT 1),
  50000.00,
  '2025-02-01 00:00:00+00',
  'Sarah Wilson',
  'sarah.wilson@marine-sys.com',
  ARRAY['marine', 'stainless-steel'],
  'Standard marine specifications apply'
);

-- Enable realtime for tables
ALTER TABLE public.rfqs REPLICA IDENTITY FULL;
ALTER TABLE public.rfq_attachments REPLICA IDENTITY FULL;
ALTER TABLE public.rfq_activities REPLICA IDENTITY FULL;