import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    ArrowRight,
    FileText,
    Users,
    MessageSquare
} from 'lucide-react';
import { useCurrentWorkflow, useWorkflowValidation } from './useWorkflow';
import { cn } from '@/lib/utils';

interface StageGateBannerProps {
    projectId: string;
    className?: string;
    onAdvanceStage?: (stageId: string) => void;
    onViewRequirements?: () => void;
}

export function StageGateBanner({
    projectId,
    className,
    onAdvanceStage,
    onViewRequirements
}: StageGateBannerProps) {
    const { currentStage, workflowValidation, loading } = useCurrentWorkflow();
    const { isValid, errors, warnings, requiredActions } = useWorkflowValidation();

    if (loading) {
        return (
            <Card className={cn("border-l-4 border-l-blue-500", className)}>
                <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading workflow state...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!currentStage) {
        return null;
    }

    // Determine banner type based on validation state
    const getBannerType = () => {
        if (isValid && requiredActions.length === 0) {
            return 'success';
        } else if (warnings.length > 0 && errors.length === 0) {
            return 'warning';
        } else {
            return 'error';
        }
    };

    const bannerType = getBannerType();

    const getBannerConfig = () => {
        switch (bannerType) {
            case 'success':
                return {
                    icon: CheckCircle,
                    borderColor: 'border-l-green-500',
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-800',
                    iconColor: 'text-green-600'
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    borderColor: 'border-l-yellow-500',
                    bgColor: 'bg-yellow-50',
                    textColor: 'text-yellow-800',
                    iconColor: 'text-yellow-600'
                };
            case 'error':
                return {
                    icon: AlertTriangle,
                    borderColor: 'border-l-red-500',
                    bgColor: 'bg-red-50',
                    textColor: 'text-red-800',
                    iconColor: 'text-red-600'
                };
            default:
                return {
                    icon: Clock,
                    borderColor: 'border-l-blue-500',
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-800',
                    iconColor: 'text-blue-600'
                };
        }
    };

    const config = getBannerConfig();
    const Icon = config.icon;

    const getBannerMessage = () => {
        if (bannerType === 'success') {
            return `Ready to advance from ${currentStage.name}`;
        } else if (bannerType === 'warning') {
            return `Complete remaining requirements to advance from ${currentStage.name}`;
        } else {
            return `Cannot advance from ${currentStage.name} - requirements not met`;
        }
    };

    return (
        <Card className={cn("border-l-4", config.borderColor, className)}>
            <CardContent className={cn("p-4", config.bgColor)}>
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <Icon className={cn("h-5 w-5 mt-0.5", config.iconColor)} />
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <h3 className={cn("font-medium", config.textColor)}>
                                    {getBannerMessage()}
                                </h3>
                                <Badge variant="outline" className={config.textColor}>
                                    {currentStage.name}
                                </Badge>
                            </div>

                            {/* Show errors */}
                            {errors.length > 0 && (
                                <Alert className="border-red-200 bg-red-50">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                        <ul className="list-disc list-inside space-y-1">
                                            {errors.map((error, index) => (
                                                <li key={index} className="text-sm">{error}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Show warnings */}
                            {warnings.length > 0 && (
                                <Alert className="border-yellow-200 bg-yellow-50">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    <AlertDescription className="text-yellow-800">
                                        <ul className="list-disc list-inside space-y-1">
                                            {warnings.map((warning, index) => (
                                                <li key={index} className="text-sm">{warning}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Show required actions */}
                            {requiredActions.length > 0 && (
                                <div className="space-y-1">
                                    <p className={cn("text-sm font-medium", config.textColor)}>
                                        Required Actions:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {requiredActions.map((action, index) => (
                                            <li key={index} className={cn("text-sm", config.textColor)}>
                                                {action}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2">
                        {onViewRequirements && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onViewRequirements}
                                className={config.textColor}
                            >
                                <FileText className="h-4 w-4 mr-1" />
                                View Requirements
                            </Button>
                        )}

                        {bannerType === 'success' && onAdvanceStage && (
                            <Button
                                size="sm"
                                onClick={() => onAdvanceStage(currentStage.id)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <ArrowRight className="h-4 w-4 mr-1" />
                                Advance Stage
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Compact version of StageGateBanner for use in smaller spaces
 */
export function StageGateBannerCompact({
    projectId,
    className
}: Omit<StageGateBannerProps, 'onAdvanceStage' | 'onViewRequirements'>) {
    const { currentStage, workflowValidation } = useCurrentWorkflow();
    const { isValid, errors, warnings } = useWorkflowValidation();

    if (!currentStage) {
        return null;
    }

    const hasIssues = errors.length > 0 || warnings.length > 0;
    const statusColor = isValid && !hasIssues ? 'text-green-600' : 'text-yellow-600';
    const statusIcon = isValid && !hasIssues ? CheckCircle : AlertTriangle;

    return (
        <div className={cn("flex items-center space-x-2 p-2 rounded-md bg-muted/50", className)}>
            <statusIcon className={cn("h-4 w-4", statusColor)} />
            <span className={cn("text-sm font-medium", statusColor)}>
                {currentStage.name}
            </span>
            {hasIssues && (
                <Badge variant="outline" className="text-xs">
                    {errors.length + warnings.length} issues
                </Badge>
            )}
        </div>
    );
}
