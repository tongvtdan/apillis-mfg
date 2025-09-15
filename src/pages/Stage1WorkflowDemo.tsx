import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    FileText,
    Users,
    Settings,
    Play,
    CheckCircle,
    AlertTriangle
} from "lucide-react";

import { Project, WorkflowStage } from '@/types/project';
import { Stage1WorkflowManager } from '@/components/project/workflow/Stage1WorkflowManager';
import { projectService } from '@/services/projectService';
import { workflowStageService } from '@/services/workflowStageService';
import { useToast } from '@/shared/hooks/use-toast';

export function Stage1WorkflowDemo() {
    const { toast } = useToast();
    const [project, setProject] = useState<Project | null>(null);
    const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('workflow');

    // Load demo data
    useEffect(() => {
        loadDemoData();
    }, []);

    const loadDemoData = async () => {
        try {
            setIsLoading(true);

            // Load workflow stages
            const stages = await workflowStageService.getWorkflowStages();
            setWorkflowStages(stages);

            // Find Stage 1 (Inquiry Received)
            const stage1 = stages.find(s => s.slug === 'inquiry_received');
            if (!stage1) {
                throw new Error('Stage 1 (Inquiry Received) not found');
            }

            // Create a demo project in Stage 1
            const demoProject: Project = {
                id: 'demo-project-1',
                organization_id: 'demo-org',
                project_id: 'P-25012001',
                title: 'Customer RFQ - Electronic Components Manufacturing',
                description: 'Manufacturing of custom electronic components based on customer specifications',
                customer_organization_id: 'customer-org-1',
                point_of_contacts: ['contact-1', 'contact-2'],
                current_stage_id: stage1.id,
                status: 'in_progress',
                priority_level: 'high',
                estimated_value: 50000,
                project_type: 'manufacturing',
                intake_type: 'rfq',
                intake_source: 'website',
                created_by: 'user-1',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                estimated_delivery_date: '2024-03-15T00:00:00Z',
                tags: ['electronics', 'custom', 'high-volume'],
                metadata: {
                    customer_requirements: 'Custom PCB assembly with specific components',
                    estimated_quantity: 1000,
                    target_price: 45.00
                }
            };

            setProject(demoProject);
        } catch (error) {
            console.error('Error loading demo data:', error);
            toast({
                variant: "destructive",
                title: "Demo Error",
                description: "Failed to load demo data. Please check your setup.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleProjectUpdate = (updatedProject: Project) => {
        setProject(updatedProject);
        toast({
            title: "Project Updated",
            description: "Project has been updated successfully.",
        });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <span className="ml-2">Loading demo data...</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load demo project. Please check your database setup.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const currentStage = workflowStages.find(s => s.id === project.current_stage_id);

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Stage 1 Workflow Manager Demo</h1>
                    <p className="text-muted-foreground mt-1">
                        Comprehensive workflow management for Inquiry Received stage
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                        Demo Mode
                    </Badge>
                    <Button variant="outline" onClick={loadDemoData}>
                        Refresh Demo
                    </Button>
                </div>
            </div>

            {/* Project Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Project Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Project ID</h4>
                            <p className="text-lg font-mono">{project.project_id}</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Title</h4>
                            <p className="text-lg">{project.title}</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-sm text-muted-foreground">Current Stage</h4>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                    {currentStage?.name || 'Unknown'}
                                </Badge>
                                <Badge variant={project.status === 'inquiry' ? 'default' : 'outline'}>
                                    {project.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="workflow" className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Workflow Management
                    </TabsTrigger>
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Project Overview
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="workflow" className="space-y-4">
                    <Stage1WorkflowManager
                        project={project}
                        onProjectUpdate={handleProjectUpdate}
                    />
                </TabsContent>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
                                    <p className="text-sm">{project.description}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Estimated Value</h4>
                                    <p className="text-sm">${project.estimated_value?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Priority</h4>
                                    <Badge variant="outline">{project.priority_level}</Badge>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Delivery Date</h4>
                                    <p className="text-sm">
                                        {project.estimated_delivery_date
                                            ? new Date(project.estimated_delivery_date).toLocaleDateString()
                                            : 'Not set'
                                        }
                                    </p>
                                </div>
                            </div>

                            {project.tags && project.tags.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Tags</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {project.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {project.metadata && (
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Additional Information</h4>
                                    <div className="bg-gray-50 p-3 rounded text-sm">
                                        <pre className="whitespace-pre-wrap">
                                            {JSON.stringify(project.metadata, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Workflow Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        This demo showcases the Stage 1 workflow management system with:
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>Sub-stage tracking and assignment</li>
                                            <li>Document validation and requirements</li>
                                            <li>Actions needed list with priority management</li>
                                            <li>Stage transition validation</li>
                                            <li>Real-time progress tracking</li>
                                        </ul>
                                    </AlertDescription>
                                </Alert>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Current Stage</h4>
                                        <p className="text-sm">{currentStage?.name || 'Unknown'}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {currentStage?.description || 'No description available'}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Stage Order</h4>
                                        <p className="text-sm">{currentStage?.stage_order || 'N/A'}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Estimated Duration: {currentStage?.estimated_duration_days || 'N/A'} days
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
