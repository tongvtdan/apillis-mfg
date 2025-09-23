import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  Award,
  Target,
  Users,
  DollarSign,
  Calendar,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { useSuppliers } from "@/features/supplier-management/hooks";
import { useSupplierQuotes } from "@/features/supplier-management/hooks";
import {
  SupplierAnalytics,
  SupplierPerformanceMetrics,
  Supplier
} from "@/types/supplier";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface SupplierQuoteDashboardProps {
  className?: string;
}

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  target?: number;
}

function KPICard({ title, value, change, changeLabel, icon, trend, target }: KPICardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <ArrowDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold">{value}</div>
          {change !== undefined && (
            <div className={cn("flex items-center text-xs", getTrendColor())}>
              {getTrendIcon()}
              <span className="ml-1">
                {Math.abs(change)}% {changeLabel}
              </span>
            </div>
          )}
        </div>
        {target && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress to target</span>
              <span>{target}%</span>
            </div>
            <Progress value={target} className="h-1" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SupplierQuoteDashboard({ className }: SupplierQuoteDashboardProps) {
  const [supplierAnalytics, setSupplierAnalytics] = useState<SupplierAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const { suppliers, getSupplierAnalytics } = useSuppliers();
  const { quotes } = useSupplierQuotes();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const analytics = await getSupplierAnalytics();
      setSupplierAnalytics(analytics);
    } catch (error) {
      console.error('Error loading supplier analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs
  const totalSuppliers = suppliers.filter(s => s.is_active).length;
  const averageResponseRate = supplierAnalytics.length > 0
    ? supplierAnalytics.reduce((sum, s) => sum + s.response_rate_percent, 0) / supplierAnalytics.length
    : 0;
  const averageResponseTime = supplierAnalytics.length > 0
    ? supplierAnalytics.reduce((sum, s) => sum + s.avg_response_time_hours, 0) / supplierAnalytics.length
    : 0;
  const totalQuotes = quotes.length;
  const activeQuotes = quotes.filter(q => q.status === 'sent').length;

  // Response Rate Chart Data
  const responseRateData = {
    labels: supplierAnalytics.slice(0, 10).map(s => s.supplier_name),
    datasets: [
      {
        label: 'Response Rate (%)',
        data: supplierAnalytics.slice(0, 10).map(s => s.response_rate_percent),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Response Time Distribution
  const responseTimeRanges = [
    { label: '< 24h', count: 0, color: '#10b981' },
    { label: '24-48h', count: 0, color: '#f59e0b' },
    { label: '48-72h', count: 0, color: '#ef4444' },
    { label: '> 72h', count: 0, color: '#6b7280' },
  ];

  supplierAnalytics.forEach(supplier => {
    const hours = supplier.avg_response_time_hours;
    if (hours < 24) responseTimeRanges[0].count++;
    else if (hours < 48) responseTimeRanges[1].count++;
    else if (hours < 72) responseTimeRanges[2].count++;
    else responseTimeRanges[3].count++;
  });

  const responseTimeData = {
    labels: responseTimeRanges.map(r => r.label),
    datasets: [
      {
        data: responseTimeRanges.map(r => r.count),
        backgroundColor: responseTimeRanges.map(r => r.color),
        borderWidth: 0,
      },
    ],
  };

  // Quote Volume Trend (mock data for demonstration)
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const quoteVolumeData = {
    labels: last7Days.map(date => format(date, 'MMM dd')),
    datasets: [
      {
        label: 'Quotes Sent',
        data: [12, 8, 15, 22, 18, 25, 20], // Mock data
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Quotes Received',
        data: [10, 6, 12, 18, 15, 20, 16], // Mock data
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Suppliers"
          value={totalSuppliers}
          change={8.2}
          changeLabel="vs last month"
          icon={<Users className="h-4 w-4" />}
          trend="up"
        />

        <KPICard
          title="Avg Response Rate"
          value={`${averageResponseRate.toFixed(1)}%`}
          change={3.1}
          changeLabel="vs last month"
          icon={<Target className="h-4 w-4" />}
          trend="up"
          target={75}
        />

        <KPICard
          title="Avg Response Time"
          value={`${(averageResponseTime / 24).toFixed(1)}d`}
          change={-12.5}
          changeLabel="vs last month"
          icon={<Clock className="h-4 w-4" />}
          trend="up"
        />

        <KPICard
          title="Active Quotes"
          value={activeQuotes}
          change={15.3}
          changeLabel="vs last week"
          icon={<Activity className="h-4 w-4" />}
          trend="up"
        />
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              7D
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              30D
            </Button>
            <Button
              variant={timeRange === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('90d')}
            >
              90D
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Response Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Supplier Response Rates</CardTitle>
                <CardDescription>
                  Response rates by supplier (top 10)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Bar data={responseRateData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>

            {/* Response Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time Distribution</CardTitle>
                <CardDescription>
                  How quickly suppliers respond to RFQs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Doughnut data={responseTimeData} options={doughnutOptions} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quote Volume Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Volume Trend</CardTitle>
              <CardDescription>
                Daily quote activity over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line data={quoteVolumeData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-4 h-4 mr-2 text-yellow-500" />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  Highest rated suppliers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suppliers
                    .filter(s => s.is_active)
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 5)
                    .map((supplier, index) => (
                      <div key={supplier.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">{supplier.name}</p>
                            <p className="text-xs text-muted-foreground">{supplier.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium">{supplier.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Fastest Responders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-blue-500" />
                  Fastest Responders
                </CardTitle>
                <CardDescription>
                  Shortest response times
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {supplierAnalytics
                    .sort((a, b) => a.avg_response_time_hours - b.avg_response_time_hours)
                    .slice(0, 5)
                    .map((analytics, index) => (
                      <div key={analytics.supplier_id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">{analytics.supplier_name}</p>
                            <p className="text-xs text-muted-foreground">{analytics.supplier_company}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{Math.round(analytics.avg_response_time_hours)}h</p>
                          <p className="text-xs text-muted-foreground">avg time</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Most Reliable */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-4 h-4 mr-2 text-green-500" />
                  Most Reliable
                </CardTitle>
                <CardDescription>
                  Highest response rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {supplierAnalytics
                    .sort((a, b) => b.response_rate_percent - a.response_rate_percent)
                    .slice(0, 5)
                    .map((analytics, index) => (
                      <div key={analytics.supplier_id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">{analytics.supplier_name}</p>
                            <p className="text-xs text-muted-foreground">{analytics.supplier_company}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{analytics.response_rate_percent.toFixed(0)}%</p>
                          <p className="text-xs text-muted-foreground">response rate</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rankings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance Rankings</CardTitle>
              <CardDescription>
                Complete performance metrics for all active suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Response Rate</TableHead>
                    <TableHead>Avg Response Time</TableHead>
                    <TableHead>Total Quotes</TableHead>
                    <TableHead>Win Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierAnalytics
                    .sort((a, b) => b.response_rate_percent - a.response_rate_percent)
                    .map((analytics, index) => {
                      const supplier = suppliers.find(s => s.id === analytics.supplier_id);
                      return (
                        <TableRow key={analytics.supplier_id}>
                          <TableCell>
                            <Badge variant="outline" className="w-8 h-6 flex items-center justify-center">
                              {index + 1}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{analytics.supplier_name}</p>
                              <p className="text-xs text-muted-foreground">{analytics.supplier_company}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-500 mr-1" />
                              <span>{supplier?.rating.toFixed(1) || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium">{analytics.response_rate_percent.toFixed(0)}%</span>
                              <Progress
                                value={analytics.response_rate_percent}
                                className="h-1 mt-1"
                              />
                            </div>
                          </TableCell>
                          <TableCell>{Math.round(analytics.avg_response_time_hours)}h</TableCell>
                          <TableCell>{analytics.total_quotes}</TableCell>
                          <TableCell>{analytics.win_rate_percent?.toFixed(0) || '0'}%</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}