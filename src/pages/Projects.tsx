import { WorkflowKanban } from "@/components/dashboard/WorkflowKanban";
import { ProjectProgressCard } from "@/components/dashboard/ProjectProgressCard";
import { useProjects } from "@/hooks/useProjects";

export default function Projects() {
  const { projects, loading } = useProjects();

  const activeProjects = projects.filter(p => p.status !== 'lost');

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage all your projects and their workflow stages</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-96"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-muted-foreground">Manage all your projects and their workflow stages</p>
      </div>
      
      {/* Detailed Project Cards with full functionality */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeProjects.map((project) => (
          <ProjectProgressCard key={project.id} project={project} />
        ))}
      </div>
      
      {activeProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No active projects found</p>
        </div>
      )}
    </div>
  );
}