import React from "react";


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useProjectManagement } from "@/features/project-management/hooks";
import { ProjectType, PROJECT_TYPE_LABELS, Project, WorkflowStage } from "@/types/project";

import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, AlertCircle, Calendar } from "lucide-react";
// Removed useWorkflowSubStages - sub-stages functionality temporarily disabled
import { useProjectSubStageProgress } from "@/features/project-management/hooks";
import { ProjectErrorBoundary } from "@/components/error/ProjectErrorBoundary";
import { DatabaseErrorHandler } from "@/components/error/DatabaseErrorHandler";
import { LoadingFallback, OfflineState, GracefulDegradation } from "@/components/error/FallbackMechanisms";
import { useErrorHandling } from "@/shared/hooks";
import { ProjectWorkflowAnalytics } from "@/components/project/workflow";
import { ProjectCalendar } from "@/components/project/ProjectCalendar";
import { ProjectList } from "@/components/project/ProjectList";
import { AnimatedProjectCard } from "@/components/project/ui";
import { workflowStageService } from "@/services/workflowStageService";
import { useToast } from "@/shared/hooks/use-toast";

// This component displays the projects management interface
// It uses the authenticated user's data from the AuthContext to fetch and manage projects
// The user profile data is fetched from the public.users table and connected to the auth.users table
// through the user ID which is consistent between both tables after the migration
export default function Projects() {
  const { projects, loading, error, updateProjectStage, updateProjectStatusOptimistic, refetch, getBottleneckAnalysis, createProject } = useProjectManagement();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  // Format currency function
  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format date function
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to get real sub-stage progress for a project
  const getSubStageProgress = (projectId: string, allProjectProgress: any[] = []) => {
    const totalSubStages = subStages.length;

    // Get real progress data from the database
    const projectProgress = allProjectProgress.filter(p => p.project_id === projectId);

    if (projectProgress.length === 0) {
      // If no progress data exists, calculate based on days in stage
      const project = projects.find(p => p.id === projectId);
      if (!project || !project.days_in_stage) {
        return {
          total: totalSubStages,
          completed: 0,
          progress: 0
        };
      }

      // Estimate progress based on days in stage
      const avgDurationPerSubStage = 2; // Average days per sub-stage
      const estimatedCompleted = Math.min(
        Math.floor(project.days_in_stage / avgDurationPerSubStage),
        totalSubStages
      );

      return {
        total: totalSubStages,
        completed: estimatedCompleted,
        progress: totalSubStages > 0 ? (estimatedCompleted / totalSubStages) * 100 : 0
      };
    }

    // Use real progress data
    const completedSubStages = projectProgress.filter(p =>
      p.status === 'completed' || p.status === 'skipped'
    ).length;

    const inProgressSubStages = projectProgress.filter(p =>
      p.status === 'in_progress'
    ).length;

    return {
      total: totalSubStages,
      completed: completedSubStages,
      inProgress: inProgressSubStages,
      progress: totalSubStages > 0 ? (completedSubStages / totalSubStages) * 100 : 0
    };
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
    errorState,
    isRetrying
  } = useErrorHandling({
    context: 'Projects Page',
    maxRetries: 3,
    onError: (error) => {
      console.error('Projects page error:', error);
    }
  });

  const hasError = errorState.hasError;
  const pageError = errorState.error;

  // Get initial stage from URL params or localStorage
  const getInitialStage = (): string | null => {
    const stageParam = searchParams.get('stage');
    if (stageParam) {
      return stageParam;
    }
    // Try to restore from localStorage, default to null if none found
    const saved = localStorage.getItem('projects-selected-stage');
    return saved || null;
  };

  const [selectedStage, setSelectedStage] = React.useState<string | null>(getInitialStage);

  // Get project type from URL params or default to 'all'
  const getInitialProjectType = (): ProjectType | 'all' => {
    const typeParam = searchParams.get('type');
    if (typeParam && (typeParam === 'system_build' || typeParam === 'fabrication' || typeParam === 'manufacturing')) {
      return typeParam;
    }
    return 'all';
  };

  const [selectedProjectType, setSelectedProjectType] = React.useState<ProjectType | 'all'>(getInitialProjectType());
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [workflowStages, setWorkflowStages] = React.useState<WorkflowStage[]>([]);
  const [stagesLoading, setStagesLoading] = React.useState(true);

  // Update URL when project type changes
  React.useEffect(() => {
    if (selectedProjectType === 'all') {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('type');
        return newParams;
      });
    } else {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('type', selectedProjectType);
        return newParams;
      });
    }
  }, [selectedProjectType, setSearchParams]);

  // Update URL when selected stage changes
  React.useEffect(() => {
    if (!selectedStage) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('stage');
        return newParams;
      });
    } else {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('stage', selectedStage);
        return newParams;
      });
    }
  }, [selectedStage, setSearchParams]);

  // Fetch sub-stages for the selected stage (temporarily disabled)
  const subStages: any[] = [];
  const subStagesLoading = false;

  // Load workflow stages from database
  React.useEffect(() => {
    const loadWorkflowStages = async () => {
      try {
        setStagesLoading(true);

        // Clear cache and force refresh to get latest stages
        workflowStageService.clearCache();
        const stages = await workflowStageService.getWorkflowStages(true);

        // Sort stages by stage_order
        const sortedStages = stages.sort((a, b) => a.stage_order - b.stage_order);
        setWorkflowStages(sortedStages);

        // Set the first stage as selected if none is currently selected
        if (!selectedStage && sortedStages.length > 0) {
          const firstStage = sortedStages[0];
          console.log('🔧 Setting initial selected stage to first available:', firstStage.id, firstStage.name);
          setSelectedStage(firstStage.id);
          localStorage.setItem('projects-selected-stage', firstStage.id);
        } else if (selectedStage && sortedStages.length > 0) {
          // Validate that the currently selected stage still exists
          const currentStageExists = sortedStages.find(s => s.id === selectedStage);
          if (!currentStageExists) {
            console.log('🔧 Previously selected stage no longer exists, resetting to first stage:', sortedStages[0].id);
            setSelectedStage(sortedStages[0].id);
            localStorage.setItem('projects-selected-stage', sortedStages[0].id);
          }
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
    if (tabParam === 'enhanced' || tabParam === 'calendar' || tabParam === 'flowchart' || tabParam === 'analytics') {
      return tabParam;
    }
    // Try to restore from localStorage, default to 'enhanced'
    const saved = localStorage.getItem('projects-selected-tab');
    if (saved === 'table') return 'enhanced';
    return saved ? (saved as string) : 'enhanced';
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
    console.log('Workflow stages:', workflowStages.map(s => ({ id: s.id, name: s.name, slug: s.slug })));
    console.log('Projects current_stage_id values:', projects.map(p => ({ id: p.id, current_stage_id: p.current_stage_id, title: p.title })));

    // Debug: Check for mismatched stage IDs
    const projectStageIds = [...new Set(projects.filter(p => p.current_stage_id).map(p => p.current_stage_id))];
    const workflowStageIds = workflowStages.map(s => s.id);
    const mismatchedIds = projectStageIds.filter(id => !workflowStageIds.includes(id));

    if (mismatchedIds.length > 0) {
      console.warn('⚠️ Found projects with mismatched stage IDs:', mismatchedIds);
      console.warn('Projects with mismatched IDs:', projects.filter(p => mismatchedIds.includes(p.current_stage_id || '')).map(p => ({ id: p.id, title: p.title, current_stage_id: p.current_stage_id })));

      // If we have workflow stages now but found mismatched IDs, try to fix them
      if (workflowStages.length > 0) {
        console.log('🔧 Attempting to fix projects with mismatched stage IDs...');

        // For now, we'll just log that these need to be fixed manually
        // In a production system, you might want to:
        // 1. Reset them to null
        // 2. Map them to the first stage
        // 3. Try to find similar stages by name/slug

        toast({
          title: "Found projects with invalid stage IDs",
          description: `${mismatchedIds.length} projects have stage IDs that don't match available workflow stages. These have been reset to the first available stage.`,
          variant: "warning",
        });

        // Automatically fix by setting to first available stage or null
        mismatchedIds.forEach(mismatchedId => {
          const projectsToFix = projects.filter(p => p.current_stage_id === mismatchedId);
          console.log(`🔧 Fixing ${projectsToFix.length} projects with invalid stage ID: ${mismatchedId}`);

          // Set to first workflow stage or null
          const newStageId = workflowStages.length > 0 ? workflowStages[0].id : null;

          projectsToFix.forEach(async (project) => {
            try {
              await updateProjectStage(project.id, newStageId);
              console.log(`✅ Fixed project ${project.title} (${project.id}) stage: ${mismatchedId} -> ${newStageId}`);
            } catch (error) {
              console.error(`❌ Failed to fix project ${project.id}:`, error);
            }
          });
        });
      }
    }

    return counts;
  }, [projects, workflowStages, updateProjectStage, toast]);

  // Get projects for selected stage with type filtering
  const selectedStageProjects = React.useMemo(() => {
    if (!selectedStage) {
      console.log('No selected stage, returning empty array');
      return [];
    }

    console.log('Selected stage ID:', selectedStage);
    console.log('Available workflow stage IDs:', workflowStages.map(s => s.id));
    console.log('Projects with current_stage_id:', projects.filter(p => p.current_stage_id).map(p => ({ id: p.id, current_stage_id: p.current_stage_id, title: p.title })));

    // Validate that the selected stage exists in workflow stages
    const validStage = workflowStages.find(s => s.id === selectedStage);
    if (!validStage) {
      console.warn('⚠️ Selected stage not found in workflow stages:', selectedStage);
      console.warn('Available stages:', workflowStages.map(s => ({ id: s.id, name: s.name })));

      // If workflow stages exist but selected stage is invalid, reset to first stage
      if (workflowStages.length > 0) {
        console.log('🔧 Resetting selected stage to first available stage:', workflowStages[0].id);
        setSelectedStage(workflowStages[0].id);
        localStorage.setItem('projects-selected-stage', workflowStages[0].id);
        return [];
      }

      return [];
    }

    // Convert stage name to stage ID if needed
    let stageIdToFilter = selectedStage;

    // Check if selectedStage is a stage name (not a UUID)
    const isStageName = !selectedStage.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    if (isStageName && workflowStages.length > 0) {
      // Find the stage ID by name
      const stage = workflowStages.find(s => s.name === selectedStage);
      if (stage) {
        stageIdToFilter = stage.id;
        console.log('Converted stage name to ID:', selectedStage, '->', stageIdToFilter);
      } else {
        console.log('Stage not found:', selectedStage);
        return [];
      }
    }

    let filtered = projects.filter(p => p.current_stage_id === stageIdToFilter);
    console.log('Projects filtered by stage:', filtered.length);

    // Apply project type filter
    if (selectedProjectType !== 'all') {
      filtered = filtered.filter(p => p.project_type === selectedProjectType);
      console.log('Projects filtered by type:', filtered.length);
    }

    console.log('Selected stage projects:', filtered);
    return filtered;
  }, [projects, selectedStage, selectedProjectType, workflowStages, setSelectedStage]);

  // Fetch project sub-stage progress for all projects in the selected stage
  const { progress: allProjectProgress, loading: progressLoading } = useProjectSubStageProgress({
    projectId: selectedStageProjects.length > 0 ? selectedStageProjects[0].id : undefined,
    enabled: !!selectedStage && selectedStageProjects.length > 0
  });

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
          onRetry={() => {
            retry();
            refetch();
          }}
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
          onRetry={() => {
            retry();
            refetch();
          }}
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
          onRetry={() => {
            retry();
            refetch();
          }}
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
      <div className="p-6 bg-background text-foreground min-h-screen">
        {/* Show degraded mode if there are issues but some functionality works */}
        {projects.length === 0 && !loading && !hasError && !isRetrying && (
          <GracefulDegradation
            level="minimal"
            onUpgrade={() => {
              retry();
              refetch();
            }}
            features={{
              available: ['View cached data', 'Navigate to other pages'],
              unavailable: ['Load projects', 'Create new projects', 'Update project status']
            }}
          />
        )}

        <Tabs value={defaultTab} onValueChange={handleTabChange} className="w-full relative">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <TabsList className="auth-tabs-list grid !grid-cols-4 w-full">
                <TabsTrigger value="enhanced" className="auth-tab-trigger" disabled={isRetrying}>
                  List
                </TabsTrigger>
                <TabsTrigger value="flowchart" className="auth-tab-trigger" disabled={isRetrying}>
                  Workflow
                </TabsTrigger>
                <TabsTrigger value="calendar" className="auth-tab-trigger" disabled={isRetrying}>
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="analytics" className="auth-tab-trigger" disabled={isRetrying}>
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Project Type Filter */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">Filter by type:</span>
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

            {/* New Project Button */}
            <div className="flex items-center">
              <Button
                onClick={() => navigate("/projects/new")}
                variant="accent"
                className="action-button shadow-md hover:shadow-lg"
                disabled={isRetrying}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>

          <TabsContent value="enhanced" className="mt-4">
            <ProjectErrorBoundary context="Enhanced Project List">
              <ProjectList
                projects={activeProjects.filter(p => selectedProjectType === 'all' || p.project_type === selectedProjectType)}
                workflowStages={workflowStages}
                loading={loading}
                onProjectUpdate={async (projectId, updates) => {
                  // Handle project updates
                  if (updates.status) {
                    await updateProjectStatusOptimistic(projectId, updates.status);
                  }
                }}
                onProjectCreate={async (projectData) => {
                  // Handle project creation using the createProject function
                  const newProject = await createProject({
                    title: projectData.title,
                    description: projectData.description,
                    customer_organization_id: projectData.customer_id,
                    priority: projectData.priority_level,
                    estimated_value: projectData.estimated_value,
                    due_date: projectData.estimated_delivery_date,
                    notes: projectData.notes,
                    tags: projectData.tags
                  });
                  await refetch(true);
                  return newProject;
                }}
              />
            </ProjectErrorBoundary>
          </TabsContent>

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

                      {workflowStages.find(s => s.id === selectedStage)?.description && (
                        <div className="mt-2 text-md text-muted-foreground">
                          {workflowStages.find(s => s.id === selectedStage)?.description}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {selectedStageProjects.map((project) => (
                          <AnimatedProjectCard
                            key={project.id}
                            project={project}
                            onStatusChange={async (projectId, newStatus) => {
                              await updateProjectStatusOptimistic(projectId, newStatus);
                            }}
                            getAvailableStages={(project) => {
                              // Return available stages based on workflow
                              return workflowStages.map(stage => ({
                                id: stage.id as any,
                                name: stage.name,
                                color: stage.color || '#3B82F6',
                                count: stageCounts[stage.id] || 0,
                                canMoveTo: true,
                                isNextStage: false,
                                isCurrentStage: stage.id === project.current_stage_id
                              }));
                            }}
                            getPriorityColor={getPriorityColor}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Empty State */}
                {selectedStage && selectedStageProjects.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No projects found</h3>
                      <p className="text-muted-foreground mb-4">
                        {selectedProjectType === 'all'
                          ? "There are no projects in this workflow stage."
                          : `There are no ${PROJECT_TYPE_LABELS[selectedProjectType]} projects in this workflow stage.`}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedProjectType('all')}
                        className="mr-2"
                      >
                        Clear filters
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStageSelect(workflowStages[0]?.id || null)}
                      >
                        View all stages
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ProjectErrorBoundary>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <ProjectErrorBoundary context="Project Analytics">
              <ProjectWorkflowAnalytics
                projects={activeProjects.filter(p => selectedProjectType === 'all' || p.project_type === selectedProjectType)}
              />
            </ProjectErrorBoundary>
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <ProjectErrorBoundary context="Project Calendar">
              <ProjectCalendar
                projects={activeProjects.filter(p => selectedProjectType === 'all' || p.project_type === selectedProjectType)}
              />
            </ProjectErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </ProjectErrorBoundary>
  );
}