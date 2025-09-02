// Google Drive OAuth Callback Page
// Handles the OAuth callback from Google Drive

import React, { useEffect, useState } from 'react';
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
    const { user } = useAuth();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                const error = searchParams.get('error');

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

                if (!user) {
                    setStatus('error');
                    setError('User not authenticated');
                    return;
                }

                await handleAuthCallback(code, state);
                setStatus('success');

                // Redirect back to the previous page or documents
                setTimeout(() => {
                    navigate(-1);
                }, 2000);
            } catch (err) {
                console.error('Google Drive callback error:', err);
                setStatus('error');
                setError(err instanceof Error ? err.message : 'Authentication failed');
            }
        };

        handleCallback();
    }, [searchParams, handleAuthCallback, user, navigate]);

    const getStatusContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <>
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Connecting Google Drive...</h2>
                        <p className="text-muted-foreground">Please wait while we complete the authentication.</p>
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
