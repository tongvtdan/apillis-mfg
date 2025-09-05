-- Migration: Simplify Project Contacts Model
-- Replace project_contact_points table with point_of_contacts array in projects table
-- Primary contact = first contact in the array

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PHASE 1: ADD NEW COLUMN TO PROJECTS TABLE
-- =====================================================

-- Add point_of_contacts array column to projects table
ALTER TABLE projects ADD COLUMN point_of_contacts UUID[] DEFAULT '{}';

-- Add index for efficient array queries
CREATE INDEX IF NOT EXISTS idx_projects_point_of_contacts ON projects USING GIN (point_of_contacts);

-- Add comment for documentation
COMMENT ON COLUMN projects.point_of_contacts IS 'Array of contact IDs for this project. First contact is primary contact.';

-- =====================================================
-- PHASE 2: MIGRATE DATA FROM PROJECT_CONTACT_POINTS
-- =====================================================

-- Migrate existing project contact points to the new array format
-- Primary contacts first, then others ordered by creation date
UPDATE projects 
SET point_of_contacts = (
    SELECT ARRAY_AGG(pcp.contact_id ORDER BY pcp.is_primary DESC, pcp.created_at ASC)
    FROM project_contact_points pcp
    WHERE pcp.project_id = projects.id
)
WHERE EXISTS (
    SELECT 1 FROM project_contact_points pcp 
    WHERE pcp.project_id = projects.id
);

-- =====================================================
-- PHASE 3: VALIDATE DATA MIGRATION
-- =====================================================

