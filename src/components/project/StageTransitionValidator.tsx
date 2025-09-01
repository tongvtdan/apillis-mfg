import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    Shield,
    ArrowRight,
    Info
} from "lucide-react";
import { Project, WorkflowStage } from "@/types/project";
import { workflowStageService } from "@/services/workflowStageService";
import { usePermissions } from "@/hooks/usePermissions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface StageTransitionValidatorProps {
    project: Project;
    targetStage: WorkflowStage;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (bypassRequired: boolean, reason?: string) => void;
}

interface ValidationResult {
    isValid: boolean;
    canProceed: boolean;
    requiresApproval: boolean;
    requiresBypass: boolean;
    errors: string[];
    warnings: string[];
    prerequisites: PrerequisiteCheck[];
}

interface PrerequisiteCheck {
    id: string;
    name: string;
    description: string;
    status: 'passed' | 'failed' | 'warning';
    required: boolean;
    details?: string;
}

export function StageTransitionValidator({
    project,
    targetStage,
    isOpen,
    onClose,
    onConfirm
}: StageTransitionValidatorProps) {
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [bypassReason, setBypassReason] = useState('');
    const { checkPermission } = usePermissions();

    useEffect(() => {
        if (isOpen && project && targetStage) {
            validateTransition();
        }
    }, [isOpen, project, targetStage]);

    const validateTransition = async () => {
        setIsValidating(true);
        try {
            // Get validation result from workflow stage service
            const serviceResult = await workflowStageService.validateStageTransition(
                project.current_stage_id || '',
                targetStage.id
            );

            // Perform detailed prerequisite checks
            const prerequisites = await performPrerequisiteChecks(project, targetStage);

            // Combine results
            const validation: ValidationResult = {
                isValid: serviceResult.isValid,
                canProceed: serviceResult.isValid || checkPermission('workflow', 'bypass').allowed,
                requiresApproval: serviceResult.requiresApproval || false,
                requiresBypass: !serviceResult.isValid && checkPermission('workflow', 'bypass').allowed,
                errors: serviceResult.isValid ? [] : [serviceResult.message || 'Validation failed'],
                warnings: serviceResult.message && serviceResult.requiresApproval ? [serviceResult.message] : [],
                prerequisites
            };

            setValidation(validation);
        } catch (error) {
            console.error('Error validating stage transition:', error);
            setValidation({
                isValid: false,
                canProceed: false,
                requiresApproval: false,
                requiresBypass: false,
                errors: ['Failed to validate stage transition'],
                warnings: [],
                prerequisites: []
            });
        } finally {
            setIsValidating(false);
        }
    };

    const performPrerequisiteChecks = async (
        project: Project,
        targetStage: WorkflowStage
    ): Promise<PrerequisiteCheck[]> => {
        const checks: PrerequisiteCheck[] = [];

        // Basic project data checks
        checks.push({
            id: 'project_data',
            name: 'Project Data Complete',
            description: 'Basic project information is complete',
            status: (project.title && project.description) ? 'passed' : 'failed',
            required: true,
            details: 'Project must have title and description'
        });

        // Customer information check
        checks.push({
            id: 'customer_info',
            name: 'Customer Information',
            description: 'Customer details are available',
            status: project.customer_id ? 'passed' : 'warning',
            required: false,
            details: 'Customer information helps with project tracking'
        });

        // Stage-specific checks based on target stage
        const stageSpecificChecks = await getStageSpecificChecks(project, targetStage);
        checks.push(...stageSpecificChecks);

        // Document requirements check
        const documentCheck = await checkDocumentRequirements(project, targetStage);
        if (documentCheck) {
            checks.push(documentCheck);
        }

        // Approval requirements check
        const approvalCheck = await checkApprovalRequirements(project, targetStage);
        if (approvalCheck) {
            checks.push(approvalCheck);
        }

        return checks;
    };

    const getStageSpecificChecks = async (
        project: Project,
        targetStage: WorkflowStage
    ): Promise<PrerequisiteCheck[]> => {
        const checks: PrerequisiteCheck[] = [];

        switch (targetStage.name) {
            case 'Technical Review':
                checks.push({
                    id: 'technical_readiness',
                    name: 'Technical Readiness',
                    description: 'Project is ready for technical review',
                    status: project.description ? 'passed' : 'failed',
                    required: true,
                    details: 'Project requirements must be documented'
                });
                break;

            case 'Supplier RFQ':
                checks.push({
                    id: 'review_completion',
                    name: 'Review Completion',
                    description: 'Technical reviews are completed',
                    status: 'warning', // Would check actual review status in real implementation
                    required: true,
                    details: 'Engineering, QA, and Production reviews should be complete'
                });
                break;

            case 'Quoted':
                checks.push({
                    id: 'supplier_quotes',
                    name: 'Supplier Quotes',
                    description: 'Supplier quotes have been received',
                    status: 'warning', // Would check actual quotes in real implementation
                    required: true,
                    details: 'At least one supplier quote should be available'
                });
                break;

            case 'Order Confirmed':
                checks.push({
                    id: 'quote_approval',
                    name: 'Quote Approval',
                    description: 'Quote has been approved by customer',
                    status: project.estimated_value ? 'passed' : 'failed',
                    required: true,
                    details: 'Customer must approve the quote before order confirmation'
                });
                break;

            case 'Procurement Planning':
                checks.push({
                    id: 'order_details',
                    name: 'Order Details',
                    description: 'Order details are complete',
                    status: 'warning', // Would check PO details in real implementation
                    required: true,
                    details: 'Purchase order and delivery requirements should be confirmed'
                });
                break;

            case 'In Production':
                checks.push({
                    id: 'procurement_complete',
                    name: 'Procurement Complete',
                    description: 'Materials and resources are secured',
                    status: 'warning', // Would check procurement status in real implementation
                    required: true,
                    details: 'All materials should be ordered and production scheduled'
                });
                break;

            case 'Shipped & Closed':
                checks.push({
                    id: 'production_complete',
                    name: 'Production Complete',
                    description: 'Production is finished and quality approved',
                    status: 'warning', // Would check production status in real implementation
                    required: true,
                    details: 'Product must be manufactured and pass quality checks'
                });
                break;
        }

        return checks;
    };

    const checkDocumentRequirements = async (
        project: Project,
        targetStage: WorkflowStage
    ): Promise<PrerequisiteCheck | null> => {
        // In a real implementation, this would check for required documents
        // For now, we'll return a generic document check
        return {
            id: 'documents',
            name: 'Required Documents',
            description: 'All required documents are uploaded',
            status: 'warning',
            required: false,
            details: 'Check that all stage-specific documents are available'
        };
    };

    const checkApprovalRequirements = async (
        project: Project,
        targetStage: WorkflowStage
    ): Promise<PrerequisiteCheck | null> => {
        // Check if the target stage requires approvals
        if (targetStage.responsible_roles && targetStage.responsible_roles.length > 0) {
            return {
                id: 'approvals',
                name: 'Required Approvals',
                description: 'All required approvals are obtained',
                status: 'warning',
                required: true,
                details: `Approvals needed from: ${targetStage.responsible_roles.join(', ')}`
            };
        }
        return null;
    };

    const getStatusIcon = (status: PrerequisiteCheck['status']) => {
        switch (status) {
            case 'passed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: PrerequisiteCheck['status']) => {
        switch (status) {
            case 'passed':
                return 'text-green-600';
            case 'failed':
                return 'text-red-600';
            case 'warning':
                return 'text-yellow-600';
            default:
                return 'text-gray-400';
        }
    };

    const handleConfirm = () => {
        if (!validation) return;

        if (validation.requiresBypass) {
            onConfirm(true, bypassReason);
        } else {
            onConfirm(false);
        }
    };

    const canProceed = validation?.canProceed || false;
    const hasErrors = validation?.errors.length || 0 > 0;
    const hasWarnings = validation?.warnings.length || 0 > 0;
    const requiresBypass = validation?.requiresBypass || false;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowRight className="w-5 h-5" />
                        Stage Transition Validation
                    </DialogTitle>
                    <DialogDescription>
                        Validating transition from current stage to {targetStage.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {isValidating ? (
                        <div className="flex items-center justify-center py-8">
                            <Clock className="w-6 h-6 animate-spin mr-2" />
                            <span>Validating transition...</span>
                        </div>
                    ) : validation ? (
                        <>
                            {/* Validation Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            {validation.isValid ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            )}
                                            <span className="font-medium">
                                                {validation.isValid ? 'Valid Transition' : 'Invalid Transition'}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            {canProceed ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Shield className="w-5 h-5 text-red-600" />
                                            )}
                                            <span className="font-medium">
                                                {canProceed ? 'Can Proceed' : 'Cannot Proceed'}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Errors */}
                            {hasErrors && (
                                <Alert variant="destructive">
                                    <XCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <div className="space-y-1">
                                            {validation.errors.map((error, index) => (
                                                <div key={index}>• {error}</div>
                                            ))}
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Warnings */}
                            {hasWarnings && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        <div className="space-y-1">
                                            {validation.warnings.map((warning, index) => (
                                                <div key={index}>• {warning}</div>
                                            ))}
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Prerequisites */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Prerequisite Checks</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {validation.prerequisites.map((check) => (
                                        <div key={check.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                            {getStatusIcon(check.status)}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h5 className={`font-medium text-sm ${getStatusColor(check.status)}`}>
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
                                </CardContent>
                            </Card>

                            {/* Bypass Section */}
                            {requiresBypass && (
                                <Card className="border-yellow-200 bg-yellow-50">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-yellow-600" />
                                            Manager Bypass Required
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            This transition requires manager approval to bypass validation requirements.
                                            Please provide a reason for the bypass.
                                        </p>
                                        <textarea
                                            className="w-full p-2 border rounded-md text-sm"
                                            rows={3}
                                            placeholder="Enter reason for bypass..."
                                            value={bypassReason}
                                            onChange={(e) => setBypassReason(e.target.value)}
                                        />
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    ) : null}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!canProceed || (requiresBypass && !bypassReason.trim())}
                    >
                        {requiresBypass ? 'Proceed with Bypass' : 'Proceed'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}