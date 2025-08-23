import { useState, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Calendar,
  User,
  Building2,
  Clock,
  AlertTriangle,
  Eye,
  TrendingUp,
  TrendingDown,
  Timer
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
  DragOverEvent,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useProjects } from "@/hooks/useProjects";
import { Project, PROJECT_STAGES, PRIORITY_COLORS, ProjectStatus } from "@/types/project";
import { WorkflowMetrics } from "./WorkflowMetrics";
import { StageMetrics } from "./StageMetrics";

// Enhanced ProjectCard with better visual feedback and performance
interface ProjectCardProps {
  project: Project;
  isDragging?: boolean;
  index?: number;
}

function ProjectCard({ project, isDragging = false, index }: ProjectCardProps) {
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
  const isBottleneck = (daysInStage: number) => daysInStage > 14;

  // Enhanced time tracking with visual indicators
  const getTimeIndicator = (daysInStage: number) => {
    if (isBottleneck(daysInStage)) {
      return { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' };
    } else if (isOverdue(daysInStage)) {
      return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' };
    } else if (daysInStage > 3) {
      return { icon: Timer, color: 'text-yellow-500', bg: 'bg-yellow-50' };
    } else {
      return { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' };
    }
  };

  const timeIndicator = getTimeIndicator(project.days_in_stage);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? 'opacity-50' : ''} ${index !== undefined ? 'animate-fade-in' : ''}`}
      style={{ animationDelay: index !== undefined ? `${index * 50}ms` : '0ms' }}
    >
      <Card className={`card-elevated cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 ${isDragging ? 'rotate-3 shadow-lg scale-105' : 'hover:scale-[1.02]'
        } ${sortableIsDragging ? 'z-50' : ''} ${isBottleneck(project.days_in_stage) ? 'ring-2 ring-red-200 bg-red-50/50' : ''
        }`}>
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
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${timeIndicator.bg}`}>
              <timeIndicator.icon className={`h-3 w-3 ${timeIndicator.color}`} />
              <span className={timeIndicator.color}>{project.days_in_stage}d</span>
            </div>
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

// Enhanced DroppableStage with metrics and performance indicators
interface DroppableStageProps {
  stageId: ProjectStatus;
  stageName: string;
  stageCount: number;
  children: React.ReactNode;
  projects: Project[];
}

function DroppableStage({ stageId, stageName, stageCount, children, projects }: DroppableStageProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: stageId,
    data: {
      type: 'stage',
      stageId: stageId
    }
  });



  return (
    <div
      ref={setNodeRef}
      className={`space-y-4 bg-muted/30 p-4 rounded-lg border-2 border-dashed transition-all duration-300 min-h-[500px] ${isOver ? 'border-primary bg-primary/10 scale-[1.02] shadow-md' : 'border-muted hover:border-muted-foreground/50'
        }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">{stageName}</h3>
            <Badge variant="secondary" className="text-xs">
              {stageCount}
            </Badge>
          </div>
        </div>

        {/* Stage Performance Metrics */}
        <StageMetrics projects={projects} stageId={stageId} />
      </div>

      {children}
    </div>
  );
}

// Virtualized Project List Component
interface VirtualizedProjectListProps {
  projects: Project[];
  stageId: ProjectStatus;
}

function VirtualizedProjectList({ projects, stageId }: VirtualizedProjectListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: projects.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated height of each project card
    overscan: 5, // Number of items to render outside the viewport
  });

  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No projects in this stage</p>
        <p className="text-xs mt-1">Drag projects here to move them</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="space-y-3 transition-all duration-200"
      style={{ height: `${Math.min(projects.length * 200, 600)}px`, overflow: 'auto' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const project = projects[virtualRow.index];
          return (
            <div
              key={project.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <ProjectCard project={project} index={virtualRow.index} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WorkflowKanban() {
  const { projects, loading, error, updateProjectStatusOptimistic } = useProjects();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const project = projects.find(p => p.id === active.id);
    setActiveProject(project || null);
    setIsDragging(true);
  }, [projects]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Enhanced drag over handling for better visual feedback
    const { over } = event;
    if (over) {
      // Add visual feedback for valid drop targets
    }
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    console.log('Drag end event:', { active: active.id, over: over?.id });

    if (!over) {
      console.log('No drop target found');
      setActiveProject(null);
      setIsDragging(false);
      return;
    }

    const projectId = active.id as string;
    const overData = over.data.current;

    // If dropped over a stage, use the stage ID
    let newStatus: ProjectStatus;
    if (overData?.type === 'stage') {
      newStatus = overData.stageId;
    } else {
      // If dropped over another project, get the stage from that project
      const targetProject = projects.find(p => p.id === over.id);
      if (!targetProject) {
        console.log('Invalid drop target');
        setActiveProject(null);
        setIsDragging(false);
        return;
      }
      newStatus = targetProject.status;
    }

    const currentProject = projects.find(p => p.id === projectId);
    if (!currentProject || currentProject.status === newStatus) {
      console.log('No change needed');
      setActiveProject(null);
      setIsDragging(false);
      return;
    }

    console.log('Updating project status:', { projectId, from: currentProject.status, to: newStatus });

    // Clear the drag overlay immediately
    setActiveProject(null);
    setIsDragging(false);

    // Make the optimistic API call (this will update UI immediately)
    await updateProjectStatusOptimistic(projectId, newStatus);
  }, [updateProjectStatusOptimistic, projects]);

  const getStageProjects = useCallback((stageId: ProjectStatus) => {
    return projects.filter(project => project.status === stageId);
  }, [projects]);

  // Enhanced stage data with metrics
  const stages = useMemo(() => {
    return PROJECT_STAGES.map(stage => ({
      ...stage,
      count: getStageProjects(stage.id).length,
      projects: getStageProjects(stage.id)
    }));
  }, [getStageProjects]);



  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Project Workflow</h2>
            <p className="text-muted-foreground">Loading your manufacturing projects...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 min-h-[600px]">
          {PROJECT_STAGES.map((stage) => (
            <div key={stage.id} className="space-y-4">
              <div className="animate-pulse bg-muted h-8 rounded"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-muted h-32 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <p className="text-destructive font-medium">Error loading projects</p>
          <p className="text-muted-foreground text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Factory Pulse - Project Flow</h2>
            <p className="text-muted-foreground">Track and manage your manufacturing projects from idea to delivery</p>
          </div>
          <Button asChild>
            <Link to="/rfq/new">
              New Project
            </Link>
          </Button>
        </div>

        {/* Workflow Performance Overview */}
        <WorkflowMetrics projects={projects} />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always
          }
        }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 min-h-[600px]">
          {stages.map((stage) => (
            <DroppableStage
              key={stage.id}
              stageId={stage.id}
              stageName={stage.name}
              stageCount={stage.count}
              projects={stage.projects}
            >
              <SortableContext
                items={stage.projects.map(project => project.id)}
                strategy={verticalListSortingStrategy}
              >
                <VirtualizedProjectList
                  projects={stage.projects}
                  stageId={stage.id}
                />
              </SortableContext>
            </DroppableStage>
          ))}
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