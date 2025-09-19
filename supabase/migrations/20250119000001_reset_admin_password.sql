-- Reset password for admin@apillis.com
-- This migration resets the admin password to 'admin123'

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reset the password using bcrypt with cost factor 6
UPDATE auth.users 
SET 
    encrypted_password = crypt('admin123', gen_salt('bf', 6)),
    updated_at = now()
WHERE email = 'admin@apillis.com';

-- Verify the update
SELECT 
    id, 
    email, 
    encrypted_password,
    updated_at
FROM auth.users 
WHERE email = 'admin@apillis.com';
