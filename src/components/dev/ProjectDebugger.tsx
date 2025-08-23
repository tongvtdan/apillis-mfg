import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Database, ChevronsUpDown, Copy, AlertCircle } from "lucide-react";
import { Project } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';

interface ProjectDebuggerProps {
    project: Project;
    isVisible?: boolean;
}

export default function ProjectDebugger({ project, isVisible = true }: ProjectDebuggerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [databaseSample, setDatabaseSample] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const fetchSampleData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Get 3 sample projects from database
            const { data, error } = await supabase
                .from('projects')
                .select(`
          *,
          customer:customers(*)
        `)
                .limit(3);

            if (error) {
                throw new Error(`Error fetching sample data: ${error.message}`);
            }

            setDatabaseSample(data || []);
        } catch (err) {
            console.error('Error in fetchSampleData:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <Card className="mt-4 border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-orange-800">
                    <Database className="w-4 h-4 mr-2" />
                    Project Data Debugger
                    <span className="ml-auto text-xs bg-orange-200 rounded px-2 py-0.5">DEV ONLY</span>
                </CardTitle>
                <CardDescription className="text-orange-700">
                    This tool helps diagnose database and data structure issues
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
                    <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-between">
                            <span>Toggle Debug Data</span>
                            <ChevronsUpDown className="h-4 w-4" />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Current Project</h4>
                            <div className="bg-white rounded border p-2 text-xs font-mono overflow-auto max-h-60">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold">Project JSON</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 p-1"
                                        onClick={() => copyToClipboard(JSON.stringify(project, null, 2))}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                                <pre>{JSON.stringify(project, null, 2)}</pre>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h4 className="font-medium text-sm">Key Checks</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white rounded border p-2">
                                    <span className="font-semibold">Customer Object</span>
                                    <div className="mt-1">
                                        {project.customer ? (
                                            <div className="text-green-600">✓ Present</div>
                                        ) : (
                                            <div className="text-red-600">✗ Missing</div>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white rounded border p-2">
                                    <span className="font-semibold">Customer ID</span>
                                    <div className="mt-1">
                                        {project.customer_id ? (
                                            <div className="text-green-600">✓ Present ({project.customer_id})</div>
                                        ) : (
                                            <div className="text-red-600">✗ Missing</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">Database Sample Projects</h4>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchSampleData}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Loading...' : 'Fetch Sample'}
                                </Button>
                            </div>
                            {error && (
                                <div className="bg-red-100 border border-red-200 rounded p-2 text-xs text-red-800 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}
                            {databaseSample.length > 0 && (
                                <div className="bg-white rounded border p-2 text-xs font-mono overflow-auto max-h-60">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold">Database Sample</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 p-1"
                                            onClick={() => copyToClipboard(JSON.stringify(databaseSample, null, 2))}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <pre>{JSON.stringify(databaseSample, null, 2)}</pre>
                                </div>
                            )}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}