import React, { useMemo } from 'react';
import { Project } from '@/types/project';
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

    // Create a project object with the effective status (local or original)
    // Use useMemo to avoid unnecessary re-renders
    const effectiveProject = useMemo(() => ({
        ...project,
        status: getEffectiveStatus(project.status)
    }), [project, getEffectiveStatus]);

    return (
        <AnimatedProjectCard
            key={`${project.id}-${effectiveProject.status}-${project.updated_at}`}
            project={effectiveProject}
            onStatusChange={async () => { }} // No-op since stage changes are now handled in project details
            getAvailableStages={() => []} // No-op since stage changes are now handled in project details
            getPriorityColor={getPriorityColor}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
        />
    );
}
