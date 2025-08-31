import { useState, useEffect, memo, useContext } from "react";
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
import { useDocuments } from "@/hooks/useDocuments";
import { useProjectMessages } from "@/hooks/useMessages";
import { useSupplierRfqs } from "@/hooks/useSupplierRfqs";

import { useProjectReviews } from "@/hooks/useProjectReviews";
import { useProjects } from "@/hooks/useProjects";
import { useWorkflowAutoAdvance } from "@/hooks/useWorkflowAutoAdvance";
import { ProjectReviewForm } from "@/components/project/ProjectReviewForm";
import { ReviewConfiguration } from "@/components/project/ReviewConfiguration";
import { ReviewList } from "@/components/project/ReviewList";
import { ReviewAssignmentModal } from "@/components/project/ReviewAssignmentModal";
import { useUserDisplayName, useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { ProjectDetailHeader } from "@/components/project/ProjectDetailHeader";
import { ProjectSummaryCard } from "@/components/project/ProjectSummaryCard";
import { VisualTimelineProgression } from "@/components/project/VisualTimelineProgression";
import { useWorkflowStages } from "@/hooks/useWorkflowStages";
import { ResponsiveNavigationWrapper } from "@/components/project/ResponsiveNavigationWrapper";
import { TabTransition, TabContentWrapper } from "@/components/project/TabTransition";
import { useProjectNavigation } from "@/hooks/useProjectNavigation";

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

  // Fetch real data using hooks first
  const { data: documents = [], isLoading: documentsLoading } = useDocuments(id || '');
  const { data: messages = [], isLoading: messagesLoading } = useProjectMessages(id || '');
  const { data: supplierRfqs = [], isLoading: supplierRfqsLoading } = useSupplierRfqs(id || '');

  const { reviews, loading: reviewsLoading, getReviewStatuses, getOverallReviewStatus, getReviewSummary, submitReview } = useProjectReviews(id || '');

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
    documentsCount: documents.length,
    messagesCount: messages.length,
    unreadMessagesCount: messages.filter(m => !m.read_at).length,
    reviewsCount: reviews?.length || 0,
    pendingReviewsCount: reviews?.filter(r => r.status === 'pending').length || 0,
    supplierRfqsCount: supplierRfqs.length,
    activeSupplierRfqsCount: supplierRfqs.filter(rfq => rfq.status === 'sent' || rfq.status === 'pending').length,
  });

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'mock' | 'unknown'>('unknown');

  // Use the projects hook to get real-time updates
  const { projects } = useProjects();

  // Review state management
  const [showReviewForm, setShowReviewForm] = useState<Department | null>(null);
  const [showReviewConfig, setShowReviewConfig] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<InternalReview | null>(null);

  // Get workflow stages
  const { data: workflowStages = [], isLoading: stagesLoading } = useWorkflowStages();

  // Get user display names for project assignee and reviewers
  const assigneeDisplayName = useUserDisplayName(project?.assigned_to);

  // Collect all unique reviewer IDs
  const reviewerIds = reviews ? [...new Set(reviews.map(review => review.reviewer_id).filter(Boolean))] : [];
  const { users: reviewerUsers } = useUsers(reviewerIds);

  useEffect(() => {
    const fetchProject = async () => {
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

        }

        const projectData = await projectService.getProjectById(id);
        setProject(projectData);

      } catch (err) {
        console.error('❌ ProjectDetail: Error loading project:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Update project when projects list changes (for real-time updates)
  useEffect(() => {
    if (id && projects.length > 0) {
      console.log('🔄 ProjectDetail: Checking for project updates:', {
        currentId: id,
        projectsCount: projects.length,
        currentProjectStatus: project?.status,
        currentProjectUpdatedAt: project?.updated_at,
        availableProjectIds: projects.map(p => ({ id: p.id, status: p.status, updated_at: p.updated_at }))
      });

      const updatedProject = projects.find(p => p.id === id);
      if (updatedProject) {
        console.log('✅ ProjectDetail: Found matching project:', {
          projectId: updatedProject.id,
          projectStatus: updatedProject.status,
          projectUpdatedAt: updatedProject.updated_at
        });

        // Only update if the project has actually changed
        if (!project ||
          project.status !== updatedProject.status ||
          project.updated_at !== updatedProject.updated_at) {

          console.log('🔄 ProjectDetail: Project updated from real-time subscription:', {
            oldStatus: project?.status,
            newStatus: updatedProject.status,
            oldUpdatedAt: project?.updated_at,
            newUpdatedAt: updatedProject.updated_at,
            statusChanged: project?.status !== updatedProject.status,
            timestampChanged: project?.updated_at !== updatedProject.updated_at
          });

          setProject(updatedProject);
        } else {
          console.log('ℹ️ ProjectDetail: No changes detected, skipping update', {
            statusMatch: project?.status === updatedProject.status,
            timestampMatch: project?.updated_at === updatedProject.updated_at,
            currentProject: project,
            updatedProject: updatedProject
          });
        }
      } else {
        console.log('⚠️ ProjectDetail: No matching project found in projects list for ID:', id);
      }
    }
  }, [projects, id, project]);

  // Fallback mechanism: Force refresh project data if no real-time update received
  useEffect(() => {
    if (!project || !id) return;

    // Set up a timer to force refresh if no real-time update is received
    const refreshTimer = setTimeout(async () => {
      console.log('🔄 ProjectDetail: Fallback refresh triggered - fetching latest project data');
      try {
        const latestProject = await projectService.getProjectById(id);
        if (latestProject && (
          latestProject.status !== project.status ||
          latestProject.updated_at !== project.updated_at
        )) {
          console.log('🔄 ProjectDetail: Fallback refresh found updated data:', {
            oldStatus: project.status,
            newStatus: latestProject.status,
            oldUpdatedAt: project.updated_at,
            newUpdatedAt: latestProject.updated_at
          });
          setProject(latestProject);
        }
      } catch (error) {
        console.error('❌ ProjectDetail: Fallback refresh failed:', error);
      }
    }, 10000); // Increased to 10 seconds to prevent interference with real-time updates

    return () => clearTimeout(refreshTimer);
  }, [id]); // Only depend on id, not on project properties to prevent infinite loops

  // Loading state
  if (loading) {
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

  // Error state with diagnostic tools
  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="ghost" onClick={() => navigate('/projects')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold text-red-600">Project Not Found</h1>
              <p className="text-muted-foreground">Project ID: {id}</p>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Error Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>

                <div className="space-y-2 text-sm">
                  <p><strong>Requested Project ID:</strong> {id}</p>
                  <p><strong>Possible Causes:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                    <li>Project doesn't exist in the database</li>
                    <li>Database connection issues</li>
                    <li>Sample data hasn't been seeded</li>
                    <li>Project ID format mismatch</li>
                    <li>Project belongs to a different organization</li>
                    <li>You don't have permission to access this project</li>
                  </ul>
                </div>

                <div className="mt-4 pt-4 border-t border-muted">
                  <p className="font-medium mb-2">Troubleshooting Steps:</p>
                  <ol className="list-decimal list-inside ml-4 space-y-1 text-muted-foreground">
                    <li>Verify the project ID is correct</li>
                    <li>Check that you are logged in with the correct account</li>
                    <li>Confirm the project belongs to your organization</li>
                    <li>Try refreshing the projects list and selecting the project again</li>
                    <li>If you're an administrator, check the database seed data</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => navigate('/projects')}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back to Projects List
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Loading
                </Button>
                {profile?.role === 'admin' && (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/settings')}
                    className="w-full"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Go to Settings
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
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
    return project.assigned_to || 'N/A';
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
      if (project?.status === 'technical_review') {

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

  return (
    <>
      <ProjectAutoAdvance project={project} />
      {/* Rest of the component content */}
      <div className="min-h-screen bg-background">
        {/* Enhanced Header Section */}
        <ProjectDetailHeader
          project={project}
          workflowStages={workflowStages}
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
                    {/* Actions Needed for Current Stage */}
                    <ProjectSummaryCard
                      project={project}
                      workflowStages={workflowStages}
                      onEdit={() => console.log('Edit project')}
                      onViewDetails={() => console.log('View details')}
                    />

                    {/* Review Status Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          REVIEW STATUS
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Internal review progress for Engineering, QA, and Production
                        </p>
                      </CardHeader>
                      <CardContent>
                        {reviewsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">Loading review status...</span>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Review Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Overall Progress</span>
                                <span className="font-medium">{getReviewSummary().progress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${getReviewSummary().progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Department Review Statuses */}
                            <div className="grid grid-cols-1 gap-3">
                              {(['Engineering', 'QA', 'Production'] as const).map((department) => {
                                const status = getReviewStatuses()[department];
                                const review = reviews.find(r => r.department === department);

                                const getStatusIcon = (status: string) => {
                                  switch (status) {
                                    case 'approved': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
                                    case 'rejected': return <X className="w-4 h-4 text-red-600" />;
                                    case 'revision_requested': return <AlertCircle className="w-4 h-4 text-orange-600" />;
                                    default: return <Clock className="w-4 h-4 text-gray-400" />;
                                  }
                                };

                                const getStatusColor = (status: string) => {
                                  switch (status) {
                                    case 'approved': return 'bg-green-100 text-green-800 border-green-200';
                                    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
                                    case 'revision_requested': return 'bg-orange-100 text-orange-800 border-orange-200';
                                    default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                                  }
                                };

                                return (
                                  <div key={department} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      <div className="flex items-center space-x-2">
                                        {getStatusIcon(status)}
                                        <span className="font-medium text-sm">{department}</span>
                                      </div>
                                      {review?.reviewer_id && (
                                        <ReviewerDisplay
                                          reviewerId={review.reviewer_id}
                                          displayName={reviewerUsers.get(review.reviewer_id)?.display_name || review.reviewer_id}
                                        />
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge className={`text-xs ${getStatusColor(status)}`}>
                                        {status === 'pending' ? 'Pending' :
                                          status === 'approved' ? 'Approved' :
                                            status === 'rejected' ? 'Rejected' :
                                              'Revision Requested'}
                                      </Badge>
                                      {review?.submitted_at && (
                                        <span className="text-xs text-muted-foreground">
                                          📅 {format(new Date(review.submitted_at), 'MMM dd')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Review Summary */}
                            <div className="pt-3 border-t">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-center">
                                  <div className="font-semibold text-green-600">{getReviewSummary().approved}</div>
                                  <div className="text-muted-foreground">Approved</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-semibold text-yellow-600">{getReviewSummary().pending}</div>
                                  <div className="text-muted-foreground">Pending</div>
                                </div>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => handleTabChange("reviews")}
                            >
                              🔍 View All Reviews
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Documents Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          DOCUMENTS
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {documentsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">Loading documents...</span>
                          </div>
                        ) : documents.length > 0 ? (
                          <div className="space-y-3">
                            {documents.map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <span>📄</span>
                                  <span className="font-medium">{doc.original_file_name || doc.filename || 'N/A'}</span>
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    [{doc.version || 'v1'}]
                                  </Badge>
                                  <span className="text-muted-foreground">
                                    📅 {doc.uploaded_at ? format(new Date(doc.uploaded_at), 'MMM dd') : 'N/A'} · 👤 {doc.uploaded_by || 'N/A'}
                                  </span>
                                  {doc.access_level === 'internal' && (
                                    <Badge className="text-xs bg-orange-100 text-orange-800">
                                      🔒 Internal Only
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            No documents uploaded yet
                          </div>
                        )}
                        <Button variant="outline" size="sm" className="mt-3">
                          <Plus className="w-4 h-4 mr-2" />
                          Upload New File
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Supplier RFQ Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          SUPPLIER RFQ SENT
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {supplierRfqsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">Loading supplier RFQs...</span>
                          </div>
                        ) : supplierRfqs.length > 0 ? (
                          <div className="space-y-4">
                            <p className="text-sm font-medium">📧 Sent to:</p>
                            <div className="space-y-2">
                              {supplierRfqs.map((rfq) => (
                                <div key={rfq.id} className="flex items-center justify-between text-sm">
                                  <div className="flex-1">
                                    <span>• {rfq.supplier?.name || 'N/A'} ({rfq.supplier?.email || 'N/A'})</span>
                                  </div>
                                  <div>
                                    {rfq.status === 'sent' && (
                                      <span className="text-yellow-600">– 🟡 Sent (Due: {rfq.due_date ? format(new Date(rfq.due_date), 'MMM dd') : 'N/A'})</span>
                                    )}
                                    {rfq.status === 'quoted' && (
                                      <span className="text-green-600">– ✅ Quoted</span>
                                    )}
                                    {rfq.status === 'viewed' && (
                                      <span className="text-blue-600">– 👁️ Viewed</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            No supplier RFQs sent yet
                          </div>
                        )}
                        <div className="flex space-x-2 pt-2">
                          <Button variant="outline" size="sm">
                            <Send className="w-4 h-4 mr-1" />
                            📤 Resend
                          </Button>
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-1" />
                            ➕ Add Supplier
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            📅 Set Deadline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

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
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            DOCUMENTS
                          </CardTitle>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Upload New File
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {documentsLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span className="text-muted-foreground">Loading documents...</span>
                          </div>
                        ) : documents.length > 0 ? (
                          <div className="space-y-4">
                            {documents.map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                                <div className="flex items-center space-x-4">
                                  <FileText className="w-5 h-5 text-muted-foreground" />
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">{doc.original_file_name || doc.filename || 'N/A'}</span>
                                      <Badge variant="outline" className="text-xs">
                                        [{doc.version || 'v1'}]
                                      </Badge>
                                      <Badge className={`text-xs ${getAccessBadgeColor(doc.access_level || 'public')}`}>
                                        {doc.access_level === 'internal' ? '🔒 Internal Only' : '🌐 Public'}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                                      <span>📅 {doc.uploaded_at ? format(new Date(doc.uploaded_at), 'MMM dd') : 'N/A'}</span>
                                      <span>👤 {doc.uploaded_by || 'N/A'}</span>
                                      <span>📁 {formatFileSize(doc.file_size || 0)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Documents</h3>
                            <p className="text-muted-foreground">
                              No documents have been uploaded for this project yet
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
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
                      workflowStages={workflowStages}
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
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            SUPPLIER RFQ SENT
                          </CardTitle>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Send className="w-4 h-4 mr-2" />
                              📤 Resend
                            </Button>
                            <Button variant="outline" size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              ➕ Add Supplier
                            </Button>
                            <Button variant="outline" size="sm">
                              <Calendar className="w-4 h-4 mr-2" />
                              📅 Set Deadline
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {supplierRfqsLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span className="text-muted-foreground">Loading supplier RFQs...</span>
                          </div>
                        ) : supplierRfqs.length > 0 ? (
                          <div className="space-y-4">
                            <p className="text-sm font-medium">📧 Sent to:</p>
                            {supplierRfqs.map((rfq) => (
                              <div key={rfq.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <p className="font-medium">• {rfq.supplier?.name || 'N/A'}</p>
                                    <p className="text-sm text-muted-foreground">({rfq.supplier?.email || 'N/A'})</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {rfq.status === 'sent' ? (
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                      🟡 Sent (Due: {rfq.due_date ? format(new Date(rfq.due_date), 'MMM dd') : 'N/A'})
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-green-100 text-green-800">
                                      ✅ {rfq.status === 'quoted' ? 'Quoted' : rfq.status === 'viewed' ? 'Viewed' : rfq.status}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Send className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Supplier RFQs</h3>
                            <p className="text-muted-foreground">
                              No supplier RFQs have been sent for this project yet
                            </p>
                          </div>
                        )}
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

// Helper component to display reviewer name
function ReviewerDisplay({ reviewerId, displayName }: { reviewerId: string; displayName: string }) {
  return (
    <span className="text-xs text-muted-foreground">
      👤 {displayName}
    </span>
  );
}

// Helper component to display assignee name
function AssigneeDisplay({ assigneeId, displayName }: { assigneeId?: string; displayName: string }) {
  if (!assigneeId) {
    return <span>N/A</span>;
  }

  return <span>{displayName}</span>;
}