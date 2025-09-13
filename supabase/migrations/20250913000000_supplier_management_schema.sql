-- =========================================
-- Factory Pulse - Supplier Management Schema
-- Migration: Create supplier management tables and relationships
-- Date: 2025-09-13
-- =========================================

-- =========================================
-- EXTENSIONS (if not already created)
-- =========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- ENUMS FOR SUPPLIER MANAGEMENT
-- =========================================

-- Supplier qualification status
CREATE TYPE supplier_qualification_status AS ENUM (
    'not_started',
    'in_progress',
    'pending_approval',
    'qualified',
    'qualified_with_conditions',
    'qualified_as_exception',
    'rejected',
    'expired'
);

-- Supplier RFQ status
CREATE TYPE supplier_rfq_status AS ENUM (
    'draft',
    'sent',
    'viewed',
    'quoted',
    'declined',
    'expired',
    'cancelled'
);

-- Supplier quote status
CREATE TYPE supplier_quote_status AS ENUM (
    'sent',
    'received',
    'rejected',
    'accepted',
    'expired',
    'cancelled'
);

-- =========================================
-- SUPPLIER MANAGEMENT TABLES
-- =========================================

-- Supplier Qualifications table
-- Stores detailed qualification information for suppliers
CREATE TABLE IF NOT EXISTS public.supplier_qualifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Qualification status and metadata
    qualification_status supplier_qualification_status DEFAULT 'not_started',
    qualification_expiry DATE,
    
    -- Conditions for partial approval
    qualification_conditions TEXT,
    qualification_conditions_resolved BOOLEAN DEFAULT false,
    
    -- Exception handling for special approvals
    qualification_exception_justification TEXT,
    qualification_exception_expires_at DATE,
    qualification_exception_reviewed_by UUID REFERENCES public.users(id),
    
    -- Scoring and evaluation
    overall_score NUMERIC(5,2),
    criteria_scores JSONB DEFAULT '{}'::jsonb,
    recommendations TEXT[],
    valid_until DATE,
    
    -- Approval tracking
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMPTZ,
    
    -- Audit fields
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE (organization_id)
);

-- Supplier Qualification Progress table
-- Tracks progress through qualification sub-stages
CREATE TABLE IF NOT EXISTS public.supplier_qualification_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    
    -- Sub-stage tracking
    sub_stage_slug TEXT NOT NULL, -- 'profile_complete', 'nda_signed', 'docs_uploaded', 'internal_review', 'final_approval'
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
    completed_at TIMESTAMPTZ,
    
    -- Metadata for tracking
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE (supplier_id, sub_stage_slug)
);

-- Supplier Performance Metrics table
-- Tracks supplier performance for analytics and reporting
CREATE TABLE IF NOT EXISTS public.supplier_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    
    -- Performance period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Delivery metrics
    total_orders INTEGER DEFAULT 0,
    on_time_deliveries INTEGER DEFAULT 0,
    average_lead_time_days NUMERIC(5,2),
    
    -- Quality metrics
    quality_incidents INTEGER DEFAULT 0,
    quality_score NUMERIC(5,2),
    
    -- Financial metrics
    total_spend NUMERIC(18,2) DEFAULT 0,
    average_cost_variance NUMERIC(5,2),
    
    -- Responsiveness metrics
    response_rate NUMERIC(5,2),
    average_response_time_hours NUMERIC(5,2),
    
    -- Overall score
    overall_performance_score NUMERIC(5,2),
    performance_grade TEXT, -- 'A', 'B', 'C', 'D', 'F'
    
    -- Metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Audit fields
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE (supplier_id, period_start, period_end)
);

