-- Factory Pulse Advanced Features Migration
-- Migration: 20250127000005_advanced_features.sql
-- Description: Advanced features, configuration, and workflow automation
-- Date: 2025-08-27

-- 1. User preferences and settings
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, preference_key)
);

-- 2. Organization-wide settings
CREATE TABLE organization_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id),
    UNIQUE(organization_id, setting_key)
);

-- 3. Email templates for notifications
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    template_key VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, template_key)
);

-- 4. Workflow stage transitions (configurable)
CREATE TABLE workflow_stage_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    from_stage_id UUID REFERENCES workflow_stages(id) ON DELETE CASCADE,
    to_stage_id UUID REFERENCES workflow_stages(id) ON DELETE CASCADE,
    is_allowed BOOLEAN DEFAULT true,
    conditions JSONB DEFAULT '{}', -- JSON conditions for transition
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, from_stage_id, to_stage_id)
);

-- 5. Business rules for workflow automation
CREATE TABLE workflow_business_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN (
        'auto_advance', 'approval_required', 'notification', 'assignment', 'validation'
    )),
    trigger_conditions JSONB NOT NULL, -- When to trigger the rule
    actions JSONB NOT NULL, -- What actions to take
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 100, -- Lower number = higher priority
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- 6. Rule execution log for audit and debugging
CREATE TABLE workflow_rule_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES workflow_business_rules(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    triggered_by UUID REFERENCES users(id),
    trigger_event VARCHAR(100) NOT NULL,
    conditions_met JSONB NOT NULL,
    actions_taken JSONB NOT NULL,
    execution_status VARCHAR(20) DEFAULT 'success' CHECK (execution_status IN (
        'success', 'failed', 'partial', 'skipped'
    )),
    error_message TEXT,
    execution_time_ms INTEGER,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Configurable approval chains
CREATE TABLE approval_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    chain_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'project', 'quote', 'document', etc.
    conditions JSONB NOT NULL, -- When this chain applies
    steps JSONB NOT NULL, -- Array of approval steps
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- 8. Individual approval requests
CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain_id UUID REFERENCES approval_chains(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    step_number INTEGER NOT NULL,
    approver_id UUID REFERENCES users(id),
    approver_role VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'delegated', 'expired'
    )),
    comments TEXT,
    approved_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Supplier qualification and scoring system
CREATE TABLE supplier_qualifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    qualification_type VARCHAR(50) NOT NULL CHECK (qualification_type IN (
        'initial', 'annual', 'project_specific', 'audit', 'certification'
    )),
    overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    quality_score DECIMAL(5,2) CHECK (quality_score >= 0 AND quality_score <= 100),
    delivery_score DECIMAL(5,2) CHECK (delivery_score >= 0 AND delivery_score <= 100),
    cost_score DECIMAL(5,2) CHECK (cost_score >= 0 AND cost_score <= 100),
    communication_score DECIMAL(5,2) CHECK (communication_score >= 0 AND communication_score <= 100),
    technical_capability_score DECIMAL(5,2) CHECK (technical_capability_score >= 0 AND technical_capability_score <= 100),
    financial_stability_score DECIMAL(5,2) CHECK (financial_stability_score >= 0 AND financial_stability_score <= 100),
    compliance_score DECIMAL(5,2) CHECK (compliance_score >= 0 AND compliance_score <= 100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
        'active', 'probation', 'suspended', 'blacklisted', 'pending_review'
    )),
    tier VARCHAR(20) DEFAULT 'standard' CHECK (tier IN (
        'preferred', 'standard', 'conditional', 'restricted'
    )),
    capabilities JSONB DEFAULT '[]', -- Array of capabilities
    certifications JSONB DEFAULT '[]', -- Array of certifications
    risk_factors JSONB DEFAULT '[]', -- Array of identified risks
    improvement_areas JSONB DEFAULT '[]', -- Areas needing improvement
    notes TEXT,
    next_review_date DATE,
    qualified_by UUID REFERENCES users(id),
    qualified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Supplier performance tracking
