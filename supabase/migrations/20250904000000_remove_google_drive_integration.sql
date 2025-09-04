-- =====================================================
-- Remove Google Drive Integration Tables
-- Date: September 4, 2025
-- =====================================================

-- Drop Google Drive related tables and policies
-- This removes all Google Drive integration from the database

-- Drop RLS policies first
DROP POLICY IF EXISTS "Users can view their organization's Google Drive config" ON google_drive_config;
DROP POLICY IF EXISTS "Admins can manage Google Drive config" ON google_drive_config;
DROP POLICY IF EXISTS "Users can view their own Google Drive tokens" ON google_drive_tokens;
DROP POLICY IF EXISTS "Users can manage their own Google Drive tokens" ON google_drive_tokens;

-- Drop triggers
DROP TRIGGER IF EXISTS update_google_drive_config_updated_at ON google_drive_config;
DROP TRIGGER IF EXISTS update_google_drive_tokens_updated_at ON google_drive_tokens;

-- Drop indexes
DROP INDEX IF EXISTS idx_google_drive_config_org_active;
DROP INDEX IF EXISTS idx_google_drive_tokens_user_org;
DROP INDEX IF EXISTS idx_google_drive_tokens_expires;

-- Drop tables
DROP TABLE IF EXISTS google_drive_tokens;
DROP TABLE IF EXISTS google_drive_config;

-- Drop function (only if not used elsewhere)
-- DROP FUNCTION IF EXISTS update_updated_at_column();

-- Verify tables are removed
SELECT 
    schemaname,
    tablename 
FROM pg_tables 
WHERE tablename LIKE '%google_drive%';
