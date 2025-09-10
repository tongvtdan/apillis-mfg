import React from 'react';
import { Dashboard, DASHBOARD_THEMES } from '@/features/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Dashboard Feature Test Page
 * This page demonstrates the new dashboard feature implementation
 */
export default function DashboardTest() {
    const handleLayoutChange = (layout: any) => {
        console.log('Dashboard layout changed:', layout);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Dashboard Feature Test</h1>
                <p className="text-muted-foreground">
                    This page tests the new feature-based dashboard implementation.
                    The dashboard provides comprehensive manufacturing analytics, kanban boards,
                    and real-time metrics for operational visibility.
                </p>
            </div>

            {/* Feature Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">📊 Dashboard Feature</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-blue-700">📈 Analytics & Metrics</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Real-time manufacturing metrics</li>
                                <li>• Performance trend analysis</li>
                                <li>• Revenue and cost tracking</li>
                                <li>• Quality and delivery metrics</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-green-700">🎯 Project Management</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Visual kanban boards</li>
                                <li>• Project status tracking</li>
                                <li>• Workflow visualization</li>
                                <li>• Team collaboration</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-purple-700">⏱️ Activity Monitoring</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Real-time activity feeds</li>
                                <li>• Timeline visualization</li>
                                <li>• Event tracking</li>
                                <li>• Notification center</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dashboard Widgets Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <div className="text-2xl mb-2">📊</div>
                            <div className="font-medium">Metrics Widget</div>
                            <div className="text-sm text-muted-foreground">Key performance indicators</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <div className="text-2xl mb-2">📈</div>
                            <div className="font-medium">Chart Widget</div>
                            <div className="text-sm text-muted-foreground">Data visualization</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <div className="text-2xl mb-2">📋</div>
                            <div className="font-medium">Kanban Widget</div>
                            <div className="text-sm text-muted-foreground">Project workflow</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <div className="text-2xl mb-2">⏰</div>
                            <div className="font-medium">Timeline Widget</div>
                            <div className="text-sm text-muted-foreground">Activity tracking</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Test Dashboard */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">🎮 Manufacturing Dashboard</CardTitle>
                    <p className="text-muted-foreground">
                        Interactive dashboard with real-time metrics, kanban boards, and activity feeds.
                        Test the complete dashboard experience below.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <div className="flex items-start space-x-3">
                            <div className="text-blue-600 mt-0.5">🚀</div>
                            <div>
                                <h4 className="font-medium text-blue-900">Complete Dashboard Experience</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    <strong>Features:</strong> Real-time metrics, Kanban boards, Activity timeline, Customizable layout<br />
                                    <strong>Data:</strong> Manufacturing KPIs, Project status, Customer analytics<br />
                                    <strong>Interaction:</strong> Drag & drop widgets, Time range filters, Export capabilities
                                </p>
                            </div>
                        </div>
                    </div>

                    <Dashboard
                        onLayoutChange={handleLayoutChange}
                        className="min-h-screen"
                    />
                </CardContent>
            </Card>

            {/* Dashboard Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">⚙️ Dashboard Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-3">Widget Types</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 bg-muted rounded">
                                    <span className="text-sm">Metrics Widget</span>
                                    <Badge variant="secondary">KPI Dashboard</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-muted rounded">
                                    <span className="text-sm">Chart Widget</span>
                                    <Badge variant="secondary">Data Visualization</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-muted rounded">
                                    <span className="text-sm">Kanban Widget</span>
                                    <Badge variant="secondary">Project Management</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-muted rounded">
                                    <span className="text-sm">Timeline Widget</span>
                                    <Badge variant="secondary">Activity Feed</Badge>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3">Time Range Options</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 bg-muted rounded">
                                    <span className="text-sm">Today</span>
                                    <Badge>Real-time</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-muted rounded">
                                    <span className="text-sm">Last 7/30/90 Days</span>
                                    <Badge>Historical</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-muted rounded">
                                    <span className="text-sm">Custom Range</span>
                                    <Badge>Flexible</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-muted rounded">
                                    <span className="text-sm">Last Year</span>
                                    <Badge>Annual</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Feature Architecture */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">🏗️ Feature Architecture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">📁 Feature Structure</h4>
                            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                                {`src/features/dashboard/
├── components/
│   ├── Dashboard.tsx
│   └── widgets/
│       ├── MetricsWidget.tsx
│       ├── ChartWidget.tsx
│       ├── KanbanWidget.tsx
│       └── TimelineWidget.tsx
├── services/
│   └── dashboardService.ts
├── types/
│   └── dashboard.types.ts
└── index.ts`}
                            </pre>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">🔗 Dependencies</h4>
                            <ul className="text-sm space-y-1">
                                <li><strong>Core Auth:</strong> User permissions and organization context</li>
                                <li><strong>Core Workflow:</strong> Project status integration</li>
                                <li><strong>All Features:</strong> Aggregates data from intake, engineering, costing, supplier</li>
                                <li><strong>Database:</strong> Real-time data from Supabase</li>
                                <li><strong>UI Components:</strong> Charts, kanban, metrics displays</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">🎯 Key Capabilities</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <strong>Real-time Analytics:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Live manufacturing metrics</li>
                                    <li>• Performance trend analysis</li>
                                    <li>• Custom time range filtering</li>
                                    <li>• Automated data refresh</li>
                                </ul>
                            </div>
                            <div>
                                <strong>Project Management:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Visual kanban boards</li>
                                    <li>• Drag & drop workflow</li>
                                    <li>• Project status tracking</li>
                                    <li>• Team collaboration</li>
                                </ul>
                            </div>
                            <div>
                                <strong>Business Intelligence:</strong>
                                <ul className="mt-1 space-y-1">
                                    <li>• Activity timeline</li>
                                    <li>• Customizable widgets</li>
                                    <li>• Export capabilities</li>
                                    <li>• Cross-feature insights</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
