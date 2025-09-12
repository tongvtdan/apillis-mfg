-- =========================================
-- Fix Storage Provider for Existing Documents
-- =========================================
-- This script updates existing documents to have the correct storage_provider
-- Run this in your Supabase SQL Editor or via psql

-- Update documents that have file_path but missing or incorrect storage_provider
UPDATE documents 
SET storage_provider = 'supabase'
WHERE file_path IS NOT NULL 
  AND (storage_provider IS NULL OR storage_provider = 'local');

-- Verify the update
SELECT 
    id,
    title,
    file_name,
    file_path,
    storage_provider,
    mime_type,
    created_at
FROM documents 
WHERE file_path IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Show count of updated documents
SELECT 
    storage_provider,
    COUNT(*) as count
FROM documents 
GROUP BY storage_provider;

SELECT 'Storage provider fix completed' as status;
