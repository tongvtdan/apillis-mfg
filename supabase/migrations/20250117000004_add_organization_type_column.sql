-- Migration: Add organization_type column to organizations table
-- Date: 2025-01-17
-- Description: Add organization_type column to classify organizations as internal, customer, supplier, or partner

/*
ISSUE FIXED:
============

Currently, organization types are determined by checking contact types,
which is inefficient and doesn't provide clear organization-level classification.

SOLUTION:
=========

Add organization_type column directly to organizations table:
- organization_type: Enum with values 'internal', 'customer', 'supplier', 'partner'
- This provides direct organization-level classification
- Eliminates need to query contacts to determine organization type
- Improves performance and clarity

VALUES:
=======
- 'internal': Internal organization/department
- 'customer': Customer organization
- 'supplier': Supplier/vendor organization
- 'partner': Business partner organization
*/

-- Create organization_type enum
CREATE TYPE organization_type_enum AS ENUM ('internal', 'customer', 'supplier', 'partner');

-- Add organization_type column to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS organization_type organization_type_enum;

-- Add comment for documentation
COMMENT ON COLUMN organizations.organization_type IS 'Type of organization: internal, customer, supplier, or partner';

-- Set default value for existing organizations (assume customer for backward compatibility)
UPDATE organizations
SET organization_type = 'customer'
WHERE organization_type IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE organizations
ALTER COLUMN organization_type SET NOT NULL;
