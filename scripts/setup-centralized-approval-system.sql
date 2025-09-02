-- =====================================================
-- Centralized Approval System - Complete SQL Script
-- Run this in Supabase SQL Editor
-- Date: September 2, 2025
-- =====================================================

-- Create approval types enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_type') THEN
        CREATE TYPE approval_type AS ENUM (
            'stage_transition',           -- Workflow stage transitions
            'document_approval',          -- Document approvals (RFQ, drawings, etc.)
            'engineering_change',         -- Engineering change requests
            'supplier_qualification',     -- Supplier qualification approvals
            'purchase_order',             -- Purchase order approvals
            'cost_approval',              -- Cost/budget approvals
            'quality_review',             -- Quality control approvals
            'production_release',         -- Production release approvals
            'shipping_approval',          -- Shipping and delivery approvals
            'contract_approval',          -- Contract and legal approvals
            'budget_approval',            -- Budget and financial approvals
            'safety_review',              -- Safety and compliance approvals
            'custom'                      -- Custom approval types
        );
    END IF;
END $$;

-- Create approval status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
        CREATE TYPE approval_status AS ENUM (
            'pending',                    -- Waiting for approval
            'in_review',                  -- Under review
            'approved',                   -- Approved
            'rejected',                  -- Rejected
            'delegated',                  -- Delegated to another user
            'expired',                    -- Approval request expired
            'cancelled',                  -- Cancelled by requester
            'auto_approved',              -- Automatically approved based on rules
            'escalated'                   -- Escalated to higher authority
        );
    END IF;
END $$;

-- Create approval priority enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_priority') THEN
        CREATE TYPE approval_priority AS ENUM (
            'low',                        -- Low priority (7+ days)
            'normal',                     -- Normal priority (3-7 days)
            'high',                       -- High priority (1-3 days)
            'urgent',                     -- Urgent (same day)
            'critical'                    -- Critical (immediate)
        );
    END IF;
END $$;

-- Configurable approval chains
CREATE TABLE IF NOT EXISTS approval_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    chain_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'project', 'quote', 'document', etc.
    conditions JSONB NOT NULL, -- When this chain applies
    steps JSONB NOT NULL, -- Array of approval steps
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Main approvals table
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Approval identification
    approval_type approval_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reference_id VARCHAR(100), -- External reference number
    
    -- Entity being approved
    entity_type VARCHAR(50) NOT NULL, -- 'project', 'document', 'supplier', 'purchase_order', etc.
    entity_id UUID NOT NULL, -- ID of the entity being approved
    
    -- Approval workflow
    approval_chain_id UUID REFERENCES approval_chains(id) ON DELETE SET NULL,
    step_number INTEGER DEFAULT 1, -- Current step in multi-step approval
    total_steps INTEGER DEFAULT 1, -- Total steps in approval chain
    
    -- Requester information
    requested_by UUID NOT NULL REFERENCES users(id),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    request_reason TEXT,
    request_metadata JSONB DEFAULT '{}',
    
    -- Current approver
    current_approver_id UUID REFERENCES users(id),
    current_approver_role VARCHAR(50),
    current_approver_department VARCHAR(100),
    
    -- Approval status and timing
    status approval_status DEFAULT 'pending',
    priority approval_priority DEFAULT 'normal',
    due_date TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- Decision information
    decision_comments TEXT,
    decision_reason TEXT,
    decision_metadata JSONB DEFAULT '{}',
    decided_at TIMESTAMPTZ,
    decided_by UUID REFERENCES users(id),
    
    -- Escalation and delegation
    escalated_from UUID REFERENCES approvals(id),
    escalated_to UUID REFERENCES users(id),
    escalated_at TIMESTAMPTZ,
    escalation_reason TEXT,
    
    -- Delegation information
    delegated_from UUID REFERENCES users(id),
    delegated_to UUID REFERENCES users(id),
    delegated_at TIMESTAMPTZ,
    delegation_reason TEXT,
    delegation_end_date TIMESTAMPTZ,
    
    -- Auto-approval and rules
    auto_approval_rules JSONB DEFAULT '{}',
    auto_approved_at TIMESTAMPTZ,
    auto_approval_reason TEXT,
    
    -- Audit and tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Constraints
    CONSTRAINT valid_due_date CHECK (due_date IS NULL OR due_date > created_at),
    CONSTRAINT valid_expires_at CHECK (expires_at IS NULL OR expires_at > created_at),
    CONSTRAINT valid_delegation_end CHECK (delegation_end_date IS NULL OR delegation_end_date > delegated_at),
    CONSTRAINT valid_decision_timing CHECK (decided_at IS NULL OR decided_at >= created_at)
);

