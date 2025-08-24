import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { projectService } from '@/services/projectService';
import { Project } from '@/types/project';

export default function ProjectDetailSimple() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dataSource, setDataSource] = useState<'supabase' | 'mock' | 'unknown'>('unknown');

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) {
                setError('No project ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                console.log('🔍 Fetching project:', id);

                // Test connection first
                const connectionTest = await projectService.testConnection();
                setDataSource(connectionTest.source);

                const projectData = await projectService.getProjectById(id);
                setProject(projectData);
                console.log('✅ Project loaded:', projectData.project_id);
            } catch (err) {
                console.error('❌ Error:', err);
                setError(err instanceof Error ? err.message : 'Failed to load project');
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <div>
                        <h2 className="text-lg font-semibold">Loading Project</h2>
                        <p className="text-muted-foreground">Fetching project data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center space-x-4 mb-6">
                        <Button variant="ghost" onClick={() => navigate('/projects')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Projects
                        </Button>
                    </div>

                    <Card className="border-red-200">
                        <CardHeader>
                            <CardTitle className="text-red-600">Project Not Found</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                {error || 'Project could not be loaded'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Requested ID: {id}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" onClick={() => navigate('/projects')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Projects
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {project.project_id} – {project.title}
                            </h1>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline">
                                    {project.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <Badge variant="outline">
                                    {project.priority.toUpperCase()}
                                </Badge>
                                {dataSource === 'mock' && (
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                        📋 Demo Data
                                    </Badge>
                                )}
                                {dataSource === 'supabase' && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                        🔗 Live Data
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Title</h4>
                                <p>{project.title}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                                <p>{project.status.replace('_', ' ')}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Description</h4>
                            <p>{project.description || 'No description provided'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Customer</h4>
                                <p>{project.customer?.company || project.contact_name || 'Unknown'}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Estimated Value</h4>
                                <p>{project.estimated_value ? `$${project.estimated_value.toLocaleString()}` : 'Not specified'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Contact</h4>
                                <p>{project.contact_name || 'Not specified'}</p>
                                {project.contact_email && (
                                    <p className="text-sm text-muted-foreground">{project.contact_email}</p>
                                )}
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Due Date</h4>
                                <p>{project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not specified'}</p>
                            </div>
                        </div>

                        {project.notes && (
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Notes</h4>
                                <p>{project.notes}</p>
                            </div>
                        )}

                        {project.tags && project.tags.length > 0 && (
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground">Tags</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {project.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Debug Info */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-sm">Debug Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs space-y-1 text-muted-foreground">
                            <p><strong>Project ID:</strong> {project.id}</p>
                            <p><strong>Data Source:</strong> {dataSource}</p>
                            <p><strong>Created:</strong> {new Date(project.created_at).toLocaleString()}</p>
                            <p><strong>Updated:</strong> {new Date(project.updated_at).toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}