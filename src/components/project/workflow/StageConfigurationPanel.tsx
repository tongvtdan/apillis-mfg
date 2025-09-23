import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Settings,
    CheckCircle,
    Clock,
    AlertCircle,
    Users,
    FileText,
    ArrowRight,
    Info
} from "lucide-react";
import { Project, WorkflowStage } from "@/types/project";
import { workflowStageService } from "@/services/workflowStageService";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";

interface StageConfigurationPanelProps {
    project: Project;
    onStageUpdate?: (stageId: string) => void;
}

interface StageRequirement {
    id: string;
    name: string;
    description: string;
    type: 'document' | 'approval' | 'data' | 'review';
    status: 'completed' | 'pending' | 'in_progress';
    required: boolean;
}

export function StageConfigurationPanel({ project, onStageUpdate }: StageConfigurationPanelProps) {
    const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const fetchStages = async () => {
            try {
                const stages = await workflowStageService.getWorkflowStages();
                setWorkflowStages(stages);
            } catch (error) {
                console.error('Error fetching workflow stages:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStages();
    }, []);
    const [currentStage, setCurrentStage] = useState<WorkflowStage | null>(null);
    const [nextStages, setNextStages] = useState<WorkflowStage[]>([]);
    const [stageRequirements, setStageRequirements] = useState<StageRequirement[]>([]);

    useEffect(() => {
        if (workflowStages.length > 0 && project.current_stage_id) {
            const current = workflowStages.find(stage => stage.id === project.current_stage_id);
            setCurrentStage(current || null);

            if (current) {
                // Get next available stages
                const currentIndex = workflowStages.findIndex(s => s.id === current.id);
                const availableNext = workflowStages.slice(currentIndex + 1, currentIndex + 3); // Show next 2 stages
                setNextStages(availableNext);

                // Generate stage requirements based on current stage
                generateStageRequirements(current);
            }
        }
    }, [workflowStages, project.current_stage_id]);

    const generateStageRequirements = (stage: WorkflowStage) => {
        // Generate requirements based on stage configuration
        const requirements: StageRequirement[] = [];

        // Parse exit criteria if available
        if (stage.exit_criteria) {
            try {
                const criteria = JSON.parse(stage.exit_criteria);
                if (Array.isArray(criteria)) {
                    criteria.forEach((criterion, index) => {
                        requirements.push({
                            id: `criteria_${index}`,
                            name: criterion,
                            description: `Complete: ${criterion}`,
                            type: 'review',
                            status: getRequirementStatus(criterion, project),
                            required: true
                        });
                    });
                }
            } catch (error) {
                // If exit_criteria is not JSON, treat as plain text
                if (stage.exit_criteria.trim()) {
                    requirements.push({
                        id: 'criteria_text',
                        name: stage.exit_criteria,
                        description: stage.exit_criteria,
                        type: 'review',
                        status: 'pending',
                        required: true
                    });
                }
            }
        }

        // Add default requirements based on stage name
        const defaultRequirements = getDefaultRequirements(stage.name, project);
        requirements.push(...defaultRequirements);

        setStageRequirements(requirements);
    };

    const getRequirementStatus = (criterion: string, project: Project): 'completed' | 'pending' | 'in_progress' => {
        // Basic logic to determine requirement status based on project data
        const lowerCriterion = criterion.toLowerCase();

        if (lowerCriterion.includes('customer') && project.customer_organization_id) {
            return 'completed';
        }
        if (lowerCriterion.includes('description') && project.description) {
            return 'completed';
        }
        if (lowerCriterion.includes('value') && project.estimated_value) {
            return 'completed';
        }
        if (lowerCriterion.includes('review') && project.notes) {
            return 'in_progress';
        }

        return 'pending';
    };

    const getDefaultRequirements = (stageName: string, project: Project): StageRequirement[] => {
        const requirements: StageRequirement[] = [];

        switch (stageName) {
            case 'Inquiry Received':
                requirements.push(
                    {
                        id: 'customer_info',
                        name: 'Customer Information',
                        description: 'Customer details and contact information must be complete',
                        type: 'data',
                        status: project.customer_organization_id ? 'completed' : 'pending',
                        required: true
                    },
                    {
                        id: 'project_description',
                        name: 'Project Description',
                        description: 'Detailed project requirements and specifications',
                        type: 'data',
                        status: project.description ? 'completed' : 'pending',
                        required: true
                    }
                );
                break;

            case 'Technical Review':
                requirements.push(
                    {
                        id: 'engineering_review',
                        name: 'Engineering Review',
                        description: 'Engineering feasibility assessment completed',
                        type: 'review',
                        status: 'pending',
                        required: true
                    },
                    {
                        id: 'qa_review',
                        name: 'QA Review',
                        description: 'Quality assurance requirements defined',
                        type: 'review',
                        status: 'pending',
                        required: true
                    },
                    {
                        id: 'production_review',
                        name: 'Production Review',
                        description: 'Production capability evaluation completed',
                        type: 'review',
                        status: 'pending',
                        required: true
                    }
                );
                break;

            case 'Supplier RFQ':
                requirements.push(
                    {
                        id: 'bom_breakdown',
                        name: 'BOM Breakdown',
                        description: 'Bill of materials breakdown completed',
                        type: 'document',
                        status: 'pending',
                        required: true
                    },
                    {
                        id: 'supplier_selection',
                        name: 'Supplier Selection',
                        description: 'Suppliers selected and RFQs sent',
                        type: 'data',
                        status: 'pending',
                        required: true
                    }
                );
                break;

            case 'Quoted':
                requirements.push(
                    {
                        id: 'quote_preparation',
                        name: 'Quote Preparation',
                        description: 'Final quote document prepared and reviewed',
                        type: 'document',
                        status: project.estimated_value ? 'completed' : 'pending',
                        required: true
                    },
                    {
                        id: 'customer_submission',
                        name: 'Customer Submission',
                        description: 'Quote submitted to customer',
                        type: 'data',
                        status: 'pending',
                        required: true
                    }
                );
                break;

            default:
                // Generic requirements for other stages
                requirements.push({
                    id: 'stage_completion',
                    name: 'Stage Completion',
                    description: `Complete all ${stageName} activities`,
                    type: 'review',
                    status: 'pending',
                    required: true
                });
        }

        return requirements;
    };

    const getRequirementIcon = (type: StageRequirement['type']) => {
        switch (type) {
            case 'document':
                return FileText;
            case 'approval':
                return CheckCircle;
            case 'review':
                return Users;
            case 'data':
                return Info;
            default:
                return Clock;
        }
    };

    const getStatusColor = (status: StageRequirement['status']) => {
        switch (status) {
            case 'completed':
                return 'text-green-600';
            case 'in_progress':
                return 'text-blue-600';
            case 'pending':
                return 'text-gray-400';
            default:
                return 'text-gray-400';
        }
    };

    const getStatusBadge = (status: StageRequirement['status']) => {
        switch (status) {
            case 'completed':
                return <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>;
            case 'in_progress':
                return <Badge variant="default" className="bg-blue-100 text-blue-800">In Progress</Badge>;
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    const canAdvanceToStage = (targetStage: WorkflowStage): boolean => {
        const requiredRequirements = stageRequirements.filter(req => req.required);
        const completedRequired = requiredRequirements.filter(req => req.status === 'completed');
        return completedRequired.length === requiredRequirements.length;
    };

    const handleStageAdvance = async (targetStageId: string) => {
        if (onStageUpdate) {
            onStageUpdate(targetStageId);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <Clock className="w-5 h-5 animate-spin mr-2" />
                        <span>Loading stage configuration...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!currentStage) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p>No current stage found for this project</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Current Stage Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Current Stage: {currentStage.name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {currentStage.description && (
                        <p className="text-sm text-muted-foreground">{currentStage.description}</p>
                    )}

                    {/* Stage Requirements */}
                    <div>
                        <h4 className="font-medium mb-3">Stage Requirements</h4>
                        <div className="space-y-3">
                            {stageRequirements.map((requirement) => {
                                const Icon = getRequirementIcon(requirement.type);
                                return (
                                    <div key={requirement.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                        <Icon className={`w-4 h-4 mt-0.5 ${getStatusColor(requirement.status)}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h5 className="font-medium text-sm">{requirement.name}</h5>
                                                {getStatusBadge(requirement.status)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{requirement.description}</p>
                                            {requirement.required && (
                                                <Badge variant="outline" className="mt-1 text-xs">Required</Badge>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stage Progress Summary */}
                    <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm">
                                {stageRequirements.filter(req => req.status === 'completed').length} / {stageRequirements.length} Complete
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${(stageRequirements.filter(req => req.status === 'completed').length / stageRequirements.length) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Next Available Stages */}
            {nextStages.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowRight className="w-5 h-5" />
                            Next Available Stages
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {nextStages.map((stage) => {
                            const canAdvance = canAdvanceToStage(stage);
                            return (
                                <div key={stage.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${stage.color ? `bg-${stage.color}-500` : 'bg-gray-400'}`} />
                                        <div>
                                            <h5 className="font-medium text-sm">{stage.name}</h5>
                                            {stage.description && (
                                                <p className="text-xs text-muted-foreground">{stage.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {canAdvance ? (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleStageAdvance(stage.id)}
                                                            className="text-xs"
                                                        >
                                                            Advance
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>All requirements met - ready to advance</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled
                                                            className="text-xs"
                                                        >
                                                            Requirements Pending
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Complete current stage requirements first</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}