-- Approval delegations table for managing approval delegation rules
CREATE TABLE IF NOT EXISTS approval_delegations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    delegator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delegate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    reason TEXT NOT NULL,
    include_new_approvals BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval delegation mappings table for specific approval delegations
CREATE TABLE IF NOT EXISTS approval_delegation_mappings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    delegation_id UUID NOT NULL REFERENCES approval_delegations(id) ON DELETE CASCADE,
    approval_id UUID NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(delegation_id, approval_id)
);

-- Approval history table for tracking all approval actions
CREATE TABLE IF NOT EXISTS approval_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_id UUID NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Action details
    action_type VARCHAR(50) NOT NULL, -- 'created', 'assigned', 'reviewed', 'approved', 'rejected', 'delegated', 'escalated', 'expired'
    action_by UUID NOT NULL REFERENCES users(id),
    action_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Action data
    old_status approval_status,
    new_status approval_status,
    comments TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Created timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval attachments table for supporting documents
CREATE TABLE IF NOT EXISTS approval_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_id UUID NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- File information
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100),
    
    -- Attachment metadata
    attachment_type VARCHAR(50) DEFAULT 'supporting_document', -- 'supporting_document', 'evidence', 'reference', 'decision_document'
    description TEXT,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Created timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval notifications table for tracking notification history
CREATE TABLE IF NOT EXISTS approval_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_id UUID NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Notification details
    notification_type VARCHAR(50) NOT NULL, -- 'request', 'reminder', 'decision', 'escalation', 'delegation'
    recipient_id UUID NOT NULL REFERENCES users(id),
    recipient_type VARCHAR(20) DEFAULT 'approver', -- 'approver', 'requester', 'stakeholder'
    
    -- Notification content
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_data JSONB DEFAULT '{}',
    
    -- Delivery status
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    delivery_status VARCHAR(20) DEFAULT 'sent' CHECK (delivery_status IN ('sent', 'delivered', 'read', 'failed')),
    
    -- Delivery method
    delivery_method VARCHAR(20) DEFAULT 'in_app' CHECK (delivery_method IN ('in_app', 'email', 'sms', 'push')),
    
    -- Created timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for approvals table
