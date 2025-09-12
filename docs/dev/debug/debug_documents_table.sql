-- =========================================
-- Document Debug SQL Script
-- =========================================
-- This script helps debug document saving issues by checking:
-- 1. Table structure and constraints
-- 2. Data integrity and relationships
-- 3. Common issues and missing data
-- 4. Storage bucket configuration
-- =========================================

-- Set up for better output formatting
\set ON_ERROR_STOP on
\pset border 2
\pset format aligned

-- =========================================
-- 1. CHECK TABLE STRUCTURE
-- =========================================

SELECT 'DOCUMENTS TABLE STRUCTURE' as section;

-- Check if documents table exists and show its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'documents' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'documents' 
    AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;

-- =========================================
-- 2. CHECK DATA INTEGRITY
-- =========================================

SELECT 'DATA INTEGRITY CHECKS' as section;

-- Count total documents
SELECT 
    'Total Documents' as metric,
    COUNT(*) as count
FROM documents;

-- Check for missing organization_id
SELECT 
    'Documents Missing Organization ID' as issue,
    COUNT(*) as count
FROM documents 
WHERE organization_id IS NULL;

-- Check for missing uploaded_by
SELECT 
    'Documents Missing Uploaded By' as issue,
    COUNT(*) as count
FROM documents 
WHERE uploaded_by IS NULL;

-- Check for missing file_path
SELECT 
    'Documents Missing File Path' as issue,
    COUNT(*) as count
FROM documents 
WHERE file_path IS NULL OR file_path = '';

-- Check for missing file_name
SELECT 
    'Documents Missing File Name' as issue,
    COUNT(*) as count
FROM documents 
WHERE file_name IS NULL OR file_name = '';

-- Check for invalid file sizes
SELECT 
    'Documents with Invalid File Size' as issue,
    COUNT(*) as count
FROM documents 
WHERE file_size IS NULL OR file_size <= 0;

-- =========================================
-- 3. CHECK FOREIGN KEY RELATIONSHIPS
-- =========================================

SELECT 'FOREIGN KEY RELATIONSHIPS' as section;

-- Check organization relationships
SELECT 
    'Documents with Invalid Organization' as issue,
    COUNT(*) as count
FROM documents d
LEFT JOIN organizations o ON d.organization_id = o.id
WHERE d.organization_id IS NOT NULL 
    AND o.id IS NULL;

-- Check user relationships
SELECT 
    'Documents with Invalid Uploader' as issue,
    COUNT(*) as count
FROM documents d
LEFT JOIN users u ON d.uploaded_by = u.id
WHERE d.uploaded_by IS NOT NULL 
    AND u.id IS NULL;

-- Check project relationships
SELECT 
    'Documents with Invalid Project' as issue,
    COUNT(*) as count
FROM documents d
LEFT JOIN projects p ON d.project_id = p.id
WHERE d.project_id IS NOT NULL 
    AND p.id IS NULL;

-- =========================================
-- 4. CHECK STORAGE BUCKET CONFIGURATION
-- =========================================

SELECT 'STORAGE BUCKET CONFIGURATION' as section;

-- Check if documents bucket exists
SELECT 
    name as bucket_name,
    public as is_public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'documents';

-- Check storage policies for documents bucket
SELECT 
    name as policy_name,
    definition as policy_definition
FROM pg_policies 
WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname LIKE '%documents%';

-- =========================================
-- 5. SAMPLE DATA ANALYSIS
-- =========================================

SELECT 'SAMPLE DATA ANALYSIS' as section;

-- Show recent documents
SELECT 
    'Recent Documents (Last 10)' as info,
    id,
    title,
    file_name,
    file_size,
    mime_type,
    created_at,
    uploaded_by
FROM documents 
ORDER BY created_at DESC 
LIMIT 10;

-- Show documents by category
SELECT 
    'Documents by Category' as info,
    category,
    COUNT(*) as count,
    AVG(file_size) as avg_file_size
