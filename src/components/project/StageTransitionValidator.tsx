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
    Info,
    FileText,
    Users,
    Settings,
    Database
} from "lucide-react";
import { Project, WorkflowStage } from "@/types/project";
import { workflowStageService } from "@/services/workflowStageService";
import { prerequisiteChecker, PrerequisiteResult } from "@/services/prerequisiteChecker";
import { stageHistoryService } from "@/services/stageHistoryService";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { useApprovals } from "@/hooks/useApprovals";
import { ApprovalStatusWidget } from "@/components/approval/ApprovalStatusWidget";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    prerequisiteResult?: PrerequisiteResult;
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
    const [currentStage, setCurrentStage] = useState<WorkflowStage | null>(null);
    const { checkPermission } = usePermissions();
    const { user } = useAuth();
    const { autoAssignApprovers } = useApprovals();

    useEffect(() => {
        if (isOpen && project && targetStage) {
            validateTransition();
        }
    }, [isOpen, project, targetStage]);

    const validateTransition = async () => {
        setIsValidating(true);
        try {
            // Get current stage information
            let currentStageData: WorkflowStage | null = null;
            if (project.current_stage_id) {
                currentStageData = await workflowStageService.getWorkflowStageById(project.current_stage_id);
                setCurrentStage(currentStageData);
            }

            // Get validation result from workflow stage service
            const serviceResult = await workflowStageService.validateStageTransition(
                project.current_stage_id || '',
                targetStage.id
            );

            // Perform comprehensive prerequisite checks
            const prerequisiteResult = await prerequisiteChecker.checkPrerequisites(
                project,
                targetStage,
                currentStageData || undefined
            );

            // Combine results
            const validation: ValidationResult = {
                isValid: serviceResult.isValid && prerequisiteResult.requiredPassed,
                canProceed: (serviceResult.isValid && prerequisiteResult.requiredPassed) || checkPermission('workflow', 'bypass').allowed,
                requiresApproval: serviceResult.requiresApproval || false,
                requiresBypass: (!serviceResult.isValid || !prerequisiteResult.requiredPassed) && checkPermission('workflow', 'bypass').allowed,
                errors: [
                    ...(serviceResult.isValid ? [] : [serviceResult.message || 'Validation failed']),
                    ...prerequisiteResult.errors
                ],
                warnings: [
                    ...(serviceResult.message && serviceResult.requiresApproval ? [serviceResult.message] : []),
                    ...prerequisiteResult.warnings
                ],
                prerequisiteResult
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
                prerequisiteResult: undefined
            });
        } finally {
            setIsValidating(false);
        }
    };

    const handleConfirm = async () => {
        if (!validation || !user) return;

        try {
            // Record the stage transition in history
            await stageHistoryService.recordStageTransition({
                projectId: project.id,
                fromStageId: project.current_stage_id || undefined,
                toStageId: targetStage.id,
                userId: user.id,
                reason: validation.requiresBypass ? 'Manager bypass' : 'Normal transition',
                bypassRequired: validation.requiresBypass,
                bypassReason: validation.requiresBypass ? bypassReason : undefined
            });

            // Proceed with the transition
            if (validation.requiresBypass) {
                onConfirm(true, bypassReason);
            } else {
                onConfirm(false);
            }
        } catch (error) {
            console.error('Error recording stage transition:', error);
            // Still proceed with the transition even if history recording fails
            if (validation.requiresBypass) {
                onConfirm(true, bypassReason);
            } else {
                onConfirm(false);
            }
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'passed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-gray-400" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'passed':
                return 'text-green-600';
            case 'failed':
                return 'text-red-600';
            case 'warning':
                return 'text-yellow-600';
            case 'pending':
                return 'text-gray-400';
            default:
                return 'text-gray-400';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'project_data':
                return <Database className="w-4 h-4" />;
            case 'documents':
                return <FileText className="w-4 h-4" />;
            case 'approvals':
                return <Users className="w-4 h-4" />;
            case 'stage_specific':
                return <Settings className="w-4 h-4" />;
            case 'system':
                return <Shield className="w-4 h-4" />;
            default:
                return <Info className="w-4 h-4" />;
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

                            {/* Prerequisites with Tabs */}
                            {validation.prerequisiteResult && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Prerequisite Checks</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Tabs defaultValue="all" className="w-full">
                                            <TabsList className="grid w-full grid-cols-5">
                                                <TabsTrigger value="all">All</TabsTrigger>
                                                <TabsTrigger value="project_data">Project</TabsTrigger>
                                                <TabsTrigger value="documents">Documents</TabsTrigger>
                                                <TabsTrigger value="approvals">Approvals</TabsTrigger>
                                                <TabsTrigger value="stage_specific">Stage</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="all" className="space-y-3 mt-4">
                                                {validation.prerequisiteResult.checks.map((check) => (
                                                    <div key={check.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            {getCategoryIcon(check.category)}
                                                            {getStatusIcon(check.status)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h5 className={`font-medium text-sm ${getStatusColor(check.status)}`}>
                                                                    {check.name}
                                                                </h5>
                                                                <div className="flex gap-1">
                                                                    {check.required && (
                                                                        <Badge variant="outline" className="text-xs">Required</Badge>
                                                                    )}
                                                                    <Badge variant="secondary" className="text-xs capitalize">
                                                                        {check.category.replace('_', ' ')}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mb-1">{check.description}</p>
                                                            {check.details && (
                                                                <p className="text-xs text-muted-foreground italic">{check.details}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </TabsContent>

                                            {['project_data', 'documents', 'approvals', 'stage_specific'].map(category => (
                                                <TabsContent key={category} value={category} className="space-y-3 mt-4">
                                                    {validation.prerequisiteResult!.checks
                                                        .filter(check => check.category === category)
                                                        .map((check) => (
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
                                                    {validation.prerequisiteResult!.checks.filter(check => check.category === category).length === 0 && (
                                                        <div className="text-center py-4 text-muted-foreground">
                                                            No {category.replace('_', ' ')} checks required for this transition
                                                        </div>
                                                    )}
                                                </TabsContent>
                                            ))}
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Approval Status Widget */}
                            {targetStage.requires_approval && (
                                <ApprovalStatusWidget
                                    projectId={project.id}
                                    stageId={targetStage.id}
                                    showRequestButton={true}
                                    onRequestApprovals={async () => {
                                        await autoAssignApprovers(project.id, targetStage.id, project.organization_id);
                                        // Refresh validation after requesting approvals
                                        validateTransition();
                                    }}
                                />
                            )}

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