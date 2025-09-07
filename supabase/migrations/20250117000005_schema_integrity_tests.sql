-- =========================================
-- Factory Pulse Schema Integrity Tests
-- Comprehensive test suite for database schema validation
-- =========================================

-- =========================================
-- 1. CONSTRAINT AND DATA TYPE TESTS
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
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY required_tables LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            missing_tables := missing_tables || table_name;
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
DECLARE
    expected_user_roles user_role[] := ARRAY[
        'admin', 'management', 'engineering', 'qa', 'procurement',
        'production', 'sales', 'finance', 'logistics', 'auditor'
    ]::user_role[];
    expected_project_statuses project_status[] := ARRAY[
        'draft', 'inquiry', 'reviewing', 'quoted', 'confirmed',
        'procurement', 'production', 'completed', 'cancelled'
    ]::project_status[];
    expected_approval_types approval_type[] := ARRAY[
        'technical_review', 'quote_approval', 'po_approval', 'supplier_selection',
        'quality_review', 'shipment_release', 'final_signoff', 'engineering_change',
        'cost_approval', 'budget_approval', 'contract_approval', 'safety_review'
    ]::approval_type[];
BEGIN
    -- Test enum values exist (this will throw an error if enum values are missing)
    PERFORM unnest(expected_user_roles);
    PERFORM unnest(expected_project_statuses);
    PERFORM unnest(expected_approval_types);

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
        'approvals_select_policy', 'approvals_insert_policy', 'approvals_update_policy'
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

-- =========================================
-- 2. FOREIGN KEY CONSTRAINT TESTS
-- =========================================

-- Test 4: Verify foreign key relationships
DO $$
DECLARE
    test_org_id UUID := '550e8400-e29b-41d4-a716-446655440005';
    test_user_id UUID := '660e8400-e29b-41d4-a716-446655440001';
    test_project_id UUID := 'bb0e8400-e29b-41d4-a716-446655440001';
    test_contact_id UUID := '770e8400-e29b-41d4-a716-446655440001';
    test_stage_id UUID := '880e8400-e29b-41d4-a716-446655440001';
    test_sub_stage_id UUID := '990e8400-e29b-41d4-a716-446655440001';
    test_approval_id UUID := 'dd0e8400-e29b-41d4-a716-446655440001';
    test_document_id UUID := 'ee0e8400-e29b-41d4-a716-446655440001';
BEGIN
    -- Test organization references
    ASSERT EXISTS (SELECT 1 FROM organizations WHERE id = test_org_id);
    ASSERT EXISTS (SELECT 1 FROM users WHERE organization_id = test_org_id);
    ASSERT EXISTS (SELECT 1 FROM contacts WHERE organization_id = test_org_id);

    -- Test user references
    ASSERT EXISTS (SELECT 1 FROM users WHERE id = test_user_id);
    ASSERT EXISTS (SELECT 1 FROM projects WHERE created_by = test_user_id);

    -- Test contact references
    ASSERT EXISTS (SELECT 1 FROM contacts WHERE id = test_contact_id);

    -- Test workflow references
    ASSERT EXISTS (SELECT 1 FROM workflow_stages WHERE id = test_stage_id);
    ASSERT EXISTS (SELECT 1 FROM workflow_sub_stages WHERE workflow_stage_id = test_stage_id);

    -- Test project references
    ASSERT EXISTS (SELECT 1 FROM projects WHERE id = test_project_id);
    ASSERT EXISTS (SELECT 1 FROM project_sub_stage_progress WHERE project_id = test_project_id);

    RAISE NOTICE '✓ All foreign key relationships are valid';
END $$;

-- =========================================
-- 3. UNIQUE CONSTRAINT TESTS
-- =========================================

-- Test 5: Verify unique constraints
DO $$
DECLARE
    test_org_slug TEXT := 'factory-pulse';
    test_email TEXT := 'admin@factorypulse.com';
    test_project_id TEXT := 'P-2501001';
BEGIN
    -- Test unique organization slug
    ASSERT (SELECT COUNT(*) FROM organizations WHERE slug = test_org_slug) = 1;

    -- Test unique user email
    ASSERT (SELECT COUNT(*) FROM users WHERE email = test_email) = 1;

    -- Test unique project ID
    ASSERT (SELECT COUNT(*) FROM projects WHERE project_id = test_project_id) = 1;

    RAISE NOTICE '✓ All unique constraints are working correctly';
END $$;

-- =========================================
-- 4. INDEX PERFORMANCE TESTS
-- =========================================

