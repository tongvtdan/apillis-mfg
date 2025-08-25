import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, ChevronRight, Play, Pause, XCircle, Eye, Users } from "lucide-react";
import { PROJECT_STAGES, ProjectStatus, Project, ProjectType } from "@/types/project";
import { useProjects } from "@/hooks/useProjects";
import { WorkflowValidator } from "@/lib/workflow-validator";
import { useNavigate } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from 'framer-motion';


interface WorkflowFlowchartProps {
    selectedProject: Project | null;
    onProjectSelect: (project: Project | null) => void;
    onStageSelect?: (stage: ProjectStatus) => void;
    selectedStage?: ProjectStatus | null;
    projectTypeFilter?: ProjectType | 'all';
    projects?: Project[]; // Pass projects from parent
    updateProjectStatusOptimistic?: (projectId: string, newStatus: ProjectStatus) => Promise<boolean>; // Pass update function
    refetch?: (forceRefresh?: boolean) => Promise<void>; // Pass refetch function
}

export function WorkflowFlowchart({
    selectedProject,
    onProjectSelect,
    onStageSelect,
    selectedStage,
    projectTypeFilter = 'all',
    projects: externalProjects,
    updateProjectStatusOptimistic: externalUpdateFn,
    refetch: externalRefetch
}: WorkflowFlowchartProps) {
    const { projects: hookProjects, updateProjectStatusOptimistic: hookUpdateFn, refetch: hookRefetch } = useProjects();
    const navigate = useNavigate();
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
    const [isUpdating, setIsUpdating] = useState(false);

    // Use external projects and functions if provided, otherwise use hook versions
    const allProjects = externalProjects || hookProjects;
    const updateProjectStatusOptimistic = externalUpdateFn || hookUpdateFn;
    const refetch = externalRefetch || hookRefetch;

    const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
        const project = allProjects.find(p => p.id === projectId);
        if (!project) return;

        // Validate the status change
        const validationResult = await WorkflowValidator.validateStatusChange(project, newStatus);

        if (!validationResult.isValid) {
            setValidationErrors(prev => ({
                ...prev,
                [projectId]: validationResult.errors
            }));
            return;
        }

        // Clear any previous errors for this project
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[projectId];
            return newErrors;
        });

        // Show update animation
        setIsUpdating(true);

        try {
            await updateProjectStatusOptimistic(projectId, newStatus);

            // Refresh projects data to ensure consistency
            await refetch(true);
        } finally {
            setIsUpdating(false);
        }
    };

    const getProjectStageStatus = (project: Project, stageId: ProjectStatus) => {
        const projectStageIndex = WorkflowValidator.getStageIndex(project.status);
        const stageIndex = WorkflowValidator.getStageIndex(stageId);

        if (stageIndex < projectStageIndex) {
            return 'completed';
        } else if (stageIndex === projectStageIndex) {
            return 'current';
        } else {
            return 'pending';
        }
    };

    const getStatusIcon = (status: 'completed' | 'current' | 'pending') => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'current':
                return <Play className="h-5 w-5 text-blue-500" />;
            case 'pending':
                return <Pause className="h-5 w-5 text-gray-400" />;
            default:
                return <Pause className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStageColor = (status: 'completed' | 'current' | 'pending') => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'current':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get available stages for a project (including completed stages for rollback)
    const getAvailableStages = (project: Project) => {
        const currentStageIndex = WorkflowValidator.getStageIndex(project.status);
        // Include all stages, not just forward stages, to allow rollback
        return PROJECT_STAGES.filter((_, index) => {
            // Allow moving to any stage, including completed ones for rollback scenarios
            return true;
        });
    };

    // Handle project status update from dropdown
    const handleUpdateStatus = async (project: Project, newStatus: ProjectStatus) => {
        // Validate the status change
        const validationResult = await WorkflowValidator.validateStatusChange(project, newStatus);

        if (!validationResult.isValid) {
            setValidationErrors(prev => ({
                ...prev,
                [project.id]: validationResult.errors
            }));
            return;
        }

        // Clear any previous errors for this project
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[project.id];
            return newErrors;
        });

        // Show update animation
        setIsUpdating(true);

        try {
            await updateProjectStatusOptimistic(project.id, newStatus);

            // Refresh projects data to ensure consistency
            await refetch(true);
        } finally {
            setIsUpdating(false);
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Get priority color
    const getPriorityColor = (priority: string) => {
        const PRIORITY_COLORS: Record<string, string> = {
            urgent: 'bg-red-100 text-red-800 border-red-200',
            high: 'bg-orange-100 text-orange-800 border-orange-200',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            low: 'bg-green-100 text-green-800 border-green-200'
        };
        return PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Filter projects based on selected stage and type
    const filteredProjects = useMemo(() => {
        let filtered = allProjects;

        // Apply stage filter if selected
        if (selectedStage) {
            filtered = filtered.filter(p => p.status === selectedStage);
        }

        // Apply project type filter
        if (projectTypeFilter !== 'all') {
            filtered = filtered.filter(p => p.project_type === projectTypeFilter);
        }

        return filtered;
    }, [allProjects, selectedStage, projectTypeFilter]);

    // Group projects by their current stage
    const projectsByStage = useMemo(() => {
        console.log('🔄 Recalculating projectsByStage with projects:', allProjects.length);
        return PROJECT_STAGES.map(stage => {
            const stageProjects = allProjects.filter(p => p.status === stage.id);
            console.log(`📊 Stage ${stage.id}: ${stageProjects.length} projects`);
            return {
                ...stage,
                projects: stageProjects
            };
        });
    }, [allProjects]);

    // Render project card in Kanban style
    const renderProjectCard = (project: Project) => {
        const isOverdue = project.days_in_stage > 7;
        const timeIndicator = isOverdue ?
            { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10' } :
            { icon: Play, color: 'text-success', bg: 'bg-success/10' };

        return (
            <Card key={project.id} className="card-elevated hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                            {project.project_id}
                        </CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/project/${project.id}`)}>
                                    View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Assign to...</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Badge
                                variant="outline"
                                className={`text-xs ${getPriorityColor(project.priority)}`}
                            >
                                {project.priority.toUpperCase()}
                            </Badge>
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${timeIndicator.bg}`}>
                                <timeIndicator.icon className={`h-3 w-3 ${timeIndicator.color}`} />
                                <span className={timeIndicator.color}>{project.days_in_stage}d</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                    <div>
                        <p className="font-medium text-sm">{project.title}</p>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                            <span>{project.customer?.company || project.customer?.name || project.contact_name || 'Unknown'}</span>
                        </div>
                    </div>

                    <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-muted-foreground">
                                <span>{project.contact_name || project.assignee_id || 'Unassigned'}</span>
                            </div>
                            {project.estimated_value && (
                                <span className="font-medium">{formatCurrency(project.estimated_value)}</span>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            {project.due_date && (
                                <div className="flex items-center space-x-1 text-muted-foreground">
                                    <span>{formatDate(project.due_date)}</span>
                                </div>
                            )}
                            <div className="flex items-center space-x-1 text-muted-foreground">
                                <span>{project.days_in_stage} days</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t">
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="accent"
                                size="sm"
                                className="w-full justify-center h-7 action-button hover:scale-[1.02] transition-all duration-200"
                                onClick={() => navigate(`/project/${project.id}`)}
                            >
                                <Eye className="mr-2 h-3 w-3 flex-shrink-0" />
                                <span className="truncate">View Details</span>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="w-full justify-center h-7 bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02] transition-all duration-200 shadow-sm"
                                    >
                                        <Users className="mr-1 h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">Change Stage</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="bg-background backdrop-blur-lg border border-muted-foreground/20"
                                >
                                    {getAvailableStages(project).map((stage) => {
                                        const stageStatus = getProjectStageStatus(project, stage.id);
                                        const isCurrentStage = project.status === stage.id;

                                        return (
                                            <DropdownMenuItem
                                                key={stage.id}
                                                onClick={() => handleUpdateStatus(project, stage.id)}
                                                disabled={isCurrentStage}
                                                className={`
                                                    ${isCurrentStage ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                                    transition-all duration-200 ease-in-out
                                                    hover:bg-accent hover:text-accent-foreground
                                                    focus:bg-accent focus:text-accent-foreground
                                                    data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground
                                                    hover:pl-3 hover:scale-[1.02] transform
                                                    rounded-sm my-0.5
                                                `}
                                            >
                                                <div className="flex items-center w-full">
                                                    <span className="flex-1">{stage.name}</span>
                                                    {isCurrentStage && (
                                                        <Badge variant="secondary" className="ml-2 text-xs">
                                                            Current
                                                        </Badge>
                                                    )}
                                                    {stageStatus === 'completed' && !isCurrentStage && (
                                                        <Badge variant="outline" className="ml-2 text-xs border-green-500 text-green-500">
                                                            Completed
                                                        </Badge>
                                                    )}
                                                </div>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Workflow Visualization</CardTitle>
                            <CardDescription>
                                Visualize and manage project workflow stages
                            </CardDescription>
                        </div>

                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto pb-4">
                        <div className="flex items-center gap-4 min-w-max">
                            {PROJECT_STAGES.map((stage, index) => (
                                <React.Fragment key={stage.id}>
                                    <div className="flex flex-col items-center space-y-2">
                                        <Badge className={`${stage.color} text-xs font-medium`} variant="outline">
                                            {projectsByStage.find(s => s.id === stage.id)?.projects.length || 0}
                                        </Badge>
                                        <Card
                                            className={`w-48 cursor-pointer hover:shadow-md transition-shadow ${selectedStage === stage.id ? 'ring-2 ring-primary' : ''}`}
                                            onClick={() => onStageSelect && onStageSelect(stage.id)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="text-center">
                                                    <h3 className="font-medium text-sm">{stage.name}</h3>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {index < PROJECT_STAGES.length - 1 && (
                                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedProject && (
                <Card>
                    <CardHeader>
                        <CardTitle>Project Workflow: {selectedProject.title}</CardTitle>
                        <CardDescription>
                            Project ID: {selectedProject.project_id}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">Workflow Progress</h3>
                                <Button variant="outline" size="sm" onClick={() => onProjectSelect(null)}>
                                    Close
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {PROJECT_STAGES.map((stage, index) => {
                                    const stageStatus = getProjectStageStatus(selectedProject, stage.id);
                                    const canMoveToStage = WorkflowValidator.getStageIndex(selectedProject.status) < index;

                                    return (
                                        <div key={stage.id} className="flex items-center space-x-3">
                                            <div className={`flex items-center justify-center h-8 w-8 rounded-full border ${getStageColor(stageStatus)}`}>
                                                {getStatusIcon(stageStatus)}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-sm">{stage.name}</span>
                                                    {stageStatus === 'pending' && canMoveToStage && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs"
                                                            onClick={() => handleStatusChange(selectedProject.id, stage.id)}
                                                        >
                                                            Move to Stage
                                                        </Button>
                                                    )}
                                                    {stageStatus === 'current' && (
                                                        <Badge variant="secondary" className="h-6 text-xs">
                                                            Current Stage
                                                        </Badge>
                                                    )}
                                                    {stageStatus === 'completed' && (
                                                        <Badge variant="secondary" className="h-6 text-xs bg-green-100 text-green-800">
                                                            Completed
                                                        </Badge>
                                                    )}
                                                </div>

                                                {validationErrors[selectedProject.id] && (
                                                    <div className="mt-1 flex items-center text-xs text-red-500">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        {validationErrors[selectedProject.id].join(", ")}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Kanban-style project list */}
            {!selectedProject && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {selectedStage
                                ? `${PROJECT_STAGES.find(s => s.id === selectedStage)?.name || 'Selected'} Projects`
                                : 'All Projects'}
                        </CardTitle>
                        <CardDescription>
                            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredProjects.map(project => renderProjectCard(project))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p className="text-sm">No projects found</p>
                                {selectedStage && (
                                    <p className="text-xs mt-1">No projects in this stage</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}



        </div>
    );
}