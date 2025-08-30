import React from "react";


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { ProjectType, PROJECT_TYPE_LABELS, Project, WorkflowStage } from "@/types/project";

import { useSearchParams } from "react-router-dom";
import { ProjectErrorBoundary } from "@/components/error/ProjectErrorBoundary";
import { DatabaseErrorHandler } from "@/components/error/DatabaseErrorHandler";
import { LoadingFallback, OfflineState, GracefulDegradation } from "@/components/error/FallbackMechanisms";
import { useErrorHandling } from "@/hooks/useErrorHandling";
import { ProjectWorkflowAnalytics } from "@/components/project/ProjectWorkflowAnalytics";
import { ProjectCalendar } from "@/components/project/ProjectCalendar";
import { ProjectTable } from "@/components/project/ProjectTable";

// This component displays the projects management interface
// It uses the authenticated user's data from the AuthContext to fetch and manage projects
// The user profile data is fetched from the public.users table and connected to the auth.users table
// through the user ID which is consistent between both tables after the migration
export default function Projects() {
  const { projects, loading, error, updateProjectStage, updateProjectStatusOptimistic, refetch, getBottleneckAnalysis } = useProjects();
  const [searchParams, setSearchParams] = useSearchParams();

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

  // Get unique workflow stages from projects
  const workflowStages = React.useMemo(() => {
    const stagesMap = new Map<string, WorkflowStage>();

    projects.forEach(project => {
      if (project.current_stage) {
        stagesMap.set(project.current_stage.id, project.current_stage);
      }
    });

    return Array.from(stagesMap.values()).sort((a, b) => (a.stage_order || 0) - (b.stage_order || 0));
  }, [projects]);

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

    return counts;
  }, [projects, workflowStages]);

  // Get projects for selected stage with type filtering
  const selectedStageProjects = React.useMemo(() => {
    if (!selectedStage) return [];
    let filtered = projects.filter(p => p.current_stage_id === selectedStage);

    // Apply project type filter
    if (selectedProjectType !== 'all') {
      filtered = filtered.filter(p => p.project_type === selectedProjectType);
    }

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
        {projects.length === 0 && !loading && !hasError && (
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
                {/* Workflow Stages Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {workflowStages.map((stage) => (
                    <Card
                      key={stage.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${selectedStage === stage.id ? 'ring-2 ring-primary' : ''
                        }`}
                      onClick={() => handleStageSelect(stage.id)}
                    >
                      <CardContent className="p-4">
                        <div className="text-center">
                          <h3 className="font-semibold text-sm mb-2">{stage.name}</h3>
                          <Badge variant="secondary" className="text-lg font-bold">
                            {stageCounts[stage.id] || 0}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">projects</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Selected Stage Projects */}
                {selectedStage && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {workflowStages.find(s => s.id === selectedStage)?.name} Projects
                      </CardTitle>
                      <CardDescription>
                        {selectedStageProjects.length} projects in this stage
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedStageProjects.map((project) => (
                          <Card key={project.id} className="cursor-pointer hover:shadow-md">
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-2">{project.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{project.project_id}</p>
                              <div className="flex justify-between items-center">
                                <Badge variant="outline">{project.project_type}</Badge>
                                <Badge
                                  variant={project.status === 'active' ? 'default' : 'secondary'}
                                >
                                  {project.status}
                                </Badge>
                              </div>
                              {project.estimated_value && (
                                <p className="text-sm mt-2">
                                  Value: ${project.estimated_value.toLocaleString()}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Enhanced Project Workflow Details */}
                {selectedStage && selectedStageProjects.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {workflowStages.find(s => s.id === selectedStage)?.name} - Detailed Project Information
                      </CardTitle>
                      <CardDescription>
                        Comprehensive workflow and project details for each project in this stage
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {selectedStageProjects.map((project) => (
                          <div key={project.id} className="border rounded-lg p-4 bg-base-50 hover:bg-base-100 transition-colors">
                            <div className="mb-4">
                              <h4 className="font-semibold text-lg mb-2 text-base-content">{project.title}</h4>
                              <p className="text-sm text-muted-foreground mb-3">{project.project_id}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <span className="font-medium text-base-content">Current Stage:</span>
                                  <Badge variant="outline" className="ml-2">{project.current_stage?.name || 'Unknown'}</Badge>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium text-base-content">Status:</span>
                                  <Badge
                                    variant={project.status === 'active' ? 'default' : 'secondary'}
                                    className="ml-2"
                                  >
                                    {project.status}
                                  </Badge>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium text-base-content">Priority:</span>
                                  <Badge variant="outline" className="ml-2">{project.priority_level || 'Not set'}</Badge>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {project.estimated_value && (
                                  <div className="text-sm">
                                    <span className="font-medium text-base-content">Estimated Value:</span>
                                    <span className="ml-2 text-success font-semibold">${project.estimated_value.toLocaleString()}</span>
                                  </div>
                                )}
                                <div className="text-sm">
                                  <span className="font-medium text-base-content">Days in Stage:</span>
                                  <span className={`ml-2 font-semibold ${(project.days_in_stage || 0) > 7 ? 'text-warning' : 'text-success'}`}>
                                    {project.days_in_stage || 0}
                                  </span>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium text-base-content">Created:</span>
                                  <span className="ml-2">{new Date(project.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            {project.description && (
                              <div className="mb-3">
                                <span className="font-medium text-base-content text-sm">Description:</span>
                                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">{project.project_type}</Badge>
                              {project.tags && project.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          </div>
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