import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    User,
    Calendar,
    Edit,
    Eye,
    RefreshCw
} from 'lucide-react';
import { InternalReview, Department, ReviewStatus, STATUS_COLORS } from '@/types/review';
import { format } from 'date-fns';
import { useUserDisplayName } from '@/features/customer-management/hooks/useUsers';
import { prerequisiteChecker } from '@/services/prerequisiteChecker';
import { Project, WorkflowStage } from '@/types/project';
import { workflowStageService } from '@/services/workflowStageService';
import { BaseStageView } from './stage-views/BaseStageView';

// Import all stage view components
import { InquiryReceivedView } from './stage-views/InquiryReceivedView';
import { TechnicalReviewView } from './stage-views/TechnicalReviewView';
import { SupplierRFQView } from './stage-views/SupplierRFQView';
import { QuotedView } from './stage-views/QuotedView';
import { OrderConfirmedView } from './stage-views/OrderConfirmedView';
import { ProcurementPlanningView } from './stage-views/ProcurementPlanningView';
import { ProductionView } from './stage-views/ProductionView';
import { CompletedView } from './stage-views/CompletedView';

// Extended InternalReview type to include reviewer data from database joins
interface ExtendedInternalReview extends InternalReview {
    reviewer?: {
        name: string;
        email: string;
        role: string;
    };
}

interface ReviewListProps {
    projectId: string;
    project?: Project;
    onEditReview: (review: InternalReview) => void;
    onViewReview: (review: InternalReview) => void;
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

export function ReviewList({ projectId, project, reviews, onEditReview, onViewReview }: ReviewListProps & { reviews: ExtendedInternalReview[] }) {
    // Collect all unique reviewer IDs for reference (no longer using useUsers)
    const reviewerIds = reviews ? [...new Set(reviews.map(review => review.reviewer_id).filter(Boolean))] : [];

    // Prerequisite validation state
    const [validation, setValidation] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStage, setCurrentStage] = useState<WorkflowStage | null>(null);
    const [nextStage, setNextStage] = useState<WorkflowStage | null>(null);

    // Load prerequisite validation when component mounts or project changes
    useEffect(() => {
        if (project) {
            validatePrerequisites();
            loadStages();
        }
    }, [project]);

    const loadStages = async () => {
        if (!project?.current_stage_id) return;

        try {
            // Get all workflow stages
            const stages = await workflowStageService.getWorkflowStages();

            // Find current stage
            const currentStageData = stages.find(s => s.id === project.current_stage_id);
            setCurrentStage(currentStageData || null);

            // Find next stage
            if (currentStageData) {
                const nextStageData = stages.find(s => s.stage_order === currentStageData.stage_order + 1);
                setNextStage(nextStageData || null);
            }
        } catch (error) {
            console.error('Error loading stages:', error);
        }
    };

    const validatePrerequisites = async () => {
        if (!project || !nextStage) return;

        try {
            setIsLoading(true);
            setError(null);

            // Perform prerequisite checks
            const result = await prerequisiteChecker.checkPrerequisites(
                project,
                nextStage
            );

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
        if (!project || !currentStage || !validation) return null;

        const StageViewComponent = StageViewComponents[currentStage.name];
        if (!StageViewComponent) {
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

        return (
            <StageViewComponent
                project={project}
                currentStage={currentStage}
                nextStage={nextStage}
                validation={validation}
            />
        );
    };

    if (reviews.length === 0) {
        return (
            <div className="space-y-6">
                {/* Prerequisite Validation Section */}
                {project && renderStageView()}

                {/* No Reviews Section */}
                <Card>
                    <CardContent className="text-center py-8">
                        <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                        <p className="text-muted-foreground">
                            Reviews will appear here once they are submitted by the respective departments
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Prerequisite Validation Section */}
            {project && renderStageView()}

            {/* Reviews Section */}
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
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onViewReview(review)}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEditReview(review)}
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}