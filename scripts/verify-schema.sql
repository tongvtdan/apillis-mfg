-- Schema Verification Script for Enhanced Factory Pulse Database
-- Run this script to verify that the enhanced schema was applied correctly

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

\echo 'Factory Pulse Enhanced Schema Verification'
\echo '=========================================='

-- Check if key tables exist
\echo ''
\echo '📋 Checking Core Tables...'
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'organizations', 'users', 'contacts', 'customers', 'projects', 'documents',
            'workflow_stages', 'project_stage_history', 'project_assignments', 
            'document_versions', 'document_comments', 'document_access_log',
            'reviews', 'review_checklist_items', 'supplier_rfqs', 'supplier_quotes',
            'messages', 'notifications', 'activity_log', 'system_events',
            'user_preferences', 'organization_settings', 'email_templates',
            'workflow_stage_transitions', 'workflow_business_rules', 'workflow_rule_executions',
            'approval_chains', 'approval_requests', 'supplier_qualifications',
            'supplier_performance_metrics', 'bom_items', 'ai_processing_queue',
            'ai_model_configs', 'cloud_storage_integrations', 'document_sync_log'
        ) THEN '✅ Created'
        ELSE '⚠️  Other'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY 
    CASE WHEN table_name IN (
        'organizations', 'users', 'contacts', 'customers', 'projects', 'documents',
        'workflow_stages', 'project_stage_history', 'project_assignments', 
        'document_versions', 'document_comments', 'document_access_log',
        'reviews', 'review_checklist_items', 'supplier_rfqs', 'supplier_quotes',
        'messages', 'notifications', 'activity_log', 'system_events',
        'user_preferences', 'organization_settings', 'email_templates',
        'workflow_stage_transitions', 'workflow_business_rules', 'workflow_rule_executions',
        'approval_chains', 'approval_requests', 'supplier_qualifications',
        'supplier_performance_metrics', 'bom_items', 'ai_processing_queue',
        'ai_model_configs', 'cloud_storage_integrations', 'document_sync_log'
    ) THEN 1 ELSE 2 END,
    table_name;

-- Check enhanced project table columns
\echo ''
\echo '🔧 Checking Enhanced Project Columns...'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN (
            'organization_id', 'current_stage_id', 'priority_level', 'priority_score',
            'estimated_delivery_date', 'actual_delivery_date', 'source', 'tags',
            'metadata', 'assigned_to'
        ) THEN '✅ New'
        ELSE '⚠️  Existing'
    END as status
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND table_schema = 'public'
ORDER BY 
    CASE WHEN column_name IN (
        'organization_id', 'current_stage_id', 'priority_level', 'priority_score',
        'estimated_delivery_date', 'actual_delivery_date', 'source', 'tags',
        'metadata', 'assigned_to'
    ) THEN 1 ELSE 2 END,
    ordinal_position;

-- Check enhanced users table columns
\echo ''
\echo '👥 Checking Enhanced Users Columns...'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN (
            'organization_id', 'role', 'department', 'phone', 'avatar_url',
            'is_active', 'last_login_at', 'preferences'
        ) THEN '✅ New'
        ELSE '⚠️  Existing'
    END as status
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY 
    CASE WHEN column_name IN (
        'organization_id', 'role', 'department', 'phone', 'avatar_url',
        'is_active', 'last_login_at', 'preferences'
    ) THEN 1 ELSE 2 END,
    ordinal_position;

-- Check workflow stages data
\echo ''
\echo '🔄 Checking Default Workflow Stages...'
SELECT 
    name,
    slug,
    stage_order,
    color,
    is_active
FROM workflow_stages 
ORDER BY stage_order;

-- Check organizations data
\echo ''
\echo '🏢 Checking Organizations...'
SELECT 
    name,
    slug,
    subscription_plan,
    is_active,
    created_at
FROM organizations;

-- Check table counts
\echo ''
\echo '📊 Table Record Counts...'
SELECT 
    'organizations' as table_name, COUNT(*) as record_count FROM organizations
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'workflow_stages', COUNT(*) FROM workflow_stages
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
ORDER BY table_name;

\echo ''
\echo '✅ Schema verification complete!'
\echo 'If you see any missing tables or columns, please check the migration logs.'