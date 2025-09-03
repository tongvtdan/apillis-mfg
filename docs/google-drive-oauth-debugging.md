# Google Drive OAuth Debugging Enhancement

## Overview

Enhanced debugging capabilities for the Google Drive OAuth authentication flow to improve troubleshooting and reliability of the authentication process.

## Changes Made (2025-09-03)

### Enhanced OAuth State Debugging

**File**: `src/pages/GoogleDriveCallback.tsx`

**Improvements**:
1. **Comprehensive State Logging**: Added detailed logging of all OAuth-related state variables
2. **localStorage Inspection**: Full enumeration and inspection of localStorage contents
3. **Authentication Flow Coordination**: Better handling of user authentication timing
4. **Error Prevention**: Prevents premature error states during authentication loading

### Key Debugging Features

#### 1. Enhanced OAuth State Inspection
```typescript
console.log('🔍 Enhanced OAuth State Debug:');
console.log('Current URL:', window.location.href);
console.log('localStorage keys:', Object.keys(localStorage));
console.log('Stored state:', storedState);
console.log('Stored org ID:', storedOrgId);
console.log('Current profile org ID:', profile?.organization_id);
console.log('User ID:', user?.id);
console.log('Profile loaded:', !!profile);
```

#### 2. localStorage Enumeration
```typescript
console.log('Available localStorage items:');
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`  ${key}: ${localStorage.getItem(key)}`);
}
```

#### 3. Authentication Flow Improvements
- **Graceful Waiting**: No longer sets error state immediately when user authentication is loading
- **Proper Timing**: Waits for authentication completion before processing OAuth callback
- **State Validation**: Enhanced validation of OAuth state with detailed error messages

### Benefits

1. **Better Troubleshooting**: Comprehensive logging helps identify OAuth flow issues
2. **Improved User Experience**: Prevents confusing error messages during normal authentication flow
3. **Enhanced Reliability**: Better handling of authentication timing edge cases
4. **Developer Experience**: Detailed debugging output for development and support

### Usage

The enhanced debugging is automatically active in the GoogleDriveCallback component. When users complete the Google Drive OAuth flow:

1. **Enhanced Logging**: All OAuth state variables are logged to console
2. **localStorage Inspection**: Full localStorage contents are inspected and logged
3. **Error Context**: Detailed error messages with troubleshooting guidance
4. **State Cleanup**: Proper cleanup of OAuth state after processing

### Troubleshooting Guide

#### Common Issues and Solutions

1. **"No stored state found in localStorage"**
   - Check if OAuth flow was initiated properly
   - Verify localStorage is not being cleared by browser settings
   - Ensure user completes OAuth flow in same browser session

2. **Authentication Loading Issues**
   - Enhanced debugging now waits for authentication to complete
   - Check console logs for authentication state progression
   - Verify user profile is loaded before processing OAuth callback

3. **OAuth State Mismatch**
   - Enhanced logging shows all state variables for comparison
   - Check organization ID consistency between stored state and user profile
   - Verify OAuth flow completion in correct browser tab

## Database Schema Updates (2025-09-03)

### Simplified Schema for Better Compatibility

**Migration File**: `supabase/migrations/20250903080000_google_drive_integration.sql`

**Key Changes**:
- **Removed Foreign Key Constraints**: Eliminated `REFERENCES organizations(id)` and `REFERENCES users(id)` constraints
- **Simplified Table Structure**: Removed complex unique constraints and `created_by` column
- **Maintained Security**: RLS policies handle access control instead of foreign key constraints
- **Improved Compatibility**: Works with both fresh installations and existing databases

**Updated Schema**:
```sql
-- Simplified Google Drive Configuration Table
CREATE TABLE IF NOT EXISTS google_drive_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL,  -- No foreign key constraint
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    redirect_uri TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simplified Google Drive Tokens Table  
CREATE TABLE IF NOT EXISTS google_drive_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,          -- No foreign key constraint
    organization_id UUID NOT NULL,  -- No foreign key constraint
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT DEFAULT 'Bearer',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);
```

**Benefits of Simplification**:
- ✅ **Easier Deployment**: No dependency on existing table structures
- ✅ **Reduced Setup Errors**: Eliminates foreign key constraint failures
- ✅ **Maintained Security**: RLS policies provide proper access control
- ✅ **Better Compatibility**: Works regardless of existing database state

### Setup and Configuration

**New Setup Script**: A new automated setup script has been added to streamline Google Drive integration:

```bash
npm run setup:google-drive
```

**Setup Script Features**:
- **Automated Configuration**: Creates Google Drive config in database automatically
- **Environment Validation**: Validates all required credentials before setup
- **Organization Integration**: Automatically detects and configures for existing organizations
- **Comprehensive Guidance**: Provides step-by-step instructions for Google Cloud Console setup

**Prerequisites for Setup**:
```bash
# Required in .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Integration

The enhanced debugging integrates seamlessly with existing Google Drive OAuth flow:

- **useGoogleDrive Hook**: Handles OAuth callback processing
- **useAuth Context**: Provides user authentication state
- **localStorage Management**: Enhanced state inspection and cleanup
- **Error Handling**: Improved error messages and user guidance
- **Setup Script**: Automated configuration via `scripts/setup-google-drive.js`

### Future Enhancements

Potential future improvements:
1. **Structured Logging**: Replace console.log with structured logging service
2. **Error Reporting**: Automatic error reporting for OAuth failures
3. **State Recovery**: Automatic recovery from common OAuth state issues
4. **User Guidance**: In-app troubleshooting guidance for OAuth issues