CREATE INDEX IF NOT EXISTS idx_approvals_organization ON approvals(organization_id);
CREATE INDEX IF NOT EXISTS idx_approvals_entity ON approvals(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_approvals_type ON approvals(approval_type);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_priority ON approvals(priority);
CREATE INDEX IF NOT EXISTS idx_approvals_current_approver ON approvals(current_approver_id);
CREATE INDEX IF NOT EXISTS idx_approvals_requested_by ON approvals(requested_by);
CREATE INDEX IF NOT EXISTS idx_approvals_due_date ON approvals(due_date);
CREATE INDEX IF NOT EXISTS idx_approvals_expires_at ON approvals(expires_at);
CREATE INDEX IF NOT EXISTS idx_approvals_created_at ON approvals(created_at);
CREATE INDEX IF NOT EXISTS idx_approvals_chain ON approvals(approval_chain_id, step_number);

-- Indexes for approval_delegations table
CREATE INDEX IF NOT EXISTS idx_approval_delegations_delegator ON approval_delegations(delegator_id);
CREATE INDEX IF NOT EXISTS idx_approval_delegations_delegate ON approval_delegations(delegate_id);
CREATE INDEX IF NOT EXISTS idx_approval_delegations_dates ON approval_delegations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_approval_delegations_status ON approval_delegations(status);
CREATE INDEX IF NOT EXISTS idx_approval_delegations_org ON approval_delegations(organization_id);

-- Indexes for approval_delegation_mappings table
CREATE INDEX IF NOT EXISTS idx_approval_delegation_mappings_delegation ON approval_delegation_mappings(delegation_id);
CREATE INDEX IF NOT EXISTS idx_approval_delegation_mappings_approval ON approval_delegation_mappings(approval_id);

-- Indexes for approval_history table
CREATE INDEX IF NOT EXISTS idx_approval_history_approval ON approval_history(approval_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_action_by ON approval_history(action_by);
CREATE INDEX IF NOT EXISTS idx_approval_history_action_at ON approval_history(action_at);
CREATE INDEX IF NOT EXISTS idx_approval_history_status ON approval_history(old_status, new_status);

-- Indexes for approval_attachments table
CREATE INDEX IF NOT EXISTS idx_approval_attachments_approval ON approval_attachments(approval_id);
CREATE INDEX IF NOT EXISTS idx_approval_attachments_type ON approval_attachments(attachment_type);
CREATE INDEX IF NOT EXISTS idx_approval_attachments_uploaded_by ON approval_attachments(uploaded_by);

-- Indexes for approval_notifications table
CREATE INDEX IF NOT EXISTS idx_approval_notifications_approval ON approval_notifications(approval_id);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_recipient ON approval_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_type ON approval_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_status ON approval_notifications(delivery_status);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_sent_at ON approval_notifications(sent_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable Row Level Security on all approval tables
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_delegation_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for approvals table
DROP POLICY IF EXISTS "Users can view approvals for their organization" ON approvals;
CREATE POLICY "Users can view approvals for their organization" ON approvals
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create approvals for their organization" ON approvals;
CREATE POLICY "Users can create approvals for their organization" ON approvals
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update approvals they are involved with" ON approvals;
CREATE POLICY "Users can update approvals they are involved with" ON approvals
    FOR UPDATE USING (
        organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()) AND
        (requested_by = auth.uid() OR 
         current_approver_id = auth.uid() OR 
         delegated_to = auth.uid() OR 
         escalated_to = auth.uid())
    );

DROP POLICY IF EXISTS "Users can delete approvals they created" ON approvals;
CREATE POLICY "Users can delete approvals they created" ON approvals
    FOR DELETE USING (
        organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()) AND
        requested_by = auth.uid() AND
        status = 'pending'
    );

-- RLS Policies for approval_chains table
DROP POLICY IF EXISTS "Users can view approval chains for their organization" ON approval_chains;
CREATE POLICY "Users can view approval chains for their organization" ON approval_chains
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create approval chains for their organization" ON approval_chains;
CREATE POLICY "Users can create approval chains for their organization" ON approval_chains
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update approval chains they created" ON approval_chains;
CREATE POLICY "Users can update approval chains they created" ON approval_chains
    FOR UPDATE USING (
        organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()) AND
        created_by = auth.uid()
    );

DROP POLICY IF EXISTS "Users can delete approval chains they created" ON approval_chains;
CREATE POLICY "Users can delete approval chains they created" ON approval_chains
    FOR DELETE USING (
        organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()) AND
        created_by = auth.uid()
    );

-- RLS Policies for approval_delegations table
DROP POLICY IF EXISTS "Users can view their own delegations" ON approval_delegations;
CREATE POLICY "Users can view their own delegations" ON approval_delegations
    FOR SELECT USING (
        auth.uid() = delegator_id OR 
        auth.uid() = delegate_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.organization_id = approval_delegations.organization_id
            AND users.role IN ('admin', 'management')
        )
    );

