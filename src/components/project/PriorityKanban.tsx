import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";
import {
  MoreHorizontal,
  Calendar,
  User,
  Building2,
  Clock,
  AlertTriangle,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Project, ProjectPriority, PRIORITY_COLORS } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  isDragging?: boolean;
}

function ProjectCard({ project, isDragging = false }: ProjectCardProps) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({ 
    id: project.id,
    data: {
      type: 'project',
      project: project
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: sortableIsDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
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
      <Card className={`card-elevated cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 ${isDragging ? 'rotate-3 shadow-lg scale-105' : 'hover:scale-[1.02]'} ${sortableIsDragging ? 'z-50' : ''}`}>
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
                <DropdownMenuItem onClick={() => navigate(`/project/${project.id}`)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
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
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/project/${project.id}`);
              }}
            >
              <Eye className="mr-2 h-3 w-3" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DroppablePriorityColumnProps {
  priority: 'high' | 'medium' | 'low';
  title: string;
  count: number;
  children: React.ReactNode;
}

function DroppablePriorityColumn({ priority, title, count, children }: DroppablePriorityColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `priority-${priority}`,
    data: {
      type: 'priority',
      priority: priority
    }
  });

  const getColumnColor = () => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50/50';
      case 'medium': return 'border-yellow-200 bg-yellow-50/50';
      case 'low': return 'border-green-200 bg-green-50/50';
      default: return 'border-muted bg-muted/30';
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`space-y-4 p-4 rounded-lg border-2 border-dashed transition-all duration-300 min-h-[400px] ${
        isOver ? 'border-primary bg-primary/10 scale-[1.02] shadow-md' : `${getColumnColor()} hover:border-muted-foreground/50`
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        </div>
      </div>
      {children}
    </div>
  );
}

interface PriorityKanbanProps {
  projects: Project[];
  selectedStage: string;
}

export function PriorityKanban({ projects, selectedStage }: PriorityKanbanProps) {
  const { updateProjectStatusOptimistic } = useProjects();
  const [activeProject, setActiveProject] = React.useState<Project | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group projects by priority
  const groupedProjects = React.useMemo(() => {
    const groups = {
      high: projects.filter(p => p.priority === 'urgent' || p.priority === 'high'),
      medium: projects.filter(p => p.priority === 'medium'),
      low: projects.filter(p => p.priority === 'low')
    };
    return groups;
  }, [projects]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const project = projects.find(p => p.id === active.id);
    setActiveProject(project || null);
  }, [projects]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveProject(null);
      return;
    }

    const projectId = active.id as string;
    const overData = over.data.current;
    
    // Clear the drag overlay immediately
    setActiveProject(null);
    
    // For now, we're not updating priority through drag and drop
    // This could be implemented later if needed
    console.log('Priority reordering not implemented yet');
  }, []);

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No projects in {selectedStage.replace('_', ' ')} stage
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          {selectedStage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Projects by Priority
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {projects.length} project(s) in this stage
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DroppablePriorityColumn
            priority="high"
            title="High Priority"
            count={groupedProjects.high.length}
          >
            <SortableContext
              items={groupedProjects.high.map(project => project.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {groupedProjects.high.map((project) => (
                  <div key={project.id} className="animate-fade-in">
                    <ProjectCard project={project} />
                  </div>
                ))}
                {groupedProjects.high.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No high priority projects</p>
                  </div>
                )}
              </div>
            </SortableContext>
          </DroppablePriorityColumn>

          <DroppablePriorityColumn
            priority="medium"
            title="Medium Priority"
            count={groupedProjects.medium.length}
          >
            <SortableContext
              items={groupedProjects.medium.map(project => project.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {groupedProjects.medium.map((project) => (
                  <div key={project.id} className="animate-fade-in">
                    <ProjectCard project={project} />
                  </div>
                ))}
                {groupedProjects.medium.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No medium priority projects</p>
                  </div>
                )}
              </div>
            </SortableContext>
          </DroppablePriorityColumn>

          <DroppablePriorityColumn
            priority="low"
            title="Low Priority"
            count={groupedProjects.low.length}
          >
            <SortableContext
              items={groupedProjects.low.map(project => project.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {groupedProjects.low.map((project) => (
                  <div key={project.id} className="animate-fade-in">
                    <ProjectCard project={project} />
                  </div>
                ))}
                {groupedProjects.low.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No low priority projects</p>
                  </div>
                )}
              </div>
            </SortableContext>
          </DroppablePriorityColumn>
        </div>

        <DragOverlay>
          {activeProject ? (
            <ProjectCard project={activeProject} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}