import { WorkflowKanban } from "@/components/dashboard/WorkflowKanban";
import { ProjectTable } from "@/components/project/ProjectTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      
      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="kanban">Kanban View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="kanban" className="mt-0">
          <WorkflowKanban />
        </TabsContent>
        
        <TabsContent value="table">
          <ProjectTable projects={activeProjects} />
        </TabsContent>
        
        {activeProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No active projects found</p>
          </div>
        )}
      </Tabs>
    </div>
  );
}