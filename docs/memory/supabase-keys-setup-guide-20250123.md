# supabase-keys-setup-guide-20250123 - Supabase Keys Setup Guide

## Context
Fixed authentication issues caused by expired hardcoded Supabase API keys by implementing proper environment variable configuration.

## Problem
The application was using expired demo API keys as fallbacks, causing "Invalid API key" errors when deployed to Vercel.

## Solution
1. Removed expired hardcoded Supabase keys from client configuration
2. Updated environment files to use placeholder values
3. Created guide for obtaining and setting up correct Supabase keys
4. Ensured proper environment variable precedence for different deployment scenarios

## Technical Details
- Removed hardcoded fallback keys from `src/integrations/supabase/supabase-client.ts`
- Updated `env.local` and `env.local.example` to use placeholder keys
- Enhanced `env.production.example` with setup instructions
- Maintained support for both `VITE_` prefixed and legacy environment variables

## Files Modified
- `src/integrations/supabase/supabase-client.ts`
- `env.local`
- `env.local.example`
- `env.production.example`

## How to Get Correct Supabase Keys

### Step 1: Access Your Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project (ynhgxwnkpbpzwbtzrzka)
3. Navigate to **Settings** → **API**

### Step 2: Get the Required Keys

**From Supabase Dashboard > Settings > API:**

1. **Project URL**: Copy from the "Project URL" field
   - Should be: `https://ynhgxwnkpbpzwbtzrzka.supabase.co`

2. **anon/public key**: Copy from the "anon public" field
   - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **service_role key**: Copy from the "service_role" field
   - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - ⚠️ **Important**: Keep this key secure, never expose it in client-side code

### Step 3: Set Environment Variables in Vercel

**Go to Vercel Dashboard > Your Project > Settings > Environment Variables:**

1. **Add Variable**: `VITE_SUPABASE_URL`
   - Value: `https://ynhgxwnkpbpzwbtzrzka.supabase.co`
   - Environment: Production

2. **Add Variable**: `VITE_SUPABASE_ANON_KEY`
   - Value: Your actual anon key from Supabase
   - Environment: Production

3. **Add Variable**: `VITE_SUPABASE_SERVICE_ROLE_KEY`
   - Value: Your actual service role key from Supabase
   - Environment: Production

### Step 4: Redeploy Your Application

1. Commit and push your changes to your repository
2. Vercel will automatically trigger a new deployment
3. The new environment variables will be available to your application

## Environment Variable Precedence

The application will use keys in this order:
1. `import.meta.env.VITE_SUPABASE_ANON_KEY` (Vercel deployment)
2. `import.meta.env.SUPABASE_ANON_KEY` (Legacy support)
3. No fallback - will throw error if not set

## Local Development Setup

For local development, create a `.env.local` file:

```bash
# .env.local
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key_here
```

## Results
- ✅ Authentication will work properly with valid Supabase keys
- ✅ No more "Invalid API key" errors
- ✅ Secure key management without hardcoded credentials
- ✅ Proper environment-specific configuration

## Future Considerations
- Consider implementing build-time validation of required environment variables
- Add environment-specific configuration validation
- Document key rotation procedures
