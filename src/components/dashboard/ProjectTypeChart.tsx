import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis, ComposedChart, Line, Rectangle } from "recharts";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PROJECT_TYPE_LABELS } from "@/types/project";

interface ProjectTypeChartProps {
    data: Record<string, number>;
}

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

export function ProjectTypeChart({ data }: ProjectTypeChartProps) {
    const navigate = useNavigate();

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
            color: "#10b981",
        },
        fabrication: {
            label: PROJECT_TYPE_LABELS.fabrication,
            color: "#3b82f6",
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

    // Handle click on bar chart
    const handleBarClick = (data: any) => {
        if (data && data.type) {
            navigate(`/projects?type=${data.type}`);
        }
    };

    // Handle click on pie chart
    const handlePieClick = (data: any) => {
        if (data && data.type) {
            navigate(`/projects?type=${data.type}`);
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
                    <CardTitle>Projects by Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <ComposedChart
                            width={234}
                            height={200}
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
                        <PieChart
                            width={234}
                            height={200}
                        >
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
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}