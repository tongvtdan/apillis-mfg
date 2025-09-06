import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    RefreshCw,
    Settings
} from "lucide-react";
import type { Project, WorkflowStage } from "@/types/project";
import { projectService } from "@/services/projectService";
import { useWorkflowStages } from "@/hooks/useWorkflowStages";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Import our new components
import { ProjectDetailHeader } from "./ProjectDetailHeader";
import { ProjectDetailLayout } from "./ProjectDetailLayout";
import { InlineProjectEditor } from "./InlineProjectEditor";
import { ProjectStatusManager } from "./ProjectStatusManager";

// Import existing components for tab content
import { DocumentManager } from "./documents";
import ProjectCommunication from "./ProjectCommunication";
import { ReviewList } from "./workflow";

export function EnhancedProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { toast } = useToast();

    // State management
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Hooks for data
    const { data: workflowStages = [], isLoading: stagesLoading } = useWorkflowStages();
    const { projects } = useProjects();

    // Load project data
    useEffect(() => {
        const fetchProject = async () => {
            if (!id) {
                setError("No project ID provided");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const projectData = await projectService.getProjectById(id);
                setProject(projectData);
            } catch (err) {
                console.error('Failed to load project:', err);
                setError(err instanceof Error ? err.message : 'Failed to load project');
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    // Update project when projects list changes (real-time updates)
    useEffect(() => {
        if (id && projects.length > 0) {
            const updatedProject = projects.find(p => p.id === id);
            if (updatedProject && project) {
                // Only update if the project has actually changed
                if (project.status !== updatedProject.status ||
                    project.updated_at !== updatedProject.updated_at) {
                    setProject(updatedProject);
                }
            }
        }
    }, [projects, id, project]);

    // Handle project updates
    const handleProjectUpdate = (updatedProject: Project) => {
        setProject(updatedProject);
        toast({
            title: "Project Updated",
            description: "Project information has been updated successfully.",
        });
    };

    // Handle navigation
    const handleBack = () => {
        navigate('/projects');
    };

    const handleEdit = () => {
        // Could open a full edit modal or navigate to edit page
        console.log('Edit project:', project?.id);
    };

    const handleShare = () => {
        // Could open share dialog or copy link
        console.log('Share project:', project?.id);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <div>
                        <h2 className="text-lg font-semibold">Loading Project Details</h2>
                        <p className="text-muted-foreground">Fetching project data...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !project) {
        return (
            <div className="min-h-screen bg-background">
                <div className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <Button variant="ghost" onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Projects
                        </Button>
                        <Separator orientation="vertical" className="h-6" />
                        <div>
                            <h1 className="text-2xl font-bold text-red-600">Project Not Found</h1>
                            <p className="text-muted-foreground">Project ID: {id}</p>
                        </div>
                    </div>

                    <Card className="border-red-200">
                        <CardHeader>
                            <CardTitle className="flex items-center text-red-600">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                Error Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">{error}</p>
                            <div className="space-y-3">
                                <Button onClick={handleBack} className="w-full">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Go Back to Projects List
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.reload()}
                                    className="w-full"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Retry Loading
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Enhanced Header */}
            <ProjectDetailHeader
                project={project}
                workflowStages={workflowStages}
                onBack={handleBack}
                onEdit={handleEdit}
                onShare={handleShare}
            />

            {/* Main Content with Tabbed Layout */}
            <div className="p-6">
                <ProjectDetailLayout
                    project={project}
                    workflowStages={workflowStages}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                >
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Project Information Editor */}
                            <InlineProjectEditor
                                project={project}
                                onUpdate={handleProjectUpdate}
                            />

                            {/* Status Manager */}
                            <ProjectStatusManager
                                project={project}
                                workflowStages={workflowStages}
                                onUpdate={handleProjectUpdate}
                            />
                        </div>

                        {/* Quick Actions Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setActiveTab('documents')}
                                        className="justify-start"
                                    >
                                        📄 Manage Documents
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setActiveTab('communication')}
                                        className="justify-start"
                                    >
                                        💬 View Messages
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setActiveTab('reviews')}
                                        className="justify-start"
                                    >
                                        👥 Check Reviews
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents">
                        <DocumentManager projectId={project.id} currentStageId={project.current_stage_id} />
                    </TabsContent>

                    {/* Communication Tab */}
                    <TabsContent value="communication">
                        <ProjectCommunication projectId={project.id} />
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews">
                        <ReviewList projectId={project.id} />
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Analytics dashboard coming soon...
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="w-5 h-5" />
                                    <span>Project Settings</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Project settings and configuration options coming soon...
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </ProjectDetailLayout>
            </div>
        </div>
    );
}