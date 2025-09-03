// Google Drive Debug Panel
// Provides debugging information for Google Drive integration issues

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    Loader2,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ChevronDown,
    RefreshCw,
    Database,
    Key,
    Globe,
    Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { supabase } from '@/integrations/supabase/client';

interface DebugInfo {
    environment: {
        clientId: string | undefined;
        clientSecret: string | undefined;
        supabaseUrl: string | undefined;
        currentOrigin: string;
    };
    database: {
        configExists: boolean;
        configData: any;
        tokensExist: boolean;
        tokensData: any;
        error?: string;
    };
    localStorage: {
        authState: string | null;
        organizationId: string | null;
        allKeys: string[];
    };
    authentication: {
        userAuthenticated: boolean;
        profileLoaded: boolean;
        organizationId: string | undefined;
        userRole: string | undefined;
    };
    googleDrive: {
        isAuthenticated: boolean;
        isLoading: boolean;
        error: string | null;
    };
}

export const GoogleDriveDebugPanel: React.FC = () => {
    const { user, profile } = useAuth();
    const { authState } = useGoogleDrive();
    const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const collectDebugInfo = async () => {
        try {
            const info: DebugInfo = {
                environment: {
                    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
                    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
                    currentOrigin: window.location.origin
                },
                database: {
                    configExists: false,
                    configData: null,
                    tokensExist: false,
                    tokensData: null
                },
                localStorage: {
                    authState: localStorage.getItem('google_drive_auth_state'),
                    organizationId: localStorage.getItem('google_drive_organization_id'),
                    allKeys: Object.keys(localStorage)
                },
                authentication: {
                    userAuthenticated: !!user,
                    profileLoaded: !!profile,
                    organizationId: profile?.organization_id,
                    userRole: profile?.role
                },
                googleDrive: {
                    isAuthenticated: authState.isAuthenticated,
                    isLoading: authState.isLoading,
                    error: authState.error
                }
            };

            // Check database configuration
            if (profile?.organization_id) {
                try {
                    const { data: config, error: configError } = await supabase
                        .from('google_drive_config')
                        .select('*')
                        .eq('organization_id', profile.organization_id)
                        .eq('is_active', true)
                        .single();

                    info.database.configExists = !!config && !configError;
                    info.database.configData = config;
                    if (configError) {
                        info.database.error = configError.message;
                    }
                } catch (error) {
                    info.database.error = error instanceof Error ? error.message : 'Unknown error';
                }

                // Check tokens
                if (user?.id) {
                    try {
                        const { data: tokens, error: tokensError } = await supabase
                            .from('google_drive_tokens')
                            .select('*')
                            .eq('user_id', user.id)
                            .eq('organization_id', profile.organization_id)
                            .single();

                        info.database.tokensExist = !!tokens && !tokensError;
                        info.database.tokensData = tokens ? {
                            ...tokens,
                            access_token: tokens.access_token ? '***REDACTED***' : null,
                            refresh_token: tokens.refresh_token ? '***REDACTED***' : null
                        } : null;
                    } catch (error) {
                        // Tokens not existing is not an error for debug purposes
                    }
                }
            }

            setDebugInfo(info);
        } catch (error) {
            console.error('Failed to collect debug info:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        collectDebugInfo();
    }, [user, profile, authState]);

    const handleRefresh = () => {
        setRefreshing(true);
        collectDebugInfo();
    };

    const clearLocalStorage = () => {
        localStorage.removeItem('google_drive_auth_state');
        localStorage.removeItem('google_drive_organization_id');
        handleRefresh();
    };

    const getStatusIcon = (condition: boolean) => {
        return condition ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
            <XCircle className="h-4 w-4 text-red-500" />
        );
    };

    const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => {
        return (
            <Badge variant={condition ? "default" : "destructive"}>
                {condition ? trueText : falseText}
            </Badge>
        );
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (!debugInfo) {
        return (
            <Card>
                <CardContent className="p-6">
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Failed to collect debug information
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Google Drive Debug Information
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        {refreshing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        Refresh
                    </Button>
                </CardTitle>
                <CardDescription>
                    Diagnostic information for troubleshooting Google Drive integration
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Quick Status Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                        {getStatusIcon(!!debugInfo.environment.clientId)}
                        <span className="text-sm">Client ID</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusIcon(debugInfo.database.configExists)}
                        <span className="text-sm">DB Config</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusIcon(debugInfo.authentication.userAuthenticated && debugInfo.authentication.profileLoaded)}
                        <span className="text-sm">Auth</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusIcon(debugInfo.googleDrive.isAuthenticated)}
                        <span className="text-sm">Google Drive</span>
                    </div>
                </div>

                {/* Environment Variables */}
                <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded">
                        <Settings className="h-4 w-4" />
                        <span className="font-medium">Environment Variables</span>
                        <ChevronDown className="h-4 w-4 ml-auto" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-2 space-y-2">
                        <div className="grid gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">VITE_GOOGLE_CLIENT_ID:</span>
                                {getStatusBadge(!!debugInfo.environment.clientId, 'Set', 'Not Set')}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">VITE_GOOGLE_CLIENT_SECRET:</span>
                                {getStatusBadge(!!debugInfo.environment.clientSecret, 'Set', 'Not Set')}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Current Origin:</span>
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {debugInfo.environment.currentOrigin}
                                </code>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Database Configuration */}
                <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded">
                        <Database className="h-4 w-4" />
                        <span className="font-medium">Database Configuration</span>
                        <ChevronDown className="h-4 w-4 ml-auto" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-2 space-y-2">
                        <div className="grid gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Config Exists:</span>
                                {getStatusBadge(debugInfo.database.configExists, 'Yes', 'No')}
                            </div>
                            {debugInfo.database.configData && (
                                <div className="space-y-1">
                                    <span className="text-sm font-medium">Configuration:</span>
                                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                        {JSON.stringify({
                                            ...debugInfo.database.configData,
                                            client_secret: debugInfo.database.configData.client_secret ? '***REDACTED***' : null
                                        }, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {debugInfo.database.error && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        {debugInfo.database.error}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Local Storage */}
                <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded">
                        <Key className="h-4 w-4" />
                        <span className="font-medium">Local Storage</span>
                        <ChevronDown className="h-4 w-4 ml-auto" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-2 space-y-2">
                        <div className="grid gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">OAuth State:</span>
                                {getStatusBadge(!!debugInfo.localStorage.authState, 'Present', 'Missing')}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Organization ID:</span>
                                {getStatusBadge(!!debugInfo.localStorage.organizationId, 'Present', 'Missing')}
                            </div>
                            {debugInfo.localStorage.authState && (
                                <div>
                                    <span className="text-sm">State Value:</span>
                                    <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                                        {debugInfo.localStorage.authState}
                                    </code>
                                </div>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearLocalStorage}
                                className="w-fit"
                            >
                                Clear OAuth State
                            </Button>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Authentication Status */}
                <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded">
                        <Globe className="h-4 w-4" />
                        <span className="font-medium">Authentication Status</span>
                        <ChevronDown className="h-4 w-4 ml-auto" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-2 space-y-2">
                        <div className="grid gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">User Authenticated:</span>
                                {getStatusBadge(debugInfo.authentication.userAuthenticated, 'Yes', 'No')}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Profile Loaded:</span>
                                {getStatusBadge(debugInfo.authentication.profileLoaded, 'Yes', 'No')}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Google Drive Auth:</span>
                                {getStatusBadge(debugInfo.googleDrive.isAuthenticated, 'Connected', 'Not Connected')}
                            </div>
                            {debugInfo.googleDrive.error && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                        {debugInfo.googleDrive.error}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Recommendations */}
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <div className="space-y-2">
                            <p className="font-medium">Common Issues & Solutions:</p>
                            <ul className="text-sm space-y-1 ml-4">
                                {!debugInfo.environment.clientId && (
                                    <li>• Set VITE_GOOGLE_CLIENT_ID in your .env.local file</li>
                                )}
                                {!debugInfo.environment.clientSecret && (
                                    <li>• Set VITE_GOOGLE_CLIENT_SECRET in your .env.local file</li>
                                )}
                                {!debugInfo.database.configExists && (
                                    <li>• Run the database migration: supabase db reset</li>
                                )}
                                {debugInfo.localStorage.authState && !debugInfo.googleDrive.isAuthenticated && (
                                    <li>• Clear OAuth state and try connecting again</li>
                                )}
                                {!debugInfo.authentication.profileLoaded && (
                                    <li>• Ensure you're logged in with a valid user account</li>
                                )}
                            </ul>
                        </div>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
};