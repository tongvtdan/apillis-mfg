import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Modal } from '@/components/ui/modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    FileText,
    Users,
    Clock,
    Target,
    MessageSquare,
    CheckCircle2,
    UserPlus,
    Eye,
    Play,
    Pause,
    RotateCcw,
    X,
    Check,
    Loader2
} from 'lucide-react';
import { DocumentValidationPanel } from '../../documents/DocumentValidationPanel';
import { Project, WorkflowStage } from '@/types/project';

interface InquiryReceivedViewProps {
    project: Project;
    currentStage: WorkflowStage;
    nextStage?: WorkflowStage;
    validation: any;
}

// Stage 1 Review Steps based on documentation
const STAGE_1_REVIEW_STEPS = [
    {
        order: 1,
        name: 'RFQ Documentation Review',
        slug: 'rfq_documentation_review',
        description: 'Review and validate all customer RFQ documents and requirements',
        responsibleRoles: ['sales', 'procurement'],
        duration: 2,
        required: true,
        canSkip: false,
        autoAdvance: false,
        requiresApproval: false,
        icon: FileText,
        color: 'text-blue-600',
        status: 'wait_for_review', // wait_for_review, in_reviewing, done
        assignedTo: null,
        assignedPersonnel: null
    },
    {
        order: 2,
        name: 'Initial Feasibility Assessment',
        slug: 'initial_feasibility_assessment',
        description: 'Quick assessment of project feasibility and resource availability',
        responsibleRoles: ['sales', 'engineering'],
        duration: 4,
        required: true,
        canSkip: false,
        autoAdvance: false,
        requiresApproval: false,
        icon: Target,
        color: 'text-green-600',
        status: 'wait_for_review',
        assignedTo: null,
        assignedPersonnel: null
    },
    {
        order: 3,
        name: 'Customer Requirements Clarification',
        slug: 'customer_requirements_clarification',
        description: 'Contact customer to clarify any unclear requirements or missing information',
        responsibleRoles: ['sales'],
        duration: 3,
        required: false,
        canSkip: true,
        autoAdvance: false,
        requiresApproval: false,
        icon: MessageSquare,
        color: 'text-orange-600',
        status: 'wait_for_review',
        assignedTo: null,
        assignedPersonnel: null
    }
];

