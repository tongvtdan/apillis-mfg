-- Create comprehensive Factory Pulse schema
-- Phase 1: Refactor RFQ to Project model

-- First, create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies for customers
CREATE POLICY "Management can manage all customers" ON public.customers FOR ALL USING (has_role(auth.uid(), 'Management'::user_role));
CREATE POLICY "Procurement can manage customers" ON public.customers FOR ALL USING (has_role(auth.uid(), 'Procurement'::user_role));
CREATE POLICY "Users can view customers" ON public.customers FOR SELECT USING (
  has_role(auth.uid(), 'Management'::user_role) OR 
  has_role(auth.uid(), 'Procurement'::user_role) OR 
  has_role(auth.uid(), 'Engineering'::user_role)
);

-- Create new project_status enum (evolution of rfq_status)
CREATE TYPE project_status AS ENUM ('inquiry', 'review', 'quoted', 'won', 'lost', 'production', 'completed', 'cancelled');

-- Create project_priority enum
CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create new projects table (evolution of rfqs)
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL UNIQUE, -- P-25082001 format
  title TEXT NOT NULL,
  description TEXT,
  customer_id UUID REFERENCES public.customers(id),
  status project_status NOT NULL DEFAULT 'inquiry',
  priority project_priority NOT NULL DEFAULT 'medium',
  priority_score NUMERIC DEFAULT 0,
  assignee_id UUID,
  estimated_value NUMERIC,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  days_in_stage INTEGER DEFAULT 0,
  stage_entered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  engineering_reviewer_id UUID,
  qa_reviewer_id UUID,
  production_reviewer_id UUID,
  review_summary JSONB DEFAULT '{}'::jsonb,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  tags TEXT[],
  notes TEXT
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects (similar to rfqs)
CREATE POLICY "Management can manage all projects" ON public.projects FOR ALL USING (has_role(auth.uid(), 'Management'::user_role));
CREATE POLICY "Procurement can manage projects" ON public.projects FOR ALL USING (has_role(auth.uid(), 'Procurement'::user_role));
CREATE POLICY "Users can update assigned projects" ON public.projects FOR UPDATE USING (assignee_id = auth.uid());
CREATE POLICY "Users can view projects" ON public.projects FOR SELECT USING (
  has_role(auth.uid(), 'Management'::user_role) OR 
  has_role(auth.uid(), 'Procurement'::user_role) OR 
  has_role(auth.uid(), 'Engineering'::user_role) OR 
  assignee_id = auth.uid()
);

-- Create project_documents table (evolution of rfq_attachments)
CREATE TABLE public.project_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  file_url TEXT, -- For Supabase Storage
  storage_path TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_latest BOOLEAN DEFAULT true,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID
);

-- Enable RLS on project_documents
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for project_documents
CREATE POLICY "Users can manage documents for accessible projects" ON public.project_documents FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_documents.project_id 
    AND (has_role(auth.uid(), 'Management'::user_role) OR has_role(auth.uid(), 'Procurement'::user_role) OR p.assignee_id = auth.uid())
  )
);

CREATE POLICY "Users can view project documents" ON public.project_documents FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_documents.project_id 
    AND (has_role(auth.uid(), 'Management'::user_role) OR has_role(auth.uid(), 'Procurement'::user_role) OR has_role(auth.uid(), 'Engineering'::user_role) OR p.assignee_id = auth.uid())
  )
);

-- Create project_activities table (evolution of rfq_activities)
CREATE TABLE public.project_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS on project_activities
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for project_activities
CREATE POLICY "System can insert activities" ON public.project_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view project activities" ON public.project_activities FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_activities.project_id 
    AND (has_role(auth.uid(), 'Management'::user_role) OR has_role(auth.uid(), 'Procurement'::user_role) OR has_role(auth.uid(), 'Engineering'::user_role) OR p.assignee_id = auth.uid())
  )
);

-- Update existing internal reviews to reference projects
ALTER TABLE public.rfq_internal_reviews ADD COLUMN project_id UUID REFERENCES public.projects(id);

-- Update existing risks to reference projects  
ALTER TABLE public.rfq_risks ADD COLUMN project_id UUID REFERENCES public.projects(id);

