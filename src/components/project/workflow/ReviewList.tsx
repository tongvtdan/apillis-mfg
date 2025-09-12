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
    AlertCircle,
    FileText,
    Users,
    Settings,
    Database,
    RefreshCw
} from 'lucide-react';
import { InternalReview, Department, ReviewStatus, STATUS_COLORS } from '@/types/review';
import { format } from 'date-fns';
import { useUserDisplayName } from '@/features/customer-management/hooks/useUsers';
import { prerequisiteChecker } from '@/services/prerequisiteChecker';
import { Project, WorkflowStage } from '@/types/project';
import { workflowStageService } from '@/services/workflowStageService';
import { DocumentValidationPanel } from '../documents/DocumentValidationPanel';

interface ReviewListProps {
    projectId: string;
    project?: Project;
    onEditReview: (review: InternalReview) => void;
    onViewReview: (review: InternalReview) => void;
}

// Helper component to display reviewer name
function ReviewerDisplay({ reviewerId, reviewer }: { reviewerId: string; reviewer?: { name: string; email: string; role: string } }) {
    // Use the reviewer data if available (from database join), otherwise fall back to hook
    if (reviewer?.name) {
        return <>{reviewer.name}</>;
    }

    const displayName = useUserDisplayName(reviewerId);
    return <>{displayName}</>;
}

