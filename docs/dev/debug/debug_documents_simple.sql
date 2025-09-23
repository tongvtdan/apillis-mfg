-- Simple debug script to check documents table
-- Check if there are any documents and their organization_id vs project_id

-- Check total documents
SELECT
    'Total Documents' as metric,
    COUNT(*) as count
FROM documents;

-- Check documents by organization
SELECT
    'Documents by Organization' as info,
    organization_id,
    project_id,
    COUNT(*) as count
FROM documents
GROUP BY organization_id, project_id
ORDER BY count DESC;

-- Check recent documents (last 50)
SELECT
    'Recent Documents' as info,
    id,
    title,
    file_name,
    organization_id,
    project_id,
    uploaded_by,
    created_at,
    file_size
FROM documents
ORDER BY created_at DESC
LIMIT 50;

-- Check for mismatched organization IDs
SELECT
    'Documents with potential organization mismatch' as issue,
    d.id,
    d.title,
    d.organization_id as doc_org_id,
    p.organization_id as project_org_id,
    d.project_id,
    d.uploaded_by,
    d.created_at
FROM documents d
LEFT JOIN projects p ON d.project_id = p.id
WHERE d.organization_id != p.organization_id
   OR p.organization_id IS NULL
   OR d.organization_id IS NULL;
