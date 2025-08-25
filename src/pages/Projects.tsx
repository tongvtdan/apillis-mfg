import React from "react";
import { WorkflowKanban } from "@/components/dashboard/WorkflowKanban";
import { ProjectTable } from "@/components/project/ProjectTable";
import { StageFlowchart } from "@/components/project/StageFlowchart";
import { ProjectTypeKanban } from "@/components/project/ProjectTypeKanban";
import { TabsContent } from "@/components/ui/tabs";
import { ProjectTabs, ProjectTabsList, ProjectTabsTrigger } from "@/components/project/ProjectTabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjects } from "@/hooks/useProjects";
import { ProjectStatus, ProjectType, PROJECT_TYPE_LABELS, Project } from "@/types/project";
import { WorkflowFlowchart } from "@/components/project/WorkflowFlowchart";

export default function Projects() {
  const { projects, loading, updateProjectStatus } = useProjects();
  const [selectedStage, setSelectedStage] = React.useState<ProjectStatus | null>(() => {
    // Try to restore from localStorage, default to 'inquiry_received' if none found
    const saved = localStorage.getItem('projects-selected-stage');
    return saved ? (saved as ProjectStatus) : 'inquiry_received';
  });

  const [selectedProjectType, setSelectedProjectType] = React.useState<ProjectType | 'all'>('all');
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);

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

  // Get projects for selected stage with type filtering
  const selectedStageProjects = React.useMemo(() => {
    if (!selectedStage) return [];
    let filtered = projects.filter(p => p.status === selectedStage);

    // Apply project type filter
    if (selectedProjectType !== 'all') {
      filtered = filtered.filter(p => p.project_type === selectedProjectType);
    }

    return filtered;
  }, [projects, selectedStage, selectedProjectType]);

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
    <div className="p-6 bg-base-100 text-base-content min-h-screen">
      <ProjectTabs defaultValue="flowchart" className="w-full relative">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-base-content">Factory Pulse - Project Flow</h1>
            <p className="text-base-content/70">Track and manage your manufacturing projects from idea to delivery</p>
          </div>
          <div className="flex items-center gap-4">
            <ProjectTabsList className="grid w-[300px] grid-cols-3">
              <ProjectTabsTrigger value="flowchart">Flow</ProjectTabsTrigger>
              <ProjectTabsTrigger value="kanban">Kanban</ProjectTabsTrigger>
              <ProjectTabsTrigger value="table">Table</ProjectTabsTrigger>
            </ProjectTabsList>

            {/* Project Type Filter */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-base-content/70">Filter by type:</span>
              <Select value={selectedProjectType} onValueChange={(value) => setSelectedProjectType(value as ProjectType | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All project types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types ({activeProjects.length})</SelectItem>
                  <SelectItem value="system_build">
                    {PROJECT_TYPE_LABELS.system_build} ({activeProjects.filter(p => p.project_type === 'system_build').length})
                  </SelectItem>
                  <SelectItem value="fabrication">
                    {PROJECT_TYPE_LABELS.fabrication} ({activeProjects.filter(p => p.project_type === 'fabrication').length})
                  </SelectItem>
                  <SelectItem value="manufacturing">
                    {PROJECT_TYPE_LABELS.manufacturing} ({activeProjects.filter(p => p.project_type === 'manufacturing').length})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <TabsContent value="flowchart" className="mt-4 space-y-6">
          <WorkflowFlowchart
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
          />
        </TabsContent>

        <TabsContent value="kanban" className="mt-4 space-y-6">
          <div className="bg-base-100 rounded-lg p-6 border border-base-300">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-base-content">Project Workflow Kanban</h3>
              <p className="text-sm text-base-content/70 mt-1">
                {selectedProjectType === 'all'
                  ? `Showing ${activeProjects.length} projects`
                  : `Showing ${activeProjects.filter(p => p.project_type === selectedProjectType).length} ${PROJECT_TYPE_LABELS[selectedProjectType]} projects`
                }
              </p>
            </div>
          </div>

          <WorkflowKanban projectTypeFilter={selectedProjectType} />
        </TabsContent>

        <TabsContent value="table" className="mt-4 space-y-6">
          <div className="bg-base-100 rounded-lg p-6 border border-base-300">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-base-content">Project Table View</h3>
              <p className="text-sm text-base-content/70 mt-1">
                {selectedProjectType === 'all'
                  ? `Showing ${activeProjects.length} projects`
                  : `Showing ${activeProjects.filter(p => p.project_type === selectedProjectType).length} ${PROJECT_TYPE_LABELS[selectedProjectType]} projects`
                }
              </p>
            </div>
          </div>

          <ProjectTable
            projects={
              selectedProjectType === 'all'
                ? activeProjects
                : activeProjects.filter(p => p.project_type === selectedProjectType)
            }
          />
        </TabsContent>

        {activeProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-base-content/70">No active projects found</p>
          </div>
        )}
      </ProjectTabs>
    </div>
  );
}