-- Migration Script: Create Advanced Features Tables
-- This script creates the remaining system tables for advanced features
-- Date: 2025-01-27

-- ============================================================================
-- STEP 1: Create activity_log table
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id),
    user_id UUID REFERENCES users(id),
    contact_id UUID REFERENCES contacts(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 2: Create system_events table
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    source VARCHAR(50) DEFAULT 'system',
    status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payload JSONB,
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: Create user_preferences table
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, preference_key)
);

-- ============================================================================
-- STEP 4: Create organization_settings table
-- ============================================================================
CREATE TABLE IF NOT EXISTS organization_settings (
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (organization_id, setting_key)
);

-- ============================================================================
-- STEP 5: Create email_templates table
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    template_key VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    html_content TEXT,
    text_content TEXT,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, template_key)
);

-- ============================================================================
-- STEP 6: Create workflow_stage_transitions table
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflow_stage_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    from_stage_id UUID REFERENCES workflow_stages(id),
    to_stage_id UUID REFERENCES workflow_stages(id),
    is_allowed BOOLEAN DEFAULT true,
    conditions JSONB,
    auto_advance BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, from_stage_id, to_stage_id)
);

-- ============================================================================
-- STEP 7: Create workflow_business_rules table
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflow_business_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    rule_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 8: Create workflow_rule_executions table
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflow_rule_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES workflow_business_rules(id),
    project_id UUID REFERENCES projects(id),
    triggered_by VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
    execution_log JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT
);

-- ============================================================================
-- STEP 9: Create approval_chains table
-- ============================================================================
CREATE TABLE IF NOT EXISTS approval_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    chain_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 10: Create approval_requests table
-- ============================================================================
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain_id UUID REFERENCES approval_chains(id) ON DELETE CASCADE,
    entity UUID NOT NULL,
    approver_id UUID REFERENCES users(id),
    step_number INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    comments TEXT,
    approved_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 11: Create bom_items table
-- ============================================================================
CREATE TABLE IF NOT EXISTS bom_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    parent_item_id UUID REFERENCES bom_items(id),
    item_number VARCHAR(50) NOT NULL,
    part_number VARCHAR(100),
    supplier_id UUID REFERENCES contacts(id),
    material VARCHAR(100),
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(20) DEFAULT 'pcs',
    unit_cost DECIMAL(15,4),
    total_cost DECIMAL(15,4),
    is_critical BOOLEAN DEFAULT false,
    is_long_lead BOOLEAN DEFAULT false,
    ai_extracted BOOLEAN DEFAULT false,
    ai_source_document_id UUID REFERENCES documents(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 12: Create ai_processing_queue table
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_processing_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    processing_type VARCHAR(50) NOT NULL,
    priority INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payload JSONB,
    result JSONB,
    error_message TEXT,
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 13: Create ai_model_configs table
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_model_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    version VARCHAR(20) NOT NULL,
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, model_name, version)
);

-- ============================================================================
-- STEP 14: Create cloud_storage_integrations table
-- ============================================================================
CREATE TABLE IF NOT EXISTS cloud_storage_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    provider VARCHAR(50) NOT NULL,
    integration_type VARCHAR(50) NOT NULL,
    credentials JSONB,
    settings JSONB,
    sync_status VARCHAR(20) DEFAULT 'idle' 
      CHECK (sync_status IN ('idle', 'syncing', 'error', 'disabled')),
    last_sync_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 15: Create document_sync_log table
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES cloud_storage_integrations(id) ON DELETE CASCADE,
    sync_action VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'success', 'failed')),
    error_message TEXT,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 16: Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_activity_log_organization_id ON activity_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_project_id ON activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_contact_id ON activity_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_type ON activity_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

CREATE INDEX IF NOT EXISTS idx_system_events_organization_id ON system_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_system_events_event_type ON system_events(event_type);
CREATE INDEX IF NOT EXISTS idx_system_events_source ON system_events(source);
CREATE INDEX IF NOT EXISTS idx_system_events_status ON system_events(status);
CREATE INDEX IF NOT EXISTS idx_system_events_created_at ON system_events(created_at);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_preference_key ON user_preferences(preference_key);

