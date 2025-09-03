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
    RefreshCw,
    Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
                    <Badge variant="secondary">
                        <Clock className="h-4 w-4 mr-1" />
                        Coming Soon
                    </Badge>
                </div>
                <CardDescription>
                    Connect your Google Drive account to add documents from Drive
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Google Drive integration is currently under development and will be available soon.
                    </p>
                    <Button disabled className="w-full">
                        <Cloud className="h-4 w-4 mr-2" />
                        Connect Google Drive
                    </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                    <h4 className="text-sm font-medium">What's coming:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Add Google Drive files as document links</li>
                        <li>• Browse and select files from your Drive</li>
                        <li>• Share files with team members</li>
                        <li>• Access files without downloading</li>
                        <li>• Save storage space by linking instead of uploading</li>
                        <li>• Real-time collaboration with team members</li>
                        <li>• Automatic file synchronization</li>
                    </ul>
                </div>

                {showDetails && (
                    <>
                        <Separator />
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">Integration Settings</h4>
                                <Button variant="ghost" size="sm" disabled>
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
