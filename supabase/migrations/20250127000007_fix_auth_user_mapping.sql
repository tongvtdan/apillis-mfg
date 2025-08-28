-- Migration Script: Fix Authentication User Mapping
-- This script fixes the mismatch between auth.users and custom users table
-- Date: 2025-01-27

-- ============================================================================
-- STEP 1: Add user_id column to users table to link with auth.users
-- ============================================================================

-- Add user_id column to link with auth.users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- ============================================================================
-- STEP 2: Create a mapping table for email to auth user ID
-- ============================================================================

-- Create mapping table to link emails with auth user IDs
CREATE TABLE IF NOT EXISTS email_to_user_id_mapping (
    email TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: Get current auth users and create mapping
-- ============================================================================

-- Insert mapping for existing auth users
INSERT INTO email_to_user_id_mapping (email, user_id)
SELECT 
    email,
    id as user_id
FROM auth.users 
WHERE email IN (
    'ceo@factorypulse.vn',
    'operations@factorypulse.vn',
    'quality@factorypulse.vn',
    'procurement@factorypulse.vn',
    'engineering@factorypulse.vn',
    'qa@factorypulse.vn',
    'production@factorypulse.vn',
    'sales@factorypulse.vn',
    'supplier@factorypulse.vn',
    'customer@factorypulse.vn',
    'admin@factorypulse.vn',
    'support@factorypulse.vn'
)
ON CONFLICT (email) DO UPDATE SET 
    user_id = EXCLUDED.user_id,
    created_at = NOW();

-- ============================================================================
-- STEP 4: Update users table with correct user_id mapping
-- ============================================================================

-- Update users table with the correct auth user IDs
UPDATE users 
SET user_id = mapping.user_id
FROM email_to_user_id_mapping mapping
WHERE users.email = mapping.email;

-- ============================================================================
-- STEP 5: Create function to handle new user registration
-- ============================================================================

-- Create function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
BEGIN
    -- Get the default organization
    SELECT id INTO org_id FROM public.organizations WHERE slug = 'factory-pulse-vietnam' LIMIT 1;
    
    -- Insert new user into users table
    INSERT INTO public.users (
        id,
        user_id,
        organization_id,
        email,
        name,
        role,
        status,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(), -- Generate new UUID for custom users table
        NEW.id, -- Use auth user ID for linking
        org_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'customer', -- Default role for new users
        'active',
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 6: Create trigger for new user registration
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create user record on auth signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 7: Update RLS policies
-- ============================================================================

-- Enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON users;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON users;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow admin users to read all profiles
CREATE POLICY "Admin users can view all profiles" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create policy to allow admin users to update all profiles
CREATE POLICY "Admin users can update all profiles" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- STEP 8: Verify the mapping
-- ============================================================================

-- Show the current mapping status
SELECT 
    'Mapping Status' as info,
    COUNT(*) as total_users,
    COUNT(user_id) as mapped_users,
    COUNT(*) - COUNT(user_id) as unmapped_users
FROM users;

-- Show unmapped users if any
SELECT 
    email, 
    name, 
    role,
    CASE 
        WHEN user_id IS NULL THEN 'UNMAPPED - Needs auth user'
        ELSE 'MAPPED - OK'
    END as status
FROM users 
ORDER BY email;
