import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Edit,
    Save,
    X,
    Check,
    AlertCircle,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, ProjectStatus, ProjectPriority } from "@/types/project";
import { projectService } from "@/services/projectService";
import { useToast } from "@/hooks/use-toast";

interface InlineProjectEditorProps {
    project: Project;
    onUpdate?: (updatedProject: Project) => void;
    className?: string;
}

interface EditableField {
    key: keyof Project;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'number';
    options?: { value: string; label: string }[];
    validation?: (value: any) => string | null;
    disabled?: boolean;
}

export function InlineProjectEditor({
    project,
    onUpdate,
    className
}: InlineProjectEditorProps) {
    const [editingField, setEditingField] = useState<keyof Project | null>(null);
    const [editValue, setEditValue] = useState<any>('');
    const [isLoading, setIsLoading] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const { toast } = useToast();

    // Editable fields configuration
    const editableFields: EditableField[] = [
        {
            key: 'title',
            label: 'Project Title',
            type: 'text',
            validation: (value) => {
                if (!value || value.trim().length === 0) return 'Title is required';
                if (value.length > 200) return 'Title must be less than 200 characters';
                return null;
            }
        },
        {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            validation: (value) => {
                if (value && value.length > 1000) return 'Description must be less than 1000 characters';
                return null;
            }
        },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'active', label: 'Active' },
                { value: 'on_hold', label: 'On Hold' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'completed', label: 'Completed' }
            ],
            validation: (value) => {
                const validStatuses = ['active', 'on_hold', 'cancelled', 'completed'];
                if (!validStatuses.includes(value)) return 'Invalid status';
                return null;
            }
        },
        {
            key: 'priority_level',
            label: 'Priority',
            type: 'select',
            options: [
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' }
            ],
            validation: (value) => {
                const validPriorities = ['low', 'medium', 'high', 'critical'];
                if (!validPriorities.includes(value)) return 'Invalid priority';
                return null;
            }
        },
        {
            key: 'estimated_value',
            label: 'Estimated Value',
            type: 'number',
            validation: (value) => {
                if (value !== null && value !== undefined && value < 0) return 'Value must be positive';
                return null;
            }
        },
        {
            key: 'notes',
            label: 'Notes',
            type: 'textarea',
            validation: (value) => {
                if (value && value.length > 2000) return 'Notes must be less than 2000 characters';
                return null;
            }
        }
    ];

    // Start editing a field
    const startEditing = (fieldKey: keyof Project) => {
        setEditingField(fieldKey);
        setEditValue(project[fieldKey] || '');
        setValidationError(null);
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingField(null);
        setEditValue('');
        setValidationError(null);
    };

    // Save field changes
    const saveField = async () => {
        if (!editingField) return;

        const field = editableFields.find(f => f.key === editingField);
        if (!field) return;

        // Validate the value
        if (field.validation) {
            const error = field.validation(editValue);
            if (error) {
                setValidationError(error);
                return;
            }
        }

        setIsLoading(true);
        setValidationError(null);

        try {
            // Prepare update data
            const updateData: Partial<Project> = {
                [editingField]: editValue
            };

            // Update project via service
            const updatedProject = await projectService.updateProject(project.id, updateData);

            // Notify parent component
            onUpdate?.(updatedProject);

            // Show success message
            toast({
                title: "Field Updated",
                description: `${field.label} has been updated successfully.`,
            });

            // Reset editing state
            setEditingField(null);
            setEditValue('');
        } catch (error) {
            console.error('Failed to update project field:', error);
            toast({
                title: "Update Failed",
                description: error instanceof Error ? error.message : "Failed to update field",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && editingField !== 'description' && editingField !== 'notes') {
            e.preventDefault();
            saveField();
        } else if (e.key === 'Escape') {
            cancelEditing();
        }
    };

    // Render field value
    const renderFieldValue = (field: EditableField) => {
        const value = project[field.key];

        if (field.type === 'select' && field.options) {
            const option = field.options.find(opt => opt.value === value);
            return (
                <Badge className={getFieldBadgeColor(field.key, value)}>
                    {option?.label || value || 'Not set'}
                </Badge>
            );
        }

        if (field.type === 'number') {
            return value ? formatCurrency(Number(value)) : 'Not set';
        }

        if (field.key === 'description' || field.key === 'notes') {
            return (
                <div className="text-sm text-muted-foreground max-w-md">
                    {value ? (
                        <span className="whitespace-pre-wrap">{String(value)}</span>
                    ) : (
                        <span className="italic">No {field.label.toLowerCase()} provided</span>
                    )}
                </div>
            );
        }

        return (
            <span className={cn(
                "text-sm",
                !value && "text-muted-foreground italic"
            )}>
                {value || `No ${field.label.toLowerCase()} set`}
            </span>
        );
    };

    // Render edit input
    const renderEditInput = (field: EditableField) => {
        if (field.type === 'textarea') {
            return (
                <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className="min-h-[80px]"
                    autoFocus
                />
            );
        }

        if (field.type === 'select' && field.options) {
            return (
                <Select value={editValue} onValueChange={setEditValue}>
                    <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        if (field.type === 'number') {
            return (
                <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value ? Number(e.target.value) : null)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    autoFocus
                />
            );
        }

        return (
            <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
                autoFocus
            />
        );
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg">Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {editableFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                            {field.label}
                        </Label>

                        {editingField === field.key ? (
                            <div className="space-y-2">
                                {renderEditInput(field)}

                                {validationError && (
                                    <div className="flex items-center space-x-1 text-sm text-red-600">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{validationError}</span>
                                    </div>
                                )}

                                <div className="flex items-center space-x-2">
                                    <Button
                                        size="sm"
                                        onClick={saveField}
                                        disabled={isLoading || !!validationError}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Check className="w-4 h-4" />
                                        )}
                                        Save
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={cancelEditing}
                                        disabled={isLoading}
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between group">
                                <div className="flex-1">
                                    {renderFieldValue(field)}
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditing(field.key)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    disabled={field.disabled}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

// Helper functions
function getFieldBadgeColor(fieldKey: keyof Project, value: any): string {
    if (fieldKey === 'status') {
        const colors = {
            active: 'bg-green-100 text-green-800',
            on_hold: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800'
        };
        return colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    }

    if (fieldKey === 'priority_level') {
        const colors = {
            low: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800'
        };
        return colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    }

    return 'bg-gray-100 text-gray-800';
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}