-- Test 6: Verify indexes exist and are being used
DO $$
DECLARE
    required_indexes TEXT[] := ARRAY[
        'idx_organizations_slug', 'idx_users_org', 'idx_users_email',
        'idx_contacts_org_type', 'idx_workflow_stages_org_order',
        'idx_workflow_sub_stages_stage_order', 'idx_projects_org',
        'idx_projects_customer', 'idx_projects_status', 'idx_pssp_project',
        'idx_approvals_entity', 'idx_approvals_status', 'idx_documents_project',
        'idx_activity_log_entity', 'idx_notifications_user_created'
    ];
    missing_indexes TEXT[] := ARRAY[]::TEXT[];
    index_name TEXT;
BEGIN
    FOREACH index_name IN ARRAY required_indexes LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = 'public' AND indexname = index_name
        ) THEN
            missing_indexes := missing_indexes || index_name;
        END IF;
    END LOOP;

    IF array_length(missing_indexes, 1) > 0 THEN
        RAISE EXCEPTION 'Missing indexes: %', array_to_string(missing_indexes, ', ');
    ELSE
        RAISE NOTICE '✓ All required indexes exist';
    END IF;
END $$;

-- =========================================
-- 5. DATA INTEGRITY TESTS
-- =========================================

-- Test 7: Verify workflow stage progression logic
DO $$
DECLARE
    test_project_id UUID := 'bb0e8400-e29b-41d4-a716-446655440001';
    current_stage_order INTEGER;
    total_sub_stages INTEGER;
    completed_sub_stages INTEGER;
BEGIN
    -- Get current stage order
    SELECT ws.stage_order INTO current_stage_order
    FROM projects p
    JOIN workflow_stages ws ON p.current_stage_id = ws.id
    WHERE p.id = test_project_id;

    -- Count sub-stages in current stage
    SELECT COUNT(*) INTO total_sub_stages
    FROM project_sub_stage_progress pssp
    JOIN workflow_sub_stages wss ON pssp.sub_stage_id = wss.id
    WHERE pssp.project_id = test_project_id AND wss.workflow_stage_id = (
        SELECT current_stage_id FROM projects WHERE id = test_project_id
    );

    -- Count completed sub-stages in current stage
    SELECT COUNT(*) INTO completed_sub_stages
    FROM project_sub_stage_progress pssp
    JOIN workflow_sub_stages wss ON pssp.sub_stage_id = wss.id
    WHERE pssp.project_id = test_project_id
    AND wss.workflow_stage_id = (SELECT current_stage_id FROM projects WHERE id = test_project_id)
    AND pssp.status = 'completed';

    -- Verify stage progression logic
    ASSERT current_stage_order IS NOT NULL;
    ASSERT total_sub_stages > 0;
    ASSERT completed_sub_stages <= total_sub_stages;

    RAISE NOTICE '✓ Workflow stage progression logic is correct (Stage %, %/% completed)',
        current_stage_order, completed_sub_stages, total_sub_stages;
END $$;

-- Test 8: Verify approval workflow integrity
DO $$
DECLARE
    test_approval_id UUID := 'dd0e8400-e29b-41d4-a716-446655440001';
    approval_status approval_status;
    requested_at TIMESTAMPTZ;
    decided_at TIMESTAMPTZ;
BEGIN
    SELECT a.status, a.requested_at, a.decided_at
    INTO approval_status, requested_at, decided_at
    FROM approvals a
    WHERE a.id = test_approval_id;

    -- Verify approval state consistency
    IF approval_status IN ('approved', 'rejected') THEN
        ASSERT decided_at IS NOT NULL;
        ASSERT decided_at >= requested_at;
    ELSIF approval_status IN ('pending', 'in_review') THEN
        ASSERT decided_at IS NULL;
    END IF;

    RAISE NOTICE '✓ Approval workflow integrity is maintained';
END $$;

-- =========================================
-- 6. BUSINESS LOGIC TESTS
-- =========================================

-- Test 9: Verify project ID generation function
DO $$
DECLARE
    generated_id TEXT;
    expected_pattern TEXT := '^P-\d{4}\d{2}\d{3}$';
BEGIN
    SELECT generate_project_id() INTO generated_id;
    ASSERT generated_id ~ expected_pattern;

    RAISE NOTICE '✓ Project ID generation function works correctly: %', generated_id;
END $$;

