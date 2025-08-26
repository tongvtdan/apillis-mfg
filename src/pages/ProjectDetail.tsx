import { useState, useEffect } from "react";
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
import { projectService } from "@/services/projectService";
import ProjectCommunication from "@/components/project/ProjectCommunication";
import { WorkflowStepper } from "@/components/project/WorkflowStepper";

// Document interface for mock data
interface ProjectDocument {
  id: string;
  name: string;
  version: string;
  uploadedAt: string;
  uploadedBy: string;
  type: string;
  size: number;
  access: 'public' | 'internal' | 'restricted';
}

// Review interface for internal reviews
interface DepartmentReview {
  department: 'Engineering' | 'QA' | 'Production';
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  reviewer: string;
  reviewedAt?: string;
  comments: string[];
}

// Activity interface for timeline
interface ProjectActivity {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details?: string;
  type: 'status_change' | 'comment' | 'document' | 'review' | 'rfq';
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();


  const [activeTab, setActiveTab] = useState(() => {
    // Try to restore the active tab from sessionStorage based on project ID
    const savedTab = sessionStorage.getItem(`project-${id}-active-tab`);
    return savedTab || "overview";
  });
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'mock' | 'unknown'>('unknown');

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
        console.log('🔍 ProjectDetail: Fetching project with ID:', id);

        // Test connection first
        const connectionTest = await projectService.testConnection();
        setDataSource(connectionTest.source);

        if (!connectionTest.success) {
          console.warn('⚠️ ProjectDetail: Connection test failed, using mock data:', connectionTest.error);
        }

