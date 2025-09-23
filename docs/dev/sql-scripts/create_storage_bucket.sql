-- =========================================
-- Create Storage Bucket for Documents
-- =========================================
-- This script creates the 'documents' storage bucket needed for file uploads
-- Run this in your Supabase SQL Editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    false,
    104857600, -- 100MB
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
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the documents bucket
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to view their own files
CREATE POLICY "Allow authenticated users to view documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated users to update documents" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated users to delete documents" ON storage.objects
FOR DELETE USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
);

-- Verify the bucket was created
SELECT
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id = 'documents';

SELECT 'Storage bucket setup completed' as status;
