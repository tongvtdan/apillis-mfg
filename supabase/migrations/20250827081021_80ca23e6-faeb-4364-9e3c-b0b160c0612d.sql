-- Check if reviews table exists and create reviews system tables

-- Internal reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id),
    reviewer_role VARCHAR(50) NOT NULL,
    review_type VARCHAR(50) DEFAULT 'standard' 
        CHECK (review_type IN ('standard', 'technical', 'quality', 'production', 'cost', 'compliance', 'safety')),
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'needs_info', 'on_hold')),
    priority VARCHAR(10) DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    comments TEXT,
    risks JSONB DEFAULT '[]',
    recommendations TEXT,
    tooling_required BOOLEAN DEFAULT false,
    estimated_cost DECIMAL(15,2),
    estimated_lead_time INTEGER,
    due_date DATE,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review checklist items table
CREATE TABLE IF NOT EXISTS public.review_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    is_checked BOOLEAN DEFAULT false,
    is_required BOOLEAN DEFAULT true,
    notes TEXT,
    checked_by UUID REFERENCES auth.users(id),
    checked_at TIMESTAMPTZ
);

-- Enable RLS on both tables
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_checklist_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reviews table
CREATE POLICY "Users can view reviews for accessible projects" 
ON public.reviews 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.projects p 
        WHERE p.id = reviews.project_id 
        AND (
            user_has_role('Management') OR 
            user_has_role('Procurement') OR 
            user_has_role('Engineering') OR 
            user_has_role('Production') OR 
            user_has_role('QA') OR
            p.assignee_id = auth.uid()
        )
    )
);

CREATE POLICY "Reviewers can create reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.projects p 
        WHERE p.id = reviews.project_id 
        AND (
            user_has_role('Management') OR 
            user_has_role('Procurement') OR 
            user_has_role('Engineering') OR 
            user_has_role('Production') OR 
            user_has_role('QA')
        )
    )
);

CREATE POLICY "Reviewers can update their own reviews" 
ON public.reviews 
FOR UPDATE 
USING (
    reviewer_id = auth.uid() OR 
    user_has_role('Management')
);

-- Create RLS policies for review_checklist_items table
CREATE POLICY "Users can view checklist items for accessible reviews" 
ON public.review_checklist_items 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.reviews r
        JOIN public.projects p ON r.project_id = p.id
        WHERE r.id = review_checklist_items.review_id 
        AND (
            user_has_role('Management') OR 
            user_has_role('Procurement') OR 
            user_has_role('Engineering') OR 
            user_has_role('Production') OR 
            user_has_role('QA') OR
            p.assignee_id = auth.uid() OR
            r.reviewer_id = auth.uid()
        )
    )
);

CREATE POLICY "Reviewers can manage checklist items" 
ON public.review_checklist_items 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.reviews r 
        WHERE r.id = review_checklist_items.review_id 
        AND (
            r.reviewer_id = auth.uid() OR 
            user_has_role('Management')
        )
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_project_id ON public.reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_review_type ON public.reviews(review_type);
CREATE INDEX IF NOT EXISTS idx_review_checklist_items_review_id ON public.review_checklist_items(review_id);

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_reviews_updated_at();