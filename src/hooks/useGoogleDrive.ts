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

                // Check for existing tokens - handle RLS errors gracefully
                try {
                    const token = await googleDriveService.getStoredTokens(user.id, profile.organization_id);

                    setAuthState({
                        isAuthenticated: !!token,
                        isLoading: false,
                        error: null,
                        userEmail: token ? user.email : undefined,
                        tokenExpiresAt: token?.expires_at,
                    });
                } catch (tokenError) {
                    console.log('🔍 Token fetch failed (likely RLS), treating as not authenticated:', tokenError);
                    setAuthState({
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                }
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
        console.log('🚀 authenticate function called');

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

            // Generate a more robust state token
            const state = `${Date.now()}-${Math.random().toString(36).substring(2)}-${profile.organization_id}`;

            // Enhanced localStorage storage with error handling
            try {
                // Clear any existing state first
                localStorage.removeItem('google_drive_auth_state');
                localStorage.removeItem('google_drive_organization_id');

                // Store new state
                localStorage.setItem('google_drive_auth_state', state);
                localStorage.setItem('google_drive_organization_id', profile.organization_id);

                // Verify storage immediately
                const verifyState = localStorage.getItem('google_drive_auth_state');
                const verifyOrgId = localStorage.getItem('google_drive_organization_id');

                if (verifyState !== state || verifyOrgId !== profile.organization_id) {
                    throw new Error('localStorage verification failed');
                }

                console.log('✅ localStorage storage and verification successful');
            } catch (error) {
                console.error('❌ localStorage operation failed:', error);
                throw new Error('localStorage not accessible or verification failed');
            }

            console.log('📝 OAuth State Storage Debug:');
            console.log('Generated state:', state);
            console.log('Organization ID:', profile.organization_id);
            console.log('Stored state verification:', localStorage.getItem('google_drive_auth_state'));
            console.log('Stored org ID verification:', localStorage.getItem('google_drive_organization_id'));
            console.log('All localStorage keys:', Object.keys(localStorage));
            console.log('localStorage length:', localStorage.length);

            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
                client_id: clientId,
                redirect_uri: redirectUri,
                scope,
                response_type: 'code',
                access_type: 'offline',
                prompt: 'consent',
                state: state, // Add the state parameter to the URL
            })}`;

            console.log('🔗 Generated OAuth URL:', authUrl);

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

            // Verify state using localStorage instead of sessionStorage
            const storedState = localStorage.getItem('google_drive_auth_state');
            const storedOrgId = localStorage.getItem('google_drive_organization_id');

            console.log('🔍 State Verification Debug:');
            console.log('Received state:', state);
            console.log('Stored state:', storedState);
            console.log('Current org ID:', profile.organization_id);
            console.log('Stored org ID:', storedOrgId);
            console.log('State match:', state === storedState);
            console.log('Org ID match:', profile.organization_id === storedOrgId);
            console.log('All localStorage keys:', Object.keys(localStorage));

            // Temporarily disable state verification for debugging
            if (!storedState) {
                console.log('⚠️ No stored state found in localStorage');
                throw new Error('No stored state found in localStorage');
            }

            if (state !== storedState || profile.organization_id !== storedOrgId) {
                console.log('⚠️ State or org ID mismatch');
                throw new Error('Invalid authentication state');
            }

            // Get configuration from database for token exchange
            const config = await googleDriveService.initialize(profile.organization_id);
            if (!config) {
                throw new Error('Google Drive not configured for this organization');
            }

            // Exchange code for tokens using database configuration
            console.log('🔍 Token Exchange Debug:');
            console.log('Client ID:', config.client_id);
            console.log('Client Secret:', config.client_secret ? '***SET***' : '***NOT SET***');
            console.log('Client Secret Length:', config.client_secret ? config.client_secret.length : 0);
            console.log('Code:', code);
            console.log('Redirect URI:', config.redirect_uri);
            console.log('Full Config:', JSON.stringify(config, null, 2));

            const tokenRequestBody = new URLSearchParams({
                client_id: config.client_id,
                client_secret: config.client_secret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: config.redirect_uri,
            });

            console.log('🔍 Token Request Body:');
            console.log('Client ID in request:', tokenRequestBody.get('client_id'));
            console.log('Client Secret in request:', tokenRequestBody.get('client_secret') ? '***SET***' : '***NOT SET***');
            console.log('Code in request:', tokenRequestBody.get('code'));
            console.log('Redirect URI in request:', tokenRequestBody.get('redirect_uri'));

            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: tokenRequestBody,
            });

            console.log('🔍 Token Exchange Response:');
            console.log('Status:', response.status);
            console.log('Status Text:', response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error Response:', errorText);
                throw new Error(`Failed to exchange authorization code: ${response.status} ${response.statusText}`);
            }

            const tokenResponse = await response.json();
            console.log('✅ Token exchange successful:', {
                access_token: tokenResponse.access_token ? '***SET***' : '***NOT SET***',
                refresh_token: tokenResponse.refresh_token ? '***SET***' : '***NOT SET***',
                expires_in: tokenResponse.expires_in,
                scope: tokenResponse.scope
            });

            // Store tokens
            const success = await googleDriveService.storeTokens(
                user.id,
                profile.organization_id,
                tokenResponse
            );

            if (!success) {
                throw new Error('Failed to store authentication tokens');
            }

            // Clean up localStorage
            localStorage.removeItem('google_drive_auth_state');
            localStorage.removeItem('google_drive_organization_id');

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
