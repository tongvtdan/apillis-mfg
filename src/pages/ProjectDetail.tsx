import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Mail,
  Phone,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Send,
  Users,
  BarChart3,
  Settings,
  Eye,
  Download,
  Upload,
  MessageSquare,
  Plus,
  Edit,
  Paperclip,
  UserCheck,
  X,
  AlertCircle,
  RefreshCw,
  Database
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/useProjects";
import { useSupplierQuotes } from "@/hooks/useSupplierQuotes";
import { useSuppliers } from "@/hooks/useSuppliers";
import {
  Project,
  PRIORITY_COLORS,
  PROJECT_TYPE_LABELS,
  ProjectStatus,
  PROJECT_STAGES
} from "@/types/project";
import {
  SupplierQuote,
  QuoteReadinessIndicator,
  QUOTE_READINESS_COLORS,
  SUPPLIER_QUOTE_STATUS_COLORS,
  SUPPLIER_QUOTE_STATUS_LABELS
} from "@/types/supplier";
import { SupplierQuoteModal } from "@/components/supplier/SupplierQuoteModal";
import { SupplierQuoteTable } from "@/components/supplier/SupplierQuoteTable";
import { DatabaseDiagnostic } from "@/components/debug/DatabaseDiagnostic";

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

interface ProjectOverviewProps {
  project: Project;
  quoteReadiness: QuoteReadinessIndicator | null;
}

