import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    User,
    Calendar,
    Edit,
    Eye,
    RefreshCw,
    FileText,
    Users,
    Settings,
    BarChart3,
    Activity
} from 'lucide-react';
import { InternalReview, Department, ReviewStatus, STATUS_COLORS } from '@/types/review';
import { format } from 'date-fns';
import { useUserDisplayName } from '@/features/customer-management/hooks/useUsers';
import { prerequisiteChecker } from '@/services/prerequisiteChecker';
import { Project, WorkflowStage } from '@/types/project';
import { workflowStageService } from '@/services/workflowStageService';

// Import all stage view components
import { InquiryReceivedView } from './stage-views/InquiryReceivedView';
import { TechnicalReviewView } from './stage-views/TechnicalReviewView';
import { SupplierRFQView } from './stage-views/SupplierRFQView';
import { QuotedView } from './stage-views/QuotedView';
import { OrderConfirmedView } from './stage-views/OrderConfirmedView';
import { ProcurementPlanningView } from './stage-views/ProcurementPlanningView';
import { ProductionView } from './stage-views/ProductionView';
import { CompletedView } from './stage-views/CompletedView';
import { BaseStageView } from './stage-views/BaseStageView';

// Extended InternalReview type to include reviewer data from database joins
interface ExtendedInternalReview extends InternalReview {
    reviewer?: {
        name: string;
        email: string;
        role: string;
    };
}

interface StageReviewProps {
    projectId: string;
    project?: Project;
    reviews?: ExtendedInternalReview[];
    onEditReview?: (review: InternalReview) => void;
    onViewReview?: (review: InternalReview) => void;
    onAddReview?: (department: Department) => void;
    onAssignReview?: () => void;
    onConfigureReview?: () => void;
    className?: string;
}

// Map stage names to their corresponding view components
const StageViewComponents: Record<string, React.ComponentType<any>> = {
    'Inquiry Received': InquiryReceivedView,
    'Technical Review': TechnicalReviewView,
    'Supplier RFQ': SupplierRFQView,
    'Quoted': QuotedView,
    'Order Confirmed': OrderConfirmedView,
    'Procurement Planning': ProcurementPlanningView,
    'In Production': ProductionView,
    'Shipped & Closed': CompletedView,
};

// Helper component to display reviewer name
function ReviewerDisplay({ reviewerId, reviewer }: { reviewerId?: string; reviewer?: { name: string; email: string; role: string } }) {
    // Use the reviewer data if available (from database join), otherwise fall back to hook
    if (reviewer?.name && reviewerId) {
        return <>{reviewer.name}</>;
    }

    if (reviewerId) {
        const displayName = useUserDisplayName(reviewerId);
        return <>{displayName}</>;
    }

    return <>Unassigned</>;
}

