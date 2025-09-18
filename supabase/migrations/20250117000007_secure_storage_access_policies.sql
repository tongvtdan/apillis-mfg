-- =========================================
-- Secure Storage Access Policies
-- Migration: Implement proper RLS policies for private document storage
-- =========================================

-- Ensure RLS is enabled on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start clean
DROP POLICY IF EXISTS "storage_objects_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_objects_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_objects_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_objects_delete_policy" ON storage.objects;

-- Create secure policies for storage.objects table
-- Only allow authenticated users to access documents from their organization

-- SELECT policy: Users can view files from their organization
CREATE POLICY "storage_objects_select_policy"
ON storage.objects
FOR SELECT 
USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.organization_id::text = (storage.foldername(name))[1]
    )
);

-- INSERT policy: Users can upload files to their organization's folder
CREATE POLICY "storage_objects_insert_policy"
ON storage.objects
FOR INSERT 
WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.organization_id::text = (storage.foldername(name))[1]
    )
);

-- UPDATE policy: Users can update files in their organization's folder
CREATE POLICY "storage_objects_update_policy"
ON storage.objects
FOR UPDATE 
USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.organization_id::text = (storage.foldername(name))[1]
    )
)
WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.organization_id::text = (storage.foldername(name))[1]
    )
);

-- DELETE policy: Users can delete files from their organization's folder
CREATE POLICY "storage_objects_delete_policy"
ON storage.objects
FOR DELETE 
USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.organization_id::text = (storage.foldername(name))[1]
    )
);

-- Create a function to get signed URLs for private documents
CREATE OR REPLACE FUNCTION get_document_url(file_path text, expires_in integer DEFAULT 3600)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    signed_url text;
BEGIN
    -- Verify user has access to this file
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.organization_id::text = (storage.foldername(file_path))[1]
    ) THEN
        RAISE EXCEPTION 'Access denied to file: %', file_path;
    END IF;
    
    -- Generate signed URL (this would need to be implemented with actual Supabase storage API)
    -- For now, return the file path - the frontend will need to use Supabase client to get signed URLs
    RETURN file_path;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_document_url(text, integer) TO authenticated;