-- Update existing clarifications to reference projects
ALTER TABLE public.rfq_clarifications ADD COLUMN project_id UUID REFERENCES public.projects(id);

-- Create project_metrics table for analytics
CREATE TABLE public.project_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  phase_name TEXT NOT NULL,
  phase_start TIMESTAMP WITH TIME ZONE NOT NULL,
  phase_end TIMESTAMP WITH TIME ZONE,
  time_spent INTERVAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on project_metrics
ALTER TABLE public.project_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for project_metrics
CREATE POLICY "Management can view all project metrics" ON public.project_metrics FOR SELECT USING (has_role(auth.uid(), 'Management'::user_role));
CREATE POLICY "System can insert metrics" ON public.project_metrics FOR INSERT WITH CHECK (true);

-- Create workflow configuration tables
CREATE TABLE public.workflow_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on workflow_stages
ALTER TABLE public.workflow_stages ENABLE ROW LEVEL SECURITY;

-- Create policies for workflow_stages
CREATE POLICY "Users can view workflow stages" ON public.workflow_stages FOR SELECT USING (true);
CREATE POLICY "Management can manage workflow stages" ON public.workflow_stages FOR ALL USING (has_role(auth.uid(), 'Management'::user_role));

-- Insert default workflow stages
INSERT INTO public.workflow_stages (name, color, stage_order) VALUES
('New Inquiry', '#3B82F6', 1),
('Under Review', '#F59E0B', 2),
('Quoted', '#8B5CF6', 3),
('Won', '#10B981', 4),
('Production', '#059669', 5),
('Completed', '#6B7280', 6);

-- Create workflow transitions table
CREATE TABLE public.workflow_transitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_stage_id UUID REFERENCES public.workflow_stages(id),
  to_stage_id UUID REFERENCES public.workflow_stages(id),
  allowed_roles user_role[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on workflow_transitions
ALTER TABLE public.workflow_transitions ENABLE ROW LEVEL SECURITY;

-- Create policies for workflow_transitions
CREATE POLICY "Users can view workflow transitions" ON public.workflow_transitions FOR SELECT USING (true);
CREATE POLICY "Management can manage workflow transitions" ON public.workflow_transitions FOR ALL USING (has_role(auth.uid(), 'Management'::user_role));

-- Functions for project management
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
BEGIN
  current_year := EXTRACT(year FROM now())::TEXT;
  current_month := LPAD(EXTRACT(month FROM now())::TEXT, 2, '0');
  current_day := LPAD(EXTRACT(day FROM now())::TEXT, 2, '0');
  
  -- Get the next sequence number for this date
  SELECT LPAD((
    COALESCE(
      (SELECT MAX(CAST(SUBSTRING(project_id FROM 'P-' || current_year || current_month || current_day || '(\d+)') AS INTEGER)), 0) + 1,
      1
    )
  )::TEXT, 2, '0') INTO sequence_num
  FROM public.projects
  WHERE project_id LIKE 'P-' || current_year || current_month || current_day || '%';
  
  RETURN 'P-' || current_year || current_month || current_day || sequence_num;
END;
$function$;

-- Trigger to set project_id
CREATE OR REPLACE FUNCTION public.set_project_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.project_id IS NULL OR NEW.project_id = '' THEN
    NEW.project_id := generate_project_id();
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger for project_id generation
CREATE TRIGGER set_project_id_trigger
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_project_id();

-- Update days in stage function for projects
CREATE OR REPLACE FUNCTION public.update_project_days_in_stage()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
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
$function$;

-- Create trigger for project stage tracking
CREATE TRIGGER update_project_days_in_stage_trigger
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_project_days_in_stage();

-- Activity logging function for projects
CREATE OR REPLACE FUNCTION public.log_project_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log status changes
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.project_activities (project_id, activity_type, description, old_values, new_values, created_by)
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
    INSERT INTO public.project_activities (project_id, activity_type, description, old_values, new_values, created_by)
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

-- Create trigger for project activity logging
CREATE TRIGGER log_project_activity_trigger
  AFTER UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.log_project_activity();

-- Add updated_at triggers
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();