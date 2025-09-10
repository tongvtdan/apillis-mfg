import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Calendar,
    Users,
    FileText,
    MessageSquare,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertTriangle,
    Plus,
    Filter,
    Search,
    RefreshCw
} from "lucide-react";

import { Project, WorkflowStage } from '@/types/project';
import { projectWorkflowService } from '@/services/projectWorkflowService';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/core/auth';
import { useToast } from '@/hooks/use-toast';
import { ProjectWorkflowOrchestrator } from './ProjectWorkflowOrchestrator';
import { ProjectCreationModal } from './ProjectCreationModal';

interface ProjectLifecycleDashboardProps {
    organizationId?: string;
    className?: string;
}

export function ProjectLifecycleDashboard({
    organizationId,
    className = ""
}: ProjectLifecycleDashboardProps) {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState('projects');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [stageFilter, setStageFilter] = useState<string>('all');

    const { projects, loading, error, refetch } = useProjects();
    const { user } = useAuth();
    const { toast } = useToast();

    // Filter projects based on search and filters
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.project_id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        const matchesStage = stageFilter === 'all' || project.current_stage_id === stageFilter;

        return matchesSearch && matchesStatus && matchesStage;
    });

    // Calculate dashboard metrics
    const metrics = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        overdueProjects: projects.filter(p => {
            if (!p.estimated_delivery_date || p.status === 'completed') return false;
            return new Date(p.estimated_delivery_date) < new Date();
        }).length,
        totalValue: projects.reduce((sum, p) => sum + (p.estimated_value || 0), 0)
    };

    const handleProjectCreated = useCallback((newProject: Project) => {
        toast({
            title: "Project Created",
            description: `Project ${newProject.project_id} has been created successfully.`
        });
        refetch();
        setShowCreateModal(false);
    }, [toast, refetch]);

    const handleProjectUpdate = useCallback((updatedProject: Project) => {
        toast({
            title: "Project Updated",
            description: `Project ${updatedProject.project_id} has been updated.`
        });
        refetch();
    }, [toast, refetch]);

    const handleRefresh = useCallback(() => {
        refetch();
        toast({
            title: "Refreshed",
            description: "Project data has been refreshed."
        });
    }, [refetch, toast]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="p-6">
                    <div className="text-center text-destructive">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                        <p>Error loading projects: {error}</p>
                        <Button onClick={handleRefresh} className="mt-4">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Project Lifecycle Management</h1>
                    <p className="text-muted-foreground">
                        Manage project workflows, track progress, and ensure timely completion
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleRefresh} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                    </Button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <div>
                                <p className="text-sm font-medium">Total Projects</p>
                                <p className="text-2xl font-bold">{metrics.totalProjects}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-500" />
                            <div>
                                <p className="text-sm font-medium">Active</p>
                                <p className="text-2xl font-bold">{metrics.activeProjects}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-purple-500" />
                            <div>
                                <p className="text-sm font-medium">Completed</p>
                                <p className="text-2xl font-bold">{metrics.completedProjects}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <div>
                                <p className="text-sm font-medium">Overdue</p>
                                <p className="text-2xl font-bold">{metrics.overdueProjects}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                            <div>
                                <p className="text-sm font-medium">Total Value</p>
                                <p className="text-2xl font-bold">${metrics.totalValue.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="workflow">Workflow</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="projects" className="space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search projects..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border rounded-md"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border rounded-md"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="on_hold">On Hold</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <select
                                    value={stageFilter}
                                    onChange={(e) => setStageFilter(e.target.value)}
                                    className="px-3 py-2 border rounded-md"
                                >
                                    <option value="all">All Stages</option>
                                    {/* Stage options would be populated from workflow stages */}
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Projects List */}
                    <div className="grid gap-4">
                        {filteredProjects.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No projects found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {searchTerm || statusFilter !== 'all' || stageFilter !== 'all'
                                            ? 'Try adjusting your filters'
                                            : 'Create your first project to get started'
                                        }
                                    </p>
                                    <Button onClick={() => setShowCreateModal(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Project
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredProjects.map((project) => (
                                <Card
                                    key={project.id}
                                    className={`cursor-pointer transition-colors ${selectedProject?.id === project.id ? 'ring-2 ring-primary' : ''
                                        }`}
                                    onClick={() => setSelectedProject(project)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-medium">{project.title}</h3>
                                                    <Badge variant="outline">{project.project_id}</Badge>
                                                    <Badge
                                                        variant={
                                                            project.status === 'active' ? 'default' :
                                                                project.status === 'completed' ? 'secondary' :
                                                                    'destructive'
                                                        }
                                                    >
                                                        {project.status}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        <span>{project.customer_organization?.name || 'No customer'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            {project.estimated_delivery_date
                                                                ? new Date(project.estimated_delivery_date).toLocaleDateString()
                                                                : 'No due date'
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="h-4 w-4" />
                                                        <span>${project.estimated_value?.toLocaleString() || '0'}</span>
                                                    </div>
                                                </div>

                                                {project.current_stage && (
                                                    <div className="mt-2">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <span>Current Stage:</span>
                                                            <Badge variant="outline">{project.current_stage.name}</Badge>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-right">
                                                <div className="text-sm text-muted-foreground">
                                                    Created {new Date(project.created_at || '').toLocaleDateString()}
                                                </div>
                                                {project.days_in_stage !== undefined && (
                                                    <div className="text-sm mt-1">
                                                        {project.days_in_stage} days in stage
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="workflow" className="space-y-4">
                    {selectedProject ? (
                        <ProjectWorkflowOrchestrator
                            projectId={selectedProject.id}
                            onProjectUpdate={handleProjectUpdate}
                        />
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">Select a Project</h3>
                                <p className="text-muted-foreground">
                                    Choose a project from the list to view and manage its workflow
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-medium mb-4">Project Analytics</h3>
                            <p className="text-muted-foreground">
                                Advanced analytics and reporting features coming soon...
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Project Modal */}
            <ProjectCreationModal
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
                onProjectCreated={handleProjectCreated}
            />
        </div>
    );
}
