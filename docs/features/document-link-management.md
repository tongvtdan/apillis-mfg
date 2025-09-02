# Document Link Management with Google Drive Integration

## Overview

This feature enhances the document management system to support adding document links from external sources, particularly Google Drive. This helps save storage space and enables users to share documents from other sources without downloading and uploading them.

## Features

### 1. Document Link Support
- **Link Types**: Support for files, folders, shared links, and embedded content
- **External Storage**: Integration with Google Drive, with extensible support for other providers
- **URL Validation**: Automatic validation of Google Drive URLs with metadata extraction
- **Access Tracking**: Track link access counts and last accessed times

### 2. Google Drive Integration
- **OAuth Authentication**: Secure OAuth 2.0 flow for Google Drive access
- **File Browsing**: Browse and search Google Drive files directly from the interface
- **Metadata Extraction**: Automatic extraction of file metadata (name, type, size, permissions)
- **Permission Management**: Support for creating sharing permissions

### 3. User Interface
- **Dual Upload Options**: Choose between file upload or link addition
- **Tabbed Interface**: Separate tabs for URL entry and Google Drive browsing
- **Real-time Validation**: Instant URL validation with visual feedback
- **Form Auto-fill**: Automatic form population from extracted metadata

## Database Schema

### Enhanced Documents Table
```sql
-- New columns added to documents table
ALTER TABLE documents ADD COLUMN external_id VARCHAR(255);
ALTER TABLE documents ADD COLUMN external_url TEXT;
ALTER TABLE documents ADD COLUMN storage_provider VARCHAR(50) DEFAULT 'supabase';
ALTER TABLE documents ADD COLUMN link_type VARCHAR(50) DEFAULT 'file';
ALTER TABLE documents ADD COLUMN link_permissions JSONB DEFAULT '{}';
ALTER TABLE documents ADD COLUMN link_expires_at TIMESTAMPTZ;
ALTER TABLE documents ADD COLUMN link_access_count INTEGER DEFAULT 0;
ALTER TABLE documents ADD COLUMN link_last_accessed TIMESTAMPTZ;
```

### New Tables
- **google_drive_config**: Organization-level Google Drive OAuth configuration
- **google_drive_tokens**: User-level OAuth tokens for Google Drive access
- **document_access_log**: Logging for document access tracking

## Components

### Core Components
1. **DocumentLinkModal** (`src/components/project/DocumentLinkModal.tsx`)
   - Main modal for adding document links
   - Dual tabs: URL entry and Google Drive browsing
   - Form validation and metadata extraction

2. **GoogleDriveAuth** (`src/components/project/GoogleDriveAuth.tsx`)
   - Google Drive connection status and management
   - OAuth flow initiation and token management

3. **GoogleDriveCallback** (`src/pages/GoogleDriveCallback.tsx`)
   - OAuth callback handler
   - Token exchange and storage

### Services and Hooks
1. **GoogleDriveService** (`src/services/googleDriveService.ts`)
   - Google Drive API integration
   - Token management and file operations

2. **useGoogleDrive** (`src/hooks/useGoogleDrive.ts`)
   - React hook for Google Drive operations
   - Authentication state management

3. **useDocuments** (enhanced)
   - Added `addDocumentLink` function
   - Support for link-based documents

### Utilities
1. **googleDriveUtils** (`src/lib/googleDriveUtils.ts`)
   - URL validation and parsing
   - File type detection and formatting
   - Metadata conversion utilities

## Usage

### Adding a Document Link

1. **From Document Manager**:
   - Click "Add Link" button next to "Upload Files"
   - Choose between URL entry or Google Drive browsing

2. **URL Entry Method**:
   - Paste a Google Drive URL
   - System validates and extracts metadata
   - Fill in additional details (title, description, tags)

3. **Google Drive Browsing**:
   - Connect Google Drive account (first time)
   - Search and browse files
   - Select file to add as link

### Google Drive Authentication

1. **First-time Setup**:
   - Click "Connect Google Drive" in the link modal
   - Authorize access in Google OAuth flow
   - Return to application with connected account

2. **Token Management**:
   - Tokens are stored securely in database
   - Automatic token refresh when needed
   - Disconnect option available

## Environment Variables

Add these to your `.env.local` file:

```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Google Cloud Console Setup

1. **Create OAuth 2.0 Credentials**:
   - Go to Google Cloud Console
   - Enable Google Drive API
   - Create OAuth 2.0 client credentials
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/google-drive/callback` (development)
     - `https://yourdomain.com/auth/google-drive/callback` (production)

2. **Required Scopes**:
   - `https://www.googleapis.com/auth/drive.readonly` (read-only access)

## Security Considerations

- **OAuth Tokens**: Stored securely with encryption
- **Access Control**: RLS policies ensure organization isolation
- **Token Expiration**: Automatic refresh and cleanup
- **Permission Scopes**: Minimal required permissions (read-only)

## Benefits

1. **Storage Efficiency**: Save storage space by linking instead of uploading
2. **Real-time Access**: Access files directly from Google Drive
3. **Collaboration**: Share files with team members without duplication
4. **Version Control**: Google Drive handles file versioning
5. **Access Tracking**: Monitor document access patterns

## Future Enhancements

- Support for other cloud storage providers (Dropbox, OneDrive, etc.)
- Automatic file synchronization
- Advanced permission management
- Bulk link operations
- Link analytics and reporting
