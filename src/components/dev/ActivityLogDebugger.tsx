import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { ProjectPriority } from '@/types/project';

export const ActivityLogDebugger = () => {
    const { profile, user } = useAuth();
    const { toast } = useToast();
    const [debugInfo, setDebugInfo] = useState<any>({});
    const [testResult, setTestResult] = useState<string>('');
    const [manualLog, setManualLog] = useState({
        action: 'debug_test',
        entity_type: 'debug',
        entity_id: '',
        description: 'Manual debug test entry'
    });

    // Fetch debug information
    useEffect(() => {
        const fetchDebugInfo = async () => {
            try {
                // Get current user info
                const currentUser = supabase.auth.getUser();
                console.log('Current user:', currentUser);

                // Get organization info
                const orgQuery = await supabase
                    .from('users')
                    .select('organization_id')
                    .eq('id', user?.id)
                    .single();

                console.log('Organization query result:', orgQuery);

                // Get current user org ID from function
                const orgIdFunction = await supabase.rpc('get_current_user_org_id');
                console.log('get_current_user_org_id result:', orgIdFunction);

                // Check if RLS is enabled on activity_log
                const rlsCheck = await supabase
                    .from('activity_log')
                    .select('count()', { count: 'exact' })
                    .eq('organization_id', profile?.organization_id);

                console.log('RLS check result:', rlsCheck);

                setDebugInfo({
                    user_id: user?.id,
                    user_email: user?.email,
                    profile_org_id: profile?.organization_id,
                    org_query_result: orgQuery.data,
                    org_function_result: orgIdFunction.data,
                    rls_check: rlsCheck.count
                });
            } catch (error) {
                console.error('Debug info fetch error:', error);
            }
        };

        if (user && profile) {
            fetchDebugInfo();
        }
    }, [user, profile]);

    // Test manual activity log insertion
    const testManualInsert = async () => {
        try {
            setTestResult('Testing manual insert...');

            const logData = {
                action: manualLog.action,
                entity_type: manualLog.entity_type,
                entity_id: manualLog.entity_id || 'debug-' + Date.now(),
                description: manualLog.description,
                organization_id: profile?.organization_id,
                user_id: user?.id,
                old_values: null,
                new_values: { test: true, timestamp: new Date().toISOString() }
            };

            console.log('Inserting test log:', logData);

            const { data, error } = await supabase
                .from('activity_log')
                .insert(logData)
                .select();

            if (error) {
                console.error('Manual insert error:', error);
                setTestResult(`Error: ${error.message}`);
                toast({
                    title: "Insert Failed",
                    description: error.message,
                    variant: "destructive"
                });
            } else {
                console.log('Manual insert success:', data);
                setTestResult(`Success: ${JSON.stringify(data)}`);
                toast({
                    title: "Insert Successful",
                    description: "Manual activity log entry created"
                });
            }
        } catch (error) {
            console.error('Manual insert exception:', error);
            setTestResult(`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
            toast({
                title: "Insert Failed",
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: "destructive"
            });
        }
    };

    // Test trigger by creating a project
    const testTrigger = async () => {
        try {
            setTestResult('Testing trigger...');

            const testData = {
                organization_id: profile?.organization_id,
                project_id: 'DEBUG-' + Date.now(),
                title: 'Debug Test Project',
                description: 'Test project for activity log debugging',
                status: 'active' as const,
                priority_level: 'medium' as ProjectPriority
            };

            console.log('Creating test project:', testData);

            const { data, error } = await supabase
                .from('projects')
                .insert(testData)
                .select();

            if (error) {
                console.error('Trigger test error:', error);
                setTestResult(`Error: ${error.message}`);
                toast({
                    title: "Trigger Test Failed",
                    description: error.message,
                    variant: "destructive"
                });
            } else {
                console.log('Trigger test success:', data);
                setTestResult(`Success: Created project ${data[0]?.project_id}`);
                toast({
                    title: "Trigger Test Successful",
                    description: `Created project ${data[0]?.project_id}`
                });
            }
        } catch (error) {
            console.error('Trigger test exception:', error);
            setTestResult(`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
            toast({
                title: "Trigger Test Failed",
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: "destructive"
            });
        }
    };

    // Fetch recent activity logs
    const fetchRecentLogs = async () => {
        try {
            setTestResult('Fetching recent logs...');

            const { data, error } = await supabase
                .from('activity_log')
                .select('*')
                .eq('organization_id', profile?.organization_id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Fetch logs error:', error);
                setTestResult(`Error: ${error.message}`);
            } else {
                console.log('Recent logs:', data);
                setTestResult(`Found ${data.length} recent logs`);
            }
        } catch (error) {
            console.error('Fetch logs exception:', error);
            setTestResult(`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <Card className="m-4">
            <CardHeader>
                <CardTitle>Activity Log Debugger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-medium mb-2">User Info</h3>
                        <pre className="text-xs bg-muted p-2 rounded">
                            {JSON.stringify({
                                user_id: debugInfo.user_id,
                                user_email: debugInfo.user_email,
                                profile_org_id: debugInfo.profile_org_id
                            }, null, 2)}
                        </pre>
                    </div>
                    <div>
                        <h3 className="font-medium mb-2">Organization Info</h3>
                        <pre className="text-xs bg-muted p-2 rounded">
                            {JSON.stringify({
                                org_query_result: debugInfo.org_query_result,
                                org_function_result: debugInfo.org_function_result,
                                rls_check: debugInfo.rls_check
                            }, null, 2)}
                        </pre>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Manual Log Entry</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-sm font-medium">Action</label>
                            <input
                                type="text"
                                value={manualLog.action}
                                onChange={(e) => setManualLog({ ...manualLog, action: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Entity Type</label>
                            <input
                                type="text"
                                value={manualLog.entity_type}
                                onChange={(e) => setManualLog({ ...manualLog, entity_type: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Entity ID</label>
                            <input
                                type="text"
                                value={manualLog.entity_id}
                                onChange={(e) => setManualLog({ ...manualLog, entity_id: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <input
                                type="text"
                                value={manualLog.description}
                                onChange={(e) => setManualLog({ ...manualLog, description: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button onClick={testManualInsert}>Test Manual Insert</Button>
                    <Button onClick={testTrigger} variant="secondary">Test Trigger (Create Project)</Button>
                    <Button onClick={fetchRecentLogs} variant="outline">Fetch Recent Logs</Button>
                </div>

                <div>
                    <h3 className="font-medium mb-2">Test Result</h3>
                    <Textarea
                        value={testResult}
                        readOnly
                        className="min-h-[100px]"
                    />
                </div>
            </CardContent>
        </Card>
    );
};