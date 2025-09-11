import { useProjectCreation } from './useProjectCreation';
import { useProjectListing } from './useProjectListing';
import { useProjectUpdates } from './useProjectUpdates';
import { useProjectAnalytics } from './useProjectAnalytics';

/**
 * Main project management hook that combines all project-related functionality
 * This follows the feature-based architecture pattern by aggregating smaller,
 * focused hooks into a cohesive interface
 */
export function useProjectManagement() {
    const creation = useProjectCreation();
    const listing = useProjectListing();
    const updates = useProjectUpdates();
    const analytics = useProjectAnalytics();

    return {
        // Project listing and fetching
        projects: listing.projects,
        loading: listing.loading || creation.loading || updates.loading || analytics.loading,
        error: listing.error || creation.error || updates.error || analytics.error,
        fetchProjects: listing.fetchProjects,
        refetch: listing.refetch,
        refetchWithFilters: listing.refetchWithFilters,
        subscribeToProjectUpdates: listing.subscribeToProjectUpdates,
        clearCacheAndRefetch: listing.clearCacheAndRefetch,

        // Project creation
        createProject: creation.createProject,
        createOrGetCustomer: creation.createOrGetCustomer,
        generateProjectId: creation.generateProjectId,

        // Project updates
        updateProjectStatus: updates.updateProjectStatus,
        updateProjectStage: updates.updateProjectStage,
        updateProjectStatusOptimistic: updates.updateProjectStatusOptimistic,

        // Project analytics and utilities
        getProjectById: analytics.getProjectById,
        getBottleneckAnalysis: analytics.getBottleneckAnalysis,
        testCustomerOrganizationFetching: analytics.testCustomerOrganizationFetching,
        ensureProjectSubscription: analytics.ensureProjectSubscription,
    };
}

// Re-export individual hooks for cases where only specific functionality is needed
export { useProjectCreation } from './useProjectCreation';
export { useProjectListing } from './useProjectListing';
export { useProjectUpdates } from './useProjectUpdates';
export { useProjectAnalytics } from './useProjectAnalytics';
export { useProjectWorkflow } from './useProjectWorkflow';
export { useStageTransition } from './useStageTransition';
export { useProjectNavigation } from './useProjectNavigation';
export { useEnhancedProjects } from './useEnhancedProjects';
export { useProjectsOptimized } from './useProjectsOptimized';
export { useProjectSubStageProgress } from './useProjectSubStageProgress';
export { useProjectUpdate } from './useProjectUpdate';
export { useSmoothProjectUpdates } from './useSmoothProjectUpdates';