DROP POLICY IF EXISTS "Users can create their own delegations" ON approval_delegations;
CREATE POLICY "Users can create their own delegations" ON approval_delegations
    FOR INSERT WITH CHECK (
        auth.uid() = delegator_id AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.organization_id = approval_delegations.organization_id
        )
    );

DROP POLICY IF EXISTS "Delegators can update their delegations" ON approval_delegations;
CREATE POLICY "Delegators can update their delegations" ON approval_delegations
    FOR UPDATE USING (auth.uid() = delegator_id);

-- RLS Policies for approval_delegation_mappings table
DROP POLICY IF EXISTS "Users can view delegation mappings" ON approval_delegation_mappings;
CREATE POLICY "Users can view delegation mappings" ON approval_delegation_mappings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM approval_delegations 
            WHERE approval_delegations.id = approval_delegation_mappings.delegation_id
            AND (
                auth.uid() = approval_delegations.delegator_id OR 
                auth.uid() = approval_delegations.delegate_id OR
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid() 
                    AND users.organization_id = approval_delegations.organization_id
                    AND users.role IN ('admin', 'management')
                )
            )
        )
    );

DROP POLICY IF EXISTS "Users can create delegation mappings" ON approval_delegation_mappings;
CREATE POLICY "Users can create delegation mappings" ON approval_delegation_mappings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM approval_delegations 
            WHERE approval_delegations.id = approval_delegation_mappings.delegation_id
            AND auth.uid() = approval_delegations.delegator_id
        )
    );

-- RLS Policies for approval_history table
DROP POLICY IF EXISTS "Users can view approval history for their organization" ON approval_history;
CREATE POLICY "Users can view approval history for their organization" ON approval_history
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

DROP POLICY IF EXISTS "System can insert approval history" ON approval_history;
CREATE POLICY "System can insert approval history" ON approval_history
    FOR INSERT WITH CHECK (true);

-- RLS Policies for approval_attachments table
DROP POLICY IF EXISTS "Users can view attachments for their organization" ON approval_attachments;
CREATE POLICY "Users can view attachments for their organization" ON approval_attachments
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can upload attachments for their organization" ON approval_attachments;
CREATE POLICY "Users can upload attachments for their organization" ON approval_attachments
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can delete attachments they uploaded" ON approval_attachments;
CREATE POLICY "Users can delete attachments they uploaded" ON approval_attachments
    FOR DELETE USING (
        organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()) AND
        uploaded_by = auth.uid()
    );

-- RLS Policies for approval_notifications table
DROP POLICY IF EXISTS "Users can view their notifications" ON approval_notifications;
CREATE POLICY "Users can view their notifications" ON approval_notifications
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()) AND
        recipient_id = auth.uid()
    );

DROP POLICY IF EXISTS "System can insert notifications" ON approval_notifications;
CREATE POLICY "System can insert notifications" ON approval_notifications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their notifications" ON approval_notifications;
CREATE POLICY "Users can update their notifications" ON approval_notifications
    FOR UPDATE USING (
        organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()) AND
        recipient_id = auth.uid()
    );

