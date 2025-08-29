-- Enable Row Level Security (RLS) for Factory Pulse Database
-- This migration implements comprehensive RLS policies for multi-tenant access control
-- Supports both internal users (employees) and portal users (customers/suppliers)

-- =============================================================================
-- HELPER FUNCTIONS (in public schema)
-- =============================================================================

-- Function to get current user's organization_id from users table
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id
    FROM public.users
    WHERE id::text = auth.uid()::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role
    FROM public.users
    WHERE id::text = auth.uid()::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is internal (Factory Pulse employee)
CREATE OR REPLACE FUNCTION public.is_internal_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'management', 'sales', 'procurement', 'engineering', 'production', 'qa')
    FROM public.users
    WHERE id::text = auth.uid()::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is portal user (customer/supplier)
CREATE OR REPLACE FUNCTION public.is_portal_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('customer', 'supplier')
    FROM public.users
    WHERE id::text = auth.uid()::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

-- Organizations table - Internal users can read all, portal users see their own org
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Users table - Users can see their own profile and internal users can see all
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Contacts table - Internal users can see all, portal users see contacts from their org
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Projects table - Multi-tenant access based on organization and user role
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Project assignments - Users can see assignments related to their projects
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;

-- Documents - Access based on project and user permissions
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Messages - Users can see messages they're involved in
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Reviews - Access based on project permissions
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Notifications - Users can only see their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Activity log - Internal users can see all, portal users see their org's activities
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Workflow stages - Read-only for all authenticated users
ALTER TABLE workflow_stages ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- =============================================================================
-- ORGANIZATIONS POLICIES
-- =============================================================================

-- Internal users can read all organizations
CREATE POLICY "organizations_internal_read" ON organizations
  FOR SELECT USING (public.is_internal_user());

-- Portal users can only see their own organization
CREATE POLICY "organizations_portal_read" ON organizations
  FOR SELECT USING (
    public.is_portal_user() AND
    id = public.get_current_user_org_id()
  );

-- Internal users can manage organizations (admin only for writes)
CREATE POLICY "organizations_internal_write" ON organizations
  FOR ALL USING (
    public.is_internal_user() AND
    public.get_current_user_role() IN ('admin', 'management')
  );

-- =============================================================================
-- USERS POLICIES
-- =============================================================================

-- Users can read their own profile
CREATE POLICY "users_self_read" ON users
  FOR SELECT USING (id::text = auth.uid()::text);

-- Internal users can read all user profiles
CREATE POLICY "users_internal_read" ON users
  FOR SELECT USING (public.is_internal_user());

-- Portal users can only see other portal users from their organization
CREATE POLICY "users_portal_read" ON users
  FOR SELECT USING (
    public.is_portal_user() AND
    organization_id = public.get_current_user_org_id()
  );

-- Users can update their own profile
CREATE POLICY "users_self_update" ON users
  FOR UPDATE USING (id::text = auth.uid()::text);

-- Internal users can manage user accounts (admin/management only)
CREATE POLICY "users_internal_manage" ON users
  FOR ALL USING (
    public.is_internal_user() AND
    public.get_current_user_role() IN ('admin', 'management')
  );

-- =============================================================================
-- CONTACTS POLICIES
-- =============================================================================

-- Internal users can read all contacts
CREATE POLICY "contacts_internal_read" ON contacts
  FOR SELECT USING (public.is_internal_user());

-- Portal users can only see contacts from their organization
CREATE POLICY "contacts_portal_read" ON contacts
  FOR SELECT USING (
    public.is_portal_user() AND
    organization_id = public.get_current_user_org_id()
  );

-- Internal users can manage contacts
CREATE POLICY "contacts_internal_manage" ON contacts
  FOR ALL USING (public.is_internal_user());

-- Portal users can update their own contact information
CREATE POLICY "contacts_portal_update" ON contacts
  FOR UPDATE USING (
    public.is_portal_user() AND
    organization_id = public.get_current_user_org_id() AND
    email = (SELECT email FROM public.users WHERE id::text = auth.uid()::text)
  );

-- =============================================================================
-- PROJECTS POLICIES
-- =============================================================================

-- Internal users can read all projects
CREATE POLICY "projects_internal_read" ON projects
  FOR SELECT USING (public.is_internal_user());

-- Portal users can only see projects where they are the customer
CREATE POLICY "projects_portal_read" ON projects
  FOR SELECT USING (
    public.is_portal_user() AND
    customer_id IN (
      SELECT id FROM contacts
      WHERE organization_id = public.get_current_user_org_id()
    )
  );

-- Internal users can manage projects based on their role
CREATE POLICY "projects_internal_manage" ON projects
  FOR ALL USING (public.is_internal_user());

-- =============================================================================
-- PROJECT ASSIGNMENTS POLICIES
-- =============================================================================

