-- =====================================================
-- Document Versions System Migration
-- Date: September 2, 2025
-- =====================================================

-- Create document_versions table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    change_summary TEXT,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    is_current BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_document_version UNIQUE(document_id, version_number),
    CONSTRAINT positive_version_number CHECK (version_number > 0),
    CONSTRAINT positive_file_size CHECK (file_size >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_version_number ON document_versions(document_id, version_number);
CREATE INDEX IF NOT EXISTS idx_document_versions_is_current ON document_versions(document_id, is_current);
CREATE INDEX IF NOT EXISTS idx_document_versions_uploaded_by ON document_versions(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_document_versions_uploaded_at ON document_versions(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_document_versions_organization ON document_versions(organization_id);

-- Enable Row Level Security
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_versions table
DROP POLICY IF EXISTS "Users can view document versions for their organization" ON document_versions;
CREATE POLICY "Users can view document versions for their organization" ON document_versions
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can create document versions for their organization" ON document_versions;
CREATE POLICY "Users can create document versions for their organization" ON document_versions
    FOR INSERT WITH CHECK (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

DROP POLICY IF EXISTS "Users can update document versions they uploaded" ON document_versions;
CREATE POLICY "Users can update document versions they uploaded" ON document_versions
    FOR UPDATE USING (
        organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()) AND
        uploaded_by = auth.uid()
    );

DROP POLICY IF EXISTS "Users can delete document versions they uploaded" ON document_versions;
CREATE POLICY "Users can delete document versions they uploaded" ON document_versions
    FOR DELETE USING (
        organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()) AND
        uploaded_by = auth.uid()
    );

-- Add version column to documents table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'documents' AND column_name = 'version') THEN
        ALTER TABLE documents ADD COLUMN version INTEGER DEFAULT 1;
    END IF;
END $$;

-- Add is_current_version column to documents table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'documents' AND column_name = 'is_current_version') THEN
        ALTER TABLE documents ADD COLUMN is_current_version BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Function to automatically create initial version when document is created
CREATE OR REPLACE FUNCTION create_initial_document_version()
RETURNS TRIGGER AS $$
DECLARE
    v_version_id UUID;
BEGIN
    -- Create initial version record
    INSERT INTO document_versions (
        organization_id,
        document_id,
        version_number,
        file_name,
        file_path,
        file_size,
        mime_type,
        title,
        description,
        uploaded_by,
        is_current,
        metadata
    ) VALUES (
        NEW.organization_id,
        NEW.id,
        COALESCE(NEW.version, 1),
        NEW.file_name,
        NEW.file_path,
        COALESCE(NEW.file_size, 0),
        NEW.file_type,
        NEW.title,
        NEW.description,
        NEW.uploaded_by,
        true,
        COALESCE(NEW.metadata, '{}')
    ) RETURNING id INTO v_version_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create initial version
DROP TRIGGER IF EXISTS trigger_create_initial_document_version ON documents;
CREATE TRIGGER trigger_create_initial_document_version
    AFTER INSERT ON documents
    FOR EACH ROW
    EXECUTE FUNCTION create_initial_document_version();

-- Function to update document when version changes
CREATE OR REPLACE FUNCTION update_document_on_version_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If this version is being set as current, update the main document record
    IF NEW.is_current = true AND (OLD.is_current IS NULL OR OLD.is_current = false) THEN
        -- Update the main document record
        UPDATE documents SET
            file_name = NEW.file_name,
            file_path = NEW.file_path,
            file_size = NEW.file_size,
            file_type = NEW.mime_type,
            version = NEW.version_number,
            is_current_version = true,
            updated_at = NOW()
        WHERE id = NEW.document_id;
        
        -- Ensure only one version is marked as current
        UPDATE document_versions SET
            is_current = false
        WHERE document_id = NEW.document_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for version changes
DROP TRIGGER IF EXISTS trigger_update_document_on_version_change ON document_versions;
CREATE TRIGGER trigger_update_document_on_version_change
    AFTER UPDATE ON document_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_document_on_version_change();

-- Function to get document version history
CREATE OR REPLACE FUNCTION get_document_version_history(p_document_id UUID)
RETURNS TABLE (
    version_id UUID,
    version_number INTEGER,
    file_name VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    title VARCHAR(255),
    description TEXT,
    change_summary TEXT,
    uploaded_by UUID,
    uploader_name VARCHAR(255),
    uploader_email VARCHAR(255),
    uploaded_at TIMESTAMPTZ,
    is_current BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dv.id,
        dv.version_number,
        dv.file_name,
        dv.file_size,
        dv.mime_type,
        dv.title,
        dv.description,
        dv.change_summary,
        dv.uploaded_by,
        u.name as uploader_name,
        u.email as uploader_email,
        dv.uploaded_at,
        dv.is_current
    FROM document_versions dv
    LEFT JOIN users u ON dv.uploaded_by = u.id
    WHERE dv.document_id = p_document_id
    ORDER BY dv.version_number DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old document versions (keep only N latest)
CREATE OR REPLACE FUNCTION cleanup_old_document_versions(
    p_document_id UUID,
    p_keep_versions INTEGER DEFAULT 10
) RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Delete old versions, keeping the specified number of latest versions
    -- Always keep the current version regardless of the limit
    WITH versions_to_keep AS (
        SELECT id
        FROM document_versions
        WHERE document_id = p_document_id
        AND (
            is_current = true OR
            id IN (
                SELECT id
                FROM document_versions
                WHERE document_id = p_document_id
                ORDER BY version_number DESC
                LIMIT p_keep_versions
            )
        )
    )
    DELETE FROM document_versions
    WHERE document_id = p_document_id
    AND id NOT IN (SELECT id FROM versions_to_keep);
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE document_versions IS 'Version history for documents with file tracking and metadata';
COMMENT ON COLUMN document_versions.version_number IS 'Sequential version number starting from 1';
COMMENT ON COLUMN document_versions.is_current IS 'Whether this is the current active version';
COMMENT ON COLUMN document_versions.change_summary IS 'Summary of changes made in this version';
COMMENT ON COLUMN document_versions.metadata IS 'Additional version-specific metadata';

COMMENT ON FUNCTION create_initial_document_version() IS 'Automatically creates initial version record when document is created';
COMMENT ON FUNCTION update_document_on_version_change() IS 'Updates main document record when version is changed';
COMMENT ON FUNCTION get_document_version_history(UUID) IS 'Returns complete version history for a document';
COMMENT ON FUNCTION cleanup_old_document_versions(UUID, INTEGER) IS 'Removes old document versions keeping only the specified number of latest versions';

-- Create initial versions for existing documents (if any)
DO $$
DECLARE
    doc_record RECORD;
BEGIN
    -- Only create initial versions for documents that don't have any versions yet
    FOR doc_record IN 
        SELECT d.* 
        FROM documents d
        LEFT JOIN document_versions dv ON d.id = dv.document_id
        WHERE dv.document_id IS NULL
    LOOP
        INSERT INTO document_versions (
            organization_id,
            document_id,
            version_number,
            file_name,
            file_path,
            file_size,
            mime_type,
            title,
            description,
            uploaded_by,
            is_current,
            metadata
        ) VALUES (
            doc_record.organization_id,
            doc_record.id,
            COALESCE(doc_record.version, 1),
            doc_record.file_name,
            doc_record.file_path,
            COALESCE(doc_record.file_size, 0),
            doc_record.file_type,
            doc_record.title,
            doc_record.description,
            doc_record.uploaded_by,
            true,
            COALESCE(doc_record.metadata, '{}')
        );
    END LOOP;
END $$;