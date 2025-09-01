import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart, Rectangle } from "recharts";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { WorkflowStage } from "@/types/project";

interface ProjectStageChartProps {
    data: { stage: WorkflowStage; count: number }[];
}

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#6366f1", "#f97316", "#06b6d4"];

export function ProjectStageChart({ data }: ProjectStageChartProps) {
    const navigate = useNavigate();

    // Convert the data object to an array for the charts
    const chartData = data.map((item, index) => ({
        name: item.stage.name,
        value: item.count,
        color: COLORS[index % COLORS.length],
        stageId: item.stage.id
    }));

    // Chart configuration for the UI components
    const chartConfig = data.reduce((acc, item, index) => {
        acc[item.stage.id] = {
            label: item.stage.name,
            color: COLORS[index % COLORS.length],
        };
        return acc;
    }, {} as Record<string, { label: string; color: string }>);

    // Handle click on bar chart
    const handleBarClick = (data: any) => {
        if (data && data.stageId) {
            navigate(`/projects?stage=${data.stageId}`);
        }
    };

    // Handle click on pie chart
    const handlePieClick = (data: any) => {
        if (data && data.stageId) {
            navigate(`/projects?stage=${data.stageId}`);
        }
    };

    // Custom tooltip styles - solid background
    const customTooltipStyle = {
        backgroundColor: "#ffffff",
        border: "1px solid rgba(0, 0, 0, 0.05)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        borderRadius: "0.375rem",
        padding: "0.5rem 0.75rem",
    };

    // For dark mode
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        customTooltipStyle.backgroundColor = "#1f2937"; // dark mode background
        customTooltipStyle.border = "1px solid rgba(255, 255, 255, 0.1)";
    }

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={customTooltipStyle}>
                    <p className="font-medium text-sm mb-1">{payload[0].payload.name}</p>
                    <p className="text-sm">
                        <span className="font-semibold">{payload[0].value}</span> projects
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom Bar Shape component to replace the default rectangle with a transparent background one
    const CustomBar = (props: any) => {
        const { x, y, width, height, fill } = props;
        return <Rectangle x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.85} />;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Projects by Stage</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <ResponsiveContainer width="100%" height={200}>
                            <ComposedChart
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="value"
                                    name="Projects"
                                    onClick={handleBarClick}
                                    cursor="pointer"
                                    radius={[4, 4, 0, 0]}
                                    shape={<CustomBar />}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            onClick={() => handleBarClick(entry)}
                                        />
                                    ))}
                                </Bar>
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Stage Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Tooltip content={<CustomTooltip />} />
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
                                    onClick={handlePieClick}
                                    cursor="pointer"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            fillOpacity={0.85}
                                            onClick={() => handlePieClick(entry)}
                                        />
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