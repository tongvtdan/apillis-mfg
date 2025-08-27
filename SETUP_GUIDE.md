# Factory Pulse Setup Guide

## Current Issues Fixed

Your console errors were caused by:
1. Missing environment variables
2. Database tables not matching your code expectations
3. Empty database with no users or organizations

## Quick Fix Steps

### 1. Database Setup
Run this SQL in your Supabase SQL Editor:

```sql
-- Create organization
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

-- Create test user
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
    gen_random_uuid(),
    'demo@factrypulse.com',
    'Demo User',
    'Management',
    'active',
    (SELECT id FROM public.organizations WHERE slug = 'factory-pulse-demo' LIMIT 1),
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();
```

### 2. Create Supabase Auth User
In your Supabase Dashboard:
1. Go to Authentication > Users
2. Click "Add user"
3. Email: `demo@factrypulse.com`
4. Password: `FactoryPulse2024!`
5. Email confirmed: ✓

### 3. Environment Variables
Your `.env` file has been created with the correct Supabase credentials.

### 4. Test Login
Try logging in with:
- Email: `demo@factrypulse.com`
- Password: `FactoryPulse2024!`

## What Was Fixed

1. **AuthContext.tsx**: 
   - Changed `profiles` table to `users` table
   - Changed `audit_logs` table to `activity_log` table
   - Added user existence check before authentication

2. **Environment**: 
   - Created `.env` with proper Supabase credentials
   - Disabled mock data mode

3. **Database Schema**: 
   - Your schema is correct, just needed initial data

## Next Steps

1. Run the SQL script above
2. Create the auth user in Supabase dashboard
3. Test the login
4. If successful, you can add more users using the `database/simple-user-creation.sql` script

## Troubleshooting

If you still get errors:
1. Check Supabase dashboard for RLS policies
2. Verify the auth user was created
3. Check browser network tab for specific API errors
4. Ensure your Supabase project is not paused