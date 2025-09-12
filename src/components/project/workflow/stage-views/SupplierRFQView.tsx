import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import { DocumentValidationPanel } from '../../documents/DocumentValidationPanel';
import { Project, WorkflowStage } from '@/types/project';

interface SupplierRFQViewProps {
    project: Project;
    currentStage: WorkflowStage;
    nextStage?: WorkflowStage;
    validation: any;
}

export const SupplierRFQView: React.FC<SupplierRFQViewProps> = ({
    project,
    currentStage,
    nextStage,
    validation
}) => {
    return (
        <div className="space-y-4">
            {/* Prerequisite Checks */}
            <Tabs defaultValue="summary">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="project_data">Project Data</TabsTrigger>
                    <TabsTrigger value="approvals">Approvals</TabsTrigger>
                    <TabsTrigger value="stage_specific">Stage Specific</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-3 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {validation.checks.filter((c: any) => c.status === 'passed').length}
                            </div>
                            <div className="text-sm text-muted-foreground">Passed</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                                {validation.checks.filter((c: any) => c.status === 'failed').length}
                            </div>
                            <div className="text-sm text-muted-foreground">Failed</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {validation.checks.map((check: any) => (
                            <div key={check.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                {check.status === 'passed' ? (
                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                ) : check.status === 'failed' ? (
                                    <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h5 className={`font-medium text-sm ${check.status === 'passed' ? 'text-green-600' :
                                            check.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                                            }`}>
                                            {check.name}
                                        </h5>
                                        {check.required && (
                                            <Badge variant="outline" className="text-xs">Required</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1">{check.description}</p>
                                    {check.details && (
                                        <p className="text-xs text-muted-foreground italic">{check.details}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* Documents Tab - Enhanced with DocumentValidationPanel */}
                <TabsContent value="documents" className="space-y-3 mt-4">
                    {project.current_stage_id && validation.checks.find((c: any) => c.category === 'documents') && nextStage && (
                        <DocumentValidationPanel
                            projectId={project.id}
                            currentStage={currentStage}
                            targetStage={nextStage}
                        />
                    )}
                </TabsContent>

                {/* Other tabs */}
                {['project_data', 'approvals', 'stage_specific', 'system'].map(category => (
                    <TabsContent key={category} value={category} className="space-y-3 mt-4">
                        {validation.checks
                            .filter((check: any) => check.category === category)
                            .map((check: any) => (
                                <div key={check.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                    {check.status === 'passed' ? (
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                    ) : check.status === 'failed' ? (
                                        <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                    ) : (
                                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h5 className={`font-medium text-sm ${check.status === 'passed' ? 'text-green-600' :
                                                check.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                                                }`}>
                                                {check.name}
                                            </h5>
                                            {check.required && (
                                                <Badge variant="outline" className="text-xs">Required</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-1">{check.description}</p>
                                        {check.details && (
                                            <p className="text-xs text-muted-foreground italic">{check.details}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        {validation.checks.filter((check: any) => check.category === category).length === 0 && (
                            <Card className="text-center py-4 text-muted-foreground">
                                No {category.replace('_', ' ')} checks required for this transition
                            </Card>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};