-- Performance Indexes for Enhanced Factory Pulse Schema
-- This migration creates all necessary indexes for optimal query performance

-- =============================================
-- CORE ENTITY INDEXES
-- =============================================

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON organizations(is_active);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_plan ON organizations(subscription_plan);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Note: User column indexes will be created after the enhanced schema is fully applied

-- Contacts indexes
CREATE INDEX IF NOT EXISTS idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_company_name ON contacts(company_name);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_is_active ON contacts(is_active);
CREATE INDEX IF NOT EXISTS idx_contacts_country ON contacts(country);
CREATE INDEX IF NOT EXISTS idx_contacts_ai_risk_score ON contacts(ai_risk_score);

-- =============================================
-- WORKFLOW INDEXES
-- =============================================

-- Workflow stages indexes
CREATE INDEX IF NOT EXISTS idx_workflow_stages_organization_id ON workflow_stages(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_stages_slug ON workflow_stages(slug);
CREATE INDEX IF NOT EXISTS idx_workflow_stages_stage_order ON workflow_stages(stage_order);
CREATE INDEX IF NOT EXISTS idx_workflow_stages_is_active ON workflow_stages(is_active);

-- Workflow stage transitions indexes
CREATE INDEX IF NOT EXISTS idx_workflow_stage_transitions_organization_id ON workflow_stage_transitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_stage_transitions_from_stage ON workflow_stage_transitions(from_stage_id);
CREATE INDEX IF NOT EXISTS idx_workflow_stage_transitions_to_stage ON workflow_stage_transitions(to_stage_id);
CREATE INDEX IF NOT EXISTS idx_workflow_stage_transitions_is_allowed ON workflow_stage_transitions(is_allowed);

-- Workflow business rules indexes
CREATE INDEX IF NOT EXISTS idx_workflow_business_rules_organization ON workflow_business_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_business_rules_rule_type ON workflow_business_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_workflow_business_rules_is_active ON workflow_business_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_business_rules_priority ON workflow_business_rules(priority);

-- Workflow rule executions indexes
CREATE INDEX IF NOT EXISTS idx_workflow_rule_executions_rule_id ON workflow_rule_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_workflow_rule_executions_project_id ON workflow_rule_executions(project_id);
CREATE INDEX IF NOT EXISTS idx_workflow_rule_executions_triggered_by ON workflow_rule_executions(triggered_by);
CREATE INDEX IF NOT EXISTS idx_workflow_rule_executions_status ON workflow_rule_executions(execution_status);
CREATE INDEX IF NOT EXISTS idx_workflow_rule_executions_executed_at ON workflow_rule_executions(executed_at);

-- =============================================
-- PROJECT INDEXES
-- =============================================

-- Projects indexes (enhanced)
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_current_stage_id ON projects(current_stage_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority_level ON projects(priority_level);
CREATE INDEX IF NOT EXISTS idx_projects_priority_score ON projects(priority_score);
CREATE INDEX IF NOT EXISTS idx_projects_source ON projects(source);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON projects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);
CREATE INDEX IF NOT EXISTS idx_projects_project_id ON projects(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_estimated_delivery_date ON projects(estimated_delivery_date);
CREATE INDEX IF NOT EXISTS idx_projects_actual_delivery_date ON projects(actual_delivery_date);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_org_status ON projects(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_org_stage ON projects(organization_id, current_stage_id);
CREATE INDEX IF NOT EXISTS idx_projects_org_priority ON projects(organization_id, priority_level);
CREATE INDEX IF NOT EXISTS idx_projects_assignee_status ON projects(assigned_to, status);

-- GIN indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_projects_tags_gin ON projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_projects_metadata_gin ON projects USING GIN(metadata);

-- Project stage history indexes
CREATE INDEX IF NOT EXISTS idx_project_stage_history_project_id ON project_stage_history(project_id);
CREATE INDEX IF NOT EXISTS idx_project_stage_history_stage_id ON project_stage_history(stage_id);
CREATE INDEX IF NOT EXISTS idx_project_stage_history_entered_at ON project_stage_history(entered_at);
CREATE INDEX IF NOT EXISTS idx_project_stage_history_exited_at ON project_stage_history(exited_at);
CREATE INDEX IF NOT EXISTS idx_project_stage_history_entered_by ON project_stage_history(entered_by);

-- Project assignments indexes
CREATE INDEX IF NOT EXISTS idx_project_assignments_project_id ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_user_id ON project_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_role ON project_assignments(role);
CREATE INDEX IF NOT EXISTS idx_project_assignments_is_active ON project_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_project_assignments_assigned_at ON project_assignments(assigned_at);

-- =============================================
-- DOCUMENT INDEXES
-- =============================================

-- Documents indexes (enhanced)
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_access_level ON documents(access_level);
CREATE INDEX IF NOT EXISTS idx_documents_version ON documents(version);
CREATE INDEX IF NOT EXISTS idx_documents_is_latest ON documents(is_latest);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_ai_processing_status ON documents(ai_processing_status);
CREATE INDEX IF NOT EXISTS idx_documents_ai_processed_at ON documents(ai_processed_at);

-- Composite indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_project_type ON documents(project_id, document_type);
CREATE INDEX IF NOT EXISTS idx_documents_project_latest ON documents(project_id, is_latest);

-- GIN indexes for document JSONB fields
CREATE INDEX IF NOT EXISTS idx_documents_metadata_gin ON documents USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_documents_ai_extracted_data_gin ON documents USING GIN(ai_extracted_data);

-- Document versions indexes
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_version_number ON document_versions(version_number);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_at ON document_versions(created_at);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_by ON document_versions(created_by);

-- Document comments indexes
CREATE INDEX IF NOT EXISTS idx_document_comments_document_id ON document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_user_id ON document_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_parent_comment_id ON document_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_is_resolved ON document_comments(is_resolved);
CREATE INDEX IF NOT EXISTS idx_document_comments_created_at ON document_comments(created_at);

-- Document access log indexes
CREATE INDEX IF NOT EXISTS idx_document_access_log_document_id ON document_access_log(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_user_id ON document_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_action ON document_access_log(action);
CREATE INDEX IF NOT EXISTS idx_document_access_log_accessed_at ON document_access_log(accessed_at);

-- =============================================
-- REVIEW & APPROVAL INDEXES
-- =============================================

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_project_id ON reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_role ON reviews(reviewer_role);
CREATE INDEX IF NOT EXISTS idx_reviews_review_type ON reviews(review_type);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_priority ON reviews(priority);
CREATE INDEX IF NOT EXISTS idx_reviews_due_date ON reviews(due_date);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_at ON reviews(reviewed_at);

-- Review checklist items indexes
CREATE INDEX IF NOT EXISTS idx_review_checklist_items_review_id ON review_checklist_items(review_id);
CREATE INDEX IF NOT EXISTS idx_review_checklist_items_is_checked ON review_checklist_items(is_checked);
CREATE INDEX IF NOT EXISTS idx_review_checklist_items_is_required ON review_checklist_items(is_required);
CREATE INDEX IF NOT EXISTS idx_review_checklist_items_checked_by ON review_checklist_items(checked_by);

-- Approval chains indexes
CREATE INDEX IF NOT EXISTS idx_approval_chains_organization_id ON approval_chains(organization_id);
CREATE INDEX IF NOT EXISTS idx_approval_chains_entity_type ON approval_chains(entity_type);
CREATE INDEX IF NOT EXISTS idx_approval_chains_is_active ON approval_chains(is_active);
CREATE INDEX IF NOT EXISTS idx_approval_chains_created_by ON approval_chains(created_by);

-- Approval requests indexes
CREATE INDEX IF NOT EXISTS idx_approval_requests_chain_id ON approval_requests(chain_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_entity ON approval_requests(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_approver_id ON approval_requests(approver_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_approver_role ON approval_requests(approver_role);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_step_number ON approval_requests(step_number);
CREATE INDEX IF NOT EXISTS idx_approval_requests_expires_at ON approval_requests(expires_at);

-- =============================================
-- SUPPLIER MANAGEMENT INDEXES
-- =============================================

-- Supplier RFQs indexes
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_project_id ON supplier_rfqs(project_id);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_supplier_id ON supplier_rfqs(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_rfq_number ON supplier_rfqs(rfq_number);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_status ON supplier_rfqs(status);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_priority ON supplier_rfqs(priority);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_sent_at ON supplier_rfqs(sent_at);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_due_date ON supplier_rfqs(due_date);
CREATE INDEX IF NOT EXISTS idx_supplier_rfqs_created_by ON supplier_rfqs(created_by);

-- Supplier quotes indexes
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_supplier_rfq_id ON supplier_quotes(supplier_rfq_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_quote_number ON supplier_quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_currency ON supplier_quotes(currency);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_is_selected ON supplier_quotes(is_selected);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_submitted_at ON supplier_quotes(submitted_at);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_evaluated_by ON supplier_quotes(evaluated_by);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_evaluation_score ON supplier_quotes(evaluation_score);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_valid_until ON supplier_quotes(valid_until);

-- Supplier qualifications indexes
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_supplier_id ON supplier_qualifications(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_organization_id ON supplier_qualifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_qualification_type ON supplier_qualifications(qualification_type);
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_status ON supplier_qualifications(status);
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_tier ON supplier_qualifications(tier);
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_overall_score ON supplier_qualifications(overall_score);
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_next_review_date ON supplier_qualifications(next_review_date);
CREATE INDEX IF NOT EXISTS idx_supplier_qualifications_qualified_by ON supplier_qualifications(qualified_by);

-- Supplier performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_supplier_id ON supplier_performance_metrics(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_organization_id ON supplier_performance_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_metric_type ON supplier_performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_measurement_period ON supplier_performance_metrics(measurement_period);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_period_range ON supplier_performance_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_project_id ON supplier_performance_metrics(project_id);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_metrics_recorded_by ON supplier_performance_metrics(recorded_by);

-- =============================================
-- COMMUNICATION INDEXES
-- =============================================

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_type ON messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_sender_contact_id ON messages(sender_contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_type ON messages(recipient_type);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_role ON messages(recipient_role);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_department ON messages(recipient_department);
CREATE INDEX IF NOT EXISTS idx_messages_message_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_priority ON messages(priority);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Composite indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_project_thread ON messages(project_id, thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_unread ON messages(recipient_id, is_read);

-- GIN indexes for message JSONB fields
CREATE INDEX IF NOT EXISTS idx_messages_attachments_gin ON messages USING GIN(attachments);
CREATE INDEX IF NOT EXISTS idx_messages_metadata_gin ON messages USING GIN(metadata);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_project_id ON notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_delivery_method ON notifications(delivery_method);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_delivered_at ON notifications(delivered_at);

-- Composite indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_id, type);

-- =============================================
-- ACTIVITY & AUDIT INDEXES
-- =============================================

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_organization_id ON activity_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_project_id ON activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_contact_id ON activity_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_type ON activity_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_id ON activity_log(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

-- Composite indexes for activity log
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_action ON activity_log(user_id, action);

-- GIN indexes for activity log JSONB fields
CREATE INDEX IF NOT EXISTS idx_activity_log_old_values_gin ON activity_log USING GIN(old_values);
CREATE INDEX IF NOT EXISTS idx_activity_log_new_values_gin ON activity_log USING GIN(new_values);

-- System events indexes
CREATE INDEX IF NOT EXISTS idx_system_events_organization_id ON system_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_system_events_event_type ON system_events(event_type);
CREATE INDEX IF NOT EXISTS idx_system_events_source ON system_events(source);
CREATE INDEX IF NOT EXISTS idx_system_events_status ON system_events(status);
CREATE INDEX IF NOT EXISTS idx_system_events_created_at ON system_events(created_at);
CREATE INDEX IF NOT EXISTS idx_system_events_processed_at ON system_events(processed_at);

-- GIN index for system events payload
CREATE INDEX IF NOT EXISTS idx_system_events_payload_gin ON system_events USING GIN(payload);

-- =============================================
-- CONFIGURATION INDEXES
-- =============================================

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_preference_key ON user_preferences(preference_key);

-- Organization settings indexes
CREATE INDEX IF NOT EXISTS idx_organization_settings_organization_id ON organization_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_settings_setting_key ON organization_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_organization_settings_is_public ON organization_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_organization_settings_updated_by ON organization_settings(updated_by);

-- Email templates indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_organization_id ON email_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_template_key ON email_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active);

-- =============================================
-- BOM MANAGEMENT INDEXES
-- =============================================

-- BOM items indexes
CREATE INDEX IF NOT EXISTS idx_bom_items_project_id ON bom_items(project_id);
CREATE INDEX IF NOT EXISTS idx_bom_items_parent_item_id ON bom_items(parent_item_id);
CREATE INDEX IF NOT EXISTS idx_bom_items_item_number ON bom_items(item_number);
CREATE INDEX IF NOT EXISTS idx_bom_items_part_number ON bom_items(part_number);
CREATE INDEX IF NOT EXISTS idx_bom_items_supplier_id ON bom_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bom_items_material ON bom_items(material);
CREATE INDEX IF NOT EXISTS idx_bom_items_is_critical ON bom_items(is_critical);
CREATE INDEX IF NOT EXISTS idx_bom_items_is_long_lead ON bom_items(is_long_lead);
CREATE INDEX IF NOT EXISTS idx_bom_items_ai_extracted ON bom_items(ai_extracted);
CREATE INDEX IF NOT EXISTS idx_bom_items_ai_source_document_id ON bom_items(ai_source_document_id);
CREATE INDEX IF NOT EXISTS idx_bom_items_created_by ON bom_items(created_by);

-- GIN indexes for BOM JSONB fields
CREATE INDEX IF NOT EXISTS idx_bom_items_specifications_gin ON bom_items USING GIN(specifications);
CREATE INDEX IF NOT EXISTS idx_bom_items_tolerances_gin ON bom_items USING GIN(tolerances);

-- =============================================
-- AI PROCESSING INDEXES
-- =============================================

-- AI processing queue indexes
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_organization_id ON ai_processing_queue(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_entity_type ON ai_processing_queue(entity_type);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_entity_id ON ai_processing_queue(entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_processing_type ON ai_processing_queue(processing_type);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_priority ON ai_processing_queue(priority);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_status ON ai_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_scheduled_at ON ai_processing_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_started_at ON ai_processing_queue(started_at);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_completed_at ON ai_processing_queue(completed_at);

-- Composite indexes for AI processing queue
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_entity ON ai_processing_queue(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_status_priority ON ai_processing_queue(status, priority);

-- GIN indexes for AI processing JSONB fields
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_input_data_gin ON ai_processing_queue USING GIN(input_data);
CREATE INDEX IF NOT EXISTS idx_ai_processing_queue_output_data_gin ON ai_processing_queue USING GIN(output_data);

-- AI model configs indexes
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_organization_id ON ai_model_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_model_name ON ai_model_configs(model_name);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_model_type ON ai_model_configs(model_type);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_version ON ai_model_configs(version);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_is_active ON ai_model_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_model_configs_created_by ON ai_model_configs(created_by);

-- =============================================
-- CLOUD STORAGE INDEXES
-- =============================================

-- Cloud storage integrations indexes
CREATE INDEX IF NOT EXISTS idx_cloud_storage_integrations_organization_id ON cloud_storage_integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_cloud_storage_integrations_user_id ON cloud_storage_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_storage_integrations_provider ON cloud_storage_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_cloud_storage_integrations_is_active ON cloud_storage_integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_cloud_storage_integrations_sync_status ON cloud_storage_integrations(sync_status);
CREATE INDEX IF NOT EXISTS idx_cloud_storage_integrations_last_sync_at ON cloud_storage_integrations(last_sync_at);

-- Document sync log indexes
CREATE INDEX IF NOT EXISTS idx_document_sync_log_document_id ON document_sync_log(document_id);
CREATE INDEX IF NOT EXISTS idx_document_sync_log_integration_id ON document_sync_log(integration_id);
CREATE INDEX IF NOT EXISTS idx_document_sync_log_sync_action ON document_sync_log(sync_action);
CREATE INDEX IF NOT EXISTS idx_document_sync_log_status ON document_sync_log(status);
CREATE INDEX IF NOT EXISTS idx_document_sync_log_synced_at ON document_sync_log(synced_at);

-- =============================================
-- FULL-TEXT SEARCH INDEXES
-- =============================================

-- Full-text search indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_projects_title_fulltext ON projects USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_projects_description_fulltext ON projects USING GIN(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_contacts_company_name_fulltext ON contacts USING GIN(to_tsvector('english', company_name));
CREATE INDEX IF NOT EXISTS idx_contacts_notes_fulltext ON contacts USING GIN(to_tsvector('english', notes));
CREATE INDEX IF NOT EXISTS idx_documents_filename_fulltext ON documents USING GIN(to_tsvector('english', filename));
CREATE INDEX IF NOT EXISTS idx_messages_content_fulltext ON messages USING GIN(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_bom_items_description_fulltext ON bom_items USING GIN(to_tsvector('english', description));

-- =============================================
-- PARTIAL INDEXES FOR COMMON FILTERS
-- =============================================

-- Partial indexes for active records only (better performance for common queries)
CREATE INDEX IF NOT EXISTS idx_projects_active_only ON projects(organization_id, created_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_contacts_active_customers ON contacts(organization_id, company_name) WHERE type = 'customer' AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_contacts_active_suppliers ON contacts(organization_id, company_name) WHERE type = 'supplier' AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_documents_latest_only ON documents(project_id, document_type) WHERE is_latest = true;
CREATE INDEX IF NOT EXISTS idx_notifications_unread_only ON notifications(user_id, created_at) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_reviews_pending_only ON reviews(reviewer_id, created_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_selected_only ON supplier_quotes(supplier_rfq_id) WHERE is_selected = true;

-- =============================================
-- COMMIT TRANSACTION
-- =============================================

COMMIT;