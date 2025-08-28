-- Migration Script: Create Communication and Suppliers Tables
-- This script creates the messaging, notifications, and supplier management tables
-- Date: 2025-01-27

-- ============================================================================
-- STEP 1: Create messages table
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    thread_id UUID,
    sender_id UUID REFERENCES users(id),
    sender_type VARCHAR(20) DEFAULT 'user' 
      CHECK (sender_type IN ('user', 'system', 'bot')),
    sender_contact_id UUID REFERENCES contacts(id),
    recipient_type VARCHAR(20) DEFAULT 'user' 
      CHECK (recipient_type IN ('user', 'contact', 'role', 'department')),
    recipient_id UUID REFERENCES users(id),
    recipient_role VARCHAR(50),
    recipient_department VARCHAR(100),
    message_type VARCHAR(20) DEFAULT 'text' 
      CHECK (message_type IN ('text', 'file', 'image', 'system', 'notification')),
    content TEXT,
    priority VARCHAR(20) DEFAULT 'normal' 
      CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: Create notifications table
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    project_id UUID REFERENCES projects(id),
    priority VARCHAR(20) DEFAULT 'normal' 
      CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    delivery_method VARCHAR(20) DEFAULT 'in_app' 
      CHECK (delivery_method IN ('in_app', 'email', 'sms', 'push')),
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: Create supplier_rfqs table
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplier_rfqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    supplier_id UUID REFERENCES contacts(id),
    rfq_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' 
      CHECK (status IN ('draft', 'sent', 'received', 'evaluated', 'awarded', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' 
      CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    sent_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    requirements TEXT,
    technical_specs TEXT,
    commercial_terms TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: Create supplier_quotes table
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplier_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_rfq_id UUID REFERENCES supplier_rfqs(id) ON DELETE CASCADE,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    total_amount DECIMAL(15,2),
    is_selected BOOLEAN DEFAULT false,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    evaluated_by UUID REFERENCES users(id),
    evaluation_score DECIMAL(5,2),
    valid_until TIMESTAMPTZ,
    technical_evaluation TEXT,
    commercial_evaluation TEXT,
    risk_assessment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 5: Create supplier_qualifications table
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplier_qualifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    qualification_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    tier VARCHAR(20) DEFAULT 'standard' 
      CHECK (tier IN ('premium', 'standard', 'basic', 'restricted')),
    overall_score DECIMAL(5,2),
    next_review_date TIMESTAMPTZ,
    qualified_by UUID REFERENCES users(id),
    qualification_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 6: Create supplier_performance_metrics table
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplier_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    measurement_period VARCHAR(20) NOT NULL,
    period_range VARCHAR(20) NOT NULL,
    project_id UUID REFERENCES projects(id),
    metric_value DECIMAL(10,2),
    target_value DECIMAL(10,2),
    unit VARCHAR(20),
    recorded_by UUID REFERENCES users(id),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 7: Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_messages_organization_id ON messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_type ON messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_type ON messages(recipient_type);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_role ON messages(recipient_role);
CREATE INDEX IF NOT EXISTS idx_messages_message_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_priority ON messages(priority);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_project_id ON notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_delivery_method ON notifications(delivery_method);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_organization_id ON supplier_rfqs(organization_id);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_project_id ON supplier_rfqs(project_id);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_supplier_id ON supplier_rfqs(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_rfq_number ON supplier_rfqs(rfq_number);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_status ON supplier_rfqs(status);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_priority ON supplier_rfqs(priority);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_sent_at ON supplier_rfqs(sent_at);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_due_date ON supplier_rfqs(due_date);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_created_by ON supplier_rfqs(created_by);

CREATE INDEX IF NOT EXISTS idx_supplier_quotes_supplier_rfq_id ON supplier_quotes(supplier_rfq_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_quote_number ON supplier_quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_currency ON supplier_quotes(currency);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_is_selected ON supplier_quotes(is_selected);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_submitted_at ON supplier_quotes(submitted_at);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_evaluated_by ON supplier_quotes(evaluated_by);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_evaluation_score ON supplier_quotes(evaluation_score);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_valid_until ON supplier_quotes(valid_until);

CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_supplier_id ON supplier_qualifications(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_organization_id ON supplier_qualifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_qualification_type ON supplier_qualifications(qualification_type);
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_status ON supplier_qualifications(status);
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_tier ON supplier_qualifications(tier);
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_overall_score ON supplier_qualifications(overall_score);
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_next_review_date ON supplier_qualifications(next_review_date);
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_qualified_by ON supplier_qualifications(qualified_by);

CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_supplier_id ON supplier_performance_metrics(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_organization_id ON supplier_performance_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_metric_type ON supplier_performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_measurement_period ON supplier_performance_metrics(measurement_period);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_period_range ON supplier_performance_metrics(period_range);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_project_id ON supplier_performance_metrics(project_id);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_recorded_by ON supplier_performance_metrics(recorded_by);

-- ============================================================================
-- STEP 8: Enable Row Level Security
-- ============================================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_performance_metrics ENABLE ROW LEVEL SECURITY;