function ProjectOverview({ project, quoteReadiness }: ProjectOverviewProps) {
  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: ProjectStatus) => {
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
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Project Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Project ID</label>
            <p className="font-medium">{project.project_id}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Customer</label>
            <div className="mt-1">
              <p className="font-medium">{project.customer?.company || project.contact_name}</p>
              {project.customer?.name && project.customer.name !== project.customer.company && (
                <p className="text-sm text-muted-foreground">Contact: {project.customer.name}</p>
              )}
              {project.contact_email && (
                <p className="text-sm text-muted-foreground">
                  <Mail className="w-3 h-3 inline mr-1" />
                  {project.contact_email}
                </p>
              )}
              {project.contact_phone && (
                <p className="text-sm text-muted-foreground">
                  <Phone className="w-3 h-3 inline mr-1" />
                  {project.contact_phone}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="mt-1">
              <Badge className={getStatusColor(project.status)}>
                {PROJECT_STAGES.find(s => s.id === project.status)?.name || project.status}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Priority</label>
            <div className="mt-1">
              <Badge className={getPriorityColor(project.priority)}>
                {project.priority.toUpperCase()}
              </Badge>
            </div>
          </div>

          {project.estimated_value && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estimated Value</label>
              <p className="font-medium">${project.estimated_value.toLocaleString()}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-muted-foreground">Days in Current Stage</label>
            <p className="font-medium">{project.days_in_stage} days</p>
          </div>
        </CardContent>
      </Card>

      {/* Project Description & Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Description & Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-sm mt-1">{project.description || 'No description provided'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Project Type</label>
              <p className="text-sm mt-1">{PROJECT_TYPE_LABELS[project.project_type] || project.project_type}</p>
            </div>

            {project.tags && project.tags.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tags</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {project.due_date && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                <p className="text-sm mt-1">{format(new Date(project.due_date), 'MMM dd, yyyy')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quote Readiness & Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progress & Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-sm mt-1">{format(new Date(project.created_at), 'MMM dd, yyyy')}</p>
            </div>

            {project.updated_at && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm mt-1">{format(new Date(project.updated_at), 'MMM dd, yyyy')}</p>
              </div>
            )}

            {quoteReadiness && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quote Progress</label>
                  <div className="mt-2">
                    <Progress value={(quoteReadiness.receivedQuotes / quoteReadiness.totalSuppliers) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {quoteReadiness.receivedQuotes} of {quoteReadiness.totalSuppliers} quotes received
                    </p>
                  </div>
                </div>

                {quoteReadiness.overdueQuotes > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">
                        {quoteReadiness.overdueQuotes} overdue quotes
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">Assignee</label>
              <p className="text-sm mt-1">{project.assignee_id || 'Unassigned'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DocumentsSection({ project }: { project: Project }) {
  // Mock documents data - in real app this would come from a documents service
  const [documents] = useState<ProjectDocument[]>([
    {
      id: '1',
      name: 'Sensor_Mount_Drawing_REV2.pdf',
      version: 'v2',
      uploadedAt: '2025-08-20T14:30:00Z',
      uploadedBy: 'Sarah Lee',
      type: 'pdf',
      size: 2.1,
      access: 'internal'
    },
    {
      id: '2',
      name: 'BOM_SensorMount.xlsx',
      version: 'v1',
      uploadedAt: '2025-08-20T15:15:00Z',
      uploadedBy: 'Anna Tran',
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
  ]);

  const getAccessBadgeColor = (access: string) => {
    switch (access) {
      case 'internal': return 'bg-orange-100 text-orange-800';
      case 'restricted': return 'bg-red-100 text-red-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const formatFileSize = (sizeMB: number) => {
    return `${sizeMB.toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Project drawings, specifications, and supporting files
            </CardDescription>
          </div>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-muted rounded">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{doc.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {doc.version}
                    </Badge>
                    <Badge className={`text-xs ${getAccessBadgeColor(doc.access)}`}>
                      {doc.access === 'internal' ? '🔒 Internal Only' : doc.access === 'restricted' ? '🔐 Restricted' : '🌐 Public'}
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
  );
}

function InternalReviewsSection({ project }: { project: Project }) {
  // Mock review data - in real app this would come from reviews service
  const [reviews] = useState<DepartmentReview[]>([
    {
      department: 'Engineering',
      status: 'approved',
      reviewer: 'Minh Nguyen',
      reviewedAt: '2025-08-21T14:30:00Z',
      comments: [
        'Design feasible, no major risks',
        'Suggest anodizing for corrosion resistance'
      ]
    },
    {
      department: 'QA',
      status: 'approved',
      reviewer: 'Linh Tran',
      reviewedAt: '2025-08-21T15:45:00Z',
      comments: [
        'CMM inspection required for critical dimensions'
      ]
    },
    {
      department: 'Production',
      status: 'in_review',
      reviewer: 'Hung Le',
      reviewedAt: '2025-08-21T16:00:00Z',
      comments: [
        'Tooling required: custom jig ($1,200)',
        'Cycle time: ~4.5 min/unit → may impact lead time'
      ]
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'rejected': return <X className="w-5 h-5 text-red-600" />;
      case 'in_review': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'in_review': return 'text-yellow-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internal Reviews</CardTitle>
        <CardDescription>
          Track department reviews and approvals
        </CardDescription>
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
                <Badge className={`${getStatusColor(review.status)} bg-transparent border`}>
                  {review.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              {review.comments.length > 0 && (
                <div className="ml-8 space-y-2">
                  {review.comments.map((comment, index) => (
                    <div key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                      <span className="text-muted-foreground">•</span>
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
  );
}

function ActivityTimelineSection({ project }: { project: Project }) {
  // Mock activity data - in real app this would come from activity/audit service
  const [activities] = useState<ProjectActivity[]>([
    {
      id: '1',
      timestamp: '2025-08-25T10:15:00Z',
      user: 'Sarah Chen (Sales)',
      action: 'Updated target price to $8.20 based on supplier quotes',
      type: 'comment'
    },
    {
      id: '2',
      timestamp: '2025-08-21T16:20:00Z',
      user: 'Anna Tran (Procurement)',
      action: 'Sent RFQ to 3 suppliers – deadline Aug 25',
      type: 'rfq'
    },
    {
      id: '3',
      timestamp: '2025-08-21T15:45:00Z',
      user: 'Linh Tran (QA)',
      action: 'Approved QA review',
      details: 'CMM inspection required for critical dimensions',
      type: 'review'
    },
    {
      id: '4',
      timestamp: '2025-08-21T14:30:00Z',
      user: 'Minh Nguyen (Engineering)',
      action: 'Approved Engineering review',
      details: 'Design feasible, no major risks. Suggest anodizing for corrosion resistance.',
      type: 'review'
    },
    {
      id: '5',
      timestamp: '2025-08-20T16:30:00Z',
      user: 'Sarah Lee (Sales)',
      action: 'Project moved to Technical Review',
      type: 'status_change'
    }
  ]);

  const [newComment, setNewComment] = useState('');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-green-600" />;
      case 'document': return <FileText className="w-4 h-4 text-purple-600" />;
      case 'review': return <UserCheck className="w-4 h-4 text-orange-600" />;
      case 'rfq': return <Send className="w-4 h-4 text-indigo-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // In real app, this would make an API call
      console.log('Adding comment:', newComment);
      setNewComment('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity & Comments</CardTitle>
        <CardDescription>
          Project timeline and team communications
        </CardDescription>
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
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border"></div>
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative flex items-start space-x-4">
                  <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-border">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        📅 {format(new Date(activity.timestamp), 'MMM dd, HH:mm')} – {activity.user}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.action}
                    </p>
                    {activity.details && (
                      <div className="mt-2 p-3 bg-muted/50 rounded border-l-2 border-muted-foreground/20">
                        <p className="text-sm text-muted-foreground italic">
                          {activity.details}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SupplierRFQTrackingProps {
  project: Project;
  quotes: SupplierQuote[];
  onQuoteUpdate: () => void;
  onSendRFQ: () => void;
}

function SupplierRFQTracking({ project, quotes, onQuoteUpdate, onSendRFQ }: SupplierRFQTrackingProps) {
  const canSendRFQ = project.status === 'technical_review' || project.status === 'supplier_rfq_sent';

  return (
    <div className="space-y-6">
      {/* RFQ Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Supplier RFQ Management</CardTitle>
              <CardDescription>
                Manage and track Request for Quotations sent to suppliers
              </CardDescription>
            </div>
            {canSendRFQ && (
              <Button onClick={onSendRFQ}>
                <Send className="w-4 h-4 mr-2" />
                Send RFQ
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Quotes Table */}
      <SupplierQuoteTable
        quotes={quotes}
        projectId={project.id}
        onQuoteUpdate={onQuoteUpdate}
        showComparison={true}
      />
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [quoteReadiness, setQuoteReadiness] = useState<QuoteReadinessIndicator | null>(null);

  const { getProjectById, getQuoteReadinessScore } = useProjects();
  const { quotes, refetch: refetchQuotes } = useSupplierQuotes(id);

  useEffect(() => {
    const loadProject = async () => {
      console.log('Loading project with ID:', id);

      if (!id) {
        console.log('No project ID provided, navigating to projects page');
        navigate('/projects');
        return;
      }

      let timeoutId: NodeJS.Timeout;

      try {
        setLoading(true);
        setLoadingTimeout(false);

        // Set a timeout to detect long loading times
        timeoutId = setTimeout(() => {
          console.log('Loading timeout reached, likely database connection issue');
          setLoadingTimeout(true);
        }, 5000); // 5 seconds timeout

        // Log the project ID format for debugging
        console.log('Project ID format:', id, 'Length:', id.length);

        const projectData = await getProjectById(id);
        console.log('Project data loaded successfully:', projectData);

        // Clear timeout since data loaded successfully
        clearTimeout(timeoutId);

        setProject(projectData);

        // Load quote readiness for relevant stages
        if (projectData.status === 'supplier_rfq_sent' || projectData.status === 'quoted') {
          try {
            const readiness = await getQuoteReadinessScore(id);
            setQuoteReadiness(readiness);
          } catch (readinessError) {
            console.error('Error loading quote readiness score:', readinessError);
          }
        }
      } catch (error) {
        // Clear timeout on error
        clearTimeout(timeoutId);

        console.error('Error loading project:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load project details: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });

        // Stay on the page but show error state instead of navigating away
        setLoading(false);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, getProjectById, getQuoteReadinessScore, navigate, toast]);

  const handleQuoteUpdate = async () => {
    await refetchQuotes();

    // Refresh quote readiness if applicable
    if (project && (project.status === 'supplier_rfq_sent' || project.status === 'quoted')) {
      try {
        const readiness = await getQuoteReadinessScore(project.id);
        setQuoteReadiness(readiness);
      } catch (error) {
        console.error('Error refreshing quote readiness:', error);
      }
    }
  };

  const handleSendRFQ = () => {
    setShowSupplierModal(true);
  };

  const handleRFQSuccess = () => {
    setShowSupplierModal(false);
    handleQuoteUpdate();
  };

  if (loading) {
    if (loadingTimeout) {
      return (
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="animate-pulse bg-muted h-10 w-32 rounded"></div>
            <div className="animate-pulse bg-muted h-8 w-64 rounded"></div>
          </div>

          <div className="border rounded-lg p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Loading Timeout</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The project details are taking longer than expected to load. This might be due to a database connection issue.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto text-left">
              <h3 className="font-medium text-amber-800 mb-2">Troubleshooting Steps:</h3>
              <ol className="text-amber-700 list-decimal list-inside space-y-2 text-sm">
                <li>Go to <strong>Settings → Development → Emergency Database Seeder</strong></li>
                <li>Click "Seed Sample Data" to populate the database</li>
                <li>Return to this page and try again</li>
              </ol>
            </div>
            <div className="flex gap-4 justify-center mt-6">
              <Button variant="default" onClick={() => navigate('/projects')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="destructive" onClick={() => navigate('/settings')}>
                <Database className="w-4 h-4 mr-2" />
                Fix Database
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="animate-pulse bg-muted h-10 w-32 rounded"></div>
          <div className="animate-pulse bg-muted h-8 w-64 rounded"></div>
        </div>

        <div className="border rounded-lg p-8 text-center">
          <Clock className="h-12 w-12 animate-pulse mx-auto text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Loading Project Details...</h3>
          <p className="text-sm text-muted-foreground mb-4">This might take a moment if this is your first time accessing this project.</p>
          <div className="w-64 h-2 bg-muted/50 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-primary rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8 space-y-4">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-semibold">Project Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We couldn't find the project you're looking for. This could be a database issue or the project may not exist.
          </p>
          {id && (
            <div className="mt-4 text-xs text-muted-foreground">
              Requested Project ID: {id}
            </div>
          )}
        </div>

        {/* Database Diagnostic */}
        <DatabaseDiagnostic />

        <div className="flex gap-4 justify-center">
          <Button variant="default" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button variant="destructive" onClick={() => navigate('/settings')}>
            <Database className="w-4 h-4 mr-2" />
            Fix Database
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/projects')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground">Project Details & RFQ Management</p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="supplier" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ProjectOverview project={project} quoteReadiness={quoteReadiness} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DocumentsSection project={project} />
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <InternalReviewsSection project={project} />
        </TabsContent>

        <TabsContent value="supplier" className="mt-6">
          <SupplierRFQTracking
            project={project}
            quotes={quotes}
            onQuoteUpdate={handleQuoteUpdate}
            onSendRFQ={handleSendRFQ}
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <ActivityTimelineSection project={project} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Analytics</CardTitle>
              <CardDescription>
                Performance metrics and insights for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Analytics view coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Supplier Quote Modal */}
      {project && (
        <SupplierQuoteModal
          project={project}
          isOpen={showSupplierModal}
          onClose={() => setShowSupplierModal(false)}
          onSuccess={handleRFQSuccess}
        />
      )}
    </div>
  );
}