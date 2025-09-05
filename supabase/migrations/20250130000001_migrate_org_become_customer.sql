-- Migration: Organizations as Customers
-- Phase 1: Database Schema Updates
-- This migration implements the schema changes for changing customer relationship model
-- from contact-based to organization-based

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. MODIFY PROJECTS TABLE
-- =====================================================

-- Add new column for organization as customer
ALTER TABLE projects ADD COLUMN customer_organization_id UUID REFERENCES organizations(id);

-- Add foreign key constraint
ALTER TABLE projects ADD CONSTRAINT projects_customer_organization_id_fkey 
FOREIGN KEY (customer_organization_id) REFERENCES organizations(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_projects_customer_organization_id ON projects(customer_organization_id);

-- =====================================================
-- 2. ENHANCE CONTACTS TABLE
-- =====================================================

-- Add role field to contacts to identify purchasing, engineering, etc.
ALTER TABLE contacts ADD COLUMN role VARCHAR(100);

-- Add flag for primary contact
ALTER TABLE contacts ADD COLUMN is_primary_contact BOOLEAN DEFAULT false;

-- Add description field for additional context
ALTER TABLE contacts ADD COLUMN description TEXT;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_contacts_role ON contacts(role);
CREATE INDEX IF NOT EXISTS idx_contacts_is_primary_contact ON contacts(is_primary_contact);

-- =====================================================
-- 3. CREATE PROJECT-CONTACT RELATIONSHIP TABLE
-- =====================================================

-- Create new table for project-specific contact points
CREATE TABLE project_contact_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  role VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_contact_points_project_id ON project_contact_points(project_id);
CREATE INDEX IF NOT EXISTS idx_project_contact_points_contact_id ON project_contact_points(contact_id);
CREATE INDEX IF NOT EXISTS idx_project_contact_points_role ON project_contact_points(role);
CREATE INDEX IF NOT EXISTS idx_project_contact_points_is_primary ON project_contact_points(is_primary);

-- Enable RLS on new table
ALTER TABLE project_contact_points ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for project_contact_points
CREATE POLICY "Users can access project contact points for their organization's projects" 
ON project_contact_points FOR ALL USING (
    project_id IN (
        SELECT id FROM projects 
        WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    )
);

-- =====================================================
-- 4. UPDATE ORGANIZATIONS TABLE
-- =====================================================

-- Add fields to organizations table to support customer organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_organizations_country ON organizations(country);
CREATE INDEX IF NOT EXISTS idx_organizations_city ON organizations(city);

-- =====================================================
-- 5. CREATE TRIGGERS FOR NEW TABLE
-- =====================================================

-- Create trigger for updated_at on project_contact_points
CREATE TRIGGER update_project_contact_points_updated_at 
    BEFORE UPDATE ON project_contact_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ADD ACTIVITY LOGGING FOR NEW TABLE
-- =====================================================

-- Add activity logging trigger for project_contact_points
CREATE TRIGGER log_project_contact_points_activity
    AFTER INSERT OR UPDATE OR DELETE ON project_contact_points
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- =====================================================
-- 7. ENABLE REALTIME FOR NEW TABLE
-- =====================================================

-- Enable realtime for project_contact_points
ALTER PUBLICATION supabase_realtime ADD TABLE project_contact_points;

-- =====================================================
-- 8. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get customer organization for a project
CREATE OR REPLACE FUNCTION get_project_customer_organization(project_uuid UUID)
RETURNS TABLE (
    organization_id UUID,
    organization_name VARCHAR(255),
    organization_slug VARCHAR(100)
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as organization_id,
        o.name as organization_name,
        o.slug as organization_slug
    FROM projects p
    JOIN organizations o ON p.customer_organization_id = o.id
    WHERE p.id = project_uuid;
END;
$$;

-- Function to get project contact points
CREATE OR REPLACE FUNCTION get_project_contact_points(project_uuid UUID)
RETURNS TABLE (
    contact_point_id UUID,
    contact_id UUID,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    role VARCHAR(100),
    is_primary BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pcp.id as contact_point_id,
        c.id as contact_id,
        c.contact_name,
        c.email as contact_email,
        c.phone as contact_phone,
        pcp.role,
        pcp.is_primary
    FROM project_contact_points pcp
    JOIN contacts c ON pcp.contact_id = c.id
    WHERE pcp.project_id = project_uuid
    ORDER BY pcp.is_primary DESC, c.contact_name;
END;
$$;

-- Function to validate customer organization migration
CREATE OR REPLACE FUNCTION validate_customer_organization_migration()
RETURNS TABLE (
    validation_type VARCHAR(50),
    count_value INTEGER,
    status VARCHAR(20)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check for projects with customer_id but no customer_organization_id
    RETURN QUERY
    SELECT 
        'projects_without_org'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'FAIL'::VARCHAR(20)
        END as status
    FROM projects 
    WHERE customer_id IS NOT NULL AND customer_organization_id IS NULL;
    
    -- Check for orphaned project_contact_points
    RETURN QUERY
    SELECT 
        'orphaned_contact_points'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'FAIL'::VARCHAR(20)
        END as status
    FROM project_contact_points pcp
    LEFT JOIN projects p ON pcp.project_id = p.id
    WHERE p.id IS NULL;
    
    -- Check for contacts without organization_id
    RETURN QUERY
    SELECT 
        'contacts_without_org'::VARCHAR(50) as validation_type,
        COUNT(*)::INTEGER as count_value,
        CASE 
            WHEN COUNT(*) = 0 THEN 'PASS'::VARCHAR(20)
            ELSE 'FAIL'::VARCHAR(20)
        END as status
    FROM contacts 
    WHERE type = 'customer' AND organization_id IS NULL;
END;
$$;

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions for new functions
GRANT EXECUTE ON FUNCTION get_project_customer_organization(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_contact_points(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_customer_organization_migration() TO authenticated;

-- =====================================================
-- 10. COMMENTS FOR DOCUMENTATION
-- =====================================================

-- Add comments to new columns and tables
COMMENT ON COLUMN projects.customer_organization_id IS 'References the customer organization for this project. Replaces direct customer contact relationship.';
COMMENT ON COLUMN contacts.role IS 'Role of the contact person (purchasing, engineering, quality, etc.)';
COMMENT ON COLUMN contacts.is_primary_contact IS 'Indicates if this is the primary contact for the organization';
COMMENT ON COLUMN contacts.description IS 'Additional context or description for the contact';

COMMENT ON TABLE project_contact_points IS 'Maps projects to their specific contact points within customer organizations';
COMMENT ON COLUMN project_contact_points.role IS 'Project-specific role for this contact point';
COMMENT ON COLUMN project_contact_points.is_primary IS 'Indicates if this is the primary contact point for this project';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
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
    '{"migration": "organizations_as_customers_phase_1", "status": "completed", "timestamp": "' || NOW() || '"}'
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration Phase 1 completed successfully: Organizations as Customers Schema Updates';
    RAISE NOTICE 'New tables created: project_contact_points';
    RAISE NOTICE 'New columns added: projects.customer_organization_id, contacts.role, contacts.is_primary_contact, contacts.description';
    RAISE NOTICE 'New functions created: get_project_customer_organization, get_project_contact_points, validate_customer_organization_migration';
    RAISE NOTICE 'Next step: Run Phase 2 data migration to populate customer organizations and update relationships';
END $$;
