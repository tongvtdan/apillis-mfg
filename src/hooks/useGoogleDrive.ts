// Google Drive Hook
// Manages Google Drive authentication and file operations

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { googleDriveService } from '@/services/googleDriveService';
import type {
    GoogleDriveFile,
    GoogleDriveAuthState,
    GoogleDriveListResponse,
    DocumentLinkData
} from '@/types/googleDrive';
import { toast } from 'sonner';

export function useGoogleDrive() {
    const { user, profile } = useAuth();
    const [authState, setAuthState] = useState<GoogleDriveAuthState>({
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });

    // Initialize Google Drive service
    useEffect(() => {
        const initializeService = async () => {
            if (!user || !profile?.organization_id) {
                setAuthState({
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                });
                return;
            }

            try {
                setAuthState(prev => ({ ...prev, isLoading: true }));

                // Initialize service
                const config = await googleDriveService.initialize(profile.organization_id);
                if (!config) {
                    setAuthState({
                        isAuthenticated: false,
                        isLoading: false,
                        error: 'Google Drive not configured for this organization',
                    });
                    return;
                }

                // Check for existing tokens
                const token = await googleDriveService.getStoredTokens(user.id, profile.organization_id);

                setAuthState({
                    isAuthenticated: !!token,
                    isLoading: false,
                    error: null,
                    userEmail: token ? user.email : undefined,
                    tokenExpiresAt: token?.expires_at,
                });
            } catch (error) {
                console.error('Failed to initialize Google Drive:', error);
                setAuthState({
                    isAuthenticated: false,
                    isLoading: false,
                    error: 'Failed to initialize Google Drive',
                });
            }
        };

        initializeService();
    }, [user, profile?.organization_id]);

    // Authenticate with Google Drive
    const authenticate = useCallback(async () => {
        if (!user || !profile?.organization_id) {
            throw new Error('User not authenticated');
        }

        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

            // Get configuration from database
            const config = await googleDriveService.initialize(profile.organization_id);
            if (!config) {
                throw new Error('Google Drive not configured for this organization');
            }

            // Generate OAuth URL using database configuration
            const clientId = config.client_id;
            const redirectUri = config.redirect_uri;
            const scope = 'https://www.googleapis.com/auth/drive.readonly';

            console.log('🔍 OAuth Debug Info:');
            console.log('Client ID:', clientId);
            console.log('Redirect URI:', redirectUri);
            console.log('Scope:', scope);
            console.log('Current origin:', window.location.origin);
            console.log('Config from DB:', config);

            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
                client_id: clientId,
                redirect_uri: redirectUri,
                scope,
                response_type: 'code',
                access_type: 'offline',
                prompt: 'consent',
            })}`;

            console.log('🔗 Generated OAuth URL:', authUrl);

            // Store state for verification
            const state = Math.random().toString(36).substring(2);
            sessionStorage.setItem('google_drive_auth_state', state);
            sessionStorage.setItem('google_drive_organization_id', profile.organization_id);

            console.log('📝 Stored state:', state);
            console.log('📝 Stored org ID:', profile.organization_id);

            // Redirect to Google OAuth
            window.location.href = authUrl;
        } catch (error) {
            console.error('Failed to start Google Drive authentication:', error);
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to start authentication'
            }));
            throw error;
        }
    }, [user, profile?.organization_id]);

    // Handle OAuth callback
    const handleAuthCallback = useCallback(async (code: string, state: string) => {
        if (!user || !profile?.organization_id) {
            throw new Error('User not authenticated');
        }

        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

            // Verify state
            const storedState = sessionStorage.getItem('google_drive_auth_state');
            const storedOrgId = sessionStorage.getItem('google_drive_organization_id');

            console.log('🔍 State Verification Debug:');
            console.log('Received state:', state);
            console.log('Stored state:', storedState);
            console.log('Current org ID:', profile.organization_id);
            console.log('Stored org ID:', storedOrgId);
            console.log('State match:', state === storedState);
            console.log('Org ID match:', profile.organization_id === storedOrgId);

            if (state !== storedState || profile.organization_id !== storedOrgId) {
                throw new Error('Invalid authentication state');
            }

            // Get configuration from database for token exchange
            const config = await googleDriveService.initialize(profile.organization_id);
            if (!config) {
                throw new Error('Google Drive not configured for this organization');
            }

            // Exchange code for tokens using database configuration
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: config.client_id,
                    client_secret: config.client_secret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: config.redirect_uri,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to exchange authorization code');
            }

            const tokenResponse = await response.json();

            // Store tokens
            const success = await googleDriveService.storeTokens(
                user.id,
                profile.organization_id,
                tokenResponse
            );

            if (!success) {
                throw new Error('Failed to store authentication tokens');
            }

            // Clean up session storage
            sessionStorage.removeItem('google_drive_auth_state');
            sessionStorage.removeItem('google_drive_organization_id');

            setAuthState({
                isAuthenticated: true,
                isLoading: false,
                error: null,
                userEmail: user.email,
                tokenExpiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
            });

            toast.success('Google Drive connected successfully');
        } catch (error) {
            console.error('Failed to handle Google Drive auth callback:', error);
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Authentication failed'
            }));
            toast.error('Failed to connect Google Drive');
            throw error;
        }
    }, [user, profile?.organization_id]);

    // Disconnect Google Drive
    const disconnect = useCallback(async () => {
        if (!user || !profile?.organization_id) {
            return;
        }

        try {
            setAuthState(prev => ({ ...prev, isLoading: true }));

            await googleDriveService.clearTokens(user.id, profile.organization_id);

            setAuthState({
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });

            toast.success('Google Drive disconnected');
        } catch (error) {
            console.error('Failed to disconnect Google Drive:', error);
            toast.error('Failed to disconnect Google Drive');
        }
    }, [user, profile?.organization_id]);

    // List files from Google Drive
    const listFiles = useCallback(async (
        query: string = '',
        pageToken?: string,
        pageSize: number = 20
    ): Promise<GoogleDriveListResponse> => {
        if (!authState.isAuthenticated) {
            throw new Error('Google Drive not authenticated');
        }

        return await googleDriveService.listFiles(query, pageToken, pageSize);
    }, [authState.isAuthenticated]);

    // Get file metadata
    const getFileMetadata = useCallback(async (fileId: string): Promise<GoogleDriveFile | null> => {
        if (!authState.isAuthenticated) {
            throw new Error('Google Drive not authenticated');
        }

        return await googleDriveService.getFileMetadata(fileId);
    }, [authState.isAuthenticated]);

    // Convert URL to document link
    const urlToDocumentLink = useCallback(async (url: string): Promise<DocumentLinkData | null> => {
        if (!authState.isAuthenticated) {
            throw new Error('Google Drive not authenticated');
        }

        return await googleDriveService.urlToDocumentLink(url);
    }, [authState.isAuthenticated]);

    // Create sharing permission
    const createSharingPermission = useCallback(async (
        fileId: string,
        permission: {
            type: 'user' | 'group' | 'domain' | 'anyone';
            role: 'reader' | 'commenter' | 'writer';
            emailAddress?: string;
            domain?: string;
        }
    ): Promise<boolean> => {
        if (!authState.isAuthenticated) {
            throw new Error('Google Drive not authenticated');
        }

        return await googleDriveService.createSharingPermission(fileId, permission);
    }, [authState.isAuthenticated]);

    return {
        // State
        authState,

        // Actions
        authenticate,
        handleAuthCallback,
        disconnect,
        listFiles,
        getFileMetadata,
        urlToDocumentLink,
        createSharingPermission,

        // Utilities
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        error: authState.error,
    };
}