FROM documents 
GROUP BY category 
ORDER BY count DESC;

-- Show documents by organization
SELECT 
    'Documents by Organization' as info,
    o.name as organization_name,
    COUNT(d.id) as document_count,
    AVG(d.file_size) as avg_file_size
FROM documents d
JOIN organizations o ON d.organization_id = o.id
GROUP BY o.id, o.name
ORDER BY document_count DESC;

-- =========================================
-- 6. COMMON ISSUES DETECTION
-- =========================================

SELECT 'COMMON ISSUES DETECTION' as section;

-- Check for duplicate file paths
SELECT 
    'Duplicate File Paths' as issue,
    file_path,
    COUNT(*) as count
FROM documents 
GROUP BY file_path 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Check for very large files
SELECT 
    'Very Large Files (>100MB)' as issue,
    id,
    title,
    file_name,
    file_size,
    ROUND(file_size / 1024.0 / 1024.0, 2) as size_mb
FROM documents 
WHERE file_size > 100 * 1024 * 1024
ORDER BY file_size DESC;

-- Check for unusual file types
SELECT 
    'Unusual File Types' as info,
    mime_type,
    COUNT(*) as count
FROM documents 
WHERE mime_type IS NOT NULL
GROUP BY mime_type
ORDER BY count DESC;

-- Check for documents without proper metadata
SELECT 
    'Documents Missing Metadata' as issue,
    COUNT(*) as count
FROM documents 
WHERE metadata IS NULL 
    OR metadata = '{}'::jsonb;

-- =========================================
-- 7. PERFORMANCE ANALYSIS
-- =========================================

SELECT 'PERFORMANCE ANALYSIS' as section;

-- Check table size and statistics
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE tablename = 'documents'
ORDER BY attname;

-- Check for missing indexes
SELECT 
    'Missing Indexes Analysis' as info,
    'Consider adding indexes on frequently queried columns' as recommendation;

-- =========================================
-- 8. RECOMMENDATIONS
-- =========================================

SELECT 'RECOMMENDATIONS' as section;

-- Generate recommendations based on findings
WITH issues AS (
    SELECT 
        CASE 
            WHEN COUNT(*) FILTER (WHERE organization_id IS NULL) > 0 
                THEN 'Fix documents with missing organization_id'
            ELSE NULL
        END as org_issue,
        CASE 
            WHEN COUNT(*) FILTER (WHERE uploaded_by IS NULL) > 0 
                THEN 'Fix documents with missing uploaded_by'
            ELSE NULL
        END as user_issue,
        CASE 
            WHEN COUNT(*) FILTER (WHERE file_path IS NULL OR file_path = '') > 0 
                THEN 'Fix documents with missing file_path'
            ELSE NULL
        END as path_issue
    FROM documents
)
SELECT 
    'Recommendations' as type,
    COALESCE(org_issue, '') as recommendation_1,
    COALESCE(user_issue, '') as recommendation_2,
    COALESCE(path_issue, '') as recommendation_3
FROM issues
WHERE org_issue IS NOT NULL OR user_issue IS NOT NULL OR path_issue IS NOT NULL;

-- =========================================
-- 9. CLEANUP SUGGESTIONS
-- =========================================

SELECT 'CLEANUP SUGGESTIONS' as section;

-- Find orphaned documents (no organization)
SELECT 
    'Orphaned Documents to Clean Up' as action,
    id,
    title,
    file_name,
    created_at
FROM documents 
WHERE organization_id IS NULL
ORDER BY created_at DESC;

-- Find test documents
SELECT 
    'Test Documents to Clean Up' as action,
    id,
    title,
    file_name,
    created_at
FROM documents 
WHERE title ILIKE '%test%' 
    OR file_name ILIKE '%test%'
    OR (metadata->>'debug_script')::boolean = true
ORDER BY created_at DESC;

-- =========================================
-- END OF SCRIPT
-- =========================================

SELECT 'DEBUG SCRIPT COMPLETED' as status;