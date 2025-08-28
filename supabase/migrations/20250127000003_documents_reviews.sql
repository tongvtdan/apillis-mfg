-- Migration Script: Create Documents and Reviews Tables
-- This script creates the document management and review system tables
-- Date: 2025-01-27

-- ============================================================================
-- STEP 1: Create documents table
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(50) NOT NULL,
    file_path TEXT,
    file_size BIGINT,
    mime_type VARCHAR(100),
    version VARCHAR(20) DEFAULT '1.0',
    is_latest BOOLEAN DEFAULT true,
    access_level VARCHAR(20) DEFAULT 'internal' 
      CHECK (access_level IN ('internal', 'confidential', 'public')),
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    ai_processing_status VARCHAR(20) DEFAULT 'pending' 
      CHECK (ai_processing_status IN ('pending', 'processing', 'completed', 'failed')),
    ai_processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: Create document_versions table
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    version_number VARCHAR(20) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    change_summary TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, version_number)
);

-- ============================================================================
-- STEP 3: Create document_comments table
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    parent_comment_id UUID REFERENCES document_comments(id),
    content TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: Create document_access_log table
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- ============================================================================
-- STEP 5: Create reviews table
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    reviewer_role VARCHAR(50) NOT NULL,
    review_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' 
      CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 6: Create review_checklist_items table
-- ============================================================================
CREATE TABLE IF NOT EXISTS review_checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    is_checked BOOLEAN DEFAULT false,
    is_required BOOLEAN DEFAULT true,
    checked_by UUID REFERENCES users(id),
    checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 7: Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_documents_is_latest ON documents(is_latest);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_access_level ON documents(access_level);
CREATE INDEX IF NOT EXISTS idx_documents_version ON documents(version);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_ai_processing_status ON documents(ai_processing_status);
CREATE INDEX IF NOT EXISTS idx_documents_ai_processed_at ON documents(ai_processed_at);

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_version_number ON document_versions(version_number);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_at ON document_versions(created_at);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_by ON document_versions(created_by);

CREATE INDEX IF NOT EXISTS idx_document_comments_document_id ON document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_user_id ON document_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_parent_comment_id ON document_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_is_resolved ON document_comments(is_resolved);
CREATE INDEX IF NOT EXISTS idx_document_comments_created_at ON document_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_document_access_log_document_id ON document_access_log(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_user_id ON document_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_action ON document_access_log(action);
CREATE INDEX IF NOT EXISTS idx_document_access_log_accessed_at ON document_access_log(accessed_at);

CREATE INDEX IF NOT EXISTS idx_reviews_organization_id ON reviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_reviews_project_id ON reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_role ON reviews(reviewer_role);
CREATE INDEX IF NOT EXISTS idx_reviews_review_type ON reviews(review_type);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_priority ON reviews(priority);
CREATE INDEX IF NOT EXISTS idx_reviews_due_date ON reviews(due_date);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

CREATE INDEX IF NOT EXISTS idx_review_checklist_items_review_id ON review_checklist_items(review_id);
CREATE INDEX IF NOT EXISTS idx_review_checklist_items_is_checked ON review_checklist_items(is_checked);
CREATE INDEX IF NOT EXISTS idx_review_checklist_items_is_required ON review_checklist_items(is_required);
CREATE INDEX IF NOT EXISTS idx_review_checklist_items_checked_by ON review_checklist_items(checked_by);

-- ============================================================================
-- STEP 8: Enable Row Level Security
-- ============================================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_checklist_items ENABLE ROW LEVEL SECURITY;