export function ReviewList({ projectId, project, reviews, onEditReview, onViewReview }: ReviewListProps & { reviews: InternalReview[] }) {
    // Collect all unique reviewer IDs for reference (no longer using useUsers)
    const reviewerIds = reviews ? [...new Set(reviews.map(review => review.reviewer_id).filter(Boolean))] : [];
    
    // Prerequisite validation state
    const [validation, setValidation] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load prerequisite validation when component mounts or project changes
    useEffect(() => {
        if (project) {
            validatePrerequisites();
        }
    }, [project]);

    const validatePrerequisites = async () => {
        if (!project) return;
        
        try {
            setIsLoading(true);
            setError(null);
            
            // Get next possible stage for validation
            const nextStage = await getNextStage();
            if (!nextStage) {
                setValidation(null);
                return;
            }
            
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

    const getNextStage = async (): Promise<WorkflowStage | null> => {
        if (!project?.current_stage_id) return null;
        
        try {
            // Get all workflow stages
            const stages = await workflowStageService.getWorkflowStages();
            
            // Find current stage
            const currentStage = stages.find(s => s.id === project.current_stage_id);
            if (!currentStage) return null;
            
            // Find next stage
            const nextStage = stages.find(s => s.stage_order === currentStage.stage_order + 1);
            return nextStage || null;
        } catch (error) {
            console.error('Error getting next stage:', error);
            return null;
        }
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

    const getOverallStatus = () => {
        if (!validation) return null;

        if (validation.requiredPassed) {
            return {
                icon: <CheckCircle className="w-5 h-5 text-green-600" />,
                text: 'Ready for Next Stage',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200'
            };
        }

        if (validation.blockers.length > 0) {
            return {
                icon: <XCircle className="w-5 h-5 text-red-600" />,
                text: 'Not Ready for Next Stage',
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200'
            };
        }

        return {
            icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
            text: 'Partially Ready',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200'
        };
    };

    const getCompletionPercentage = () => {
        if (!validation) return 0;

        const requiredChecks = validation.checks.filter((c: any) => c.required);
        if (requiredChecks.length === 0) return 100;

        const passedChecks = requiredChecks.filter((c: any) => c.status === 'passed').length;
        return Math.round((passedChecks / requiredChecks.length) * 100);
    };

    const status = getOverallStatus();
    const completionPercentage = getCompletionPercentage();

    if (reviews.length === 0) {
        return (
            <div className="space-y-6">
                {/* Prerequisite Validation Section */}
                {project && (
                    <Card className={`${status?.borderColor || 'border-muted'}`}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Prerequisite Validation
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={validatePrerequisites}
                                    disabled={isLoading}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            
                            {isLoading && !validation && (
                                <div className="flex items-center justify-center py-8">
                                    <Clock className="w-6 h-6 animate-spin mr-2" />
                                    <span>Validating prerequisites...</span>
                                </div>
                            )}
                            
                            {validation && (
                                <div className="space-y-4">
                                    {/* Overall Status */}
                                    {status && (
                                        <div className={`flex items-center justify-between p-3 rounded-lg ${status.bgColor}`}>
                                            <div className="flex items-center gap-2">
                                                {status.icon}
                                                <span className={`font-medium ${status.color}`}>
                                                    {status.text}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Progress value={completionPercentage} className="w-20 h-2" />
                                                <span className="text-sm font-medium">
                                                    {completionPercentage}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Prerequisite Checks */}
                                    <Tabs defaultValue="summary">
                                        <TabsList className="grid w-full grid-cols-6">
                                            <TabsTrigger value="summary">Summary</TabsTrigger>
                                            <TabsTrigger value="documents">Documents</TabsTrigger>
                                            <TabsTrigger value="project_data">Project Data</TabsTrigger>
                                            <TabsTrigger value="approvals">Approvals</TabsTrigger>
                                            <TabsTrigger value="stage_specific">Stage Specific</TabsTrigger>
                                            <TabsTrigger value="system">System</TabsTrigger>
                                        </TabsList>
                                        
                                        <TabsContent value="summary" className="space-y-3 mt-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center p-4 border rounded-lg">
                                                    <div className="text-2xl font-bold text-green-600">
                                                        {validation.checks.filter((c: any) => c.status === 'passed').length}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">Passed</div>
                                                </div>
                                                <div className="text-center p-4 border rounded-lg">
                                                    <div className="text-2xl font-bold text-red-600">
                                                        {validation.checks.filter((c: any) => c.status === 'failed').length}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">Failed</div>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                {validation.checks.map((check: any) => (
                                                    <div key={check.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                                        {check.status === 'passed' ? (
                                                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                                        ) : check.status === 'failed' ? (
                                                            <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                                        ) : (
                                                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h5 className={`font-medium text-sm ${
                                                                    check.status === 'passed' ? 'text-green-600' : 
                                                                    check.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                                                                }`}>
                                                                    {check.name}
                                                                </h5>
                                                                {check.required && (
                                                                    <Badge variant="outline" className="text-xs">Required</Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mb-1">{check.description}</p>
                                                            {check.details && (
                                                                <p className="text-xs text-muted-foreground italic">{check.details}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </TabsContent>
                                        
                                        {/* Documents Tab - Enhanced with DocumentValidationPanel */}
                                        <TabsContent value="documents" className="space-y-3 mt-4">
                                            {project.current_stage_id && validation.checks.find((c: any) => c.category === 'documents') && (
                                                <DocumentValidationPanel
                                                    projectId={project.id}
                                                    currentStage={{ id: project.current_stage_id, name: 'Current Stage', stage_order: 0, organization_id: project.organization_id }}
                                                    targetStage={{ id: 'next', name: 'Next Stage', stage_order: 0, organization_id: project.organization_id }}
                                                />
                                            )}
                                        </TabsContent>
                                        
                                        {/* Other tabs */}
                                        {['project_data', 'approvals', 'stage_specific', 'system'].map(category => (
                                            <TabsContent key={category} value={category} className="space-y-3 mt-4">
                                                {validation.checks
                                                    .filter((check: any) => check.category === category)
                                                    .map((check: any) => (
                                                        <div key={check.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                                            {check.status === 'passed' ? (
                                                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                                            ) : check.status === 'failed' ? (
                                                                <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                                            ) : (
                                                                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <h5 className={`font-medium text-sm ${
                                                                        check.status === 'passed' ? 'text-green-600' : 
                                                                        check.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                                                                    }`}>
                                                                        {check.name}
                                                                    </h5>
                                                                    {check.required && (
                                                                        <Badge variant="outline" className="text-xs">Required</Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mb-1">{check.description}</p>
                                                                {check.details && (
                                                                    <p className="text-xs text-muted-foreground italic">{check.details}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                {validation.checks.filter((check: any) => check.category === category).length === 0 && (
                                                    <div className="text-center py-4 text-muted-foreground">
                                                        No {category.replace('_', ' ')} checks required for this transition
                                                    </div>
                                                )}
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
                
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
            {project && (
                <Card className={`${status?.borderColor || 'border-muted'}`}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Prerequisite Validation
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={validatePrerequisites}
                                disabled={isLoading}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        {isLoading && !validation && (
                            <div className="flex items-center justify-center py-8">
                                <Clock className="w-6 h-6 animate-spin mr-2" />
                                <span>Validating prerequisites...</span>
                            </div>
                        )}
                        
                        {validation && (
                            <div className="space-y-4">
                                {/* Overall Status */}
                                {status && (
                                    <div className={`flex items-center justify-between p-3 rounded-lg ${status.bgColor}`}>
                                        <div className="flex items-center gap-2">
                                            {status.icon}
                                            <span className={`font-medium ${status.color}`}>
                                                {status.text}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <Progress value={completionPercentage} className="w-20 h-2" />
                                            <span className="text-sm font-medium">
                                                {completionPercentage}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Prerequisite Checks */}
                                <Tabs defaultValue="summary">
                                    <TabsList className="grid w-full grid-cols-6">
                                        <TabsTrigger value="summary">Summary</TabsTrigger>
                                        <TabsTrigger value="documents">Documents</TabsTrigger>
                                        <TabsTrigger value="project_data">Project Data</TabsTrigger>
                                        <TabsTrigger value="approvals">Approvals</TabsTrigger>
                                        <TabsTrigger value="stage_specific">Stage Specific</TabsTrigger>
                                        <TabsTrigger value="system">System</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="summary" className="space-y-3 mt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center p-4 border rounded-lg">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {validation.checks.filter((c: any) => c.status === 'passed').length}
                                                </div>
                                                <div className="text-sm text-muted-foreground">Passed</div>
                                            </div>
                                            <div className="text-center p-4 border rounded-lg">
                                                <div className="text-2xl font-bold text-red-600">
                                                    {validation.checks.filter((c: any) => c.status === 'failed').length}
                                                </div>
                                                <div className="text-sm text-muted-foreground">Failed</div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            {validation.checks.map((check: any) => (
                                                <div key={check.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                                    {check.status === 'passed' ? (
                                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                                    ) : check.status === 'failed' ? (
                                                        <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                                    ) : (
                                                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h5 className={`font-medium text-sm ${
                                                                check.status === 'passed' ? 'text-green-600' : 
                                                                check.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                                                            }`}>
                                                                {check.name}
                                                            </h5>
                                                            {check.required && (
                                                                <Badge variant="outline" className="text-xs">Required</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mb-1">{check.description}</p>
                                                        {check.details && (
                                                            <p className="text-xs text-muted-foreground italic">{check.details}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                    
                                    {/* Documents Tab - Enhanced with DocumentValidationPanel */}
                                    <TabsContent value="documents" className="space-y-3 mt-4">
                                        {project.current_stage_id && validation.checks.find((c: any) => c.category === 'documents') && (
                                            <DocumentValidationPanel
                                                projectId={project.id}
                                                currentStage={{ id: project.current_stage_id, name: 'Current Stage', stage_order: 0, organization_id: project.organization_id }}
                                                targetStage={{ id: 'next', name: 'Next Stage', stage_order: 0, organization_id: project.organization_id }}
                                            />
                                        )}
                                    </TabsContent>
                                    
                                    {/* Other tabs */}
                                    {['project_data', 'approvals', 'stage_specific', 'system'].map(category => (
                                        <TabsContent key={category} value={category} className="space-y-3 mt-4">
                                            {validation.checks
                                                .filter((check: any) => check.category === category)
                                                .map((check: any) => (
                                                    <div key={check.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                                        {check.status === 'passed' ? (
                                                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                                        ) : check.status === 'failed' ? (
                                                            <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                                        ) : (
                                                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h5 className={`font-medium text-sm ${
                                                                    check.status === 'passed' ? 'text-green-600' : 
                                                                    check.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                                                                }`}>
                                                                    {check.name}
                                                                </h5>
                                                                {check.required && (
                                                                    <Badge variant="outline" className="text-xs">Required</Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mb-1">{check.description}</p>
                                                            {check.details && (
                                                                <p className="text-xs text-muted-foreground italic">{check.details}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            {validation.checks.filter((check: any) => check.category === category).length === 0 && (
                                                <div className="text-center py-4 text-muted-foreground">
                                                    No {category.replace('_', ' ')} checks required for this transition
                                                </div>
                                            )}
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
            
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