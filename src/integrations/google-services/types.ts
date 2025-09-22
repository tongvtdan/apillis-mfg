// Google Drive Types
// Type definitions for Google Drive integration
// Moved to integrations/google-services for future implementation

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
  createdTime?: string;
  modifiedTime?: string;
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
  };
}

export interface GoogleDrivePermission {
  id: string;
  type: 'user' | 'group' | 'anyone';
  role: 'owner' | 'writer' | 'commenter' | 'reader';
  emailAddress?: string;
  displayName?: string;
}

export interface GoogleDriveTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface GoogleDriveConfig {
  id?: string;
  organization_id: string;
  client.ts_id: string;
  client.ts_secret: string;
  redirect_uri: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GoogleDriveToken {
  id?: string;
  user_id: string;
  organization_id: string;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_at: string;
  scope?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentLinkData {
  title: string;
  description?: string;
  external_url: string;
  external_id?: string;
  storage_provider: 'google_drive' | 'dropbox' | 'onedrive' | 's3' | 'azure_blob' | 'other';
  file_type?: string;
  file_size?: number;
  mime_type?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface GoogleDriveAuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  config: GoogleDriveConfig | null;
  token: GoogleDriveToken | null;
}

export interface GoogleDriveFilePickerProps {
  onFileSelect: (file: GoogleDriveFile) => void;
  onFolderSelect?: (folder: GoogleDriveFile) => void;
  onCancel?: () => void;
  multiple?: boolean;
  allowedTypes?: string[];
  showFolders?: boolean;
  showFiles?: boolean;
}

export interface GoogleDriveServiceConfig {
  apiKey?: string;
  client.tsId?: string;
  client.tsSecret?: string;
  redirectUri?: string;
  scope?: string;
  discoveryDocs?: string[];
}

export interface GoogleDriveError {
  error: {
    code: number;
    message: string;
    status: string;
    details?: Array<{
      domain: string;
      reason: string;
      message: string;
    }>;
  };
}

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
}
