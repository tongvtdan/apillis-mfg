import React from "react";


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { ProjectType, PROJECT_TYPE_LABELS, Project, WorkflowStage } from "@/types/project";

import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, AlertCircle, Calendar } from "lucide-react";
import { ProjectErrorBoundary } from "@/components/error/ProjectErrorBoundary";
import { DatabaseErrorHandler } from "@/components/error/DatabaseErrorHandler";
import { LoadingFallback, OfflineState, GracefulDegradation } from "@/components/error/FallbackMechanisms";
import { useErrorHandling } from "@/hooks/useErrorHandling";
import { ProjectWorkflowAnalytics } from "@/components/project/ProjectWorkflowAnalytics";
import { ProjectCalendar } from "@/components/project/ProjectCalendar";
import { ProjectTable } from "@/components/project/ProjectTable";
import { workflowStageService } from "@/services/workflowStageService";

// This component displays the projects management interface
// It uses the authenticated user's data from the AuthContext to fetch and manage projects
// The user profile data is fetched from the public.users table and connected to the auth.users table
// through the user ID which is consistent between both tables after the migration
export default function Projects() {
  const { projects, loading, error, updateProjectStage, updateProjectStatusOptimistic, refetch, getBottleneckAnalysis } = useProjects();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Priority color function
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate lead time function
  const calculateLeadTime = (dueDate: string | null, createdAt: string) => {
    if (!dueDate) return null;
    const days = Math.ceil(
      (new Date(dueDate).getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  // Log projects data for debugging
  React.useEffect(() => {
    console.log('Projects page - projects data:', projects);
    console.log('Projects page - loading state:', loading);
    console.log('Projects page - error state:', error);
  }, [projects, loading, error]);

  // Enhanced error handling for the page
  const {
    handleError,
    clearError,
    retry,
    hasError,
    error: pageError,
    isRetrying
  } = useErrorHandling({
    context: 'Projects Page',
    maxRetries: 3,
    onError: (error) => {
      console.error('Projects page error:', error);
    }
  });

  const [selectedStage, setSelectedStage] = React.useState<string | null>(() => {
    // Try to restore from localStorage, default to first stage if none found
    const saved = localStorage.getItem('projects-selected-stage');
    return saved || null;
  });

  const [selectedProjectType, setSelectedProjectType] = React.useState<ProjectType | 'all'>('all');
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [workflowStages, setWorkflowStages] = React.useState<WorkflowStage[]>([]);
  const [stagesLoading, setStagesLoading] = React.useState(true);

  // Load workflow stages from database
  React.useEffect(() => {
    const loadWorkflowStages = async () => {
      try {
        setStagesLoading(true);
        const stages = await workflowStageService.getWorkflowStages();
        console.log('Workflow stages loaded:', stages);
        // Sort stages by stage_order
        const sortedStages = stages.sort((a, b) => a.stage_order - b.stage_order);
        setWorkflowStages(sortedStages);

        // Set the first stage as selected if none is currently selected
        if (!selectedStage && sortedStages.length > 0) {
          setSelectedStage(sortedStages[0].id);
          localStorage.setItem('projects-selected-stage', sortedStages[0].id);
        }
      } catch (error) {
        console.error('Error loading workflow stages:', error);
        setWorkflowStages([]);
      } finally {
        setStagesLoading(false);
      }
    };

    loadWorkflowStages();
  }, []);

  // Get default tab from URL params or localStorage
  const getDefaultTab = () => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'calendar' || tabParam === 'table' || tabParam === 'flowchart' || tabParam === 'analytics') {
      return tabParam;
    }
    // Try to restore from localStorage, default to 'flowchart'
    const saved = localStorage.getItem('projects-selected-tab');
    return saved ? (saved as string) : 'flowchart';
  };

  const defaultTab = getDefaultTab();

  // Save selected tab to localStorage and URL params
  const handleTabChange = (value: string) => {
    localStorage.setItem('projects-selected-tab', value);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', value);
      return newParams;
    });
  };

  // Save selected stage to localStorage whenever it changes
  const handleStageSelect = React.useCallback((stageId: string | null) => {
    setSelectedStage(stageId);
    if (stageId) {
      localStorage.setItem('projects-selected-stage', stageId);
    } else {
      localStorage.removeItem('projects-selected-stage');
    }
  }, []);

  const activeProjects = projects.filter(p => p.status !== 'completed');
  console.log('Active projects count:', activeProjects.length);

  // Calculate stage counts by current_stage_id
  const stageCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};

    // Initialize counts for all workflow stages
    workflowStages.forEach(stage => {
      counts[stage.id] = 0;
    });

    // Count projects by current_stage_id
    projects.forEach(project => {
      if (project.current_stage_id && counts.hasOwnProperty(project.current_stage_id)) {
        counts[project.current_stage_id]++;
      }
    });

    console.log('Stage counts calculated:', counts);
    return counts;
  }, [projects, workflowStages]);

  // Get projects for selected stage with type filtering
  const selectedStageProjects = React.useMemo(() => {
    if (!selectedStage) {
      console.log('No selected stage, returning empty array');
      return [];
    }
    let filtered = projects.filter(p => p.current_stage_id === selectedStage);
    console.log('Projects filtered by stage:', filtered.length);

    // Apply project type filter
    if (selectedProjectType !== 'all') {
      filtered = filtered.filter(p => p.project_type === selectedProjectType);
      console.log('Projects filtered by type:', filtered.length);
    }

    console.log('Selected stage projects:', filtered);
    return filtered;
  }, [projects, selectedStage, selectedProjectType]);

  // Handle loading state
  if (loading || isRetrying) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage all your projects and their workflow stages</p>
        </div>
        <LoadingFallback
          message={isRetrying ? "Retrying to load projects..." : "Loading projects..."}
          onCancel={() => {
            // Provide option to cancel loading
            window.history.back();
          }}
          timeout={30000}
          onTimeout={() => {
            handleError(new Error('Loading timeout - projects took too long to load'));
          }}
        />
      </div>
    );
  }

  // Handle database connection errors
  if (error && error.includes('database') || error && error.includes('connection')) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage all your projects and their workflow stages</p>
        </div>
        <DatabaseErrorHandler
          error={new Error(error)}
          onRetry={() => retry(refetch)}
          context="Projects Page"
          showConnectionStatus={true}
        />
      </div>
    );
  }

  // Handle offline state
  if (!navigator.onLine) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage all your projects and their workflow stages</p>
        </div>
        <OfflineState
          onRetry={() => retry(refetch)}
          onRefresh={() => window.location.reload()}
          showCachedData={projects.length > 0}
          cachedDataCount={projects.length}
        />
      </div>
    );
  }

  // Handle general errors
  if (hasError && pageError) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage all your projects and their workflow stages</p>
        </div>
        <DatabaseErrorHandler
          error={pageError}
          onRetry={() => retry(refetch)}
          context="Projects Page"
          showConnectionStatus={true}
        />
      </div>
    );
  }

  return (
    <ProjectErrorBoundary
      context="Projects Page"
      showErrorDetails={process.env.NODE_ENV === 'development'}
      onError={(error) => {
        handleError(error, 'Projects Page Component');
      }}
    >
      <div className="p-6 bg-base-100 text-base-content min-h-screen">
        {/* Show degraded mode if there are issues but some functionality works */}
        {projects.length === 0 && !loading && !hasError && !isRetrying && (
          <GracefulDegradation
            level="minimal"
            onUpgrade={() => retry(refetch)}
            features={{
              available: ['View cached data', 'Navigate to other pages'],
              unavailable: ['Load projects', 'Create new projects', 'Update project status']
            }}
          />
        )}

        <Tabs value={defaultTab} onValueChange={handleTabChange} className="w-full relative">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-base-content">Factory Pulse - Project Flow</h1>
              <p className="text-base-content/70">Track and manage your manufacturing projects from idea to delivery</p>
            </div>
            <div className="flex items-center gap-4">
              <TabsList className="auth-tabs-list grid-cols-4 w-[600px]">
                <TabsTrigger value="flowchart" className="auth-tab-trigger" disabled={isRetrying}>
                  Kanban Flow
                </TabsTrigger>
                <TabsTrigger value="table" className="auth-tab-trigger" disabled={isRetrying}>
                  Table
                </TabsTrigger>
                <TabsTrigger value="analytics" className="auth-tab-trigger" disabled={isRetrying}>
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="calendar" className="auth-tab-trigger" disabled={isRetrying}>
                  Calendar
                </TabsTrigger>
              </TabsList>

              {/* Manual refresh button with error handling */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearError();
                  retry(async () => {
                    await refetch(true);
                  });
                }}
                className="text-xs"
                disabled={isRetrying}
              >
                {isRetrying ? '🔄 Refreshing...' : '🔄 Refresh'}
              </Button>

              {/* Project Type Filter */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-base-content/70">Filter by type:</span>
                <Select
                  value={selectedProjectType}
                  onValueChange={(value) => setSelectedProjectType(value as ProjectType | 'all')}
                  disabled={isRetrying}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All project types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types ({activeProjects.length})</SelectItem>
                    <SelectItem value="system_build">
                      {PROJECT_TYPE_LABELS.system_build} ({activeProjects.filter(p => p.project_type === 'system_build').length})
                    </SelectItem>
                    <SelectItem value="fabrication">
                      {PROJECT_TYPE_LABELS.fabrication} ({activeProjects.filter(p => p.project_type === 'fabrication').length})
                    </SelectItem>
                    <SelectItem value="manufacturing">
                      {PROJECT_TYPE_LABELS.manufacturing} ({activeProjects.filter(p => p.project_type === 'manufacturing').length})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <TabsContent value="flowchart" className="mt-4 space-y-6">
            <ProjectErrorBoundary context="Workflow Flowchart">
              <div className="space-y-6">
                {/* Workflow Visualization - Horizontal Flow */}
                <Card>
                  <CardHeader>
                    <CardTitle>Workflow Visualization</CardTitle>
                    <CardDescription>
                      Visualize and manage project workflow stages
                      {stagesLoading ? ' (Loading...)' : ` (${workflowStages.length} stages)`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>



                    <div className="w-full overflow-x-auto pb-4 pt-2 px-2">
                      <div className="flex items-center gap-2 min-w-max">
                        {workflowStages.map((stage, index) => (
                          <React.Fragment key={stage.id}>
                            <div
                              className={`cursor-pointer transition-all duration-200 hover:shadow-md w-[160px] max-w-[160px] flex-none ${selectedStage === stage.id
                                ? 'ring-2 ring-primary shadow-md'
                                : ''
                                }`}
                              onClick={() => handleStageSelect(stage.id)}
                            >
                              <Card
                                className="h-full border-2"
                                style={{
                                  borderColor: stage.color || undefined,
                                  backgroundColor: stage.color ? `${stage.color}10` : undefined
                                }}
                              >
                                <CardContent className="p-4 text-center w-full">
                                  <div className="space-y-2">
                                    <div className="flex justify-center">
                                      <Badge
                                        className="text-xs font-medium"
                                        variant="outline"
                                        style={{
                                          backgroundColor: stage.color || '#6B7280',
                                          color: '#FFFFFF'
                                        }}
                                      >
                                        {stageCounts[stage.id] || 0}
                                      </Badge>
                                    </div>
                                    <div className="text-sm font-medium leading-tight">
                                      {stage.name}
                                    </div>
                                    {stage.description && (
                                      <div className="text-xs text-muted-foreground leading-tight">
                                        {stage.description}
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Arrow connector between stages */}
                            {index < workflowStages.length - 1 && (
                              <div className="flex-shrink-0">
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  style={{
                                    color: stage.color || '#6B7280'
                                  }}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Workflow Progress</span>
                        <span>{workflowStages.length} stages</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${selectedStage ?
                              ((workflowStages.findIndex(s => s.id === selectedStage) + 1) / workflowStages.length) * 100 :
                              0}%`,
                            backgroundColor: selectedStage ?
                              workflowStages.find(s => s.id === selectedStage)?.color || '#3B82F6' :
                              '#3B82F6'
                          }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>



                {/* Project Cards Grid */}
                {selectedStage && selectedStageProjects.length > 0 && (
                  <Card
                    className="border-t-4"
                    style={{
                      borderTopColor: workflowStages.find(s => s.id === selectedStage)?.color || '#3B82F6'
                    }}
                  >
                    <CardHeader>
                      <CardTitle>
                        {workflowStages.find(s => s.id === selectedStage)?.name} Projects
                      </CardTitle>
                      <CardDescription>
                        {selectedStageProjects.length} projects in this stage - Click any card to view details
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {selectedStageProjects.map((project) => (
                          <Card
                            key={project.id}
                            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 hover:scale-[1.02] group"
                            style={{
                              borderLeftColor: workflowStages.find(s => s.id === selectedStage)?.color || '#3B82F6'
                            }}
                            onClick={() => navigate(`/project/${project.id}`)}
                          >
                            <CardContent className="p-6">
                              {/* Project Header with Status Icon */}
                              <div className="mb-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-lg text-base-content group-hover:text-primary transition-colors">
                                      {project.title}
                                    </h4>
                                    {project.status === 'active' && (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    )}
                                    {project.status === 'on_hold' && (
                                      <Clock className="h-4 w-4 text-yellow-500" />
                                    )}
                                    {project.status === 'delayed' && (
                                      <AlertCircle className="h-4 w-4 text-red-500" />
                                    )}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="text-xs"
                                    style={{
                                      borderColor: workflowStages.find(s => s.id === selectedStage)?.color || '#3B82F6'
                                    }}
                                  >
                                    {project.project_id}
                                  </Badge>
                                </div>
                              </div>

                              {/* Priority with Color Coding */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-base-content">Priority:</span>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getPriorityColor(project.priority_level || 'medium')}`}
                                  >
                                    {project.priority_level || 'Not set'}
                                  </Badge>
                                </div>
                              </div>

                              {/* Project Metrics */}
                              <div className="space-y-2 mb-4">
                                {project.estimated_value && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Value:</span>
                                    <span className="text-sm font-semibold text-success">
                                      ${project.estimated_value.toLocaleString()}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Days in Stage:</span>
                                  <span className={`text-sm font-semibold ${(project.days_in_stage || 0) > 7 ? 'text-warning' : 'text-success'}`}>
                                    {project.days_in_stage || 0}
                                  </span>
                                </div>

                                {/* Lead Time or Due Date */}
                                {project.estimated_delivery_date ? (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Due Date:</span>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm">
                                        {new Date(project.estimated_delivery_date).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Lead Time:</span>
                                    <span className="text-sm">
                                      {calculateLeadTime(project.estimated_delivery_date, project.created_at) || 'TBD'}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Project Description */}
                              {project.description && (
                                <div className="mb-4">
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {project.description}
                                  </p>
                                </div>
                              )}

                              {/* Actions Needed - Sub-stages Checklist */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-base-content">Actions Needed:</span>
                                  <span className="text-xs text-muted-foreground">
                                    {/* Placeholder for sub-stage progress */}
                                    3/4 completed
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  {/* Placeholder sub-stages - these would be fetched from workflow sub-stages */}
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    <span className="text-xs text-muted-foreground">RFQ Documentation Review</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    <span className="text-xs text-muted-foreground">Initial Feasibility Assessment</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-yellow-500" />
                                    <span className="text-xs text-muted-foreground">Customer Requirements Clarification</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm" />
                                    <span className="text-xs text-muted-foreground">Technical Review</span>
                                  </div>
                                </div>
                              </div>

                              {/* Project Tags */}
                              {project.tags && project.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                  {project.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {project.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{project.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Action Button */}
                              <div className="pt-4 border-t border-border">
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="w-full group-hover:bg-primary/90 transition-colors"
                                >
                                  <span className="text-sm">View Details</span>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ProjectErrorBoundary>
          </TabsContent>

          <TabsContent value="table" className="mt-4 space-y-6">
            <ProjectTable
              projects={activeProjects.filter(p => selectedProjectType === 'all' || p.project_type === selectedProjectType)}
              updateProjectStatusOptimistic={updateProjectStatusOptimistic}
              refetch={refetch}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-4 space-y-6">
            <ProjectErrorBoundary context="Project Analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Project Status Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Active</span>
                        <Badge>{projects.filter(p => p.status === 'active').length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>On Hold</span>
                        <Badge variant="secondary">{projects.filter(p => p.status === 'on_hold').length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Delayed</span>
                        <Badge variant="destructive">{projects.filter(p => p.status === 'delayed').length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed</span>
                        <Badge variant="outline">{projects.filter(p => p.status === 'completed').length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Types */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>System Build</span>
                        <Badge>{projects.filter(p => p.project_type === 'system_build').length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Fabrication</span>
                        <Badge>{projects.filter(p => p.project_type === 'fabrication').length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Manufacturing</span>
                        <Badge>{projects.filter(p => p.project_type === 'manufacturing').length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Workflow Stages */}
                <Card>
                  <CardHeader>
                    <CardTitle>Workflow Stages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {workflowStages.slice(0, 4).map((stage) => (
                        <div key={stage.id} className="flex justify-between">
                          <span className="text-sm">{stage.name}</span>
                          <Badge variant="outline">{stageCounts[stage.id] || 0}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Total Value */}
                <Card>
                  <CardHeader>
                    <CardTitle>Total Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${projects
                        .filter(p => p.estimated_value)
                        .reduce((sum, p) => sum + (p.estimated_value || 0), 0)
                        .toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Across {projects.filter(p => p.estimated_value).length} projects
                    </p>
                  </CardContent>
                </Card>
              </div>
            </ProjectErrorBoundary>
          </TabsContent>

          <TabsContent value="calendar" className="mt-4 space-y-6">
            <ProjectErrorBoundary context="Project Calendar">
              <Card>
                <CardHeader>
                  <CardTitle>Project Calendar</CardTitle>
                  <CardDescription>Calendar view of projects (Coming Soon)</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Calendar view will be available after component updates are completed.
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.slice(0, 6).map((project) => (
                      <Card key={project.id}>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">{project.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{project.project_id}</p>
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(project.created_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ProjectErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </ProjectErrorBoundary>
  );
}