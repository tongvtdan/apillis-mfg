import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth';

export function DashboardDebugger() {
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { user, profile } = useAuth();

    const runDiagnostics = async () => {
        setLoading(true);
        try {
            // Gather debug information
            const diagnostics: any = {
                userInfo: {
                    id: user?.id,
                    email: user?.email,
                },
                profileInfo: profile,
                timestamp: new Date().toISOString(),
            };

            // Check if we can directly query projects
            const { data: projects, error: projectsError } = await supabase
                .from('projects')
                .select('id, project_id, title, organization_id')
                .limit(5);

            diagnostics.directProjectsQuery = {
                success: !projectsError,
                error: projectsError ? projectsError.message : null,
                count: projects?.length || 0,
                projects: projects,
            };

            // Check if we can get the dashboard summary
            const { data: dashboardData, error: dashboardError } = await supabase
                .rpc('get_dashboard_summary');

            diagnostics.dashboardSummary = {
                success: !dashboardError,
                error: dashboardError ? dashboardError.message : null,
                data: dashboardData,
            };

            // Check organizations
            const { data: orgs, error: orgsError } = await supabase
                .from('organizations')
                .select('id, name')
                .limit(5);

            diagnostics.organizations = {
                success: !orgsError,
                error: orgsError ? orgsError.message : null,
                count: orgs?.length || 0,
                orgs: orgs,
            };

            // Check user's organization
            if (profile?.organization_id) {
                const { data: orgData, error: orgError } = await supabase
                    .from('organizations')
                    .select('id, name')
                    .eq('id', profile.organization_id)
                    .single();

                diagnostics.userOrganization = {
                    success: !orgError,
                    error: orgError ? orgError.message : null,
                    data: orgData,
                };
            }

            setDebugInfo(diagnostics);
        } catch (error) {
            console.error('Diagnostic error:', error);
            setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                    Dashboard Debugger
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="text-sm text-yellow-700 dark:text-yellow-500">
                        <p>Troubleshoot dashboard data loading issues</p>
                    </div>
                    <Button
                        onClick={runDiagnostics}
                        disabled={loading}
                        variant="outline"
                        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-800/70"
                    >
                        {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
                    </Button>

                    {debugInfo && (
                        <div className="mt-4 text-xs">
                            <details>
                                <summary className="cursor-pointer text-yellow-800 dark:text-yellow-400 font-medium">
                                    View Diagnostic Results
                                </summary>
                                <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800/50 overflow-auto max-h-96">
                                    <pre className="text-yellow-900 dark:text-yellow-300">
                                        {JSON.stringify(debugInfo, null, 2)}
                                    </pre>
                                </div>
                            </details>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}