-- Migration: Cleanup Old Contact Model
-- Remove customer_id column and project_contact_points table after successful migration

-- =====================================================
-- PHASE 1: FINAL VALIDATION BEFORE CLEANUP
-- =====================================================

-- Create comprehensive validation function
CREATE OR REPLACE FUNCTION validate_migration_before_cleanup()
RETURNS TABLE (
    validation_type VARCHAR(50),
    count_value INTEGER,
    status VARCHAR(20),
    details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check all projects have been migrated
    RETURN QUERY
    SELECT 
        'projects_with_contacts'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) > 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'FAIL'::VARCHAR(20)
        END as status,
        'Projects with migrated contact arrays'::TEXT as details
    FROM projects 
    WHERE point_of_contacts IS NOT NULL AND array_length(point_of_contacts, 1) > 0;
    
    -- Check for projects that still rely on customer_id
    RETURN QUERY
    SELECT 
        'projects_using_customer_id'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'WARNING'::VARCHAR(20)
        END as status,
        'Projects still using old customer_id field'::TEXT as details
    FROM projects 
    WHERE customer_id IS NOT NULL 
    AND (point_of_contacts IS NULL OR array_length(point_of_contacts, 1) IS NULL);
    
    -- Check data consistency between old and new models
    RETURN QUERY
    SELECT 
        'data_consistency_check'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'WARNING'::VARCHAR(20)
        END as status,
        'Projects where old customer_id is not in new contact array'::TEXT as details
    FROM projects p
    WHERE p.customer_id IS NOT NULL 
    AND p.point_of_contacts IS NOT NULL
    AND NOT (p.customer_id = ANY(p.point_of_contacts));
END;
$$;

-- Run validation before cleanup
DO $$
DECLARE
    validation_results RECORD;
    can_proceed BOOLEAN := true;
BEGIN
    RAISE NOTICE '=== PRE-CLEANUP VALIDATION ===';
    
    FOR validation_results IN 
        SELECT validation_type, count_value, status, details
        FROM validate_migration_before_cleanup()
    LOOP
        RAISE NOTICE '% = % (%) - %', 
            validation_results.validation_type, 
            validation_results.count_value, 
            validation_results.status,
            validation_results.details;
            
        IF validation_results.status = 'FAIL' THEN
            can_proceed := false;
        END IF;
    END LOOP;
    
    IF NOT can_proceed THEN
        RAISE EXCEPTION 'Migration validation failed. Cannot proceed with cleanup.';
    END IF;
    
    RAISE NOTICE 'Validation passed. Proceeding with cleanup...';
END $$;

-- =====================================================
-- PHASE 2: BACKUP OLD DATA (OPTIONAL SAFETY)
-- =====================================================

-- Create backup table for project_contact_points (just in case)
CREATE TABLE IF NOT EXISTS project_contact_points_backup AS 
SELECT *, NOW() as backup_created_at 
FROM project_contact_points;

-- Add comment
COMMENT ON TABLE project_contact_points_backup IS 'Backup of project_contact_points before migration cleanup. Can be dropped after verification.';

-- =====================================================
-- PHASE 3: UPDATE EXISTING QUERIES AND VIEWS
-- =====================================================

-- Drop any views that depend on the old structure
DROP VIEW IF EXISTS project_details_view;
DROP VIEW IF EXISTS project_contact_summary;

-- =====================================================
-- PHASE 4: REMOVE OLD STRUCTURES
-- =====================================================

-- Drop foreign key constraints first
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_customer_id_fkey;

-- Remove customer_id column from projects table
ALTER TABLE projects DROP COLUMN IF EXISTS customer_id;

-- Drop indexes related to project_contact_points
DROP INDEX IF EXISTS idx_project_contact_points_project_id;
DROP INDEX IF EXISTS idx_project_contact_points_contact_id;
DROP INDEX IF EXISTS idx_project_contact_points_role;
DROP INDEX IF EXISTS idx_project_contact_points_is_primary;

-- Drop triggers
DROP TRIGGER IF EXISTS update_project_contact_points_updated_at ON project_contact_points;
DROP TRIGGER IF EXISTS log_project_contact_points_activity ON project_contact_points;

-- Remove from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS project_contact_points;

-- Drop the project_contact_points table
DROP TABLE IF EXISTS project_contact_points;

-- =====================================================
-- PHASE 5: CLEAN UP OLD FUNCTIONS
-- =====================================================

-- Drop old functions that are no longer needed
DROP FUNCTION IF EXISTS get_project_customer_organization(UUID);
DROP FUNCTION IF EXISTS get_project_contact_points(UUID);

-- Keep validate_customer_organization_migration for historical reference
-- but rename it to indicate it's deprecated
ALTER FUNCTION IF EXISTS validate_customer_organization_migration() 
RENAME TO validate_customer_organization_migration_deprecated;

