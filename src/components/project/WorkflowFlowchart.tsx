import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, ChevronRight, Play, Pause } from "lucide-react";
import { ProjectStatus, Project, ProjectType, WorkflowStage } from "@/types/project";
import { useProjects } from "@/hooks/useProjects";
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectCardWrapper } from './ProjectCardWrapper';
import { workflowStageService } from '@/services/workflowStageService';

interface WorkflowFlowchartProps {
    selectedProject: Project | null;
    onProjectSelect: (project: Project | null) => void;
    onStageSelect?: (stageId: string) => void;
    selectedStage?: string | null;
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
    const { projects: hookProjects, updateProjectStatusOptimistic: hookUpdateFn } = useProjects();
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
    const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>([]);
    const [stagesLoading, setStagesLoading] = useState(true);

    // Use external projects and functions if provided, otherwise use hook versions
    const allProjects = externalProjects || hookProjects;
    const updateProjectStatusOptimistic = externalUpdateFn || hookUpdateFn;

    // Load workflow stages from database
    useEffect(() => {
        const loadWorkflowStages = async () => {
            try {
                setStagesLoading(true);
                const stages = await workflowStageService.getWorkflowStages();
                // Sort stages by stage_order
                const sortedStages = stages.sort((a, b) => a.stage_order - b.stage_order);
                setWorkflowStages(sortedStages);
            } catch (error) {
                console.error('Error loading workflow stages:', error);
                setWorkflowStages([]);
            } finally {
                setStagesLoading(false);
            }
        };

        loadWorkflowStages();
    }, []);

    const handleStatusChange = async (projectId: string, newStageId: string) => {
        const project = allProjects.find(p => p.id === projectId);
        if (!project) return;

        // Validate the stage transition
        const validationResult = await workflowStageService.validateStageTransition(
            project.current_stage_id || '',
            newStageId
        );

        if (!validationResult.isValid) {
            setValidationErrors(prev => ({
                ...prev,
                [projectId]: [validationResult.message || 'Invalid stage transition']
            }));
            return;
        }

        // Clear any previous errors for this project
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[projectId];
            return newErrors;
        });

        try {
            // Update the project's current_stage_id
            // Note: This would typically call a project update function
            // For now, we'll use the status update function as a placeholder
            console.log(`Moving project ${projectId} to stage ${newStageId}`);

            // TODO: Implement proper stage update functionality
            // await updateProjectStage(projectId, newStageId);
        } catch (error) {
            console.error('Error updating project stage:', error);
        }
    };

    const getProjectStageStatus = (project: Project, stageId: string) => {
        const currentStage = workflowStages.find(s => s.id === project.current_stage_id);
        const targetStage = workflowStages.find(s => s.id === stageId);

        if (!currentStage || !targetStage) return 'pending';

        if (targetStage.stage_order < currentStage.stage_order) {
            return 'completed';
        } else if (targetStage.stage_order === currentStage.stage_order) {
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

    // Format currency
    const formatCurrency = (amount: number | null) => {
        if (!amount) return null;
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

    // Get priority color - use priority_level field from database
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

        // Apply stage filter if selected - use current_stage_id from database
        if (selectedStage) {
            filtered = filtered.filter(p => p.current_stage_id === selectedStage);
        }

        // Apply project type filter
        if (projectTypeFilter !== 'all') {
            filtered = filtered.filter(p => p.project_type === projectTypeFilter);
        }

        return filtered;
    }, [allProjects, selectedStage, projectTypeFilter]);

    // Group projects by their current stage using dynamic workflow stages
    const projectsByStage = useMemo(() => {
        return workflowStages.map(stage => {
            const stageProjects = allProjects.filter(p => p.current_stage_id === stage.id);
            return {
                ...stage,
                projects: stageProjects,
                count: stageProjects.length
            };
        });
    }, [allProjects, workflowStages]);

    // Render project card using wrapper component
    const renderProjectCard = (project: Project) => {
        return (
            <ProjectCardWrapper
                key={project.id}
                project={project}
                getPriorityColor={(priority) => getPriorityColor(priority)}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
            />
        );
    };

    if (stagesLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center">
                            <p className="text-muted-foreground">Loading workflow stages...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                            {projectsByStage.map((stageData, index) => (
                                <React.Fragment key={stageData.id}>
                                    <motion.div
                                        className="flex flex-col items-center space-y-2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.3 }}
                                    >
                                        <motion.div
                                            key={`${stageData.id}-${stageData.count}`}
                                            initial={{ scale: 1.2 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Badge
                                                className="text-xs font-medium"
                                                variant="outline"
                                                style={{
                                                    backgroundColor: stageData.color || '#f3f4f6',
                                                    color: '#374151'
                                                }}
                                            >
                                                {stageData.count}
                                            </Badge>
                                        </motion.div>
                                        <Card
                                            className={`w-48 cursor-pointer hover:shadow-md transition-shadow ${selectedStage === stageData.id ? 'ring-2 ring-primary' : ''}`}
                                            onClick={() => onStageSelect && onStageSelect(stageData.id)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="text-center">
                                                    <h3 className="font-medium text-sm">{stageData.name}</h3>
                                                    {stageData.description && (
                                                        <p className="text-xs text-muted-foreground mt-1 truncate">
                                                            {stageData.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {index < projectsByStage.length - 1 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.1 + 0.15, duration: 0.3 }}
                                        >
                                            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                        </motion.div>
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
                                {workflowStages.map((stage) => {
                                    const stageStatus = getProjectStageStatus(selectedProject, stage.id);
                                    const currentStage = workflowStages.find(s => s.id === selectedProject.current_stage_id);
                                    const canMoveToStage = !currentStage || stage.stage_order > currentStage.stage_order;

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
                                ? `${workflowStages.find(s => s.id === selectedStage)?.name || 'Selected'} Projects`
                                : 'All Projects'}
                        </CardTitle>
                        <CardDescription>
                            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredProjects.length > 0 ? (
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                layout
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredProjects.map(project => renderProjectCard(project))}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="text-center py-8 text-muted-foreground"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <p className="text-sm">No projects found</p>
                                {selectedStage && (
                                    <p className="text-xs mt-1">No projects in this stage</p>
                                )}
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}