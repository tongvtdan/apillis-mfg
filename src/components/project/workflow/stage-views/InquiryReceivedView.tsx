import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    Eye,
    Send,
    Loader2,
    Upload,
    Download,
    Calendar,
    DollarSign,
    Package,
    Building2,
    User,
    Mail,
    Phone
} from 'lucide-react';
import { DocumentValidationPanel } from '../../documents/DocumentValidationPanel';
import { Project, WorkflowStage } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth';

interface InquiryReceivedViewProps {
    project: Project;
    currentStage: WorkflowStage;
    nextStage?: WorkflowStage;
    validation: any;
}

// Document categories for inquiry received stage
const REQUIRED_DOCUMENT_CATEGORIES = [
    { key: 'rfq', label: 'RFQ or PO Document', required: true },
    { key: 'drawing', label: 'Engineering Drawings (2D/3D)', required: true },
    { key: 'bom', label: 'Bill of Materials (BOM)', required: true },
    { key: 'quality', label: 'Quality / Tolerance Specifications', required: false },
    { key: 'compliance', label: 'Compliance Docs (ISO, RoHS, etc.)', required: false },
    { key: 'other', label: 'Other Documents', required: false }
];

// Review decision options
const REVIEW_DECISIONS = [
    {
        value: 'ready_for_technical_review',
        label: 'Ready for Technical Review (Engineering/QA/Production)',
        description: 'Auto-advances project to "Qualification" stage and notifies assigned reviewers',
        icon: CheckCircle2,
        color: 'text-green-600'
    },
    {
        value: 'request_clarification',
        label: 'Request Clarification from Customer',
        description: 'Opens modal to draft message to Sales Rep/Customer',
        icon: MessageSquare,
        color: 'text-orange-600'
    },
    {
        value: 'reject_inquiry',
        label: 'Reject Inquiry (Not Suitable for Our Capabilities)',
        description: 'Requires justification and sends rejection email to customer',
        icon: XCircle,
        color: 'text-red-600'
    }
];

