// Google Drive Test Page
// Provides a comprehensive testing interface for Google Drive integration

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, FileText, Settings, Clock } from 'lucide-react';
import { GoogleDriveDebugPanel } from '@/components/debug/GoogleDriveDebugPanel';
import { GoogleDriveConfigPanel } from '@/components/admin/GoogleDriveConfigPanel';
import { useAuth } from '@/contexts/AuthContext';

export const GoogleDriveTest: React.FC = () => {
    const { profile } = useAuth();

    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Google Drive Integration Test</h1>
                    <p className="text-muted-foreground mt-2">
                        Google Drive integration is currently under development
                    </p>
                </div>
                <Button
                    variant="outline"
                    disabled
                    title="Coming soon"
                >
                    <Clock className="h-4 w-4 mr-2" />
                    Setup Guide
                </Button>
            </div>

            {/* Coming Soon Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Integration Status
                    </CardTitle>
                    <CardDescription>
                        Google Drive integration is currently under development
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Google Drive integration is currently under development and will be available soon.
                        </p>
                        <Button disabled>
                            <Clock className="h-4 w-4 mr-2" />
                            Connect Google Drive
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Coming Soon Alert */}
            <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                    <div className="space-y-2">
                        <p className="font-medium">What's coming:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>OAuth 2.0 authentication with Google Drive</li>
                            <li>Browse and select files from Google Drive</li>
                            <li>Add document links instead of uploading files</li>
                            <li>Real-time collaboration features</li>
                            <li>Automatic file synchronization</li>
                        </ul>
                    </div>
                </AlertDescription>
            </Alert>

            {/* Admin Configuration Panel */}
            {isAdmin && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Admin Configuration
                        </CardTitle>
                        <CardDescription>
                            Configure Google Drive integration settings (Coming Soon)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground">
                                Configuration panel will be available when Google Drive integration is released.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Debug Panel */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Debug Information
                    </CardTitle>
                    <CardDescription>
                        Debug information for Google Drive integration (Coming Soon)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                            Debug panel will be available when Google Drive integration is released.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};