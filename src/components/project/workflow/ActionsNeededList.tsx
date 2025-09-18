import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Users,
    FileText,
    MessageSquare,
    ArrowRight,
    AlertCircle,
    UserPlus
} from "lucide-react";

import { Project, WorkflowSubStage, ProjectSubStageProgress } from '@/types/project';
import { useToast } from '@/shared/hooks/use-toast';

interface WorkflowValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    requiredActions: string[];
}

interface ActionsNeededListProps {
    project: Project;
    workflowValidation: WorkflowValidation | null;
    subStages: (WorkflowSubStage & { progress?: ProjectSubStageProgress })[];
}

interface ActionItem {
    id: string;
    type: 'assignment' | 'document' | 'validation' | 'communication' | 'approval';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'in_progress' | 'completed';
    relatedId?: string;
    relatedType?: string;
    estimatedTime?: string;
    responsibleRole?: string;
}

export function ActionsNeededList({
    project,
    workflowValidation,
    subStages
}: ActionsNeededListProps) {
    const { toast } = useToast();
    const [actions, setActions] = useState<ActionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Generate actions based on current state
    useEffect(() => {
        generateActions();
    }, [project, workflowValidation, subStages]);

    const generateActions = () => {
        try {
            setIsLoading(true);
            const generatedActions: ActionItem[] = [];

            // Check for unassigned sub-stages
            const unassignedSubStages = subStages.filter(subStage =>
                !subStage.progress?.assigned_to && subStage.is_required
            );

            unassignedSubStages.forEach(subStage => {
                generatedActions.push({
                    id: `assignment-${subStage.id}`,
                    type: 'assignment',
                    title: `Assign ${subStage.name}`,
                    description: `Assign a team member to complete ${subStage.name}`,
                    priority: 'high',
                    status: 'pending',
                    relatedId: subStage.id,
                    relatedType: 'sub_stage',
                    estimatedTime: subStage.estimated_duration_hours ? `${subStage.estimated_duration_hours}h` : 'N/A',
                    responsibleRole: subStage.responsible_roles?.[0] || 'management'
                });
            });

            // Check for incomplete required sub-stages
            const incompleteSubStages = subStages.filter(subStage =>
                subStage.is_required &&
                subStage.progress?.status !== 'completed' &&
                subStage.progress?.assigned_to
            );

            incompleteSubStages.forEach(subStage => {
                generatedActions.push({
                    id: `complete-${subStage.id}`,
                    type: 'validation',
                    title: `Complete ${subStage.name}`,
                    description: `Work on completing ${subStage.name}`,
                    priority: subStage.progress?.status === 'in_progress' ? 'medium' : 'high',
                    status: subStage.progress?.status === 'in_progress' ? 'in_progress' : 'pending',
                    relatedId: subStage.id,
                    relatedType: 'sub_stage',
                    estimatedTime: subStage.estimated_duration_hours ? `${subStage.estimated_duration_hours}h` : 'N/A',
                    responsibleRole: subStage.responsible_roles?.[0] || 'team'
                });
            });

            // Check for missing documents
            if (workflowValidation?.requiredActions) {
                workflowValidation.requiredActions.forEach((action, index) => {
                    if (action.toLowerCase().includes('document')) {
                        generatedActions.push({
                            id: `document-${index}`,
                            type: 'document',
                            title: 'Upload Required Documents',
                            description: action,
                            priority: 'high',
                            status: 'pending',
                            estimatedTime: '30m',
                            responsibleRole: 'sales'
                        });
                    }
                });
            }

            // Check for validation errors
            if (workflowValidation?.errors) {
                workflowValidation.errors.forEach((error, index) => {
                    generatedActions.push({
                        id: `validation-${index}`,
                        type: 'validation',
                        title: 'Fix Validation Error',
                        description: error,
                        priority: 'high',
                        status: 'pending',
                        estimatedTime: '1h',
                        responsibleRole: 'management'
                    });
                });
            }

            // Check for warnings
            if (workflowValidation?.warnings) {
                workflowValidation.warnings.forEach((warning, index) => {
                    generatedActions.push({
                        id: `warning-${index}`,
                        type: 'validation',
                        title: 'Address Warning',
                        description: warning,
                        priority: 'medium',
                        status: 'pending',
                        estimatedTime: '30m',
                        responsibleRole: 'team'
                    });
                });
            }

            // Check for missing project contacts
            if (!project.point_of_contacts || project.point_of_contacts.length === 0) {
                generatedActions.push({
                    id: 'contacts-missing',
                    type: 'validation',
                    title: 'Add Project Contacts',
                    description: 'Project must have at least one point of contact',
                    priority: 'high',
                    status: 'pending',
                    estimatedTime: '15m',
                    responsibleRole: 'sales'
                });
            }

            // Check for overdue items
            if (project.estimated_delivery_date) {
                const dueDate = new Date(project.estimated_delivery_date);
                const now = new Date();
                if (dueDate < now && project.status === 'inquiry') {
                    generatedActions.push({
                        id: 'overdue-project',
                        type: 'validation',
                        title: 'Project Overdue',
                        description: 'Project delivery date has passed',
                        priority: 'high',
                        status: 'pending',
                        estimatedTime: '2h',
                        responsibleRole: 'management'
                    });
                }
            }

            setActions(generatedActions);
        } catch (error) {
            console.error('Error generating actions:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to generate actions list.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Get action icon
    const getActionIcon = (type: ActionItem['type']) => {
        switch (type) {
            case 'assignment':
                return <UserPlus className="w-4 h-4" />;
            case 'document':
                return <FileText className="w-4 h-4" />;
            case 'validation':
                return <AlertCircle className="w-4 h-4" />;
            case 'communication':
                return <MessageSquare className="w-4 h-4" />;
            case 'approval':
                return <CheckCircle className="w-4 h-4" />;
            default:
                return <AlertTriangle className="w-4 h-4" />;
        }
    };

    // Get priority color
    const getPriorityColor = (priority: ActionItem['priority']) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get status color
    const getStatusColor = (status: ActionItem['status']) => {
        switch (status) {
            case 'completed':
                return 'text-green-600';
            case 'in_progress':
                return 'text-blue-600';
            case 'pending':
                return 'text-orange-600';
            default:
                return 'text-gray-600';
        }
    };

    // Handle action completion
    const handleActionComplete = (actionId: string) => {
        setActions(prev =>
            prev.map(action =>
                action.id === actionId
                    ? { ...action, status: 'completed' as const }
                    : action
            )
        );

        toast({
            title: "Action Completed",
            description: "Action marked as completed successfully.",
        });
    };

    // Filter actions by status
    const pendingActions = actions.filter(action => action.status === 'pending');
    const inProgressActions = actions.filter(action => action.status === 'in_progress');
    const completedActions = actions.filter(action => action.status === 'completed');

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <Clock className="w-6 h-6 animate-spin mr-2" />
                        <span>Generating actions...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Actions Needed
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary */}
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>{pendingActions.length} Pending</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{inProgressActions.length} In Progress</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{completedActions.length} Completed</span>
                    </div>
                </div>

                {/* No actions needed */}
                {actions.length === 0 && (
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            No actions needed at this time. All requirements are met.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Pending Actions */}
                {pendingActions.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-red-600">Pending Actions</h4>
                        <div className="space-y-2">
                            {pendingActions.map((action) => (
                                <div key={action.id} className="flex items-start gap-3 p-3 bg-red-50 rounded border border-red-200">
                                    <div className="text-red-600 mt-0.5">
                                        {getActionIcon(action.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className="text-sm font-medium text-red-900">{action.title}</h5>
                                            <Badge variant="secondary" className={`text-xs ${getPriorityColor(action.priority)}`}>
                                                {action.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-red-700 mb-2">{action.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-red-600">
                                            <Clock className="w-3 h-3" />
                                            <span>{action.estimatedTime}</span>
                                            <Users className="w-3 h-3" />
                                            <span>{action.responsibleRole}</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleActionComplete(action.id)}
                                        className="text-red-700 border-red-300 hover:bg-red-100"
                                    >
                                        <ArrowRight className="w-3 h-3 mr-1" />
                                        Start
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* In Progress Actions */}
                {inProgressActions.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-blue-600">In Progress</h4>
                        <div className="space-y-2">
                            {inProgressActions.map((action) => (
                                <div key={action.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded border border-blue-200">
                                    <div className="text-blue-600 mt-0.5">
                                        {getActionIcon(action.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className="text-sm font-medium text-blue-900">{action.title}</h5>
                                            <Badge variant="secondary" className={`text-xs ${getPriorityColor(action.priority)}`}>
                                                {action.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-blue-700 mb-2">{action.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-blue-600">
                                            <Clock className="w-3 h-3" />
                                            <span>{action.estimatedTime}</span>
                                            <Users className="w-3 h-3" />
                                            <span>{action.responsibleRole}</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleActionComplete(action.id)}
                                        className="text-blue-700 border-blue-300 hover:bg-blue-100"
                                    >
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Complete
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed Actions */}
                {completedActions.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-green-600">Completed</h4>
                        <div className="space-y-2">
                            {completedActions.map((action) => (
                                <div key={action.id} className="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
                                    <div className="text-green-600 mt-0.5">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className="text-sm font-medium text-green-900">{action.title}</h5>
                                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                                Completed
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-green-700">{action.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stage Completion Status */}
                <Separator />
                <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Stage Completion</h4>
                    <p className="text-xs text-gray-700">
                        Complete all high-priority actions to advance to the next stage.
                        Medium and low-priority actions can be addressed in the next stage if needed.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