export const InquiryReceivedView: React.FC<InquiryReceivedViewProps> = ({
    project,
    currentStage,
    nextStage,
    validation
}) => {
    console.log('InquiryReceivedView: Component rendered', {
        projectId: project?.id,
        currentStage: currentStage?.name,
        nextStage: nextStage?.name,
        hasValidation: !!validation,
        validationChecks: validation?.checks?.length || 0
    });

    // State for managing review step status and assignments
    const [reviewSteps, setReviewSteps] = useState(STAGE_1_REVIEW_STEPS);
    const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
    const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [assignmentNotes, setAssignmentNotes] = useState<string>('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [reviewData, setReviewData] = useState<{
        reviewStepSlug: string;
        comments: string;
        confirmed: boolean;
        reviewedDocuments: string[];
    }>({
        reviewStepSlug: '',
        comments: '',
        confirmed: false,
        reviewedDocuments: []
    });

    // Enhanced personnel data with more details
    const availablePersonnel = [
        { id: '1', name: 'John Smith', email: 'john.smith@company.com', role: 'sales', department: 'Sales', isActive: true },
        { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'procurement', department: 'Procurement', isActive: true },
        { id: '3', name: 'Mike Chen', email: 'mike.chen@company.com', role: 'engineering', department: 'Engineering', isActive: true },
        { id: '4', name: 'Lisa Wang', email: 'lisa.wang@company.com', role: 'qa', department: 'QA', isActive: true },
        { id: '5', name: 'David Lee', email: 'david.lee@company.com', role: 'production', department: 'Production', isActive: true },
        { id: '6', name: 'Emma Davis', email: 'emma.davis@company.com', role: 'management', department: 'Management', isActive: true },
    ];

    // Mock documents for each review step
    const getReviewStepDocuments = (reviewStepSlug: string) => {
        const documents: Record<string, Array<{ id: string, name: string, type: string, url?: string }>> = {
            'rfq_documentation_review': [
                { id: '1', name: 'Customer RFQ Document', type: 'PDF', url: '/documents/rfq.pdf' },
                { id: '2', name: 'Technical Specifications', type: 'PDF', url: '/documents/specs.pdf' },
                { id: '3', name: 'Requirements Checklist', type: 'DOCX', url: '/documents/checklist.docx' }
            ],
            'initial_feasibility_assessment': [
                { id: '4', name: 'Resource Availability Report', type: 'PDF', url: '/documents/resources.pdf' },
                { id: '5', name: 'Capacity Analysis', type: 'XLSX', url: '/documents/capacity.xlsx' },
                { id: '6', name: 'Timeline Assessment', type: 'PDF', url: '/documents/timeline.pdf' }
            ],
            'customer_requirements_clarification': [
                { id: '7', name: 'Customer Communication Log', type: 'PDF', url: '/documents/communication.pdf' },
                { id: '8', name: 'Clarification Questions', type: 'DOCX', url: '/documents/questions.docx' },
                { id: '9', name: 'Updated Requirements', type: 'PDF', url: '/documents/updated-req.pdf' }
            ]
        };
        return documents[reviewStepSlug] || [];
    };

    // Helper functions for role-based filtering and UI
    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            sales: 'bg-blue-100 text-blue-800',
            procurement: 'bg-green-100 text-green-800',
            engineering: 'bg-purple-100 text-purple-800',
            qa: 'bg-orange-100 text-orange-800',
            production: 'bg-teal-100 text-teal-800',
            management: 'bg-red-100 text-red-800',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    const getFilteredPersonnel = (reviewStepSlug: string) => {
        const reviewStep = reviewSteps.find(s => s.slug === reviewStepSlug);
        if (!reviewStep || !reviewStep.responsibleRoles) {
            return availablePersonnel;
        }
        return availablePersonnel.filter(person =>
            reviewStep.responsibleRoles.includes(person.role)
        );
    };

    const getCurrentReviewStep = () => {
        if (!showAssignModal) return null;
        return reviewSteps.find(s => s.slug === showAssignModal);
    };
    const getSubStageStatus = (subStage: any) => {
        // This would typically come from the database/API
        // For now, we'll simulate based on validation checks
        const relatedChecks = validation.checks.filter((check: any) =>
            check.name.toLowerCase().includes(subStage.slug.replace(/_/g, ' ').toLowerCase()) ||
            check.description.toLowerCase().includes(subStage.slug.replace(/_/g, ' ').toLowerCase())
        );

        if (relatedChecks.length === 0) {
            return 'pending';
        }

        const allPassed = relatedChecks.every((check: any) => check.status === 'passed');
        const anyFailed = relatedChecks.some((check: any) => check.status === 'failed');

        if (allPassed) return 'completed';
        if (anyFailed) return 'failed';
        return 'in_progress';
    };

    const getReviewStepProgress = () => {
        const completed = reviewSteps.filter(reviewStep => reviewStep.status === 'done').length;
        return Math.round((completed / reviewSteps.length) * 100);
    };

    // Helper functions for status management
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'done':
                return <CheckCircle2 className="w-4 h-4 text-green-600" />;
            case 'in_reviewing':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'wait_for_review':
                return <Pause className="w-4 h-4 text-gray-400" />;
            default:
                return <AlertTriangle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'done':
                return 'Done';
            case 'in_reviewing':
                return 'In Reviewing';
            case 'wait_for_review':
                return 'Wait for Review';
            default:
                return 'Unknown';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'in_reviewing':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'wait_for_review':
                return 'text-gray-600 bg-gray-50 border-gray-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    // Action handlers
    const handleAssign = (reviewStepSlug: string) => {
        console.log('Assigning review step:', reviewStepSlug);
        setShowAssignModal(reviewStepSlug);
    };

    const handleReview = (reviewStepSlug: string) => {
        console.log('Starting review for review step:', reviewStepSlug);
        setReviewData({
            reviewStepSlug,
            comments: '',
            confirmed: false,
            reviewedDocuments: []
        });
        setShowReviewModal(reviewStepSlug);
    };

    const handleStatusChange = (reviewStepSlug: string, newStatus: string) => {
        setReviewSteps(prev => prev.map(reviewStep =>
            reviewStep.slug === reviewStepSlug
                ? { ...reviewStep, status: newStatus }
                : reviewStep
        ));
    };

    const handleAssignmentConfirm = async () => {
        if (!selectedUserId || !showAssignModal) return;

        try {
            setIsAssigning(true);
            const personnel = availablePersonnel.find(p => p.id === selectedUserId);

            if (personnel) {
                setReviewSteps(prev => prev.map(reviewStep =>
                    reviewStep.slug === showAssignModal
                        ? {
                            ...reviewStep,
                            assignedTo: selectedUserId,
                            assignedPersonnel: personnel.name,
                            status: 'wait_for_review' // Keep as wait_for_review until review is started
                        }
                        : reviewStep
                ));

                console.log('Assignment completed:', {
                    reviewStep: showAssignModal,
                    personnel: personnel.name,
                    notes: assignmentNotes
                });
            }

            // Reset form and close modal
            setSelectedUserId('');
            setAssignmentNotes('');
            setShowAssignModal(null);
        } catch (error) {
            console.error('Error assigning review step:', error);
        } finally {
            setIsAssigning(false);
        }
    };

    const handleAssignCancel = () => {
        setSelectedUserId('');
        setAssignmentNotes('');
        setShowAssignModal(null);
    };

    const handleReviewConfirm = () => {
        if (!reviewData.confirmed) {
            alert('Please confirm that you have reviewed all required documents and information.');
            return;
        }

        // Mark the review step as done
        setReviewSteps(prev => prev.map(reviewStep =>
            reviewStep.slug === reviewData.reviewStepSlug
                ? { ...reviewStep, status: 'done' }
                : reviewStep
        ));

        // Reset review data and close modal
        setReviewData({
            reviewStepSlug: '',
            comments: '',
            confirmed: false,
            reviewedDocuments: []
        });
        setShowReviewModal(null);

        console.log('Review completed for review step:', reviewData.reviewStepSlug);
    };

    const handleDocumentReview = (documentId: string) => {
        setReviewData(prev => ({
            ...prev,
            reviewedDocuments: prev.reviewedDocuments.includes(documentId)
                ? prev.reviewedDocuments.filter(id => id !== documentId)
                : [...prev.reviewedDocuments, documentId]
        }));
    };

    const handleStartReview = (reviewStepSlug: string) => {
        setReviewSteps(prev => prev.map(reviewStep =>
            reviewStep.slug === reviewStepSlug
                ? { ...reviewStep, status: 'in_reviewing' }
                : reviewStep
        ));
    };

    return (
        <div className="space-y-6">
            {/* Stage 1 Exit Criteria */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Stage 1 Exit Criteria
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Exit Criteria for Inquiry Received</h4>
                        <p className="text-sm text-blue-700">
                            RFQ reviewed, customer requirements understood, initial feasibility assessment completed
                        </p>
                    </div>

                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Overall Progress</span>
                            <span className="text-sm text-muted-foreground">{getReviewStepProgress()}%</span>
                        </div>
                        <Progress value={getReviewStepProgress()} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            {/* Review Progress */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Review Progress
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {reviewSteps.map((reviewStep) => {
                            const IconComponent = reviewStep.icon;

                            return (
                                <div key={reviewStep.slug} className={`p-4 border rounded-lg ${getStatusColor(reviewStep.status)}`}>
                                    <div className="flex items-start gap-3">
                                        <IconComponent className={`w-5 h-5 mt-0.5 ${reviewStep.color}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-sm">{reviewStep.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(reviewStep.status)}
                                                    <Badge variant="outline" className="text-xs">
                                                        {getStatusLabel(reviewStep.status)}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {reviewStep.duration}h
                                                    </Badge>
                                                    {reviewStep.required && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Required
                                                        </Badge>
                                                    )}
                                                    {reviewStep.canSkip && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Optional
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-2">{reviewStep.description}</p>
                                            <div className="flex items-center gap-2 text-xs mb-3">
                                                <Users className="w-3 h-3" />
                                                <span>Responsible: {reviewStep.responsibleRoles.join(', ')}</span>
                                                {reviewStep.assignedPersonnel && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Assigned to: {reviewStep.assignedPersonnel}</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAssign(reviewStep.slug)}
                                                    className="h-8"
                                                >
                                                    <UserPlus className="w-3 h-3 mr-1" />
                                                    Assign
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleReview(reviewStep.slug)}
                                                    className="h-8"
                                                    disabled={reviewStep.status === 'wait_for_review'}
                                                >
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    Review
                                                </Button>
                                                {reviewStep.status === 'wait_for_review' && reviewStep.assignedPersonnel && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleStartReview(reviewStep.slug)}
                                                        className="h-8"
                                                    >
                                                        <Play className="w-3 h-3 mr-1" />
                                                        Start Review
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>


            {/* Enhanced Assignment Modal - CustomerModal Style */}
            <Modal
                isOpen={!!showAssignModal}
                onClose={handleAssignCancel}
                title={
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Assign Reviewer
                    </div>
                }
                description="Assign a team member to complete this review step with specific instructions and context."
                showDescription={true}
                maxWidth="max-w-[600px]"
            >
                <form onSubmit={(e) => { e.preventDefault(); handleAssignmentConfirm(); }} className="space-y-4">
                    {/* Review Step Information */}
                    {getCurrentReviewStep() && (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h4 className="font-medium text-sm mb-2">{getCurrentReviewStep()?.name}</h4>
                            <p className="text-xs text-muted-foreground mb-3">
                                {getCurrentReviewStep()?.description}
                            </p>

                            <div className="flex items-center gap-4 mb-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-gray-500" />
                                    <span className="text-xs text-muted-foreground">
                                        Estimated: {getCurrentReviewStep()?.duration} hours
                                    </span>
                                </div>
                            </div>

                            {getCurrentReviewStep()?.responsibleRoles && getCurrentReviewStep()?.responsibleRoles.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs text-muted-foreground">Responsible Roles:</span>
                                    {getCurrentReviewStep()?.responsibleRoles.map((role) => (
                                        <Badge key={role} variant="secondary" className="text-xs">
                                            {role}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Personnel Selection */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="user-select">Select Team Member *</Label>
                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger className="modal-form-input">
                                    <SelectValue placeholder="Choose a team member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getFilteredPersonnel(showAssignModal || '').map((person) => (
                                        <SelectItem key={person.id} value={person.id}>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    <span className="font-medium">{person.name}</span>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-xs ${getRoleColor(person.role)}`}
                                                >
                                                    {person.role}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Assignment Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="assignment-notes">Assignment Notes</Label>
                        <Textarea
                            id="assignment-notes"
                            placeholder="Add any specific instructions or context for this assignment..."
                            value={assignmentNotes}
                            onChange={(e) => setAssignmentNotes(e.target.value)}
                            rows={3}
                            className="modal-form-textarea"
                        />
                        <p className="text-xs text-muted-foreground">Optional: Provide specific instructions or context for this assignment</p>
                    </div>

                    {/* Selected User Preview */}
                    {selectedUserId && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                    {availablePersonnel.find(u => u.id === selectedUserId)?.name}
                                </span>
                            </div>
                            <p className="text-xs text-blue-700 mb-2">
                                {availablePersonnel.find(u => u.id === selectedUserId)?.email}
                            </p>
                            <Badge
                                variant="secondary"
                                className={`text-xs ${getRoleColor(availablePersonnel.find(u => u.id === selectedUserId)?.role || '')}`}
                            >
                                {availablePersonnel.find(u => u.id === selectedUserId)?.role}
                            </Badge>
                        </div>
                    )}

                    {/* Modal Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAssignCancel}
                            disabled={isAssigning}
                            className="modal-button-secondary"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!selectedUserId || isAssigning}
                            className="modal-button-primary"
                            variant="accent"
                        >
                            {isAssigning ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                'Assign'
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Review Modal - CustomerModal Style */}
            <Modal
                isOpen={!!showReviewModal}
                onClose={() => setShowReviewModal(null)}
                title={
                    <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Review Documents and Information
                    </div>
                }
                description="Review all required documents and provide your assessment before completing this review step."
                showDescription={true}
                maxWidth="max-w-[700px]"
            >
                <div className="space-y-6">
                    {/* Review Step Information */}
                    {getCurrentReviewStep() && (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h4 className="font-medium text-sm mb-2">{getCurrentReviewStep()?.name}</h4>
                            <p className="text-xs text-muted-foreground mb-3">
                                {getCurrentReviewStep()?.description}
                            </p>
                            <div className="flex items-center gap-4 mb-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-gray-500" />
                                    <span className="text-xs text-muted-foreground">
                                        Estimated: {getCurrentReviewStep()?.duration} hours
                                    </span>
                                </div>
                            </div>
                            {getCurrentReviewStep()?.responsibleRoles && getCurrentReviewStep()?.responsibleRoles.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs text-muted-foreground">Responsible Roles:</span>
                                    {getCurrentReviewStep()?.responsibleRoles.map((role) => (
                                        <Badge key={role} variant="secondary" className="text-xs">
                                            {role}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Documents Section */}
                    <div>
                        <h4 className="font-medium mb-3">Required Documents</h4>
                        <div className="space-y-2">
                            {getReviewStepDocuments(reviewData.reviewStepSlug).map((doc) => (
                                <div key={doc.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                    <Checkbox
                                        id={`doc-${doc.id}`}
                                        checked={reviewData.reviewedDocuments.includes(doc.id)}
                                        onCheckedChange={() => handleDocumentReview(doc.id)}
                                    />
                                    <div className="flex-1">
                                        <Label htmlFor={`doc-${doc.id}`} className="font-medium">
                                            {doc.name}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">{doc.type}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            // In real app, this would open the document
                                            console.log('Opening document:', doc.name);
                                            window.open(doc.url, '_blank');
                                        }}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-2">
                        <Label htmlFor="review-comments">Review Comments</Label>
                        <Textarea
                            id="review-comments"
                            placeholder="Add your review comments, findings, or recommendations..."
                            value={reviewData.comments}
                            onChange={(e) => setReviewData(prev => ({ ...prev, comments: e.target.value }))}
                            className="modal-form-textarea"
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground">Optional: Provide detailed feedback or recommendations</p>
                    </div>

                    {/* Confirmation Section */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="review-confirm"
                                checked={reviewData.confirmed}
                                onCheckedChange={(checked) =>
                                    setReviewData(prev => ({ ...prev, confirmed: !!checked }))
                                }
                            />
                            <Label htmlFor="review-confirm" className="text-sm font-medium text-blue-900">
                                I confirm that I have reviewed all required documents and information,
                                and the review is complete and accurate.
                            </Label>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowReviewModal(null)}
                        className="modal-button-secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleReviewConfirm}
                        disabled={!reviewData.confirmed}
                        className="modal-button-primary"
                        variant="accent"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Complete Review
                    </Button>
                </div>
            </Modal>
        </div>
    );
};