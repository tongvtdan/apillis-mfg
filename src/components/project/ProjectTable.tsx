import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Project, ProjectStatus, PROJECT_STAGES } from "@/types/project";
import { useProjects } from "@/hooks/useProjects";
import { ExternalLink, User, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatedTableRow } from "./AnimatedTableRow";
import { WorkflowValidator } from "@/lib/workflow-validator";

interface ProjectTableProps {
  projects: Project[];
  updateProjectStatusOptimistic?: (projectId: string, newStatus: ProjectStatus) => Promise<boolean>;
  refetch?: (forceRefresh?: boolean) => Promise<void>;
}

const statusVariants = {
  inquiry_received: "bg-blue-100 text-blue-800",
  technical_review: "bg-orange-100 text-orange-800",
  supplier_rfq_sent: "bg-purple-100 text-purple-800",
  quoted: "bg-yellow-100 text-yellow-800",
  order_confirmed: "bg-green-100 text-green-800",
  procurement_planning: "bg-teal-100 text-teal-800",
  in_production: "bg-indigo-100 text-indigo-800",
  shipped_closed: "bg-gray-100 text-gray-800",
} as const;

const priorityVariants = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
  urgent: "bg-red-200 text-red-900",
} as const;

export function ProjectTable({ projects, updateProjectStatusOptimistic: externalUpdateFn, refetch: externalRefetch }: ProjectTableProps) {
  const { updateProjectStatusOptimistic: hookUpdateFn, refetch: hookRefetch } = useProjects();
  const navigate = useNavigate();
  const [updatingProjects, setUpdatingProjects] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'name' | 'stage' | 'priority'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Use external functions if provided, otherwise use hook versions
  const updateProjectStatusOptimistic = externalUpdateFn || hookUpdateFn;
  const refetch = externalRefetch || hookRefetch;

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    console.log(`🔄 ProjectTable: Starting status change for project ${projectId} to ${newStatus}`);

    const project = projects.find(p => p.id === projectId);
    if (!project) {
      console.error('❌ Project not found:', projectId);
      return;
    }

    console.log(`📊 Current project status: ${project.status}, target: ${newStatus}`);

    // Validate the stage change using workflow validator
    const validationResult = await WorkflowValidator.validateStatusChange(project, newStatus as any);

    if (!validationResult.isValid) {
      // Show validation errors via toast (handled by the hook)
      console.error('❌ Validation failed:', validationResult.errors);
      return;
    }

    console.log('✅ Validation passed, proceeding with update');

    // Track this specific project as updating
    setUpdatingProjects(prev => new Set(prev).add(projectId));

    try {
      console.log('🚀 Calling updateProjectStatusOptimistic...');
      const result = await updateProjectStatusOptimistic(projectId, newStatus);
      console.log('📊 Update result:', result);

      if (result) {
        console.log('✅ Update completed successfully');
        // ❌ Removed unnecessary refetch - let real-time handle updates
        // await refetch(true);
      } else {
        console.error('❌ Update failed, result was false');
      }
      // Errors will be shown via toast notifications from the hook
    } catch (error) {
      console.error('❌ Error in handleStatusChange:', error);
      // Error handling is already done in the hook via toast notifications
    } finally {
      // Remove this project from updating state
      setUpdatingProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
      console.log('🧹 Cleaned up updating state for project:', projectId);
    }
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const calculateLeadTime = (dueDate: string | null, createdAt: string) => {
    if (!dueDate) return 'TBD';
    const days = Math.ceil(
      (new Date(dueDate).getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${days} days`;
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return `$${value.toLocaleString()}`;
  };

  // Sort projects based on current sort field and direction
  const sortedProjects = useMemo(() => {
    const sorted = [...projects].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'stage':
          // Use current_stage from joined data or current_stage_id
          aValue = a.current_stage?.name || PROJECT_STAGES.find(s => s.id === a.current_stage_legacy)?.name || 'Unknown';
          bValue = b.current_stage?.name || PROJECT_STAGES.find(s => s.id === b.current_stage_legacy)?.name || 'Unknown';
          break;
        case 'priority':
          // Use priority_level (database field) instead of priority
          aValue = a.priority_level;
          bValue = b.priority_level;
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }

      return 0;
    });

    return sorted;
  }, [projects, sortField, sortDirection]);

  const handleSort = (field: 'name' | 'stage' | 'priority') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: 'name' | 'stage' | 'priority') => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Sorting Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {sortedProjects.length} project{sortedProjects.length !== 1 ? 's' : ''}
          {sortField !== 'name' && (
            <span className="ml-2">
              • Sorted by {sortField === 'stage' ? 'Stage' : sortField === 'priority' ? 'Priority' : 'Name'}
              ({sortDirection === 'asc' ? 'A to Z' : 'Z to A'})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>Sort by:</span>
          <Button
            variant={sortField === 'name' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('name')}
            className="h-7 text-xs"
          >
            Name {getSortIcon('name')}
          </Button>
          <Button
            variant={sortField === 'stage' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('stage')}
            className="h-7 text-xs"
          >
            Stage {getSortIcon('stage')}
          </Button>
          <Button
            variant={sortField === 'priority' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('priority')}
            className="h-7 text-xs"
          >
            Priority {getSortIcon('priority')}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Project
                  {getSortIcon('name')}
                </Button>
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('stage')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Stage
                  {getSortIcon('stage')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('priority')}
                  className="h-auto p-0 font-semibold hover:bg-transparent"
                >
                  Priority
                  {getSortIcon('priority')}
                </Button>
              </TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Lead Time</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProjects.map((project) => (
              <AnimatedTableRow
                key={project.id}
                project={project}
                onStatusChange={handleStatusChange}
                onViewProject={handleViewProject}
                statusVariants={statusVariants}
                priorityVariants={priorityVariants}
                calculateLeadTime={calculateLeadTime}
                formatCurrency={formatCurrency}
                isUpdating={updatingProjects.has(project.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}