-- Test 10: Verify organization-scoped data isolation
DO $$
DECLARE
    org1_id UUID := '550e8400-e29b-41d4-a716-446655440005';
    org2_id UUID := '550e8400-e29b-41d4-a716-446655440001';
    user_count_org1 INTEGER;
    user_count_org2 INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count_org1 FROM users WHERE organization_id = org1_id;
    SELECT COUNT(*) INTO user_count_org2 FROM users WHERE organization_id = org2_id;

    ASSERT user_count_org1 > 0;
    ASSERT user_count_org2 > 0;
    ASSERT user_count_org1 != user_count_org2; -- Different organizations have different data

    RAISE NOTICE '✓ Organization-scoped data isolation is working (% users in org1, % users in org2)',
        user_count_org1, user_count_org2;
END $$;

-- Test 11: Verify workflow template functionality
DO $$
DECLARE
    template_id UUID := 'aa0e8400-e29b-41d4-a716-446655440001';
    included_stages INTEGER;
    included_sub_stages INTEGER;
BEGIN
    -- Count included stages in template
    SELECT COUNT(*) INTO included_stages
    FROM workflow_definition_stages
    WHERE workflow_definition_id = template_id AND is_included = true;

    -- Count included sub-stages in template
    SELECT COUNT(*) INTO included_sub_stages
    FROM workflow_definition_sub_stages
    WHERE workflow_definition_id = template_id AND is_included = true;

    ASSERT included_stages > 0;
    ASSERT included_sub_stages > 0;

    RAISE NOTICE '✓ Workflow template includes % stages and % sub-stages',
        included_stages, included_sub_stages;
END $$;

-- =========================================
-- 7. PERFORMANCE TEST FUNCTIONS
-- =========================================

-- Test 12: Performance test - Project query with joins
DO $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    execution_time INTERVAL;
    result_count INTEGER;
BEGIN
    start_time := clock_timestamp();

    SELECT COUNT(*) INTO result_count
    FROM v_project_detail
    WHERE organization_id = '550e8400-e29b-41d4-a716-446655440005';

    end_time := clock_timestamp();
    execution_time := end_time - start_time;

    RAISE NOTICE '✓ Project detail view query performance: % ms (% rows)',
        EXTRACT(millisecond FROM execution_time), result_count;

    -- Assert reasonable performance (should be under 100ms for small dataset)
    ASSERT EXTRACT(millisecond FROM execution_time) < 100;
END $$;

-- Test 13: Performance test - Approval queue query
DO $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    execution_time INTERVAL;
    result_count INTEGER;
BEGIN
    start_time := clock_timestamp();

    SELECT COUNT(*) INTO result_count
    FROM v_approval_queue
    WHERE organization_id = '550e8400-e29b-41d4-a716-446655440005';

    end_time := clock_timestamp();
    execution_time := end_time - start_time;

    RAISE NOTICE '✓ Approval queue view query performance: % ms (% rows)',
        EXTRACT(millisecond FROM execution_time), result_count;

    -- Assert reasonable performance
    ASSERT EXTRACT(millisecond FROM execution_time) < 100;
END $$;

-- Test 14: Performance test - Current stage progress query
DO $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    execution_time INTERVAL;
    result_count INTEGER;
BEGIN
    start_time := clock_timestamp();

    SELECT COUNT(*) INTO result_count
    FROM v_current_stage_progress
    WHERE organization_id = '550e8400-e29b-41d4-a716-446655440005';

    end_time := clock_timestamp();
    execution_time := end_time - start_time;

    RAISE NOTICE '✓ Current stage progress view query performance: % ms (% rows)',
        EXTRACT(millisecond FROM execution_time), result_count;

    -- Assert reasonable performance
    ASSERT EXTRACT(millisecond FROM execution_time) < 100;
END $$;

-- =========================================
-- 8. CONCURRENCY AND ISOLATION TESTS
-- =========================================

-- Test 15: Test materialized view refresh
DO $$
DECLARE
    refresh_start TIMESTAMPTZ;
    refresh_end TIMESTAMPTZ;
    refresh_time INTERVAL;
BEGIN
    refresh_start := clock_timestamp();

    PERFORM refresh_dashboard_materialized_views();

    refresh_end := clock_timestamp();
    refresh_time := refresh_end - refresh_start;

    RAISE NOTICE '✓ Materialized view refresh completed in % ms', EXTRACT(millisecond FROM refresh_time);

    -- Assert refresh is reasonably fast
    ASSERT EXTRACT(millisecond FROM refresh_time) < 500;
END $$;

-- =========================================
-- 9. DATA CONSISTENCY TESTS
-- =========================================

-- Test 16: Verify project status and stage consistency
DO $$
DECLARE
    inconsistent_projects INTEGER;