export const InquiryReceivedView: React.FC<InquiryReceivedViewProps> = ({
    project,
    currentStage,
    nextStage,
    validation
}) => {
    const { user } = useAuth();

    // State for the inquiry review form
    const [reviewForm, setReviewForm] = useState({
        documentCompleteness: {
            rfq: false,
            drawing: false,
            bom: false,
            quality: false,
            compliance: false,
            other: false,
            otherDescription: ''
        },
        projectValidity: {
            scopeClear: false,
            contactComplete: false,
            priceRealistic: false,
            deliveryFeasible: false,
            additionalNotes: ''
        },
        reviewDecision: '',
        decisionReason: '',
        status: 'draft' as 'draft' | 'submitted'
    });

    // State for modals
    const [showClarificationModal, setShowClarificationModal] = useState(false);
    const [clarificationData, setClarificationData] = useState({
        subject: '',
        message: '',
        attachments: [] as string[]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);

    // Load project documents on component mount
    useEffect(() => {
        loadProjectDocuments();
    }, [project.id]);

    // Load project documents
    const loadProjectDocuments = async () => {
        try {
            const { data, error } = await supabase
                .from('project_documents')
                .select('*')
                .eq('project_id', project.id as any)
                .eq('organization_id', project.organization_id as any);

            if (error) throw error;
            setDocuments(data || []);
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    };

    // Check if required documents are present
    const checkDocumentCompleteness = () => {
        const docCategories = documents.reduce((acc, doc) => {
            const category = doc.category || 'other';
            acc[category] = acc[category] || [];
            acc[category].push(doc);
            return acc;
        }, {} as Record<string, any[]>);

        setReviewForm(prev => ({
            ...prev,
            documentCompleteness: {
                ...prev.documentCompleteness,
                rfq: !!docCategories.rfq?.length,
                drawing: !!docCategories.drawing?.length,
                bom: !!docCategories.bom?.length,
                quality: !!docCategories.quality?.length,
                compliance: !!docCategories.compliance?.length,
                other: !!docCategories.other?.length
            }
        }));
    };

    // Check if all required documents are present
    const canAdvanceToTechnicalReview = () => {
        const { documentCompleteness } = reviewForm;
        return documentCompleteness.rfq && documentCompleteness.drawing && documentCompleteness.bom;
    };

    // Handle form field changes
    const handleDocumentCheckChange = (category: string, checked: boolean) => {
        setReviewForm(prev => ({
            ...prev,
            documentCompleteness: {
                ...prev.documentCompleteness,
                [category]: checked
            }
        }));
    };

    const handleValidityCheckChange = (field: string, checked: boolean) => {
        setReviewForm(prev => ({
            ...prev,
            projectValidity: {
                ...prev.projectValidity,
                [field]: checked
            }
        }));
    };

    const handleTextChange = (field: string, value: string) => {
        setReviewForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleValidityNotesChange = (value: string) => {
        setReviewForm(prev => ({
            ...prev,
            projectValidity: {
                ...prev.projectValidity,
                additionalNotes: value
            }
        }));
    };

    // Handle review submission
    const handleSubmitReview = async () => {
        if (!reviewForm.reviewDecision) {
            alert('Please select a review decision.');
            return;
        }

        if ((reviewForm.reviewDecision === 'request_clarification' || reviewForm.reviewDecision === 'reject_inquiry') && !reviewForm.decisionReason.trim()) {
            alert('Please provide a reason for your decision.');
            return;
        }

        if (reviewForm.reviewDecision === 'ready_for_technical_review' && !canAdvanceToTechnicalReview()) {
            alert('Cannot advance to technical review: Required documents (RFQ, Drawings, BOM) are missing.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Save review to database
            const { data: reviewData, error: reviewError } = await supabase
                .from('reviews')
                .insert({
                    project_id: project.id,
                    organization_id: project.organization_id,
                    review_type: 'inquiry_received',
                    reviewer_id: user?.id,
                    decision: reviewForm.reviewDecision === 'ready_for_technical_review' ? 'approved' :
                        reviewForm.reviewDecision === 'request_clarification' ? 'needs_clarification' : 'rejected',
                    decision_reason: reviewForm.decisionReason,
                    metadata: {
                        document_check: reviewForm.documentCompleteness,
                        validity_notes: reviewForm.projectValidity.additionalNotes,
                        validity_checks: reviewForm.projectValidity
                    },
                    status: 'submitted'
                } as any)
                .select()
                .single();

            if (reviewError) throw reviewError;

            // Update project status based on decision
            let newStatus = project.status;
            if (reviewForm.reviewDecision === 'ready_for_technical_review') {
                newStatus = 'active';
            } else if (reviewForm.reviewDecision === 'request_clarification') {
                newStatus = 'on_hold';
            } else if (reviewForm.reviewDecision === 'reject_inquiry') {
                newStatus = 'cancelled';
            }

            const { error: projectError } = await supabase
                .from('projects')
                .update({
                    status: newStatus,
                    current_stage_id: reviewForm.reviewDecision === 'ready_for_technical_review' ? nextStage?.id : project.current_stage_id
                } as any)
                .eq('id', project.id as any);

            if (projectError) throw projectError;

            // Log activity
            await supabase
                .from('activity_log')
                .insert({
                    organization_id: project.organization_id,
                    user_id: user?.id,
                    project_id: project.id,
                    entity_type: 'project',
                    entity_id: project.id,
                    action: 'inquiry_review_submitted',
                    description: `Inquiry review submitted with decision: ${reviewForm.reviewDecision}`,
                    metadata: {
                        decision: reviewForm.reviewDecision,
                        review_id: (reviewData && 'id' in reviewData) ? reviewData.id : null
                    }
                } as any);

            alert('Review submitted successfully!');
            setReviewForm(prev => ({ ...prev, status: 'submitted' }));

        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error submitting review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle clarification request
    const handleRequestClarification = async () => {
        if (!clarificationData.subject.trim() || !clarificationData.message.trim()) {
            alert('Please provide both subject and message.');
            return;
        }

        try {
            // Create message record
            const { error: messageError } = await supabase
                .from('messages')
                .insert({
                    organization_id: project.organization_id,
                    project_id: project.id,
                    sender_id: user?.id,
                    subject: clarificationData.subject,
                    content: clarificationData.message,
                    message_type: 'clarification_request',
                    priority: 'normal'
                } as any);

            if (messageError) throw messageError;

            // Update project status
            const { error: projectError } = await supabase
                .from('projects')
                .update({ status: 'on_hold' } as any)
                .eq('id', project.id as any);

            if (projectError) throw projectError;

            alert('Clarification request sent successfully!');
            setShowClarificationModal(false);
            setClarificationData({ subject: '', message: '', attachments: [] });

        } catch (error) {
            console.error('Error sending clarification request:', error);
            alert('Error sending clarification request. Please try again.');
        }
    };

    // Handle save draft
    const handleSaveDraft = async () => {
        try {
            const { error } = await supabase
                .from('reviews')
                .upsert({
                    project_id: project.id,
                    organization_id: project.organization_id,
                    review_type: 'inquiry_received',
                    reviewer_id: user?.id,
                    decision: reviewForm.reviewDecision || null,
                    decision_reason: reviewForm.decisionReason,
                    metadata: {
                        document_check: reviewForm.documentCompleteness,
                        validity_notes: reviewForm.projectValidity.additionalNotes,
                        validity_checks: reviewForm.projectValidity
                    },
                    status: 'draft'
                } as any);

            if (error) throw error;
            alert('Draft saved successfully!');

        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Error saving draft. Please try again.');
        }
    };

    // Initialize document completeness check when documents load
    useEffect(() => {
        if (documents.length > 0) {
            checkDocumentCompleteness();
        }
    }, [documents]);

    return (
        <div className="space-y-6">
            {/* Project Snapshot */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Project Snapshot
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Project Title:</span>
                                <span>{project.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Intake Type:</span>
                                <Badge variant="outline">{project.intake_type || 'RFQ'}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Submitted On:</span>
                                <span>{new Date(project.created_at || '').toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Target Delivery:</span>
                                <span>{project.estimated_delivery_date ? new Date(project.estimated_delivery_date).toLocaleDateString() : 'Not specified'}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Target Price:</span>
                                <span>{project.estimated_value ? `$${project.estimated_value.toLocaleString()}` : 'Not specified'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Customer:</span>
                                <span>{project.customer_organization?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Primary Contact:</span>
                                <span>{project.primary_contact?.contact_name || 'Not specified'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Contact Email:</span>
                                <span>{project.primary_contact?.email || 'Not specified'}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Document Completeness Check */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Document Completeness Check
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Verify all required documents for intake type are present:
                        </p>

                        <div className="space-y-3">
                            {REQUIRED_DOCUMENT_CATEGORIES.map((category) => (
                                <div key={category.key} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={`doc-${category.key}`}
                                        checked={!!reviewForm.documentCompleteness[category.key as keyof typeof reviewForm.documentCompleteness]}
                                        onCheckedChange={(checked) => handleDocumentCheckChange(category.key, !!checked)}
                                        disabled={category.required && !documents.some(doc => doc.category === category.key)}
                                    />
                                    <Label htmlFor={`doc-${category.key}`} className="flex-1">
                                        <span className={category.required ? 'font-medium' : ''}>
                                            {category.label}
                                        </span>
                                        {category.required && (
                                            <span className="text-red-500 ml-1">*</span>
                                        )}
                                    </Label>
                                    {category.key === 'other' && reviewForm.documentCompleteness.other && (
                                        <Input
                                            placeholder="Specify other documents"
                                            value={reviewForm.documentCompleteness.otherDescription}
                                            onChange={(e) => setReviewForm(prev => ({
                                                ...prev,
                                                documentCompleteness: {
                                                    ...prev.documentCompleteness,
                                                    otherDescription: e.target.value
                                                }
                                            }))}
                                            className="w-48"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Required for RFQ/PO: At least RFQ/PO + Drawings + BOM must be present.
                                If missing, status will be set to "Incomplete — Awaiting Customer"
                            </AlertDescription>
                        </Alert>

                        {/* Attached Files */}
                        {documents.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-medium mb-2">📎 Attached Files:</h4>
                                <div className="space-y-2">
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm font-medium">{doc.title}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {doc.category || 'other'}
                                                </Badge>
                                                <span className="text-xs text-gray-500">
                                                    ({Math.round((doc.file_size || 0) / 1024 / 1024 * 100) / 100} MB)
                                                </span>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Project Validity & Clarity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Project Validity & Clarity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="scope-clear"
                                    checked={reviewForm.projectValidity.scopeClear}
                                    onCheckedChange={(checked) => handleValidityCheckChange('scopeClear', !!checked)}
                                />
                                <Label htmlFor="scope-clear">Project scope is clear and unambiguous</Label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="contact-complete"
                                    checked={reviewForm.projectValidity.contactComplete}
                                    onCheckedChange={(checked) => handleValidityCheckChange('contactComplete', !!checked)}
                                />
                                <Label htmlFor="contact-complete">Customer contact information is complete and valid</Label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="price-realistic"
                                    checked={reviewForm.projectValidity.priceRealistic}
                                    onCheckedChange={(checked) => handleValidityCheckChange('priceRealistic', !!checked)}
                                />
                                <Label htmlFor="price-realistic">Target price and volume are realistic for initial assessment</Label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="delivery-feasible"
                                    checked={reviewForm.projectValidity.deliveryFeasible}
                                    onCheckedChange={(checked) => handleValidityCheckChange('deliveryFeasible', !!checked)}
                                />
                                <Label htmlFor="delivery-feasible">Delivery date is feasible (min 6 weeks for new product)</Label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="additional-notes">Additional Notes</Label>
                            <Textarea
                                id="additional-notes"
                                placeholder="Add any additional notes or observations..."
                                value={reviewForm.projectValidity.additionalNotes}
                                onChange={(e) => handleValidityNotesChange(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Review Decision */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Review Decision
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Select next action:</p>

                        <RadioGroup
                            value={reviewForm.reviewDecision}
                            onValueChange={(value) => handleTextChange('reviewDecision', value)}
                        >
                            {REVIEW_DECISIONS.map((decision) => {
                                const IconComponent = decision.icon;
                                return (
                                    <div key={decision.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                                        <RadioGroupItem value={decision.value} id={decision.value} />
                                        <div className="flex-1">
                                            <Label htmlFor={decision.value} className="flex items-center gap-2 cursor-pointer">
                                                <IconComponent className={`w-4 h-4 ${decision.color}`} />
                                                <span className="font-medium">{decision.label}</span>
                                            </Label>
                                            <p className="text-sm text-muted-foreground mt-1 ml-6">
                                                {decision.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </RadioGroup>

                        {(reviewForm.reviewDecision === 'request_clarification' || reviewForm.reviewDecision === 'reject_inquiry') && (
                            <div className="space-y-2">
                                <Label htmlFor="decision-reason">Reason for {reviewForm.reviewDecision === 'request_clarification' ? 'clarification request' : 'rejection'}</Label>
                                <Textarea
                                    id="decision-reason"
                                    placeholder={`Provide detailed reason for ${reviewForm.reviewDecision === 'request_clarification' ? 'requesting clarification' : 'rejecting the inquiry'}...`}
                                    value={reviewForm.decisionReason}
                                    onChange={(e) => handleTextChange('decisionReason', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        )}

                        {reviewForm.reviewDecision === 'ready_for_technical_review' && !canAdvanceToTechnicalReview() && (
                            <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Cannot advance to technical review: Required documents (RFQ, Drawings, BOM) are missing.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Review Metadata */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Review Metadata
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Reviewer:</span>
                                <span>{user?.user_metadata?.full_name || user?.email || 'Current User'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Date:</span>
                                <span>{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Review Type:</span>
                                <Badge variant="outline">inquiry_received</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Status:</span>
                                <Badge variant={reviewForm.status === 'submitted' ? 'default' : 'secondary'}>
                                    {reviewForm.status === 'submitted' ? 'Submitted' : 'Draft'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                >
                    Save Draft
                </Button>
                {reviewForm.reviewDecision === 'request_clarification' && (
                    <Button
                        variant="outline"
                        onClick={() => setShowClarificationModal(true)}
                        disabled={isSubmitting}
                    >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Request Clarification
                    </Button>
                )}
                <Button
                    onClick={handleSubmitReview}
                    disabled={isSubmitting || !reviewForm.reviewDecision}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Review
                        </>
                    )}
                </Button>
            </div>

            {/* Clarification Request Modal */}
            <Modal
                isOpen={showClarificationModal}
                onClose={() => setShowClarificationModal(false)}
                title={
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Request Customer Clarification
                    </div>
                }
                description="This will notify the Sales/Account Manager to contact the customer."
                showDescription={true}
                maxWidth="max-w-[600px]"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="clarification-subject">Subject</Label>
                        <Input
                            id="clarification-subject"
                            placeholder="Timeline Clarification Required – PRJ-2025-001"
                            value={clarificationData.subject}
                            onChange={(e) => setClarificationData(prev => ({ ...prev, subject: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="clarification-message">Message</Label>
                        <Textarea
                            id="clarification-message"
                            placeholder="Hi Sarah, thank you for your inquiry. Our standard lead time for new products is 8 weeks. Your requested delivery is in 4 weeks. Can you confirm if this is flexible, or if you'd like to discuss expedited options?"
                            value={clarificationData.message}
                            onChange={(e) => setClarificationData(prev => ({ ...prev, message: e.target.value }))}
                            rows={4}
                        />
                    </div>

                    {/* Attached Files */}
                    {documents.length > 0 && (
                        <div className="space-y-2">
                            <Label>Attach Files</Label>
                            <div className="space-y-2">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">{doc.title}</span>
                                        </div>
                                        <Checkbox
                                            checked={clarificationData.attachments.includes(doc.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked === true) {
                                                    setClarificationData(prev => ({
                                                        ...prev,
                                                        attachments: [...prev.attachments, doc.id]
                                                    }));
                                                } else {
                                                    setClarificationData(prev => ({
                                                        ...prev,
                                                        attachments: prev.attachments.filter(id => id !== doc.id)
                                                    }));
                                                }
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => setShowClarificationModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRequestClarification}
                            disabled={!clarificationData.subject.trim() || !clarificationData.message.trim()}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Send Request
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
