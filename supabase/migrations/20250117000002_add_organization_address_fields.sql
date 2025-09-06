-- Migration: Add address fields to organizations table
-- Date: 2025-01-17
-- Description: Add country, address, city, state, postal_code fields to organizations table for customer organization information

/*
ISSUE FIXED:
============

Customer information (including country) should be stored at the organization level,
not at the contact level, because:
- Contacts can have different addresses and can change
- Organization represents the primary customer entity
- Need consistent customer information across all contacts

SOLUTION:
=========

Add address fields directly to the organizations table:
- country: Customer's primary country
- address: Street address
- city: City
- state: State/Province
- postal_code: Postal/ZIP code

These fields will be used for customer organization information
and will be auto-filled when selecting organizations in forms.
*/

-- Add address fields to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Add comment for documentation
COMMENT ON COLUMN organizations.country IS 'Primary country for customer organizations';
COMMENT ON COLUMN organizations.address IS 'Street address for customer organizations';
COMMENT ON COLUMN organizations.city IS 'City for customer organizations';
COMMENT ON COLUMN organizations.state IS 'State/Province for customer organizations';
COMMENT ON COLUMN organizations.postal_code IS 'Postal/ZIP code for customer organizations';