-- Create validation function
CREATE OR REPLACE FUNCTION validate_contact_migration()
RETURNS TABLE (
    validation_type VARCHAR(50),
    count_value INTEGER,
    status VARCHAR(20)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check projects with contact points but empty array
    RETURN QUERY
    SELECT 
        'projects_missing_contacts'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'FAIL'::VARCHAR(20)
        END as status
    FROM projects p
    WHERE EXISTS (
        SELECT 1 FROM project_contact_points pcp 
        WHERE pcp.project_id = p.id
    )
    AND (p.point_of_contacts IS NULL OR array_length(p.point_of_contacts, 1) IS NULL);
    
    -- Check for invalid contact IDs in arrays
    RETURN QUERY
    SELECT 
        'invalid_contact_ids'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'FAIL'::VARCHAR(20)
        END as status
    FROM (
        SELECT UNNEST(p.point_of_contacts) as contact_id
        FROM projects p
        WHERE p.point_of_contacts IS NOT NULL
    ) contact_ids
    LEFT JOIN contacts c ON contact_ids.contact_id = c.id
    WHERE c.id IS NULL;
    
    -- Check primary contact consistency
    RETURN QUERY
    SELECT 
        'primary_contact_consistency'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'WARNING'::VARCHAR(20)
        END as status
    FROM projects p
    WHERE array_length(p.point_of_contacts, 1) > 0
    AND NOT EXISTS (
        SELECT 1 FROM project_contact_points pcp
        WHERE pcp.project_id = p.id 
        AND pcp.contact_id = p.point_of_contacts[1]
        AND pcp.is_primary = true
    );
END;
$$;

-- =====================================================
-- PHASE 4: CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get project contacts with details
CREATE OR REPLACE FUNCTION get_project_contacts(project_uuid UUID)
RETURNS TABLE (
    contact_id UUID,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(100),
    is_primary_contact BOOLEAN,
    is_project_primary BOOLEAN,
    company_name VARCHAR(255)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as contact_id,
        c.contact_name,
        c.email,
        c.phone,
        c.role,
        c.is_primary_contact,
        (c.id = p.point_of_contacts[1]) as is_project_primary,
        c.company_name
    FROM projects p
    CROSS JOIN UNNEST(p.point_of_contacts) WITH ORDINALITY AS contact_ids(contact_id, position)
    JOIN contacts c ON c.id = contact_ids.contact_id
    WHERE p.id = project_uuid
    ORDER BY contact_ids.position;
END;
$$;

-- Function to get primary contact for a project
CREATE OR REPLACE FUNCTION get_project_primary_contact(project_uuid UUID)
RETURNS TABLE (
    contact_id UUID,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(100),
    company_name VARCHAR(255)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as contact_id,
        c.contact_name,
        c.email,
        c.phone,
        c.role,
        c.company_name
    FROM projects p
    JOIN contacts c ON c.id = p.point_of_contacts[1]
    WHERE p.id = project_uuid
    AND array_length(p.point_of_contacts, 1) > 0;
END;
$$;

-- Function to add contact to project
CREATE OR REPLACE FUNCTION add_contact_to_project(project_uuid UUID, contact_uuid UUID, make_primary BOOLEAN DEFAULT false)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_contacts UUID[];
    new_contacts UUID[];
BEGIN
    -- Get current contacts
    SELECT point_of_contacts INTO current_contacts
    FROM projects 
    WHERE id = project_uuid;
    
    -- Check if contact already exists
    IF contact_uuid = ANY(current_contacts) THEN
        -- If making primary and not already primary, move to front
        IF make_primary AND current_contacts[1] != contact_uuid THEN
            -- Remove from current position and add to front
            new_contacts := ARRAY[contact_uuid] || array_remove(current_contacts, contact_uuid);
            
            UPDATE projects 
            SET point_of_contacts = new_contacts
            WHERE id = project_uuid;
        END IF;
        
        RETURN true;
    END IF;
    
    -- Add new contact
    IF make_primary THEN
        -- Add to front
        new_contacts := ARRAY[contact_uuid] || current_contacts;
    ELSE
        -- Add to end
        new_contacts := current_contacts || ARRAY[contact_uuid];
    END IF;
    
    UPDATE projects 
    SET point_of_contacts = new_contacts
    WHERE id = project_uuid;
    
    RETURN true;
END;
$$;

-- Function to remove contact from project
CREATE OR REPLACE FUNCTION remove_contact_from_project(project_uuid UUID, contact_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE projects 
    SET point_of_contacts = array_remove(point_of_contacts, contact_uuid)
    WHERE id = project_uuid;
    
    RETURN true;
END;
$$;

-- =====================================================
-- PHASE 5: GRANT PERMISSIONS
-- =====================================================

-- Grant permissions for new functions
GRANT EXECUTE ON FUNCTION validate_contact_migration() TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_contacts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_primary_contact(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION add_contact_to_project(UUID, UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_contact_from_project(UUID, UUID) TO authenticated;

-- =====================================================
-- PHASE 6: LOG MIGRATION
-- =====================================================

-- Log migration start
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
        'migration', 'simplify_project_contacts_phase_1',
        'status', 'completed',
        'timestamp', NOW(),
        'changes', jsonb_build_array(
            'Added point_of_contacts array column to projects',
            'Migrated data from project_contact_points',
            'Created helper functions for contact management'
        )
    )
);

-- =====================================================
-- VALIDATION AND SUMMARY
-- =====================================================

-- Run validation
DO $$
DECLARE
    validation_results RECORD;
    projects_migrated INTEGER;
    total_contacts_migrated INTEGER;
BEGIN
    -- Get migration counts
    SELECT COUNT(*) INTO projects_migrated
    FROM projects 
    WHERE point_of_contacts IS NOT NULL AND array_length(point_of_contacts, 1) > 0;
    
    SELECT COUNT(*) INTO total_contacts_migrated
    FROM (
        SELECT UNNEST(point_of_contacts) 
        FROM projects 
        WHERE point_of_contacts IS NOT NULL
    ) as all_contacts;
    
    -- Run validation
    FOR validation_results IN 
        SELECT validation_type, count_value, status 
        FROM validate_contact_migration()
    LOOP
        RAISE NOTICE 'Validation: % = % (%)', validation_results.validation_type, validation_results.count_value, validation_results.status;
    END LOOP;
    
    -- Summary
    RAISE NOTICE '=== MIGRATION PHASE 1 COMPLETED ===';
    RAISE NOTICE 'Projects migrated: %', projects_migrated;
    RAISE NOTICE 'Total contacts migrated: %', total_contacts_migrated;
    RAISE NOTICE 'New column: point_of_contacts (UUID[])';
    RAISE NOTICE 'Primary contact: First element in array';
    RAISE NOTICE '=====================================';
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration Phase 1 completed successfully: Simplified Project Contacts Model';
    RAISE NOTICE 'Added point_of_contacts array column and migrated data';
    RAISE NOTICE 'Next step: Update application code to use new model';
END $$;