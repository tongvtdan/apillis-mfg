import React, { useMemo, useCallback, useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CalendarDays, Clock, DollarSign, MoreHorizontal, User } from "lucide-react";
import { Project, ProjectType, PROJECT_TYPE_LABELS, PROJECT_TYPE_DESCRIPTIONS, PROJECT_TYPE_COLORS } from "@/types/project";
import { format } from "date-fns";

interface ProjectTypeKanbanProps {
  projects: Project[];
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => Promise<void>;
}

// ProjectCard component for dragging
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

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return format(new Date(dateString), 'MMM dd');
  };

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab mb-3 hover:shadow-md transition-shadow ${isDragging ? 'shadow-lg' : ''}`}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                {project.project_id}
              </div>
              <h4 className="font-semibold leading-tight">{project.title}</h4>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Edit Project</DropdownMenuItem>
                <DropdownMenuItem>Add Notes</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {project.assignee_id && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {project.assignee_id.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>{formatCurrency(project.estimated_value)}</span>
            </div>
            <div className={`flex items-center gap-1 ${isOverdue(project.due_date) ? 'text-red-600' : 'text-muted-foreground'}`}>
              <CalendarDays className="h-4 w-4" />
              <span>{formatDate(project.due_date)}</span>
            </div>
          </div>

          {project.days_in_stage > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{project.days_in_stage} days in stage</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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
      className={`flex-1 min-w-[320px] transition-colors ${
        isOver ? 'bg-muted/50' : ''
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