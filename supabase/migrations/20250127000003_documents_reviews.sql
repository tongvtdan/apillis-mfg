-- Factory Pulse Documents & Reviews Migration
-- Migration: 20250127000003_documents_reviews.sql
-- Description: Document management and review system tables
-- Date: 2025-01-27

-- 1. Documents with version control
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    is_latest BOOLEAN DEFAULT true,
    document_type VARCHAR(50) 
      CHECK (document_type IN ('rfq', 'drawing', 'specification', 'quote', 'po', 'invoice', 'certificate', 'report', 'bom', 'other')),
    access_level VARCHAR(20) DEFAULT 'internal' 
      CHECK (access_level IN ('public', 'customer', 'supplier', 'internal', 'restricted')),
    checksum VARCHAR(64),
    metadata JSONB DEFAULT '{}',
    storage_provider VARCHAR(50) DEFAULT 'supabase' 
      CHECK (storage_provider IN ('supabase', 'google_drive', 'dropbox', 'onedrive', 's3', 'azure_blob')),
    external_id VARCHAR(255),
    external_url TEXT,
    sync_status VARCHAR(20) DEFAULT 'synced' 
      CHECK (sync_status IN ('synced', 'pending', 'failed', 'conflict')),
    last_synced_at TIMESTAMPTZ,
    ai_extracted_data JSONB DEFAULT '{}',
    ai_processing_status VARCHAR(20) DEFAULT 'pending' 
      CHECK (ai_processing_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    ai_confidence_score DECIMAL(5,2),
    ai_processed_at TIMESTAMPTZ,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id)
);

-- 2. Document versions (improved from parent-child)
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    change_description TEXT,
    metadata JSONB DEFAULT '{}',
    UNIQUE(document_id, version_number)
);

-- 3. Document comments
CREATE TABLE document_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    comment TEXT NOT NULL,
    page_number INTEGER,
    coordinates JSONB,
    is_resolved BOOLEAN DEFAULT false,
    parent_comment_id UUID REFERENCES document_comments(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Document access log
CREATE TABLE document_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(20) NOT NULL 
      CHECK (action IN ('view', 'download', 'upload', 'delete', 'share', 'comment', 'approve')),
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Internal reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
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

-- 6. Review checklist items
CREATE TABLE review_checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    is_checked BOOLEAN DEFAULT false,
    is_required BOOLEAN DEFAULT true,
    notes TEXT,
    checked_by UUID REFERENCES users(id),
    checked_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);
CREATE INDEX idx_documents_is_latest ON documents(is_latest);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_access_level ON documents(access_level);
CREATE INDEX idx_documents_version ON documents(version);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_ai_processing_status ON documents(ai_processing_status);
CREATE INDEX idx_documents_ai_processed_at ON documents(ai_processed_at);

CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_versions_version_number ON document_versions(version_number);
CREATE INDEX idx_document_versions_created_at ON document_versions(created_at);
CREATE INDEX idx_document_versions_created_by ON document_versions(created_by);

CREATE INDEX idx_document_comments_document_id ON document_comments(document_id);
CREATE INDEX idx_document_comments_user_id ON document_comments(user_id);
CREATE INDEX idx_document_comments_parent_comment_id ON document_comments(parent_comment_id);
CREATE INDEX idx_document_comments_is_resolved ON document_comments(is_resolved);
CREATE INDEX idx_document_comments_created_at ON document_comments(created_at);

CREATE INDEX idx_document_access_log_document_id ON document_access_log(document_id);
CREATE INDEX idx_document_access_log_user_id ON document_access_log(user_id);
CREATE INDEX idx_document_access_log_action ON document_access_log(action);
CREATE INDEX idx_document_access_log_accessed_at ON document_access_log(accessed_at);

CREATE INDEX idx_reviews_project_id ON reviews(project_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewer_role ON reviews(reviewer_role);
CREATE INDEX idx_reviews_review_type ON reviews(review_type);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_priority ON reviews(priority);
CREATE INDEX idx_reviews_due_date ON reviews(due_date);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_reviews_reviewed_at ON reviews(reviewed_at);

CREATE INDEX idx_review_checklist_items_review_id ON review_checklist_items(review_id);
CREATE INDEX idx_review_checklist_items_is_checked ON review_checklist_items(is_checked);
CREATE INDEX idx_review_checklist_items_is_required ON review_checklist_items(is_required);
CREATE INDEX idx_review_checklist_items_checked_by ON review_checklist_items(checked_by);

-- Enable Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_checklist_items ENABLE ROW LEVEL SECURITY;

-- Create triggers for automation
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_comments_updated_at BEFORE UPDATE ON document_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Handle document versioning trigger
CREATE OR REPLACE FUNCTION handle_document_version_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Set previous version to not latest when new version is uploaded
    IF NEW.version > 1 THEN
        UPDATE documents 
        SET is_latest = false 
        WHERE id = NEW.id AND version < NEW.version;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_document_version_trigger
    AFTER INSERT ON documents
    FOR EACH ROW EXECUTE FUNCTION handle_document_version_trigger();