-- =====================================================
-- DATABASE FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to create a new approval
CREATE OR REPLACE FUNCTION create_approval(
    p_organization_id UUID,
    p_approval_type approval_type,
    p_title VARCHAR(255),
    p_description TEXT,
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_requested_by UUID,
    p_current_approver_id UUID,
    p_current_approver_role VARCHAR(50),
    p_priority approval_priority DEFAULT 'normal',
    p_due_date TIMESTAMPTZ DEFAULT NULL,
    p_request_reason TEXT DEFAULT NULL,
    p_request_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_approval_id UUID;
BEGIN
    INSERT INTO approvals (
        organization_id,
        approval_type,
        title,
        description,
        entity_type,
        entity_id,
        requested_by,
        current_approver_id,
        current_approver_role,
        priority,
        due_date,
        request_reason,
        request_metadata,
        created_by
    ) VALUES (
        p_organization_id,
        p_approval_type,
        p_title,
        p_description,
        p_entity_type,
        p_entity_id,
        p_requested_by,
        p_current_approver_id,
        p_current_approver_role,
        p_priority,
        p_due_date,
        p_request_reason,
        p_request_metadata,
        p_requested_by
    ) RETURNING id INTO v_approval_id;
    
    -- Log the creation
    INSERT INTO approval_history (
        approval_id,
        organization_id,
        action_type,
        action_by,
        new_status
    ) VALUES (
        v_approval_id,
        p_organization_id,
        'created',
        p_requested_by,
        'pending'
    );
    
    RETURN v_approval_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit an approval decision
CREATE OR REPLACE FUNCTION submit_approval_decision(
    p_approval_id UUID,
    p_decision approval_status,
    p_comments TEXT DEFAULT NULL,
    p_reason TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS BOOLEAN AS $$
DECLARE
    v_old_status approval_status;
    v_organization_id UUID;
    v_current_approver_id UUID;
BEGIN
    -- Get current approval details
    SELECT status, organization_id, current_approver_id
    INTO v_old_status, v_organization_id, v_current_approver_id
    FROM approvals
    WHERE id = p_approval_id;
    
    -- Check if approval exists and user can approve
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Approval not found';
    END IF;
    
    IF v_current_approver_id != auth.uid() THEN
        RAISE EXCEPTION 'User not authorized to approve this request';
    END IF;
    
    IF v_old_status != 'pending' AND v_old_status != 'in_review' THEN
        RAISE EXCEPTION 'Approval is not in a state that can be decided';
    END IF;
    
    -- Update approval
    UPDATE approvals SET
        status = p_decision,
        decision_comments = p_comments,
        decision_reason = p_reason,
        decision_metadata = p_metadata,
        decided_at = NOW(),
        decided_by = auth.uid(),
        updated_at = NOW()
    WHERE id = p_approval_id;
    
    -- Log the decision
    INSERT INTO approval_history (
        approval_id,
        organization_id,
        action_type,
        action_by,
        old_status,
        new_status,
        comments
    ) VALUES (
        p_approval_id,
        v_organization_id,
        CASE 
            WHEN p_decision = 'approved' THEN 'approved'
            WHEN p_decision = 'rejected' THEN 'rejected'
            ELSE 'updated'
        END,
        auth.uid(),
        v_old_status,
        p_decision,
        p_comments
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending approvals for a user
CREATE OR REPLACE FUNCTION get_pending_approvals_for_user(p_user_id UUID)
RETURNS TABLE (
    approval_id UUID,
    approval_type approval_type,
    title VARCHAR(255),
    description TEXT,
    entity_type VARCHAR(50),
    entity_id UUID,
    priority approval_priority,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    requested_by_name VARCHAR(255),
    days_overdue INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.approval_type,
        a.title,
        a.description,
        a.entity_type,
        a.entity_id,
        a.priority,
        a.due_date,
        a.created_at,
        u.name as requested_by_name,
        CASE 
            WHEN a.due_date IS NOT NULL AND a.due_date < NOW() 
            THEN EXTRACT(DAY FROM NOW() - a.due_date)::INTEGER
            ELSE 0
        END as days_overdue
    FROM approvals a
    JOIN users u ON a.requested_by = u.id
    WHERE a.current_approver_id = p_user_id
    AND a.status IN ('pending', 'in_review')
    AND a.organization_id IN (
        SELECT organization_id FROM users WHERE id = p_user_id
    )
    ORDER BY 
        CASE 
            WHEN a.due_date IS NOT NULL AND a.due_date < NOW() THEN 0
            WHEN a.priority = 'critical' THEN 1
            WHEN a.priority = 'urgent' THEN 2
            WHEN a.priority = 'high' THEN 3
            WHEN a.priority = 'normal' THEN 4
            ELSE 5
        END,
        a.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if approval is overdue
CREATE OR REPLACE FUNCTION is_approval_overdue(p_approval_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_due_date TIMESTAMPTZ;
    v_status approval_status;
BEGIN
    SELECT due_date, status
    INTO v_due_date, v_status
    FROM approvals
    WHERE id = p_approval_id;
    
    RETURN v_due_date IS NOT NULL 
           AND v_due_date < NOW() 
           AND v_status IN ('pending', 'in_review');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-expire overdue approvals
CREATE OR REPLACE FUNCTION auto_expire_overdue_approvals()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE approvals 
    SET 
        status = 'expired',
        updated_at = NOW()
    WHERE status IN ('pending', 'in_review')
    AND due_date IS NOT NULL 
    AND due_date < NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    -- Log the expirations
    INSERT INTO approval_history (
        approval_id,
        organization_id,
        action_type,
        action_by,
        old_status,
        new_status,
        comments
    )
    SELECT 
        id,
        organization_id,
        'expired',
        requested_by,
        'pending',
        'expired',
        'Automatically expired due to overdue deadline'
    FROM approvals
    WHERE status = 'expired'
    AND updated_at = NOW();
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_approval_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_approval_updated_at') THEN
        CREATE TRIGGER trigger_update_approval_updated_at
            BEFORE UPDATE ON approvals
            FOR EACH ROW
            EXECUTE FUNCTION update_approval_updated_at();
    END IF;
END $$;

-- Trigger to automatically set expires_at based on due_date
CREATE OR REPLACE FUNCTION set_approval_expires_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.due_date IS NOT NULL AND NEW.expires_at IS NULL THEN
        NEW.expires_at = NEW.due_date + INTERVAL '1 day';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_set_approval_expires_at') THEN
        CREATE TRIGGER trigger_set_approval_expires_at
            BEFORE INSERT OR UPDATE ON approvals
            FOR EACH ROW
            EXECUTE FUNCTION set_approval_expires_at();
    END IF;
END $$;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

-- Add comments to tables and columns
COMMENT ON TABLE approvals IS 'Centralized approval management table for all approval types in the system';
COMMENT ON COLUMN approvals.approval_type IS 'Type of approval (stage transition, document, engineering change, etc.)';
COMMENT ON COLUMN approvals.entity_type IS 'Type of entity being approved (project, document, supplier, etc.)';
COMMENT ON COLUMN approvals.entity_id IS 'ID of the entity being approved';
COMMENT ON COLUMN approvals.step_number IS 'Current step in multi-step approval process';
COMMENT ON COLUMN approvals.total_steps IS 'Total number of steps in approval chain';
COMMENT ON COLUMN approvals.priority IS 'Approval priority level affecting due dates and notifications';
COMMENT ON COLUMN approvals.auto_approval_rules IS 'JSON rules for automatic approval based on conditions';
COMMENT ON COLUMN approvals.decision_metadata IS 'Additional metadata about the approval decision';

COMMENT ON TABLE approval_history IS 'Audit trail for all approval actions and status changes';
COMMENT ON TABLE approval_attachments IS 'Supporting documents and files attached to approvals';
COMMENT ON TABLE approval_notifications IS 'Notification history for approval-related communications';

-- =====================================================
-- SCRIPT COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Centralized Approval System setup completed successfully!';
    RAISE NOTICE 'Created 4 tables: approvals, approval_history, approval_attachments, approval_notifications';
    RAISE NOTICE 'Created 3 enum types: approval_type, approval_status, approval_priority';
    RAISE NOTICE 'Created 15 indexes for performance optimization';
    RAISE NOTICE 'Created 10 RLS policies for data security';
    RAISE NOTICE 'Created 5 database functions for common operations';
    RAISE NOTICE 'Created 2 triggers for automatic updates';
END $$;
