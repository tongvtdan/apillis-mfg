-- Migration Script: Convert users table to use user_id from Supabase auth
-- This script handles all foreign key dependencies properly
-- Date: 2025-01-27

-- ============================================================================
-- STEP 1: Backup current data (IMPORTANT - Run this first!)
-- ============================================================================
CREATE TABLE users_backup AS SELECT * FROM users;

-- ============================================================================
-- STEP 2: Drop ALL foreign key constraints that reference users.id
-- ============================================================================

-- Drop foreign key constraints from users table
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_direct_manager_id_fkey;

-- Drop foreign key constraints from contacts table
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_created_by_fkey;

-- Drop foreign key constraints from projects table
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_created_by_fkey;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_assigned_to_fkey;

-- Drop foreign key constraints from project_stage_history table
ALTER TABLE project_stage_history DROP CONSTRAINT IF EXISTS project_stage_history_entered_by_fkey;

-- Drop foreign key constraints from project_assignments table
ALTER TABLE project_assignments DROP CONSTRAINT IF EXISTS project_assignments_user_id_fkey;
ALTER TABLE project_assignments DROP CONSTRAINT IF EXISTS project_assignments_assigned_by_fkey;

-- Drop foreign key constraints from documents table
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_uploaded_by_fkey;
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_approved_by_fkey;

-- Drop foreign key constraints from document_versions table
ALTER TABLE document_versions DROP CONSTRAINT IF EXISTS document_versions_created_by_fkey;

-- Drop foreign key constraints from document_comments table
ALTER TABLE document_comments DROP CONSTRAINT IF EXISTS document_comments_user_id_fkey;

-- Drop foreign key constraints from document_access_log table
ALTER TABLE document_access_log DROP CONSTRAINT IF EXISTS document_access_log_user_id_fkey;

-- Drop foreign key constraints from reviews table
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey;

-- Drop foreign key constraints from review_checklist_items table
ALTER TABLE review_checklist_items DROP CONSTRAINT IF EXISTS review_checklist_items_checked_by_fkey;

-- Drop foreign key constraints from messages table
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- Drop foreign key constraints from notifications table
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- Drop foreign key constraints from supplier_rfqs table
ALTER TABLE supplier_rfqs DROP CONSTRAINT IF EXISTS supplier_rfqs_created_by_fkey;

-- Drop foreign key constraints from supplier_quotes table
ALTER TABLE supplier_quotes DROP CONSTRAINT IF EXISTS supplier_quotes_evaluated_by_fkey;

-- Drop foreign key constraints from activity_log table
ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_user_id_fkey;

-- Drop foreign key constraints from user_preferences table
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;

-- Drop foreign key constraints from organization_settings table
ALTER TABLE organization_settings DROP CONSTRAINT IF EXISTS organization_settings_updated_by_fkey;

-- Drop foreign key constraints from workflow_business_rules table
ALTER TABLE workflow_business_rules DROP CONSTRAINT IF EXISTS workflow_business_rules_created_by_fkey;

-- Drop foreign key constraints from workflow_rule_executions table
ALTER TABLE workflow_rule_executions DROP CONSTRAINT IF EXISTS workflow_rule_executions_triggered_by_fkey;

-- Drop foreign key constraints from approval_chains table
ALTER TABLE approval_chains DROP CONSTRAINT IF EXISTS approval_chains_created_by_fkey;

-- Drop foreign key constraints from approval_requests table
ALTER TABLE approval_requests DROP CONSTRAINT IF EXISTS approval_requests_approver_id_fkey;

-- Drop foreign key constraints from supplier_qualifications table
ALTER TABLE supplier_qualifications DROP CONSTRAINT IF EXISTS supplier_qualifications_qualified_by_fkey;

-- Drop foreign key constraints from supplier_performance_metrics table
ALTER TABLE supplier_performance_metrics DROP CONSTRAINT IF EXISTS supplier_performance_metrics_recorded_by_fkey;

-- Drop foreign key constraints from bom_items table
ALTER TABLE bom_items DROP CONSTRAINT IF EXISTS bom_items_created_by_fkey;

-- Drop foreign key constraints from ai_model_configs table
ALTER TABLE ai_model_configs DROP CONSTRAINT IF EXISTS ai_model_configs_created_by_fkey;

-- Drop foreign key constraints from cloud_storage_integrations table
ALTER TABLE cloud_storage_integrations DROP CONSTRAINT IF EXISTS cloud_storage_integrations_user_id_fkey;

-- ============================================================================
-- STEP 3: Create mapping table and populate with actual Supabase auth user IDs
-- ============================================================================
CREATE TEMP TABLE id_mapping (
    old_id UUID,
    email VARCHAR(255),
    new_user_id UUID
);

