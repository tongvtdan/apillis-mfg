import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionManager } from '@/hooks/useSessionManager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Clock, Shield, RefreshCw, LogOut, User, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function SessionStatus() {
    const { user, profile, session, signOut } = useAuth();
    const { isSessionValid, lastActivity, refreshToken } = useSessionManager();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    if (!user || !session) {
        return null;
    }

    const sessionExpiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null;
    const timeUntilExpiry = sessionExpiresAt ? sessionExpiresAt.getTime() - currentTime.getTime() : 0;
    const isExpiringSoon = timeUntilExpiry > 0 && timeUntilExpiry < 10 * 60 * 1000; // 10 minutes

    const handleRefreshToken = async () => {
        try {
            await refreshToken();
        } catch (error) {
            console.error('Failed to refresh token:', error);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <Shield className="h-4 w-4" />
                    {isExpiringSoon && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <Card className="border-0 shadow-none">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Session Status
                        </CardTitle>
                        <CardDescription>
                            Current authentication session information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* User Information */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium">{profile?.name || user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building className="h-3 w-3" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={profile?.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                    {profile?.role || 'Unknown Role'}
                                </Badge>
                                <Badge variant={isSessionValid ? 'default' : 'destructive'} className="text-xs">
                                    {isSessionValid ? 'Active' : 'Invalid'}
                                </Badge>
                            </div>
                        </div>

                        <Separator />

                        {/* Session Information */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Last Activity:</span>
                                <span className="font-medium">
                                    {formatDistanceToNow(new Date(lastActivity), { addSuffix: true })}
                                </span>
                            </div>

                            {sessionExpiresAt && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Session Expires:</span>
                                    <span className={`font-medium ${isExpiringSoon ? 'text-orange-600' : ''}`}>
                                        {timeUntilExpiry > 0
                                            ? formatDistanceToNow(sessionExpiresAt, { addSuffix: true })
                                            : 'Expired'
                                        }
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Signed In:</span>
                                <span className="font-medium">
                                    {user.last_sign_in_at
                                        ? formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true })
                                        : 'Unknown'
                                    }
                                </span>
                            </div>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                            {isExpiringSoon && (
                                <Button
                                    onClick={handleRefreshToken}
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                                >
                                    <RefreshCw className="h-3 w-3 mr-2" />
                                    Refresh Session
                                </Button>
                            )}

                            <Button
                                onClick={signOut}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                <LogOut className="h-3 w-3 mr-2" />
                                Sign Out
                            </Button>
                        </div>

                        {/* Security Notice */}
                        {isExpiringSoon && (
                            <div className="p-2 bg-orange-50 border border-orange-200 rounded-md">
                                <div className="flex items-center gap-2 text-xs text-orange-800">
                                    <Clock className="h-3 w-3" />
                                    <span>Your session will expire soon. Click refresh to extend it.</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </PopoverContent>
        </Popover>
    );
}