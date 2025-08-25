import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, ChevronRight, Play, Pause, XCircle } from "lucide-react";
import { PROJECT_STAGES, ProjectStatus, Project } from "@/types/project";
import { useProjects } from "@/hooks/useProjects";
import { WorkflowValidator } from "@/lib/workflow-validator";

interface WorkflowFlowchartProps {
  selectedProject: Project | null;
  onProjectSelect: (project: Project | null) => void;
}

export function WorkflowFlowchart({ selectedProject, onProjectSelect }: WorkflowFlowchartProps) {
  const { projects, updateProjectStatusOptimistic } = useProjects();
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Validate the status change
    const validationResult = await WorkflowValidator.validateStatusChange(project, newStatus);
    
    if (!validationResult.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        [projectId]: validationResult.errors
      }));
      return;
    }

    // Clear any previous errors for this project
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[projectId];
      return newErrors;
    });

    await updateProjectStatusOptimistic(projectId, newStatus);
  };

  const getProjectStageStatus = (project: Project, stageId: ProjectStatus) => {
    const projectStageIndex = WorkflowValidator.getStageIndex(project.status);
    const stageIndex = WorkflowValidator.getStageIndex(stageId);
    
    if (stageIndex < projectStageIndex) {
      return 'completed';
    } else if (stageIndex === projectStageIndex) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  const getStatusIcon = (status: 'completed' | 'current' | 'pending') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'current':
        return <Play className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Pause className="h-5 w-5 text-gray-400" />;
      default:
        return <Pause className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStageColor = (status: 'completed' | 'current' | 'pending') => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'current':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Group projects by their current stage
  const projectsByStage = PROJECT_STAGES.map(stage => ({
    ...stage,
    projects: projects.filter(p => p.status === stage.id)
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workflow Visualization</CardTitle>
          <CardDescription>
            Visualize and manage project workflow stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-4">
            <div className="flex items-center gap-4 min-w-max">
              {PROJECT_STAGES.map((stage, index) => (
                <React.Fragment key={stage.id}>
                  <div className="flex flex-col items-center space-y-2">
                    <Badge className={`${stage.color} text-xs font-medium`} variant="outline">
                      {projectsByStage.find(s => s.id === stage.id)?.projects.length || 0}
                    </Badge>
                    <Card className="w-48 cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <h3 className="font-medium text-sm">{stage.name}</h3>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {index < PROJECT_STAGES.length - 1 && (
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle>Project Workflow: {selectedProject.title}</CardTitle>
            <CardDescription>
              Project ID: {selectedProject.project_id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Workflow Progress</h3>
                <Button variant="outline" size="sm" onClick={() => onProjectSelect(null)}>
                  Close
                </Button>
              </div>
              
              <div className="space-y-3">
                {PROJECT_STAGES.map((stage, index) => {
                  const stageStatus = getProjectStageStatus(selectedProject, stage.id);
                  const canMoveToStage = WorkflowValidator.getStageIndex(selectedProject.status) < index;
                  
                  return (
                    <div key={stage.id} className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center h-8 w-8 rounded-full border ${getStageColor(stageStatus)}`}>
                        {getStatusIcon(stageStatus)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{stage.name}</span>
                          {stageStatus === 'pending' && canMoveToStage && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-7 text-xs"
                              onClick={() => handleStatusChange(selectedProject.id, stage.id)}
                            >
                              Move to Stage
                            </Button>
                          )}
                          {stageStatus === 'current' && (
                            <Badge variant="secondary" className="h-6 text-xs">
                              Current Stage
                            </Badge>
                          )}
                          {stageStatus === 'completed' && (
                            <Badge variant="secondary" className="h-6 text-xs bg-green-100 text-green-800">
                              Completed
                            </Badge>
                          )}
                        </div>
                        
                        {validationErrors[selectedProject.id] && (
                          <div className="mt-1 flex items-center text-xs text-red-500">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {validationErrors[selectedProject.id].join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Project</CardTitle>
            <CardDescription>
              Click on a project in any stage to view and manage its workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectsByStage.map(stage => (
                <Card key={stage.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>{stage.name}</span>
                      <Badge variant="secondary">{stage.projects.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {stage.projects.map(project => (
                        <div 
                          key={project.id} 
                          className="p-2 rounded border cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => onProjectSelect(project)}
                        >
                          <div className="font-medium text-sm truncate">{project.title}</div>
                          <div className="text-xs text-muted-foreground">{project.project_id}</div>
                        </div>
                      ))}
                      {stage.projects.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          No projects in this stage
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}