import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PROJECT_TYPE_LABELS, PROJECT_TYPE_COLORS } from "@/types/project";

interface ProjectTypeChartProps {
    data: Record<string, number>;
}

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

export function ProjectTypeChart({ data }: ProjectTypeChartProps) {
    // Convert the data object to an array for the charts
    const chartData = Object.entries(data).map(([type, count], index) => ({
        name: PROJECT_TYPE_LABELS[type as keyof typeof PROJECT_TYPE_LABELS] || type,
        value: count,
        color: COLORS[index % COLORS.length],
        type: type
    }));

    // Chart configuration for the UI components
    const chartConfig = {
        system_build: {
            label: PROJECT_TYPE_LABELS.system_build,
            color: "#3b82f6",
        },
        fabrication: {
            label: PROJECT_TYPE_LABELS.fabrication,
            color: "#10b981",
        },
        manufacturing: {
            label: PROJECT_TYPE_LABELS.manufacturing,
            color: "#8b5cf6",
        },
        unspecified: {
            label: "Unspecified",
            color: "#94a3b8",
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Projects by Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="value" name="Projects">
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}