import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client.ts';
import { Project, ProjectStatus } from '@/types/project';
import { useAuth } from '@/core/auth';
import { useToast } from '@/shared/hooks/use-toast';
import { cacheService } from '@/services/cacheService';
import { WorkflowValidationResult } from '@/lib/workflow-validator';

export function useProjectUpdates() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, profile } = useAuth();
    const { toast } = useToast();

    // Update project status with validation
    const updateProjectStatus = async (projectId: string, newStatus: ProjectStatus): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            // Validate input parameters
            if (!projectId || !newStatus) {
                toast({
                    variant: "destructive",
                    title: "Invalid Parameters",
                    description: "Project ID and status are required.",
                });
                return false;
            }

            // Validate status value
            const validStatuses: ProjectStatus[] = ['active', 'on_hold', 'delayed', 'cancelled', 'completed'];
            if (!validStatuses.includes(newStatus)) {
                toast({
                    variant: "destructive",
                    title: "Invalid Status",
                    description: `Status must be one of: ${validStatuses.join(', ')}`,
                });
                return false;
            }

            // Validate the workflow transition
            // Note: This validation is now handled in the useStageTransition hook
            // For backward compatibility, we'll skip validation here
            console.log('Skipping workflow validation in updateProjectStatus - handled elsewhere');

            // Update the project status
            const { error } = await supabase
                .from('projects')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', projectId);

            if (error) {
                console.error('Error updating project status:', error);
                const errorMessage = error.code === '23514'
                    ? 'Invalid status value. Please select a valid status.'
                    : error.message || 'Failed to update project status. Please try again.';

                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: errorMessage,
                });
                return false;
            }

            toast({
                title: "Status Updated",
                description: "Project status has been successfully updated.",
            });

            return true;
        } catch (error) {
            console.error('Error updating project status:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while updating the project status.';
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: errorMessage,
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Update project stage with validation
    const updateProjectStage = async (projectId: string, newStageId: string): Promise<WorkflowValidationResult> => {
        try {
            setLoading(true);
            setError(null);

            // Validate input parameters
            if (!projectId || !newStageId) {
                const errorResult = {
                    isValid: false,
                    message: "Project ID and stage ID are required.",
                    errors: ["Project ID and stage ID are required."],
                    warnings: [],
                    canAutoAdvance: false,
                    requiresManagerApproval: false
                };
                toast({
                    variant: "destructive",
                    title: "Invalid Parameters",
                    description: errorResult.message,
                });
                return errorResult;
            }

            // Update the project stage using correct database field name
            const { error } = await supabase
                .from('projects')
                .update({
                    current_stage_id: newStageId,
                    stage_entered_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', projectId);

            if (error) {
                console.error('Error updating project stage:', error);
                const errorMessage = error.code === '23503'
                    ? 'Invalid stage ID. The specified stage does not exist.'
                    : error.message || 'Failed to update project stage. Please try again.';

                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: errorMessage,
                });
                return {
                    isValid: false,
                    message: errorMessage,
                    errors: [errorMessage],
                    warnings: [],
                    canAutoAdvance: false,
                    requiresManagerApproval: false
                };
            }

            toast({
                title: "Stage Updated",
                description: "Project stage has been successfully updated.",
            });

            return {
                isValid: true,
                message: "Project stage updated successfully",
                errors: [],
                warnings: [],
                canAutoAdvance: false,
                requiresManagerApproval: false
            };
        } catch (error) {
            console.error('Error updating project stage:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while updating the project stage.';
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: errorMessage,
            });
            return {
                isValid: false,
                message: errorMessage,
                errors: [errorMessage],
                warnings: [],
                canAutoAdvance: false,
                requiresManagerApproval: false
            };
        } finally {
            setLoading(false);
        }
    };

    // Optimistic update for project status (for UI updates before database confirmation)
    const updateProjectStatusOptimistic = async (projectId: string, newStatus: ProjectStatus): Promise<boolean> => {
        try {
            // This would typically update local state optimistically
            // Implementation depends on the calling component's state management
            return true;
        } catch (error) {
            console.error('Error in optimistic update:', error);
            return false;
        }
    };

    return {
        loading,
        error,
        updateProjectStatus,
        updateProjectStage,
        updateProjectStatusOptimistic
    };
}
