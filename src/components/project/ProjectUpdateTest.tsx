import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { ProjectStage } from "@/types/project";

export function ProjectUpdateTest() {
    const { projects, updateProjectStage } = useProjects();
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string>('');

    const testProject = projects[0]; // Use the first project for testing

    const handleTestUpdate = async () => {
        if (!testProject || isUpdating) return;

        setIsUpdating(true);
        const newStage: ProjectStage = testProject.current_stage === 'inquiry_received'
            ? 'technical_review'
            : 'inquiry_received';

        try {
            console.log('🧪 Test: Updating project', testProject.id, 'from', testProject.current_stage, 'to', newStage);
            const result = await updateProjectStage(testProject.id, newStage);
            setLastUpdate(`Updated ${testProject.title} to ${newStage} at ${new Date().toLocaleTimeString()}`);
            console.log('🧪 Test: Update result:', result);
        } catch (error) {
            console.error('🧪 Test: Update failed:', error);
            setLastUpdate(`Update failed at ${new Date().toLocaleTimeString()}`);
        } finally {
            setIsUpdating(false);
        }
    };

    if (!testProject) {
        return (
            <Card>
                <CardContent className="p-4">
                    <p>No projects available for testing</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Update Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p><strong>Test Project:</strong> {testProject.title}</p>
                    <p><strong>Current Stage:</strong> <Badge>{testProject.current_stage}</Badge></p>
                    <p><strong>Last Updated:</strong> {testProject.updated_at}</p>
                </div>

                <Button
                    onClick={handleTestUpdate}
                    disabled={isUpdating}
                    className="w-full"
                >
                    {isUpdating ? 'Updating...' : 'Test Status Toggle'}
                </Button>

                {lastUpdate && (
                    <div className="text-sm text-muted-foreground">
                        <strong>Last Test:</strong> {lastUpdate}
                    </div>
                )}

                <div className="text-xs text-muted-foreground">
                    <p>This will toggle the project stage between inquiry_received and technical_review.</p>
                    <p>Check if the stage updates in both the project detail page and the project list.</p>
                </div>
            </CardContent>
        </Card>
    );
}