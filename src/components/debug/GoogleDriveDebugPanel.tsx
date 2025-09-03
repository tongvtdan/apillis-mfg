// Google Drive Debug Panel
// Provides debugging information for Google Drive integration issues

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export const GoogleDriveDebugPanel: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Debug Information
                </CardTitle>
                <CardDescription>
                    Debug information for Google Drive integration (Coming Soon)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Debug panel will be available when Google Drive integration is released.
                    </p>
                    <Button disabled>
                        <Clock className="h-4 w-4 mr-2" />
                        Refresh Debug Info
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};