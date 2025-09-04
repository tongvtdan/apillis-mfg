import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types/project';
import {
    ProjectActions,
    AddProjectAction,
    EditProjectAction
} from '@/components/project/actions';
import { projectActionService } from '@/services/projectActionService';
import { Plus, Edit, Trash2, Archive, Copy, MoreHorizontal } from 'lucide-react';

interface ProjectActionsExampleProps {
    projects: Project[];
    onProjectsChange?: (projects: Project[]) => void;
}

export function ProjectActionsExample({
    projects,
    onProjectsChange
}: ProjectActionsExampleProps) {
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const { toast } = useToast();

    // Handle project creation
    const handleCreateProject = (newProject: Project) => {
        const updatedProjects = [newProject, ...projects];
        onProjectsChange?.(updatedProjects);
        toast({
            title: "Project Added",
            description: `Project "${newProject.title}" has been added to the list.`,
        });
    };

    // Handle project update
    const handleUpdateProject = (updatedProject: Project) => {
        const updatedProjects = projects.map(p =>
            p.id === updatedProject.id ? updatedProject : p
        );
        onProjectsChange?.(updatedProjects);
        toast({
            title: "Project Updated",
            description: `Project "${updatedProject.title}" has been updated.`,
        });
    };

    // Handle bulk actions
    const handleBulkAction = async (action: string, selectedProjects: Project[]) => {
        const projectIds = selectedProjects.map(p => p.id);

        try {
            switch (action) {
                case 'delete':
                    await projectActionService.bulkDeleteProjects(projectIds);
                    const remainingProjects = projects.filter(p => !projectIds.includes(p.id));
                    onProjectsChange?.(remainingProjects);
                    setSelectedProjects([]);
                    break;

                case 'archive':
                    await projectActionService.bulkArchiveProjects(projectIds);
                    const updatedProjects = projects.map(p =>
                        projectIds.includes(p.id) ? { ...p, status: 'completed' } : p
                    );
                    onProjectsChange?.(updatedProjects);
                    setSelectedProjects([]);
                    break;

                default:
                    console.warn('Unknown bulk action:', action);
            }
        } catch (error) {
            console.error('Bulk action failed:', error);
        }
    };

    // Handle individual project actions
    const handleDeleteProject = async (project: Project) => {
        try {
            await projectActionService.deleteProject(project.id);
            const updatedProjects = projects.filter(p => p.id !== project.id);
            onProjectsChange?.(updatedProjects);
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleDuplicateProject = async (project: Project) => {
        try {
            const duplicatedProject = await projectActionService.duplicateProject(project);
            const updatedProjects = [duplicatedProject, ...projects];
            onProjectsChange?.(updatedProjects);
        } catch (error) {
            console.error('Duplicate failed:', error);
        }
    };

    const handleArchiveProject = async (project: Project) => {
        try {
            const archivedProject = await projectActionService.archiveProject(project.id);
            const updatedProjects = projects.map(p =>
                p.id === project.id ? archivedProject : p
            );
            onProjectsChange?.(updatedProjects);
        } catch (error) {
            console.error('Archive failed:', error);
        }
    };

    // Handle project selection
    const handleProjectSelect = (projectId: string, checked: boolean) => {
        if (checked) {
            setSelectedProjects(prev => [...prev, projectId]);
        } else {
            setSelectedProjects(prev => prev.filter(id => id !== projectId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedProjects(projects.map(p => p.id));
        } else {
            setSelectedProjects([]);
        }
    };

    const selectedProjectObjects = projects.filter(p => selectedProjects.includes(p.id));

    return (
        <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Project Management</h2>
                    <p className="text-muted-foreground">
                        Manage your projects with comprehensive actions
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Add Project Action */}
                    <AddProjectAction
                        onProjectCreated={handleCreateProject}
                        variant="default"
                        size="md"
                    >
                        <Plus className="w-4 h-4" />
                        New Project
                    </AddProjectAction>

                    {/* Bulk Actions */}
                    {selectedProjects.length > 0 && (
                        <ProjectActions
                            selectedProjects={selectedProjectObjects}
                            onBulkAction={handleBulkAction}
                            showCreateButton={false}
                            showEditButton={false}
                            showMoreActions={false}
                        />
                    )}
                </div>
            </div>

            {/* Project List */}
            <div className="space-y-4">
                {/* Select All */}
                {projects.length > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                        <Checkbox
                            checked={selectedProjects.length === projects.length}
                            onCheckedChange={handleSelectAll}
                        />
                        <span className="text-sm font-medium">
                            {selectedProjects.length} of {projects.length} projects selected
                        </span>
                    </div>
                )}

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <Card key={project.id} className="relative">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{project.title}</CardTitle>
                                        <CardDescription className="text-sm">
                                            {project.project_id}
                                        </CardDescription>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={selectedProjects.includes(project.id)}
                                            onCheckedChange={(checked) =>
                                                handleProjectSelect(project.id, checked as boolean)
                                            }
                                        />

                                        <EditProjectAction
                                            project={project}
                                            onProjectUpdated={handleUpdateProject}
                                            variant="ghost"
                                            size="sm"
                                            showIcon={false}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </EditProjectAction>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="space-y-3">
                                    {/* Project Type and Priority */}
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                            {project.project_type || 'Unknown'}
                                        </Badge>
                                        <Badge
                                            variant={
                                                project.priority_level === 'critical' ? 'destructive' :
                                                    project.priority_level === 'high' ? 'default' :
                                                        project.priority_level === 'medium' ? 'secondary' : 'outline'
                                            }
                                        >
                                            {project.priority_level}
                                        </Badge>
                                        <Badge
                                            variant={
                                                project.status === 'active' ? 'default' :
                                                    project.status === 'completed' ? 'secondary' :
                                                        project.status === 'on_hold' ? 'outline' : 'destructive'
                                            }
                                        >
                                            {project.status}
                                        </Badge>
                                    </div>

                                    {/* Description */}
                                    {project.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {project.description}
                                        </p>
                                    )}

                                    {/* Customer */}
                                    {project.customer && (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Customer: </span>
                                            <span className="font-medium">
                                                {project.customer.company_name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Estimated Value */}
                                    {project.estimated_value && (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Value: </span>
                                            <span className="font-medium">
                                                ${project.estimated_value.toLocaleString()}
                                            </span>
                                        </div>
                                    )}

                                    {/* Individual Project Actions */}
                                    <div className="flex items-center gap-2 pt-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDuplicateProject(project)}
                                            className="h-8 px-2"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleArchiveProject(project)}
                                            className="h-8 px-2"
                                        >
                                            <Archive className="w-3 h-3" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteProject(project)}
                                            className="h-8 px-2 text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {projects.length === 0 && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <div className="space-y-4">
                                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                    <Plus className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">No projects yet</h3>
                                    <p className="text-muted-foreground">
                                        Create your first project to get started
                                    </p>
                                </div>
                                <AddProjectAction
                                    onProjectCreated={handleCreateProject}
                                    variant="default"
                                    size="md"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create First Project
                                </AddProjectAction>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
