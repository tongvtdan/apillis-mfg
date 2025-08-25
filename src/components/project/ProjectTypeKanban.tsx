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
import { ProjectUpdateAnimation } from './ProjectUpdateAnimation';
import { useProjects } from "@/hooks/useProjects";

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
      <Card className={`card-elevated cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 w-full max-w-[320px] ${isDragging ? 'rotate-3 shadow-lg scale-105' : 'hover:scale-[1.02]'} ${isDragging ? 'z-50' : ''}`}>
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
                  <Link to={`/project/${project.id}`} onClick={(e) => {
                    e.stopPropagation(); // Prevent drag from starting
                    console.log('Navigating to project detail:', project.id);
                  }}>
                    View Details
                  </Link>
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
              variant="accent"
              size="sm"
              className="w-full justify-start h-7 action-button hover:scale-[1.02] transition-all duration-200"
              asChild
            >
              <Link
                to={`/project/${project.id}`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent drag from starting
                  console.log('Navigating to project detail from button:', project.id);
                }}
              >
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

// Project Type Section Header
interface ProjectTypeSectionProps {
  type: ProjectType;
  projectCount: number;
}

function ProjectTypeSection({ type, projectCount }: ProjectTypeSectionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${PROJECT_TYPE_COLORS[type].replace('bg-', 'bg-').replace(' border-', '')}`}></div>
        <h3 className="text-lg font-semibold">{PROJECT_TYPE_LABELS[type]}</h3>
        <Badge variant="secondary" className="font-normal">
          {projectCount}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {PROJECT_TYPE_DESCRIPTIONS[type]}
      </p>
    </div>
  );
}

export function ProjectTypeKanban({ projects, onUpdateProject }: ProjectTypeKanbanProps) {
  const { refetch } = useProjects();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [showUpdateAnimation, setShowUpdateAnimation] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before starting drag
      },
    }),
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
        // Show update animation
        setShowUpdateAnimation(true);
        setIsUpdating(true);

        await onUpdateProject(projectId, { project_type: newType });

        // Refresh projects data to ensure consistency
        await refetch(true);
      } catch (error) {
        console.error('Failed to update project type:', error);
      } finally {
        // Hide update animation after a short delay
        setTimeout(() => {
          setShowUpdateAnimation(false);
          setIsUpdating(false);
        }, 1500);
      }
    }
  }, [projects, onUpdateProject]);

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No projects found for the selected criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectUpdateAnimation isVisible={showUpdateAnimation} message="Updating projects..." />



      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-8">
          {Object.entries(projectsByType).map(([type, typeProjects]) => {
            if (typeProjects.length === 0) return null;

            return (
              <div key={type} className="space-y-4">
                <ProjectTypeSection
                  type={type as ProjectType}
                  projectCount={typeProjects.length}
                />

                {/* Responsive Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  <SortableContext items={typeProjects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    {typeProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onUpdateProject={onUpdateProject}
                      />
                    ))}
                  </SortableContext>
                </div>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeProject ? (
            <ProjectCard project={activeProject} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
