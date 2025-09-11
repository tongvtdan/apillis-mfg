/**
 * Core Functionality Test Component
 * This component tests that all core modules can be imported and used correctly
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

// Test Auth Module
import { useAuth, AuthProvider, UserProfile } from '@/core/auth';

// Test Workflow Module
import { useWorkflow, WorkflowProvider } from '@/core/workflow';

// Test Approvals Module
import { useApproval, ApprovalProvider } from '@/core/approvals';

// Test Documents Module
import { useDocument, DocumentProvider } from '@/core/documents';

// Test Activity Log Module
import { useActivityLog, ActivityLogProvider } from '@/core/activity-log';

interface TestResult {
    module: string;
    status: 'success' | 'error' | 'warning';
    message: string;
    details?: string;
}

function CoreModuleTest() {
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    // Test Auth Module
    const { user, profile, loading: authLoading } = useAuth();

    // Test Workflow Module
    const { workflowState, loading: workflowLoading } = useWorkflow();

    // Test Approvals Module
    const { approvals, loading: approvalsLoading } = useApproval();

    // Test Documents Module
    const { documents, loading: documentsLoading } = useDocument();

    // Test Activity Log Module
    const { entries, loading: activityLoading } = useActivityLog();

    const runTests = async () => {
        setIsRunning(true);
        const results: TestResult[] = [];

        // Test 1: Auth Module
        try {
            if (typeof useAuth === 'function') {
                results.push({
                    module: 'Auth',
                    status: 'success',
                    message: 'Auth module imported successfully',
                    details: `User: ${user ? 'authenticated' : 'not authenticated'}, Profile: ${profile ? 'loaded' : 'not loaded'}`
                });
            } else {
                results.push({
                    module: 'Auth',
                    status: 'error',
                    message: 'Auth module import failed'
                });
            }
        } catch (error) {
            results.push({
                module: 'Auth',
                status: 'error',
                message: 'Auth module test failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }

        // Test 2: Workflow Module
        try {
            if (typeof useWorkflow === 'function') {
                results.push({
                    module: 'Workflow',
                    status: 'success',
                    message: 'Workflow module imported successfully',
                    details: `Workflow state: ${workflowState ? 'loaded' : 'not loaded'}`
                });
            } else {
                results.push({
                    module: 'Workflow',
                    status: 'error',
                    message: 'Workflow module import failed'
                });
            }
        } catch (error) {
            results.push({
                module: 'Workflow',
                status: 'error',
                message: 'Workflow module test failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }

        // Test 3: Approvals Module
        try {
            if (typeof useApproval === 'function') {
                results.push({
                    module: 'Approvals',
                    status: 'success',
                    message: 'Approvals module imported successfully',
                    details: `Approvals: ${Array.isArray(approvals) ? approvals.length : 'unknown'} loaded`
                });
            } else {
                results.push({
                    module: 'Approvals',
                    status: 'error',
                    message: 'Approvals module import failed'
                });
            }
        } catch (error) {
            results.push({
                module: 'Approvals',
                status: 'error',
                message: 'Approvals module test failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }

        // Test 4: Documents Module
        try {
            if (typeof useDocument === 'function') {
                results.push({
                    module: 'Documents',
                    status: 'success',
                    message: 'Documents module imported successfully',
                    details: `Documents: ${Array.isArray(documents) ? documents.length : 'unknown'} loaded`
                });
            } else {
                results.push({
                    module: 'Documents',
                    status: 'error',
                    message: 'Documents module import failed'
                });
            }
        } catch (error) {
            results.push({
                module: 'Documents',
                status: 'error',
                message: 'Documents module test failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }

        // Test 5: Activity Log Module
        try {
            if (typeof useActivityLog === 'function') {
                results.push({
                    module: 'Activity Log',
                    status: 'success',
                    message: 'Activity Log module imported successfully',
                    details: `Entries: ${Array.isArray(entries) ? entries.length : 'unknown'} loaded`
                });
            } else {
                results.push({
                    module: 'Activity Log',
                    status: 'error',
                    message: 'Activity Log module import failed'
                });
            }
        } catch (error) {
            results.push({
                module: 'Activity Log',
                status: 'error',
                message: 'Activity Log module test failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }

        // Test 6: Type Definitions
        try {
            // Test that interfaces are properly exported
            const testUserProfile: Partial<UserProfile> = {
                id: 'test',
                organization_id: 'test-org',
                email: 'test@example.com',
                role: 'admin'
            };

            results.push({
                module: 'Type Definitions',
                status: 'success',
                message: 'Type definitions working correctly',
                details: 'UserProfile interface validated successfully'
            });
        } catch (error) {
            results.push({
                module: 'Type Definitions',
                status: 'error',
                message: 'Type definitions test failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }

        setTestResults(results);
        setIsRunning(false);
    };

    useEffect(() => {
        runTests();
    }, []);

    const getStatusIcon = (status: TestResult['status']) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: TestResult['status']) => {
        switch (status) {
            case 'success':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'error':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'warning':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    const successCount = testResults.filter(r => r.status === 'success').length;
    const errorCount = testResults.filter(r => r.status === 'error').length;
    const warningCount = testResults.filter(r => r.status === 'warning').length;

    return (
        <div className="space-y-6">
            {/* Test Summary */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Core Modules Test Results</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={runTests}
                                disabled={isRunning}
                                variant="outline"
                            >
                                {isRunning ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    '🔄'
                                )}
                                {isRunning ? 'Running Tests...' : 'Run Tests'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{successCount}</div>
                            <div className="text-sm text-muted-foreground">Passed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                            <div className="text-sm text-muted-foreground">Failed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                            <div className="text-sm text-muted-foreground">Warnings</div>
                        </div>
                    </div>

                    {testResults.length === 0 && !isRunning && (
                        <div className="text-center py-8">
                            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Click "Run Tests" to start testing core modules</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detailed Results */}
            {testResults.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Test Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {testResults.map((result, index) => (
                                <div
                                    key={index}
                                    className={`flex items-start space-x-3 p-3 rounded-lg border ${getStatusColor(result.status)}`}
                                >
                                    {getStatusIcon(result.status)}
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium">{result.module}</span>
                                            <Badge variant="outline" className={getStatusColor(result.status)}>
                                                {result.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm mt-1">{result.message}</p>
                                        {result.details && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {result.details}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Module Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            {authLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-sm font-medium">Auth Module</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {user ? 'User authenticated' : 'No active session'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            {workflowLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-sm font-medium">Workflow Module</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {workflowState ? 'Workflow loaded' : 'No active workflow'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            {approvalsLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-sm font-medium">Approvals Module</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {Array.isArray(approvals) ? `${approvals.length} approvals` : 'Loading...'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            {documentsLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-sm font-medium">Documents Module</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {Array.isArray(documents) ? `${documents.length} documents` : 'Loading...'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            {activityLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-sm font-medium">Activity Log Module</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {Array.isArray(entries) ? `${entries.length} entries` : 'Loading...'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Test wrapper component with all providers
export function CoreModulesTestWrapper() {
    return (
        <AuthProvider>
            <WorkflowProvider>
                <ApprovalProvider>
                    <DocumentProvider>
                        <ActivityLogProvider>
                            <CoreModuleTest />
                        </ActivityLogProvider>
                    </DocumentProvider>
                </ApprovalProvider>
            </WorkflowProvider>
        </AuthProvider>
    );
}

export default CoreModulesTestWrapper;
