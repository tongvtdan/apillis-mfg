import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    WifiOff,
    RefreshCw,
    Download,
    AlertTriangle,
    Clock,
    Database,
    HardDrive,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface OfflineStateProps {
    onRetry?: () => void;
    onRefresh?: () => void;
    showCachedData?: boolean;
    cachedDataCount?: number;
    lastSyncTime?: Date;
}

/**
 * Offline state component with cached data fallback
 */
export function OfflineState({
    onRetry,
    onRefresh,
    showCachedData = false,
    cachedDataCount = 0,
    lastSyncTime
}: OfflineStateProps) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast.success('Connection restored');
            onRetry?.();
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast.warning('Connection lost - working offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [onRetry]);

    return (
        <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                    <WifiOff className="h-5 w-5" />
                    Working Offline
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        You're currently offline. Some features may be limited.
                    </AlertDescription>
                </Alert>

                {showCachedData && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Cached Data Available</span>
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <HardDrive className="h-3 w-3" />
                                {cachedDataCount} items
                            </Badge>
                        </div>

                        {lastSyncTime && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last synced: {lastSyncTime.toLocaleString()}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-2">
                    <Button onClick={onRetry} variant="default" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>

                    {onRefresh && (
                        <Button onClick={onRefresh} variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh Page
                        </Button>
                    )}
                </div>

                <div className="text-xs text-muted-foreground">
                    <p>While offline, you can:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>View previously loaded data</li>
                        <li>Make changes (will sync when online)</li>
                        <li>Export data for backup</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}

interface LoadingFallbackProps {
    message?: string;
    showProgress?: boolean;
    progress?: number;
    onCancel?: () => void;
    timeout?: number;
    onTimeout?: () => void;
}

/**
 * Loading fallback with timeout and cancel options
 */
export function LoadingFallback({
    message = 'Loading...',
    showProgress = false,
    progress = 0,
    onCancel,
    timeout = 30000, // 30 seconds
    onTimeout
}: LoadingFallbackProps) {
    const [timeoutReached, setTimeoutReached] = useState(false);

    useEffect(() => {
        if (timeout > 0) {
            const timer = setTimeout(() => {
                setTimeoutReached(true);
                onTimeout?.();
            }, timeout);

            return () => clearTimeout(timer);
        }
    }, [timeout, onTimeout]);

    if (timeoutReached) {
        return (
            <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto" />
                        <div>
                            <h3 className="font-medium text-yellow-800">Loading is taking longer than expected</h3>
                            <p className="text-sm text-yellow-600 mt-1">
                                This might be due to a slow connection or server issues.
                            </p>
                        </div>
                        <div className="flex justify-center gap-2">
                            <Button onClick={() => window.location.reload()} size="sm">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh Page
                            </Button>
                            {onCancel && (
                                <Button onClick={onCancel} variant="outline" size="sm">
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    </div>

                    <div>
                        <h3 className="font-medium">{message}</h3>
                        {showProgress && (
                            <div className="mt-2">
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {Math.round(progress)}% complete
                                </p>
                            </div>
                        )}
                    </div>

                    {onCancel && (
                        <Button onClick={onCancel} variant="outline" size="sm">
                            Cancel
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

interface DataUnavailableProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    onFallback?: () => void;
    showSkeleton?: boolean;
    skeletonCount?: number;
}

/**
 * Data unavailable fallback with skeleton loading option
 */
export function DataUnavailable({
    title = 'Data Unavailable',
    message = 'Unable to load the requested data.',
    onRetry,
    onFallback,
    showSkeleton = false,
    skeletonCount = 3
}: DataUnavailableProps) {
    if (showSkeleton) {
        return (
            <div className="space-y-4">
                {Array.from({ length: skeletonCount }).map((_, index) => (
                    <Card key={index}>
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <Card className="border-muted">
            <CardContent className="pt-6">
                <div className="text-center space-y-4">
                    <Database className="h-8 w-8 text-muted-foreground mx-auto" />

                    <div>
                        <h3 className="font-medium text-muted-foreground">{title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{message}</p>
                    </div>

                    <div className="flex justify-center gap-2">
                        {onRetry && (
                            <Button onClick={onRetry} size="sm">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </Button>
                        )}

                        {onFallback && (
                            <Button onClick={onFallback} variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Use Cached Data
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface GracefulDegradationProps {
    level: 'minimal' | 'reduced' | 'offline';
    onUpgrade?: () => void;
    features?: {
        available: string[];
        unavailable: string[];
    };
}

/**
 * Graceful degradation component showing available/unavailable features
 */
export function GracefulDegradation({
    level,
    onUpgrade,
    features
}: GracefulDegradationProps) {
    const getLevelInfo = (level: string) => {
        switch (level) {
            case 'minimal':
                return {
                    title: 'Minimal Mode',
                    description: 'Basic functionality available',
                    color: 'yellow',
                    icon: AlertTriangle
                };
            case 'reduced':
                return {
                    title: 'Reduced Mode',
                    description: 'Limited functionality available',
                    color: 'orange',
                    icon: AlertTriangle
                };
            case 'offline':
                return {
                    title: 'Offline Mode',
                    description: 'Working with cached data only',
                    color: 'red',
                    icon: WifiOff
                };
            default:
                return {
                    title: 'Degraded Mode',
                    description: 'Some features unavailable',
                    color: 'gray',
                    icon: AlertTriangle
                };
        }
    };

    const levelInfo = getLevelInfo(level);
    const Icon = levelInfo.icon;

    return (
        <Alert className={`border-${levelInfo.color}-200 bg-${levelInfo.color}-50`}>
            <Icon className="h-4 w-4" />
            <AlertDescription>
                <div className="space-y-3">
                    <div>
                        <strong>{levelInfo.title}</strong> - {levelInfo.description}
                    </div>

                    {features && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {features.available.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Available Features
                                    </h4>
                                    <ul className="space-y-1">
                                        {features.available.map((feature, index) => (
                                            <li key={index} className="text-green-600">• {feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {features.unavailable.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        Unavailable Features
                                    </h4>
                                    <ul className="space-y-1">
                                        {features.unavailable.map((feature, index) => (
                                            <li key={index} className="text-red-600">• {feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {onUpgrade && (
                        <Button onClick={onUpgrade} size="sm" className="mt-2">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Full Mode
                        </Button>
                    )}
                </div>
            </AlertDescription>
        </Alert>
    );
}