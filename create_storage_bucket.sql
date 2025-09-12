-- =========================================
-- Create Storage Bucket for Documents
-- =========================================
-- This script creates the required storage bucket for document uploads
-- Run this in your Supabase SQL Editor or via psql

-- Create the documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents', 
    false, -- Not public by default
    104857600, -- 100MB file size limit
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create RLS policies for the documents bucket
-- Policy for authenticated users to upload files
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Policy for authenticated users to view files
CREATE POLICY "Authenticated users can view documents" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'documents');

-- Policy for authenticated users to update files
CREATE POLICY "Authenticated users can update documents" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'documents');

-- Policy for authenticated users to delete files
CREATE POLICY "Authenticated users can delete documents" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'documents');

-- Verify the bucket was created
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'documents';

-- Check policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname LIKE '%documents%';

SELECT 'Storage bucket setup completed' as status;
