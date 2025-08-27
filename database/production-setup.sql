-- Production-Ready Setup for Factory Pulse
-- Run this in your Supabase SQL Editor

-- Create default organization if it doesn't exist
INSERT INTO public.organizations (id, name, slug, domain, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Factory Pulse',
    'factory-pulse-demo',
    'factorypulse.com',
    true,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Enable RLS on users table for security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to view other users (for app functionality like user lists)
CREATE POLICY "Authenticated users can view users" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow system to insert new users (for sign-up process)
CREATE POLICY "Enable insert for authenticated users" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Enable RLS on organizations table
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read organizations
CREATE POLICY "Authenticated users can view organizations" ON public.organizations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Enable RLS on activity_log table
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own activity logs
CREATE POLICY "Users can insert own activity logs" ON public.activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view activity logs related to them
CREATE POLICY "Users can view own activity logs" ON public.activity_log
    FOR SELECT USING (auth.uid() = user_id);

-- Verify setup
SELECT 
    'Production setup complete!' as message,
    COUNT(*) as organization_count
FROM organizations 
WHERE slug = 'factory-pulse-demo';