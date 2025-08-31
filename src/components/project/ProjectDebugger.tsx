import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ProjectDebugger() {
    const { user, profile } = useAuth();
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runDiagnostics = async () => {
        setLoading(true);
        setError(null);
        try {
            const diagnostics: any = {
                user: user ? { id: user.id, email: user.email } : null,
                profile: profile,
            };

            // Check user organization
            if (user?.id) {
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('id, organization_id, role')
                    .eq('id', user.id)
                    .single();

                diagnostics.userProfile = { data: userData, error: userError };

                // Check organization
                if (userData?.organization_id) {
                    const { data: orgData, error: orgError } = await supabase
                        .from('organizations')
                        .select('id, name, slug')
                        .eq('id', userData.organization_id)
                        .single();

                    diagnostics.organization = { data: orgData, error: orgError };
                }
            }

            // Try direct project query
            const { data: directProjects, error: directError } = await supabase
                .from('projects')
                .select('id, project_id, title, organization_id, status')
                .limit(5);

            diagnostics.directProjects = { data: directProjects, error: directError };

            // Try dashboard function
            const { data: dashboardData, error: dashboardError } = await supabase
                .rpc('get_dashboard_summary');

            diagnostics.dashboardFunction = { data: dashboardData, error: dashboardError };

            // Check RLS policies
            const { data: policies, error: policiesError } = await supabase
                .from('pg_policies')
                .select('*')
                .eq('tablename', 'projects');

            diagnostics.policies = { data: policies, error: policiesError };

            setDebugInfo(diagnostics);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            runDiagnostics();
        }
    }, [user, profile]);

    if (!user) {
        return (
            <Alert>
                <AlertDescription>
                    Please log in to run diagnostics
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Loading Diagnostics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Button onClick={runDiagnostics} disabled={loading}>
                        {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
                    </Button>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {debugInfo && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium">User Info</h3>
                                <pre className="text-xs bg-muted p-2 rounded">
                                    {JSON.stringify(debugInfo.user, null, 2)}
                                </pre>
                            </div>

                            <div>
                                <h3 className="font-medium">Profile Info</h3>
                                <pre className="text-xs bg-muted p-2 rounded">
                                    {JSON.stringify(debugInfo.profile, null, 2)}
                                </pre>
                            </div>

                            <div>
                                <h3 className="font-medium">User Profile DB Record</h3>
                                <pre className="text-xs bg-muted p-2 rounded">
                                    {JSON.stringify(debugInfo.userProfile, null, 2)}
                                </pre>
                            </div>

                            <div>
                                <h3 className="font-medium">Organization</h3>
                                <pre className="text-xs bg-muted p-2 rounded">
                                    {JSON.stringify(debugInfo.organization, null, 2)}
                                </pre>
                            </div>

                            <div>
                                <h3 className="font-medium">Direct Projects Query</h3>
                                <pre className="text-xs bg-muted p-2 rounded">
                                    {JSON.stringify(debugInfo.directProjects, null, 2)}
                                </pre>
                            </div>

                            <div>
                                <h3 className="font-medium">Dashboard Function</h3>
                                <pre className="text-xs bg-muted p-2 rounded">
                                    {JSON.stringify(debugInfo.dashboardFunction, null, 2)}
                                </pre>
                            </div>

                            <div>
                                <h3 className="font-medium">RLS Policies</h3>
                                <pre className="text-xs bg-muted p-2 rounded">
                                    {JSON.stringify(debugInfo.policies?.data?.map((p: any) => ({
                                        name: p.name,
                                        tablename: p.tablename,
                                        roles: p.roles,
                                        qual: p.qual
                                    })), null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

