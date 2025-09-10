import { z } from 'zod';

// Dashboard widget types
export type WidgetType =
  | 'kanban'
  | 'metrics'
  | 'chart'
  | 'timeline'
  | 'list'
  | 'calendar'
  | 'heatmap'
  | 'gauge'
  | 'table'
  | 'custom';

export type WidgetSize = 'small' | 'medium' | 'large' | 'xlarge';
export type WidgetPosition = { x: number; y: number; w: number; h: number };

// Chart types for analytics
export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'doughnut'
  | 'area'
  | 'scatter'
  | 'radar'
  | 'funnel'
  | 'treemap';

export type TimeRange =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'last_year'
  | 'custom';

// Dashboard widget configuration
export const dashboardWidgetSchema = z.object({
  id: z.string(),
  type: z.enum(['kanban', 'metrics', 'chart', 'timeline', 'list', 'calendar', 'heatmap', 'gauge', 'table', 'custom']),
  title: z.string(),
  description: z.string().optional(),
  size: z.enum(['small', 'medium', 'large', 'xlarge']),
  position: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number()
  }),
  config: z.record(z.any()), // Widget-specific configuration
  dataSource: z.string(), // Data source identifier
  refreshInterval: z.number().optional(), // Auto-refresh in seconds
  isVisible: z.boolean().default(true),
  permissions: z.array(z.string()).optional(), // Required permissions
  createdBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// Dashboard layout configuration
export const dashboardLayoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  widgets: z.array(dashboardWidgetSchema),
  backgroundColor: z.string().optional(),
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  isDefault: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  organizationId: z.string(),
  createdBy: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// Kanban board configuration
export const kanbanBoardSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  columns: z.array(z.object({
    id: z.string(),
    title: z.string(),
    color: z.string().optional(),
    limit: z.number().optional(),
    wipLimit: z.number().optional()
  })),
  swimlanes: z.array(z.object({
    id: z.string(),
    title: z.string(),
    filter: z.record(z.any())
  })).optional(),
  filters: z.record(z.any()).optional(),
  groupBy: z.string().optional(),
  sortBy: z.string().optional(),
  dataSource: z.string(),
  organizationId: z.string(),
  createdBy: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// Kanban card/item
export const kanbanCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.string(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  assignee: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()),
  metadata: z.record(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
  updatedBy: z.string()
});

// Metrics configuration
export const metricsWidgetSchema = z.object({
  metrics: z.array(z.object({
    id: z.string(),
    name: z.string(),
    value: z.number(),
    previousValue: z.number().optional(),
    format: z.enum(['number', 'currency', 'percentage', 'duration']),
    trend: z.enum(['up', 'down', 'neutral']).optional(),
    trendValue: z.number().optional(),
    color: z.string().optional(),
    icon: z.string().optional()
  })),
  layout: z.enum(['grid', 'list', 'compact']),
  showTrends: z.boolean().default(true),
  showIcons: z.boolean().default(true)
});

// Chart widget configuration
export const chartWidgetSchema = z.object({
  chartType: z.enum(['line', 'bar', 'pie', 'doughnut', 'area', 'scatter', 'radar', 'funnel', 'treemap']),
  dataSource: z.string(),
  xAxis: z.string(),
  yAxis: z.array(z.string()),
  groupBy: z.string().optional(),
  filters: z.record(z.any()).optional(),
  timeRange: z.enum(['today', 'yesterday', 'last_7_days', 'last_30_days', 'last_90_days', 'last_year', 'custom']),
  customTimeRange: z.object({
    start: z.string(),
    end: z.string()
  }).optional(),
  colors: z.array(z.string()).optional(),
  showLegend: z.boolean().default(true),
  showGrid: z.boolean().default(true),
  showDataLabels: z.boolean().default(false),
  animation: z.boolean().default(true)
});

