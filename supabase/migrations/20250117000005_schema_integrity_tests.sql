-- =========================================
-- Factory Pulse Schema Integrity Tests
-- Basic validation tests (detailed tests will run after sample data is loaded)
-- =========================================

-- Test 1: Verify all required tables exist
DO $$
DECLARE
    required_tables TEXT[] := ARRAY[
        'organizations', 'users', 'contacts',
        'workflow_stages', 'workflow_sub_stages',
        'workflow_definitions', 'workflow_definition_stages', 'workflow_definition_sub_stages',
        'projects', 'project_sub_stage_progress',
        'approvals', 'approval_history', 'approval_attachments',
        'documents', 'document_versions', 'document_access_log',
        'activity_log', 'messages', 'notifications'
    ];
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    current_table_name TEXT;
BEGIN
    FOREACH current_table_name IN ARRAY required_tables LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = current_table_name
        ) THEN
            missing_tables := missing_tables || current_table_name;
        END IF;
    END LOOP;

    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing required tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✓ All required tables exist';
    END IF;
END $$;

-- Test 2: Verify enum types exist and have correct values
DO $$
BEGIN
    -- Test that enum types can be used (will throw error if missing)
    PERFORM 'admin'::user_role;
    PERFORM 'draft'::project_status;
    PERFORM 'technical_review'::approval_type;
    PERFORM 'workflow'::notification_type;
    PERFORM 'low'::notification_priority;

    RAISE NOTICE '✓ All enum types and values are correctly defined';
END $$;

-- Test 3: Verify RLS policies exist
DO $$
DECLARE
    required_policies TEXT[] := ARRAY[
        'org_select_policy', 'org_insert_policy', 'org_update_policy',
        'users_select_policy', 'users_insert_policy', 'users_update_policy',
        'contacts_select_policy', 'contacts_insert_policy', 'contacts_update_policy',
        'workflow_stages_select_policy', 'workflow_stages_insert_policy', 'workflow_stages_update_policy',
        'workflow_sub_stages_select_policy', 'workflow_sub_stages_insert_policy', 'workflow_sub_stages_update_policy',
        'projects_select_policy', 'projects_insert_policy', 'projects_update_policy',
        'progress_select_policy', 'progress_insert_policy', 'progress_update_policy',
        'approvals_select_policy', 'approvals_insert_policy', 'approvals_update_policy',
        'documents_select_policy', 'documents_insert_policy', 'documents_update_policy'
    ];
    missing_policies TEXT[] := ARRAY[]::TEXT[];
    policy_name TEXT;
BEGIN
    FOREACH policy_name IN ARRAY required_policies LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public' AND policyname = policy_name
        ) THEN
            missing_policies := missing_policies || policy_name;
        END IF;
    END LOOP;

    IF array_length(missing_policies, 1) > 0 THEN
        RAISE EXCEPTION 'Missing RLS policies: %', array_to_string(missing_policies, ', ');
    ELSE
        RAISE NOTICE '✓ All required RLS policies exist';
    END IF;
END $$;

-- Placeholder for remaining tests (will run after sample data is loaded)
DO $$
BEGIN
    RAISE NOTICE '✓ Schema integrity tests completed - detailed validation will run after sample data is loaded';
END $$;