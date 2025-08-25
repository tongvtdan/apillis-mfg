import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  Timer,
  Target,
  CheckCircle2,
  AlertCircle,
  FileX,
  Send,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

import { useProjects } from "@/hooks/useProjects";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { Project, PROJECT_STAGES, PRIORITY_COLORS, ProjectStatus, ProjectType } from "@/types/project";
import { QuoteReadinessIndicator, BottleneckAlert, QUOTE_READINESS_COLORS } from "@/types/supplier";
import { WorkflowMetrics } from "./WorkflowMetrics";
import { StageMetrics } from "./StageMetrics";
import { SupplierQuoteModal } from "../supplier/SupplierQuoteModal";
import { WorkflowValidator } from "@/lib/workflow-validator";

// Enhanced ProjectCard with better visual feedback and performance
interface ProjectCardProps {
  project: Project;
  isDragging?: boolean;
  index?: number;
  quoteReadiness?: QuoteReadinessIndicator;
  isBottleneck?: boolean;
  onSendRFQ?: (project: Project) => void;
  onUpdateStatus?: (project: Project, newStatus: ProjectStatus) => void;
}

function ProjectCard({ project, isDragging = false, index, quoteReadiness, isBottleneck = false, onSendRFQ, onUpdateStatus }: ProjectCardProps) {
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
  const isStageBottleneck = (daysInStage: number) => daysInStage > 14;

  // Enhanced time tracking with visual indicators
  const getTimeIndicator = (daysInStage: number) => {
    if (isStageBottleneck(daysInStage)) {
      return { icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10' };
    } else if (isOverdue(daysInStage)) {
      return { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' };
    } else if (daysInStage > 3) {
      return { icon: Timer, color: 'text-warning', bg: 'bg-warning/10' };
    } else {
      return { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' };
    }
  };

  const timeIndicator = getTimeIndicator(project.days_in_stage);

  // Quote readiness indicator
  const getQuoteReadinessIndicator = () => {
    if (!quoteReadiness || quoteReadiness.totalSuppliers === 0) {
      return null;
    }

    const { totalSuppliers, receivedQuotes, pendingQuotes, overdueQuotes, colorCode, statusText } = quoteReadiness;
    const percentage = (receivedQuotes / totalSuppliers) * 100;

    return {
      percentage,
      colorCode,
      statusText,
      hasOverdue: overdueQuotes > 0,
      isPending: pendingQuotes > 0,
      isComplete: receivedQuotes === totalSuppliers
    };
  };

  const quoteIndicator = getQuoteReadinessIndicator();

  // Enhanced bottleneck detection
  const showBottleneckWarning = isBottleneck || project.days_in_stage > 14;
  const showRFQAction = project.status === 'technical_review' && project.days_in_stage > 2;

  // Get available stages for this project (including completed stages for rollback)
  const getAvailableStages = () => {
    // Include all stages, not just forward stages, to allow rollback
    return PROJECT_STAGES;
  };

  // Get project stage status
  const getProjectStageStatus = (stageId: ProjectStatus) => {
    const projectStageIndex = WorkflowValidator.getStageIndex(project.status);
    const stageIndex = WorkflowValidator.getStageIndex(stageId);

    if (stageIndex < projectStageIndex) {
      return 'completed';
    } else if (stageIndex === projectStageIndex) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? 'opacity-50' : ''} ${index !== undefined ? 'animate-fade-in' : ''}`}
    >
      <Card className={`card-elevated cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 ${isDragging ? 'rotate-3 shadow-lg scale-105' : 'hover:scale-[1.02]'
        } ${sortableIsDragging ? 'z-50' : ''} ${showBottleneckWarning ? 'ring-2 ring-red-200 bg-red-50/50' :
          project.status === 'supplier_rfq_sent' && quoteIndicator?.hasOverdue ? 'ring-2 ring-orange-200 bg-orange-50/50' :
            quoteIndicator?.isComplete ? 'ring-2 ring-green-200 bg-green-50/50' : ''
        }`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {project.project_id}
            </CardTitle>
            <div className="flex items-center space-x-1">
              {showBottleneckWarning && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Project bottleneck detected - {project.days_in_stage} days in stage</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
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
                  {showRFQAction && (
                    <DropdownMenuItem onClick={() => onSendRFQ?.(project)}>
                      <Send className="w-4 h-4 mr-2" />
                      Send RFQ
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Move to Next Stage</DropdownMenuItem>
                  <DropdownMenuItem>Assign to...</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center justify-between">
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

            {/* Quote Readiness Indicator */}
            {quoteIndicator && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${QUOTE_READINESS_COLORS[quoteIndicator.colorCode]}`}>
                      <Target className="h-3 w-3" />
                      <span>{Math.round(quoteIndicator.percentage)}%</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{quoteIndicator.statusText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Quote Progress Bar */}
          {quoteIndicator && (
            <div className="mt-2">
              <Progress value={quoteIndicator.percentage} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">{quoteIndicator.statusText}</p>
            </div>
          )}
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
            <div className="flex space-x-2">
              <Button
                variant="accent"
                size="sm"
                className="flex-1 justify-start h-7 action-button hover:scale-[1.02] transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/project/${project.id}`);
                }}
              >
                <Eye className="mr-2 h-3 w-3" />
                View Details
              </Button>
              {/* Add Change Stage button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 action-button hover:scale-[1.02] transition-all duration-200"
                  >
                    <Users className="mr-1 h-3 w-3" />
                    Change Stage
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="bg-background/90 backdrop-blur-sm border border-muted-foreground/20"
                >
                  {getAvailableStages().map((stage) => {
                    const stageStatus = getProjectStageStatus(stage.id);
                    const isCurrentStage = project.status === stage.id;
                    
                    return (
                      <DropdownMenuItem
                        key={stage.id}
                        onClick={() => onUpdateStatus?.(project, stage.id)}
                        disabled={isCurrentStage}
                        className={`
                          ${isCurrentStage ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                          transition-all duration-200 ease-in-out
                          hover:bg-accent hover:text-accent-foreground
                          focus:bg-accent focus:text-accent-foreground
                          data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground
                          hover:pl-3 hover:scale-[1.02] transform
                          rounded-sm my-0.5
                        `}
                      >
                        <div className="flex items-center w-full">
                          <span className="flex-1">{stage.name}</span>
                          {isCurrentStage && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Current
                            </Badge>
                          )}
                          {stageStatus === 'completed' && !isCurrentStage && (
                            <Badge variant="outline" className="ml-2 text-xs border-green-500 text-green-500">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
      className={`w-[416px] flex-shrink-0 space-y-4 bg-muted/30 p-4 rounded-lg border-2 border-dashed transition-all duration-300 ${isOver ? 'border-primary bg-primary/10 scale-[1.02] shadow-md' : 'border-muted hover:border-muted-foreground/50'
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
  quoteReadiness: Record<string, QuoteReadinessIndicator>;
  bottlenecks: BottleneckAlert[];
  onSendRFQ: (project: Project) => void;
  onUpdateStatus: (project: Project, newStatus: ProjectStatus) => void;
}

function VirtualizedProjectList({ projects, stageId, quoteReadiness, bottlenecks, onSendRFQ, onUpdateStatus }: VirtualizedProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No projects in this stage</p>
        <p className="text-xs mt-1">Drag projects here to move them</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project, index) => {
        const isBottleneck = bottlenecks.some(b => b.project_id === project.id);
        const projectQuoteReadiness = quoteReadiness[project.id];

        return (
          <div key={project.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <ProjectCard
              project={project}
              index={index}
              quoteReadiness={projectQuoteReadiness}
              isBottleneck={isBottleneck}
              onSendRFQ={onSendRFQ}
              onUpdateStatus={onUpdateStatus} // Pass the update status handler
            />
          </div>
        );
      })}
    </div>
  );
}

interface WorkflowKanbanProps {
  projectTypeFilter?: ProjectType | 'all';
  filteredProjects?: Project[];
}

export function WorkflowKanban({ projectTypeFilter = 'all', filteredProjects }: WorkflowKanbanProps) {
  const { projects: allProjects, loading, error, updateProjectStatusOptimistic, getBottleneckAnalysis, getQuoteReadinessScore } = useProjects();

  // Use filtered projects if provided, otherwise use all projects
  const projects = filteredProjects || allProjects;
  const { } = useSupplierQuotes();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [bottlenecks, setBottlenecks] = useState<BottleneckAlert[]>([]);
  const [quoteReadiness, setQuoteReadiness] = useState<Record<string, QuoteReadinessIndicator>>({});
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle RFQ sending
  const handleSendRFQ = useCallback((project: Project) => {
    setSelectedProject(project);
    setShowSupplierModal(true);
  }, []);

  // Handle project status update
  const handleUpdateStatus = useCallback(async (project: Project, newStatus: ProjectStatus) => {
    // Validate the status change using workflow validator
    const validationResult = await WorkflowValidator.validateStatusChange(project, newStatus);

    if (!validationResult.isValid) {
      // In a real implementation, we would show validation errors to the user
      console.log('Validation failed:', validationResult.errors);
      return;
    }

    // Make the optimistic API call (this will update UI immediately)
    await updateProjectStatusOptimistic(project.id, newStatus);
  }, [updateProjectStatusOptimistic]);

  const handleRFQSuccess = useCallback(() => {
    setShowSupplierModal(false);
    setSelectedProject(null);
    // Optionally refresh data
  }, []);

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

    // Validate the status change using workflow validator
    const validationResult = await WorkflowValidator.validateStatusChange(currentProject, newStatus);

    if (!validationResult.isValid) {
      // Show validation errors (they will be shown via toast from the hook)
      console.log('Validation failed:', validationResult.errors);
      setActiveProject(null);
      setIsDragging(false);
      return;
    }

    // Clear the drag overlay immediately
    setActiveProject(null);
    setIsDragging(false);

    // Make the optimistic API call (this will update UI immediately)
    await updateProjectStatusOptimistic(projectId, newStatus);
  }, [updateProjectStatusOptimistic, projects]);

  // Load bottleneck detection data
  useEffect(() => {
    const loadBottlenecks = async () => {
      try {
        const bottleneckData = await getBottleneckAnalysis();
        setBottlenecks(bottleneckData);
      } catch (error) {
        console.error('Error loading bottlenecks:', error);
      }
    };

    if (projects.length > 0) {
      loadBottlenecks();
    }
  }, [projects.length, getBottleneckAnalysis]);

  // Load quote readiness data for relevant projects
  useEffect(() => {
    const loadQuoteReadiness = async () => {
      const relevantProjects = projects.filter(
        p => p.status === 'supplier_rfq_sent' || p.status === 'quoted'
      );

      const readinessPromises = relevantProjects.map(async (project) => {
        try {
          const readiness = await getQuoteReadinessScore(project.id);
          return { projectId: project.id, readiness };
        } catch (error) {
          console.error(`Error loading quote readiness for project ${project.id}:`, error);
          return { projectId: project.id, readiness: null };
        }
      });

      const results = await Promise.all(readinessPromises);
      const readinessMap: Record<string, QuoteReadinessIndicator> = {};

      results.forEach(({ projectId, readiness }) => {
        if (readiness) {
          readinessMap[projectId] = readiness;
        }
      });

      setQuoteReadiness(readinessMap);
    };

    if (projects.length > 0) {
      loadQuoteReadiness();
    }
  }, [projects, getQuoteReadinessScore]);

  const getStageProjects = useCallback((stageId: ProjectStatus) => {
    let filtered = projects.filter(project => project.status === stageId);

    // Apply project type filter if specified
    if (projectTypeFilter !== 'all') {
      filtered = filtered.filter(project => project.project_type === projectTypeFilter);
    }

    return filtered;
  }, [projects, projectTypeFilter]);

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
        <div className="relative">
          <div className="overflow-auto pb-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent max-h-[80vh]">
            <div className="flex gap-4 min-w-max px-2">
              {PROJECT_STAGES.map((stage) => (
                <div key={stage.id} className="w-[416px] flex-shrink-0 space-y-4">
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

          {/* Scroll indicator */}
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Project Workflow Stages</CardTitle>
            <CardDescription>
              Track and manage your manufacturing projects from idea to delivery
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Bottleneck Alerts */}
          {bottlenecks.length > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center text-red-800">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {bottlenecks.length} Bottleneck{bottlenecks.length !== 1 ? 's' : ''} Detected
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {bottlenecks.slice(0, 3).map((bottleneck, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{bottleneck.project_title}</span>
                        <span className="text-red-600 ml-2">- {bottleneck.current_stage} stage</span>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {Math.round(bottleneck.hours_in_stage / 24)}d overdue
                      </Badge>
                    </div>
                  ))}
                  {bottlenecks.length > 3 && (
                    <p className="text-xs text-red-600">+{bottlenecks.length - 3} more bottlenecks</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Kanban Board */}
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
            <div className="relative">
              <div className="overflow-auto pb-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent max-h-[70vh]">
                <div className="flex gap-4 min-w-max px-2">
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
                          quoteReadiness={quoteReadiness}
                          bottlenecks={bottlenecks}
                          onSendRFQ={handleSendRFQ}
                          onUpdateStatus={handleUpdateStatus} // Pass the update status handler
                        />
                      </SortableContext>
                    </DroppableStage>
                  ))}
                </div>
              </div>

              {/* Scroll indicator */}
              <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
            </div>

            <DragOverlay>
              {activeProject ? (
                <ProjectCard
                  project={activeProject}
                  isDragging
                  quoteReadiness={quoteReadiness[activeProject.id]}
                  isBottleneck={bottlenecks.some(b => b.project_id === activeProject.id)}
                  onSendRFQ={handleSendRFQ}
                  onUpdateStatus={handleUpdateStatus} // Pass the update status handler
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </CardContent>

      {/* Supplier Quote Modal */}
      {selectedProject && (
        <SupplierQuoteModal
          project={selectedProject}
          isOpen={showSupplierModal}
          onClose={() => setShowSupplierModal(false)}
          onSuccess={handleRFQSuccess}
        />
      )}
    </Card>
  );
}