-- Database Cleanup Script: Preserve Users and Authentication Data
-- This script removes all business data while keeping user accounts and authentication data
-- Created: 2025-09-06
-- Purpose: Refresh database for development/testing while preserving user accounts

-- IMPORTANT: This script will DELETE all business data!
-- Tables to PRESERVE (keep data):
-- - users (user accounts and authentication data)

-- Tables to CLEAR (remove all data):
-- - organizations (organization data)
-- - projects and related tables
-- - contacts (customer/supplier data)
-- - approvals and approval chains
-- - documents and document versions
-- - messages and notifications
-- - reviews and activity logs
-- - supplier data
-- - workflow data

BEGIN;

-- Disable triggers temporarily to avoid constraint issues
SET session_replication_role = replica;

-- Clear business data tables (in dependency order to avoid foreign key conflicts)

-- 1. Clear approval-related tables
DELETE FROM approval_attachments;
DELETE FROM approval_history;
DELETE FROM approval_notifications;
DELETE FROM approval_delegation_mappings;
DELETE FROM approval_delegations;
DELETE FROM approval_chains;
DELETE FROM approvals;

-- 2. Clear project-related tables
DELETE FROM project_sub_stage_progress;
DELETE FROM project_assignments;
DELETE FROM project_contact_points_backup;
DELETE FROM projects;

-- 3. Clear document-related tables
DELETE FROM document_access_log;
DELETE FROM document_versions;
DELETE FROM documents;

-- 4. Clear communication tables
DELETE FROM messages;
DELETE FROM notifications;

-- 5. Clear review and activity tables
DELETE FROM reviews;
DELETE FROM activity_log;

-- 6. Clear supplier-related tables
DELETE FROM supplier_quotes;
DELETE FROM supplier_rfqs;

-- 7. Clear workflow tables
DELETE FROM workflow_sub_stages;
DELETE FROM workflow_stages;

-- 8. Clear contacts (customer/supplier data)
DELETE FROM contacts;

-- 9. Clear organizations (organization data)
DELETE FROM organizations;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Reset sequences for tables that were cleared (optional, helps with ID consistency)
-- Note: Only reset if you want to start IDs from 1 again
-- ALTER SEQUENCE IF EXISTS projects_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS contacts_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS approvals_id_seq RESTART WITH 1;

COMMIT;

-- Verification queries (run these after the cleanup to verify results)
-- SELECT 'users' as table_name, COUNT(*) as row_count FROM users
-- UNION ALL
-- SELECT 'projects' as table_name, COUNT(*) as row_count FROM projects
-- UNION ALL
-- SELECT 'contacts' as table_name, COUNT(*) as row_count FROM contacts
-- UNION ALL
-- SELECT 'approvals' as table_name, COUNT(*) as row_count FROM approvals
-- UNION ALL
-- SELECT 'documents' as table_name, COUNT(*) as row_count FROM documents
-- UNION ALL
-- SELECT 'messages' as table_name, COUNT(*) as row_count FROM messages
-- ORDER BY table_name;