export function StageReview({
    projectId,
    project,
    reviews = [],
    onEditReview,
    onViewReview,
    onAddReview,
    onAssignReview,
    onConfigureReview,
    className
}: StageReviewProps) {
    // Prerequisite validation state
    const [validation, setValidation] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStage, setCurrentStage] = useState<WorkflowStage | null>(null);
    const [nextStage, setNextStage] = useState<WorkflowStage | null>(null);

    // Load prerequisite validation when component mounts or project changes
    useEffect(() => {
        if (project) {
            loadStages();
        }
    }, [project]);

    const loadStages = async () => {
        console.log('loadStages: Starting to load stages', {
            projectId: project?.id,
            currentStageId: project?.current_stage_id
        });

        if (!project?.current_stage_id) {
            console.log('loadStages: No current_stage_id, skipping');
            return;
        }

        try {
            console.log('loadStages: Calling workflowStageService.getWorkflowStages()');
            // Get all workflow stages
            const stages = await workflowStageService.getWorkflowStages();
            console.log('loadStages: Received stages', {
                stagesCount: stages.length,
                stages: stages.map(s => ({ id: s.id, name: s.name, order: s.stage_order }))
            });

            // Find current stage
            const currentStageData = stages.find(s => s.id === project.current_stage_id);
            console.log('loadStages: Current stage found', {
                currentStage: currentStageData ? { id: currentStageData.id, name: currentStageData.name } : null
            });
            setCurrentStage(currentStageData || null);

            // Find next stage
            if (currentStageData) {
                const nextStageData = stages.find(s => s.stage_order === currentStageData.stage_order + 1);
                console.log('loadStages: Next stage found', {
                    nextStage: nextStageData ? { id: nextStageData.id, name: nextStageData.name, order: nextStageData.stage_order } : null,
                    currentOrder: currentStageData.stage_order
                });
                setNextStage(nextStageData || null);

                // Now that we have the next stage, validate prerequisites
                if (nextStageData) {
                    console.log('loadStages: Calling validatePrerequisites with nextStageData');
                    await validatePrerequisitesWithData(project, nextStageData);
                } else {
                    console.log('loadStages: No next stage found, skipping validation');
                }
            } else {
                console.log('loadStages: No current stage found, skipping validation');
            }
        } catch (error) {
            console.error('loadStages: Error loading stages:', error);
        }
    };

    const validatePrerequisites = async () => {
        console.log('validatePrerequisites: Starting validation', {
            hasProject: !!project,
            hasNextStage: !!nextStage,
            nextStageName: nextStage?.name
        });

        if (!project || !nextStage) {
            console.log('validatePrerequisites: Missing project or nextStage, skipping validation');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            console.log('validatePrerequisites: Calling prerequisiteChecker', {
                projectId: project.id,
                nextStageId: nextStage.id
            });

            // Perform prerequisite checks
            const result = await prerequisiteChecker.checkPrerequisites(
                project,
                nextStage
            );

            console.log('validatePrerequisites: Validation result', {
                result: result,
                checksCount: result?.checks?.length || 0
            });

            setValidation(result);
        } catch (err) {
            console.error('Error validating prerequisites:', err);
            setError('Failed to validate prerequisites');
        } finally {
            setIsLoading(false);
        }
    };

    const validatePrerequisitesWithData = async (projectData: Project, nextStageData: WorkflowStage) => {
        console.log('validatePrerequisitesWithData: Starting validation', {
            hasProject: !!projectData,
            hasNextStage: !!nextStageData,
            nextStageName: nextStageData?.name
        });

        try {
            setIsLoading(true);
            setError(null);

            console.log('validatePrerequisitesWithData: Calling prerequisiteChecker', {
                projectId: projectData.id,
                nextStageId: nextStageData.id
            });

            // Perform prerequisite checks
            const result = await prerequisiteChecker.checkPrerequisites(
                projectData,
                nextStageData
            );

            console.log('validatePrerequisitesWithData: Validation result', {
                result: result,
                checksCount: result?.checks?.length || 0
            });

            setValidation(result);
        } catch (err) {
            console.error('Error validating prerequisites:', err);
            setError('Failed to validate prerequisites');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        validatePrerequisites();
    };

    const getStatusIcon = (status: ReviewStatus) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'revision_requested':
                return <AlertTriangle className="w-4 h-4 text-orange-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusLabel = (status: ReviewStatus) => {
        switch (status) {
            case 'approved':
                return 'Approved';
            case 'rejected':
                return 'Rejected';
            case 'revision_requested':
                return 'Revision Requested';
            default:
                return 'Pending';
        }
    };

    const getDepartmentIcon = (department: Department) => {
        switch (department) {
            case 'Engineering':
                return '⚙️';
            case 'QA':
                return '🔍';
            case 'Production':
                return '🏭';
            default:
                return '📋';
        }
    };

    // Render the appropriate stage view component based on current stage
    const renderStageView = () => {
        if (!project || !currentStage) {
            console.log('StageReview: Missing project or currentStage', { project: !!project, currentStage: !!currentStage });
            return (
                <div className="p-4 text-center text-muted-foreground">
                    <p>Loading stage information...</p>
                </div>
            );
        }

        if (!validation) {
            console.log('StageReview: Missing validation data', { currentStage: currentStage.name });
            // Create a minimal validation object to allow the stage view to render
            const minimalValidation = {
                checks: [],
                allPassed: false,
                requiredPassed: false,
                warnings: [],
                blockers: []
            };
            console.log('StageReview: Using minimal validation to render stage view');

            const StageViewComponent = StageViewComponents[currentStage.name];
            if (StageViewComponent) {
                return (
                    <StageViewComponent
                        project={project}
                        currentStage={currentStage}
                        nextStage={nextStage}
                        validation={minimalValidation}
                    />
                );
            }

            return (
                <div className="p-4 text-center text-muted-foreground">
                    <p>Loading prerequisite validation...</p>
                </div>
            );
        }

        console.log('StageReview: Rendering stage view', {
            stageName: currentStage.name,
            hasComponent: !!StageViewComponents[currentStage.name],
            availableComponents: Object.keys(StageViewComponents)
        });

        const StageViewComponent = StageViewComponents[currentStage.name];
        if (!StageViewComponent) {
            console.log('StageReview: No specific component found, using BaseStageView', { stageName: currentStage.name });
            // Fallback to BaseStageView if specific component not found
            return (
                <BaseStageView
                    project={project}
                    currentStage={currentStage}
                    nextStage={nextStage}
                    validation={validation}
                    isLoading={isLoading}
                    error={error}
                    onRefresh={handleRefresh}
                />
            );
        }

        console.log('StageReview: Rendering specific stage component', { stageName: currentStage.name });
        return (
            <StageViewComponent
                project={project}
                currentStage={currentStage}
                nextStage={nextStage}
                validation={validation}
            />
        );
    };

    // Get review statistics
    const getReviewStats = () => {
        const totalReviews = reviews.length;
        const approvedReviews = reviews.filter(r => r.status === 'approved').length;
        const pendingReviews = reviews.filter(r => r.status === 'pending').length;
        const rejectedReviews = reviews.filter(r => r.status === 'rejected').length;

        return {
            total: totalReviews,
            approved: approvedReviews,
            pending: pendingReviews,
            rejected: rejectedReviews,
            completionRate: totalReviews > 0 ? Math.round((approvedReviews / totalReviews) * 100) : 0
        };
    };

    const stats = getReviewStats();

    return (
        <div className={`space-y-6 ${className || ''}`}>
            {/* Stage Overview and Prerequisites */}
            {project && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Current Stage: {currentStage?.name || 'Unknown'}
                            </CardTitle>
                            <div className="flex gap-2">
                                {onAssignReview && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onAssignReview}
                                    >
                                        <Users className="w-4 h-4 mr-2" />
                                        Assign
                                    </Button>
                                )}
                                {onConfigureReview && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onConfigureReview}
                                    >
                                        <Settings className="w-4 h-4 mr-2" />
                                        Configure
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {renderStageView()}
                    </CardContent>
                </Card>
            )}


        </div>
    );
}
