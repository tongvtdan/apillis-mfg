// Google Drive Service
// Handles Google Drive API integration and authentication

import { supabase } from '@/integrations/supabase/client';
import type {
    GoogleDriveFile,
    GoogleDriveTokenResponse,
    GoogleDriveConfig,
    GoogleDriveToken,
    GoogleDriveListResponse,
    GoogleDriveError,
    DocumentLinkData
} from '@/types/googleDrive';
import { extractGoogleDriveFileId, generateGoogleDriveSharingUrl } from '@/lib/googleDriveUtils';

class GoogleDriveService {
    private static instance: GoogleDriveService;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private tokenExpiresAt: Date | null = null;

    private constructor() { }

    static getInstance(): GoogleDriveService {
        if (!GoogleDriveService.instance) {
            GoogleDriveService.instance = new GoogleDriveService();
        }
        return GoogleDriveService.instance;
    }

    /**
     * Initialize Google Drive service with configuration
     */
    async initialize(organizationId: string): Promise<GoogleDriveConfig | null> {
        try {
            const { data: config, error } = await supabase
                .from('google_drive_config')
                .select('*')
                .eq('organization_id', organizationId)
                .eq('is_active', true)
                .single();

            if (error || !config) {
                console.error('Google Drive config not found:', error);
                return null;
            }

            return config;
        } catch (error) {
            console.error('Failed to initialize Google Drive service:', error);
            return null;
        }
    }

    /**
     * Get stored tokens for current user
     */
    async getStoredTokens(userId: string, organizationId: string): Promise<GoogleDriveToken | null> {
        try {
            const { data: token, error } = await supabase
                .from('google_drive_tokens')
                .select('*')
                .eq('user_id', userId)
                .eq('organization_id', organizationId)
                .single();

            if (error || !token) {
                return null;
            }

            // Check if token is expired
            if (new Date(token.expires_at) <= new Date()) {
                // Try to refresh token
                const refreshed = await this.refreshAccessToken(token.refresh_token);
                if (refreshed) {
                    return await this.getStoredTokens(userId, organizationId);
                }
                return null;
            }

            this.accessToken = token.access_token;
            this.refreshToken = token.refresh_token;
            this.tokenExpiresAt = new Date(token.expires_at);

            return token;
        } catch (error) {
            console.error('Failed to get stored tokens:', error);
            return null;
        }
    }

    /**
     * Store tokens in database
     */
    async storeTokens(
        userId: string,
        organizationId: string,
        tokenResponse: GoogleDriveTokenResponse
    ): Promise<boolean> {
        try {
            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + tokenResponse.expires_in);

            const { error } = await supabase
                .from('google_drive_tokens')
                .upsert({
                    user_id: userId,
                    organization_id: organizationId,
                    access_token: tokenResponse.access_token,
                    refresh_token: tokenResponse.refresh_token,
                    token_type: tokenResponse.token_type,
                    expires_at: expiresAt.toISOString(),
                    scope: tokenResponse.scope,
                });

            if (error) {
                console.error('Failed to store tokens:', error);
                return false;
            }

            this.accessToken = tokenResponse.access_token;
            this.refreshToken = tokenResponse.refresh_token;
            this.tokenExpiresAt = expiresAt;

            return true;
        } catch (error) {
            console.error('Failed to store tokens:', error);
            return false;
        }
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(refreshToken: string): Promise<boolean> {
        try {
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
                    client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token',
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to refresh token: ${response.statusText}`);
            }

            const tokenResponse: GoogleDriveTokenResponse = await response.json();

            // Update stored token
            const { error } = await supabase
                .from('google_drive_tokens')
                .update({
                    access_token: tokenResponse.access_token,
                    expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
                })
                .eq('refresh_token', refreshToken);

            if (error) {
                console.error('Failed to update refreshed token:', error);
                return false;
            }

            this.accessToken = tokenResponse.access_token;
            this.tokenExpiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

            return true;
        } catch (error) {
            console.error('Failed to refresh access token:', error);
            return false;
        }
    }

    /**
     * Get file metadata from Google Drive
     */
    async getFileMetadata(fileId: string): Promise<GoogleDriveFile | null> {
        if (!this.accessToken) {
            throw new Error('No access token available');
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,parents,webViewLink,webContentLink,thumbnailLink,iconLink,createdTime,modifiedTime,lastModifyingUser,owners,permissions,capabilities`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                const error: GoogleDriveError = await response.json();
                throw new Error(error.message || 'Failed to get file metadata');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to get file metadata:', error);
            return null;
        }
    }

