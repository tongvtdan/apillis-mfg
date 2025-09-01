import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
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

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
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
            <div className="text-sm text-muted-foreground text-center">
              <p>Your role: <span className="font-medium capitalize">{profile.role}</span></p>
              <p>Required access level not met for this resource.</p>
            </div>
            <div className="flex flex-col gap-2">
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

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
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
            <div className="text-sm text-muted-foreground text-center">
              <p>Your role: <span className="font-medium capitalize">{profile.role}</span></p>
              <p>Required roles: <span className="font-medium">{requiredRoles.join(', ')}</span></p>
            </div>
            <div className="flex flex-col gap-2">
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

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
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
              <div className="text-sm text-muted-foreground text-center">
                <p>Your role: <span className="font-medium capitalize">{profile.role}</span></p>
                <p>Contact your administrator to request access.</p>
              </div>
              <div className="flex flex-col gap-2">
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