import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    FileText,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Upload,
    Eye,
    Clock,
    Info,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import { WorkflowStage } from '@/types/project';
import {
    documentRequirementsService,
    DocumentRequirement,
    DocumentValidationResult,
    StageDocumentStatus
} from '@/services/documentRequirementsService';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DocumentRequirementIndicatorProps {
    projectId: string;
    stage: WorkflowStage;
    isCurrentStage?: boolean;
    showDetails?: boolean;
    onUploadClick?: (requirement: DocumentRequirement) => void;
    onViewDocuments?: (requirement: DocumentRequirement) => void;
}

export const DocumentRequirementIndicator: React.FC<DocumentRequirementIndicatorProps> = ({
    projectId,
    stage,
    isCurrentStage = false,
    showDetails = false,
    onUploadClick,
    onViewDocuments
}) => {
    const [status, setStatus] = useState<StageDocumentStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(showDetails);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDocumentStatus();
    }, [projectId, stage.id]);

    const loadDocumentStatus = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const stageStatus = await documentRequirementsService.getProjectDocumentStatus(
                projectId,
                [stage]
            );

            if (stageStatus.length > 0) {
                setStatus(stageStatus[0]);
            } else {
                setStatus(null);
            }
        } catch (err) {
            console.error('Error loading document status:', err);
            setError('Failed to load document requirements');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (requirement: DocumentRequirement, validation: DocumentValidationResult) => {
        const isMissing = validation.missing.some(req => req.id === requirement.id);
        const hasIssues = validation.invalid.some(inv => inv.requirement.id === requirement.id);

        if (isMissing) {
            return requirement.required ?
                <XCircle className="w-4 h-4 text-red-500" /> :
                <Clock className="w-4 h-4 text-yellow-500" />;
        }

        if (hasIssues) {
            return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        }

        return <CheckCircle className="w-4 h-4 text-green-500" />;
    };

    const getStatusColor = (requirement: DocumentRequirement, validation: DocumentValidationResult) => {
        const isMissing = validation.missing.some(req => req.id === requirement.id);
        const hasIssues = validation.invalid.some(inv => inv.requirement.id === requirement.id);

        if (isMissing) {
            return requirement.required ? 'text-red-600' : 'text-yellow-600';
        }

        if (hasIssues) {
            return 'text-yellow-600';
        }

        return 'text-green-600';
    };

    const getRequirementStatus = (requirement: DocumentRequirement, validation: DocumentValidationResult) => {
        const isMissing = validation.missing.some(req => req.id === requirement.id);
        const invalidEntry = validation.invalid.find(inv => inv.requirement.id === requirement.id);

        if (isMissing) {
            return requirement.required ? 'Missing (Required)' : 'Missing (Optional)';
        }

        if (invalidEntry) {
            return `Issues: ${invalidEntry.issues.join(', ')}`;
        }

        return 'Satisfied';
    };

    const getOverallStatusBadge = () => {
        if (!status) return null;

        const { validation } = status;
        const hasRequiredMissing = validation.missing.some(req => req.required);
        const hasRequiredInvalid = validation.invalid.some(inv => inv.requirement.required);

        if (hasRequiredMissing || hasRequiredInvalid) {
            return <Badge variant="destructive" className="text-xs">Incomplete</Badge>;
        }

        if (validation.missing.length > 0 || validation.invalid.length > 0) {
            return <Badge variant="secondary" className="text-xs">Partial</Badge>;
        }

        return <Badge variant="default" className="text-xs bg-green-100 text-green-800">Complete</Badge>;
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Loading requirements...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mb-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
        );
    }

    if (!status || status.requirements.length === 0) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4" />
                <span>No document requirements</span>
            </div>
        );
    }

    const { requirements, validation, completion_percentage } = status;

    return (
        <div className="space-y-2">
            {/* Summary Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Documents</span>
                    {getOverallStatusBadge()}
                </div>

                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1">
                                    <Progress value={completion_percentage} className="w-16 h-2" />
                                    <span className="text-xs text-muted-foreground">
                                        {completion_percentage}%
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-xs">
                                    <div>{validation.summary.satisfied} of {validation.summary.total_required} required documents</div>
                                    {validation.summary.missing > 0 && (
                                        <div className="text-red-600">{validation.summary.missing} missing</div>
                                    )}
                                    {validation.summary.invalid > 0 && (
                                        <div className="text-yellow-600">{validation.summary.invalid} with issues</div>
                                    )}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {requirements.length > 0 && (
                        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    {isExpanded ?
                                        <ChevronDown className="w-3 h-3" /> :
                                        <ChevronRight className="w-3 h-3" />
                                    }
                                </Button>
                            </CollapsibleTrigger>
                        </Collapsible>
                    )}
                </div>
            </div>

            {/* Detailed Requirements */}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleContent className="space-y-2">
                    {requirements.map((requirement) => {
                        const statusIcon = getStatusIcon(requirement, validation);
                        const statusColor = getStatusColor(requirement, validation);
                        const statusText = getRequirementStatus(requirement, validation);

                        return (
                            <Card key={requirement.id} className="border-l-4 border-l-muted">
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2 flex-1 min-w-0">
                                            {statusIcon}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-medium truncate">
                                                        {requirement.name}
                                                    </h4>
                                                    {requirement.required && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Required
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-1">
                                                    {requirement.description}
                                                </p>
                                                <div className={`text-xs font-medium ${statusColor}`}>
                                                    {statusText}
                                                </div>

                                                {/* File type and size info */}
                                                {(requirement.file_types || requirement.max_size_mb) && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {requirement.file_types && (
                                                            <span>Types: {requirement.file_types.join(', ')}</span>
                                                        )}
                                                        {requirement.file_types && requirement.max_size_mb && ' • '}
                                                        {requirement.max_size_mb && (
                                                            <span>Max: {requirement.max_size_mb}MB</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-1">
                                            {onViewDocuments && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => onViewDocuments(requirement)}
                                                            >
                                                                <Eye className="w-3 h-3" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>View related documents</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}

                                            {onUploadClick && isCurrentStage && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => onUploadClick(requirement)}
                                                            >
                                                                <Upload className="w-3 h-3" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Upload document</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {/* Validation Warnings */}
                    {validation.warnings.length > 0 && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-1">
                                    <p className="font-medium text-sm">Warnings:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {validation.warnings.map((warning, index) => (
                                            <li key={index} className="text-xs">{warning}</li>
                                        ))}
                                    </ul>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};