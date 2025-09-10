import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/core/auth';
import { supabase } from '@/integrations/supabase/client';
import { AUTH_CONFIG } from '@/lib/auth-constants';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook for managing user sessions with automatic token refresh and session monitoring
 */
export function useSessionManager() {
    const { user, session, signOut } = useAuth();
    const { toast } = useToast();
    const sessionTimeoutRef = useRef<NodeJS.Timeout>();
    const tokenRefreshRef = useRef<NodeJS.Timeout>();
    const lastActivityRef = useRef<number>(Date.now());

    // Update last activity timestamp
    const updateActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
    }, []);

    // Check if session is expired
    const isSessionExpired = useCallback(() => {
        if (!session?.expires_at) return false;
        return Date.now() >= session.expires_at * 1000;
    }, [session]);

    // Check if user has been inactive too long
    const isInactive = useCallback(() => {
        const inactiveTime = Date.now() - lastActivityRef.current;
        return inactiveTime >= AUTH_CONFIG.SESSION_TIMEOUT;
    }, []);

    // Handle session expiration
    const handleSessionExpiration = useCallback(async () => {
        toast({
            variant: "destructive",
            title: "Session Expired",
            description: "Your session has expired. Please sign in again.",
        });
        await signOut();
    }, [signOut, toast]);

    // Handle inactivity timeout
    const handleInactivityTimeout = useCallback(async () => {
        toast({
            variant: "destructive",
            title: "Session Timeout",
            description: "You have been signed out due to inactivity.",
        });
        await signOut();
    }, [signOut, toast]);

    // Refresh token proactively
    const refreshToken = useCallback(async () => {
        try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) {
                console.error('Token refresh failed:', error);
                if (error.message.includes('refresh_token_not_found') ||
                    error.message.includes('invalid_refresh_token')) {
                    await handleSessionExpiration();
                }
            } else if (data.session) {
                console.log('Token refreshed successfully');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
        }
    }, [handleSessionExpiration]);

    // Set up session monitoring
    useEffect(() => {
        if (!user || !session) {
            // Clear timers if no user/session
            if (sessionTimeoutRef.current) {
                clearTimeout(sessionTimeoutRef.current);
            }
            if (tokenRefreshRef.current) {
                clearInterval(tokenRefreshRef.current);
            }
            return;
        }

        // Set up periodic session checks
        const checkSession = () => {
            if (isSessionExpired()) {
                handleSessionExpiration();
                return;
            }

            if (isInactive()) {
                handleInactivityTimeout();
                return;
            }
        };

        // Check session every minute
        sessionTimeoutRef.current = setInterval(checkSession, 60 * 1000);

        // Set up proactive token refresh (every 55 minutes)
        tokenRefreshRef.current = setInterval(refreshToken, AUTH_CONFIG.TOKEN_REFRESH_INTERVAL);

        // Clean up on unmount
        return () => {
            if (sessionTimeoutRef.current) {
                clearInterval(sessionTimeoutRef.current);
            }
            if (tokenRefreshRef.current) {
                clearInterval(tokenRefreshRef.current);
            }
        };
    }, [user, session, isSessionExpired, isInactive, handleSessionExpiration, handleInactivityTimeout, refreshToken]);

    // Set up activity listeners
    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        events.forEach(event => {
            document.addEventListener(event, updateActivity, { passive: true });
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, updateActivity);
            });
        };
    }, [updateActivity]);

    return {
        isSessionValid: user && session && !isSessionExpired(),
        lastActivity: lastActivityRef.current,
        refreshToken,
        updateActivity
    };
}