-- Users can see assignments for projects they can access
CREATE POLICY "project_assignments_read" ON project_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_assignments.project_id
      AND (
        public.is_internal_user() OR
        (public.is_portal_user() AND customer_id IN (
          SELECT id FROM contacts
          WHERE organization_id = public.get_current_user_org_id()
        ))
      )
    )
  );

-- Internal users can manage project assignments
CREATE POLICY "project_assignments_internal_manage" ON project_assignments
  FOR ALL USING (public.is_internal_user());

-- =============================================================================
-- DOCUMENTS POLICIES
-- =============================================================================

-- Users can access documents for projects they can access
CREATE POLICY "documents_read" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
      AND (
        public.is_internal_user() OR
        (public.is_portal_user() AND customer_id IN (
          SELECT id FROM contacts
          WHERE organization_id = public.get_current_user_org_id()
        ))
      )
    )
  );

-- Internal users can manage documents
CREATE POLICY "documents_internal_manage" ON documents
  FOR ALL USING (public.is_internal_user());

-- =============================================================================
-- MESSAGES POLICIES
-- =============================================================================

-- Users can see messages they sent or received
CREATE POLICY "messages_read" ON messages
  FOR SELECT USING (
    sender_user_id::text = auth.uid()::text OR
    recipient_user_id::text = auth.uid()::text OR
    (public.is_internal_user() AND sender_contact_id IS NOT NULL) OR
    (public.is_portal_user() AND sender_contact_id IN (
      SELECT id FROM contacts
      WHERE organization_id = public.get_current_user_org_id()
    ))
  );

-- Users can send messages
CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (sender_user_id::text = auth.uid()::text);

-- Internal users can manage all messages
CREATE POLICY "messages_internal_manage" ON messages
  FOR ALL USING (public.is_internal_user());

-- =============================================================================
-- REVIEWS POLICIES
-- =============================================================================

-- Users can see reviews for projects they can access
CREATE POLICY "reviews_read" ON reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = reviews.project_id
      AND (
        public.is_internal_user() OR
        (public.is_portal_user() AND customer_id IN (
          SELECT id FROM contacts
          WHERE organization_id = public.get_current_user_org_id()
        ))
      )
    )
  );

-- Internal users can manage reviews
CREATE POLICY "reviews_internal_manage" ON reviews
  FOR ALL USING (public.is_internal_user());

-- =============================================================================
-- NOTIFICATIONS POLICIES
-- =============================================================================

-- Users can only see their own notifications
CREATE POLICY "notifications_read" ON notifications
  FOR SELECT USING (user_id::text = auth.uid()::text);

-- Internal users can manage notifications
CREATE POLICY "notifications_internal_manage" ON notifications
  FOR ALL USING (public.is_internal_user());

-- =============================================================================
-- ACTIVITY LOG POLICIES
-- =============================================================================

-- Internal users can see all activity logs
CREATE POLICY "activity_log_internal_read" ON activity_log
  FOR SELECT USING (public.is_internal_user());

-- Portal users can see activity logs related to their organization
CREATE POLICY "activity_log_portal_read" ON activity_log
  FOR SELECT USING (
    public.is_portal_user() AND
    organization_id = public.get_current_user_org_id()
  );

-- Only internal users can create activity logs
CREATE POLICY "activity_log_internal_insert" ON activity_log
  FOR INSERT WITH CHECK (public.is_internal_user());

-- =============================================================================
-- WORKFLOW STAGES POLICIES
-- =============================================================================

-- All authenticated users can read workflow stages (read-only reference data)
CREATE POLICY "workflow_stages_read" ON workflow_stages
  FOR SELECT TO authenticated USING (true);

-- Only internal users can manage workflow stages
CREATE POLICY "workflow_stages_internal_manage" ON workflow_stages
  FOR ALL USING (public.is_internal_user());

-- =============================================================================
-- GRANT NECESSARY PERMISSIONS
-- =============================================================================

-- Grant execute permissions on RLS helper functions
GRANT EXECUTE ON FUNCTION public.get_current_user_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_internal_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_portal_user() TO authenticated;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON FUNCTION public.get_current_user_org_id() IS 'Gets the organization_id of the current authenticated user';
COMMENT ON FUNCTION public.get_current_user_role() IS 'Gets the role of the current authenticated user';
COMMENT ON FUNCTION public.is_internal_user() IS 'Checks if current user is an internal Factory Pulse employee';
COMMENT ON FUNCTION public.is_portal_user() IS 'Checks if current user is a portal user (customer/supplier)';

COMMENT ON POLICY "organizations_internal_read" ON organizations IS 'Internal users can read all organizations';
COMMENT ON POLICY "organizations_portal_read" ON organizations IS 'Portal users can only see their own organization';
COMMENT ON POLICY "users_self_read" ON users IS 'Users can read their own profile';
COMMENT ON POLICY "users_internal_read" ON users IS 'Internal users can read all user profiles';
COMMENT ON POLICY "projects_portal_read" ON projects IS 'Portal users can only see projects where they are the customer';
