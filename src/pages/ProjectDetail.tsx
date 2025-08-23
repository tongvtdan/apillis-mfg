import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  Timeline,
  Settings,
  Eye
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
  ProjectStatus 
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
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{project.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                Project ID: {project.project_id}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getPriorityColor(project.priority)}>
                {project.priority.toUpperCase()} PRIORITY
              </Badge>
              <Badge variant="outline" className={getStatusColor(project.status)}>
                {project.status.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Project Type</p>
              <p className="font-medium">{PROJECT_TYPE_LABELS[project.project_type]}</p>
            </div>
            
            {project.estimated_value && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Estimated Value</p>
                <p className="font-medium flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {project.estimated_value.toLocaleString()}
                </p>
              </div>
            )}
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Time in Current Stage</p>
              <p className="font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {project.days_in_stage} days
              </p>
            </div>
            
            {project.due_date && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(project.due_date), 'MMM dd, yyyy')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{project.customer?.company || project.customer?.name}</p>
                  {project.customer?.company && project.customer?.name && (
                    <p className="text-sm text-muted-foreground">{project.customer.name}</p>
                  )}
                </div>
              </div>
              
              {project.contact_email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${project.contact_email}`} className="text-blue-600 hover:underline">
                    {project.contact_email}
                  </a>
                </div>
              )}
              
              {project.contact_phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${project.contact_phone}`} className="text-blue-600 hover:underline">
                    {project.contact_phone}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {project.customer?.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{project.customer.address}</p>
                </div>
              )}
              
              {project.customer?.country && (
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{project.customer.country}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quote Readiness Section */}
      {quoteReadiness && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Quote Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-lg">{quoteReadiness.statusText}</p>
                  <p className="text-sm text-muted-foreground">
                    {quoteReadiness.receivedQuotes} of {quoteReadiness.totalSuppliers} suppliers have responded
                  </p>
                </div>
                <Badge className={QUOTE_READINESS_COLORS[quoteReadiness.colorCode]}>
                  {Math.round(quoteReadiness.readinessPercentage)}% Complete
                </Badge>
              </div>
              
              <Progress value={quoteReadiness.readinessPercentage} className="h-2" />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{quoteReadiness.receivedQuotes}</p>
                  <p className="text-xs text-muted-foreground">Received</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{quoteReadiness.pendingQuotes}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{quoteReadiness.overdueQuotes}</p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
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
  const [activeTab, setActiveTab] = useState("overview");
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [quoteReadiness, setQuoteReadiness] = useState<QuoteReadinessIndicator | null>(null);

  const { getProjectById, getQuoteReadinessScore } = useProjects();
  const { quotes, refetch: refetchQuotes } = useSupplierQuotes(id);

  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        navigate('/projects');
        return;
      }

      try {
        setLoading(true);
        const projectData = await getProjectById(id);
        setProject(projectData);

        // Load quote readiness for relevant stages
        if (projectData.status === 'supplier_rfq_sent' || projectData.status === 'quoted') {
          const readiness = await getQuoteReadinessScore(id);
          setQuoteReadiness(readiness);
        }
      } catch (error) {
        console.error('Error loading project:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load project details",
        });
        navigate('/projects');
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
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="animate-pulse bg-muted h-10 w-32 rounded"></div>
          <div className="animate-pulse bg-muted h-8 w-64 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-muted h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Project not found</p>
          <Button variant="outline" onClick={() => navigate('/projects')} className="mt-4">
            Back to Projects
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
            <Timeline className="w-4 h-4 mr-2" />
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
          <Card>
            <CardHeader>
              <CardTitle>Project Documents</CardTitle>
              <CardDescription>
                Manage drawings, specifications, and other project files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Document management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Internal Reviews</CardTitle>
              <CardDescription>
                Track engineering, QA, and production reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Review management coming soon</p>
              </div>
            </CardContent>
          </Card>
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
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>
                View project history and stage transitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Timeline className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Timeline view coming soon</p>
              </div>
            </CardContent>
          </Card>
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