// Timeline widget configuration
export const timelineWidgetSchema = z.object({
  dataSource: z.string(),
  dateField: z.string(),
  titleField: z.string(),
  descriptionField: z.string().optional(),
  groupBy: z.string().optional(),
  filters: z.record(z.any()).optional(),
  timeRange: z.enum(['today', 'yesterday', 'last_7_days', 'last_30_days', 'last_90_days', 'last_year', 'custom']),
  layout: z.enum(['vertical', 'horizontal']),
  showIcons: z.boolean().default(true),
  colors: z.record(z.string()).optional()
});

// Manufacturing-specific dashboard data
export interface ManufacturingMetrics {
  // Production metrics
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onTimeDelivery: number;
  qualityIncidents: number;

  // Financial metrics
  totalRevenue: number;
  averageOrderValue: number;
  profitMargin: number;
  outstandingInvoices: number;

  // Customer metrics
  totalCustomers: number;
  activeCustomers: number;
  customerSatisfaction: number;
  newCustomersThisMonth: number;

  // Supplier metrics
  totalSuppliers: number;
  activeSuppliers: number;
  supplierPerformance: number;
  openRFQs: number;

  // Resource metrics
  utilizationRate: number;
  capacityUtilization: number;
  leadTime: number;
  inventoryTurnover: number;

  // Period comparison
  periodStart: string;
  periodEnd: string;
  previousPeriodMetrics: Partial<ManufacturingMetrics>;
}

// Dashboard filter options
export interface DashboardFilters {
  timeRange: TimeRange;
  customDateRange?: {
    start: string;
    end: string;
  };
  projectStatus?: string[];
  customerIds?: string[];
  supplierIds?: string[];
  departments?: string[];
  priorities?: string[];
  tags?: string[];
}

// Real-time dashboard updates
export interface DashboardUpdate {
  widgetId: string;
  updateType: 'data' | 'config' | 'position' | 'delete';
  data?: any;
  timestamp: string;
}

// Dashboard sharing and collaboration
export interface DashboardShare {
  id: string;
  dashboardId: string;
  sharedWith: string; // user or role
  permissions: ('view' | 'edit' | 'delete' | 'share')[];
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
}

// Type inference
export type DashboardWidget = z.infer<typeof dashboardWidgetSchema>;
export type DashboardLayout = z.infer<typeof dashboardLayoutSchema>;
export type KanbanBoard = z.infer<typeof kanbanBoardSchema>;
export type KanbanCard = z.infer<typeof kanbanCardSchema>;
export type MetricsWidget = z.infer<typeof metricsWidgetSchema>;
export type ChartWidget = z.infer<typeof chartWidgetSchema>;
export type TimelineWidget = z.infer<typeof timelineWidgetSchema>;

// Dashboard themes and styling
export const DASHBOARD_THEMES = {
  manufacturing: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    muted: '#64748b'
  },
  dark: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    muted: '#64748b'
  },
  light: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    muted: '#64748b'
  }
} as const;

// Widget default configurations
export const WIDGET_DEFAULTS = {
  kanban: {
    title: 'Project Kanban',
    size: 'large' as WidgetSize,
    refreshInterval: 300,
    config: {
      showSwimlanes: false,
      showFilters: true,
      allowDragDrop: true
    }
  },
  metrics: {
    title: 'Key Metrics',
    size: 'medium' as WidgetSize,
    refreshInterval: 60,
    config: {
      layout: 'grid',
      showTrends: true,
      showIcons: true
    }
  },
  chart: {
    title: 'Analytics Chart',
    size: 'medium' as WidgetSize,
    refreshInterval: 300,
    config: {
      chartType: 'line',
      showLegend: true,
      showGrid: true,
      animation: true
    }
  },
  timeline: {
    title: 'Project Timeline',
    size: 'large' as WidgetSize,
    refreshInterval: 600,
    config: {
      layout: 'vertical',
      showIcons: true
    }
  }
} as const;
