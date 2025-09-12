import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { Project, WorkflowStage } from '@/types/project';

interface BaseStageViewProps {
    project: Project;
    currentStage: WorkflowStage;
    nextStage?: WorkflowStage;
    validation: any;
    isLoading: boolean;
    error: string | null;
    onRefresh: () => void;
}

export const BaseStageView: React.FC<BaseStageViewProps> = ({
    project,
    currentStage,
    nextStage,
    validation,
    isLoading,
    error,
    onRefresh,
    children
}) => {
    const getOverallStatus = () => {
        if (!validation) return null;

        if (validation.requiredPassed) {
            return {
                icon: <CheckCircle className="w-5 h-5 text-green-600" />,
                text: nextStage ? `Ready for ${nextStage.name}` : 'Ready for Next Stage',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200'
            };
        }

        if (validation.blockers.length > 0) {
            return {
                icon: <XCircle className="w-5 h-5 text-red-600" />,
                text: nextStage ? `Not Ready for ${nextStage.name}` : 'Not Ready for Next Stage',
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200'
            };
        }

        return {
            icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
            text: nextStage ? `Partially Ready for ${nextStage.name}` : 'Partially Ready',
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

    return (
        <Card className={`${status?.borderColor || 'border-muted'}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {nextStage ? `Prerequisite Validation: ${currentStage?.name || 'Current Stage'} → ${nextStage.name}` : 'Prerequisite Validation'}
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Exit Criteria Display */}
                {currentStage?.exit_criteria && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <h4 className="text-sm font-medium text-blue-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Exit Criteria for {currentStage.name}
                        </h4>
                        <p className="text-sm text-blue-700 mt-1">{currentStage.exit_criteria}</p>
                    </div>
                )}
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

                        {children}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};