import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Plus,
    Edit,
    Trash2,
    MoreHorizontal,
    Copy,
    Eye,
    CheckCircle,
    XCircle
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { workflowDefinitionService } from '@/services/workflowDefinitionService';
import { workflowStageService } from '@/services/workflowStageService';
import { supabase } from '@/integrations/supabase/client.js';
import {
    WorkflowDefinition,
    WorkflowStage,
    WorkflowDefinitionStage
} from '@/types/project';
import { useAuth } from '@/core/auth';

export function WorkflowDefinitionManagement() {
    const { toast } = useToast();
    const { profile } = useAuth();
    const [workflowDefinitions, setWorkflowDefinitions] = useState<WorkflowDefinition[]>([]);
    const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>([]);
    const [definitionStageCounts, setDefinitionStageCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDefinition, setEditingDefinition] = useState<WorkflowDefinition | null>(null);
    const [selectedStages, setSelectedStages] = useState<string[]>([]);
    const [formState, setFormState] = useState({
        name: '',
        version: 1,
        description: '',
        is_active: true
    });

    // Load workflow definitions and stages
    useEffect(() => {
        const loadData = async () => {
            if (!profile?.organization_id) return;

            try {
                setLoading(true);

                // Load workflow definitions
                const { data: definitions, error: definitionsError } = await supabase
                    .from('workflow_definitions')
                    .select('*')
                    .eq('organization_id', profile.organization_id)
                    .order('name')
                    .order('version', { ascending: false });

                if (definitionsError) throw definitionsError;

                // Load workflow stages
                const stages = await workflowStageService.getWorkflowStages();
                setWorkflowStages(stages);

                // Set definitions
                setWorkflowDefinitions(definitions || []);

                // Load stage counts for each definition
                const stageCountPromises = (definitions || []).map(async (definition) => {
                    try {
                        const definitionStages = await workflowDefinitionService.getWorkflowDefinitionStages(definition.id);
                        return { definitionId: definition.id, count: definitionStages.length };
                    } catch (error) {
                        console.error(`Error loading stage count for definition ${definition.id}:`, error);
                        return { definitionId: definition.id, count: 0 };
                    }
                });

                const stageCounts = await Promise.all(stageCountPromises);
                const stageCountMap: Record<string, number> = {};
                stageCounts.forEach(({ definitionId, count }) => {
                    stageCountMap[definitionId] = count;
                });

                setDefinitionStageCounts(stageCountMap);
            } catch (error) {
                console.error('Error loading data:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load workflow definitions and stages."
                });
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [profile?.organization_id]);



    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: name === 'version' ? parseInt(value) || 1 : value
        }));
    };

    // Handle switch changes
    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormState(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    // Handle stage selection
    const handleStageSelection = (stageId: string) => {
        setSelectedStages(prev =>
            prev.includes(stageId)
                ? prev.filter(id => id !== stageId)
                : [...prev, stageId]
        );
    };

    // Open dialog for creating new definition
    const openCreateDialog = () => {
        setEditingDefinition(null);
        setFormState({
            name: '',
            version: 1,
            description: '',
            is_active: true
        });
        setSelectedStages([]);
        setIsDialogOpen(true);
    };

    // Open dialog for editing definition
    const openEditDialog = async (definition: WorkflowDefinition) => {
        setEditingDefinition(definition);
        setFormState({
            name: definition.name,
            version: definition.version,
            description: definition.description || '',
            is_active: definition.is_active
        });

        // Load selected stages for this definition
        try {
            const definitionStages = await workflowDefinitionService.getWorkflowDefinitionStages(definition.id);
            setSelectedStages(definitionStages.map(ds => ds.workflow_stage_id));
        } catch (error) {
            console.error('Error loading definition stages:', error);
            setSelectedStages([]);
        }

        setIsDialogOpen(true);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!profile?.organization_id) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "User profile not found."
            });
            return;
        }

        try {
            if (editingDefinition) {
                // Update existing definition
                const updatedDefinition = await workflowDefinitionService.updateWorkflowDefinition(
                    editingDefinition.id,
                    {
                        name: formState.name,
                        version: formState.version,
                        description: formState.description,
                        is_active: formState.is_active
                    }
                );

                if (updatedDefinition) {
                    // Update stage links
                    await workflowDefinitionService.linkStagesToDefinition(
                        editingDefinition.id,
                        selectedStages
                    );

                    // Update local state
                    setWorkflowDefinitions(prev =>
                        prev.map(def =>
                            def.id === editingDefinition.id ? updatedDefinition : def
                        )
                    );

                    // Update stage counts
                    setDefinitionStageCounts(prev => ({
                        ...prev,
                        [editingDefinition.id]: selectedStages.length
                    }));

                    toast({
                        title: "Success",
                        description: "Workflow definition updated successfully."
                    });
                } else {
                    throw new Error("Failed to update workflow definition");
                }
            } else {
                // Create new definition
                const newDefinition = await workflowDefinitionService.createWorkflowDefinition({
                    organization_id: profile.organization_id,
                    name: formState.name,
                    version: formState.version,
                    description: formState.description,
                    is_active: formState.is_active,
                    created_by: profile.id
                });

                if (newDefinition) {
                    // Link stages to the new definition
                    await workflowDefinitionService.linkStagesToDefinition(
                        newDefinition.id,
                        selectedStages
                    );

                    // Update local state
                    setWorkflowDefinitions(prev => [...prev, newDefinition]);

                    // Update stage counts
                    setDefinitionStageCounts(prev => ({
                        ...prev,
                        [newDefinition.id]: selectedStages.length
                    }));

                    toast({
                        title: "Success",
                        description: "Workflow definition created successfully."
                    });
                } else {
                    throw new Error("Failed to create workflow definition");
                }
            }

            setIsDialogOpen(false);
        } catch (error) {
            console.error('Error saving workflow definition:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: `Failed to save workflow definition: ${(error as Error).message}`
            });
        }
    };

    // Handle definition deletion
    const handleDelete = async (definitionId: string) => {
        try {
            const { error } = await supabase
                .from('workflow_definitions')
                .delete()
                .eq('id', definitionId);

            if (error) throw error;

            // Update local state
            setWorkflowDefinitions(prev => prev.filter(def => def.id !== definitionId));

            toast({
                title: "Success",
                description: "Workflow definition deleted successfully."
            });
        } catch (error) {
            console.error('Error deleting workflow definition:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete workflow definition."
            });
        }
    };

    // Handle definition duplication
    const handleDuplicate = async (definition: WorkflowDefinition) => {
        try {
            if (!profile?.organization_id) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "User profile not found."
                });
                return;
            }

            // Create new definition with incremented version
            const newDefinition = await workflowDefinitionService.createWorkflowDefinition({
                organization_id: profile.organization_id,
                name: `${definition.name} (Copy)`,
                version: definition.version + 1,
                description: definition.description,
                is_active: false, // New copies are inactive by default
                created_by: profile.id
            });

            if (newDefinition) {
                // Copy stage links from original definition
                const originalStages = await workflowDefinitionService.getWorkflowDefinitionStages(definition.id);
                const stageIds = originalStages.map(ds => ds.workflow_stage_id);

                await workflowDefinitionService.linkStagesToDefinition(
                    newDefinition.id,
                    stageIds
                );

                // Update local state
                setWorkflowDefinitions(prev => [...prev, newDefinition]);

                // Update stage counts
                setDefinitionStageCounts(prev => ({
                    ...prev,
                    [newDefinition.id]: stageIds.length
                }));

                toast({
                    title: "Success",
                    description: "Workflow definition duplicated successfully."
                });
            } else {
                throw new Error("Failed to duplicate workflow definition");
            }
        } catch (error) {
            console.error('Error duplicating workflow definition:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to duplicate workflow definition."
            });
        }
    };

    // Render stage selection
    const renderStageSelection = () => (
        <div className="space-y-4">
            <Label>Workflow Stages</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2 border rounded-lg">
                {workflowStages.map(stage => (
                    <div
                        key={stage.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedStages.includes(stage.id)
                                ? 'bg-primary/10 border-primary'
                                : 'hover:bg-muted'
                            }`}
                        onClick={() => handleStageSelection(stage.id)}
                    >
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: stage.color || '#cccccc' }}
                            />
                            <div>
                                <div className="font-medium">{stage.name}</div>
                                {stage.description && (
                                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                                        {stage.description}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                                Order: {stage.stage_order}
                            </Badge>
                            {selectedStages.includes(stage.id) ? (
                                <CheckCircle className="h-5 w-5 text-primary" />
                            ) : (
                                <XCircle className="h-5 w-5 text-muted" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading workflow definitions...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Workflow Definitions</h2>
                    <p className="text-muted-foreground">
                        Manage workflow templates for your organization
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Definition
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingDefinition ? 'Edit Workflow Definition' : 'Create Workflow Definition'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingDefinition
                                    ? 'Modify the workflow definition details and stages'
                                    : 'Create a new workflow definition template'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formState.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter workflow definition name"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="version">Version</Label>
                                        <Input
                                            id="version"
                                            name="version"
                                            type="number"
                                            min="1"
                                            value={formState.version}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="is_active">Status</Label>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="is_active"
                                                checked={formState.is_active}
                                                onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                                            />
                                            <Label htmlFor="is_active">
                                                {formState.is_active ? 'Active' : 'Inactive'}
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formState.description}
                                        onChange={handleInputChange}
                                        placeholder="Enter workflow definition description"
                                        rows={3}
                                    />
                                </div>

                                {renderStageSelection()}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingDefinition ? 'Update' : 'Create'} Definition
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Workflow Definitions</CardTitle>
                    <CardDescription>
                        Manage reusable workflow templates for your projects
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {workflowDefinitions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-muted-foreground mb-4">
                                No workflow definitions found
                            </div>
                            <Button onClick={openCreateDialog}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create First Definition
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Version</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Stages</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {workflowDefinitions.map(definition => {
                                    const stageCount = definitionStageCounts[definition.id] || 0;

                                    return (
                                        <TableRow key={definition.id}>
                                            <TableCell className="font-medium">
                                                <div>{definition.name}</div>
                                                {definition.description && (
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {definition.description}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">v{definition.version}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={definition.is_active ? "default" : "secondary"}
                                                    className={definition.is_active ? "bg-green-100 text-green-800" : ""}
                                                >
                                                    {definition.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {stageCount} stage{stageCount !== 1 ? 's' : ''}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(definition.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEditDialog(definition)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDuplicate(definition)}>
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(definition.id)}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}