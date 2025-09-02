// Google Drive Authentication Component
// Handles Google Drive OAuth flow and connection status

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Cloud,
    CheckCircle,
    XCircle,
    Loader2,
    ExternalLink,
    Settings,
    RefreshCw
} from 'lucide-react';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface GoogleDriveAuthProps {
    onConnect?: () => void;
    onDisconnect?: () => void;
    showDetails?: boolean;
}

export const GoogleDriveAuth: React.FC<GoogleDriveAuthProps> = ({
    onConnect,
    onDisconnect,
    showDetails = false,
}) => {
    const { user } = useAuth();
    const {
        authState,
        authenticate,
        disconnect,
        isLoading,
        error
    } = useGoogleDrive();

    const handleConnect = async () => {
        try {
            await authenticate();
            onConnect?.();
        } catch (error) {
            console.error('Failed to connect Google Drive:', error);
        }
    };

    const handleDisconnect = async () => {
        try {
            await disconnect();
            onDisconnect?.();
        } catch (error) {
            console.error('Failed to disconnect Google Drive:', error);
        }
    };

    const getStatusIcon = () => {
        if (isLoading) {
            return <Loader2 className="h-4 w-4 animate-spin" />;
        }

        if (authState.isAuthenticated) {
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        }

        return <XCircle className="h-4 w-4 text-red-500" />;
    };

    const getStatusText = () => {
        if (isLoading) {
            return 'Connecting...';
        }

        if (authState.isAuthenticated) {
            return 'Connected';
        }

        return 'Not Connected';
    };

    const getStatusBadgeVariant = () => {
        if (isLoading) return 'secondary';
        if (authState.isAuthenticated) return 'default';
        return 'destructive';
    };

    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5" />
                        Google Drive Integration
                    </CardTitle>
                    <CardDescription>
                        Connect your Google Drive account to add documents from Drive
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Please sign in to connect Google Drive
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Cloud className="h-5 w-5" />
                        <CardTitle>Google Drive Integration</CardTitle>
                    </div>
                    <Badge variant={getStatusBadgeVariant()}>
                        {getStatusIcon()}
                        <span className="ml-1">{getStatusText()}</span>
                    </Badge>
                </div>
                <CardDescription>
                    Connect your Google Drive account to add documents from Drive
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {error && (
                    <div className="rounded-md bg-destructive/10 p-3">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                {authState.isAuthenticated ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Connected Account</p>
                                <p className="text-sm text-muted-foreground">
                                    {authState.userEmail || user.email}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDisconnect}
                                disabled={isLoading}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Disconnect
                            </Button>
                        </div>

                        {showDetails && authState.tokenExpiresAt && (
                            <div className="text-sm text-muted-foreground">
                                <p>Token expires: {format(new Date(authState.tokenExpiresAt), 'PPp')}</p>
                            </div>
                        )}

                        <Separator />

                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">What you can do:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Add Google Drive files as document links</li>
                                <li>• Browse and select files from your Drive</li>
                                <li>• Share files with team members</li>
                                <li>• Access files without downloading</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Benefits of connecting:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Save storage space by linking instead of uploading</li>
                                <li>• Access files directly from Google Drive</li>
                                <li>• Real-time collaboration with team members</li>
                                <li>• Automatic file synchronization</li>
                            </ul>
                        </div>

                        <Button
                            onClick={handleConnect}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Cloud className="h-4 w-4 mr-2" />
                            )}
                            Connect Google Drive
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                            You'll be redirected to Google to authorize access
                        </p>
                    </div>
                )}

                {showDetails && (
                    <>
                        <Separator />
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">Integration Settings</h4>
                                <Button variant="ghost" size="sm">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Configure
                                </Button>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                                <p>• Read-only access to your Google Drive files</p>
                                <p>• No files are downloaded or stored locally</p>
                                <p>• You can disconnect at any time</p>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};
