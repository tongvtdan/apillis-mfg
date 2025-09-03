# Google Drive Integration Setup Guide

This guide will help you set up Google Drive integration for Factory Pulse document management.

## Prerequisites

1. A Google Cloud Platform account
2. Factory Pulse development environment running locally
3. Admin access to your Factory Pulse organization

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "Internal" for testing within your organization
   - Fill in the required fields (App name, User support email, etc.)
   - Add your domain to authorized domains if needed
4. For Application type, select "Web application"
5. Add authorized redirect URIs:
   - `http://localhost:8080/auth/google/callback` (for development)
   - Add production URLs when deploying
6. Add authorized JavaScript origins:
   - `http://localhost:8080` (for development)
   - Add production URLs when deploying
7. Click "Create"
8. Copy the Client ID and Client Secret

## Step 3: Configure Environment Variables

1. Open your `.env.local` file in the project root
2. Replace the placeholder values:

```bash
# Google Drive Integration
VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here
VITE_GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
```

## Step 4: Update Database Configuration

Run the setup script to configure the database:

```bash
npm run setup:google-drive
```

Or manually update the database:

```sql
UPDATE google_drive_config 
SET 
    client_id = 'your-actual-client-id-here',
    client_secret = 'your-actual-client-secret-here',
    redirect_uri = 'http://localhost:8080/auth/google/callback'
WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001';
```

## Step 5: Restart Development Server

```bash
npm run dev
```

## Step 6: Test the Integration

### Option 1: Using the Test Interface (Recommended)

1. Navigate to `http://localhost:8080/test/google-drive`
2. View the current integration status
3. Click "Connect Google Drive" to test authentication
4. Use the embedded debug panel for troubleshooting
5. Access admin configuration tools (if you have admin role)

### Option 2: Test in Document Management

1. Log in to Factory Pulse as an admin user
2. Go to a project's document management section
3. Click "Connect Google Drive"
4. You should be redirected to Google's OAuth consent screen
5. Grant the necessary permissions
6. You should be redirected back to Factory Pulse with a success message

## Troubleshooting

### Common Issues

#### 1. "No stored state found in localStorage"

**Cause**: OAuth state is missing, usually due to:
- Browser blocking localStorage
- Page refresh during OAuth flow
- Incorrect redirect URI configuration

**Solution**:
- Ensure redirect URI in Google Cloud Console matches exactly: `http://localhost:8080/auth/google/callback`
- Clear browser cache and try again
- Check browser console for errors

#### 2. "redirect_uri_mismatch" Error

**Cause**: The redirect URI in your Google Cloud Console doesn't match the one being used.

**Solution**:
- Go to Google Cloud Console > APIs & Services > Credentials
- Edit your OAuth 2.0 Client ID
- Ensure `http://localhost:8080/auth/google/callback` is in the authorized redirect URIs list

#### 3. "Client ID not found" or "Invalid client"

**Cause**: Environment variables not set correctly or server not restarted.

**Solution**:
- Double-check your `.env.local` file
- Restart the development server: `npm run dev`
- Verify the Client ID in Google Cloud Console

#### 4. "Access blocked" or "This app isn't verified"

**Cause**: OAuth consent screen not configured properly.

**Solution**:
- Go to Google Cloud Console > APIs & Services > OAuth consent screen
- Configure the consent screen with required information
- For development, use "Internal" user type
- For production, you may need to verify your app

### Debug Tools

Factory Pulse includes built-in debugging tools:

1. **Google Drive Test Page**: Navigate to `/test/google-drive` for comprehensive testing interface
   - Real-time integration status with visual indicators
   - One-click authentication testing
   - Admin configuration access (role-based)
   - Embedded setup instructions and resource links
2. **Environment Check**: The app logs environment variables on startup
3. **Debug Panel**: Access the Google Drive debug panel (admin only)
4. **Console Logs**: Check browser console for detailed OAuth flow logs

### Getting Help

If you're still having issues:

1. Check the browser console for error messages
2. Use the built-in debug panel to identify configuration issues
3. Verify your Google Cloud Console settings
4. Ensure all environment variables are set correctly

## Security Notes

- Never commit your actual Client ID and Client Secret to version control
- Use environment variables for all sensitive configuration
- For production, ensure your OAuth consent screen is properly configured
- Regularly rotate your Client Secret for security

## Production Deployment

When deploying to production:

1. Update the authorized redirect URIs in Google Cloud Console
2. Update the authorized JavaScript origins
3. Set the production environment variables
4. Update the database configuration with production redirect URI
5. Consider using Google Cloud Secret Manager for credential storage