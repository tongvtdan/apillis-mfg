-- Add portal user roles to users table (Step 1 of portal user integration)
-- This migration extends the users table to support customer and supplier portal users

-- Update the role check constraint to include portal user roles
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN (
    'sales',
    'procurement',
    'engineering',
    'qa',
    'production',
    'management',
    'admin',
    'customer',     -- Portal customer users
    'supplier'      -- Portal supplier users
));

-- Add helpful comment
COMMENT ON TABLE users IS 'Internal Factory Pulse employees and external portal users (customers/suppliers) for profile management';

-- Add index for portal user queries
CREATE INDEX IF NOT EXISTS idx_users_portal_type
ON users ((preferences->>'portal_type'))
WHERE preferences->>'is_portal_user' = 'true';

-- Add index for contact_id linkage
CREATE INDEX IF NOT EXISTS idx_users_contact_id
ON users ((preferences->>'contact_id'))
WHERE preferences->>'contact_id' IS NOT NULL;
