// Main Components
export { Dashboard } from './components/Dashboard';

// Widget Components
export { MetricsWidget } from './components/widgets/MetricsWidget';
export { ChartWidget } from './components/widgets/ChartWidget';
export { KanbanWidget } from './components/widgets/KanbanWidget';
export { TimelineWidget } from './components/widgets/TimelineWidget';

// Types
export type {
    DashboardWidget,
    DashboardLayout,
    KanbanBoard,
    KanbanCard,
    ManufacturingMetrics,
    DashboardFilters,
    TimeRange,
    WidgetType,
    WidgetSize,
    WidgetPosition,
    ChartType
} from './types/dashboard.types';

// Constants (export as values, not types)
export {
    DASHBOARD_THEMES,
    WIDGET_DEFAULTS
} from './types/dashboard.types';

// Services
export { DashboardService } from './services/dashboardService';

// Validation
export {
    dashboardWidgetSchema,
    dashboardLayoutSchema,
    kanbanBoardSchema,
    kanbanCardSchema
} from './types/dashboard.types';
