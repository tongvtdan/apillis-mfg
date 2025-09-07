import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft,
    Settings,
    Users,
    FileText,
    MessageSquare,
    Calendar,
    TrendingUp,
    Activity,
    RefreshCw,
    AlertTriangle
} from "lucide-react";

import { ProjectProvider, useProject } from '@/contexts/ProjectContext';
import { ProjectLifecycleDashboard } from '@/components/project/ProjectLifecycleDashboard';
import { ProjectWorkflowOrchestrator } from '@/components/project/ProjectWorkflowOrchestrator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

function ProjectDashboardContent() {
    const { projectId } = useParams<{ projectId?: string }>();
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const { toast } = useToast();

    const {
        currentProject,
        selectProject,
        loading,
        error,
        refresh,
        clearError
    } = useProject();

    const [activeTab, setActiveTab] = useState('overview');

    // Select project when component mounts or projectId changes
    useEffect(() => {
        if (projectId) {
            selectProject(projectId);
        } else {
            selectProject(null);
        }
    }, [projectId, selectProject]);

    // Handle refresh
    const handleRefresh = async () => {
        try {
            await refresh();
            toast({
                title: "Refreshed",
                description: "Project data has been updated"
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Refresh Failed",
                description: "Failed to refresh project data"
            });
        }
    };

    // Handle back navigation
    const handleBack = () => {
        navigate('/projects');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="m-6">
                <CardContent className="p-6">
                    <div className="text-center text-destructive">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                        <p className="mb-4">{error}</p>
                        <div className="flex gap-2 justify-center">
                            <Button onClick={clearError} variant="outline">
                                Dismiss
                            </Button>
                            <Button onClick={handleRefresh}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!currentProject && projectId) {
        return (
            <Card className="m-6">
                <CardContent className="p-6">
                    <div className="text-center">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">Project not found</p>
                        <Button onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Projects
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button onClick={handleBack} variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {currentProject?.title || 'Project Dashboard'}
                        </h1>
                        {currentProject && (
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{currentProject.project_id}</Badge>
                                <Badge
                                    variant={
                                        currentProject.status === 'active' ? 'default' :
                                            currentProject.status === 'completed' ? 'secondary' :
                                                'destructive'
                                    }
                                >
                                    {currentProject.status}
                                </Badge>
                                {currentProject.current_stage && (
                                    <Badge variant="outline">{currentProject.current_stage.name}</Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleRefresh} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Project Summary Cards */}
            {currentProject && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium">Created</p>
                                    <p className="text-lg font-bold">
                                        {new Date(currentProject.created_at || '').toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium">Value</p>
                                    <p className="text-lg font-bold">
                                        ${currentProject.estimated_value?.toLocaleString() || '0'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-purple-500" />
                                <div>
                                    <p className="text-sm font-medium">Contacts</p>
                                    <p className="text-lg font-bold">
                                        {currentProject.point_of_contacts?.length || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-orange-500" />
                                <div>
                                    <p className="text-sm font-medium">Days in Stage</p>
                                    <p className="text-lg font-bold">
                                        {currentProject.days_in_stage || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="workflow">Workflow</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="communication">Communication</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {currentProject ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Project Details */}
                            <div className="lg:col-span-2 space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Project Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Title</label>
                                                <p className="text-sm">{currentProject.title}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Project ID</label>
                                                <p className="text-sm">{currentProject.project_id}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                                <Badge variant="outline" className="mt-1">{currentProject.status}</Badge>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                                                <Badge variant="outline" className="mt-1">{currentProject.priority_level}</Badge>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Customer</label>
                                                <p className="text-sm">{currentProject.customer_organization?.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                                                <p className="text-sm">
                                                    {currentProject.estimated_delivery_date
                                                        ? new Date(currentProject.estimated_delivery_date).toLocaleDateString()
                                                        : 'Not set'
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {currentProject.description && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Description</label>
                                                <p className="text-sm mt-1">{currentProject.description}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Current Stage Info */}
                                {currentProject.current_stage && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Current Stage</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium">{currentProject.current_stage.name}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {currentProject.current_stage.description}
                                                    </p>
                                                </div>
                                                <Badge variant="outline">
                                                    Stage {currentProject.current_stage.stage_order}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button className="w-full" variant="outline">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Edit Project
                                        </Button>
                                        <Button className="w-full" variant="outline">
                                            <Users className="h-4 w-4 mr-2" />
                                            Manage Contacts
                                        </Button>
                                        <Button className="w-full" variant="outline">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Upload Document
                                        </Button>
                                        <Button className="w-full" variant="outline">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Send Message
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Recent Activity */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Activity feed coming soon...
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
                                <p className="text-muted-foreground">
                                    Select a project to view its details and manage its workflow
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="workflow" className="space-y-4">
                    {currentProject ? (
                        <ProjectWorkflowOrchestrator
                            projectId={currentProject.id}
                            onProjectUpdate={(updatedProject) => {
                                // Handle project update
                                console.log('Project updated:', updatedProject);
                            }}
                        />
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">Workflow Management</h3>
                                <p className="text-muted-foreground">
                                    Select a project to manage its workflow stages and progress
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-medium mb-4">Document Management</h3>
                            <p className="text-muted-foreground">
                                Document management features coming soon...
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="communication" className="space-y-4">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-medium mb-4">Communication Hub</h3>
                            <p className="text-muted-foreground">
                                Communication features coming soon...
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-medium mb-4">Project Analytics</h3>
                            <p className="text-muted-foreground">
                                Analytics and reporting features coming soon...
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export function ProjectDashboard() {
    return (
        <ProjectProvider>
            <ProjectDashboardContent />
        </ProjectProvider>
    );
}
