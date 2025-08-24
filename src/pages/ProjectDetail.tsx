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
  AlertTriangle,
  CheckCircle2,
  Send,
  Users,
  BarChart3,
  Settings,
  Download,
  Upload,
  MessageSquare,
  Plus,
  Edit,
  X,
  AlertCircle,
  RefreshCw,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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

  const [activeTab, setActiveTab] = useState("overview");
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // Mock project data for now
  const project = {
    id: id || '11111111-1111-1111-1111-111111111001',
    project_id: 'P-25082301',
    title: 'Advanced IoT Sensor System',
    description: 'Complete IoT sensor system with wireless communication, data logging, and cloud integration for smart factory monitoring.',
    status: 'inquiry_received' as const,
    priority: 'urgent' as const,
    estimated_value: 750000,
    due_date: '2025-12-15',
    created_at: '2025-08-21T10:00:00Z',
    contact_name: 'Sarah Johnson',
    contact_email: 'sarah.johnson@techcorp.com',
    notes: 'Rush order for Q4 deployment',
    customer: {
      id: '1',
      name: 'Sarah Johnson',
      company: 'TechCorp Industries',
      email: 'sarah.johnson@techcorp.com',
      created_at: '2025-08-01T00:00:00Z',
      updated_at: '2025-08-01T00:00:00Z'
    }
  };

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

  const handleSendRFQ = () => {
    setShowSupplierModal(true);
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/projects')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-2xl font-bold">
                  Project: {project.project_id} – {project.title}
                </h1>
                <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    Status: <Badge className={cn("ml-2", getStatusColor(project.status))}>
                      Inquiry Received
                    </Badge>
                  </span>
                  <span className="flex items-center">
                    Priority: <Badge className={cn("ml-2", getPriorityColor(project.priority))}>
                      {project.priority.toUpperCase()}
                    </Badge>
                  </span>
                </div>
                <div className="flex items-center space-x-6 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Building2 className="w-4 h-4 mr-1" />
                    Customer: {project.customer?.company || project.contact_name}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created: {format(new Date(project.created_at), 'MMM dd, yyyy')}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Owner: {project.assignee_id || 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Navigation Sidebar */}
        <div className="w-48 border-r bg-muted/30 min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === "overview"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === "documents"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Documents
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === "reviews"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab("supplier")}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === "supplier"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Supplier
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === "timeline"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Timeline
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === "analytics"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === "settings"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
                  <CardTitle>DETAILS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Title:</Label>
                      <p className="mt-1">{project.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Volume:</Label>
                      <p className="mt-1">5,000 pcs</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description:</Label>
                    <p className="mt-1">{project.description || 'High-precision mount for industrial sensors'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Target Price:</Label>
                      <p className="mt-1">${project.estimated_value ? (project.estimated_value / 5000).toFixed(2) : '8.50'}/unit</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Delivery:</Label>
                      <p className="mt-1">{project.due_date ? format(new Date(project.due_date), 'MMM dd, yyyy') : 'Oct 15, 2025'}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Notes:</Label>
                    <p className="mt-1">{project.notes || 'Customer open to alternative materials'}</p>
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
                    <CardTitle>DOCUMENTS</CardTitle>
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
                  <CardTitle>INTERNAL REVIEWS</CardTitle>
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
                    <CardTitle>SUPPLIER RFQ SENT</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Send className="w-4 h-4 mr-2" />
                        Resend
                      </Button>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Supplier
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Set Deadline
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

          {activeTab === "timeline" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>ACTIVITY & COMMENTS</CardTitle>
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
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Supplier RFQ</h3>
            <p className="text-muted-foreground mb-4">Supplier RFQ functionality coming soon...</p>
            <Button onClick={() => setShowSupplierModal(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}