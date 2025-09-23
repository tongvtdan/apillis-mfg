import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Edit, MoreHorizontal, Trash2, Copy, Archive, Share } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/shared/hooks/use-toast';
import { Project } from '@/types/project';
import { EditProjectModal } from '../EditProjectModal';
import { useProjects } from '@/hooks/useProjects';

interface ProjectActionsProps {
    // For creating new projects
    onCreateProject?: (project: Project) => void;

    // For editing existing projects
    project?: Project;
    onUpdateProject?: (project: Project) => void;

    // For bulk actions
    selectedProjects?: Project[];
    onBulkAction?: (action: string, projects: Project[]) => void;

    // UI customization
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    showCreateButton?: boolean;
    showEditButton?: boolean;
    showMoreActions?: boolean;
    className?: string;
}

export function ProjectActions({
    onCreateProject,
    project,
    onUpdateProject,
    selectedProjects = [],
    onBulkAction,
    variant = 'default',
    size = 'md',
    showCreateButton = true,
    showEditButton = true,
    showMoreActions = true,
    className = ''
}: ProjectActionsProps) {
    const [showEditModal, setShowEditModal] = useState(false);
    const { toast } = useToast();
    const { updateProject, deleteProject } = useProjects();
    const navigate = useNavigate();

    // Handle project update
    const handleUpdateProject = (updatedProject: Project) => {
        onUpdateProject?.(updatedProject);
        setShowEditModal(false);
        toast({
            title: "Project Updated",
            description: `Project "${updatedProject.title}" has been updated successfully.`,
        });
    };

    // Handle project deletion
    const handleDeleteProject = async () => {
        if (!project) return;

        try {
            await deleteProject(project.id);
            toast({
                title: "Project Deleted",
                description: `Project "${project.title}" has been deleted successfully.`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Delete Failed",
                description: "Failed to delete project. Please try again.",
            });
        }
    };

    // Handle project duplication
    const handleDuplicateProject = async () => {
        if (!project) return;

        try {
            // Create a copy of the project with modified title
            const duplicatedProject = {
                ...project,
                title: `${project.title} (Copy)`,
                project_id: await generateProjectId(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            // Remove id to let database generate new one
            delete (duplicatedProject as any).id;

            onCreateProject?.(duplicatedProject);
            toast({
                title: "Project Duplicated",
                description: `Project "${project.title}" has been duplicated successfully.`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Duplicate Failed",
                description: "Failed to duplicate project. Please try again.",
            });
        }
    };

    // Handle project archiving
    const handleArchiveProject = async () => {
        if (!project) return;

        try {
            await updateProject(project.id, { status: 'completed' });
            toast({
                title: "Project Archived",
                description: `Project "${project.title}" has been archived successfully.`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Archive Failed",
                description: "Failed to archive project. Please try again.",
            });
        }
    };

    // Handle bulk actions
    const handleBulkDelete = () => {
        if (selectedProjects.length === 0) return;
        onBulkAction?.('delete', selectedProjects);
    };

    const handleBulkArchive = () => {
        if (selectedProjects.length === 0) return;
        onBulkAction?.('archive', selectedProjects);
    };

    // Generate unique project ID
    const generateProjectId = async (): Promise<string> => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const sequence = String(Math.floor(Math.random() * 100)).padStart(2, '0');
        return `P-${year}${month}${day}${sequence}`;
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Create Project Button */}
            {showCreateButton && (
                <Button
                    onClick={() => navigate("/projects/new")}
                    variant="outline"
                    size={size}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Project
                </Button>
            )}

            {/* Edit Project Button */}
            {showEditButton && project && (
                <Button
                    onClick={() => setShowEditModal(true)}
                    variant={variant}
                    size={size}
                    className="flex items-center gap-2"
                >
                    <Edit className="w-4 h-4" />
                    Edit Project
                </Button>
            )}

            {/* More Actions Dropdown */}
            {showMoreActions && project && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size={size}>
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDuplicateProject}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate Project
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleArchiveProject}>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive Project
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDeleteProject} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Project
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* Bulk Actions */}
            {selectedProjects.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size={size}>
                            <MoreHorizontal className="w-4 h-4 mr-2" />
                            Bulk Actions ({selectedProjects.length})
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handleBulkArchive}>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive Selected
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleBulkDelete} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Selected
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* Edit Project Modal */}
            {project && (
                <EditProjectModal
                    project={project}
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => handleUpdateProject(project)}
                />
            )}
        </div>
    );
}
