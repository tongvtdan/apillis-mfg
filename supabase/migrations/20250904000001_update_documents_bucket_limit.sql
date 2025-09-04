-- =====================================================
-- Update Documents Bucket File Size Limit
-- Date: September 4, 2025
-- =====================================================

-- Update the documents bucket file size limit to 10MB
UPDATE storage.buckets 
SET file_size_limit = 10485760  -- 10MB in bytes
WHERE id = 'documents';

-- Verify the update
SELECT id, name, file_size_limit, 
       CASE 
         WHEN file_size_limit = 10485760 THEN '10MB'
         WHEN file_size_limit = 52428800 THEN '50MB'
         WHEN file_size_limit = 104857600 THEN '100MB'
         ELSE CONCAT(ROUND(file_size_limit / 1024 / 1024, 2), 'MB')
       END as size_limit_readable
FROM storage.buckets 
WHERE id = 'documents';
