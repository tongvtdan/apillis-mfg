-- Factory Pulse Communication & Supplier Management Migration
-- Migration: 20250127000004_communication_suppliers.sql
-- Description: Communication system and supplier management tables
-- Date: 2025-01-27

-- 1. Messages (simplified thread model)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    thread_id UUID DEFAULT uuid_generate_v4(), -- All messages in same thread share ID
    sender_id UUID REFERENCES users(id),
    sender_type VARCHAR(20) NOT NULL 
      CHECK (sender_type IN ('user', 'contact', 'system')),
    sender_contact_id UUID REFERENCES contacts(id),
    recipient_type VARCHAR(20) NOT NULL 
      CHECK (recipient_type IN ('user', 'contact', 'department', 'role')),
    recipient_id UUID, -- user_id or contact_id
    recipient_role VARCHAR(50),
    recipient_department VARCHAR(100),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'message' 
      CHECK (message_type IN ('message', 'notification', 'alert', 'reminder', 'system', 'announcement')),
    priority VARCHAR(10) DEFAULT 'normal' 
      CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    project_id UUID REFERENCES projects(id),
    priority VARCHAR(10) DEFAULT 'normal' 
      CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    delivery_method VARCHAR(20) DEFAULT 'in_app' 
      CHECK (delivery_method IN ('in_app', 'email', 'sms', 'push', 'webhook')),
    delivered_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Supplier RFQs
CREATE TABLE supplier_rfqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES contacts(id),
    rfq_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' 
      CHECK (status IN ('draft', 'sent', 'viewed', 'quoted', 'declined', 'expired', 'cancelled')),
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    expected_response_date DATE,
    priority VARCHAR(10) DEFAULT 'medium',
    requirements TEXT,
    special_instructions TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Supplier quotes
CREATE TABLE supplier_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_rfq_id UUID REFERENCES supplier_rfqs(id) ON DELETE CASCADE,
    quote_number VARCHAR(50),
    unit_price DECIMAL(15,4),
    total_price DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'VND' 
      CHECK (currency IN ('USD', 'EUR', 'VND', 'THB', 'MYR', 'IDR', 'PHP', 'CNY', 'JPY', 'KRW', 'SGD', 'AUD', 'CAD', 'GBP')),
    quantity INTEGER,
    lead_time_days INTEGER,
    valid_until DATE,
    payment_terms VARCHAR(100),
    shipping_terms VARCHAR(100),
    notes TEXT,
    quote_file_url TEXT,
    is_selected BOOLEAN DEFAULT false,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    evaluated_at TIMESTAMPTZ,
    evaluated_by UUID REFERENCES users(id),
    evaluation_score INTEGER CHECK (evaluation_score BETWEEN 1 AND 10),
    evaluation_notes TEXT
);

-- 5. Activity log
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    user_id UUID REFERENCES users(id),
    contact_id UUID REFERENCES contacts(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. System events and integrations
CREATE TABLE system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    source VARCHAR(50) NOT NULL, -- 'system', 'api', 'webhook', etc.
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'retrying')),
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_sender_type ON messages(sender_type);
CREATE INDEX idx_messages_sender_contact_id ON messages(sender_contact_id);
CREATE INDEX idx_messages_recipient_type ON messages(recipient_type);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_recipient_role ON messages(recipient_role);
CREATE INDEX idx_messages_recipient_department ON messages(recipient_department);
CREATE INDEX idx_messages_message_type ON messages(message_type);
CREATE INDEX idx_messages_priority ON messages(priority);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_project_id ON notifications(project_id);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_delivery_method ON notifications(delivery_method);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_delivered_at ON notifications(delivered_at);

CREATE INDEX idx_supplier_rfqs_project_id ON supplier_rfqs(project_id);
CREATE INDEX idx_supplier_rfqs_supplier_id ON supplier_rfqs(supplier_id);
CREATE INDEX idx_supplier_rfqs_rfq_number ON supplier_rfqs(rfq_number);
CREATE INDEX idx_supplier_rfqs_status ON supplier_rfqs(status);
CREATE INDEX idx_supplier_rfqs_priority ON supplier_rfqs(priority);
CREATE INDEX idx_supplier_rfqs_sent_at ON supplier_rfqs(sent_at);
CREATE INDEX idx_supplier_rfqs_due_date ON supplier_rfqs(due_date);
CREATE INDEX idx_supplier_rfqs_created_by ON supplier_rfqs(created_by);

CREATE INDEX idx_supplier_quotes_supplier_rfq_id ON supplier_quotes(supplier_rfq_id);
CREATE INDEX idx_supplier_quotes_quote_number ON supplier_quotes(quote_number);
CREATE INDEX idx_supplier_quotes_currency ON supplier_quotes(currency);
CREATE INDEX idx_supplier_quotes_is_selected ON supplier_quotes(is_selected);
CREATE INDEX idx_supplier_quotes_submitted_at ON supplier_quotes(submitted_at);
CREATE INDEX idx_supplier_quotes_evaluated_by ON supplier_quotes(evaluated_by);
CREATE INDEX idx_supplier_quotes_evaluation_score ON supplier_quotes(evaluation_score);
CREATE INDEX idx_supplier_quotes_valid_until ON supplier_quotes(valid_until);

CREATE INDEX idx_activity_log_organization_id ON activity_log(organization_id);
CREATE INDEX idx_activity_log_project_id ON activity_log(project_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_contact_id ON activity_log(contact_id);
CREATE INDEX idx_activity_log_action ON activity_log(action);
CREATE INDEX idx_activity_log_entity_type ON activity_log(entity_type);
CREATE INDEX idx_activity_log_entity_id ON activity_log(entity_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

CREATE INDEX idx_system_events_organization_id ON system_events(organization_id);
CREATE INDEX idx_system_events_event_type ON system_events(event_type);
CREATE INDEX idx_system_events_source ON system_events(source);
CREATE INDEX idx_system_events_status ON system_events(status);
CREATE INDEX idx_system_events_created_at ON system_events(created_at);
CREATE INDEX idx_system_events_processed_at ON system_events(processed_at);

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;

-- Create triggers for automation
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_rfqs_updated_at BEFORE UPDATE ON supplier_rfqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activity logging trigger
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_log (
        organization_id, project_id, user_id, action, entity_type, entity_id, 
        old_values, new_values
    ) VALUES (
        COALESCE(NEW.organization_id, OLD.organization_id),
        COALESCE(NEW.project_id, OLD.project_id),
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) 
             WHEN TG_OP = 'UPDATE' THEN to_jsonb(NEW) 
             ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply activity logging to key tables
CREATE TRIGGER log_projects_activity
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_documents_activity
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_messages_activity
    AFTER INSERT OR UPDATE OR DELETE ON messages
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_notifications_activity
    AFTER INSERT OR UPDATE OR DELETE ON notifications
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_reviews_activity
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_supplier_quotes_activity
    AFTER INSERT OR UPDATE OR DELETE ON supplier_quotes
    FOR EACH ROW EXECUTE FUNCTION log_activity();
