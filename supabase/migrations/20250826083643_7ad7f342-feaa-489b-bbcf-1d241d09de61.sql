-- Add slug field to workflow_stages table
ALTER TABLE workflow_stages ADD COLUMN IF NOT EXISTS slug VARCHAR(50);
ALTER TABLE workflow_stages ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE workflow_stages ADD COLUMN IF NOT EXISTS exit_criteria TEXT;
ALTER TABLE workflow_stages ADD COLUMN IF NOT EXISTS responsible_roles TEXT[] DEFAULT '{}';

-- Update existing workflow stages with slugs
UPDATE workflow_stages SET slug = 'inquiry-received' WHERE name = 'Inquiry Received' AND slug IS NULL;
UPDATE workflow_stages SET slug = 'technical-review' WHERE name = 'Technical Review' AND slug IS NULL;
UPDATE workflow_stages SET slug = 'supplier-rfq-sent' WHERE name = 'Supplier RFQ Sent' AND slug IS NULL;
UPDATE workflow_stages SET slug = 'quoted' WHERE name = 'Quoted' AND slug IS NULL;
UPDATE workflow_stages SET slug = 'order-confirmed' WHERE name = 'Order Confirmed' AND slug IS NULL;
UPDATE workflow_stages SET slug = 'procurement-planning' WHERE name = 'Procurement & Planning' AND slug IS NULL;
UPDATE workflow_stages SET slug = 'in-production' WHERE name = 'In Production' AND slug IS NULL;
UPDATE workflow_stages SET slug = 'shipped-closed' WHERE name = 'Shipped & Closed' AND slug IS NULL;

-- Add new columns to project_documents to match the comprehensive schema
ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS original_file_name VARCHAR(255);
ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);
ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS document_type VARCHAR(50) CHECK (document_type IN (
    'rfq', 'drawing', 'specification', 'quote', 'po', 'invoice', 
    'certificate', 'report', 'bom', 'other'
));
ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS access_level VARCHAR(20) DEFAULT 'internal' CHECK (access_level IN (
    'public', 'customer', 'supplier', 'internal', 'restricted'
));
ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS checksum VARCHAR(64);
ALTER TABLE project_documents ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Update existing documents with default values
UPDATE project_documents SET original_file_name = filename WHERE original_file_name IS NULL;
UPDATE project_documents SET document_type = 'other' WHERE document_type IS NULL;

-- Create document_comments table
CREATE TABLE IF NOT EXISTS document_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES project_documents(id) ON DELETE CASCADE,
    user_id UUID,
    comment TEXT NOT NULL,
    page_number INTEGER,
    coordinates JSONB,
    is_resolved BOOLEAN DEFAULT false,
    parent_comment_id UUID REFERENCES document_comments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_access_log table
CREATE TABLE IF NOT EXISTS document_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES project_documents(id) ON DELETE CASCADE,
    user_id UUID,
    action VARCHAR(20) NOT NULL CHECK (action IN ('view', 'download', 'upload', 'delete', 'share')),
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for project communication
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    thread_id UUID,
    sender_id UUID,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'contact', 'system')),
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('user', 'contact', 'department', 'role')),
    recipient_id UUID,
    recipient_role VARCHAR(50),
    recipient_department VARCHAR(100),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'message' CHECK (message_type IN (
        'message', 'notification', 'alert', 'reminder', 'system'
    )),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    project_id UUID REFERENCES projects(id),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    delivery_method VARCHAR(20) DEFAULT 'in_app' CHECK (delivery_method IN (
        'in_app', 'email', 'sms', 'push'
    )),
    delivered_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create supplier_rfqs table
CREATE TABLE IF NOT EXISTS supplier_rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    rfq_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
        'draft', 'sent', 'viewed', 'quoted', 'declined', 'expired', 'cancelled'
    )),
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    expected_response_date DATE,
    priority VARCHAR(10) DEFAULT 'medium',
    requirements TEXT,
    special_instructions TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create supplier_quotes table
