-- =========================================
-- Document Access Security Enhancement
-- Migration: Implement secure document access patterns
-- =========================================

-- Create a function to verify document access permissions
CREATE OR REPLACE FUNCTION verify_document_access(
    document_org_id uuid,
    document_project_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_org_id uuid;
    user_id uuid;
BEGIN
    -- Get current user info
    user_id := auth.uid();
    IF user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Get user's organization
    SELECT organization_id INTO user_org_id 
    FROM public.users 
    WHERE id = user_id;
    
    -- User must be in the same organization as the document
    IF user_org_id != document_org_id THEN
        RETURN false;
    END IF;
    
    -- Additional checks can be added here for project-specific access
    -- For now, organization-level access is sufficient
    
    RETURN true;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION verify_document_access(uuid, uuid) TO authenticated;

-- Create a view for secure document access
CREATE OR REPLACE VIEW secure_documents AS
SELECT 
    d.*,
    CASE 
        WHEN verify_document_access(d.organization_id, d.project_id) 
        THEN true 
        ELSE false 
    END as user_can_access
FROM public.documents d;

-- Grant access to the view
GRANT SELECT ON secure_documents TO authenticated;

-- Create a function to get document download URL (for private storage)
CREATE OR REPLACE FUNCTION get_secure_document_url(
    document_id uuid,
    expires_in integer DEFAULT 3600
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    doc_record record;
    signed_url text;
BEGIN
    -- Get document record
    SELECT * INTO doc_record 
    FROM public.documents 
    WHERE id = document_id;
    
    -- Check if document exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Document not found: %', document_id;
    END IF;
    
    -- Verify user has access
    IF NOT verify_document_access(doc_record.organization_id, doc_record.project_id) THEN
        RAISE EXCEPTION 'Access denied to document: %', document_id;
    END IF;
    
    -- Return the file path - frontend will use Supabase client to get signed URL
    RETURN doc_record.file_path;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_secure_document_url(uuid, integer) TO authenticated;

-- Add a comment explaining the security model
COMMENT ON FUNCTION verify_document_access IS 'Verifies that the current user has access to a document based on organization membership';
COMMENT ON FUNCTION get_secure_document_url IS 'Returns the file path for a document if the user has access. Frontend should use Supabase client to get signed URLs for private storage';
COMMENT ON VIEW secure_documents IS 'Provides secure access to documents with access verification';
