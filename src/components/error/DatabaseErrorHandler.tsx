import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    Database,
    Wifi,
    WifiOff,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { projectService } from '@/services/projectService';

interface DatabaseErrorHandlerProps {
    error: Error;
    onRetry?: () => void;
    onFallback?: () => void;
    showConnectionStatus?: boolean;
    context?: string;
}

interface ConnectionStatus {
    isOnline: boolean;
    databaseConnected: boolean;
    lastChecked: Date;
    responseTime?: number;
    error?: string;
}

/**
 * Specialized error handler for database connection issues
 * Provides connection diagnostics and recovery options
 */
export function DatabaseErrorHandler({
    error,
    onRetry,
    onFallback,
    showConnectionStatus = true,
    context = 'Database Operation'
}: DatabaseErrorHandlerProps) {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
        isOnline: navigator.onLine,
        databaseConnected: false,
        lastChecked: new Date()
    });
    const [isChecking, setIsChecking] = useState(false);
    const [autoRetryCount, setAutoRetryCount] = useState(0);
    const [autoRetryEnabled, setAutoRetryEnabled] = useState(true);

    const maxAutoRetries = 3;
    const retryInterval = 5000; // 5 seconds

    // Check connection status
    const checkConnectionStatus = async (): Promise<ConnectionStatus> => {
        const startTime = Date.now();

        try {
            const result = await projectService.testConnection();
            const responseTime = Date.now() - startTime;

            return {
                isOnline: navigator.onLine,
                databaseConnected: result.success,
                lastChecked: new Date(),
                responseTime,
                error: result.error
            };
        } catch (err) {
            return {
                isOnline: navigator.onLine,
                databaseConnected: false,
                lastChecked: new Date(),
                responseTime: Date.now() - startTime,
                error: err instanceof Error ? err.message : 'Connection test failed'
            };
        }
    };

    // Handle manual retry
    const handleRetry = async () => {
        setIsChecking(true);

        try {
            const status = await checkConnectionStatus();
            setConnectionStatus(status);

            if (status.databaseConnected) {
                toast.success('Database connection restored');
                onRetry?.();
            } else {
                toast.error('Database connection still unavailable');
            }
        } catch (err) {
            toast.error('Failed to check connection status');
        } finally {
            setIsChecking(false);
        }
    };

    // Auto-retry mechanism
    useEffect(() => {
        if (!autoRetryEnabled || autoRetryCount >= maxAutoRetries) {
            return;
        }

        const timer = setTimeout(async () => {
            console.log(`Auto-retry attempt ${autoRetryCount + 1} of ${maxAutoRetries}`);

            const status = await checkConnectionStatus();
            setConnectionStatus(status);
            setAutoRetryCount(prev => prev + 1);

            if (status.databaseConnected) {
                toast.success('Database connection restored automatically');
                setAutoRetryEnabled(false);
                onRetry?.();
            } else {
                toast.info(`Auto-retry ${autoRetryCount + 1}/${maxAutoRetries} failed, trying again...`);
            }
        }, retryInterval);

        return () => clearTimeout(timer);
    }, [autoRetryCount, autoRetryEnabled, onRetry]);

    // Listen for online/offline events
    useEffect(() => {
        const handleOnline = () => {
            setConnectionStatus(prev => ({ ...prev, isOnline: true }));
            toast.info('Internet connection restored');
            // Trigger connection check when coming back online
            checkConnectionStatus().then(setConnectionStatus);
        };

        const handleOffline = () => {
            setConnectionStatus(prev => ({ ...prev, isOnline: false, databaseConnected: false }));
            toast.warning('Internet connection lost');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Initial connection check
    useEffect(() => {
        checkConnectionStatus().then(setConnectionStatus);
    }, []);

    const getErrorCategory = (error: Error): string => {
        const message = error.message.toLowerCase();

        if (message.includes('network') || message.includes('fetch')) {
            return 'Network Error';
        }
        if (message.includes('timeout')) {
            return 'Connection Timeout';
        }
        if (message.includes('supabase') || message.includes('database')) {
            return 'Database Error';
        }
        if (message.includes('cors')) {
            return 'CORS Error';
        }
        return 'Connection Error';
    };

    const getErrorSolution = (error: Error): string[] => {
        const category = getErrorCategory(error);

        switch (category) {
            case 'Network Error':
                return [
                    'Check your internet connection',
                    'Try refreshing the page',
                    'Disable VPN if active',
                    'Check firewall settings'
                ];
            case 'Connection Timeout':
                return [
                    'Wait a moment and try again',
                    'Check if the server is responding',
                    'Try using a different network',
                    'Contact your network administrator'
                ];
            case 'Database Error':
                return [
                    'The database may be temporarily unavailable',
                    'Try again in a few minutes',
                    'Check the service status page',
                    'Contact support if the issue persists'
                ];
            case 'CORS Error':
                return [
                    'This is a configuration issue',
                    'Contact the development team',
                    'Try accessing from a different domain',
                    'Check browser console for details'
                ];
            default:
                return [
                    'Try refreshing the page',
                    'Check your internet connection',
                    'Clear browser cache and cookies',
                    'Contact support if the issue persists'
                ];
        }
    };

    const getStatusIcon = (status: ConnectionStatus) => {
        if (!status.isOnline) {
            return <WifiOff className="h-4 w-4 text-red-500" />;
        }
        if (status.databaseConnected) {
            return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        }
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    };

    const getStatusText = (status: ConnectionStatus) => {
        if (!status.isOnline) {
            return 'Offline';
        }
        if (status.databaseConnected) {
            return 'Connected';
        }
        return 'Disconnected';
    };

    const getStatusVariant = (status: ConnectionStatus): 'default' | 'secondary' | 'destructive' => {
        if (!status.isOnline || !status.databaseConnected) {
            return 'destructive';
        }
        return 'default';
    };

    return (
        <div className="space-y-6">
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <Database className="h-5 w-5" />
                        {getErrorCategory(error)}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Unable to connect to the database. {context} failed.
                        </AlertDescription>
                    </Alert>

                    {/* Connection Status */}
                    {showConnectionStatus && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Connection Status</span>
                                <Badge variant={getStatusVariant(connectionStatus)} className="flex items-center gap-1">
                                    {getStatusIcon(connectionStatus)}
                                    {getStatusText(connectionStatus)}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    {connectionStatus.isOnline ? (
                                        <Wifi className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <WifiOff className="h-4 w-4 text-red-500" />
                                    )}
                                    <span>Internet: {connectionStatus.isOnline ? 'Connected' : 'Disconnected'}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Database className={`h-4 w-4 ${connectionStatus.databaseConnected ? 'text-green-500' : 'text-red-500'}`} />
                                    <span>Database: {connectionStatus.databaseConnected ? 'Connected' : 'Disconnected'}</span>
                                </div>
                            </div>

                            {connectionStatus.responseTime && (
                                <div className="text-xs text-muted-foreground">
                                    Response time: {connectionStatus.responseTime}ms
                                </div>
                            )}

                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last checked: {connectionStatus.lastChecked.toLocaleTimeString()}
                            </div>
                        </div>
                    )}

                    {/* Auto-retry Status */}
                    {autoRetryEnabled && autoRetryCount > 0 && (
                        <Alert>
                            <RefreshCw className="h-4 w-4" />
                            <AlertDescription>
                                Auto-retry in progress: {autoRetryCount}/{maxAutoRetries} attempts completed
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Details */}
                    <details className="text-sm">
                        <summary className="cursor-pointer font-medium">Error Details</summary>
                        <div className="mt-2 p-3 bg-muted rounded-md">
                            <div className="space-y-2">
                                <div><strong>Error:</strong> {error.name}</div>
                                <div><strong>Message:</strong> {error.message}</div>
                                {connectionStatus.error && (
                                    <div><strong>Connection Error:</strong> {connectionStatus.error}</div>
                                )}
                            </div>
                        </div>
                    </details>

                    {/* Solutions */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Suggested Solutions:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            {getErrorSolution(error).map((solution, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-xs mt-1">•</span>
                                    <span>{solution}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        <Button
                            onClick={handleRetry}
                            disabled={isChecking}
                            variant="default"
                        >
                            {isChecking ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            {isChecking ? 'Checking...' : 'Retry Connection'}
                        </Button>

                        {onFallback && (
                            <Button onClick={onFallback} variant="outline">
                                <Settings className="h-4 w-4 mr-2" />
                                Use Offline Mode
                            </Button>
                        )}

                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh Page
                        </Button>

                        {autoRetryEnabled && (
                            <Button
                                onClick={() => setAutoRetryEnabled(false)}
                                variant="ghost"
                                size="sm"
                            >
                                Stop Auto-retry
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}