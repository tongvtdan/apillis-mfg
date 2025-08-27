import React, { useMemo, forwardRef } from 'react';
import { Project } from '@/types/project';
import { AnimatedProjectCard } from './AnimatedProjectCard';
import { useProjectUpdate } from '@/hooks/useProjectUpdate';

interface ProjectCardWrapperProps {
    project: Project;
    getPriorityColor: (priority: string) => string;
    formatCurrency: (value: number | null) => string | null;
    formatDate: (date: string) => string;
}

export const ProjectCardWrapper = forwardRef<HTMLDivElement, ProjectCardWrapperProps>(({
    project,
    getPriorityColor,
    formatCurrency,
    formatDate
}, ref) => {
    const { isUpdating, localStage, updateStatus, getEffectiveStage } = useProjectUpdate(project.id);

    // Create a project object with the effective stage (local or original)
    // Use useMemo to avoid unnecessary re-renders
    const effectiveProject = useMemo(() => ({
        ...project,
        current_stage: getEffectiveStage(project.current_stage)
    }), [project, getEffectiveStage]);

    return (
        <div ref={ref}>
            <AnimatedProjectCard
                key={`${project.id}-${effectiveProject.current_stage}-${project.updated_at}`}
                project={effectiveProject}
                onStatusChange={async () => { }} // No-op since stage changes are now handled in project details
                getAvailableStages={() => []} // No-op since stage changes are now handled in project details
                getPriorityColor={getPriorityColor}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
            />
        </div>
    );
});

ProjectCardWrapper.displayName = 'ProjectCardWrapper';
