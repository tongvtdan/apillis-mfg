-- Migration: Organizations as Customers - Phase 2: Data Migration (Simplified)
-- This migration populates customer organizations and updates relationships
-- from the existing contact-based model to the new organization-based model

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PHASE 2: DATA MIGRATION (SIMPLIFIED)
-- =====================================================

-- Start transaction for data integrity
BEGIN;

-- =====================================================
-- STEP 1: CREATE CUSTOMER ORGANIZATION RECORDS
-- =====================================================

-- Create customer organization records for each unique customer company
INSERT INTO organizations (id, name, slug, description, industry, address, city, state, country, postal_code, website, is_active, created_at, updated_at)
SELECT DISTINCT 
    uuid_generate_v4() as id,
    c.company_name as name,
    LOWER(REGEXP_REPLACE(c.company_name, '[^a-zA-Z0-9]+', '-', 'g')) as slug,
    'Customer Organization' as description,
    'Manufacturing' as industry,
    c.address,
    c.city,
    c.state,
    c.country,
    c.postal_code,
    c.website,
    true as is_active,
    NOW() as created_at,
    NOW() as updated_at
FROM contacts c 
WHERE c.type = 'customer' 
AND c.company_name IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM organizations o 
    WHERE o.name = c.company_name
);

-- =====================================================
-- STEP 2: UPDATE CONTACTS TO REFERENCE CUSTOMER ORGANIZATIONS
-- =====================================================

-- Update customer contacts to reference their organization instead of internal organization
UPDATE contacts 
SET organization_id = o.id,
    role = CASE 
        WHEN contacts.contact_name ILIKE '%manager%' OR contacts.contact_name ILIKE '%director%' THEN 'management'
        WHEN contacts.contact_name ILIKE '%engineer%' OR contacts.contact_name ILIKE '%technical%' THEN 'engineering'
        WHEN contacts.contact_name ILIKE '%purchase%' OR contacts.contact_name ILIKE '%procurement%' THEN 'purchasing'
        WHEN contacts.contact_name ILIKE '%quality%' OR contacts.contact_name ILIKE '%qa%' THEN 'quality'
        ELSE 'general'
    END,
    is_primary_contact = true,
    description = 'Primary contact for ' || contacts.company_name
FROM organizations o
WHERE contacts.company_name = o.name 
AND contacts.type = 'customer'
AND contacts.organization_id != o.id;

-- =====================================================
-- STEP 3: UPDATE PROJECTS TO REFERENCE CUSTOMER ORGANIZATIONS
-- =====================================================

-- Update projects to reference customer organizations
UPDATE projects 
SET customer_organization_id = c.organization_id
FROM contacts c 
WHERE projects.customer_id = c.id 
AND c.type = 'customer'
AND projects.customer_organization_id IS NULL;

-- =====================================================
-- STEP 4: CREATE PROJECT-CONTACT RELATIONSHIP RECORDS
-- =====================================================

-- Create project contact point records for existing projects
INSERT INTO project_contact_points (project_id, contact_id, role, is_primary, created_at)
SELECT 
    p.id as project_id,
    p.customer_id as contact_id,
    COALESCE(c.role, 'general') as role,
    true as is_primary,
    NOW() as created_at
FROM projects p
JOIN contacts c ON p.customer_id = c.id
WHERE p.customer_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM project_contact_points pcp 
    WHERE pcp.project_id = p.id AND pcp.contact_id = p.customer_id
);

-- =====================================================
-- STEP 5: CREATE SAMPLE DATA FOR TESTING
-- =====================================================

-- Add secondary contacts for Toyota Vietnam
INSERT INTO contacts (id, organization_id, type, company_name, contact_name, email, phone, role, is_primary_contact, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM organizations WHERE name = 'Toyota Vietnam'),
    'customer',
    'Toyota Vietnam',
    'Engineering Team Lead',
    'engineering@toyota.vn',
    '+84-28-1234-5678',
    'engineering',
    false,
    'Secondary contact for technical discussions',
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM organizations WHERE name = 'Toyota Vietnam');

