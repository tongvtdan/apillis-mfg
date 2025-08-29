-- Add user_id field to contacts table to link with user records
-- This enables the connection between contacts and their authentication users

-- Add user_id column with foreign key reference
ALTER TABLE contacts 
ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create index for better performance on user_id lookups
CREATE INDEX idx_contacts_user_id ON contacts(user_id);

-- Add comment explaining the purpose
COMMENT ON COLUMN contacts.user_id IS 'Reference to the user record for this contact. Links contacts to their authentication accounts.';

-- Update existing contacts to set user_id to NULL initially
-- (will be populated by the organization auth users script)
UPDATE contacts SET user_id = NULL WHERE user_id IS NULL;
