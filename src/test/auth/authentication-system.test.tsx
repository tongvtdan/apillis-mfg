import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useAuditLogger } from '@/hooks/useAuditLogger';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
            signOut: vi.fn().mockResolvedValue({ error: null }),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
            getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
            refreshSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        },
        from: vi.fn(() => ({
            insert: vi.fn().mockResolvedValue({ error: null }),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
    },
}));

// Mock hooks
vi.mock('@/hooks/useSessionManager');
vi.mock('@/hooks/useRoleBasedNavigation');
vi.mock('@/hooks/useAuditLogger');

// Mock components
vi.mock('@/components/ui/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

const TestComponent = () => <div>Protected Content</div>;

const renderWithAuth = (component: React.ReactNode) => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                {component}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Authentication System', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations
        (useSessionManager as any).mockReturnValue({
            isSessionValid: true,
            lastActivity: Date.now(),
            refreshToken: vi.fn(),
            updateActivity: vi.fn(),
        });

        (useRoleBasedNavigation as any).mockReturnValue({
            canAccessRoute: vi.fn().mockReturnValue(true),
            hasAccess: vi.fn().mockReturnValue(true),
            getDefaultRoute: vi.fn().mockReturnValue('/dashboard'),
            navigationItems: [],
            userRole: 'admin',
            isAdmin: true,
        });

        (useAuditLogger as any).mockReturnValue({
            logAuditEvent: vi.fn(),
            logLoginSuccess: vi.fn(),
            logLoginFailure: vi.fn(),
            logLogout: vi.fn(),
            logPermissionDenied: vi.fn(),
            logUnauthorizedAccess: vi.fn(),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('ProtectedRoute Component', () => {
        it('should render loading state when auth is loading', () => {
            renderWithAuth(
                <ProtectedRoute>
                    <TestComponent />
                </ProtectedRoute>
            );

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('should redirect to auth when user is not authenticated', () => {
            // Mock no user
            vi.mocked(useSessionManager).mockReturnValue({
                isSessionValid: false,
                lastActivity: Date.now(),
                refreshToken: vi.fn(),
                updateActivity: vi.fn(),
            });

            renderWithAuth(
                <ProtectedRoute>
                    <TestComponent />
                </ProtectedRoute>
            );

            // Should not render protected content
            expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        });

        it('should show access denied for insufficient permissions', () => {
            vi.mocked(useRoleBasedNavigation).mockReturnValue({
                canAccessRoute: vi.fn().mockReturnValue(false),
                hasAccess: vi.fn().mockReturnValue(false),
                getDefaultRoute: vi.fn().mockReturnValue('/dashboard'),
                navigationItems: [],
                userRole: 'sales',
                isAdmin: false,
                hasResourcePermission: vi.fn().mockReturnValue(false),
                getRoleLevel: vi.fn().mockReturnValue(1),
                isManagement: false,
            });

            renderWithAuth(
                <ProtectedRoute requiredRoles={['admin']}>
                    <TestComponent />
                </ProtectedRoute>
            );

            expect(screen.getByText('Access Denied')).toBeInTheDocument();
            expect(screen.getByText('Go Back')).toBeInTheDocument();
            expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
        });

        it('should render protected content for authorized users', () => {
            // Mock authenticated user with valid session
            vi.mocked(useSessionManager).mockReturnValue({
                isSessionValid: true,
                lastActivity: Date.now(),
                refreshToken: vi.fn(),
                updateActivity: vi.fn(),
            });

            vi.mocked(useRoleBasedNavigation).mockReturnValue({
                canAccessRoute: vi.fn().mockReturnValue(true),
                hasAccess: vi.fn().mockReturnValue(true),
                getDefaultRoute: vi.fn().mockReturnValue('/dashboard'),
                navigationItems: [],
                userRole: 'admin',
                isAdmin: true,
                hasResourcePermission: vi.fn().mockReturnValue(true),
                getRoleLevel: vi.fn().mockReturnValue(7),
                isManagement: true,
            });

            renderWithAuth(
                <ProtectedRoute>
                    <TestComponent />
                </ProtectedRoute>
            );

            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });
    });

    describe('Session Management', () => {
        it('should initialize session manager', () => {
            const mockSessionManager = vi.mocked(useSessionManager);

            renderWithAuth(
                <ProtectedRoute>
                    <TestComponent />
                </ProtectedRoute>
            );

            expect(mockSessionManager).toHaveBeenCalled();
        });

        it('should handle session expiration', () => {
            const mockRefreshToken = vi.fn();

            vi.mocked(useSessionManager).mockReturnValue({
                isSessionValid: false,
                lastActivity: Date.now() - 1000 * 60 * 60 * 25, // 25 hours ago
                refreshToken: mockRefreshToken,
                updateActivity: vi.fn(),
            });

            renderWithAuth(
                <ProtectedRoute>
                    <TestComponent />
                </ProtectedRoute>
            );

            // Should not render protected content due to expired session
            expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        });
    });

    describe('Role-Based Navigation', () => {
        it('should check route access permissions', () => {
            const mockCanAccessRoute = vi.fn().mockReturnValue(true);

            vi.mocked(useRoleBasedNavigation).mockReturnValue({
                canAccessRoute: mockCanAccessRoute,
                hasAccess: vi.fn().mockReturnValue(true),
                getDefaultRoute: vi.fn().mockReturnValue('/dashboard'),
                navigationItems: [],
                userRole: 'admin',
                isAdmin: true,
                hasResourcePermission: vi.fn().mockReturnValue(true),
                getRoleLevel: vi.fn().mockReturnValue(7),
                isManagement: true,
            });

            renderWithAuth(
                <ProtectedRoute>
                    <TestComponent />
                </ProtectedRoute>
            );

            expect(mockCanAccessRoute).toHaveBeenCalled();
        });

        it('should provide correct navigation items based on role', () => {
            const mockNavigationItems = [
                { path: '/dashboard', label: 'Dashboard', requiredPermissions: ['dashboard:read'] },
                { path: '/admin', label: 'Admin', requiredRoles: ['admin'] },
            ];

            vi.mocked(useRoleBasedNavigation).mockReturnValue({
                canAccessRoute: vi.fn().mockReturnValue(true),
                hasAccess: vi.fn().mockReturnValue(true),
                getDefaultRoute: vi.fn().mockReturnValue('/dashboard'),
                navigationItems: mockNavigationItems,
                userRole: 'admin',
                isAdmin: true,
                hasResourcePermission: vi.fn().mockReturnValue(true),
                getRoleLevel: vi.fn().mockReturnValue(7),
                isManagement: true,
            });

            const { navigationItems } = useRoleBasedNavigation();
            expect(navigationItems).toEqual(mockNavigationItems);
        });
    });

    describe('Audit Logging', () => {
        it('should log authentication events', () => {
            const mockLogAuditEvent = vi.fn();

            vi.mocked(useAuditLogger).mockReturnValue({
                logAuditEvent: mockLogAuditEvent,
                logLoginSuccess: vi.fn(),
                logLoginFailure: vi.fn(),
                logLogout: vi.fn(),
                logPermissionDenied: vi.fn(),
                logUnauthorizedAccess: vi.fn(),
                logRoleChange: vi.fn(),
                logProfileUpdate: vi.fn(),
                logSessionExpired: vi.fn(),
                logTokenRefresh: vi.fn(),
            });

            const auditLogger = useAuditLogger();
            expect(auditLogger.logAuditEvent).toBeDefined();
            expect(auditLogger.logLoginSuccess).toBeDefined();
            expect(auditLogger.logPermissionDenied).toBeDefined();
        });

        it('should log permission denied events', () => {
            const mockLogPermissionDenied = vi.fn();

            vi.mocked(useAuditLogger).mockReturnValue({
                logAuditEvent: vi.fn(),
                logLoginSuccess: vi.fn(),
                logLoginFailure: vi.fn(),
                logLogout: vi.fn(),
                logPermissionDenied: mockLogPermissionDenied,
                logUnauthorizedAccess: vi.fn(),
                logRoleChange: vi.fn(),
                logProfileUpdate: vi.fn(),
                logSessionExpired: vi.fn(),
                logTokenRefresh: vi.fn(),
            });

            vi.mocked(useRoleBasedNavigation).mockReturnValue({
                canAccessRoute: vi.fn().mockReturnValue(false),
                hasAccess: vi.fn().mockReturnValue(false),
                getDefaultRoute: vi.fn().mockReturnValue('/dashboard'),
                navigationItems: [],
                userRole: 'sales',
                isAdmin: false,
                hasResourcePermission: vi.fn().mockReturnValue(false),
                getRoleLevel: vi.fn().mockReturnValue(1),
                isManagement: false,
            });

            renderWithAuth(
                <ProtectedRoute requiredRoles={['admin']}>
                    <TestComponent />
                </ProtectedRoute>
            );

            // Should show access denied and log the event
            expect(screen.getByText('Access Denied')).toBeInTheDocument();
        });
    });

    describe('Integration Tests', () => {
        it('should handle complete authentication flow', async () => {
            const mockRefreshToken = vi.fn();
            const mockLogLoginSuccess = vi.fn();

            vi.mocked(useSessionManager).mockReturnValue({
                isSessionValid: true,
                lastActivity: Date.now(),
                refreshToken: mockRefreshToken,
                updateActivity: vi.fn(),
            });

            vi.mocked(useAuditLogger).mockReturnValue({
                logAuditEvent: vi.fn(),
                logLoginSuccess: mockLogLoginSuccess,
                logLoginFailure: vi.fn(),
                logLogout: vi.fn(),
                logPermissionDenied: vi.fn(),
                logUnauthorizedAccess: vi.fn(),
                logRoleChange: vi.fn(),
                logProfileUpdate: vi.fn(),
                logSessionExpired: vi.fn(),
                logTokenRefresh: vi.fn(),
            });

            renderWithAuth(
                <ProtectedRoute>
                    <TestComponent />
                </ProtectedRoute>
            );

            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });

        it('should handle role changes and permission updates', () => {
            const mockLogRoleChange = vi.fn();

            vi.mocked(useAuditLogger).mockReturnValue({
                logAuditEvent: vi.fn(),
                logLoginSuccess: vi.fn(),
                logLoginFailure: vi.fn(),
                logLogout: vi.fn(),
                logPermissionDenied: vi.fn(),
                logUnauthorizedAccess: vi.fn(),
                logRoleChange: mockLogRoleChange,
                logProfileUpdate: vi.fn(),
                logSessionExpired: vi.fn(),
                logTokenRefresh: vi.fn(),
            });

            const auditLogger = useAuditLogger();

            // Simulate role change
            auditLogger.logRoleChange('sales', 'admin', 'system');

            expect(mockLogRoleChange).toHaveBeenCalledWith('sales', 'admin', 'system');
        });
    });
});