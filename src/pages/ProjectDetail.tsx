import { useState, useEffect, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  Send,
  Users,
  BarChart3,
  Settings,
  Download,
  MessageSquare,
  Plus,
  Edit,
  X,
  AlertCircle,
  RefreshCw,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Project } from "@/types/project";
import { Department, ReviewSubmission, InternalReview } from "@/types/review";
import { projectService } from "@/services/projectService";
import ProjectCommunication from "@/components/project/ProjectCommunication";
import { WorkflowStepper } from "@/components/project/WorkflowStepper";
import { useProjectMessages } from "@/hooks/useMessages";
import { DocumentManager } from "@/components/project/DocumentManager";

import { useProjectReviews } from "@/hooks/useProjectReviews";
import { useProjects } from "@/hooks/useProjects";
import { useWorkflowAutoAdvance } from "@/hooks/useWorkflowAutoAdvance";
import { ProjectReviewForm } from "@/components/project/ProjectReviewForm";
import { ReviewConfiguration } from "@/components/project/ReviewConfiguration";
import { ReviewList } from "@/components/project/ReviewList";
import { ReviewAssignmentModal } from "@/components/project/ReviewAssignmentModal";
import { useUserDisplayName, useUsers, useUser } from "@/hooks/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { ProjectDetailHeader } from "@/components/project/ProjectDetailHeader";
import { ProjectSummaryCard } from "@/components/project/ProjectSummaryCard";
import { VisualTimelineProgression } from "@/components/project/VisualTimelineProgression";
import { useWorkflowStages } from "@/hooks/useWorkflowStages";
import { ResponsiveNavigationWrapper } from "@/components/project/ResponsiveNavigationWrapper";
import { TabTransition, TabContentWrapper } from "@/components/project/TabTransition";
import { useProjectNavigation } from "@/hooks/useProjectNavigation";

// Import new enhanced components
import { InlineProjectEditor } from "@/components/project/InlineProjectEditor";
import { ProjectStatusManager } from "@/components/project/ProjectStatusManager";

