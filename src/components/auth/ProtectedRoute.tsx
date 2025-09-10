import { useAuth } from '@/core/auth';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Shield, AlertTriangle, Mail, Users } from 'lucide-react';
import { useRoleBasedNavigation } from '@/core/auth/hooks/useRoleBasedNavigation';
import { useAuditLogger } from '@/core/activity-log/hooks/useAuditLogger';
import { useSessionManager } from '@/core/auth/hooks/useSessionManager';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLE_DESCRIPTIONS } from '@/lib/auth-constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

/**
 * Helper function to provide access guidance based on required permissions
 */
function getAccessGuidance(requiredPermissions?: string[], requiredRoles?: string[]) {
  // If specific permissions are required, provide guidance based on them
  if (requiredPermissions && requiredPermissions.length > 0) {
    const permission = requiredPermissions[0].toLowerCase();

    if (permission.includes('customer:create') || permission.includes('customer:archive')) {
      return {
        whoCanAccess: 'Sales or Management team members',
        contact: 'Sales Manager or System Administrator',
        reason: 'Customer management requires sales expertise and relationship oversight.'
      };
    }

    if (permission.includes('supplier:create') || permission.includes('supplier:archive')) {
      return {
        whoCanAccess: 'Procurement or Management team members',
        contact: 'Procurement Manager or System Administrator',
        reason: 'Supplier management requires procurement expertise and vendor relationship oversight.'
      };
    }

    if (permission.includes('project:create') || permission.includes('project:approve')) {
      return {
        whoCanAccess: 'Sales, Procurement, or Management team members',
        contact: 'Project Coordinator or System Administrator',
        reason: 'Project management requires cross-functional coordination.'
      };
    }

    if (permission.includes('admin') || permission.includes('manage')) {
      return {
        whoCanAccess: 'System Administrators only',
        contact: 'System Administrator',
        reason: 'Administrative functions require elevated system access.'
      };
    }

    if (permission.includes('engineering') || permission.includes('qa')) {
      return {
        whoCanAccess: 'Engineering or QA team members',
        contact: 'Engineering Manager or System Administrator',
        reason: 'Technical reviews require specialized expertise.'
      };
    }
  }

  // If specific roles are required, provide guidance based on them
  if (requiredRoles && requiredRoles.length > 0) {
    const role = requiredRoles[0].toLowerCase();

    if (role === 'admin') {
      return {
        whoCanAccess: 'System Administrators only',
        contact: 'System Administrator',
        reason: 'This feature requires administrative privileges.'
      };
    }

    if (role === 'management') {
      return {
        whoCanAccess: 'Management team members',
        contact: 'Department Manager or System Administrator',
        reason: 'This feature requires management-level oversight.'
      };
    }

    if (role === 'sales') {
      return {
        whoCanAccess: 'Sales team members',
        contact: 'Sales Manager',
        reason: 'This feature is designed for sales operations.'
      };
    }

    if (role === 'procurement') {
      return {
        whoCanAccess: 'Procurement team members',
        contact: 'Procurement Manager',
        reason: 'This feature requires procurement expertise.'
      };
    }
  }

  // Default guidance
  return {
    whoCanAccess: 'Authorized personnel',
    contact: 'Your manager or System Administrator',
    reason: 'This feature requires specific permissions based on your role.'
  };
}

