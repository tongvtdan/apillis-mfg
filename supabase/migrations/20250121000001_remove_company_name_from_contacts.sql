-- Migration: Remove company_name column from contacts table
-- Date: 2025-01-21
-- Description: Remove redundant company_name column from contacts table since 
--              company information can be retrieved via organization_id relationship

-- Drop the company_name column from contacts table
ALTER TABLE contacts DROP COLUMN IF EXISTS company_name;

-- Add comment to document the change
COMMENT ON TABLE contacts IS 'Contacts table - company name available via organization_id relationship to organizations table';