CREATE INDEX IF NOT EXISTS idx_organization_settings_organization_id ON organization_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_settings_setting_key ON organization_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_organization_settings_is_public ON organization_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_organization_settings_updated_by ON organization_settings(updated_by);

CREATE INDEX IF NOT EXISTS idx_email_templates_organization_id ON email_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_template_key ON email_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_workflow_stage_transitions_organization_id ON workflow_stage_transitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_stage_transitions_from_stage ON workflow_stage_transitions(from_stage_id);
CREATE INDEX IF NOT EXISTS idx_workflow_stage_transitions_to_stage ON workflow_stage_transitions(to_stage_id);
CREATE INDEX IF NOT EXISTS idx_workflow_stage_transitions_is_allowed ON workflow_stage_transitions(is_allowed);

CREATE INDEX IF NOT EXISTS idx_workflow_business_rules_organization ON workflow_business_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_business_rules_rule_type ON workflow_business_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_workflow_business_rules_is_active ON workflow_business_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_business_rules_priority ON workflow_business_rules(priority);
CREATE INDEX IF NOT EXISTS idx_workflow_business_rules_created_by ON workflow_business_rules(created_by);

CREATE INDEX IF NOT EXISTS idx_workflow_rule_executions_rule_id ON workflow_rule_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_workflow_rule_executions_project_id ON workflow_rule_executions(project_id);
CREATE INDEX IF NOT EXISTS idx_workflow_rule_executions_triggered_by ON workflow_rule_executions(triggered_by);
CREATE INDEX IF NOT EXISTS idx_workflow_rule_executions_status ON workflow_rule_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_rule_executions_executed_at ON workflow_rule_executions(started_at);

CREATE INDEX IF NOT EXISTS idx_approval_chains_organization_id ON approval_chains(organization_id);
CREATE INDEX IF NOT EXISTS idx_approval_chains_entity_type ON approval_chains(entity_type);
CREATE INDEX IF NOT EXISTS idx_approval_chains_is_active ON approval_chains(is_active);
CREATE INDEX IF NOT EXISTS idx_approval_chains_created_by ON approval_chains(created_by);

