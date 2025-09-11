import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/core/auth';
import { activityAnalyticsService, ProjectActivityStats } from '@/services/activityAnalyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartData {
    name: string;
    value: number;
}

export function ProjectActivityChart() {
    const { profile } = useAuth();
    const [projectStats, setProjectStats] = useState<ProjectActivityStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjectStats = async () => {
            if (!profile?.organization_id) return;

            try {
                setLoading(true);
                const stats = await activityAnalyticsService.getProjectActivityStats(profile.organization_id, 10);
                setProjectStats(stats);
            } catch (err) {
                setError('Failed to load project activity data');
                console.error('Error fetching project stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectStats();
    }, [profile?.organization_id]);

    // Prepare data for bar chart (top projects by activity)
    const barChartData: ChartData[] = projectStats
        .map(stat => ({
            name: stat.project_number || stat.project_title.substring(0, 20) + (stat.project_title.length > 20 ? '...' : ''),
            value: stat.total_activities
        }))
        .slice(0, 8);

    // Prepare data for pie chart (activity types)
    const activityTypeData: ChartData[] = [];
    const activityTypeMap: Record<string, number> = {};

    projectStats.forEach(stat => {
        Object.entries(stat.activity_types).forEach(([type, count]) => {
            activityTypeMap[type] = (activityTypeMap[type] || 0) + count;
        });
    });

    Object.entries(activityTypeMap).forEach(([type, count]) => {
        activityTypeData.push({
            name: type,
            value: count
        });
    });

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Project Activity Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="h-4 bg-muted animate-pulse rounded"></div>
                        <div className="h-64 bg-muted animate-pulse rounded"></div>
                        <div className="h-64 bg-muted animate-pulse rounded"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Project Activity Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-red-500">
                        {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Activity Analytics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bar Chart - Top Projects by Activity */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Top Projects by Activity</h3>
                        {barChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                No project activity data available
                            </div>
                        )}
                    </div>

                    {/* Pie Chart - Activity Types */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Activity Types Distribution</h3>
                        {activityTypeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={activityTypeData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {activityTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                No activity type data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Project Activity Table */}
                <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Project Activity Details</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Project</th>
                                    <th className="text-left py-2">Total Activities</th>
                                    <th className="text-left py-2">Recent Activities</th>
                                    <th className="text-left py-2">Last Activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projectStats.map((stat) => (
                                    <tr key={stat.project_id} className="border-b">
                                        <td className="py-2">
                                            <div>
                                                <div className="font-medium">{stat.project_title}</div>
                                                <div className="text-sm text-muted-foreground">{stat.project_number}</div>
                                            </div>
                                        </td>
                                        <td className="py-2">{stat.total_activities}</td>
                                        <td className="py-2">{stat.recent_activities}</td>
                                        <td className="py-2">
                                            {stat.last_activity
                                                ? new Date(stat.last_activity).toLocaleDateString()
                                                : 'Never'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}