CREATE TABLE supplier_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN (
        'on_time_delivery', 'quality_rating', 'cost_variance', 'response_time',
        'defect_rate', 'lead_time_accuracy', 'communication_rating'
    )),
    metric_value DECIMAL(10,4) NOT NULL,
    target_value DECIMAL(10,4),
    measurement_period VARCHAR(20) NOT NULL CHECK (measurement_period IN (
        'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    )),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    project_id UUID REFERENCES projects(id), -- Optional: project-specific metrics
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Bill of Materials (BOM) management
CREATE TABLE bom_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    parent_item_id UUID REFERENCES bom_items(id), -- For hierarchical BOM
    item_number VARCHAR(100) NOT NULL,
    part_number VARCHAR(100),
    description TEXT NOT NULL,
    material VARCHAR(255),
    quantity DECIMAL(10,4) NOT NULL DEFAULT 1,
    unit_of_measure VARCHAR(20) DEFAULT 'pcs',
    unit_cost DECIMAL(15,4),
    total_cost DECIMAL(15,2),
    supplier_id UUID REFERENCES contacts(id),
    lead_time_days INTEGER,
    minimum_order_qty DECIMAL(10,4),
    specifications JSONB DEFAULT '{}',
    tolerances JSONB DEFAULT '{}',
    notes TEXT,
    is_critical BOOLEAN DEFAULT false,
    is_long_lead BOOLEAN DEFAULT false,
    -- AI-extracted fields
    ai_extracted BOOLEAN DEFAULT false,
    ai_confidence DECIMAL(5,2),
    ai_source_document_id UUID REFERENCES documents(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- 12. AI processing queue and results
CREATE TABLE ai_processing_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN (
        'document', 'supplier', 'project', 'bom', 'quote'
    )),
    entity_id UUID NOT NULL,
    processing_type VARCHAR(50) NOT NULL CHECK (processing_type IN (
        'document_extraction', 'supplier_categorization', 'bom_generation',
        'quote_analysis', 'risk_assessment', 'compliance_check'
    )),
    priority INTEGER DEFAULT 100, -- Lower number = higher priority
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN (
        'queued', 'processing', 'completed', 'failed', 'cancelled'
    )),
    input_data JSONB NOT NULL,
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    processing_time_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AI model configurations and versions
CREATE TABLE ai_model_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL CHECK (model_type IN (
        'document_extraction', 'classification', 'scoring', 'prediction', 'nlp'
    )),
    version VARCHAR(20) NOT NULL,
    configuration JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(organization_id, model_name, version)
);

-- 14. Cloud storage integrations
CREATE TABLE cloud_storage_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- User who set up the integration
    provider VARCHAR(50) NOT NULL CHECK (provider IN (
        'google_drive', 'dropbox', 'onedrive', 's3', 'azure_blob'
    )),
    integration_name VARCHAR(255) NOT NULL,
    credentials JSONB NOT NULL, -- Encrypted credentials
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    sync_status VARCHAR(20) DEFAULT 'active' CHECK (sync_status IN (
        'active', 'error', 'disabled', 'expired'
    )),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Document sync log for cloud storage
CREATE TABLE document_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES cloud_storage_integrations(id) ON DELETE CASCADE,
    sync_action VARCHAR(20) NOT NULL CHECK (sync_action IN (
        'upload', 'download', 'update', 'delete', 'conflict_resolution'
    )),
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'success', 'failed', 'pending', 'conflict'
    )),
    error_message TEXT,
    file_size_bytes BIGINT,
    sync_duration_ms INTEGER,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_preference_key ON user_preferences(preference_key);

CREATE INDEX idx_organization_settings_organization_id ON organization_settings(organization_id);
CREATE INDEX idx_organization_settings_setting_key ON organization_settings(setting_key);
CREATE INDEX idx_organization_settings_is_public ON organization_settings(is_public);
CREATE INDEX idx_organization_settings_updated_by ON organization_settings(updated_by);

CREATE INDEX idx_email_templates_organization_id ON email_templates(organization_id);
CREATE INDEX idx_email_templates_template_key ON email_templates(template_key);
CREATE INDEX idx_email_templates_is_active ON email_templates(is_active);

CREATE INDEX idx_workflow_stage_transitions_organization_id ON workflow_stage_transitions(organization_id);
CREATE INDEX idx_workflow_stage_transitions_from_stage ON workflow_stage_transitions(from_stage_id);
CREATE INDEX idx_workflow_stage_transitions_to_stage ON workflow_stage_transitions(to_stage_id);
CREATE INDEX idx_workflow_stage_transitions_is_allowed ON workflow_stage_transitions(is_allowed);

CREATE INDEX idx_workflow_business_rules_organization ON workflow_business_rules(organization_id);
CREATE INDEX idx_workflow_business_rules_rule_type ON workflow_business_rules(rule_type);
CREATE INDEX idx_workflow_business_rules_is_active ON workflow_business_rules(is_active);
CREATE INDEX idx_workflow_business_rules_priority ON workflow_business_rules(priority);
CREATE INDEX idx_workflow_business_rules_created_by ON workflow_business_rules(created_by);

CREATE INDEX idx_workflow_rule_executions_rule_id ON workflow_rule_executions(rule_id);
CREATE INDEX idx_workflow_rule_executions_project_id ON workflow_rule_executions(project_id);
CREATE INDEX idx_workflow_rule_executions_triggered_by ON workflow_rule_executions(triggered_by);
CREATE INDEX idx_workflow_rule_executions_status ON workflow_rule_executions(execution_status);
CREATE INDEX idx_workflow_rule_executions_executed_at ON workflow_rule_executions(executed_at);

