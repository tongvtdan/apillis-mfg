import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '@/types/project';
import { AnimatedProjectCard } from './AnimatedProjectCard';
import { useProjectUpdate } from '@/hooks/useProjectUpdate';
import { PROJECT_STAGES } from '@/types/project';
import { WorkflowValidator } from '@/lib/workflow-validator';

interface ProjectCardWrapperProps {
    project: Project;
    getPriorityColor: (priority: string) => string;
    formatCurrency: (value: number | null) => string | null;
    formatDate: (date: string) => string;
}

export function ProjectCardWrapper({
    project,
    getPriorityColor,
    formatCurrency,
    formatDate
}: ProjectCardWrapperProps) {
    const { isUpdating, localStatus, updateStatus, getEffectiveStatus } = useProjectUpdate(project.id);
    const [localProject, setLocalProject] = useState(project);

    // Only update local state when this specific project changes
    useEffect(() => {
        setLocalProject(project);
    }, [project.id, project.status]);

    // Get available stages for a project
    const getAvailableStages = (project: Project) => {
        const currentStageIndex = WorkflowValidator.getStageIndex(project.status);
        // Include all stages, not just forward stages, to allow rollback
        return PROJECT_STAGES.filter((_, index) => {
            // Allow moving to any stage, including completed ones for rollback scenarios
            return true;
        });
    };

    // Handle status change with local state management
    const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
        // Validate the status change
        const validationResult = await WorkflowValidator.validateStatusChange(project, newStatus);

        if (!validationResult.isValid) {
            // Validation errors are handled by the hook via toast
            return;
        }

        // Update the status
        await updateStatus(newStatus);
    };

    // Create a project object with the effective status (local or original)
    const effectiveProject = {
        ...localProject,
        status: getEffectiveStatus(localProject.status)
    };

    return (
        <AnimatedProjectCard
            key={`${project.id}-${effectiveProject.status}`}
            project={effectiveProject}
            onStatusChange={handleStatusChange}
            getAvailableStages={getAvailableStages}
            getPriorityColor={getPriorityColor}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            isUpdating={isUpdating}
        />
    );
}
