

-- =====================================================
-- Enhanced Document Management for Links and Google Drive
-- Date: September 3, 2025
-- =====================================================

-- Add missing columns to documents table for external storage support
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS external_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS storage_provider VARCHAR(50) DEFAULT 'supabase' 
  CHECK (storage_provider IN ('supabase', 'google_drive', 'dropbox', 'onedrive', 's3', 'azure_blob')),
ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'synced' 
  CHECK (sync_status IN ('synced', 'pending', 'failed', 'conflict')),
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_extracted_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_processing_status VARCHAR(20) DEFAULT 'pending' 
  CHECK (ai_processing_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
ADD COLUMN IF NOT EXISTS ai_confidence_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS ai_processed_at TIMESTAMPTZ;

-- Add new fields to documents table for better link support
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS link_type VARCHAR(50) DEFAULT 'file' 
  CHECK (link_type IN ('file', 'folder', 'shared_link', 'embed')),
ADD COLUMN IF NOT EXISTS link_permissions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS link_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS link_access_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS link_last_accessed TIMESTAMPTZ;

-- Add index for link-based queries
CREATE INDEX IF NOT EXISTS idx_documents_link_type ON documents(link_type);
CREATE INDEX IF NOT EXISTS idx_documents_external_id ON documents(external_id);
CREATE INDEX IF NOT EXISTS idx_documents_sync_status ON documents(sync_status);

-- Create document access log table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(20) NOT NULL 
      CHECK (action IN ('view', 'download', 'upload', 'delete', 'share', 'comment', 'approve')),
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on document_access_log table
ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_access_log
CREATE POLICY "Users can view their own document access logs" ON document_access_log
  FOR SELECT USING (
    user_id = auth.uid() OR
    document_id IN (
      SELECT id FROM documents 
      WHERE organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert document access logs" ON document_access_log
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- Create Google Drive OAuth configuration table
CREATE TABLE IF NOT EXISTS google_drive_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id VARCHAR(255) NOT NULL,
    client_secret VARCHAR(255) NOT NULL,
    redirect_uri VARCHAR(255) NOT NULL,
    scopes TEXT[] DEFAULT ARRAY['https://www.googleapis.com/auth/drive.readonly'],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id)
);

-- Create Google Drive tokens table for user authentication
CREATE TABLE IF NOT EXISTS google_drive_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    expires_at TIMESTAMPTZ NOT NULL,
    scope TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- Enable RLS on new tables
ALTER TABLE google_drive_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_drive_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for google_drive_config
CREATE POLICY "Users can view Google Drive config for their organization" ON google_drive_config
  FOR SELECT USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage Google Drive config for their organization" ON google_drive_config
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS policies for google_drive_tokens
CREATE POLICY "Users can manage their own Google Drive tokens" ON google_drive_tokens
  FOR ALL USING (
    user_id = auth.uid() AND
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Create function to update document link access count
CREATE OR REPLACE FUNCTION update_document_link_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Update access count and last accessed time
    UPDATE documents 
    SET 
        link_access_count = link_access_count + 1,
        link_last_accessed = NOW()
    WHERE id = NEW.document_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for document access logging
CREATE TRIGGER document_link_access_trigger
    AFTER INSERT ON document_access_log
    FOR EACH ROW
    WHEN (NEW.action IN ('view', 'download'))
    EXECUTE FUNCTION update_document_link_access();

-- Add comments for documentation
COMMENT ON TABLE google_drive_config IS 'Configuration for Google Drive OAuth integration per organization';
COMMENT ON TABLE google_drive_tokens IS 'User Google Drive OAuth tokens for API access';
COMMENT ON COLUMN documents.link_type IS 'Type of link: file, folder, shared_link, or embed';
COMMENT ON COLUMN documents.link_permissions IS 'JSON object containing link permissions and access controls';
COMMENT ON COLUMN documents.link_expires_at IS 'Expiration date for temporary links';
COMMENT ON COLUMN documents.link_access_count IS 'Number of times the link has been accessed';
COMMENT ON COLUMN documents.link_last_accessed IS 'Last time the link was accessed';
