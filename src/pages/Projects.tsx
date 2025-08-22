import React from "react";
import { WorkflowKanban } from "@/components/dashboard/WorkflowKanban";
import { ProjectTable } from "@/components/project/ProjectTable";
import { StageFlowchart } from "@/components/project/StageFlowchart";
import { ProjectTypeKanban } from "@/components/project/ProjectTypeKanban";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjects } from "@/hooks/useProjects";
import { ProjectStatus } from "@/types/project";

export default function Projects() {
  const { projects, loading, updateProjectStatus } = useProjects();
  const [selectedStage, setSelectedStage] = React.useState<ProjectStatus | null>(() => {
    // Try to restore from localStorage, default to 'inquiry_received' if none found
    const saved = localStorage.getItem('projects-selected-stage');
    return saved ? (saved as ProjectStatus) : 'inquiry_received';
  });

  // Save selected stage to localStorage whenever it changes
  const handleStageSelect = React.useCallback((stage: ProjectStatus) => {
    setSelectedStage(stage);
    localStorage.setItem('projects-selected-stage', stage);
  }, []);

  const activeProjects = projects.filter(p => p.status !== 'shipped_closed');
  
  // Calculate stage counts
  const stageCounts = React.useMemo(() => {
    const counts: Record<ProjectStatus, number> = {
      inquiry_received: 0,
      technical_review: 0,
      supplier_rfq_sent: 0,
      quoted: 0,
      order_confirmed: 0,
      procurement_planning: 0,
      in_production: 0,
      shipped_closed: 0
    };
    
    projects.forEach(project => {
      counts[project.status] = (counts[project.status] || 0) + 1;
    });
    
    return counts;
  }, [projects]);

  // Get projects for selected stage
  const selectedStageProjects = React.useMemo(() => {
    if (!selectedStage) return [];
    return projects.filter(p => p.status === selectedStage);
  }, [projects, selectedStage]);

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
        <h1 className="text-2xl font-bold">Factory Pulse - Project Flow</h1>
        <p className="text-muted-foreground">Track and manage your manufacturing projects from idea to delivery</p>
      </div>
      
      <Tabs defaultValue="flowchart" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="flowchart">Flowchart View</TabsTrigger>
          <TabsTrigger value="type-kanban">Type Kanban</TabsTrigger>
          <TabsTrigger value="kanban">Full Kanban</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="flowchart" className="mt-0 space-y-6">
          <div className="bg-card rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-4">Project Workflow Stages</h3>
            <StageFlowchart 
              selectedStage={selectedStage}
              onStageSelect={handleStageSelect}
              stageCounts={stageCounts}
            />
          </div>
          
          {selectedStage && (
            <div className="bg-card rounded-lg p-6 border">
              <ProjectTypeKanban 
                projects={selectedStageProjects}
                onUpdateProject={async (projectId, updates) => {
                  // Handle project updates if needed
                  console.log('Update project:', projectId, updates);
                }}
              />
            </div>
          )}
          
          {!selectedStage && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Click on a stage above to view projects grouped by type
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="type-kanban" className="mt-0">
          <div className="bg-card rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-4">Projects Grouped by Type</h3>
            <ProjectTypeKanban 
              projects={activeProjects}
              onUpdateProject={async (projectId, updates) => {
                // Handle project updates if needed
                console.log('Update project:', projectId, updates);
              }}
            />
          </div>
        </TabsContent>
        
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