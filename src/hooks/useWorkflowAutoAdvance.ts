import { useCallback, useEffect, useState } from 'react';
import { Project, ProjectStatus } from '@/types/project';
import { WorkflowValidator } from '@/lib/workflow-validator';
import { useProjects } from './useProjects';
import { useProjectReviews } from './useProjectReviews';
import { useToast } from './use-toast';

export function useWorkflowAutoAdvance(project: Project) {
    const [isChecking, setIsChecking] = useState(false);
    const [autoAdvanceAvailable, setAutoAdvanceAvailable] = useState(false);
    const [nextStage, setNextStage] = useState<ProjectStatus | null>(null);
    const [autoAdvanceReason, setAutoAdvanceReason] = useState<string>('');
    const { updateProjectStatusOptimistic } = useProjects();
    const { toast } = useToast();

    // Early return if project is not properly loaded
    if (!project || !project.id || !project.status) {
        return {
            isChecking: false,
            autoAdvanceAvailable: false,
            nextStage: null,
            autoAdvanceReason: 'Project not loaded',
            checkAutoAdvance: () => Promise.resolve(),
            executeAutoAdvance: () => Promise.resolve(false)
        };
    }

    // Only call useProjectReviews if we have a valid project
    const { getOverallReviewStatus, getReviewSummary } = useProjectReviews(project.id);

    const checkAutoAdvance = useCallback(async () => {
        if (isChecking) return;

        setIsChecking(true);
        try {
            // Custom logic for technical_review stage to check actual review completion
            if (project.status === 'technical_review') {
                const overallReviewStatus = getOverallReviewStatus();
                const reviewSummary = getReviewSummary();

                console.log('🔄 Auto-advance check for technical_review:', {
                    overallStatus: overallReviewStatus,
                    summary: reviewSummary
                });

                if (overallReviewStatus === 'approved') {
                    setAutoAdvanceAvailable(true);
                    setNextStage('supplier_rfq_sent');
                    setAutoAdvanceReason(`All technical reviews completed and approved (${reviewSummary.approved}/${reviewSummary.total}). Ready to advance to Supplier RFQ.`);
                } else {
                    setAutoAdvanceAvailable(false);
                    setNextStage(null);
                    if (reviewSummary.pending > 0) {
                        setAutoAdvanceReason(`Waiting for ${reviewSummary.pending} pending review(s) to complete.`);
                    } else if (reviewSummary.rejected > 0 || reviewSummary.revisionRequested > 0) {
                        setAutoAdvanceReason(`Reviews need attention: ${reviewSummary.rejected} rejected, ${reviewSummary.revisionRequested} need revision.`);
                    } else {
                        setAutoAdvanceReason('Technical reviews not yet completed.');
                    }
                }
            } else {
                // Use default workflow validator for other stages
                const result = await WorkflowValidator.checkAndAutoAdvance(project);
                setAutoAdvanceAvailable(result.shouldAdvance);
                setNextStage(result.nextStage);
                setAutoAdvanceReason(result.reason);
            }
        } catch (error) {
            console.error('Error checking auto-advance:', error);
            setAutoAdvanceAvailable(false);
            setNextStage(null);
            setAutoAdvanceReason('Error checking auto-advance conditions.');
        } finally {
            setIsChecking(false);
        }
    }, [project, isChecking, getOverallReviewStatus, getReviewSummary]);

    const executeAutoAdvance = useCallback(async () => {
        if (!nextStage || !autoAdvanceAvailable) return false;

        try {
            const success = await updateProjectStatusOptimistic(project.id, nextStage);

            if (success) {
                toast({
                    title: "Auto-Advance Executed",
                    description: `Project automatically advanced to ${nextStage}`,
                });

                // Reset state
                setAutoAdvanceAvailable(false);
                setNextStage(null);
                setAutoAdvanceReason('');

                return true;
            }
        } catch (error) {
            console.error('Error executing auto-advance:', error);
            toast({
                variant: "destructive",
                title: "Auto-Advance Failed",
                description: "Failed to automatically advance project. Please try manually.",
            });
        }

        return false;
    }, [nextStage, autoAdvanceAvailable, project.id, updateProjectStatusOptimistic, toast]);

    // Check auto-advance when project changes
    useEffect(() => {
        // Skip auto-advance checks for certain stages where auto-advance is not applicable
        const stagesWithoutAutoAdvance = ['shipped_closed', 'cancelled', 'on_hold'];
        if (stagesWithoutAutoAdvance.includes(project.status)) {
            console.log('🔄 useWorkflowAutoAdvance: Skipping auto-advance check for stage:', project.status);
            setAutoAdvanceAvailable(false);
            setNextStage(null);
            setAutoAdvanceReason(`Auto-advance not applicable for ${project.status} stage.`);
            return;
        }

        // Skip if we're already checking to prevent duplicate checks
        if (isChecking) {
            console.log('🔄 useWorkflowAutoAdvance: Already checking, skipping duplicate check');
            return;
        }

        // Skip if this is a fresh status change that just happened (likely from auto-advance execution)
        // This prevents the hook from running immediately after a status change
        const now = Date.now();
        const lastUpdateTime = new Date(project.updated_at).getTime();
        const timeSinceUpdate = now - lastUpdateTime;

        if (timeSinceUpdate < 1000) { // Skip if less than 1 second since update
            console.log('🔄 useWorkflowAutoAdvance: Recent status change detected, skipping immediate check');
            return;
        }

        // Skip if the status is not one that supports auto-advance
        const autoAdvanceSupportedStages = ['technical_review', 'inquiry_received'];
        if (!autoAdvanceSupportedStages.includes(project.status)) {
            console.log('🔄 useWorkflowAutoAdvance: Stage does not support auto-advance:', project.status);
            setAutoAdvanceAvailable(false);
            setNextStage(null);
            setAutoAdvanceReason(`Stage ${project.status} does not support automatic progression.`);
            return;
        }

        // Skip if this is just a timestamp update without status change
        // This prevents unnecessary re-runs when only updated_at changes
        if (project.status === 'technical_review') {
            // For technical_review stage, we need to check reviews even if only timestamp changed
            console.log('🔄 useWorkflowAutoAdvance: Technical review stage - checking reviews for updates');
        } else {
            // For other stages, skip if only timestamp changed (likely from auto-advance execution)
            console.log('🔄 useWorkflowAutoAdvance: Non-review stage - proceeding with auto-advance check');
        }

        console.log('🔄 useWorkflowAutoAdvance: Project changed, checking auto-advance...', {
            projectId: project.id,
            status: project.status,
            updated_at: project.updated_at
        });

        // Add a small delay to prevent rapid successive calls
        const timeoutId = setTimeout(() => {
            // Inline the auto-advance check to avoid dependency issues
            const performCheck = async () => {
                if (isChecking) return;

                setIsChecking(true);
                try {
                    // Custom logic for technical_review stage to check actual review completion
                    if (project.status === 'technical_review') {
                        const overallReviewStatus = getOverallReviewStatus();
                        const reviewSummary = getReviewSummary();

                        console.log('🔄 Auto-advance check for technical_review:', {
                            overallStatus: overallReviewStatus,
                            summary: reviewSummary
                        });

                        if (overallReviewStatus === 'approved') {
                            setAutoAdvanceAvailable(true);
                            setNextStage('supplier_rfq_sent');
                            setAutoAdvanceReason(`All technical reviews completed and approved (${reviewSummary.approved}/${reviewSummary.total}). Ready to advance to Supplier RFQ.`);
                        } else {
                            setAutoAdvanceAvailable(false);
                            setNextStage(null);
                            if (reviewSummary.pending > 0) {
                                setAutoAdvanceReason(`Waiting for ${reviewSummary.pending} pending review(s) to complete.`);
                            } else if (reviewSummary.rejected > 0 || reviewSummary.revisionRequested > 0) {
                                setAutoAdvanceReason(`Reviews need attention: ${reviewSummary.rejected} rejected, ${reviewSummary.revisionRequested} need revision.`);
                            } else {
                                setAutoAdvanceReason('Technical reviews not yet completed.');
                            }
                        }
                    } else if (project.status === 'supplier_rfq_sent') {
                        // Handle supplier_rfq_sent stage - check if quotes are received
                        console.log('🔄 Auto-advance check for supplier_rfq_sent stage');
                        setAutoAdvanceAvailable(false);
                        setNextStage(null);
                        setAutoAdvanceReason('Waiting for supplier quotes to be received and evaluated.');
                    } else if (project.status === 'quoted') {
                        // Handle quoted stage - check if order is confirmed
                        console.log('🔄 Auto-advance check for quoted stage');
                        setAutoAdvanceAvailable(false);
                        setNextStage(null);
                        setAutoAdvanceReason('Waiting for order confirmation from customer.');
                    } else if (project.status === 'order_confirmed') {
                        // Handle order_confirmed stage - check if procurement planning is complete
                        console.log('🔄 Auto-advance check for order_confirmed stage');
                        setAutoAdvanceAvailable(false);
                        setNextStage(null);
                        setAutoAdvanceReason('Waiting for procurement planning to complete.');
                    } else if (project.status === 'procurement_planning') {
                        // Handle procurement_planning stage - check if ready for production
                        console.log('🔄 Auto-advance check for procurement_planning stage');
                        setAutoAdvanceAvailable(false);
                        setNextStage(null);
                        setAutoAdvanceReason('Waiting for procurement planning to complete before starting production.');
                    } else if (project.status === 'in_production') {
                        // Handle in_production stage - check if production is complete
                        console.log('🔄 Auto-advance check for in_production stage');
                        setAutoAdvanceAvailable(false);
                        setNextStage(null);
                        setAutoAdvanceReason('Production in progress. Waiting for completion before shipping.');
                    } else if (project.status === 'inquiry_received') {
                        // Handle inquiry_received stage - check if technical review is ready
                        console.log('🔄 Auto-advance check for inquiry_received stage');
                        setAutoAdvanceAvailable(false);
                        setNextStage(null);
                        setAutoAdvanceReason('Inquiry received. Waiting for technical review to begin.');
                    } else {
                        // Use default workflow validator for other stages (fallback)
                        console.log('🔄 Auto-advance check: Using default workflow validator for stage:', project.status);
                        const result = await WorkflowValidator.checkAndAutoAdvance(project);
                        setAutoAdvanceAvailable(result.shouldAdvance);
                        setNextStage(result.nextStage);
                        setAutoAdvanceReason(result.reason);
                    }
                } catch (error) {
                    console.error('Error checking auto-advance:', error);
                    setAutoAdvanceAvailable(false);
                    setNextStage(null);
                    setAutoAdvanceReason('Error checking auto-advance conditions.');
                } finally {
                    setIsChecking(false);
                }
            };

            performCheck();
        }, 100); // 100ms delay to prevent rapid successive calls

        // Cleanup timeout on unmount or dependency change
        return () => clearTimeout(timeoutId);
    }, [project.status, project.updated_at, project.id, isChecking, getOverallReviewStatus, getReviewSummary]);

    return {
        isChecking,
        autoAdvanceAvailable,
        nextStage,
        autoAdvanceReason,
        checkAutoAdvance,
        executeAutoAdvance
    };
}
