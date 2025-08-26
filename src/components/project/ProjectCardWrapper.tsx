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
        console.log(`🔄 ProjectCardWrapper: Project ${project.id} status changed from ${localProject?.status} to ${project.status}`);
        setLocalProject(project);
    }, [project.id, project.status]);

    // Get available stages for a project
    const getAvailableStages = (project: Project) => {
        const currentStageIndex = WorkflowValidator.getStageIndex(project.status);

        // Return all stages but mark them with validation status
        return PROJECT_STAGES.map(stage => ({
            ...stage,
            canMoveTo: WorkflowValidator.canMoveToStage(project, stage.id),
            isNextStage: WorkflowValidator.getNextValidStages(project.status)[0] === stage.id,
            isCurrentStage: project.status === stage.id
        }));
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

    console.log(`🔄 ProjectCardWrapper: Effective project status for ${project.id}: ${effectiveProject.status} (local: ${localStatus}, original: ${localProject.status})`);

    return (
        <AnimatedProjectCard
            key={`${project.id}-${effectiveProject.status}`}
            project={effectiveProject}
            onStatusChange={handleStatusChange}
            getAvailableStages={getAvailableStages}
            getPriorityColor={getPriorityColor}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
        />
    );
}
