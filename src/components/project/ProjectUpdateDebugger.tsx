import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/project';
import { useProjects } from '@/hooks/useProjects';

interface ProjectUpdateDebuggerProps {
    projectId: string;
}

export function ProjectUpdateDebugger({ projectId }: ProjectUpdateDebuggerProps) {
    const { projects, ensureProjectSubscription } = useProjects();
    const [updateLog, setUpdateLog] = useState<Array<{
        timestamp: string;
        message: string;
        data?: any;
    }>>([]);

    const project = projects.find(p => p.id === projectId);

    // Log project updates
    useEffect(() => {
        if (project) {
            setUpdateLog(prev => [...prev, {
                timestamp: new Date().toLocaleTimeString(),
                message: 'Project data updated',
                data: {
                    id: project.id,
                    current_stage_id: project.current_stage_id,
                    status: project.status,
                    updated_at: project.updated_at
                }
            }]);
        }
    }, [project?.current_stage_id, project?.status, project?.updated_at]);

    // Ensure subscription is set up
    useEffect(() => {
        if (projectId) {
            ensureProjectSubscription(projectId);
            setUpdateLog(prev => [...prev, {
                timestamp: new Date().toLocaleTimeString(),
                message: 'Real-time subscription ensured',
                data: { projectId }
            }]);
        }
    }, [projectId, ensureProjectSubscription]);

    const clearLog = () => {
        setUpdateLog([]);
    };

    if (!project) {
        return (
            <Card className="w-full mb-4 border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                    <p className="text-yellow-800">Project not found in projects array</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full mb-4 border-blue-200 bg-blue-50">
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-blue-800">
                    Real-time Update Debugger
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <strong>Project ID:</strong> {project.id}
                    </div>
                    <div>
                        <strong>Current Stage:</strong> {project.current_stage_id || 'None'}
                    </div>
                    <div>
                        <strong>Status:</strong> {project.status}
                    </div>
                    <div>
                        <strong>Last Updated:</strong> {project.updated_at ? new Date(project.updated_at).toLocaleTimeString() : 'Unknown'}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <strong className="text-sm text-blue-800">Update Log ({updateLog.length})</strong>
                        <Button size="sm" variant="outline" onClick={clearLog}>
                            Clear
                        </Button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                        {updateLog.slice(-10).map((log, index) => (
                            <div key={index} className="text-xs p-2 bg-white rounded border">
                                <div className="font-medium text-blue-600">{log.timestamp}</div>
                                <div>{log.message}</div>
                                {log.data && (
                                    <pre className="text-xs mt-1 text-gray-600">
                                        {JSON.stringify(log.data, null, 2)}
                                    </pre>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                        Projects in array: {projects.length}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        Real-time active
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
