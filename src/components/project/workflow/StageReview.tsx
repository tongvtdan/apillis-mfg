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

            {/* Review Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Review Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 border rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                            <div className="text-sm text-muted-foreground">Total Reviews</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                            <div className="text-sm text-muted-foreground">Approved</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <div className="text-sm text-muted-foreground">Pending</div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                            <div className="text-sm text-muted-foreground">Rejected</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>Overall Completion</span>
                            <span className="font-medium">{stats.completionRate}%</span>
                        </div>
                        <Progress value={stats.completionRate} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            {/* Reviews Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Stage Reviews
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="reviews" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="reviews">Reviews</TabsTrigger>
                            <TabsTrigger value="actions">Actions</TabsTrigger>
                            <TabsTrigger value="summary">Summary</TabsTrigger>
                        </TabsList>

                        <TabsContent value="reviews" className="space-y-4 mt-4">
                            {reviews.length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                                    <p className="text-muted-foreground">
                                        Reviews will appear here once they are submitted by the respective departments
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <Card key={review.id} className="hover:shadow-md transition-shadow">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{getDepartmentIcon(review.department)}</span>
                                                        <div>
                                                            <CardTitle className="text-base">{review.department} Review</CardTitle>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <User className="w-4 h-4" />
                                                                <ReviewerDisplay reviewerId={review.reviewer_id} reviewer={review.reviewer} />
                                                                {review.submitted_at && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <Calendar className="w-4 h-4" />
                                                                        <span>{format(new Date(review.submitted_at), 'MMM dd, yyyy HH:mm')}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Badge className={STATUS_COLORS[review.status]}>
                                                            <div className="flex items-center gap-1">
                                                                {getStatusIcon(review.status)}
                                                                {getStatusLabel(review.status)}
                                                            </div>
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="pt-0">
                                                {review.feedback && (
                                                    <div className="mb-4">
                                                        <h4 className="font-medium text-sm mb-2">Feedback</h4>
                                                        <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                                                            {review.feedback}
                                                        </p>
                                                    </div>
                                                )}

                                                {review.suggestions && review.suggestions.length > 0 && (
                                                    <div className="mb-4">
                                                        <h4 className="font-medium text-sm mb-2">Suggestions</h4>
                                                        <ul className="space-y-1">
                                                            {review.suggestions.map((suggestion, index) => (
                                                                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                                                    <span className="text-primary mt-1">•</span>
                                                                    <span>{suggestion}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                <Separator className="my-3" />

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>Created: {format(new Date(review.created_at), 'MMM dd, yyyy')}</span>
                                                        {review.updated_at !== review.created_at && (
                                                            <>
                                                                <span>•</span>
                                                                <span>Updated: {format(new Date(review.updated_at), 'MMM dd, yyyy')}</span>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        {onViewReview && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => onViewReview(review)}
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                View
                                                            </Button>
                                                        )}
                                                        {onEditReview && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => onEditReview(review)}
                                                            >
                                                                <Edit className="w-4 h-4 mr-1" />
                                                                Edit
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="actions" className="space-y-4 mt-4">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Quick Actions</h3>

                                {/* Add Review Buttons */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {(['Engineering', 'QA', 'Production'] as Department[]).map((department) => {
                                        const existingReview = reviews.find(r => r.department === department);
                                        return (
                                            <Button
                                                key={department}
                                                variant={existingReview ? "outline" : "default"}
                                                className="h-auto p-4 flex flex-col items-center gap-2"
                                                onClick={() => onAddReview?.(department)}
                                            >
                                                <span className="text-2xl">{getDepartmentIcon(department)}</span>
                                                <span className="text-sm">
                                                    {existingReview ? `Update ${department}` : `Add ${department}`}
                                                </span>
                                            </Button>
                                        );
                                    })}
                                </div>

                                {/* Additional Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleRefresh}
                                        disabled={isLoading}
                                    >
                                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                        Refresh Validation
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="summary" className="space-y-4 mt-4">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Review Summary</h3>

                                {/* Stage Information */}
                                {currentStage && (
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-medium mb-2">Current Stage Information</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Stage:</span>
                                                <span>{currentStage.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Order:</span>
                                                <span>{currentStage.stage_order}</span>
                                            </div>
                                            {currentStage.exit_criteria && (
                                                <div className="mt-2">
                                                    <span className="text-muted-foreground">Exit Criteria:</span>
                                                    <p className="text-sm mt-1">{currentStage.exit_criteria}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Next Stage Information */}
                                {nextStage && (
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-medium mb-2">Next Stage Information</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Next Stage:</span>
                                                <span>{nextStage.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Order:</span>
                                                <span>{nextStage.stage_order}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Validation Summary */}
                                {validation && (
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-medium mb-2">Prerequisite Validation</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Total Checks:</span>
                                                <span>{validation.checks?.length || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Passed:</span>
                                                <span className="text-green-600">
                                                    {validation.checks?.filter((c: any) => c.status === 'passed').length || 0}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Failed:</span>
                                                <span className="text-red-600">
                                                    {validation.checks?.filter((c: any) => c.status === 'failed').length || 0}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Ready for Next Stage:</span>
                                                <span className={validation.requiredPassed ? 'text-green-600' : 'text-red-600'}>
                                                    {validation.requiredPassed ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
