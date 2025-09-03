// Google Drive Test Page
// Provides a comprehensive testing interface for Google Drive integration

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, FileText, Settings } from 'lucide-react';
import { GoogleDriveDebugPanel } from '@/components/debug/GoogleDriveDebugPanel';
import { GoogleDriveConfigPanel } from '@/components/admin/GoogleDriveConfigPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';

export const GoogleDriveTest: React.FC = () => {
    const { profile } = useAuth();
    const { authenticate, isAuthenticated, isLoading, error } = useGoogleDrive();

    const handleConnect = async () => {
        try {
            await authenticate();
        } catch (error) {
            console.error('Failed to connect Google Drive:', error);
        }
    };

    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Google Drive Integration Test</h1>
                    <p className="text-muted-foreground mt-2">
                        Test and debug your Google Drive integration setup
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => window.open('/docs/GOOGLE_DRIVE_SETUP.md', '_blank')}
                >
                    <FileText className="h-4 w-4 mr-2" />
                    Setup Guide
                </Button>
            </div>

            {/* Quick Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Integration Status
                    </CardTitle>
                    <CardDescription>
                        Current status of your Google Drive integration
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">
                                Status: {isAuthenticated ? (
                                    <span className="text-green-600">Connected</span>
                                ) : (
                                    <span className="text-red-600">Not Connected</span>
                                )}
                            </p>
                            {error && (
                                <p className="text-sm text-red-600 mt-1">Error: {error}</p>
                            )}
                        </div>
                        <Button
                            onClick={handleConnect}
                            disabled={isLoading || isAuthenticated}
                        >
                            {isLoading ? 'Connecting...' : isAuthenticated ? 'Connected' : 'Connect Google Drive'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Setup Instructions */}
            <Alert>
                <ExternalLink className="h-4 w-4" />
                <AlertDescription>
                    <div className="space-y-2">
                        <p className="font-medium">Quick Setup Steps:</p>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                            <li>
                                Create OAuth credentials in{' '}
                                <a
                                    href="https://console.cloud.google.com/apis/credentials"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    Google Cloud Console
                                </a>
                            </li>
                            <li>Add redirect URI: <code>http://localhost:8080/auth/google/callback</code></li>
                            <li>Update your <code>.env.local</code> file with Client ID and Secret</li>
                            <li>Restart your development server</li>
                            <li>Test the connection using the button above</li>
                        </ol>
                    </div>
                </AlertDescription>
            </Alert>

            {/* Admin Configuration Panel */}
            {isAdmin && (
                <GoogleDriveConfigPanel />
            )}

            {/* Debug Panel */}
            <GoogleDriveDebugPanel />

            {/* Additional Resources */}
            <Card>
                <CardHeader>
                    <CardTitle>Additional Resources</CardTitle>
                    <CardDescription>
                        Helpful links and documentation
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        <a
                            href="https://console.cloud.google.com/apis/credentials"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            Google Cloud Console - Credentials
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        <a
                            href="https://developers.google.com/drive/api/guides/about-sdk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            Google Drive API Documentation
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <a
                            href="/docs/GOOGLE_DRIVE_SETUP.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            Complete Setup Guide
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};