CREATE INDEX idx_approval_chains_organization_id ON approval_chains(organization_id);
CREATE INDEX idx_approval_chains_entity_type ON approval_chains(entity_type);
CREATE INDEX idx_approval_chains_is_active ON approval_chains(is_active);
CREATE INDEX idx_approval_chains_created_by ON approval_chains(created_by);

CREATE INDEX idx_approval_requests_chain_id ON approval_requests(chain_id);
CREATE INDEX idx_approval_requests_entity ON approval_requests(entity_type, entity_id);
CREATE INDEX idx_approval_requests_approver_id ON approval_requests(approver_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
CREATE INDEX idx_approval_requests_step_number ON approval_requests(step_number);
CREATE INDEX idx_approval_requests_expires_at ON approval_requests(expires_at);

CREATE INDEX idx_supplier_qualifications_supplier_id ON supplier_qualifications(supplier_id);
CREATE INDEX idx_supplier_qualifications_organization_id ON supplier_qualifications(organization_id);
CREATE INDEX idx_supplier_qualifications_qualification_type ON supplier_qualifications(qualification_type);
CREATE INDEX idx_supplier_qualifications_status ON supplier_qualifications(status);
CREATE INDEX idx_supplier_qualifications_tier ON supplier_qualifications(tier);
CREATE INDEX idx_supplier_qualifications_overall_score ON supplier_qualifications(overall_score);
CREATE INDEX idx_supplier_qualifications_next_review_date ON supplier_qualifications(next_review_date);
CREATE INDEX idx_supplier_qualifications_qualified_by ON supplier_qualifications(qualified_by);

CREATE INDEX idx_supplier_performance_metrics_supplier_id ON supplier_performance_metrics(supplier_id);
CREATE INDEX idx_supplier_performance_metrics_organization_id ON supplier_performance_metrics(organization_id);
CREATE INDEX idx_supplier_performance_metrics_metric_type ON supplier_performance_metrics(metric_type);
CREATE INDEX idx_supplier_performance_metrics_measurement_period ON supplier_performance_metrics(measurement_period);
CREATE INDEX idx_supplier_performance_metrics_period_range ON supplier_performance_metrics(period_start, period_end);
CREATE INDEX idx_supplier_performance_metrics_project_id ON supplier_performance_metrics(project_id);
CREATE INDEX idx_supplier_performance_metrics_recorded_by ON supplier_performance_metrics(recorded_by);

CREATE INDEX idx_bom_items_project_id ON bom_items(project_id);
CREATE INDEX idx_bom_items_parent_item_id ON bom_items(parent_item_id);
CREATE INDEX idx_bom_items_item_number ON bom_items(item_number);
CREATE INDEX idx_bom_items_part_number ON bom_items(part_number);
CREATE INDEX idx_bom_items_supplier_id ON bom_items(supplier_id);
CREATE INDEX idx_bom_items_material ON bom_items(material);
CREATE INDEX idx_bom_items_is_critical ON bom_items(is_critical);
CREATE INDEX idx_bom_items_is_long_lead ON bom_items(is_long_lead);
CREATE INDEX idx_bom_items_ai_extracted ON bom_items(ai_extracted);
CREATE INDEX idx_bom_items_ai_source_document_id ON bom_items(ai_source_document_id);
CREATE INDEX idx_bom_items_created_by ON bom_items(created_by);

CREATE INDEX idx_ai_processing_queue_organization_id ON ai_processing_queue(organization_id);
CREATE INDEX idx_ai_processing_queue_entity_type ON ai_processing_queue(entity_type);
CREATE INDEX idx_ai_processing_queue_entity_id ON ai_processing_queue(entity_id);
CREATE INDEX idx_ai_processing_queue_processing_type ON ai_processing_queue(processing_type);
CREATE INDEX idx_ai_processing_queue_priority ON ai_processing_queue(priority);
CREATE INDEX idx_ai_processing_queue_status ON ai_processing_queue(status);
CREATE INDEX idx_ai_processing_queue_scheduled_at ON ai_processing_queue(scheduled_at);
CREATE INDEX idx_ai_processing_queue_started_at ON ai_processing_queue(started_at);
CREATE INDEX idx_ai_processing_queue_completed_at ON ai_processing_queue(completed_at);

CREATE INDEX idx_ai_model_configs_organization_id ON ai_model_configs(organization_id);
CREATE INDEX idx_ai_model_configs_model_name ON ai_model_configs(model_name);
CREATE INDEX idx_ai_model_configs_model_type ON ai_model_configs(model_type);
CREATE INDEX idx_ai_model_configs_version ON ai_model_configs(version);
CREATE INDEX idx_ai_model_configs_is_active ON ai_model_configs(is_active);
CREATE INDEX idx_ai_model_configs_created_by ON ai_model_configs(created_by);

CREATE INDEX idx_cloud_storage_integrations_organization_id ON cloud_storage_integrations(organization_id);
CREATE INDEX idx_cloud_storage_integrations_user_id ON cloud_storage_integrations(user_id);
CREATE INDEX idx_cloud_storage_integrations_provider ON cloud_storage_integrations(provider);
CREATE INDEX idx_cloud_storage_integrations_is_active ON cloud_storage_integrations(is_active);
CREATE INDEX idx_cloud_storage_integrations_sync_status ON cloud_storage_integrations(sync_status);
CREATE INDEX idx_cloud_storage_integrations_last_sync_at ON cloud_storage_integrations(last_sync_at);

CREATE INDEX idx_document_sync_log_document_id ON document_sync_log(document_id);
CREATE INDEX idx_document_sync_log_integration_id ON document_sync_log(integration_id);
CREATE INDEX idx_document_sync_log_sync_action ON document_sync_log(sync_action);
CREATE INDEX idx_document_sync_log_status ON document_sync_log(status);
CREATE INDEX idx_document_sync_log_synced_at ON document_sync_log(synced_at);

-- Enable Row Level Security (RLS)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_stage_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_business_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_rule_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_storage_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sync_log ENABLE ROW LEVEL SECURITY;

-- Create triggers for automation
CREATE TRIGGER update_organization_settings_updated_at BEFORE UPDATE ON organization_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_stage_transitions_updated_at BEFORE UPDATE ON workflow_stage_transitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_business_rules_updated_at BEFORE UPDATE ON workflow_business_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_chains_updated_at BEFORE UPDATE ON approval_chains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplier_qualifications_updated_at BEFORE UPDATE ON supplier_qualifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bom_items_updated_at BEFORE UPDATE ON bom_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_model_configs_updated_at BEFORE UPDATE ON ai_model_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cloud_storage_integrations_updated_at BEFORE UPDATE ON cloud_storage_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for project stage transitions
CREATE OR REPLACE FUNCTION handle_project_stage_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Log stage entry
    INSERT INTO project_stage_history (
        project_id, stage_id, entered_at, entered_by
    ) VALUES (
        NEW.id, NEW.current_stage_id, NOW(), auth.uid()
    );
    
    -- Close previous stage if exists
    UPDATE project_stage_history 
    SET exited_at = NOW(),
        duration_minutes = EXTRACT(EPOCH FROM (NOW() - entered_at)) / 60
    WHERE project_id = NEW.id 
    AND exited_at IS NULL 
    AND stage_id != NEW.current_stage_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER project_stage_transition_trigger
    AFTER UPDATE OF current_stage_id ON projects
    FOR EACH ROW
    WHEN (OLD.current_stage_id IS DISTINCT FROM NEW.current_stage_id)
    EXECUTE FUNCTION handle_project_stage_transition();

-- Create trigger for calculating days in stage
CREATE OR REPLACE FUNCTION calculate_days_in_stage()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate duration when stage is exited
    IF NEW.exited_at IS NOT NULL AND OLD.exited_at IS NULL THEN
        NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.exited_at - NEW.entered_at)) / 60;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_days_in_stage_trigger
    BEFORE UPDATE ON project_stage_history
    FOR EACH ROW EXECUTE FUNCTION calculate_days_in_stage();

-- Create broadcast triggers for realtime updates
CREATE OR REPLACE FUNCTION broadcast_project_update()
RETURNS TRIGGER AS $$
BEGIN
    -- This function will be used by Supabase realtime
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER broadcast_project_update_trigger
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION broadcast_project_update();

CREATE TRIGGER broadcast_message_update_trigger
    AFTER INSERT OR UPDATE OR DELETE ON messages
    FOR EACH ROW EXECUTE FUNCTION broadcast_project_update();

CREATE TRIGGER broadcast_notification_update_trigger
    AFTER INSERT OR UPDATE OR DELETE ON notifications
    FOR EACH ROW EXECUTE FUNCTION broadcast_project_update();

CREATE TRIGGER broadcast_document_update_trigger
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION broadcast_project_update();

CREATE TRIGGER broadcast_review_update_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION broadcast_project_update();

CREATE TRIGGER broadcast_supplier_quote_update_trigger
    AFTER INSERT OR UPDATE OR DELETE ON supplier_quotes
    FOR EACH ROW EXECUTE FUNCTION broadcast_project_update();