export function ProtectedRoute({ children, requiredRoles, requiredPermissions }: ProtectedRouteProps) {
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { canAccessRoute, hasAccess, getDefaultRoute } = useRoleBasedNavigation();
  const { logPermissionDenied, logUnauthorizedAccess } = useAuditLogger();
  const { isSessionValid } = useSessionManager();

  // Check session validity
  useEffect(() => {
    if (user && !isSessionValid) {
      // Session is invalid, redirect to auth
      signOut();
    }
  }, [user, isSessionValid, signOut]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isSessionValid) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Wait for profile to load
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Check route-based access
  if (!canAccessRoute(location.pathname)) {
    // Log unauthorized access attempt
    logUnauthorizedAccess(location.pathname, 'route_access');

    const guidance = getAccessGuidance();

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground text-center space-y-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium text-foreground mb-2">Your Current Access:</p>
                <p>Role: <span className="font-medium capitalize">{profile.role}</span></p>
                <p className="text-xs mt-1">{ROLE_DESCRIPTIONS[profile.role as keyof typeof ROLE_DESCRIPTIONS] || 'Standard user access'}</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">Who Can Access:</span>
                </div>
                <p className="text-blue-800 dark:text-blue-200">{guidance.whoCanAccess}</p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">{guidance.reason}</p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-900 dark:text-amber-100">Need Access?</span>
                </div>
                <p className="text-amber-800 dark:text-amber-200">Contact: <span className="font-medium">{guidance.contact}</span></p>
                <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">They can grant you the necessary permissions.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-6">
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full"
              >
                Go Back
              </Button>
              <Button
                onClick={() => navigate(getDefaultRoute())}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role-based access (legacy support)
  if (requiredRoles && !requiredRoles.includes(profile.role)) {
    logPermissionDenied('route', 'access', requiredRoles.join(','));

    const guidance = getAccessGuidance(undefined, requiredRoles);

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <CardTitle className="text-xl">Insufficient Permissions</CardTitle>
            <CardDescription>
              Your current role doesn't have access to this feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground text-center space-y-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium text-foreground mb-2">Your Current Access:</p>
                <p>Role: <span className="font-medium capitalize">{profile.role}</span></p>
                <p className="text-xs mt-1">{ROLE_DESCRIPTIONS[profile.role as keyof typeof ROLE_DESCRIPTIONS] || 'Standard user access'}</p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-900 dark:text-orange-100">Required Roles:</span>
                </div>
                <p className="text-orange-800 dark:text-orange-200 font-medium">{requiredRoles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}</p>
                <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">{guidance.reason}</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">Who Can Access:</span>
                </div>
                <p className="text-blue-800 dark:text-blue-200">{guidance.whoCanAccess}</p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-900 dark:text-amber-100">Need Access?</span>
                </div>
                <p className="text-amber-800 dark:text-amber-200">Contact: <span className="font-medium">{guidance.contact}</span></p>
                <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">They can grant you the necessary permissions.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-6">
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full"
              >
                Go Back
              </Button>
              <Button
                onClick={() => navigate(getDefaultRoute())}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermissions) {
    const hasRequiredPermissions = requiredPermissions.some(permission => {
      const [resource, action] = permission.split(':');
      return hasAccess(resource, action);
    });

    if (!hasRequiredPermissions) {
      logPermissionDenied('route', 'access', requiredPermissions.join(','));

      const guidance = getAccessGuidance(requiredPermissions);

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Permission Required</CardTitle>
              <CardDescription>
                You need additional permissions to access this feature.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground text-center space-y-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium text-foreground mb-2">Your Current Access:</p>
                  <p>Role: <span className="font-medium capitalize">{profile.role}</span></p>
                  <p className="text-xs mt-1">{ROLE_DESCRIPTIONS[profile.role as keyof typeof ROLE_DESCRIPTIONS] || 'Standard user access'}</p>
                </div>

                <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-900 dark:text-red-100">Required Permissions:</span>
                  </div>
                  <div className="space-y-1">
                    {requiredPermissions.map((permission, index) => (
                      <p key={index} className="text-red-800 dark:text-red-200 font-mono text-sm bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                        {permission}
                      </p>
                    ))}
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-2">{guidance.reason}</p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">Who Can Access:</span>
                  </div>
                  <p className="text-blue-800 dark:text-blue-200">{guidance.whoCanAccess}</p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-amber-900 dark:text-amber-100">Need Access?</span>
                  </div>
                  <p className="text-amber-800 dark:text-amber-200">Contact: <span className="font-medium">{guidance.contact}</span></p>
                  <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">They can grant you the necessary permissions.</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="w-full"
                >
                  Go Back
                </Button>
                <Button
                  onClick={() => navigate(getDefaultRoute())}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
}