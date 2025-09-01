import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    Edit,
    Eye,
    ArrowRight,
    Users,
    Upload,
    Send,
    Phone,
    Mail,
    Clipboard,
    Settings,
    Play,
    Target,
    Calendar
} from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Project, WorkflowStage } from "@/types/project";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";

interface ProjectSummaryCardProps {
    project: Project;
    workflowStages?: WorkflowStage[];
    onEdit?: () => void;
    onViewDetails?: () => void;
    className?: string;
}

interface ActionItem {
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    icon: React.ElementType;
    action: () => void;
    completed?: boolean;
    dueDate?: string;
}

export function ProjectSummaryCard({
    project,
    workflowStages = [],
    onEdit,
    onViewDetails,
    className
}: ProjectSummaryCardProps) {

    // Get actions needed for current stage
    const getStageActions = (): ActionItem[] => {
        const currentStageName = project.current_stage?.name || '';

        const stageActionMap: Record<string, ActionItem[]> = {
            'Inquiry Received': [
                {
                    id: 'verify-customer',
                    title: 'Verify Customer Information',
                    description: 'Confirm customer contact details and requirements',
                    priority: 'high',
                    icon: Users,
                    action: () => console.log('Verify customer'),
                    completed: false
                },
                {
                    id: 'upload-rfq',
                    title: 'Upload RFQ Documents',
                    description: 'Upload customer RFQ files and specifications',
                    priority: 'high',
                    icon: Upload,
                    action: () => console.log('Upload documents'),
                    completed: false
                },
                {
                    id: 'assign-reviewer',
                    title: 'Assign Technical Reviewer',
                    description: 'Assign engineering team member for technical review',
                    priority: 'medium',
                    icon: Users,
                    action: () => console.log('Assign reviewer'),
                    completed: false
                }
            ],
            'Technical Review': [
                {
                    id: 'engineering-review',
                    title: 'Complete Engineering Review',
                    description: 'Assess technical feasibility and manufacturing requirements',
                    priority: 'high',
                    icon: Clipboard,
                    action: () => console.log('Engineering review'),
                    completed: false
                },
                {
                    id: 'qa-review',
                    title: 'Complete QA Review',
                    description: 'Define quality requirements and inspection plans',
                    priority: 'high',
                    icon: CheckCircle2,
                    action: () => console.log('QA review'),
                    completed: false
                },
                {
                    id: 'production-review',
                    title: 'Complete Production Review',
                    description: 'Evaluate production capacity and timeline',
                    priority: 'high',
                    icon: Settings,
                    action: () => console.log('Production review'),
                    completed: false
                }
            ],
            'Supplier RFQ': [
                {
                    id: 'create-bom',
                    title: 'Create Bill of Materials',
                    description: 'Break down components and materials needed',
                    priority: 'high',
                    icon: Package,
                    action: () => console.log('Create BOM'),
                    completed: false
                },
                {
                    id: 'select-suppliers',
                    title: 'Select Suppliers',
                    description: 'Choose suppliers for each component category',
                    priority: 'high',
                    icon: Users,
                    action: () => console.log('Select suppliers'),
                    completed: false
                },
                {
                    id: 'send-rfqs',
                    title: 'Send RFQs to Suppliers',
                    description: 'Distribute RFQ packages to selected suppliers',
                    priority: 'medium',
                    icon: Send,
                    action: () => console.log('Send RFQs'),
                    completed: false
                }
            ],
            'Quoted': [
                {
                    id: 'compile-quotes',
                    title: 'Compile Supplier Quotes',
                    description: 'Collect and analyze all supplier responses',
                    priority: 'high',
                    icon: FileText,
                    action: () => console.log('Compile quotes'),
                    completed: false
                },
                {
                    id: 'prepare-customer-quote',
                    title: 'Prepare Customer Quote',
                    description: 'Create final quote document for customer',
                    priority: 'high',
                    icon: FileText,
                    action: () => console.log('Prepare quote'),
                    completed: false
                },
                {
                    id: 'send-quote',
                    title: 'Send Quote to Customer',
                    description: 'Submit final quote and follow up',
                    priority: 'medium',
                    icon: Mail,
                    action: () => console.log('Send quote'),
                    completed: false
                }
            ],
            'Order Confirmed': [
                {
                    id: 'process-po',
                    title: 'Process Purchase Order',
                    description: 'Validate and process customer purchase order',
                    priority: 'high',
                    icon: FileText,
                    action: () => console.log('Process PO'),
                    completed: false
                },
                {
                    id: 'create-work-order',
                    title: 'Create Work Order',
                    description: 'Generate internal work order for production',
                    priority: 'high',
                    icon: Play,
                    action: () => console.log('Create work order'),
                    completed: false
                },
                {
                    id: 'confirm-delivery',
                    title: 'Confirm Delivery Schedule',
                    description: 'Finalize delivery timeline with customer',
                    priority: 'medium',
                    icon: Calendar,
                    action: () => console.log('Confirm delivery'),
                    completed: false
                }
            ],
            'Procurement Planning': [
                {
                    id: 'finalize-suppliers',
                    title: 'Finalize Supplier Orders',
                    description: 'Place orders with selected suppliers',
                    priority: 'high',
                    icon: Send,
                    action: () => console.log('Finalize suppliers'),
                    completed: false
                },
                {
                    id: 'schedule-production',
                    title: 'Schedule Production',
                    description: 'Reserve production slots and resources',
                    priority: 'high',
                    icon: Calendar,
                    action: () => console.log('Schedule production'),
                    completed: false
                },
                {
                    id: 'track-materials',
                    title: 'Track Material Delivery',
                    description: 'Monitor supplier delivery schedules',
                    priority: 'medium',
                    icon: Package,
                    action: () => console.log('Track materials'),
                    completed: false
                }
            ],
            'In Production': [
                {
                    id: 'monitor-production',
                    title: 'Monitor Production Progress',
                    description: 'Track manufacturing progress and quality',
                    priority: 'high',
                    icon: Target,
                    action: () => console.log('Monitor production'),
                    completed: false
                },
                {
                    id: 'quality-inspections',
                    title: 'Conduct Quality Inspections',
                    description: 'Perform required quality control checks',
                    priority: 'high',
                    icon: CheckCircle2,
                    action: () => console.log('Quality inspections'),
                    completed: false
                },
                {
                    id: 'prepare-shipping',
                    title: 'Prepare for Shipping',
                    description: 'Package and prepare for delivery',
                    priority: 'medium',
                    icon: Package,
                    action: () => console.log('Prepare shipping'),
                    completed: false
                }
            ],
            'Shipped & Closed': [
                {
                    id: 'confirm-delivery',
                    title: 'Confirm Delivery',
                    description: 'Verify customer received the shipment',
                    priority: 'high',
                    icon: CheckCircle2,
                    action: () => console.log('Confirm delivery'),
                    completed: false
                },
                {
                    id: 'collect-feedback',
                    title: 'Collect Customer Feedback',
                    description: 'Gather feedback for continuous improvement',
                    priority: 'medium',
                    icon: MessageSquare,
                    action: () => console.log('Collect feedback'),
                    completed: false
                },
                {
                    id: 'close-project',
                    title: 'Close Project',
                    description: 'Complete project documentation and archival',
                    priority: 'low',
                    icon: FileText,
                    action: () => console.log('Close project'),
                    completed: false
                }
            ]
        };

        return stageActionMap[currentStageName] || [];
    };

    const actionItems = getStageActions();

    // Get priority color
    const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
        const colors = {
            high: 'bg-red-100 text-red-800 border-red-200',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            low: 'bg-green-100 text-green-800 border-green-200'
        };
        return colors[priority];
    };



    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        ACTIONS NEEDED - {project.current_stage?.name || 'CURRENT STAGE'}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                            {actionItems.length} actions
                        </Badge>
                        {onEdit && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm" onClick={onEdit}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Edit project details</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Action Items */}
                {actionItems.length > 0 ? (
                    <div className="space-y-3">
                        {actionItems.map((action) => {
                            const Icon = action.icon;
                            return (
                                <div
                                    key={action.id}
                                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={action.action}
                                >
                                    <div className={`p-2 rounded-lg ${action.priority === 'high' ? 'bg-red-100 text-red-600' :
                                        action.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                        <Icon className="w-4 h-4" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-medium text-sm">{action.title}</h4>
                                            <div className="flex items-center space-x-2">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${getPriorityColor(action.priority)}`}
                                                >
                                                    {action.priority}
                                                </Badge>
                                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{action.description}</p>
                                        {action.dueDate && (
                                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3 mr-1" />
                                                Due: {action.dueDate}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <p className="text-sm">All actions completed for this stage!</p>
                        <p className="text-xs mt-1">Ready to advance to the next stage.</p>
                    </div>
                )}


            </CardContent>
        </Card>
    );
}