    /**
     * List files from Google Drive
     */
    async listFiles(
        query: string = '',
        pageToken?: string,
        pageSize: number = 20
    ): Promise<GoogleDriveListResponse> {
        if (!this.accessToken) {
            throw new Error('No access token available');
        }

        try {
            const params = new URLSearchParams({
                pageSize: pageSize.toString(),
                fields: 'nextPageToken,files(id,name,mimeType,size,webViewLink,thumbnailLink,iconLink,createdTime,modifiedTime,capabilities)',
            });

            if (query) {
                params.append('q', query);
            }

            if (pageToken) {
                params.append('pageToken', pageToken);
            }

            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                const error: GoogleDriveError = await response.json();
                throw new Error(error.message || 'Failed to list files');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to list files:', error);
            throw error;
        }
    }

    /**
     * Create sharing permission for a file
     */
    async createSharingPermission(
        fileId: string,
        permission: {
            type: 'user' | 'group' | 'domain' | 'anyone';
            role: 'reader' | 'commenter' | 'writer';
            emailAddress?: string;
            domain?: string;
        }
    ): Promise<boolean> {
        if (!this.accessToken) {
            throw new Error('No access token available');
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(permission),
                }
            );

            if (!response.ok) {
                const error: GoogleDriveError = await response.json();
                throw new Error(error.message || 'Failed to create sharing permission');
            }

            return true;
        } catch (error) {
            console.error('Failed to create sharing permission:', error);
            return false;
        }
    }

    /**
     * Get file content URL
     */
    async getFileContentUrl(fileId: string): Promise<string | null> {
        if (!this.accessToken) {
            throw new Error('No access token available');
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?fields=webContentLink`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                const error: GoogleDriveError = await response.json();
                throw new Error(error.message || 'Failed to get file content URL');
            }

            const data = await response.json();
            return data.webContentLink || null;
        } catch (error) {
            console.error('Failed to get file content URL:', error);
            return null;
        }
    }

    /**
     * Convert Google Drive URL to document link data
     */
    async urlToDocumentLink(url: string): Promise<DocumentLinkData | null> {
        const fileId = extractGoogleDriveFileId(url);
        if (!fileId) {
            throw new Error('Invalid Google Drive URL');
        }

        const fileMetadata = await this.getFileMetadata(fileId);
        if (!fileMetadata) {
            throw new Error('Failed to get file metadata');
        }

        return {
            title: fileMetadata.name,
            description: `Google Drive file: ${fileMetadata.name}`,
            external_url: fileMetadata.webViewLink || generateGoogleDriveSharingUrl(fileId),
            external_id: fileId,
            link_type: fileMetadata.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
            link_permissions: {
                canDownload: fileMetadata.capabilities?.canDownload || false,
                canEdit: fileMetadata.capabilities?.canEdit || false,
                canShare: fileMetadata.capabilities?.canShare || false,
                canView: fileMetadata.capabilities?.canView || true,
            },
            document_type: this.getFileTypeFromMimeType(fileMetadata.mimeType),
            access_level: 'internal',
            tags: ['google-drive'],
            storage_provider: 'google_drive',
        };
    }

    /**
     * Get file type from MIME type
     */
    private getFileTypeFromMimeType(mimeType: string): string {
        const typeMap: Record<string, string> = {
            'application/pdf': 'pdf',
            'application/vnd.google-apps.document': 'gdoc',
            'application/vnd.google-apps.spreadsheet': 'gsheet',
            'application/vnd.google-apps.presentation': 'gslides',
            'application/vnd.google-apps.folder': 'folder',
            'image/jpeg': 'image',
            'image/png': 'image',
            'image/gif': 'image',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
            'text/plain': 'text',
            'application/zip': 'archive',
        };

        return typeMap[mimeType] || 'unknown';
    }

    /**
     * Check if token is valid
     */
    isTokenValid(): boolean {
        return !!(this.accessToken && this.tokenExpiresAt && this.tokenExpiresAt > new Date());
    }

    /**
     * Clear stored tokens
     */
    async clearTokens(userId: string, organizationId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('google_drive_tokens')
                .delete()
                .eq('user_id', userId)
                .eq('organization_id', organizationId);

            if (error) {
                console.error('Failed to clear tokens:', error);
                return false;
            }

            this.accessToken = null;
            this.refreshToken = null;
            this.tokenExpiresAt = null;

            return true;
        } catch (error) {
            console.error('Failed to clear tokens:', error);
            return false;
        }
    }
}

export const googleDriveService = GoogleDriveService.getInstance();
