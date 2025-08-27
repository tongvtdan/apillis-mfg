-- Row Level Security (RLS) Policies for Enhanced Factory Pulse Schema
-- This migration enables RLS and creates security policies for multi-tenant access control

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

-- Enable RLS on tables that exist
DO $$
BEGIN
    -- Core entities
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
        ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts') THEN
        ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Workflow entities
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_stages') THEN
        ALTER TABLE workflow_stages ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_stage_transitions') THEN
        ALTER TABLE workflow_stage_transitions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_business_rules') THEN
        ALTER TABLE workflow_business_rules ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_rule_executions') THEN
        ALTER TABLE workflow_rule_executions ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Project entities
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_stage_history') THEN
        ALTER TABLE project_stage_history ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_assignments') THEN
        ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Document entities
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
        ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_versions') THEN
        ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_comments') THEN
        ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_access_log') THEN
        ALTER TABLE document_access_log ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Review entities
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
        ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'review_checklist_items') THEN
        ALTER TABLE review_checklist_items ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Supplier entities
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supplier_rfqs') THEN
        ALTER TABLE supplier_rfqs ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supplier_quotes') THEN
        ALTER TABLE supplier_quotes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supplier_qualifications') THEN
        ALTER TABLE supplier_qualifications ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supplier_performance_metrics') THEN
        ALTER TABLE supplier_performance_metrics ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Communication entities
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Activity entities
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_log') THEN
        ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_events') THEN
        ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Configuration entities
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
        ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_settings') THEN
        ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;
-- Enable RLS on additional tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_templates') THEN
        ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'approval_chains') THEN
        ALTER TABLE approval_chains ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'approval_requests') THEN
        ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
    END IF;

    -- BOM entities
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bom_items') THEN
        ALTER TABLE bom_items ENABLE ROW LEVEL SECURITY;
    END IF;

    -- AI entities
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_processing_queue') THEN
        ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_model_configs') THEN
        ALTER TABLE ai_model_configs ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Cloud storage entities
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cloud_storage_integrations') THEN
        ALTER TABLE cloud_storage_integrations ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_sync_log') THEN
        ALTER TABLE document_sync_log ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- =============================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================

-- Function to get user's organization ID
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = auth.uid() 
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ORGANIZATION-BASED RLS POLICIES
-- =============================================

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can access their organization" ON organizations
  FOR ALL USING (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Users: Users can see other users in their organization
CREATE POLICY "Users can see users in their organization" ON users
  FOR ALL USING (
    organization_id = get_user_organization_id()
  );

-- Contacts: Organization-based access
CREATE POLICY "Users can access contacts in their organization" ON contacts
  FOR ALL USING (
    organization_id = get_user_organization_id()
  );

-- Workflow stages: Organization-based access
CREATE POLICY "Users can access workflow stages in their organization" ON workflow_stages
  FOR ALL USING (
    organization_id = get_user_organization_id()
  );

-- Projects: Organization-based access with role-based restrictions
CREATE POLICY "Users can access projects in their organization" ON projects
  FOR ALL USING (
    organization_id = get_user_organization_id()
  );

-- =============================================
-- PROJECT-SPECIFIC RLS POLICIES
-- =============================================

-- Project stage history: Access through project
CREATE POLICY "Users can access project stage history through project access" ON project_stage_history
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE organization_id = get_user_organization_id()
    )
  );

-- Project assignments: Access through project
CREATE POLICY "Users can access project assignments through project access" ON project_assignments
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE organization_id = get_user_organization_id()
    )
  );

-- Documents: Access through project with additional access level checks
CREATE POLICY "Users can access documents through project access" ON documents
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE organization_id = get_user_organization_id()
    )
    AND (
      access_level IN ('public', 'internal') OR
      (access_level = 'customer' AND user_has_role('customer')) OR
      (access_level = 'supplier' AND user_has_role('supplier')) OR
      user_has_role('admin') OR
      user_has_role('management')
    )
  );

-- Document versions: Access through document
CREATE POLICY "Users can access document versions through document access" ON document_versions
  FOR ALL USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE project_id IN (
        SELECT id FROM projects 
        WHERE organization_id = get_user_organization_id()
      )
    )
  );

-- Reviews: Access through project
CREATE POLICY "Users can access reviews through project access" ON reviews
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE organization_id = get_user_organization_id()
    )
  );

-- =============================================
-- USER-SPECIFIC RLS POLICIES
-- =============================================

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can only see their own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- User preferences: Users can only access their own preferences
CREATE POLICY "Users can only access their own preferences" ON user_preferences
  FOR ALL USING (user_id = auth.uid());

-- Messages: Users can see messages they sent or received
CREATE POLICY "Users can access messages they are involved in" ON messages
  FOR ALL USING (
    sender_id = auth.uid() OR
    recipient_id = auth.uid() OR
    project_id IN (
      SELECT id FROM projects 
      WHERE organization_id = get_user_organization_id()
    )
  );

-- =============================================
-- SUPPLIER-SPECIFIC RLS POLICIES
-- =============================================

-- Supplier RFQs: Access through project and supplier relationship
CREATE POLICY "Users can access supplier RFQs in their organization" ON supplier_rfqs
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE organization_id = get_user_organization_id()
    )
  );

-- Supplier quotes: Access through RFQ
CREATE POLICY "Users can access supplier quotes through RFQ access" ON supplier_quotes
  FOR ALL USING (
    supplier_rfq_id IN (
      SELECT id FROM supplier_rfqs 
      WHERE project_id IN (
        SELECT id FROM projects 
        WHERE organization_id = get_user_organization_id()
      )
    )
  );

-- =============================================
-- ADMIN & MANAGEMENT POLICIES
-- =============================================

-- Organization settings: Admin and management access
CREATE POLICY "Admin and management can access organization settings" ON organization_settings
  FOR ALL USING (
    organization_id = get_user_organization_id() AND
    (user_has_role('admin') OR user_has_role('management'))
  );

-- Activity log: Organization-based access with role restrictions
CREATE POLICY "Users can access activity log in their organization" ON activity_log
  FOR SELECT USING (
    organization_id = get_user_organization_id() AND
    (user_has_role('admin') OR user_has_role('management') OR user_id = auth.uid())
  );

-- System events: Admin only
CREATE POLICY "Only admins can access system events" ON system_events
  FOR ALL USING (
    organization_id = get_user_organization_id() AND
    user_has_role('admin')
  );

-- =============================================
-- CUSTOMER ACCESS POLICIES
-- =============================================

-- Customer project access: Customers can see their own projects
CREATE POLICY "Customers can see their own projects" ON projects
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM contacts 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND type = 'customer'
    )
  );

-- Customer document access: Customers can see documents for their projects
CREATE POLICY "Customers can see documents for their projects" ON documents
  FOR SELECT USING (
    access_level IN ('public', 'customer') AND
    project_id IN (
      SELECT id FROM projects 
      WHERE customer_id IN (
        SELECT id FROM contacts 
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND type = 'customer'
      )
    )
  );

-- =============================================
-- COMMIT TRANSACTION
-- =============================================

COMMIT;