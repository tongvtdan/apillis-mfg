-- Create review status enum
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected', 'revision_requested');

-- Create risk severity enum  
CREATE TYPE public.risk_severity AS ENUM ('low', 'medium', 'high');

-- Create risk category enum
CREATE TYPE public.risk_category AS ENUM ('technical', 'timeline', 'cost', 'quality');

-- Create internal reviews table
CREATE TABLE public.rfq_internal_reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    rfq_id UUID NOT NULL,
    department user_role NOT NULL CHECK (department IN ('Engineering', 'QA', 'Production')),
    reviewer_id UUID,
    status review_status NOT NULL DEFAULT 'pending',
    feedback TEXT,
    suggestions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    submitted_by UUID
);

-- Create risks table
CREATE TABLE public.rfq_risks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    rfq_id UUID NOT NULL,
    review_id UUID,
    description TEXT NOT NULL,
    category risk_category NOT NULL,
    severity risk_severity NOT NULL,
    mitigation_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID
);

-- Create clarification requests table
CREATE TABLE public.rfq_clarifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    rfq_id UUID NOT NULL,
    requested_by UUID,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID
);

-- Add review assignment fields to rfqs table
ALTER TABLE public.rfqs 
ADD COLUMN engineering_reviewer_id UUID,
ADD COLUMN qa_reviewer_id UUID,
ADD COLUMN production_reviewer_id UUID,
ADD COLUMN review_summary JSONB DEFAULT '{}';

-- Enable RLS
ALTER TABLE public.rfq_internal_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_clarifications ENABLE ROW LEVEL SECURITY;

-- Create policies for internal reviews
CREATE POLICY "Users can view reviews for accessible RFQs"
ON public.rfq_internal_reviews FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM rfqs r
        WHERE r.id = rfq_internal_reviews.rfq_id
        AND (
            has_role(auth.uid(), 'Management'::user_role) OR
            has_role(auth.uid(), 'Procurement'::user_role) OR
            r.assignee_id = auth.uid() OR
            reviewer_id = auth.uid() OR
            (department = 'Engineering' AND has_role(auth.uid(), 'Engineering'::user_role)) OR
            (department = 'QA' AND has_role(auth.uid(), 'QA'::user_role)) OR
            (department = 'Production' AND has_role(auth.uid(), 'Production'::user_role))
        )
    )
);

CREATE POLICY "Assigned reviewers can create/update reviews"
ON public.rfq_internal_reviews FOR ALL
USING (reviewer_id = auth.uid() OR has_role(auth.uid(), 'Management'::user_role) OR has_role(auth.uid(), 'Procurement'::user_role));

-- Create policies for risks
CREATE POLICY "Users can view risks for accessible RFQs"
ON public.rfq_risks FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM rfqs r
        WHERE r.id = rfq_risks.rfq_id
        AND (
            has_role(auth.uid(), 'Management'::user_role) OR
            has_role(auth.uid(), 'Procurement'::user_role) OR
            has_role(auth.uid(), 'Engineering'::user_role) OR
            has_role(auth.uid(), 'QA'::user_role) OR
            has_role(auth.uid(), 'Production'::user_role) OR
            r.assignee_id = auth.uid()
        )
    )
);

CREATE POLICY "Team members can create risks"
ON public.rfq_risks FOR INSERT
WITH CHECK (
    has_role(auth.uid(), 'Management'::user_role) OR
    has_role(auth.uid(), 'Procurement'::user_role) OR
    has_role(auth.uid(), 'Engineering'::user_role) OR
    has_role(auth.uid(), 'QA'::user_role) OR
    has_role(auth.uid(), 'Production'::user_role)
);

-- Create policies for clarifications
CREATE POLICY "Users can view clarifications for accessible RFQs"
ON public.rfq_clarifications FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM rfqs r
        WHERE r.id = rfq_clarifications.rfq_id
        AND (
            has_role(auth.uid(), 'Management'::user_role) OR
            has_role(auth.uid(), 'Procurement'::user_role) OR
            has_role(auth.uid(), 'Engineering'::user_role) OR
            has_role(auth.uid(), 'QA'::user_role) OR
            has_role(auth.uid(), 'Production'::user_role) OR
            r.assignee_id = auth.uid()
        )
    )
);

CREATE POLICY "Team members can create clarifications"
ON public.rfq_clarifications FOR INSERT
WITH CHECK (
    has_role(auth.uid(), 'Management'::user_role) OR
    has_role(auth.uid(), 'Procurement'::user_role) OR
    has_role(auth.uid(), 'Engineering'::user_role) OR
    has_role(auth.uid(), 'QA'::user_role) OR
    has_role(auth.uid(), 'Production'::user_role)
);

-- Create triggers for timestamps
CREATE TRIGGER update_rfq_internal_reviews_updated_at
    BEFORE UPDATE ON public.rfq_internal_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update RFQ review summary
CREATE OR REPLACE FUNCTION public.update_rfq_review_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Update the review summary in the RFQ
    UPDATE public.rfqs
    SET review_summary = (
        SELECT jsonb_object_agg(
            department::text,
            jsonb_build_object(
                'status', status::text,
                'reviewer_id', reviewer_id,
                'submitted_at', submitted_at,
                'feedback', feedback
            )
        )
        FROM public.rfq_internal_reviews
        WHERE rfq_id = COALESCE(NEW.rfq_id, OLD.rfq_id)
    )
    WHERE id = COALESCE(NEW.rfq_id, OLD.rfq_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger to update review summary
CREATE TRIGGER update_review_summary_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.rfq_internal_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_rfq_review_summary();