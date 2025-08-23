import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    TestTube,
    CheckCircle,
    XCircle,
    Loader2,
    ArrowRight
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useNavigate } from 'react-router-dom';

export function ProjectLoadTest() {
    const [testId, setTestId] = useState('11111111-1111-1111-1111-111111111001');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; project?: any } | null>(null);
    const { getProjectById } = useProjects();
    const navigate = useNavigate();

    const testProjectLoad = async () => {
        setLoading(true);
        setResult(null);

        try {
            console.log('🧪 Testing project load with ID:', testId);
            const project = await getProjectById(testId);

            setResult({
                success: true,
                message: `Successfully loaded project: ${project.title}`,
                project
            });
        } catch (error) {
            console.error('❌ Test failed:', error);
            setResult({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        } finally {
            setLoading(false);
        }
    };

    const navigateToProject = () => {
        if (result?.success && testId) {
            navigate(`/project/${testId}`);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <TestTube className="w-5 h-5 mr-2" />
                    Project Load Test
                </CardTitle>
                <CardDescription>
                    Test loading a specific project by ID
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="testId">Project ID to Test</Label>
                        <Input
                            id="testId"
                            value={testId}
                            onChange={(e) => setTestId(e.target.value)}
                            placeholder="Enter project ID..."
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={testProjectLoad}
                            disabled={loading || !testId}
                            className="flex items-center"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <TestTube className="w-4 h-4 mr-2" />
                            )}
                            {loading ? 'Testing...' : 'Test Load'}
                        </Button>

                        {result?.success && (
                            <Button
                                onClick={navigateToProject}
                                variant="outline"
                                className="flex items-center"
                            >
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Go to Project
                            </Button>
                        )}
                    </div>

                    {result && (
                        <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                            {result.success ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                                {result.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    {result?.success && result.project && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <div className="text-sm font-medium mb-2">Project Details:</div>
                            <div className="space-y-1 text-sm">
                                <div><strong>ID:</strong> {result.project.id}</div>
                                <div><strong>Project ID:</strong> {result.project.project_id}</div>
                                <div><strong>Title:</strong> {result.project.title}</div>
                                <div><strong>Status:</strong> {result.project.status}</div>
                                <div><strong>Priority:</strong> {result.project.priority}</div>
                                <div><strong>Customer:</strong> {result.project.customer?.name || 'No customer'}</div>
                            </div>
                        </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                        <div className="font-medium mb-1">Sample Project IDs to try:</div>
                        <div className="space-y-1">
                            <div>• 11111111-1111-1111-1111-111111111001 (IoT Sensor System)</div>
                            <div>• 11111111-1111-1111-1111-111111111002 (CNC Machined Parts)</div>
                            <div>• 11111111-1111-1111-1111-111111111003 (Medical Device Assembly)</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}