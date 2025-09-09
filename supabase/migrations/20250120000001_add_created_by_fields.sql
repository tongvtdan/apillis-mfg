-- =========================================
-- Add created_by fields to organizations and contacts tables
-- Migration: Track who created each organization and contact
-- =========================================

-- Add created_by field to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add created_by field to contacts table  
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON contacts(created_by);

-- Add comments for documentation
COMMENT ON COLUMN organizations.created_by IS 'User ID of the person who created this organization';
COMMENT ON COLUMN contacts.created_by IS 'User ID of the person who created this contact';

-- Update RLS policies to include created_by context
-- Organizations: Users can view organizations they created or all organizations (for admin purposes)
DROP POLICY IF EXISTS "Users can view all organizations" ON organizations;
CREATE POLICY "Users can view organizations" ON organizations FOR SELECT 
USING (
  auth.role() = 'authenticated' AND (
    created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'management')
    )
  )
);

-- Contacts: Users can view contacts from organizations they created or have access to
DROP POLICY IF EXISTS "Users can view all contacts" ON contacts;
CREATE POLICY "Users can view contacts" ON contacts FOR SELECT 
USING (
  auth.role() = 'authenticated' AND (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organizations o
      JOIN users u ON u.organization_id = o.id
      WHERE o.id = contacts.organization_id 
      AND u.id = auth.uid()
      AND u.role IN ('admin', 'management')
    )
  )
);

-- Update insert policies to automatically set created_by
DROP POLICY IF EXISTS "Users can insert organizations" ON organizations;
CREATE POLICY "Users can insert organizations" ON organizations FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  created_by = auth.uid()
);

DROP POLICY IF EXISTS "Users can insert contacts" ON contacts;
CREATE POLICY "Users can insert contacts" ON contacts FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  created_by = auth.uid()
);

-- Create function to automatically set created_by on insert
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically set created_by
DROP TRIGGER IF EXISTS set_organizations_created_by ON organizations;
CREATE TRIGGER set_organizations_created_by
  BEFORE INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();

DROP TRIGGER IF EXISTS set_contacts_created_by ON contacts;
CREATE TRIGGER set_contacts_created_by
  BEFORE INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION set_created_by();