CREATE INDEX IF NOT EXISTS idx_approval_requests_chain_id ON approval_requests(chain_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_entity ON approval_requests(entity);
CREATE INDEX IF NOT EXISTS idx_approval_requests_approver_id ON approval_requests(approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_step_number ON approval_requests(step_number);
CREATE INDEX IF NOT EXISTS idx_approval_requests_expires_at ON approval_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_approval_requests_created_at ON approval_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_bom_items_project_id ON bom_items(project_id);
CREATE INDEX IF NOT EXISTS idx_bom_items_parent_item_id ON bom_items(parent_item_id);
CREATE INDEX IF NOT EXISTS idx_bom_items_item_number ON bom_items(item_number);
CREATE INDEX IF NOT EXISTS idx_bom_items_part_number ON bom_items(part_number);
CREATE INDEX IF NOT EXISTS idx_bom_items_supplier_id ON bom_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bom_items_is_critical ON bom_items(is_critical);
CREATE INDEX IF NOT EXISTS idx_bom_items_is_long_lead ON bom_items(is_long_lead);
CREATE INDEX IF NOT EXISTS idx_bom_items_ai_extracted ON bom_items(ai_extracted);
CREATE INDEX IF NOT EXISTS idx_bom_items_ai_source_document_id ON bom_items(ai_source_document_id);
CREATE INDEX IF NOT EXISTS idx_bom_items_created_by ON bom_items(created_by);

CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_organization_id ON ai_processing_queue(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_entity_type ON ai_processing_queue(entity_type);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_entity_id ON ai_processing_queue(entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_priority ON ai_processing_queue(priority);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_status ON ai_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_scheduled_at ON ai_processing_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_started_at ON ai_processing_queue(started_at);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_completed_at ON ai_processing_queue(completed_at);

CREATE INDEX IF NOT EXISTS idx_ai_model_configs_organization_id ON ai_model_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_model_name ON ai_model_configs(model_name);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_model_type ON ai_model_configs(model_type);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_version ON ai_model_configs(version);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_is_active ON ai_model_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_created_by ON ai_model_configs(created_by);

CREATE INDEX IF NOT EXISTS idx_cloud_storage_integrations_organization_id ON cloud_storage_integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_cloud_storage_integrations_user_id ON cloud_storage_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_storage_integrations_provider ON cloud_storage_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_cloud_storage_integrations_is_active ON cloud_storage_integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_cloud_storage_integrations_sync_status ON cloud_storage_integrations(sync_status);
CREATE INDEX IF NOT EXISTS idx_cloud_storage_integrations_last_sync_at ON cloud_storage_integrations(last_sync_at);

CREATE INDEX IF NOT EXISTS idx_document_sync_log_document_id ON document_sync_log(document_id);
CREATE INDEX IF NOT EXISTS idx_document_sync_log_integration_id ON document_sync_log(integration_id);
CREATE INDEX IF NOT EXISTS idx_document_sync_log_sync_action ON document_sync_log(sync_action);
CREATE INDEX IF NOT EXISTS idx_document_sync_log_status ON document_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_document_sync_log_synced_at ON document_sync_log(synced_at);

-- ============================================================================
-- STEP 17: Enable Row Level Security
-- ============================================================================
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_stage_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_business_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_rule_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_storage_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sync_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 18: Create RLS policies for activity_log table
-- ============================================================================
-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs" ON activity_log
FOR SELECT
TO public
USING (
  -- Users can view their own logs
  user_id = auth.uid()
  OR
  -- Admin users can view all logs (using the function)
  is_user_admin()
  OR
  -- Service role can view all logs
  auth.role() = 'service_role'
);

-- Users can insert their own activity logs
CREATE POLICY "Users can insert their own activity logs" ON activity_log
FOR INSERT
TO public
WITH CHECK (
  -- Users can insert logs for themselves
  user_id = auth.uid()
  OR
  -- Admin users can insert logs for any user
  is_user_admin()
  OR
  -- Service role can insert any logs
  auth.role() = 'service_role'
);

-- Users can update their own activity logs
CREATE POLICY "Users can update their own activity logs" ON activity_log
FOR UPDATE
TO public
USING (
  -- Users can update their own logs
  user_id = auth.uid()
  OR
  -- Admin users can update any logs
  is_user_admin()
  OR
  -- Service role can update any logs
  auth.role() = 'service_role'
);

-- Users can delete their own activity logs
CREATE POLICY "Users can delete their own activity logs" ON activity_log
FOR DELETE
TO public
USING (
  -- Users can delete their own logs
  user_id = auth.uid()
  OR
  -- Admin users can delete any logs
  is_user_admin()
  OR
  -- Service role can delete any logs
  auth.role() = 'service_role'
);

-- ============================================================================
-- STEP 19: Create dashboard functions
-- ============================================================================
-- Create the get_dashboard_summary function
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Get projects summary
  SELECT json_build_object(
    'projects', json_build_object(
      'total', (SELECT COUNT(*) FROM projects),
      'by_status', (
        SELECT json_object_agg(status, count)
        FROM (
          SELECT status, COUNT(*) as count
          FROM projects
          GROUP BY status
        ) status_counts
      )
    ),
    'recent_projects', (
      SELECT json_agg(
        json_build_object(
          'id', p.id,
          'project_id', p.project_id,
          'title', p.title,
          'status', p.status,
          'priority', p.priority_level,
          'created_at', p.created_at,
          'customer_name', p.customer_name
        )
      )
      FROM (
        SELECT p.id, p.project_id, p.title, p.status, p.priority_level, p.created_at, c.company_name as customer_name
        FROM projects p
        LEFT JOIN contacts c ON p.customer_id = c.id
        ORDER BY p.created_at DESC
        LIMIT 5
      ) p
    ),
    'generated_at', extract(epoch from now())
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_dashboard_summary() TO authenticated;

-- ============================================================================
-- STEP 20: Add comments for documentation
-- ============================================================================
COMMENT ON TABLE activity_log IS 'Activity log table with RLS policies for user access control';
COMMENT ON FUNCTION get_dashboard_summary() IS 'Returns dashboard summary data including project counts and recent projects';
