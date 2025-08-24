import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  DollarSign, 
  Users, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  RefreshCw,
  Filter,
  Calendar,
  Building2,
  MessageSquare,
  FileText,
  Truck,
  Award
} from 'lucide-react';
import { 
  AnalyticsMetrics, 
  BottleneckAlert, 
  SupplierAnalytics,
  BottleneckSeverity,
  BOTTLENECK_SEVERITY_COLORS 
} from '@/types/supplier';
import { useProjects } from '@/hooks/useProjects';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface AnalyticsDashboardProps {
  className?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  target?: {
    value: number;
    label: string;
  };
  icon: React.ReactNode;
  description?: string;
  status?: 'excellent' | 'good' | 'warning' | 'critical';
  loading?: boolean;
}

function KPICard({ title, value, change, target, icon, description, status = 'good', loading }: KPICardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'excellent': return 'text-success bg-success/10 border-success/20';
      case 'good': return 'text-primary bg-primary/10 border-primary/20';
      case 'warning': return 'text-warning bg-warning/10 border-warning/20';
      case 'critical': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={`${getStatusColor()} transition-all duration-200 hover:shadow-md`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">{value}</div>
              
              {change && (
                <div className="flex items-center space-x-2 text-xs">
                  {change.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className={change.isPositive ? 'text-success' : 'text-destructive'}>
                    {Math.abs(change.value)}% vs {change.period}
                  </span>
                </div>
              )}
              
              {target && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Target: {target.value}%</span>
                    <span>{target.label}</span>
                  </div>
                  <Progress 
                    value={typeof value === 'number' ? (value / target.value) * 100 : 0} 
                    className="h-1" 
                  />
                </div>
              )}
              
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface BottleneckAlertCardProps {
  bottlenecks: BottleneckAlert[];
  onViewDetails?: (projectId: string) => void;
}

function BottleneckAlertCard({ bottlenecks, onViewDetails }: BottleneckAlertCardProps) {
  const criticalBottlenecks = bottlenecks.filter(b => b.severity === 'critical');
  const warningBottlenecks = bottlenecks.filter(b => b.severity === 'warning');

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle>Bottleneck Alerts</CardTitle>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <CardDescription>
          Projects exceeding SLA thresholds requiring immediate attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bottlenecks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
            <p className="text-lg font-medium">All Clear!</p>
            <p className="text-sm">No bottlenecks detected in the current workflow</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Critical Alerts */}
            {criticalBottlenecks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive" className="text-xs">
                    {criticalBottlenecks.length} Critical
                  </Badge>
                </div>
                {criticalBottlenecks.map((bottleneck) => (
                  <BottleneckAlertItem 
                    key={bottleneck.project_id} 
                    bottleneck={bottleneck} 
                    onViewDetails={onViewDetails}
                  />
                ))}
              </div>
            )}
            
            {/* Warning Alerts */}
            {warningBottlenecks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs bg-warning/10 text-warning">
                    {warningBottlenecks.length} Warning
                  </Badge>
                </div>
                {warningBottlenecks.map((bottleneck) => (
                  <BottleneckAlertItem 
                    key={bottleneck.project_id} 
                    bottleneck={bottleneck} 
                    onViewDetails={onViewDetails}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface BottleneckAlertItemProps {
  bottleneck: BottleneckAlert;
  onViewDetails?: (projectId: string) => void;
}

function BottleneckAlertItem({ bottleneck, onViewDetails }: BottleneckAlertItemProps) {
  return (
    <div className={`p-4 rounded-lg border ${BOTTLENECK_SEVERITY_COLORS[bottleneck.severity]}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium">{bottleneck.project_title}</h4>
            <Badge 
              variant="secondary" 
              className={`text-xs ${BOTTLENECK_SEVERITY_COLORS[bottleneck.severity]}`}
            >
              {bottleneck.severity.toUpperCase()}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Stuck in <strong>{bottleneck.current_stage}</strong> for{' '}
            <strong>{Math.round(bottleneck.hours_in_stage / 24)} days</strong>
          </p>
          
          <div className="space-y-1">
            <div className="text-xs font-medium">Issues:</div>
            <ul className="text-xs text-muted-foreground space-y-1">
              {bottleneck.issues.map((issue, index) => (
                <li key={index} className="flex items-start space-x-1">
                  <span>•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs font-medium">Recommended Actions:</div>
            <ul className="text-xs text-muted-foreground space-y-1">
              {bottleneck.recommended_actions.map((action, index) => (
                <li key={index} className="flex items-start space-x-1">
                  <span>→</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewDetails?.(bottleneck.project_id)}
        >
          View Project
        </Button>
      </div>
    </div>
  );
}

interface SupplierPerformanceChartProps {
  supplierAnalytics: SupplierAnalytics[];
  metric: 'response_rate' | 'win_rate' | 'avg_response_time';
}

function SupplierPerformanceChart({ supplierAnalytics, metric }: SupplierPerformanceChartProps) {
  const getMetricData = () => {
    const top10Suppliers = supplierAnalytics.slice(0, 10);
    
    switch (metric) {
      case 'response_rate':
        return {
          labels: top10Suppliers.map(s => s.supplier_name),
          datasets: [{
            label: 'Response Rate (%)',
            data: top10Suppliers.map(s => s.response_rate_percent),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }]
        };
      case 'win_rate':
        return {
          labels: top10Suppliers.map(s => s.supplier_name),
          datasets: [{
            label: 'Win Rate (%)',
            data: top10Suppliers.map(s => s.win_rate_percent),
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          }]
        };
      case 'avg_response_time':
        return {
          labels: top10Suppliers.map(s => s.supplier_name),
          datasets: [{
            label: 'Avg Response Time (hours)',
            data: top10Suppliers.map(s => s.avg_response_time_hours),
            backgroundColor: 'rgba(245, 158, 11, 0.5)',
            borderColor: 'rgba(245, 158, 11, 1)',
            borderWidth: 1
          }]
        };
      default:
        return { labels: [], datasets: [] };
    }
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Supplier ${metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: metric === 'avg_response_time' ? undefined : 100,
      },
    },
  };

  return (
    <div className="h-80">
      <Bar data={getMetricData()} options={options} />
    </div>
  );
}

interface LeadTimeBreakdownProps {
  leadTimeByPhase: AnalyticsMetrics['lead_time_by_phase'];
}

function LeadTimeBreakdown({ leadTimeByPhase }: LeadTimeBreakdownProps) {
  const phases = Object.entries(leadTimeByPhase);
  const totalTime = phases.reduce((sum, [, time]) => sum + time, 0);

  const chartData = {
    labels: phases.map(([phase]) => phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())),
    datasets: [{
      data: phases.map(([, time]) => time),
      backgroundColor: [
        '#3B82F6', // inquiry
        '#F59E0B', // review  
        '#EF4444', // supplier_rfq (critical - exceeds SLA)
        '#10B981', // quoted
        '#8B5CF6', // order
      ],
      borderWidth: 0,
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: `Lead Time Breakdown (${totalTime.toFixed(1)} days total)`,
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="h-64">
        <Doughnut data={chartData} options={options} />
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        {phases.map(([phase, time]) => {
          const percentage = (time / totalTime) * 100;
          const isBottleneck = phase === 'supplier_rfq' && time > 2.5; // SLA threshold
          
          return (
            <div key={phase} className="flex items-center justify-between p-2 rounded bg-gray-50">
              <span className="capitalize">{phase.replace('_', ' ')}</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{time.toFixed(1)}d</span>
                {isBottleneck && <AlertTriangle className="h-3 w-3 text-destructive" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AnalyticsDashboard({ className, dateRange }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsMetrics | null>(null);
  const [bottlenecks, setBottlenecks] = useState<BottleneckAlert[]>([]);
  const [supplierAnalytics, setSupplierAnalytics] = useState<SupplierAnalytics[]>([]);
  
  const { getBottleneckAnalysis } = useProjects();
  const { getSupplierAnalytics } = useSuppliers();

  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true);
      try {
        // Mock analytics data - in real implementation, this would come from database functions
        const mockAnalyticsData: AnalyticsMetrics = {
          supplier_response_rate: 85.3,
          average_cycle_time: 6.8,
          win_rate: 47.6,
          on_time_delivery_rate: 91.8,
          rfq_conversion_rate: 23.4,
          bottleneck_stages: [],
          cost_savings: 145000,
          intake_portal_metrics: {
            total_submissions: 234,
            submissions_this_week: 18,
            average_processing_time: 2.3,
            completion_rate: 94.2,
            top_submission_sources: [
              { source: 'Web Portal', count: 156 },
              { source: 'Email', count: 48 },
              { source: 'Phone', count: 30 }
            ]
          },
          lead_time_by_phase: {
            inquiry: 1.2,
            review: 2.1,
            supplier_rfq: 2.8, // Exceeds SLA
            quoted: 0.7,
            order: 0.0
          },
          generated_at: new Date().toISOString(),
          period_days: 30
        };

        setAnalyticsData(mockAnalyticsData);

        // Load bottlenecks
        const bottleneckData = await getBottleneckAnalysis();
        setBottlenecks(bottleneckData);

        // Load supplier analytics  
        const supplierData = await getSupplierAnalytics();
        setSupplierAnalytics(supplierData);

      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [dateRange, getBottleneckAnalysis, getSupplierAnalytics]);

  const handleViewProjectDetails = (projectId: string) => {
    // Use React Router navigation instead of window.location
    console.log('Navigating to project details:', projectId);
    // This should be handled by the parent component that has access to navigate
    // For now, use window.location as fallback but ideally should use React Router
    window.location.href = `/project/${projectId}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Factory Pulse performance metrics and insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Supplier Response Rate"
              value={`${analyticsData?.supplier_response_rate.toFixed(1)}%`}
              change={{ value: 3.2, isPositive: true, period: 'last month' }}
              target={{ value: 90, label: 'Target' }}
              icon={<MessageSquare className="h-4 w-4" />}
              status={analyticsData && analyticsData.supplier_response_rate >= 85 ? 'good' : 'warning'}
              loading={loading}
            />
            
            <KPICard
              title="Average Cycle Time"
              value={`${analyticsData?.average_cycle_time.toFixed(1)} days`}
              change={{ value: 0.8, isPositive: false, period: 'last month' }}
              target={{ value: 6, label: 'Target' }}
              icon={<Clock className="h-4 w-4" />}
              status={analyticsData && analyticsData.average_cycle_time <= 6 ? 'good' : 'warning'}
              loading={loading}
            />
            
            <KPICard
              title="Win Rate"
              value={`${analyticsData?.win_rate.toFixed(1)}%`}
              change={{ value: 2.1, isPositive: true, period: 'last month' }}
              target={{ value: 50, label: 'Target' }}
              icon={<Target className="h-4 w-4" />}
              status={analyticsData && analyticsData.win_rate >= 45 ? 'good' : 'warning'}
              loading={loading}
            />
            
            <KPICard
              title="On-Time Delivery"
              value={`${analyticsData?.on_time_delivery_rate.toFixed(1)}%`}
              change={{ value: 1.5, isPositive: true, period: 'last month' }}
              target={{ value: 95, label: 'Target' }}
              icon={<Truck className="h-4 w-4" />}
              status={analyticsData && analyticsData.on_time_delivery_rate >= 90 ? 'good' : 'warning'}
              loading={loading}
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <KPICard
              title="RFQ Conversion Rate"
              value={`${analyticsData?.rfq_conversion_rate.toFixed(1)}%`}
              icon={<BarChart3 className="h-4 w-4" />}
              description="RFQs that result in won projects"
              loading={loading}
            />
            
            <KPICard
              title="Cost Savings"
              value={`$${analyticsData?.cost_savings.toLocaleString()}`}
              change={{ value: 12.3, isPositive: true, period: 'last month' }}
              icon={<DollarSign className="h-4 w-4" />}
              description="Through competitive bidding"
              loading={loading}
            />
            
            <KPICard
              title="Active Suppliers"
              value={supplierAnalytics.filter(s => s.total_quotes > 0).length}
              icon={<Building2 className="h-4 w-4" />}
              description="Suppliers with quotes this period"
              loading={loading}
            />
          </div>

          {/* Bottleneck Alerts */}
          <BottleneckAlertCard 
            bottlenecks={bottlenecks} 
            onViewDetails={handleViewProjectDetails}
          />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Rate Performance</CardTitle>
                <CardDescription>Top 10 suppliers by response rate</CardDescription>
              </CardHeader>
              <CardContent>
                <SupplierPerformanceChart 
                  supplierAnalytics={supplierAnalytics} 
                  metric="response_rate" 
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Win Rate Performance</CardTitle>
                <CardDescription>Top 10 suppliers by win rate</CardDescription>
              </CardHeader>
              <CardContent>
                <SupplierPerformanceChart 
                  supplierAnalytics={supplierAnalytics} 
                  metric="win_rate" 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lead Time Breakdown</CardTitle>
                <CardDescription>Time spent in each workflow phase</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData && (
                  <LeadTimeBreakdown leadTimeByPhase={analyticsData.lead_time_by_phase} />
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Response Time Performance</CardTitle>
                <CardDescription>Average supplier response times</CardDescription>
              </CardHeader>
              <CardContent>
                <SupplierPerformanceChart 
                  supplierAnalytics={supplierAnalytics} 
                  metric="avg_response_time" 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Intake Portal Statistics</CardTitle>
                <CardDescription>Customer inquiry submission metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData && (
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{analyticsData.intake_portal_metrics.total_submissions}</div>
                      <div className="text-sm text-muted-foreground">Total Submissions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{analyticsData.intake_portal_metrics.submissions_this_week}</div>
                      <div className="text-sm text-muted-foreground">This Week</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{analyticsData.intake_portal_metrics.average_processing_time.toFixed(1)}d</div>
                      <div className="text-sm text-muted-foreground">Avg Processing Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{analyticsData.intake_portal_metrics.completion_rate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Completion Rate</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AnalyticsDashboard;