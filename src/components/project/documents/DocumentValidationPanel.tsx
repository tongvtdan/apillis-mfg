import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    FileText,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Upload,
    Eye,
    RefreshCw,
    ArrowRight,
    Info,
    Clock
} from 'lucide-react';
import { WorkflowStage } from '@/types/project';
import {
    documentRequirementsService,
    DocumentRequirement,
    DocumentValidationResult
} from '@/services/documentRequirementsService';
import { DocumentRequirementIndicator } from './DocumentRequirementIndicator';

interface DocumentValidationPanelProps {
    projectId: string;
    currentStage: WorkflowStage;
    targetStage: WorkflowStage;
    onUploadClick?: (requirement: DocumentRequirement) => void;
    onViewDocuments?: (requirement: DocumentRequirement) => void;
    onValidationComplete?: (canAdvance: boolean, blockers: string[], warnings: string[]) => void;
}

export const DocumentValidationPanel: React.FC<DocumentValidationPanelProps> = ({
    projectId,
    currentStage,
    targetStage,
    onUploadClick,
    onViewDocuments,
    onValidationComplete
}) => {
    const [validation, setValidation] = useState<{
        canAdvance: boolean;
        blockers: string[];
        warnings: string[];
        validation: DocumentValidationResult;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastValidated, setLastValidated] = useState<Date | null>(null);

    useEffect(() => {
        validateDocuments();
    }, [projectId, targetStage.id]);

    useEffect(() => {
        if (validation && onValidationComplete) {
            onValidationComplete(validation.canAdvance, validation.blockers, validation.warnings);
        }
    }, [validation, onValidationComplete]);

    const validateDocuments = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await documentRequirementsService.canAdvanceToStage(projectId, targetStage.id);
            setValidation(result);
            setLastValidated(new Date());
        } catch (err) {
            console.error('Error validating documents:', err);
            setError('Failed to validate document requirements');
        } finally {
            setIsLoading(false);
        }
    };

    const getOverallStatus = () => {
        if (!validation) return null;

        if (validation.canAdvance) {
            return {
                icon: <CheckCircle className="w-5 h-5 text-green-600" />,
                text: 'Documents Ready',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200'
            };
        }

        if (validation.blockers.length > 0) {
            return {
                icon: <XCircle className="w-5 h-5 text-red-600" />,
                text: 'Documents Incomplete',
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200'
            };
        }

        return {
            icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
            text: 'Documents Partial',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200'
        };
    };

    const getCompletionPercentage = () => {
        if (!validation) return 0;

        const { summary } = validation.validation;
        if (summary.total_required === 0) return 100;

        return Math.round((summary.satisfied / summary.total_required) * 100);
    };

    const status = getOverallStatus();
    const completionPercentage = getCompletionPercentage();

    return (
        <Card className={`${status?.borderColor || 'border-muted'}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Document Validation
                    </CardTitle>

                    <div className="flex items-center gap-2">
                        {lastValidated && (
                            <span className="text-xs text-muted-foreground">
                                Last checked: {lastValidated.toLocaleTimeString()}
                            </span>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={validateDocuments}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

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
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Error State */}
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Loading State */}
                {isLoading && !validation && (
                    <div className="flex items-center justify-center py-8">
                        <Clock className="w-6 h-6 animate-spin mr-2" />
                        <span>Validating documents...</span>
                    </div>
                )}

                {/* Validation Results */}
                {validation && (
                    <Tabs defaultValue="summary" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="summary">Summary</TabsTrigger>
                            <TabsTrigger value="requirements">Requirements</TabsTrigger>
                            <TabsTrigger value="issues">Issues</TabsTrigger>
                        </TabsList>

                        <TabsContent value="summary" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {validation.validation.summary.satisfied}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Required Documents Satisfied
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-red-600">
                                            {validation.validation.summary.missing + validation.validation.summary.invalid}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Issues to Resolve
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Stage Transition Info */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium">Stage Transition</h4>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div>
                                            <span className="text-muted-foreground">From:</span>
                                            <Badge variant="outline" className="ml-2">
                                                {currentStage.name}
                                            </Badge>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">To:</span>
                                            <Badge variant="outline" className="ml-2">
                                                {targetStage.name}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Summary */}
                            <div className="space-y-2">
                                {validation.canAdvance ? (
                                    <Alert>
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            All required documents are satisfied. You can proceed with the stage transition.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <Alert variant="destructive">
                                        <XCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {validation.blockers.length} issue(s) must be resolved before advancing to the next stage.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {validation.warnings.length > 0 && (
                                    <Alert>
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            {validation.warnings.length} warning(s) - recommended but not required.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="requirements" className="space-y-4">
                            <DocumentRequirementIndicator
                                projectId={projectId}
                                stage={targetStage}
                                isCurrentStage={true}
                                showDetails={true}
                                onUploadClick={onUploadClick}
                                onViewDocuments={onViewDocuments}
                            />
                        </TabsContent>

                        <TabsContent value="issues" className="space-y-4">
                            {/* Blockers */}
                            {validation.blockers.length > 0 && (
                                <Card className="border-red-200">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-red-600 flex items-center gap-2">
                                            <XCircle className="w-4 h-4" />
                                            Blockers ({validation.blockers.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {validation.blockers.map((blocker, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm">
                                                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                    <span>{blocker}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Warnings */}
                            {validation.warnings.length > 0 && (
                                <Card className="border-yellow-200">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-yellow-600 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Warnings ({validation.warnings.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {validation.warnings.map((warning, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm">
                                                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                                    <span>{warning}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {/* No Issues */}
                            {validation.blockers.length === 0 && validation.warnings.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                    <p>No issues found with document requirements</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}

                {/* Quick Actions */}
                {validation && !validation.canAdvance && onUploadClick && (
                    <div className="flex gap-2 pt-4 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                // Find the first missing required document
                                const firstMissing = validation.validation.missing.find(req => req.required);
                                if (firstMissing && onUploadClick) {
                                    onUploadClick(firstMissing);
                                }
                            }}
                            disabled={validation.validation.missing.filter(req => req.required).length === 0}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Missing Document
                        </Button>

                        {onViewDocuments && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    // View all documents for this stage
                                    const firstRequirement = validation.validation.missing[0] ||
                                        validation.validation.invalid[0]?.requirement;
                                    if (firstRequirement && onViewDocuments) {
                                        onViewDocuments(firstRequirement);
                                    }
                                }}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View Documents
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};