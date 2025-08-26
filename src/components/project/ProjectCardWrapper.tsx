import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '@/types/project';
import { AnimatedProjectCard } from './AnimatedProjectCard';
import { useProjectUpdate } from '@/hooks/useProjectUpdate';

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
            onStatusChange={async () => { }} // No-op since stage changes are now handled in project details
            getAvailableStages={() => []} // No-op since stage changes are now handled in project details
            getPriorityColor={getPriorityColor}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
        />
    );
}
