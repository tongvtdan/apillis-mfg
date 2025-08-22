import React, { useMemo, useCallback, useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, Clock, AlertTriangle, Eye, Building2, User, MoreHorizontal } from "lucide-react";
import { Project, ProjectType, PROJECT_TYPE_LABELS, PROJECT_TYPE_DESCRIPTIONS, PROJECT_TYPE_COLORS, PRIORITY_COLORS } from "@/types/project";
import { Link } from "react-router-dom";

interface ProjectTypeKanbanProps {
  projects: Project[];
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => Promise<void>;
}

// ProjectCard component for dragging - using same design as WorkflowKanban
interface ProjectCardProps {
  project: Project;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => Promise<void>;
}

function ProjectCard({ project, onUpdateProject }: ProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (daysInStage: number) => daysInStage > 7;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'opacity-50' : ''}
    >
      <Card className={`card-elevated cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 ${isDragging ? 'rotate-3 shadow-lg scale-105' : 'hover:scale-[1.02]'} ${isDragging ? 'z-50' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {project.project_id}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/project/${project.id}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Move to Next Stage</DropdownMenuItem>
                <DropdownMenuItem>Assign to...</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className={`text-xs ${getPriorityColor(project.priority)}`}
            >
              {project.priority.toUpperCase()}
            </Badge>
            {isOverdue(project.days_in_stage) && (
              <AlertTriangle className="h-3 w-3 text-red-500" />
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          <div>
            <p className="font-medium text-sm">{project.title}</p>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
              <Building2 className="h-3 w-3" />
              <span>{project.customer?.company || project.customer?.name || project.contact_name || 'Unknown'}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{project.contact_name || project.assignee_id || 'Unassigned'}</span>
              </div>
              {project.estimated_value && (
                <span className="font-medium">{formatCurrency(project.estimated_value)}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              {project.due_date && (
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(project.due_date)}</span>
                </div>
              )}
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{project.days_in_stage} days</span>
              </div>
            </div>
          </div>

          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  +{project.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-7 px-2"
              asChild
            >
              <Link to={`/project/${project.id}`}>
                <Eye className="mr-2 h-3 w-3" />
                View Details
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// DroppableTypeColumn component
interface DroppableTypeColumnProps {
  type: ProjectType;
  projects: Project[];
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => Promise<void>;
}

function DroppableTypeColumn({ type, projects, onUpdateProject }: DroppableTypeColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: type,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[320px] transition-colors ${isOver ? 'bg-muted/50' : ''
        }`}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {PROJECT_TYPE_LABELS[type]}
            </CardTitle>
            <Badge variant="secondary" className="font-normal">
              {projects.length}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {PROJECT_TYPE_DESCRIPTIONS[type]}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onUpdateProject={onUpdateProject}
                />
              ))}
            </SortableContext>
            {projects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No projects in this type</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProjectTypeKanban({ projects, onUpdateProject }: ProjectTypeKanbanProps) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const projectsByType = useMemo(() => {
    const grouped: Record<ProjectType, Project[]> = {
      system_build: [],
      fabrication: [],
      manufacturing: []
    };

    projects.forEach(project => {
      grouped[project.project_type].push(project);
    });

    return grouped;
  }, [projects]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const project = projects.find(p => p.id === event.active.id);
    setActiveProject(project || null);
  }, [projects]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const projectId = active.id as string;
    const newType = over.id as ProjectType;
    const project = projects.find(p => p.id === projectId);

    if (project && project.project_type !== newType && onUpdateProject) {
      try {
        await onUpdateProject(projectId, { project_type: newType });
      } catch (error) {
        console.error('Failed to update project type:', error);
      }
    }
  }, [projects, onUpdateProject]);

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No active projects found.</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6">
        {Object.entries(projectsByType).map(([type, typeProjects]) => (
          <DroppableTypeColumn
            key={type}
            type={type as ProjectType}
            projects={typeProjects}
            onUpdateProject={onUpdateProject}
          />
        ))}
      </div>

      <DragOverlay>
        {activeProject ? (
          <ProjectCard project={activeProject} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}