        const projectData = await projectService.getProjectById(id);
        setProject(projectData);
        console.log('✅ ProjectDetail: Project loaded successfully:', projectData.project_id);
      } catch (err) {
        console.error('❌ ProjectDetail: Error loading project:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

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
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Debug components temporarily disabled - components not found */}
            {/*
            <DatabaseDiagnostic />
            <QuickDatabaseSeeder />
            <ProjectLoadTest />
            */}

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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Mock data for documents
  const documents = [
    {
      id: '1',
      name: 'Sensor_Mount_Drawing_REV2.pdf',
      version: 'v2',
      uploadedAt: '2025-08-20T14:30:00Z',
      uploadedBy: 'Sarah',
      type: 'pdf',
      size: 2.1,
      access: 'internal'
    },
    {
      id: '2',
      name: 'BOM_SensorMount.xlsx',
      version: 'v1',
      uploadedAt: '2025-08-20T15:15:00Z',
      uploadedBy: 'Anna',
      type: 'xlsx',
      size: 0.8,
      access: 'public'
    },
    {
      id: '3',
      name: 'Material_Spec_Al6061.pdf',
      version: 'v1',
      uploadedAt: '2025-08-20T16:00:00Z',
      uploadedBy: 'Engineering',
      type: 'pdf',
      size: 1.5,
      access: 'public'
    }
  ];

  // Mock data for reviews
  const reviews = [
    {
      department: 'Engineering',
      status: 'approved',
      reviewer: 'Minh',
      reviewedAt: '2025-08-21T14:30:00Z',
      comments: [
        'Design feasible, no major risks',
        'Suggest anodizing for corrosion resistance'
      ]
    },
    {
      department: 'QA',
      status: 'approved',
      reviewer: 'Linh',
      reviewedAt: '2025-08-21T15:45:00Z',
      comments: [
        'CMM inspection required for critical dimensions'
      ]
    },
    {
      department: 'Production',
      status: 'in_review',
      reviewer: 'Hung',
      reviewedAt: '2025-08-21T16:00:00Z',
      comments: [
        'Tooling required: custom jig ($1,200)',
        'Cycle time: ~4.5 min/unit → may impact lead time'
      ]
    }
  ];

  // Mock data for activities
  const activities = [
    {
      id: '1',
      timestamp: '2025-08-25T10:15:00Z',
      user: 'Sarah (Sales)',
      action: 'Updated target price to $8.20 based on supplier quotes',
      type: 'comment'
    },
    {
      id: '2',
      timestamp: '2025-08-21T16:20:00Z',
      user: 'Anna (Procurement)',
      action: 'Sent RFQ to 3 suppliers – deadline Aug 25',
      type: 'rfq'
    }
  ];

  // Mock supplier RFQ data
  const supplierRFQs = [
    {
      supplier: 'Precision Metals Co.',
      email: 'joe@precimetals.com',
      status: 'pending',
      deadline: 'Aug 25',
      quote: null
    },
    {
      supplier: 'CNC Masters Inc.',
      email: 'quotes@cnchub.com',
      status: 'received',
      deadline: 'Aug 25',
      quote: '$7.80/unit'
    },
    {
      supplier: 'Alpha Fabricators',
      email: 'rfq@alphafab.com',
      status: 'received',
      deadline: 'Aug 25',
      quote: '$8.10/unit'
    }
  ];



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

  // Helper function to handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Save the active tab to sessionStorage for this specific project
    sessionStorage.setItem(`project-${id}-active-tab`, tab);
  };

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'in_review': return 'text-yellow-600';
      default: return 'text-gray-400';
    }
  };

  const formatFileSize = (sizeMB: number) => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Match wireframe design */}
      <div className="border-b bg-card">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-2">
            <Button variant="ghost" onClick={() => navigate('/projects')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <Separator orientation="vertical" className="h-6" />
          </div>

          {/* Main header info */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4 text-lg font-semibold">
              <span>Project: {project.project_id} – {project.title}</span>
              <span>|</span>
              <span className="flex items-center">
                Stage: <Badge className={cn("ml-2", getStatusColor(project.status))}>
                  {getStatusLabel(project.status)}
                </Badge>
              </span>
              <span>|</span>
              <span className="flex items-center">
                Priority: <Badge className={cn("ml-2", getPriorityColor(project.priority))}>
                  {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                </Badge>
              </span>
            </div>

            {/* Secondary info */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Building2 className="w-4 h-4 mr-1" />
                Customer: {project.customer?.company || project.customer?.name || project.contact_name || 'TechNova Inc.'}
              </span>
              <span>|</span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Created: {format(new Date(project.created_at), 'MMM dd, yyyy')}
              </span>
              <span>|</span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Owner: {project.assignee_id || 'Sarah Lee'}
              </span>
              {dataSource === 'mock' && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  📋 Demo Data
                </Badge>
              )}
              {dataSource === 'supabase' && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  🔗 Live Data
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Stepper */}
      <WorkflowStepper project={project} />

      {/* Main Content */}
      <div className="flex">
        {/* Navigation Sidebar */}
        <div className="w-48 border-r bg-card shadow-sm min-h-screen">
          <div className="p-4">
            <div className="mb-4 text-xs font-bold text-primary uppercase tracking-wider py-2 border-b border-muted">
              NAVIGATION
            </div>
            <nav className="space-y-2">
              <button
                onClick={() => handleTabChange("overview")}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                  activeTab === "overview"
                    ? "bg-primary text-primary-foreground font-bold shadow-sm border-l-4 border-primary"
                    : "text-foreground hover:bg-muted hover:border-l-4 hover:border-muted-foreground/30"
                )}
              >
                Overview
              </button>
              <button
                onClick={() => handleTabChange("documents")}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                  activeTab === "documents"
                    ? "bg-primary text-primary-foreground font-bold shadow-sm border-l-4 border-primary"
                    : "text-foreground hover:bg-muted hover:border-l-4 hover:border-muted-foreground/30"
                )}
              >
                Documents
              </button>
              <button
                onClick={() => handleTabChange("reviews")}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                  activeTab === "reviews"
                    ? "bg-primary text-primary-foreground font-bold shadow-sm border-l-4 border-primary"
                    : "text-foreground hover:bg-muted hover:border-l-4 hover:border-muted-foreground/30"
                )}
              >
                Reviews
              </button>
              <button
                onClick={() => handleTabChange("supplier")}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                  activeTab === "supplier"
                    ? "bg-primary text-primary-foreground font-bold shadow-sm border-l-4 border-primary"
                    : "text-foreground hover:bg-muted hover:border-l-4 hover:border-muted-foreground/30"
                )}
              >
                Supplier
              </button>
              <button
                onClick={() => handleTabChange("communication")}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                  activeTab === "communication"
                    ? "bg-primary text-primary-foreground font-bold shadow-sm border-l-4 border-primary"
                    : "text-foreground hover:bg-muted hover:border-l-4 hover:border-muted-foreground/30"
                )}
              >
                Communication
              </button>
              <button
                onClick={() => handleTabChange("timeline")}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                  activeTab === "timeline"
                    ? "bg-primary text-primary-foreground font-bold shadow-sm border-l-4 border-primary"
                    : "text-foreground hover:bg-muted hover:border-l-4 hover:border-muted-foreground/30"
                )}
              >
                Timeline
              </button>
              <button
                onClick={() => handleTabChange("analytics")}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                  activeTab === "analytics"
                    ? "bg-primary text-primary-foreground font-bold shadow-sm border-l-4 border-primary"
                    : "text-foreground hover:bg-muted hover:border-l-4 hover:border-muted-foreground/30"
                )}
              >
                Analytics
              </button>
              <button
                onClick={() => handleTabChange("settings")}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                  activeTab === "settings"
                    ? "bg-primary text-primary-foreground font-bold shadow-sm border-l-4 border-primary"
                    : "text-foreground hover:bg-muted hover:border-l-4 hover:border-muted-foreground/30"
                )}
              >
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    DETAILS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex">
                      <div className="w-24 text-sm font-medium text-muted-foreground">Title:</div>
                      <div className="flex-1 text-sm">{project.title} – Aluminum Alloy</div>
                    </div>
                    <div className="flex">
                      <div className="w-24 text-sm font-medium text-muted-foreground">Description:</div>
                      <div className="flex-1 text-sm">{project.description || 'High-precision mount for industrial sensors'}</div>
                    </div>
                    <div className="flex">
                      <div className="w-24 text-sm font-medium text-muted-foreground">Volume:</div>
                      <div className="flex-1 text-sm">5,000 pcs</div>
                    </div>
                    <div className="flex">
                      <div className="w-24 text-sm font-medium text-muted-foreground">Target Price:</div>
                      <div className="flex-1 text-sm">${project.estimated_value ? (project.estimated_value / 5000).toFixed(2) : '8.50'}/unit</div>
                    </div>
                    <div className="flex">
                      <div className="w-24 text-sm font-medium text-muted-foreground">Delivery:</div>
                      <div className="flex-1 text-sm">{project.due_date ? format(new Date(project.due_date), 'MMM dd, yyyy') : 'Oct 15, 2025'}</div>
                    </div>
                    <div className="flex">
                      <div className="w-24 text-sm font-medium text-muted-foreground">Notes:</div>
                      <div className="flex-1 text-sm">{project.notes || 'Customer open to alternative materials'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* All sections visible by default in Overview as per wireframe */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    DOCUMENTS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span>📄</span>
                          <span className="font-medium">{doc.name}</span>
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            [{doc.version}]
                          </Badge>
                          <span className="text-muted-foreground">
                            📅 {format(new Date(doc.uploadedAt), 'MMM dd')} · 👤 {doc.uploadedBy}
                          </span>
                          {doc.access === 'internal' && (
                            <Badge className="text-xs bg-orange-100 text-orange-800">
                              🔒 Internal Only
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="mt-3">
                      <Plus className="w-4 h-4 mr-2" />
                      Upload New File
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    INTERNAL REVIEWS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.department} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {review.status === 'approved' && <span className="text-green-600">✅</span>}
                            {review.status === 'in_review' && <span className="text-yellow-600">🟡</span>}
                            {review.status === 'pending' && <span className="text-gray-400">⏳</span>}
                            <span className="font-medium">{review.department}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            👤 {review.reviewer} · {review.reviewedAt ? format(new Date(review.reviewedAt), 'MMM dd') : 'Pending'}
                            {review.reviewedAt && (
                              <span className="ml-1">📅 {format(new Date(review.reviewedAt), 'HH:mm')}</span>
                            )}
                          </div>
                        </div>
                        {review.comments.length > 0 && (
                          <div className="ml-6 space-y-1">
                            {review.comments.map((comment, index) => (
                              <div key={index} className="text-sm text-muted-foreground">
                                - {comment}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    SUPPLIER RFQ SENT
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm font-medium">📧 Sent to:</p>
                    <div className="space-y-2">
                      {supplierRFQs.map((rfq, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex-1">
                            <span>• {rfq.supplier} ({rfq.email})</span>
                          </div>
                          <div>
                            {rfq.status === 'pending' && (
                              <span className="text-yellow-600">– 🟡 Pending (Due: {rfq.deadline})</span>
                            )}
                            {rfq.status === 'received' && (
                              <span className="text-green-600">– ✅ Received ({rfq.quote})</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    ACTIVITY & COMMENTS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="text-sm">
                        <div className="font-medium">
                          📅 {format(new Date(activity.timestamp), 'MMM dd, HH:mm')} – {activity.user}
                        </div>
                        <div className="text-muted-foreground ml-4 mt-1">
                          {activity.action}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "documents" && (
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
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center space-x-4">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{doc.name}</span>
                              <Badge variant="outline" className="text-xs">
                                [{doc.version}]
                              </Badge>
                              <Badge className={`text-xs ${getAccessBadgeColor(doc.access)}`}>
                                {doc.access === 'internal' ? '🔒 Internal Only' : '🌐 Public'}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <span>📅 {format(new Date(doc.uploadedAt), 'MMM dd')}</span>
                              <span>👤 {doc.uploadedBy}</span>
                              <span>📁 {formatFileSize(doc.size)}</span>
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
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    INTERNAL REVIEWS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.department} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(review.status)}
                            <div>
                              <h4 className="font-medium">{review.department}</h4>
                              <p className="text-sm text-muted-foreground">
                                {review.reviewedAt ? `👤 ${review.reviewer} · 📅 ${format(new Date(review.reviewedAt), 'MMM dd, HH:mm')}` : 'Pending review'}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${getReviewStatusColor(review.status)} bg-transparent border`}>
                            {review.status === 'approved' ? '✅' : review.status === 'in_review' ? '🟡' : '⏳'} {review.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>

                        {review.comments.length > 0 && (
                          <div className="ml-8 space-y-2">
                            {review.comments.map((comment, index) => (
                              <div key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                                <span className="text-muted-foreground">-</span>
                                <span>{comment}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "supplier" && (
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
                  <div className="space-y-4">
                    <p className="text-sm font-medium">📧 Sent to:</p>
                    {supplierRFQs.map((rfq, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">• {rfq.supplier}</p>
                            <p className="text-sm text-muted-foreground">({rfq.email})</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {rfq.status === 'pending' ? (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              🟡 Pending (Due: {rfq.deadline})
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">
                              ✅ Received ({rfq.quote})
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "communication" && (
            <ProjectCommunication
              projectId={project.id}
              projectTitle={project.title}
            />
          )}

          {activeTab === "timeline" && (
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
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="border-l-2 border-muted pl-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">
                              📅 {format(new Date(activity.timestamp), 'MMM dd, HH:mm')} – {activity.user}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.action}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Project Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                    <p className="text-muted-foreground">
                      Project analytics and insights will be available here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
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
          )}
        </div>
      </div>

      {/* Supplier Modal - Coming Soon */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg border shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-card-foreground">Supplier RFQ</h3>
            <p className="text-muted-foreground mb-4">Supplier RFQ functionality coming soon...</p>
            <Button onClick={() => setShowSupplierModal(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}