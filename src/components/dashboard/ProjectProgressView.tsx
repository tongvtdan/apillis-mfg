import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectOverviewCard } from "./ProjectOverviewCard";
import { useProjects } from "@/hooks/useProjects";

export function ProjectProgressView() {
  const { projects, loading } = useProjects();

  // Show active projects (not completed) - limit to 6 for dashboard overview
  const activeProjects = projects.filter(p => p.current_stage !== 'shipped_closed').slice(0, 6);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-48"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeProjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No active projects found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProjects.map((project) => (
            <ProjectOverviewCard key={project.id} project={project} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}