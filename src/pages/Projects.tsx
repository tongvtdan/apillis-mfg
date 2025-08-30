import React from "react";
import { ProjectTable } from "@/components/project/ProjectTable";
import { StageFlowchart } from "@/components/project/StageFlowchart";
import { ProjectCalendar } from "@/components/project/ProjectCalendar";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { ProjectStatus, ProjectType, PROJECT_TYPE_LABELS, Project } from "@/types/project";
import { WorkflowFlowchart } from "@/components/project/WorkflowFlowchart";
import { ProjectWorkflowAnalytics } from "@/components/project/ProjectWorkflowAnalytics";
import { EnhancedProjectSummary } from "@/components/project/EnhancedProjectSummary";
import { useSearchParams } from "react-router-dom";
import { ProjectErrorBoundary } from "@/components/error/ProjectErrorBoundary";
import { DatabaseErrorHandler } from "@/components/error/DatabaseErrorHandler";
import { LoadingFallback, OfflineState, GracefulDegradation } from "@/components/error/FallbackMechanisms";
import { useErrorHandling } from "@/hooks/useErrorHandling";

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

  const [selectedStage, setSelectedStage] = React.useState<ProjectStatus | null>(() => {
    // Try to restore from localStorage, default to 'inquiry_received' if none found
    const saved = localStorage.getItem('projects-selected-stage');
    return saved ? (saved as ProjectStatus) : 'inquiry_received';
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
  const handleStageSelect = React.useCallback((stage: ProjectStatus | null) => {
    setSelectedStage(stage);
    if (stage) {
      localStorage.setItem('projects-selected-stage', stage);
    } else {
      localStorage.removeItem('projects-selected-stage');
    }
  }, []);

  const activeProjects = projects.filter(p => p.status !== 'shipped_closed');

  // Calculate stage counts
  const stageCounts = React.useMemo(() => {
    const counts: Record<ProjectStatus, number> = {
      inquiry_received: 0,
      technical_review: 0,
      supplier_rfq_sent: 0,
      quoted: 0,
      order_confirmed: 0,
      procurement_planning: 0,
      in_production: 0,
      shipped_closed: 0
    };

    projects.forEach(project => {
      const currentStage = project.current_stage || project.status;
      if (currentStage in counts) {
        counts[currentStage as ProjectStatus] = (counts[currentStage as ProjectStatus] || 0) + 1;
      }
    });

    return counts;
  }, [projects]);

  // Get projects for selected stage with type filtering
  const selectedStageProjects = React.useMemo(() => {
    if (!selectedStage) return [];
    let filtered = projects.filter(p => (p.current_stage || p.status) === selectedStage);

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
              <WorkflowFlowchart
                selectedProject={selectedProject}
                onProjectSelect={setSelectedProject}
                onStageSelect={handleStageSelect}
                selectedStage={selectedStage}
                projectTypeFilter={selectedProjectType}
                projects={projects}
                updateProjectStatusOptimistic={updateProjectStatusOptimistic}
                refetch={() => refetch(true)}
              />
            </ProjectErrorBoundary>
          </TabsContent>

          <TabsContent value="table" className="mt-4 space-y-6">
            <div className="bg-base-100 rounded-lg p-6 border border-base-300">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-base-content">Project Table View</h3>
                <p className="text-sm text-base-content/70 mt-1">
                  {selectedProjectType === 'all'
                    ? `Showing ${activeProjects.length} projects`
                    : `Showing ${activeProjects.filter(p => p.project_type === selectedProjectType).length} ${PROJECT_TYPE_LABELS[selectedProjectType]} projects`
                  }
                </p>
              </div>
              <ProjectTable
                projects={activeProjects}
                updateProjectStatusOptimistic={updateProjectStatusOptimistic}
                refetch={() => refetch(true)}
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4 space-y-6">
            <ProjectErrorBoundary context="Project Analytics">
              <ProjectWorkflowAnalytics />
            </ProjectErrorBoundary>
          </TabsContent>

          <TabsContent value="calendar" className="mt-4 space-y-6">
            <ProjectErrorBoundary context="Project Calendar">
              <ProjectCalendar projects={projects} />
            </ProjectErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </ProjectErrorBoundary>
  );
}