import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProjects } from "@/hooks/useProjects";

export function MonthlyProgress() {
  const { projects, loading } = useProjects();

  // Calculate progress data from real projects
  const totalProjects = projects.length;
  const inquiryProjects = projects.filter(p => p.current_stage === 'inquiry_received').length;
  const reviewProjects = projects.filter(p => p.current_stage === 'technical_review').length;
  const quotedProjects = projects.filter(p => p.current_stage === 'quoted').length;
  const wonProjects = projects.filter(p => p.current_stage === 'in_production').length;

  const progressData = [
    {
      label: "Projects Won",
      value: totalProjects > 0 ? Math.round((wonProjects / totalProjects) * 100) : 0
    },
    {
      label: "Projects in Review",
      value: totalProjects > 0 ? Math.round((reviewProjects / totalProjects) * 100) : 0
    },
    {
      label: "Projects Quoted",
      value: totalProjects > 0 ? Math.round((quotedProjects / totalProjects) * 100) : 0
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Monthly Progress Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-2">
                <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
                <div className="h-4 bg-muted animate-pulse rounded w-8"></div>
              </div>
              <div className="h-2 bg-muted animate-pulse rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Monthly Progress Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {progressData.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground">{item.value}%</span>
            </div>
            <Progress value={item.value} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}