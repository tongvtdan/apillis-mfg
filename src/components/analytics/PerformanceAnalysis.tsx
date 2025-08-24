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
  Award, 
  Users, 
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Building2,
  Star,
  Timer,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AnalyticsMetrics, 
  SupplierAnalytics,
  SupplierPerformanceMetrics 
} from '@/types/supplier';
import { ProjectStatus } from '@/types/project';
import { useProjects } from '@/hooks/useProjects';
import { useSuppliers } from '@/hooks/useSuppliers';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  LineElement,
  PointElement,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  LineElement,
  PointElement,
  Filler
);

interface PerformanceAnalysisProps {
  className?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface LeadTimePhase {
  phase: string;
  avgDays: number;
  targetDays: number;
  performance: 'excellent' | 'good' | 'warning' | 'critical';
  projects: number;
  bottleneckRisk: number;
}

interface SupplierRanking {
  rank: number;
  supplier: SupplierAnalytics;
  score: number;
  change: {
    direction: 'up' | 'down' | 'same';
    positions: number;
  };
  strengths: string[];
  weaknesses: string[];
}

const PHASE_TARGETS: Record<string, number> = {
  'inquiry_received': 1.0,
  'technical_review': 2.0,
  'supplier_rfq_sent': 2.5,
  'quoted': 0.5,
  'order_confirmed': 1.0,
  'procurement_planning': 1.5,
  'in_production': 7.0,
  'shipped_closed': 0.5
};

function LeadTimeBreakdownChart({ leadTimeData }: { leadTimeData: LeadTimePhase[] }) {
  const chartData = {
    labels: leadTimeData.map(phase => 
      phase.phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ),
    datasets: [
      {
        label: 'Actual Days',
        data: leadTimeData.map(phase => phase.avgDays),
        backgroundColor: leadTimeData.map(phase => {
          switch (phase.performance) {
            case 'excellent': return 'rgba(16, 185, 129, 0.6)';
            case 'good': return 'rgba(59, 130, 246, 0.6)';
            case 'warning': return 'rgba(245, 158, 11, 0.6)';
            case 'critical': return 'rgba(239, 68, 68, 0.6)';
            default: return 'rgba(156, 163, 175, 0.6)';
          }
        }),
        borderWidth: 2
      },
      {
        label: 'Target Days',
        data: leadTimeData.map(phase => phase.targetDays),
        backgroundColor: 'rgba(156, 163, 175, 0.3)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 1,
        type: 'line' as const
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Lead Time by Phase vs Targets' }
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Days' } }
    }
  };

  return (
    <div className="h-80">
      <Bar data={chartData as any} options={options} />
    </div>
  );
}

function SupplierRankingTable({ rankings }: { rankings: SupplierRanking[] }) {
  return (
    <div className="space-y-4">
      {rankings.slice(0, 10).map((ranking) => (
        <Card key={ranking.supplier.supplier_id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <Badge 
                    variant={ranking.rank <= 3 ? 'default' : 'secondary'}
                    className={`text-lg px-3 py-1 ${
                      ranking.rank === 1 ? 'bg-yellow-500 text-white' :
                      ranking.rank === 2 ? 'bg-gray-400 text-white' :
                      ranking.rank === 3 ? 'bg-orange-500 text-white' : ''
                    }`}
                  >
                    #{ranking.rank}
                  </Badge>
                  <div className="flex items-center mt-1">
                    {ranking.change.direction === 'up' && (
                      <ArrowUpRight className="h-3 w-3 text-success" />
                    )}
                    {ranking.change.direction === 'down' && (
                      <ArrowDownRight className="h-3 w-3 text-destructive" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {ranking.change.positions > 0 && ranking.change.positions}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{ranking.supplier.supplier_name}</h3>
                    {ranking.supplier.supplier_company && (
                      <Badge variant="outline" className="text-xs">
                        {ranking.supplier.supplier_company}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Response Rate</p>
                      <p className="font-medium">{ranking.supplier.response_rate_percent.toFixed(1)}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Win Rate</p>
                      <p className="font-medium">{ranking.supplier.win_rate_percent.toFixed(1)}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Avg Response</p>
                      <p className="font-medium">{ranking.supplier.avg_response_time_hours.toFixed(1)}h</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Total Quotes</p>
                      <p className="font-medium">{ranking.supplier.total_quotes}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {ranking.strengths.slice(0, 2).map((strength, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-success/10 text-success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {strength}
                      </Badge>
                    ))}
                    {ranking.weaknesses.slice(0, 1).map((weakness, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-warning/10 text-warning">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold">{ranking.score.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Performance Score</div>
                <Progress value={ranking.score} className="w-20 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PhasePerformanceCards({ leadTimeData }: { leadTimeData: LeadTimePhase[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {leadTimeData.map((phase) => (
        <Card key={phase.phase} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {phase.phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{phase.avgDays.toFixed(1)}d</span>
                <Badge variant={
                  phase.performance === 'excellent' ? 'default' :
                  phase.performance === 'good' ? 'secondary' :
                  'destructive'
                }>
                  {phase.performance.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Target: {phase.targetDays}d</span>
                  <span>{phase.projects} projects</span>
                </div>
                <Progress 
                  value={(phase.targetDays / phase.avgDays) * 100} 
                  className="h-1" 
                />
              </div>
              
              <div className="flex items-center space-x-2 text-xs">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                  phase.bottleneckRisk >= 80 ? 'bg-destructive/10 text-destructive' :
                  phase.bottleneckRisk >= 60 ? 'bg-warning/10 text-warning' :
                  phase.bottleneckRisk >= 40 ? 'bg-primary/10 text-primary' :
                  'bg-success/10 text-success'
                }`}>
                  {phase.bottleneckRisk >= 80 ? <AlertCircle className="h-3 w-3" /> :
                   phase.bottleneckRisk >= 60 ? <Timer className="h-3 w-3" /> :
                   <CheckCircle className="h-3 w-3" />}
                  <span>{phase.bottleneckRisk}% risk</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PerformanceAnalysis({ className, dateRange }: PerformanceAnalysisProps) {
  const [activeTab, setActiveTab] = useState('leadtime');
  const [loading, setLoading] = useState(true);
  const [leadTimeData, setLeadTimeData] = useState<LeadTimePhase[]>([]);
  const [supplierAnalytics, setSupplierAnalytics] = useState<SupplierAnalytics[]>([]);
  const [supplierRankings, setSupplierRankings] = useState<SupplierRanking[]>([]);
  
  const { projects } = useProjects();
  const { getSupplierAnalytics } = useSuppliers();

  // Calculate performance data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Mock lead time data
        const mockLeadTimeData: LeadTimePhase[] = [
          {
            phase: 'inquiry_received',
            avgDays: 1.2,
            targetDays: PHASE_TARGETS.inquiry_received,
            performance: 'warning',
            projects: 45,
            bottleneckRisk: 25
          },
          {
            phase: 'technical_review',
            avgDays: 2.1,
            targetDays: PHASE_TARGETS.technical_review,
            performance: 'good',
            projects: 38,
            bottleneckRisk: 35
          },
          {
            phase: 'supplier_rfq_sent',
            avgDays: 3.2,
            targetDays: PHASE_TARGETS.supplier_rfq_sent,
            performance: 'critical',
            projects: 28,
            bottleneckRisk: 85
          }
        ];
        
        setLeadTimeData(mockLeadTimeData);

        // Load supplier analytics
        const analyticsData = await getSupplierAnalytics();
        setSupplierAnalytics(analyticsData);
        
        // Calculate rankings
        const rankings: SupplierRanking[] = analyticsData.map((supplier, index) => {
          const responseScore = supplier.response_rate_percent;
          const winScore = supplier.win_rate_percent;
          const speedScore = Math.max(0, 100 - supplier.avg_response_time_hours * 2);
          const volumeScore = Math.min(100, supplier.total_quotes * 2);
          
          const compositeScore = (responseScore * 0.3 + winScore * 0.25 + speedScore * 0.25 + volumeScore * 0.2);
          
          const strengths: string[] = [];
          const weaknesses: string[] = [];
          
          if (supplier.response_rate_percent >= 90) strengths.push('Fast Response');
          if (supplier.win_rate_percent >= 50) strengths.push('High Win Rate');
          if (supplier.response_rate_percent < 70) weaknesses.push('Low Response Rate');
          
          return {
            rank: index + 1,
            supplier,
            score: compositeScore,
            change: { direction: 'up' as const, positions: Math.floor(Math.random() * 3) },
            strengths,
            weaknesses
          };
        })
        .sort((a, b) => b.score - a.score)
        .map((ranking, index) => ({ ...ranking, rank: index + 1 }));
        
        setSupplierRankings(rankings);
        
      } catch (error) {
        console.error('Error loading performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projects, getSupplierAnalytics]);

  const criticalPhases = leadTimeData.filter(p => p.performance === 'critical').length;
  const warningPhases = leadTimeData.filter(p => p.performance === 'warning').length;
  const excellentPhases = leadTimeData.filter(p => p.performance === 'excellent').length;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Analysis</h1>
          <p className="text-muted-foreground">
            Lead time breakdown and supplier performance insights
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Last 30 days
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium">Total Phases</p>
              <p className="text-2xl font-bold">{leadTimeData.length}</p>
            </div>
            <Activity className="h-8 w-8 ml-auto text-primary" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium">Critical Issues</p>
              <p className="text-2xl font-bold text-destructive">{criticalPhases}</p>
            </div>
            <AlertCircle className="h-8 w-8 ml-auto text-destructive" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium">Needs Attention</p>
              <p className="text-2xl font-bold text-warning">{warningPhases}</p>
            </div>
            <Timer className="h-8 w-8 ml-auto text-warning" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium">Performing Well</p>
              <p className="text-2xl font-bold text-success">{excellentPhases}</p>
            </div>
            <CheckCircle className="h-8 w-8 ml-auto text-success" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leadtime">Lead Time Analysis</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Rankings</TabsTrigger>
        </TabsList>

        <TabsContent value="leadtime" className="space-y-6">
          <PhasePerformanceCards leadTimeData={leadTimeData} />
          
          <Card>
            <CardHeader>
              <CardTitle>Lead Time vs Target Analysis</CardTitle>
              <CardDescription>
                Average time spent in each phase compared to targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeadTimeBreakdownChart leadTimeData={leadTimeData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance Rankings</CardTitle>
              <CardDescription>
                Comprehensive supplier rankings based on multiple performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading supplier rankings...</p>
                </div>
              ) : (
                <SupplierRankingTable rankings={supplierRankings} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PerformanceAnalysis;