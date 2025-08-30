import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Calendar,
    DollarSign,
    Users,
    Clock,
    AlertTriangle,
    CheckCircle,
    FileText,
    MessageSquare,
    TrendingUp,
    MapPin,
    Eye
} from "lucide-react";
import { Project, PROJECT_STAGES, PRIORITY_COLORS, WorkflowStage } from "@/types/project";
import { workflowStageService } from '@/services/workflowStageService';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useUserDisplayName } from "@/hooks/useUsers";

interface EnhancedProjectSummaryProps {
    project: Project;
    showFullDetails?: boolean;
    showActions?: boolean;
}

export function EnhancedProjectSummary({
    project,
    showFullDetails = false,
    showActions = true
}: EnhancedProjectSummaryProps) {
    const navigate = useNavigate();
    const assigneeDisplayName = useUserDisplayName(project.assigned_to || project.assignee_id);
    const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>([]);

    // Load workflow stages
    useEffect(() => {
        const loadStages = async () => {
            try {
                const stages = await workflowStageService.getWorkflowStages();
                setWorkflowStages(stages);
            } catch (error) {
                console.error('Error loading workflow stages:', error);
                setWorkflowStages([]);
            }
        };
        loadStages();
    }, []);

    // Calculate workflow progress using dynamic stages
    const progressCalculation = useMemo(() => {
        if (workflowStages.length === 0) {
            return { progressPercentage: 0, currentStageIndex: -1 };
        }

        let currentStageIndex = -1;

        if (project.current_stage_id) {
            // Use current_stage_id (preferred)
            currentStageIndex = workflowStages.findIndex(stage => stage.id === project.current_stage_id);
        } else if (project.current_stage) {
            // Fallback to legacy current_stage mapping
            currentStageIndex = workflowStages.findIndex(stage =>
                stage.name.toLowerCase().replace(/\s+/g, '_') === project.current_stage ||
                stage.name === project.current_stage
            );
        }

        const progressPercentage = currentStageIndex >= 0 && workflowStages.length > 1
            ? Math.round((currentStageIndex / (workflowStages.length - 1)) * 100)
            : 0;

        return { progressPercentage, currentStageIndex };
    }, [project.current_stage_id, project.current_stage, workflowStages]);

    const { progressPercentage } = progressCalculation;

    // Get priority with fallback
    const priority = project.priority_level || project.priority || 'medium';

    // Format currency
    const formatCurrency = (amount: number | null | undefined) => {
        if (!amount) return 'Not specified';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString();
    };

    // Get stage info using dynamic stages
    const currentStageInfo = useMemo(() => {
        if (workflowStages.length === 0) return null;

        if (project.current_stage_id) {
            return workflowStages.find(stage => stage.id === project.current_stage_id);
        } else if (project.current_stage) {
            return workflowStages.find(stage =>
                stage.name.toLowerCase().replace(/\s+/g, '_') === project.current_stage ||
                stage.name === project.current_stage
            );
        }

        return null;
    }, [project.current_stage_id, project.current_stage, workflowStages]);

    // Calculate urgency indicators
    const getUrgencyIndicators = () => {
        const indicators = [];

        if (priority === 'urgent') {
            indicators.push({ type: 'priority', message: 'Urgent Priority', severity: 'high' });
        }

        if (project.days_in_stage > 14) {
            indicators.push({ type: 'time', message: `${project.days_in_stage} days in stage`, severity: 'high' });
        } else if (project.days_in_stage > 7) {
            indicators.push({ type: 'time', message: `${project.days_in_stage} days in stage`, severity: 'medium' });
        }

        if (project.status === 'delayed') {
            indicators.push({ type: 'status', message: 'Project Delayed', severity: 'high' });
        }

        const dueDate = project.estimated_delivery_date || project.due_date;
        if (dueDate && new Date(dueDate) < new Date()) {
            indicators.push({ type: 'deadline', message: 'Past Due Date', severity: 'high' });
        }

        return indicators;
    };

    const urgencyIndicators = getUrgencyIndicators();

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                                {project.project_id}
                            </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                            {project.description || 'No description provided'}
                        </CardDescription>
                    </div>

                    {showActions && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/project/${project.id}`)}
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                            </Button>
                        </div>
                    )}
                </div>

                {/* Priority and Status Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                    </Badge>

                    <Badge variant="outline" className={currentStageInfo?.color || 'bg-gray-100 text-gray-800'}>
                        {currentStageInfo?.name || currentStage}
                    </Badge>

                    {project.status !== 'active' && (
                        <Badge variant="secondary">
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                    )}

                    {project.source && project.source !== 'manual' && (
                        <Badge variant="outline" className="text-xs">
                            Source: {project.source}
                        </Badge>
                    )}
                </div>

                {/* Urgency Indicators */}
                {urgencyIndicators.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {urgencyIndicators.map((indicator, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${indicator.severity === 'high'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-orange-100 text-orange-800'
                                    }`}
                            >
                                <AlertTriangle className="h-3 w-3" />
                                {indicator.message}
                            </div>
                        ))}
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Workflow Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Workflow Progress</span>
                        <span className="text-muted-foreground">{progressPercentage}% Complete</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{project.days_in_stage} days in current stage</span>
                    </div>
                </div>

                {/* Key Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Financial Information */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Estimated Value:</span>
                            <span>{formatCurrency(project.estimated_value)}</span>
                        </div>

                        {project.priority_score && (
                            <div className="flex items-center gap-2 text-sm">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Priority Score:</span>
                                <span>{project.priority_score}/100</span>
                            </div>
                        )}
                    </div>

                    {/* Timeline Information */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Due Date:</span>
                            <span>{formatDate(project.estimated_delivery_date || project.due_date)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Assigned To:</span>
                            <span>{assigneeDisplayName || 'Unassigned'}</span>
                        </div>
                    </div>
                </div>

                {/* Customer Information */}
                {project.customer && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                            <MapPin className="h-4 w-4" />
                            Customer Information
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="font-medium">Company:</span> {project.customer.company || project.customer.name}
                            </div>
                            {project.customer.email && (
                                <div>
                                    <span className="font-medium">Email:</span> {project.customer.email}
                                </div>
                            )}
                            {project.customer.phone && (
                                <div>
                                    <span className="font-medium">Phone:</span> {project.customer.phone}
                                </div>
                            )}
                            {project.customer.country && (
                                <div>
                                    <span className="font-medium">Country:</span> {project.customer.country}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                    <div className="space-y-2">
                        <span className="text-sm font-medium">Tags:</span>
                        <div className="flex flex-wrap gap-1">
                            {project.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Notes */}
                {project.notes && showFullDetails && (
                    <div className="space-y-2">
                        <span className="text-sm font-medium">Notes:</span>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            {project.notes}
                        </p>
                    </div>
                )}

                {/* Metadata */}
                {project.metadata && Object.keys(project.metadata).length > 0 && showFullDetails && (
                    <div className="space-y-2">
                        <span className="text-sm font-medium">Additional Information:</span>
                        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            <pre className="whitespace-pre-wrap">
                                {JSON.stringify(project.metadata, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Timestamps */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>Created: {formatDate(project.created_at)}</span>
                    <span>Updated: {formatDate(project.updated_at)}</span>
                </div>
            </CardContent>
        </Card>
    );
}