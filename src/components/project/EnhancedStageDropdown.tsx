import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Project, ProjectStatus } from "@/types/project";
import { WorkflowValidator } from "@/lib/workflow-validator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnhancedStageDropdownProps {
    project: Project;
    onStatusChange: (project: Project, newStatus: ProjectStatus) => Promise<void>;
    getAvailableStages: (project: Project) => Array<{
        id: ProjectStatus;
        name: string;
        color: string;
        count: number;
        canMoveTo: boolean;
        isNextStage: boolean;
        isCurrentStage: boolean;
    }>;
}

export function EnhancedStageDropdown({
    project,
    onStatusChange,
    getAvailableStages
}: EnhancedStageDropdownProps) {

    const handleUpdateStatus = async (project: Project, newStatus: ProjectStatus) => {
        await onStatusChange(project, newStatus);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="default"
                    size="sm"
                    className="w-full justify-center h-7 bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02] transition-all duration-200 shadow-sm"
                >
                    <Users className="mr-1 h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Change Stage</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="bg-background backdrop-blur-lg border border-muted-foreground/20 w-64"
            >
                {getAvailableStages(project).map((stage) => {
                    const isCurrentStage = stage.isCurrentStage;
                    const canMoveToStage = stage.canMoveTo;
                    const isNextStage = stage.isNextStage;

                    return (
                        <DropdownMenuItem
                            key={stage.id}
                            onClick={() => handleUpdateStatus(project, stage.id)}
                            disabled={isCurrentStage || !canMoveToStage}
                            className={`
                                ${isCurrentStage || !canMoveToStage ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                transition-all duration-200 ease-in-out
                                hover:bg-accent hover:text-accent-foreground
                                focus:bg-accent focus:text-accent-foreground
                                data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground
                                hover:pl-3 hover:scale-[1.02] transform
                                rounded-sm my-0.5
                                p-3
                            `}
                        >
                            <div className="flex flex-col w-full space-y-2">
                                <div className="flex items-center justify-between w-full">
                                    <span className="font-medium">{stage.name}</span>
                                    <div className="flex items-center gap-2">
                                        {isCurrentStage && (
                                            <Badge variant="secondary" className="text-xs">
                                                Current
                                            </Badge>
                                        )}
                                        {!canMoveToStage && !isCurrentStage && (
                                            <Badge variant="outline" className="text-xs text-muted-foreground">
                                                Blocked
                                            </Badge>
                                        )}
                                        {isNextStage && canMoveToStage && (
                                            <Badge variant="default" className="text-xs bg-green-600">
                                                Ready
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {!canMoveToStage && !isCurrentStage && (
                                    <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border-l-2 border-l-orange-400">
                                        <div className="font-medium mb-1 text-orange-600">
                                            Requirements not met
                                        </div>
                                        <div className="text-muted-foreground/70">
                                            Complete current stage requirements first
                                        </div>
                                    </div>
                                )}
                            </div>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