-- Supplier RFQs table
-- Manages RFQs sent to suppliers
CREATE TABLE IF NOT EXISTS public.supplier_rfqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    
    -- RFQ identification
    rfq_number TEXT NOT NULL UNIQUE,
    
    -- Status and timing
    status supplier_rfq_status DEFAULT 'draft',
    priority TEXT,
    due_date DATE,
    expected_response_date DATE,
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    
    -- Requirements and instructions
    requirements TEXT,
    special_instructions TEXT,
    
    -- Audit fields
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier Quotes table
-- Stores quotes received from suppliers
CREATE TABLE IF NOT EXISTS public.supplier_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    supplier_rfq_id UUID NOT NULL REFERENCES public.supplier_rfqs(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    
    -- Quote identification
    quote_number TEXT,
    
    -- Financial details
    unit_price NUMERIC(18,2),
    total_amount NUMERIC(18,2),
    currency TEXT,
    quantity INTEGER,
    
    -- Delivery terms
    lead_time_days INTEGER,
    valid_until DATE,
    
    -- Commercial terms
    payment_terms TEXT,
    shipping_terms TEXT,
    
    -- Status and metadata
    status supplier_quote_status DEFAULT 'sent',
    notes TEXT,
    quote_file_url TEXT,
    is_selected BOOLEAN DEFAULT false,
    
    -- Evaluation fields
    submitted_at TIMESTAMPTZ,
    evaluated_at TIMESTAMPTZ,
    evaluated_by UUID REFERENCES public.users(id),
    evaluation_score NUMERIC(5,2),
    evaluation_notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================

-- Supplier qualifications indexes
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_org_status ON supplier_qualifications(organization_id, qualification_status);
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_expiry ON supplier_qualifications(qualification_expiry) WHERE qualification_expiry IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_approved_by ON supplier_qualifications(approved_by);

-- Supplier qualification progress indexes
CREATE INDEX IF NOT EXISTS idx_supplier_qualification_progress_org_supplier ON supplier_qualification_progress(organization_id, supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_qualification_progress_status ON supplier_qualification_progress(status);
CREATE INDEX IF NOT EXISTS idx_supplier_qualification_progress_sub_stage ON supplier_qualification_progress(sub_stage_slug);

-- Supplier performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_org_supplier ON supplier_performance_metrics(organization_id, supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_period ON supplier_performance_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_score ON supplier_performance_metrics(overall_performance_score);

-- Supplier RFQ indexes
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_org_project ON supplier_rfqs(organization_id, project_id);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_supplier_status ON supplier_rfqs(supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_due_date ON supplier_rfqs(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_created_at ON supplier_rfqs(created_at DESC);

-- Supplier quotes indexes
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_org_rfq ON supplier_quotes(organization_id, supplier_rfq_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_supplier_status ON supplier_quotes(supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_submitted_at ON supplier_quotes(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_selected ON supplier_quotes(is_selected);

-- =========================================
-- TRIGGERS FOR UPDATED_AT COLUMNS
-- =========================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for supplier management tables
CREATE TRIGGER update_supplier_qualifications_updated_at 
    BEFORE UPDATE ON supplier_qualifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_qualification_progress_updated_at 
    BEFORE UPDATE ON supplier_qualification_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_performance_metrics_updated_at 
    BEFORE UPDATE ON supplier_performance_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_rfqs_updated_at 
    BEFORE UPDATE ON supplier_rfqs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_quotes_updated_at 
    BEFORE UPDATE ON supplier_quotes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- RLS POLICIES
-- =========================================

-- Enable RLS on all supplier management tables
ALTER TABLE supplier_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_qualification_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_quotes ENABLE ROW LEVEL SECURITY;

-- Supplier Qualifications RLS Policies
CREATE POLICY "sq_select_org"
ON public.supplier_qualifications
FOR SELECT USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "sq_insert_org"
ON public.supplier_qualifications
FOR INSERT WITH CHECK (organization_id = public.get_current_user_org_id());

CREATE POLICY "sq_update_org"
ON public.supplier_qualifications
FOR UPDATE USING (
    organization_id = public.get_current_user_org_id()
);

CREATE POLICY "sq_delete_org"
ON public.supplier_qualifications
FOR DELETE USING (organization_id = public.get_current_user_org_id());

-- Supplier Qualification Progress RLS Policies
CREATE POLICY "sqp_select_org"
ON public.supplier_qualification_progress
FOR SELECT USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "sqp_insert_org"
ON public.supplier_qualification_progress
FOR INSERT WITH CHECK (organization_id = public.get_current_user_org_id());

CREATE POLICY "sqp_update_org"
ON public.supplier_qualification_progress
FOR UPDATE USING (
    organization_id = public.get_current_user_org_id()
);

CREATE POLICY "sqp_delete_org"
ON public.supplier_qualification_progress
FOR DELETE USING (organization_id = public.get_current_user_org_id());

-- Supplier Performance Metrics RLS Policies
CREATE POLICY "spm_select_org"
ON public.supplier_performance_metrics
FOR SELECT USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "spm_insert_org"
ON public.supplier_performance_metrics
FOR INSERT WITH CHECK (organization_id = public.get_current_user_org_id());

CREATE POLICY "spm_update_org"
ON public.supplier_performance_metrics
FOR UPDATE USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "spm_delete_org"
ON public.supplier_performance_metrics
FOR DELETE USING (organization_id = public.get_current_user_org_id());

-- Supplier RFQs RLS Policies
CREATE POLICY "srfq_select_org"
ON public.supplier_rfqs
FOR SELECT USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "srfq_insert_org"
ON public.supplier_rfqs
FOR INSERT WITH CHECK (organization_id = public.get_current_user_org_id());

CREATE POLICY "srfq_update_org"
ON public.supplier_rfqs
FOR UPDATE USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "srfq_delete_org"
ON public.supplier_rfqs
FOR DELETE USING (organization_id = public.get_current_user_org_id());

-- Supplier Quotes RLS Policies
CREATE POLICY "sqts_select_org"
ON public.supplier_quotes
FOR SELECT USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "sqts_insert_org"
ON public.supplier_quotes
FOR INSERT WITH CHECK (organization_id = public.get_current_user_org_id());

CREATE POLICY "sqts_update_org"
ON public.supplier_quotes
FOR UPDATE USING (organization_id = public.get_current_user_org_id());

CREATE POLICY "sqts_delete_org"
ON public.supplier_quotes
FOR DELETE USING (organization_id = public.get_current_user_org_id());

-- =========================================
-- DOCUMENT CATEGORIES TABLE (if not exists)
-- =========================================

-- Create document_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.document_categories (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_portal_visible BOOLEAN DEFAULT false,
    retention_policy JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- SUPPLIER DOCUMENT CATEGORIES
-- =========================================

-- Insert supplier-specific document categories if they don't exist
INSERT INTO public.document_categories (code, name, is_portal_visible, retention_policy)
VALUES
  ('supplier_nda', 'Supplier NDA', true, '{"years": 7}'),
  ('supplier_iso', 'Supplier ISO Certificate', true, '{"years": 3}'),
  ('supplier_insurance', 'Supplier Insurance Certificate', true, '{"years": 2}'),
  ('supplier_financial', 'Supplier Financial Statement', false, '{"years": 7}'),
  ('supplier_qc', 'Supplier Quality Certificate', true, '{"years": 3}'),
  ('supplier_profile', 'Supplier Profile Document', true, '{"years": 5}'),
  ('supplier_logo', 'Supplier Logo', true, '{"years": 5}'),
  ('supplier_qualified_image', 'Supplier Qualified Image', true, '{"years": 5}'),
  ('supplier_external_link', 'Supplier External Document Link', true, '{"years": 5}')
ON CONFLICT (code) DO NOTHING;

-- =========================================
-- SUPPLIER MANAGEMENT RPC FUNCTIONS
-- =========================================

-- RPC: start_supplier_qualification
-- Initiates the qualification process for a supplier
CREATE OR REPLACE FUNCTION public.start_supplier_qualification(supplier_org_id UUID)
RETURNS JSON AS $$
DECLARE
    qualification_id UUID;
BEGIN
    -- Insert or update supplier qualification record
    INSERT INTO public.supplier_qualifications (organization_id, qualification_status)
    VALUES (supplier_org_id, 'in_progress')
    ON CONFLICT (organization_id)
    DO UPDATE SET 
        qualification_status = 'in_progress', 
        updated_at = NOW()
    RETURNING id INTO qualification_id;
    
    -- Insert 5 sub-stage records if they don't exist
    INSERT INTO public.supplier_qualification_progress 
        (organization_id, supplier_id, sub_stage_slug, status)
    SELECT 
        supplier_org_id,
        c.id,
        sub_stage,
        'pending'
    FROM public.contacts c
    CROSS JOIN (
        VALUES 
        ('profile_complete'),
        ('nda_signed'),
        ('docs_uploaded'),
        ('internal_review'),
        ('final_approval')
    ) AS sub_stages(sub_stage)
    WHERE c.organization_id = supplier_org_id 
        AND c.type = 'supplier'
        AND NOT EXISTS (
            SELECT 1 FROM public.supplier_qualification_progress sqp
            WHERE sqp.supplier_id = c.id 
                AND sqp.sub_stage_slug = sub_stages.sub_stage
        )
    ON CONFLICT DO NOTHING;
    
    RETURN json_build_object(
        'status', 'success',
        'qualification_id', qualification_id,
        'message', 'Supplier qualification process started successfully'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'error',
            'message', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- RPC: approve_supplier_qualification
-- Handles approval of supplier qualification with support for partial/exception approvals
CREATE OR REPLACE FUNCTION public.approve_supplier_qualification(
    supplier_org_id UUID,
    approver_id UUID,
    decision_type TEXT,
    conditions TEXT DEFAULT NULL,
    exception_justification TEXT DEFAULT NULL,
    escalated_to UUID DEFAULT NULL,
    review_due_date DATE DEFAULT NULL,
    attached_document_id UUID DEFAULT NULL,
    overall_score NUMERIC(5,2) DEFAULT NULL,
    criteria_scores JSONB DEFAULT '{}'::jsonb
)
RETURNS JSON AS $$
BEGIN
    -- Update supplier_qualifications table with approval details
    UPDATE public.supplier_qualifications
    SET 
        qualification_status = CASE 
            WHEN decision_type = 'approve' THEN 'qualified'
            WHEN decision_type = 'partial' THEN 'qualified_with_conditions'
            WHEN decision_type = 'exception' THEN 'qualified_as_exception'
            WHEN decision_type = 'reject' THEN 'rejected'
            ELSE qualification_status
        END,
        qualification_conditions = CASE 
            WHEN decision_type = 'partial' THEN conditions 
            ELSE qualification_conditions 
        END,
        qualification_exception_justification = CASE 
            WHEN decision_type = 'exception' THEN exception_justification 
            ELSE qualification_exception_justification 
        END,
        qualification_exception_expires_at = CASE 
            WHEN decision_type = 'exception' THEN review_due_date 
            ELSE qualification_exception_expires_at 
        END,
        qualification_exception_reviewed_by = CASE 
            WHEN decision_type = 'exception' THEN escalated_to 
            ELSE qualification_exception_reviewed_by 
        END,
        overall_score = overall_score,
        criteria_scores = criteria_scores,
        approved_by = approver_id,
        approved_at = NOW(),
        updated_at = NOW()
    WHERE organization_id = supplier_org_id;

    -- Log approval in activity_log
    INSERT INTO public.activity_log (
        organization_id,
        user_id,
        entity_type,
        entity_id,
        action,
        description,
        metadata
    ) VALUES (
        (SELECT organization_id FROM public.organizations WHERE id = supplier_org_id),
        approver_id,
        'supplier_qualification',
        supplier_org_id::TEXT,
        'approved',
        'Supplier qualification ' || decision_type || ' decision made',
        json_build_object(
            'decision_type', decision_type,
            'conditions', conditions,
            'exception_justification', exception_justification,
            'escalated_to', escalated_to,
            'review_due_date', review_due_date,
            'attached_document_id', attached_document_id,
            'overall_score', overall_score,
            'criteria_scores', criteria_scores
        )
    );

    -- Log approval in approval_history if there's a related approval
    INSERT INTO public.approval_history (
        organization_id,
        approval_id,
        user_id,
        action,
        old_status,
        new_status,
        comments,
        metadata
    )
    SELECT 
        a.organization_id,
        a.id,
        approver_id,
        'approved',
        a.status,
        CASE 
            WHEN decision_type = 'approve' THEN 'approved'::approval_status
            WHEN decision_type = 'partial' THEN 'approved'::approval_status
            WHEN decision_type = 'exception' THEN 'approved'::approval_status
            WHEN decision_type = 'reject' THEN 'rejected'::approval_status
            ELSE a.status
        END,
        'Supplier qualification ' || decision_type || ' decision',
        json_build_object(
            'decision_type', decision_type,
            'conditions', conditions,
            'exception_justification', exception_justification
        )
    FROM public.approvals a
    WHERE a.entity_type = 'supplier_qualification'
        AND a.entity_id = supplier_org_id
        AND a.status IN ('pending', 'in_review')
    LIMIT 1;

    RETURN json_build_object(
        'status', 'success',
        'message', 'Supplier qualification approval processed successfully'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'error',
            'message', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- SUPPLIER MANAGEMENT VIEWS
-- =========================================

-- View: supplier_details_view
-- Provides a comprehensive view of supplier information
CREATE OR REPLACE VIEW public.supplier_details_view AS
SELECT 
    o.id AS organization_id,
    o.name AS organization_name,
    o.slug AS organization_slug,
    o.description AS organization_description,
    o.industry,
    o.address,
    o.city,
    o.state,
    o.country,
    o.postal_code,
    o.website,
    o.logo_url,
    o.is_active,
    
    -- Primary contact information
    c.id AS primary_contact_id,
    c.contact_name AS primary_contact_name,
    c.email AS primary_contact_email,
    c.phone AS primary_contact_phone,
    c.role AS primary_contact_department,
    c.role AS primary_contact_job_title,
    
    -- Qualification information
    sq.id AS qualification_id,
    sq.qualification_status,
    sq.qualification_expiry,
    sq.overall_score,
    sq.approved_at AS qualification_approved_at,
    sq.valid_until,
    
    -- Performance metrics
    spm.overall_performance_score,
    spm.performance_grade,
    spm.total_orders,
    spm.on_time_deliveries,
    spm.average_lead_time_days,
    spm.quality_score,
    spm.response_rate,
    
    -- RFQ and quote statistics
    (SELECT COUNT(*) FROM public.supplier_rfqs sr WHERE sr.supplier_id = c.id) AS total_rfqs_sent,
    (SELECT COUNT(*) FROM public.supplier_quotes sqts WHERE sqts.supplier_id = c.id) AS total_quotes_received,
    (SELECT COUNT(*) FROM public.supplier_quotes sqts WHERE sqts.supplier_id = c.id AND sqts.status = 'accepted') AS total_quotes_accepted,
    
    o.created_at AS organization_created_at,
    o.updated_at AS organization_updated_at
FROM public.organizations o
LEFT JOIN public.contacts c ON o.id = c.organization_id AND c.type = 'supplier' AND c.is_primary_contact = true
LEFT JOIN public.supplier_qualifications sq ON o.id = sq.organization_id
LEFT JOIN public.supplier_performance_metrics spm ON c.id = spm.supplier_id AND spm.period_end = (
    SELECT MAX(period_end) FROM public.supplier_performance_metrics spm2 WHERE spm2.supplier_id = c.id
)
WHERE o.organization_type = 'supplier';

-- =========================================
-- COMMENTS FOR DOCUMENTATION
-- =========================================

COMMENT ON TABLE supplier_qualifications IS 'Stores detailed qualification information for suppliers including status, conditions, and scoring';
COMMENT ON TABLE supplier_qualification_progress IS 'Tracks progress through qualification sub-stages for suppliers';
COMMENT ON TABLE supplier_performance_metrics IS 'Tracks supplier performance metrics for analytics and reporting';
COMMENT ON TABLE supplier_rfqs IS 'Manages RFQs sent to suppliers';
COMMENT ON TABLE supplier_quotes IS 'Stores quotes received from suppliers';

COMMENT ON COLUMN supplier_qualifications.qualification_status IS 'Current qualification status of the supplier';
COMMENT ON COLUMN supplier_qualifications.qualification_conditions IS 'Conditions for partial approval';
COMMENT ON COLUMN supplier_qualifications.qualification_exception_justification IS 'Justification for exception approval';
COMMENT ON COLUMN supplier_qualifications.criteria_scores IS 'Detailed scores for each qualification criterion';
COMMENT ON COLUMN supplier_qualifications.overall_score IS 'Overall qualification score (0-100)';
COMMENT ON COLUMN supplier_qualifications.valid_until IS 'Date until which the qualification is valid';

COMMENT ON COLUMN supplier_qualification_progress.sub_stage_slug IS 'Slug identifier for the qualification sub-stage';
COMMENT ON COLUMN supplier_qualification_progress.status IS 'Status of the sub-stage progress';
COMMENT ON COLUMN supplier_qualification_progress.completed_at IS 'Timestamp when the sub-stage was completed';

COMMENT ON COLUMN supplier_performance_metrics.period_start IS 'Start date of the performance period';
COMMENT ON COLUMN supplier_performance_metrics.period_end IS 'End date of the performance period';
COMMENT ON COLUMN supplier_performance_metrics.on_time_deliveries IS 'Number of on-time deliveries during the period';
COMMENT ON COLUMN supplier_performance_metrics.quality_score IS 'Quality score (0-100) based on incidents';
COMMENT ON COLUMN supplier_performance_metrics.response_rate IS 'Supplier response rate percentage';
COMMENT ON COLUMN supplier_performance_metrics.overall_performance_score IS 'Overall performance score (0-100)';

COMMENT ON COLUMN supplier_rfqs.rfq_number IS 'Unique RFQ number for identification';
COMMENT ON COLUMN supplier_rfqs.status IS 'Current status of the RFQ';
COMMENT ON COLUMN supplier_rfqs.due_date IS 'Date by which the RFQ response is due';

COMMENT ON COLUMN supplier_quotes.unit_price IS 'Unit price quoted by the supplier';
COMMENT ON COLUMN supplier_quotes.total_amount IS 'Total amount of the quote';
COMMENT ON COLUMN supplier_quotes.lead_time_days IS 'Lead time in days offered by the supplier';
COMMENT ON COLUMN supplier_quotes.valid_until IS 'Date until which the quote is valid';
COMMENT ON COLUMN supplier_quotes.status IS 'Current status of the quote';
COMMENT ON COLUMN supplier_quotes.is_selected IS 'Whether this quote has been selected for the RFQ';

-- =========================================
-- MIGRATION COMPLETE
-- =========================================