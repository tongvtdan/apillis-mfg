-- Auth Setup for Factory Pulse
-- This creates the necessary triggers and functions for user registration

-- First, ensure we have an organization
INSERT INTO public.organizations (id, name, slug, domain, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Factory Pulse Demo',
    'factory-pulse-demo',
    'demo.factrypulse.com',
    true,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
BEGIN
    -- Get the default organization
    SELECT id INTO org_id FROM public.organizations WHERE slug = 'factory-pulse-demo' LIMIT 1;
    
    -- Insert new user into users table
    INSERT INTO public.users (
        id,
        email,
        name,
        role,
        status,
        organization_id,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        'Customer', -- Default role
        'active',
        org_id,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user record on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Create policy to allow authenticated users to read other users (for app functionality)
CREATE POLICY "Authenticated users can view users" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow the trigger function to insert users
CREATE POLICY "Enable insert for auth trigger" ON public.users
    FOR INSERT WITH CHECK (true);

-- Test the setup
SELECT 'Setup complete! You can now sign up through the app.' as message;