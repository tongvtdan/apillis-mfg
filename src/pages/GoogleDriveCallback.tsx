// Google Drive OAuth Callback Page
// Handles the OAuth callback from Google Drive

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { useAuth } from '@/contexts/AuthContext';

export const GoogleDriveCallback: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { handleAuthCallback } = useGoogleDrive();
    const { user, profile, loading: authLoading } = useAuth();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string>('');
    const isProcessing = useRef(false);
    const processedCode = useRef<string>('');

    useEffect(() => {
        const handleCallback = async () => {
            // Don't process if still loading auth state
            if (authLoading) {
                console.log('⏳ Auth still loading, waiting...');
                return;
            }

            // Don't process if user is not authenticated
            if (!user || !profile) {
                console.log('❌ User not authenticated yet:', { user: !!user, profile: !!profile });
                return; // Don't set error immediately, wait for auth to complete
            }

            // Enhanced OAuth state debugging
            const storedState = localStorage.getItem('google_drive_auth_state');
            const storedOrgId = localStorage.getItem('google_drive_organization_id');

            console.log('🔍 Enhanced OAuth State Debug:');
            console.log('Current URL:', window.location.href);
            console.log('localStorage keys:', Object.keys(localStorage));
            console.log('Stored state:', storedState);
            console.log('Stored org ID:', storedOrgId);
            console.log('Current profile org ID:', profile?.organization_id);
            console.log('User ID:', user?.id);
            console.log('Profile loaded:', !!profile);

            if (!storedState || !storedOrgId) {
                console.log('❌ No OAuth state found in localStorage');
                console.log('Available localStorage items:');
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    console.log(`  ${key}: ${localStorage.getItem(key)}`);
                }
                setStatus('error');
                setError('No stored state found in localStorage. Please start the Google Drive connection process from the document management page.');
                return;
            }

            try {
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                const error = searchParams.get('error');

                // Prevent multiple processing of the same code
                if (isProcessing.current || (code && processedCode.current === code)) {
                    console.log('🔄 Already processing or code already processed, skipping...');
                    return;
                }

                // Debug logging
                console.log('🔍 Callback Debug Info:');
                console.log('URL:', window.location.href);
                console.log('Code:', code);
                console.log('State:', state);
                console.log('Error:', error);
                console.log('All search params:', Object.fromEntries(searchParams.entries()));
                console.log('SessionStorage state:', sessionStorage.getItem('google_drive_auth_state'));
                console.log('SessionStorage org ID:', sessionStorage.getItem('google_drive_organization_id'));
                console.log('localStorage state:', localStorage.getItem('google_drive_auth_state'));
                console.log('localStorage org ID:', localStorage.getItem('google_drive_organization_id'));
                console.log('User authenticated:', !!user);
                console.log('Profile loaded:', !!profile);
                console.log('Organization ID:', profile?.organization_id);

                if (error) {
                    setStatus('error');
                    setError('Authentication was cancelled or failed');
                    return;
                }

                if (!code || !state) {
                    setStatus('error');
                    setError('Invalid callback parameters');
                    return;
                }

                // Mark as processing and store the code
                isProcessing.current = true;
                processedCode.current = code;

                console.log('🚀 Starting OAuth callback processing...');
                await handleAuthCallback(code, state);
                setStatus('success');

                // Clear OAuth state after successful processing
                localStorage.removeItem('google_drive_auth_state');
                localStorage.removeItem('google_drive_organization_id');
                console.log('🧹 Cleared OAuth state from localStorage');

                // Redirect back to the previous page or documents
                setTimeout(() => {
                    navigate(-1);
                }, 2000);
            } catch (err) {
                console.error('Google Drive callback error:', err);
                setStatus('error');
                setError(err instanceof Error ? err.message : 'Authentication failed');

                // Clear OAuth state on error as well
                localStorage.removeItem('google_drive_auth_state');
                localStorage.removeItem('google_drive_organization_id');
                console.log('🧹 Cleared OAuth state from localStorage due to error');
            } finally {
                // Reset processing flag
                isProcessing.current = false;
            }
        };

        handleCallback();
    }, [searchParams, handleAuthCallback, user, profile, authLoading, navigate]);

    const getStatusContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <>
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <h2 className="text-xl font-semibold mb-2">
                            {authLoading ? 'Loading authentication...' : 'Connecting Google Drive...'}
                        </h2>
                        <p className="text-muted-foreground">
                            {authLoading ? 'Please wait while we load your account information.' : 'Please wait while we complete the authentication.'}
                        </p>
                    </>
                );

            case 'success':
                return (
                    <>
                        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Google Drive Connected!</h2>
                        <p className="text-muted-foreground">You can now add documents from Google Drive.</p>
                        <p className="text-sm text-muted-foreground mt-2">Redirecting back...</p>
                    </>
                );

            case 'error':
                return (
                    <>
                        <XCircle className="h-12 w-12 text-red-500 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <div className="flex gap-2">
                            <Button onClick={() => navigate(-1)}>
                                Go Back
                            </Button>
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                Try Again
                            </Button>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Google Drive Integration</CardTitle>
                    <CardDescription>
                        Connecting your Google Drive account
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    {getStatusContent()}
                </CardContent>
            </Card>
        </div>
    );
};
