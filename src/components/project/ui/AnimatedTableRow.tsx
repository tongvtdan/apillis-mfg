import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, User } from "lucide-react";
import { Project, ProjectStatus, ProjectStage, PROJECT_STAGES, WorkflowStage } from "@/types/project";
import { workflowStageService } from '@/services/workflowStageService';
import { useState, useEffect } from 'react';
import { useUserDisplayName, useUsers } from "@/features/customer-management/hooks";

interface AnimatedTableRowProps {
    project: Project;
    workflowStages?: WorkflowStage[];
    onStatusChange: (projectId: string, newStatus: ProjectStatus) => Promise<void>;
    onViewProject: (projectId: string) => void;
    statusVariants: Record<string, string>;
    priorityVariants: Record<string, string>;
    calculateLeadTime: (dueDate: string | null, createdAt: string) => string;
    formatCurrency: (value: number | null) => string | null;
    isUpdating?: boolean;
}

export function AnimatedTableRow({
    project,
    workflowStages = [],
    onStatusChange,
    onViewProject,
    statusVariants,
    priorityVariants,
    calculateLeadTime,
    formatCurrency,
    isUpdating = false
}: AnimatedTableRowProps) {
    // Get assignee display name using correct database field name with fallback
    const assigneeId = project.assigned_to || project.assignee_id;
    const assigneeDisplayName = useUserDisplayName(assigneeId);

    const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
        console.log(`🔄 AnimatedTableRow: Status change triggered for project ${projectId} to ${newStatus}`);
        await onStatusChange(projectId, newStatus);
    };

    return (
        <AnimatePresence mode="wait">
            <motion.tr
                key={`${project.id}-${project.status}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                    duration: 0.3,
                    ease: [0.4, 0.0, 0.2, 1],
                    opacity: { duration: 0.2 },
                    y: { duration: 0.3 }
                }}
                layout
                className={isUpdating ? 'opacity-75 pointer-events-none' : ''}
            >
                <TableCell className="font-medium">
                    <div
                        className="cursor-pointer hover:text-primary transition-colors duration-200"
                        onClick={() => onViewProject(project.id)}
                    >
                        <div className="font-semibold">{project.title}</div>
                        <div className="text-sm text-muted-foreground">
                            {project.project_id}
                        </div>
                    </div>
                </TableCell>
                <TableCell>
                    <div>
                        <div className="font-medium">
                            {project.customer_organization?.name || 'No Customer'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {project.contact_points && project.contact_points.length > 0 ? (
                                project.contact_points.find(cp => cp.is_primary)?.contact?.contact_name ||
                                project.contact_points[0]?.contact?.contact_name || 'No Contact'
                            ) : (
                                project.customer?.email || ''
                            )}
                        </div>
                    </div>
                </TableCell>
                <TableCell>
                    <Select
                        value={project.current_stage_id || ''}
                        onValueChange={(value: string) => onStatusChange(project.id, value as ProjectStatus)}
                        disabled={isUpdating}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue>
                                {(() => {
                                    const currentStage = workflowStages.find(stage => stage.id === project.current_stage_id);
                                    return currentStage ? (
                                        <Badge className={workflowStageService.getStageColor(currentStage)}>
                                            {currentStage.name}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">Unknown Stage</Badge>
                                    );
                                })()}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {workflowStages.map((stage) => (
                                <SelectItem key={stage.id} value={stage.id}>
                                    <Badge className={workflowStageService.getStageColor(stage)}>
                                        {stage.name}
                                    </Badge>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </TableCell>
                <TableCell>
                    <Badge className={priorityVariants[project.priority_level as keyof typeof priorityVariants]}>
                        {project.priority_level?.toUpperCase()}
                    </Badge>
                </TableCell>
                <TableCell>
                    <AssigneeCell assigneeId={assigneeId} displayName={assigneeDisplayName} />
                </TableCell>
                <TableCell>
                    <div className="text-sm">
                        {calculateLeadTime(project.estimated_delivery_date, project.created_at)}
                    </div>
                </TableCell>
                <TableCell>
                    {formatCurrency(project.estimated_value)}
                </TableCell>
                <TableCell className="text-right">
                    <Button
                        variant="accent"
                        size="sm"
                        className="action-button hover:scale-[1.02] transition-all duration-200"
                        onClick={() => onViewProject(project.id)}
                        disabled={isUpdating}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                    </Button>
                </TableCell>
            </motion.tr>
        </AnimatePresence>
    );
}

// Helper component to display assignee
function AssigneeCell({ assigneeId, displayName }: { assigneeId?: string; displayName: string }) {
    return (
        <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm">
                {assigneeId ? displayName : 'Unassigned'}
            </span>
        </div>
    );
}