CREATE TABLE IF NOT EXISTS supplier_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_rfq_id UUID REFERENCES supplier_rfqs(id) ON DELETE CASCADE,
    quote_number VARCHAR(50),
    unit_price DECIMAL(15,4),
    total_price DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    quantity INTEGER,
    lead_time_days INTEGER,
    valid_until DATE,
    payment_terms VARCHAR(100),
    shipping_terms VARCHAR(100),
    notes TEXT,
    quote_file_url TEXT,
    is_selected BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    evaluated_at TIMESTAMP WITH TIME ZONE,
    evaluated_by UUID,
    evaluation_score INTEGER CHECK (evaluation_score >= 1 AND evaluation_score <= 10),
    evaluation_notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_comments_document_id ON document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_document_id ON document_access_log(document_id);
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_project_id ON supplier_rfqs(project_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_supplier_rfq_id ON supplier_quotes(supplier_rfq_id);

-- Enable RLS on new tables
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_quotes ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_comments
CREATE POLICY "Users can view comments for accessible documents" 
ON document_comments FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM project_documents pd 
    JOIN projects p ON pd.project_id = p.id 
    WHERE pd.id = document_comments.document_id 
    AND (has_role(auth.uid(), 'Management'::user_role) OR has_role(auth.uid(), 'Procurement'::user_role) OR has_role(auth.uid(), 'Engineering'::user_role) OR p.assignee_id = auth.uid())
));

CREATE POLICY "Users can create comments on accessible documents" 
ON document_comments FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM project_documents pd 
    JOIN projects p ON pd.project_id = p.id 
    WHERE pd.id = document_comments.document_id 
    AND (has_role(auth.uid(), 'Management'::user_role) OR has_role(auth.uid(), 'Procurement'::user_role) OR has_role(auth.uid(), 'Engineering'::user_role) OR p.assignee_id = auth.uid())
));

-- RLS policies for messages
CREATE POLICY "Users can view messages for accessible projects" 
ON messages FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = messages.project_id 
    AND (has_role(auth.uid(), 'Management'::user_role) OR has_role(auth.uid(), 'Procurement'::user_role) OR has_role(auth.uid(), 'Engineering'::user_role) OR p.assignee_id = auth.uid())
));

CREATE POLICY "Users can create messages for accessible projects" 
ON messages FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = messages.project_id 
    AND (has_role(auth.uid(), 'Management'::user_role) OR has_role(auth.uid(), 'Procurement'::user_role) OR has_role(auth.uid(), 'Engineering'::user_role) OR p.assignee_id = auth.uid())
));

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" 
ON notifications FOR INSERT 
WITH CHECK (true);

-- RLS policies for supplier_rfqs
CREATE POLICY "Users can view supplier RFQs for accessible projects" 
ON supplier_rfqs FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = supplier_rfqs.project_id 
    AND (has_role(auth.uid(), 'Management'::user_role) OR has_role(auth.uid(), 'Procurement'::user_role) OR has_role(auth.uid(), 'Engineering'::user_role))
));

CREATE POLICY "Procurement can manage supplier RFQs" 
ON supplier_rfqs FOR ALL 
USING (has_role(auth.uid(), 'Management'::user_role) OR has_role(auth.uid(), 'Procurement'::user_role));

-- RLS policies for supplier_quotes
CREATE POLICY "Users can view supplier quotes for accessible RFQs" 
ON supplier_quotes FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM supplier_rfqs sr 
    JOIN projects p ON sr.project_id = p.id 
    WHERE sr.id = supplier_quotes.supplier_rfq_id 
    AND (has_role(auth.uid(), 'Management'::user_role) OR has_role(auth.uid(), 'Procurement'::user_role) OR has_role(auth.uid(), 'Engineering'::user_role))
));

CREATE POLICY "Procurement can manage supplier quotes" 
ON supplier_quotes FOR ALL 
USING (has_role(auth.uid(), 'Management'::user_role) OR has_role(auth.uid(), 'Procurement'::user_role));