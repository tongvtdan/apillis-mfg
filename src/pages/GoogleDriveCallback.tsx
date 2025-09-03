// Google Drive OAuth Callback Page
// Handles the OAuth callback from Google Drive

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

export const GoogleDriveCallback: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto p-6">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Google Drive Integration
                    </CardTitle>
                    <CardDescription>
                        Google Drive integration is currently under development
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Google Drive integration is currently under development and will be available soon.
                    </p>
                    <Button onClick={() => navigate('/')}>
                        Return to Dashboard
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
