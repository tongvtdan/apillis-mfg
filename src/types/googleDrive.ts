// Google Drive API Types and Interfaces
// Based on Google Drive API v3 specification

export interface GoogleDriveFile {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    parents?: string[];
    webViewLink?: string;
    webContentLink?: string;
    thumbnailLink?: string;
    iconLink?: string;
    createdTime: string;
    modifiedTime: string;
    lastModifyingUser?: {
        displayName: string;
        emailAddress: string;
    };
    owners?: Array<{
        displayName: string;
        emailAddress: string;
    }>;
    permissions?: GoogleDrivePermission[];
    capabilities?: {
        canDownload: boolean;
        canEdit: boolean;
        canShare: boolean;
        canView: boolean;
    };
}

export interface GoogleDrivePermission {
    id: string;
    type: 'user' | 'group' | 'domain' | 'anyone';
    role: 'owner' | 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader';
    emailAddress?: string;
    domain?: string;
    allowFileDiscovery?: boolean;
    expirationTime?: string;
}

export interface GoogleDriveTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
}

export interface GoogleDriveConfig {
    id: string;
    organization_id: string;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    scopes: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface GoogleDriveToken {
    id: string;
    user_id: string;
    organization_id: string;
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_at: string;
    scope: string;
    created_at: string;
    updated_at: string;
}

export interface DocumentLinkData {
    title: string;
    description?: string;
    external_url: string;
    external_id?: string;
    link_type: 'file' | 'folder' | 'shared_link' | 'embed';
    link_permissions?: Record<string, any>;
    link_expires_at?: string;
    document_type?: string;
    access_level?: string;
    tags?: string[];
    storage_provider: 'google_drive' | 'dropbox' | 'onedrive' | 's3' | 'azure_blob' | 'other';
}

export interface GoogleDriveAuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    userEmail?: string;
    tokenExpiresAt?: string;
}

export interface GoogleDriveFilePickerProps {
    onFileSelect: (file: GoogleDriveFile) => void;
    onFolderSelect?: (folder: GoogleDriveFile) => void;
    allowMultiple?: boolean;
    mimeTypes?: string[];
    showFolders?: boolean;
    showFiles?: boolean;
}

export interface GoogleDriveServiceConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
}

// Error types
export interface GoogleDriveError {
    code: string;
    message: string;
    details?: any;
}

// API Response types
export interface GoogleDriveListResponse {
    files: GoogleDriveFile[];
    nextPageToken?: string;
    incompleteSearch?: boolean;
}

export interface GoogleDriveCreatePermissionResponse {
    id: string;
    type: string;
    role: string;
    emailAddress?: string;
    domain?: string;
    allowFileDiscovery?: boolean;
    expirationTime?: string;
}