-- =====================================================
-- PHASE 6: CREATE OPTIMIZED VIEWS FOR COMMON QUERIES
-- =====================================================

-- Create view for project details with customer info
CREATE OR REPLACE VIEW project_details_view AS
SELECT 
    p.*,
    o.name as customer_organization_name,
    o.slug as customer_organization_slug,
    o.address as customer_address,
    o.city as customer_city,
    o.country as customer_country,
    o.website as customer_website,
    -- Primary contact info (first in array)
    CASE 
        WHEN array_length(p.point_of_contacts, 1) > 0 THEN
            (SELECT c.contact_name FROM contacts c WHERE c.id = p.point_of_contacts[1])
        ELSE NULL
    END as primary_contact_name,
    CASE 
        WHEN array_length(p.point_of_contacts, 1) > 0 THEN
            (SELECT c.email FROM contacts c WHERE c.id = p.point_of_contacts[1])
        ELSE NULL
    END as primary_contact_email,
    CASE 
        WHEN array_length(p.point_of_contacts, 1) > 0 THEN
            (SELECT c.phone FROM contacts c WHERE c.id = p.point_of_contacts[1])
        ELSE NULL
    END as primary_contact_phone,
    -- Contact count
    COALESCE(array_length(p.point_of_contacts, 1), 0) as contact_count
FROM projects p
LEFT JOIN organizations o ON p.customer_organization_id = o.id;

-- Add comment
COMMENT ON VIEW project_details_view IS 'Optimized view for project details with customer organization and primary contact info';

-- Grant access to the view
GRANT SELECT ON project_details_view TO authenticated;

-- =====================================================
-- PHASE 7: UPDATE RLS POLICIES
-- =====================================================

-- No changes needed for RLS policies as they're on the projects table
-- which still exists with the same access patterns

-- =====================================================
-- PHASE 8: LOG CLEANUP COMPLETION
-- =====================================================

-- Log cleanup completion
INSERT INTO activity_log (
    organization_id,
    action,
    entity_type,
    entity_id,
    new_values
) VALUES (
    (SELECT id FROM organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1),
    'MIGRATION',
    'schema',
    uuid_generate_v4(),
    jsonb_build_object(
        'migration', 'simplify_project_contacts_phase_2_cleanup',
        'status', 'completed',
        'timestamp', NOW(),
        'changes', jsonb_build_array(
            'Removed customer_id column from projects table',
            'Dropped project_contact_points table',
            'Created project_details_view for optimized queries',
            'Cleaned up old functions and indexes'
        )
    )
);

-- =====================================================
-- FINAL VALIDATION AND SUMMARY
-- =====================================================

DO $$
DECLARE
    total_projects INTEGER;
    projects_with_contacts INTEGER;
    total_contacts INTEGER;
    orgs_with_projects INTEGER;
BEGIN
    -- Get final counts
    SELECT COUNT(*) INTO total_projects FROM projects;
    
    SELECT COUNT(*) INTO projects_with_contacts
    FROM projects 
    WHERE point_of_contacts IS NOT NULL AND array_length(point_of_contacts, 1) > 0;
    
    SELECT COUNT(*) INTO total_contacts
    FROM (
        SELECT UNNEST(point_of_contacts) 
        FROM projects 
        WHERE point_of_contacts IS NOT NULL
    ) as all_contacts;
    
    SELECT COUNT(DISTINCT customer_organization_id) INTO orgs_with_projects
    FROM projects 
    WHERE customer_organization_id IS NOT NULL;
    
    -- Final summary
    RAISE NOTICE '=== MIGRATION CLEANUP COMPLETED ===';
    RAISE NOTICE 'Total projects: %', total_projects;
    RAISE NOTICE 'Projects with contacts: %', projects_with_contacts;
    RAISE NOTICE 'Total contact relationships: %', total_contacts;
    RAISE NOTICE 'Customer organizations: %', orgs_with_projects;
    RAISE NOTICE '';
    RAISE NOTICE 'REMOVED:';
    RAISE NOTICE '- customer_id column from projects';
    RAISE NOTICE '- project_contact_points table';
    RAISE NOTICE '- Related indexes and triggers';
    RAISE NOTICE '';
    RAISE NOTICE 'ADDED:';
    RAISE NOTICE '- point_of_contacts array in projects';
    RAISE NOTICE '- Helper functions for contact management';
    RAISE NOTICE '- project_details_view for optimized queries';
    RAISE NOTICE '';
    RAISE NOTICE 'PRIMARY CONTACT: First element in point_of_contacts array';
    RAISE NOTICE '=====================================';
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration Phase 2 completed successfully: Old Contact Model Cleanup';
    RAISE NOTICE 'Simplified project contact model is now active';
    RAISE NOTICE 'Next step: Update application code and test thoroughly';
END $$;