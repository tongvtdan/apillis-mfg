import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectProgressCard } from "./ProjectProgressCard";
import { useProjects } from "@/hooks/useProjects";

export function ProjectProgressView() {
  const { projects, loading } = useProjects();

  // Show active projects (not lost)
  const activeProjects = projects.filter(p => p.status !== 'lost').slice(0, 6);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-96"></div>
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
          <CardTitle>Project Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No active projects found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeProjects.map((project) => (
            <ProjectProgressCard key={project.id} project={project} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}