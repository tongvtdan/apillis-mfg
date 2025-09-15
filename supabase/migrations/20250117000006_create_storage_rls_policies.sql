-- =========================================
-- Create Storage RLS Policies
-- Migration: Set up RLS policies for storage.objects table
-- =========================================

-- Enable RLS on storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for storage.objects table
-- Allow authenticated users to upload files to their organization's folder
CREATE POLICY "storage_objects_insert_policy"
ON storage.objects
FOR INSERT 
WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = 'suppliers'
);

-- Allow authenticated users to view files in their organization's folder
CREATE POLICY "storage_objects_select_policy"
ON storage.objects
FOR SELECT 
USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = 'suppliers'
);

-- Allow authenticated users to update files in their organization's folder
CREATE POLICY "storage_objects_update_policy"
ON storage.objects
FOR UPDATE 
USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = 'suppliers'
)
WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = 'suppliers'
);

-- Allow authenticated users to delete files in their organization's folder
CREATE POLICY "storage_objects_delete_policy"
ON storage.objects
FOR DELETE 
USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = 'suppliers'
);