-- Populate mapping table with email to user_id mappings
-- Using actual Supabase auth user IDs from auth.users table
INSERT INTO id_mapping (old_id, email, new_user_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440002', 'ceo@factorypulse.vn', '550e8400-e29b-41d4-a716-446655440002'),
    ('550e8400-e29b-41d4-a716-446655440003', 'operations@factorypulse.vn', '550e8400-e29b-41d4-a716-446655440003'),
    ('550e8400-e29b-41d4-a716-446655440004', 'quality@factorypulse.vn', '550e8400-e29b-41d4-a716-446655440004'),
    ('550e8400-e29b-41d4-a716-446655440005', 'senior.engineer@factorypulse.vn', '550e8400-e29b-41d4-a716-446655440005'),
    ('550e8400-e29b-41d4-a716-446655440006', 'mechanical@factorypulse.vn', '550e8400-e29b-41d4-a716-446655440006'),
    ('550e8400-e29b-41d4-a716-446655440007', 'qa@factorypulse.vn', '550e8400-e29b-41d4-a716-446655440007'),
    ('550e8400-e29b-41d4-a716-446655440008', 'production@factorypulse.vn', '550e8400-e29b-41d4-a716-446655440008'),
    ('550e8400-e29b-41d4-a716-446655440009', 'sales@factorypulse.vn', '550e8400-e29b-41d4-a716-446655440009'),
    ('550e8400-e29b-41d4-a716-446655440010', 'supplier@factorypulse.vn', '550e8400-e29b-41d4-a716-446655440010'),
    ('550e8400-e29b-41d4-a716-446655440011', 'customer@factorypulse.vn', '550e8400-e29b-41d4-a716-446655440011'),
    ('550e8400-e29b-41d4-a716-446655440012', 'admin@factorypulse.vn', '550e8400-e29b-41d4-a716-446655440012'),
    ('550e8400-e29b-41d4-a716-446655440013', 'support@factorypulse.vn', '550e8400-e29b-41d4-a716-446655440013'),
    ('550e8400-e29b-41d4-a716-446655440101', 'procurement@toyota.vn', '550e8400-e29b-41d4-a716-446655440101'),
    ('550e8400-e29b-41d4-a716-446655440102', 'purchasing@honda.vn', '550e8400-e29b-41d4-a716-446655440102'),
    ('550e8400-e29b-41d4-a716-446655440109', 'sales@precisionmachining.vn', '550e8400-e29b-41d4-a716-446655440109');

-- ============================================================================
-- STEP 4: Update all foreign key references to use new user_ids
-- ============================================================================

-- Update users table direct_manager_id references
UPDATE users 
SET direct_manager_id = mapping.new_user_id
FROM id_mapping mapping
WHERE users.direct_manager_id = mapping.old_id;

-- Update contacts table created_by reference
UPDATE contacts 
SET created_by = mapping.new_user_id
FROM id_mapping mapping
WHERE contacts.created_by = mapping.old_id;

-- Update projects table references
UPDATE projects 
SET created_by = mapping.new_user_id
FROM id_mapping mapping
WHERE projects.created_by = mapping.old_id;

UPDATE projects 
SET assigned_to = mapping.new_user_id
FROM id_mapping mapping
WHERE projects.assigned_to = mapping.old_id;

-- Update project_stage_history table
UPDATE project_stage_history 
SET entered_by = mapping.new_user_id
FROM id_mapping mapping
WHERE project_stage_history.entered_by = mapping.old_id;

-- Update project_assignments table
UPDATE project_assignments 
SET user_id = mapping.new_user_id
FROM id_mapping mapping
WHERE project_assignments.user_id = mapping.old_id;

UPDATE project_assignments 
SET assigned_by = mapping.new_user_id
FROM id_mapping mapping
WHERE project_assignments.assigned_by = mapping.old_id;

-- Update documents table
UPDATE documents 
SET uploaded_by = mapping.new_user_id
FROM id_mapping mapping
WHERE documents.uploaded_by = mapping.old_id;

UPDATE documents 
SET approved_by = mapping.new_user_id
FROM id_mapping mapping
WHERE documents.approved_by = mapping.old_id;

-- Update document_versions table
UPDATE document_versions 
SET created_by = mapping.new_user_id
FROM id_mapping mapping
WHERE document_versions.created_by = mapping.old_id;

-- Update document_comments table
UPDATE document_comments 
SET user_id = mapping.new_user_id
FROM id_mapping mapping
WHERE document_comments.user_id = mapping.old_id;

-- Update document_access_log table
UPDATE document_access_log 
SET user_id = mapping.new_user_id
FROM id_mapping mapping
WHERE document_access_log.user_id = mapping.old_id;

-- Update reviews table
UPDATE reviews 
SET reviewer_id = mapping.new_user_id
FROM id_mapping mapping
WHERE reviews.reviewer_id = mapping.old_id;

-- Update review_checklist_items table
UPDATE review_checklist_items 
SET checked_by = mapping.new_user_id
FROM id_mapping mapping
WHERE review_checklist_items.checked_by = mapping.old_id;

-- Update messages table
UPDATE messages 
SET sender_id = mapping.new_user_id
FROM id_mapping mapping
WHERE messages.sender_id = mapping.old_id;

-- Update notifications table
UPDATE notifications 
SET user_id = mapping.new_user_id
FROM id_mapping mapping
WHERE notifications.user_id = mapping.old_id;

-- Update supplier_rfqs table
UPDATE supplier_rfqs 
SET created_by = mapping.new_user_id
FROM id_mapping mapping
WHERE supplier_rfqs.created_by = mapping.old_id;

-- Update supplier_quotes table
UPDATE supplier_quotes 
SET evaluated_by = mapping.new_user_id
FROM id_mapping mapping
WHERE supplier_quotes.evaluated_by = mapping.old_id;

-- Update activity_log table
UPDATE activity_log 
SET user_id = mapping.new_user_id
FROM id_mapping mapping
WHERE activity_log.user_id = mapping.old_id;

-- Update user_preferences table
UPDATE user_preferences 
SET user_id = mapping.new_user_id
FROM id_mapping mapping
WHERE user_preferences.user_id = mapping.old_id;

-- Update organization_settings table
UPDATE organization_settings 
SET updated_by = mapping.new_user_id
FROM id_mapping mapping
WHERE organization_settings.updated_by = mapping.old_id;

-- Update workflow_business_rules table
UPDATE workflow_business_rules 
SET created_by = mapping.new_user_id
FROM id_mapping mapping
WHERE workflow_business_rules.created_by = mapping.old_id;

-- Update workflow_rule_executions table
UPDATE workflow_rule_executions 
SET triggered_by = mapping.new_user_id
FROM id_mapping mapping
WHERE workflow_rule_executions.triggered_by = mapping.old_id;

-- Update approval_chains table
UPDATE approval_chains 
SET created_by = mapping.new_user_id
FROM id_mapping mapping
WHERE approval_chains.created_by = mapping.old_id;

-- Update approval_requests table
UPDATE approval_requests 
SET approver_id = mapping.new_user_id
FROM id_mapping mapping
WHERE approval_requests.approver_id = mapping.old_id;

-- Update supplier_qualifications table
UPDATE supplier_qualifications 
SET qualified_by = mapping.new_user_id
FROM id_mapping mapping
WHERE supplier_qualifications.qualified_by = mapping.old_id;

-- Update supplier_performance_metrics table
UPDATE supplier_performance_metrics 
SET recorded_by = mapping.new_user_id
FROM id_mapping mapping
WHERE supplier_performance_metrics.recorded_by = mapping.old_id;

-- Update bom_items table
UPDATE bom_items 
SET created_by = mapping.new_user_id
FROM id_mapping mapping
WHERE bom_items.created_by = mapping.old_id;

-- Update ai_model_configs table
UPDATE ai_model_configs 
SET created_by = mapping.new_user_id
FROM id_mapping mapping
WHERE ai_model_configs.created_by = mapping.old_id;

-- Update cloud_storage_integrations table
UPDATE cloud_storage_integrations 
SET user_id = mapping.new_user_id
FROM id_mapping mapping
WHERE cloud_storage_integrations.user_id = mapping.old_id;

-- ============================================================================
-- STEP 5: Drop the old id column and add user_id as primary key
-- ============================================================================
-- Drop the primary key constraint first
ALTER TABLE users DROP CONSTRAINT users_pkey;

-- Drop the old id column
ALTER TABLE users DROP COLUMN id;

-- Add id column and populate it
ALTER TABLE users ADD COLUMN id UUID;

-- Update the id column with the new user_ids
UPDATE users 
SET id = mapping.new_user_id
FROM id_mapping mapping
WHERE users.email = mapping.email;

-- Make id NOT NULL and add primary key constraint
ALTER TABLE users ALTER COLUMN id SET NOT NULL;
ALTER TABLE users ADD PRIMARY KEY (id);

-- ============================================================================
-- STEP 6: Recreate all foreign key constraints
-- ============================================================================

-- Recreate users table direct_manager_id constraint
ALTER TABLE users 
ADD CONSTRAINT users_direct_manager_id_fkey 
FOREIGN KEY (direct_manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate contacts table created_by constraint
ALTER TABLE contacts 
ADD CONSTRAINT contacts_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate projects table constraints
ALTER TABLE projects 
ADD CONSTRAINT projects_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE projects 
ADD CONSTRAINT projects_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate project_stage_history table constraint
ALTER TABLE project_stage_history 
ADD CONSTRAINT project_stage_history_entered_by_fkey 
FOREIGN KEY (entered_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate project_assignments table constraints
ALTER TABLE project_assignments 
ADD CONSTRAINT project_assignments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE project_assignments 
ADD CONSTRAINT project_assignments_assigned_by_fkey 
FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate documents table constraints
ALTER TABLE documents 
ADD CONSTRAINT documents_uploaded_by_fkey 
FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE documents 
ADD CONSTRAINT documents_approved_by_fkey 
FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate document_versions table constraint
ALTER TABLE document_versions 
ADD CONSTRAINT document_versions_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate document_comments table constraint
ALTER TABLE document_comments 
ADD CONSTRAINT document_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Recreate document_access_log table constraint
ALTER TABLE document_access_log 
ADD CONSTRAINT document_access_log_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Recreate reviews table constraint
ALTER TABLE reviews 
ADD CONSTRAINT reviews_reviewer_id_fkey 
FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate review_checklist_items table constraint
ALTER TABLE review_checklist_items 
ADD CONSTRAINT review_checklist_items_checked_by_fkey 
FOREIGN KEY (checked_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate messages table constraint
ALTER TABLE messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;

-- Recreate notifications table constraint
ALTER TABLE notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Recreate supplier_rfqs table constraint
ALTER TABLE supplier_rfqs 
ADD CONSTRAINT supplier_rfqs_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate supplier_quotes table constraint
ALTER TABLE supplier_quotes 
ADD CONSTRAINT supplier_quotes_evaluated_by_fkey 
FOREIGN KEY (evaluated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate activity_log table constraint
ALTER TABLE activity_log 
ADD CONSTRAINT activity_log_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Recreate user_preferences table constraint
ALTER TABLE user_preferences 
ADD CONSTRAINT user_preferences_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Recreate organization_settings table constraint
ALTER TABLE organization_settings 
ADD CONSTRAINT organization_settings_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate workflow_business_rules table constraint
ALTER TABLE workflow_business_rules 
ADD CONSTRAINT workflow_business_rules_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate workflow_rule_executions table constraint
ALTER TABLE workflow_rule_executions 
ADD CONSTRAINT workflow_rule_executions_triggered_by_fkey 
FOREIGN KEY (triggered_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate approval_chains table constraint
ALTER TABLE approval_chains 
ADD CONSTRAINT approval_chains_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate approval_requests table constraint
ALTER TABLE approval_requests 
ADD CONSTRAINT approval_requests_approver_id_fkey 
FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate supplier_qualifications table constraint
ALTER TABLE supplier_qualifications 
ADD CONSTRAINT supplier_qualifications_qualified_by_fkey 
FOREIGN KEY (qualified_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate supplier_performance_metrics table constraint
ALTER TABLE supplier_performance_metrics 
ADD CONSTRAINT supplier_performance_metrics_recorded_by_fkey 
FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate bom_items table constraint
ALTER TABLE bom_items 
ADD CONSTRAINT bom_items_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate ai_model_configs table constraint
ALTER TABLE ai_model_configs 
ADD CONSTRAINT ai_model_configs_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Recreate cloud_storage_integrations table constraint
ALTER TABLE cloud_storage_integrations 
ADD CONSTRAINT cloud_storage_integrations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 7: Update indexes and constraints
-- ============================================================================
-- Drop and recreate indexes
DROP INDEX IF EXISTS idx_users_employee_id;
DROP INDEX IF EXISTS idx_users_direct_manager_id;
DROP INDEX IF EXISTS idx_users_organization_id;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_department;
DROP INDEX IF EXISTS idx_users_status;

CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_direct_manager_id ON users(direct_manager_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_status ON users(status);

-- ============================================================================
-- STEP 8: Clean up and verify
-- ============================================================================
-- Drop the temporary mapping table
DROP TABLE id_mapping;

-- Add documentation comment
COMMENT ON TABLE users IS 'Users table now uses Supabase auth user_id as primary key for consistency across the application';

-- Verify data integrity
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as users_with_roles FROM users WHERE role IS NOT NULL;
SELECT role, COUNT(*) FROM users GROUP BY role;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================
-- If something goes wrong, you can restore from backup:
-- DROP TABLE users;
-- ALTER TABLE users_backup RENAME TO users;
-- ALTER TABLE users ADD PRIMARY KEY (id);
-- (Then recreate all the foreign key constraints from the backup)
