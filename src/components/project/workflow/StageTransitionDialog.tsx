import React, { useState, useEffect } from 'react';
import { Modal } from "@/components/ui/modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    Database,
    Loader2,
    Calendar
} from "lucide-react";
import { Project, WorkflowStage } from "@/types/project";
import { workflowStageService } from "@/services/workflowStageService";
import { stageHistoryService } from "@/services/stageHistoryService";
import { usePermissions } from "@/core/auth/hooks";
import { useAuth } from "@/core/auth";
import { useCurrentApprovals } from "@/core/approvals/useApproval";
import { useToast } from "@/shared/hooks/use-toast";

interface StageTransitionDialogProps {
    project: Project;
    targetStage: WorkflowStage;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (bypassRequired: boolean, reason?: string, estimatedDuration?: number) => void;
}

interface ValidationResult {
    isValid: boolean;
    canProceed: boolean;
    requiresApproval: boolean;
    requiresBypass: boolean;
    errors: string[];
    warnings: string[];
}

export function StageTransitionDialog({
    project,
    targetStage,
    isOpen,
    onClose,
    onConfirm
}: StageTransitionDialogProps) {
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [bypassReason, setBypassReason] = useState('');
    const [estimatedDuration, setEstimatedDuration] = useState<number>(targetStage.estimated_duration_days || 0);
    const [durationUnit, setDurationUnit] = useState<'days' | 'hours'>('days');
    const [currentStage, setCurrentStage] = useState<WorkflowStage | null>(null);
    const { checkPermission } = usePermissions();
    const { user } = useAuth();
    const { bulkApprove } = useCurrentApprovals();
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen && project && targetStage) {
            validateTransition();
            // Reset duration to default when dialog opens
            setEstimatedDuration(targetStage.estimated_duration_days || 0);
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

            // Check if user has bypass permissions
            const hasBypassPermission = checkPermission('workflow', 'bypass').allowed;
            
            const validation: ValidationResult = {
                isValid: true, // Always valid in simplified version
                canProceed: true, // Always can proceed
                requiresApproval: false, // No approval requirements in simplified version
                requiresBypass: hasBypassPermission, // Show bypass option if user has permission
                errors: [],
                warnings: []
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
                warnings: []
            });
        } finally {
            setIsValidating(false);
        }
    };

    const handleConfirm = async () => {
        if (!validation || !user) return;

        try {
            // Convert duration to days if needed
            const durationInDays = durationUnit === 'hours' ? Math.ceil(estimatedDuration / 24) : estimatedDuration;

            // Record the stage transition in history
            await stageHistoryService.recordStageTransition({
                projectId: project.id,
                fromStageId: project.current_stage_id || undefined,
                toStageId: targetStage.id,
                userId: user.id,
                reason: validation.requiresBypass ? 'Manager bypass' : 'Normal transition',
                bypassRequired: validation.requiresBypass,
                bypassReason: validation.requiresBypass ? bypassReason : undefined,
                estimatedDuration: durationInDays
            });

            // Proceed with the transition
            if (validation.requiresBypass) {
                onConfirm(true, bypassReason, durationInDays);
            } else {
                onConfirm(false, undefined, durationInDays);
            }
        } catch (error) {
            console.error('Error recording stage transition:', error);
            // Show a warning but still proceed with the transition
            toast({
                title: "Warning",
                description: "Could not record transition in activity log, but proceeding with stage change",
                variant: "warning"
            });

            // Still proceed with the transition even if history recording fails
            const durationInDays = durationUnit === 'hours' ? Math.ceil(estimatedDuration / 24) : estimatedDuration;
            if (validation.requiresBypass) {
                onConfirm(true, bypassReason, durationInDays);
            } else {
                onConfirm(false, undefined, durationInDays);
            }
        }
    };

    const canProceed = validation?.canProceed || false;
    const hasErrors = validation?.errors.length || 0 > 0;
    const hasWarnings = validation?.warnings.length || 0 > 0;
    const requiresBypass = validation?.requiresBypass || false;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center space-x-2">
                    <ArrowRight className="w-5 h-5" />
                    <span>Stage Transition</span>
                </div>
            }
            description={`Transitioning to ${targetStage.name}`}
            showDescription={true}
            maxWidth="max-w-3xl"
        >
            {isValidating ? (
                <div className="flex items-center justify-center py-8">
                    <Clock className="w-6 h-6 animate-spin mr-2" />
                    <span>Validating transition...</span>
                </div>
            ) : validation ? (
                <>
                    {/* Duration Estimation Section */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Duration Estimation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Estimated Duration</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="duration"
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={estimatedDuration}
                                            onChange={(e) => setEstimatedDuration(parseFloat(e.target.value) || 0)}
                                            placeholder="Enter duration"
                                        />
                                        <select
                                            value={durationUnit}
                                            onChange={(e) => setDurationUnit(e.target.value as 'days' | 'hours')}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="days">Days</option>
                                            <option value="hours">Hours</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Default Duration</Label>
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        <div className="text-sm text-gray-600">
                                            {targetStage.estimated_duration_days ?
                                                `${targetStage.estimated_duration_days} days` :
                                                'No default duration set'
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 text-sm text-gray-600">
                                <p>
                                    <strong>Note:</strong> If no duration is specified, the default duration of {targetStage.estimated_duration_days || 0} days will be used.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bypass Section */}
                    {(requiresBypass || checkPermission('workflow', 'bypass').allowed) && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-yellow-600" />
                                    Manager Bypass
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-3">
                                    As a manager, you can bypass standard validation requirements. 
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

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!canProceed || (requiresBypass && !bypassReason.trim())}
                        >
                            {requiresBypass ? 'Proceed with Bypass' : 'Proceed'}
                        </Button>
                    </div>
                </>
            ) : null}
        </Modal>
    );
}