-- Add secondary contacts for Samsung Vietnam
INSERT INTO contacts (id, organization_id, type, company_name, contact_name, email, phone, role, is_primary_contact, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM organizations WHERE name = 'Samsung Vietnam'),
    'customer',
    'Samsung Vietnam',
    'Quality Assurance Manager',
    'qa@samsung.vn',
    '+84-28-2345-6789',
    'quality',
    false,
    'Secondary contact for quality discussions',
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM organizations WHERE name = 'Samsung Vietnam');

-- Add secondary contact points to some projects
INSERT INTO project_contact_points (project_id, contact_id, role, is_primary, created_at)
SELECT 
    p.id,
    c.id,
    c.role,
    false,
    NOW()
FROM projects p
JOIN contacts c ON c.organization_id = p.customer_organization_id
WHERE p.customer_organization_id = (SELECT id FROM organizations WHERE name = 'Toyota Vietnam')
AND c.role = 'engineering'
AND NOT EXISTS (
    SELECT 1 FROM project_contact_points pcp 
    WHERE pcp.project_id = p.id AND pcp.contact_id = c.id
)
LIMIT 2;

INSERT INTO project_contact_points (project_id, contact_id, role, is_primary, created_at)
SELECT 
    p.id,
    c.id,
    c.role,
    false,
    NOW()
FROM projects p
JOIN contacts c ON c.organization_id = p.customer_organization_id
WHERE p.customer_organization_id = (SELECT id FROM organizations WHERE name = 'Samsung Vietnam')
AND c.role = 'quality'
AND NOT EXISTS (
    SELECT 1 FROM project_contact_points pcp 
    WHERE pcp.project_id = p.id AND pcp.contact_id = c.id
)
LIMIT 2;

-- =====================================================
-- COMMIT TRANSACTION
-- =====================================================

COMMIT;

-- =====================================================
-- VALIDATION AND SUMMARY
-- =====================================================

-- Create a summary of the migration results
DO $$
DECLARE
    customer_orgs_count INTEGER;
    contacts_updated_count INTEGER;
    projects_updated_count INTEGER;
    contact_points_count INTEGER;
    validation_results RECORD;
BEGIN
    -- Get counts
    SELECT COUNT(*) INTO customer_orgs_count FROM organizations WHERE description = 'Customer Organization';
    SELECT COUNT(*) INTO contacts_updated_count FROM contacts WHERE type = 'customer' AND description LIKE 'Primary contact for%';
    SELECT COUNT(*) INTO projects_updated_count FROM projects WHERE customer_organization_id IS NOT NULL;
    SELECT COUNT(*) INTO contact_points_count FROM project_contact_points;
    
    -- Run validation
    FOR validation_results IN 
        SELECT validation_type, count_value, status 
        FROM validate_customer_organization_migration()
    LOOP
        RAISE NOTICE 'Validation: % = % (%)', validation_results.validation_type, validation_results.count_value, validation_results.status;
    END LOOP;
    
    -- Summary
    RAISE NOTICE '=== MIGRATION PHASE 2 COMPLETED ===';
    RAISE NOTICE 'Customer Organizations Created: %', customer_orgs_count;
    RAISE NOTICE 'Contacts Updated: %', contacts_updated_count;
    RAISE NOTICE 'Projects Updated: %', projects_updated_count;
    RAISE NOTICE 'Contact Points Created: %', contact_points_count;
    RAISE NOTICE '=====================================';
END $$;

-- Final validation results
SELECT 
    'FINAL VALIDATION RESULTS' as status,
    validation_type,
    count_value,
    status as result
FROM validate_customer_organization_migration()
UNION ALL
SELECT 
    'SUMMARY' as status,
    'customer_organizations' as validation_type,
    COUNT(*)::INTEGER as count_value,
    'COMPLETED' as result
FROM organizations WHERE description = 'Customer Organization'
UNION ALL
SELECT 
    'SUMMARY' as status,
    'project_contact_points' as validation_type,
    COUNT(*)::INTEGER as count_value,
    'COMPLETED' as result
FROM project_contact_points;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration Phase 2 completed successfully: Organizations as Customers Data Migration';
    RAISE NOTICE 'Customer organizations created and relationships updated';
    RAISE NOTICE 'Next step: Run Phase 3 backend updates for TypeScript interfaces and queries';
END $$;