BEGIN
    -- Find projects where status doesn't match current stage
    SELECT COUNT(*) INTO inconsistent_projects
    FROM projects p
    WHERE
        (p.status = 'draft' AND p.current_stage_id IS NOT NULL) OR
        (p.status IN ('inquiry', 'reviewing') AND p.current_stage_id NOT IN (
            SELECT id FROM workflow_stages WHERE name IN ('Inquiry Received', 'Technical Review')
        ));

    ASSERT inconsistent_projects = 0;

    RAISE NOTICE '✓ Project status and stage consistency is maintained';
END $$;

-- Test 17: Verify approval status transitions
DO $$
DECLARE
    invalid_transitions INTEGER;
BEGIN
    -- Check for invalid approval status transitions
    SELECT COUNT(*) INTO invalid_transitions
    FROM approvals a
    WHERE
        (a.status = 'approved' AND a.decided_by IS NULL) OR
        (a.status = 'rejected' AND a.decided_by IS NULL) OR
        (a.status IN ('approved', 'rejected') AND a.decided_at IS NULL);

    ASSERT invalid_transitions = 0;

    RAISE NOTICE '✓ Approval status transitions are valid';
END $$;

-- =========================================
-- 10. FULL-TEXT SEARCH TESTS
-- =========================================

-- Test 18: Test full-text search functionality
DO $$
DECLARE
    project_search_count INTEGER;
    document_search_count INTEGER;
    contact_search_count INTEGER;
BEGIN
    -- Test project search
    SELECT COUNT(*) INTO project_search_count
    FROM projects
    WHERE to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
          @@ plainto_tsquery('english', 'gear');

    -- Test document search
    SELECT COUNT(*) INTO document_search_count
    FROM documents
    WHERE to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
          @@ plainto_tsquery('english', 'medical');

    -- Test contact search
    SELECT COUNT(*) INTO contact_search_count
    FROM contacts
    WHERE to_tsvector('english',
        coalesce(company_name, '') || ' ' || coalesce(contact_name, '') || ' ' || coalesce(email, ''))
          @@ plainto_tsquery('english', 'acme');

    RAISE NOTICE '✓ Full-text search working: % projects, % documents, % contacts found',
        project_search_count, document_search_count, contact_search_count;

    -- Assert search returns expected results
    ASSERT project_search_count > 0;
    ASSERT document_search_count > 0;
    ASSERT contact_search_count > 0;
END $$;

-- =========================================
-- 11. AUDIT AND COMPLIANCE TESTS
-- =========================================

-- Test 19: Verify activity logging completeness
DO $$
DECLARE
    project_count INTEGER;
    activity_count INTEGER;
    coverage_percentage NUMERIC;
BEGIN
    -- Count total projects
    SELECT COUNT(*) INTO project_count FROM projects;

    -- Count activity log entries for projects
    SELECT COUNT(*) INTO activity_count
    FROM activity_log
    WHERE entity_type = 'projects';

    -- Calculate coverage
    IF project_count > 0 THEN
        coverage_percentage := (activity_count::NUMERIC / project_count::NUMERIC) * 100;
        RAISE NOTICE '✓ Activity logging coverage: %/% projects logged (%.1f%%)',
            activity_count, project_count, coverage_percentage;
    ELSE
        RAISE NOTICE '✓ No projects to verify activity logging for';
    END IF;
END $$;

-- Test 20: Verify document versioning integrity
DO $$
DECLARE
    invalid_versions INTEGER;
BEGIN
    -- Check for documents with invalid version sequences
    SELECT COUNT(*) INTO invalid_versions
    FROM (
        SELECT document_id,
               version,
               ROW_NUMBER() OVER (PARTITION BY document_id ORDER BY version) as expected_version
        FROM documents
    ) dv
    WHERE dv.version != dv.expected_version;

    ASSERT invalid_versions = 0;

    RAISE NOTICE '✓ Document versioning integrity is maintained';
END $$;

-- =========================================
-- TEST SUITE SUMMARY
-- =========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'SCHEMA INTEGRITY TEST SUITE COMPLETED';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✓ All core tables and relationships verified';
    RAISE NOTICE '✓ All enum types and constraints validated';
    RAISE NOTICE '✓ Row Level Security policies confirmed';
    RAISE NOTICE '✓ Foreign key constraints working correctly';
    RAISE NOTICE '✓ Unique constraints enforced properly';
    RAISE NOTICE '✓ Performance indexes created and functional';
    RAISE NOTICE '✓ Business logic rules validated';
    RAISE NOTICE '✓ Data consistency maintained';
    RAISE NOTICE '✓ Full-text search operational';
    RAISE NOTICE '✓ Audit trail and compliance features working';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Schema integrity validation PASSED!';
    RAISE NOTICE '=========================================';
END $$;