// Separate component for auto-advance functionality to avoid Rules of Hooks violation
const ProjectAutoAdvance = memo(({ project }: { project: Project }) => {
  const autoAdvanceHook = useWorkflowAutoAdvance(project);

  // This component only renders when project is loaded, so hooks are always called in same order
  return null; // We don't need to render anything, just need the hook to be active
}, (prevProps, nextProps) => {
  // Only re-render if the project ID changes, not other properties
  return prevProps.project.id === nextProps.project.id;
});

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth(); // Add this line to access the profile

  // Debug logging
  console.log('🔍 ProjectDetail: Component rendered with ID:', id);
  console.log('🔍 ProjectDetail: Profile:', profile);

  // Fetch real data using hooks first
  const { data: messages = [], isLoading: messagesLoading } = useProjectMessages(id || '');

  const { reviews, loading: reviewsLoading, submitReview } = useProjectReviews(id || '');

  // Use the new navigation hook after data is fetched
  const {
    activeTab,
    navigationTabs,
    handleTabChange,
    getBreadcrumbs,
    isTabLoading,
    hasTabError,
  } = useProjectNavigation({
    projectId: id || 'temp',
    documentsCount: 0, // Removed documents section
    messagesCount: messages.length,
    unreadMessagesCount: messages.filter(m => !m.read_at).length,
    reviewsCount: reviews?.length || 0,
    pendingReviewsCount: reviews?.filter(r => r.status === 'pending').length || 0,
    supplierRfqsCount: 0, // Removed supplier RFQ section
    activeSupplierRfqsCount: 0, // Removed supplier RFQ section
  });

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'mock' | 'unknown'>('unknown');

  // Use the projects hook to get real-time updates - SINGLE DATA SOURCE
  const { projects, loading: projectsLoading, error: projectsError, fetchProjects, ensureProjectSubscription } = useProjects();

  // Review state management
  const [showReviewForm, setShowReviewForm] = useState<Department | null>(null);
  const [showReviewConfig, setShowReviewConfig] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<InternalReview | null>(null);

  // Get workflow stages
  const { data: workflowStages = [], isLoading: stagesLoading } = useWorkflowStages();

  // Get the project from the projects array - SINGLE DATA SOURCE
  const project = projects.find(p => p.id === id) || null;

  // Get user display names for project assignee and reviewers
  const assigneeDisplayName = useUserDisplayName(project?.assigned_to);

  // Collect all unique reviewer IDs
  const reviewerIds = reviews ? [...new Set(reviews.map(review => review.reviewer_id).filter(Boolean))] : [];
  const { users: reviewerUsers } = useUsers(reviewerIds);

  // Initialize and fetch projects if needed
  useEffect(() => {
    const initializeProject = async () => {
      if (!id) {
        setError("No project ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Test connection first
        const connectionTest = await projectService.testConnection();
        setDataSource(connectionTest.source);

        if (!connectionTest.success) {
          // Handle connection test failure
        }

        // Fetch projects to ensure we have the latest data
        await fetchProjects(true); // Force refresh to get latest data

      } catch (err) {
        console.error('❌ ProjectDetail: Error initializing project:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    initializeProject();
  }, [id, fetchProjects]);

  // Set up selective real-time subscription for the specific project
  useEffect(() => {
    if (project?.id) {
      console.log('🔔 Setting up selective real-time subscription for project:', project.id);

      // Ensure real-time subscription is set up for this project
      ensureProjectSubscription(project.id);
      console.log('✅ ProjectDetail: Project is being monitored by useProjects hook');
    }
  }, [project?.id, ensureProjectSubscription]);

  // Debug logging for project changes
  useEffect(() => {
    if (project) {
      console.log('🔄 ProjectDetail: Project data updated:', {
        id: project.id,
        current_stage_id: project.current_stage_id,
        status: project.status,
        updated_at: project.updated_at,
        projectsCount: projects.length
      });
    }
  }, [project?.current_stage_id, project?.status, project?.updated_at, projects.length]);

  // Loading state - check both projects loading and individual project loading
  const isLoading = loading || projectsLoading || !project;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <div>
            <h2 className="text-lg font-semibold">Loading Project Details</h2>
            <p className="text-muted-foreground">Fetching project data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || projectsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-600">
            <h2 className="text-lg font-semibold">Error Loading Project</h2>
            <p className="text-muted-foreground">{error || projectsError}</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Project not found
  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-yellow-600">
            <h2 className="text-lg font-semibold">Project Not Found</h2>
            <p className="text-muted-foreground">The requested project could not be found.</p>
          </div>
          <Button onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      inquiry_received: 'bg-blue-100 text-blue-800 border-blue-200',
      technical_review: 'bg-orange-100 text-orange-800 border-orange-200',
      supplier_rfq_sent: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      quoted: 'bg-green-100 text-green-800 border-green-200',
      order_confirmed: 'bg-purple-100 text-purple-800 border-purple-200',
      procurement_planning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_production: 'bg-teal-100 text-teal-800 border-teal-200',
      shipped_closed: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getAccessBadgeColor = (access: string) => {
    switch (access) {
      case 'internal': return 'bg-orange-100 text-orange-800';
      case 'restricted': return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'rejected': return <X className="w-4 h-4 text-red-600" />;
      case 'in_review': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Tab change is now handled by the navigation hook

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'in_review': return 'text-yellow-600';
      default: return 'text-gray-400';
    }
  };

  const formatFileSize = (sizeBytes: number) => {
    if (!sizeBytes) return 'N/A';
    const sizeMB = sizeBytes / (1024 * 1024);
    return `${sizeMB.toFixed(1)} MB`;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      inquiry_received: 'Inquiry Received',
      technical_review: 'Technical Review',
      supplier_rfq_sent: 'Supplier RFQ Sent',
      quoted: 'Quoted',
      order_confirmed: 'Order Confirmed',
      procurement_planning: 'Procurement Planning',
      in_production: 'In Production',
      shipped_closed: 'Shipped & Closed'
    };
    return labels[status as keyof typeof labels] || status;
  };

  // Helper function to get customer display name
  const getCustomerDisplayName = () => {
    if (project.customer?.company_name) return project.customer.company_name;
    if (project.customer?.contact_name) return project.customer.contact_name;
    return 'N/A';
  };

  // Helper function to get assignee display name
  const getAssigneeDisplayName = () => {
    const assigneeId = project.assigned_to || project.assignee_id;
    if (!assigneeId) return 'N/A';

    // Use the useUserDisplayName hook to get the display name
    return useUserDisplayName(assigneeId);
  };

  // Helper function to get volume from estimated value or default
  const getVolume = () => {
    if (project.estimated_value) {
      // Calculate volume based on estimated value and target price
      const targetPrice = 8.50; // Default target price per unit
      return Math.round(project.estimated_value / targetPrice).toLocaleString();
    }
    return 'N/A';
  };

  // Helper function to get target price per unit
  const getTargetPricePerUnit = () => {
    if (project.estimated_value) {
      const volume = 5000; // Default volume
      return `$${(project.estimated_value / volume).toFixed(2)}/unit`;
    }
    return '$8.50/unit';
  };

  // Review handling functions
  const handleAddReview = (department: Department) => {
    setShowReviewForm(department);
  };

  const handleEditReview = (review: InternalReview) => {
    setSelectedReview(review);
    setShowReviewForm(review.department);
  };

  const handleViewReview = (review: InternalReview) => {
    setSelectedReview(review);
    // For now, just show the review form in read-only mode
    setShowReviewForm(review.department);
  };

  const handleReviewSubmit = async (submission: ReviewSubmission) => {
    if (!id) return false;

    try {
      await submitReview(showReviewForm!, submission);
      setShowReviewForm(null);
      setSelectedReview(null);

      // Check for auto-advance after review submission
      if (project?.status === 'technical_review' as any) {

        // Small delay to allow review data to update
        setTimeout(() => {
          // The autoAdvanceHook is now rendered conditionally, so we can call it directly
          // or rely on the hook's internal state updates if it's still active.
          // For now, we'll just log the call.
          // If the hook is not active, this will be a no-op.
          // If the hook is active, it will check and potentially advance.
        }, 500);
      }

      return true;
    } catch (error) {
      console.error('Failed to submit review:', error);
      return false;
    }
  };

  const handleReviewConfigSave = async (config: any) => {
    // TODO: Implement actual configuration saving

    setShowReviewConfig(false);
  };

  const handleAssignmentSave = async (assignments: any[]) => {
    // TODO: Implement actual assignment saving

    setShowAssignmentModal(false);
  };

  // Handle project updates from inline editor and status manager
  const handleProjectUpdate = (updatedProject: Project) => {
    // Project state is now managed by useProjects hook
    // Real-time subscription will automatically pick up changes
    console.log('🔄 ProjectDetail: Project update received, real-time subscription will handle UI update');
  };

  return (
    <>
      <ProjectAutoAdvance project={project} />
      {/* Debug components removed - real-time workflow is now working correctly */}
      {/* Rest of the component content */}
      <div className="min-h-screen bg-background">
        {/* Enhanced Header Section */}
        <ProjectDetailHeader
          project={project}
          workflowStages={workflowStages as any}
          onBack={() => navigate('/projects')}
          onEdit={() => console.log('Edit project')}
          onShare={() => console.log('Share project')}
        />



        {/* Enhanced Interactive Navigation */}
        {project && (
          <ResponsiveNavigationWrapper
            activeTab={activeTab}
            onTabChange={handleTabChange}
            tabs={navigationTabs}
            projectId={project.id}
            projectTitle={project.title}
            onBack={() => navigate('/projects')}
          >
            <div className="p-6">
              <TabTransition activeTab={activeTab} isLoading={isTabLoading(activeTab)}>
                <TabContentWrapper
                  tabId="overview"
                  activeTab={activeTab}
                  isLoading={isTabLoading('overview')}
                  hasError={hasTabError('overview')}
                >
                  <div className="space-y-6">
                    {/* Enhanced Project Management Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Inline Project Editor */}
                      <InlineProjectEditor
                        project={project}
                        onUpdate={handleProjectUpdate}
                      />

                      {/* Project Status Manager */}
                      <ProjectStatusManager
                        project={project}
                        workflowStages={workflowStages as any}
                        onUpdate={handleProjectUpdate}
                      />
                    </div>

                    {/* Actions Needed for Current Stage */}
                    <ProjectSummaryCard
                      project={project}
                      workflowStages={workflowStages as any}
                      onEdit={() => console.log('Edit project')}
                      onViewDetails={() => console.log('View details')}
                    />

                    {/* Activity & Comments Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          ACTIVITY & COMMENTS
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {messagesLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">Loading messages...</span>
                          </div>
                        ) : messages.length > 0 ? (
                          <div className="space-y-4">
                            {messages.slice(0, 5).map((message) => (
                              <div key={message.id} className="text-sm">
                                <div className="font-medium">
                                  📅 {message.created_at ? format(new Date(message.created_at), 'MMM dd, HH:mm') : 'N/A'} – {message.sender_type || 'N/A'}
                                </div>
                                <div className="text-muted-foreground ml-4 mt-1">
                                  {message.content || 'N/A'}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            No activity or comments yet
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabContentWrapper>

                <TabContentWrapper
                  tabId="documents"
                  activeTab={activeTab}
                  isLoading={isTabLoading('documents')}
                  hasError={hasTabError('documents')}
                >
                  <DocumentManager projectId={id || ''} />
                </TabContentWrapper>

                <TabContentWrapper
                  tabId="timeline"
                  activeTab={activeTab}
                  isLoading={isTabLoading('timeline')}
                  hasError={hasTabError('timeline')}
                >
                  <div className="space-y-6">
                    {/* Visual Timeline Progression */}
                    <VisualTimelineProgression
                      project={project}
                      workflowStages={workflowStages as any}
                    />
                  </div>
                </TabContentWrapper>

                <TabContentWrapper
                  tabId="reviews"
                  activeTab={activeTab}
                  isLoading={isTabLoading('reviews')}
                  hasError={hasTabError('reviews')}
                >
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            INTERNAL REVIEWS
                          </CardTitle>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAssignmentModal(true)}
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Assign
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowReviewConfig(true)}
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Configure
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {reviewsLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span className="text-muted-foreground">Loading reviews...</span>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Quick Add Review Buttons */}
                            <div className="flex gap-2">
                              {(['Engineering', 'QA', 'Production'] as Department[]).map((department) => {
                                const existingReview = reviews.find(r => r.department === department);
                                return (
                                  <Button
                                    key={department}
                                    variant={existingReview ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => handleAddReview(department)}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {existingReview ? `Update ${department}` : `Add ${department}`}
                                  </Button>
                                );
                              })}
                            </div>

                            {/* Review List */}
                            <ReviewList
                              reviews={reviews}
                              onEditReview={handleEditReview}
                              onViewReview={handleViewReview}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabContentWrapper>

                <TabContentWrapper
                  tabId="supplier"
                  activeTab={activeTab}
                  isLoading={isTabLoading('supplier')}
                  hasError={hasTabError('supplier')}
                >
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          SUPPLIER MANAGEMENT
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-12">
                          <Send className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">Supplier Management</h3>
                          <p className="text-muted-foreground">
                            Supplier RFQ and management features coming soon
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabContentWrapper>

                <TabContentWrapper
                  tabId="communication"
                  activeTab={activeTab}
                  isLoading={isTabLoading('communication')}
                  hasError={hasTabError('communication')}
                >
                  <ProjectCommunication
                    projectId={project.id}
                    projectTitle={project.title}
                  />
                </TabContentWrapper>

                <TabContentWrapper
                  tabId="analytics"
                  activeTab={activeTab}
                  isLoading={isTabLoading('analytics')}
                  hasError={hasTabError('analytics')}
                >
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          ACTIVITY & COMMENTS
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Add Comment Section */}
                          <div className="border rounded-lg p-4 bg-muted/30">
                            <div className="space-y-3">
                              <Label htmlFor="comment">Add Comment</Label>
                              <Textarea
                                id="comment"
                                placeholder="Share updates, ask questions, or provide feedback..."
                                className="min-h-[80px]"
                              />
                              <div className="flex justify-end">
                                <Button>
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Add Comment
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Activity Timeline */}
                          {messagesLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              <span className="text-muted-foreground">Loading messages...</span>
                            </div>
                          ) : messages.length > 0 ? (
                            <div className="space-y-4">
                              {messages.map((message) => (
                                <div key={message.id} className="border-l-2 border-muted pl-4">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-foreground">
                                      📅 {message.created_at ? format(new Date(message.created_at), 'MMM dd, HH:mm') : 'N/A'} – {message.sender_type || 'N/A'}
                                    </p>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {message.content || 'N/A'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                              <h3 className="text-lg font-medium mb-2">No Activity</h3>
                              <p className="text-muted-foreground">
                                No messages or activity for this project yet
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabContentWrapper>

                <TabContentWrapper
                  tabId="settings"
                  activeTab={activeTab}
                  isLoading={isTabLoading('settings')}
                  hasError={hasTabError('settings')}
                >
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Settings className="w-5 h-5 mr-2" />
                          Project Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-12">
                          <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">Settings Coming Soon</h3>
                          <p className="text-muted-foreground">
                            Project settings and configuration will be available here
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabContentWrapper>
              </TabTransition>
            </div>
          </ResponsiveNavigationWrapper>
        )}

        {/* Supplier Modal - Coming Soon */}
        {showSupplierModal && (
          <div className="fixed inset-0 bg-background/95 backdrop-blur-lg flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg border shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Supplier RFQ</h3>
              <p className="text-muted-foreground mb-4">Supplier RFQ functionality coming soon...</p>
              <Button onClick={() => setShowSupplierModal(false)}>Close</Button>
            </div>
          </div>
        )}

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-background/95 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <ProjectReviewForm
                projectId={id || ''}
                department={showReviewForm}
                existingReview={selectedReview || undefined}
                onSubmit={handleReviewSubmit}
                onCancel={() => {
                  setShowReviewForm(null);
                  setSelectedReview(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Review Configuration Modal */}
        {showReviewConfig && (
          <div className="fixed inset-0 bg-background/95 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <ReviewConfiguration
                projectId={id || ''}
                onClose={() => setShowReviewConfig(false)}
                onSave={handleReviewConfigSave}
              />
            </div>
          </div>
        )}

        {/* Review Assignment Modal */}
        {showAssignmentModal && (
          <div className="fixed inset-0 bg-background/95 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <ReviewAssignmentModal
                projectId={id || ''}
                onClose={() => setShowAssignmentModal(false)}
                onSave={handleAssignmentSave}
              />
            </div>
          </div>
        )}
      </div >
    </>
  );
}



// Helper component to display assignee name
function AssigneeDisplay({ assigneeId, displayName }: { assigneeId?: string; displayName: string }) {
  if (!assigneeId) {
    return <span>N/A</span>;
  }

  return <span>{displayName}</span>;
}