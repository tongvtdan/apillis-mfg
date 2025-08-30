import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { Project, ProjectStatus, ProjectPriority } from '@/types/project';
import {
    ProjectEditFormSchema,
    ProjectEditFormData,
    PROJECT_CONSTRAINTS
} from '@/lib/validation/project-schemas';
import { Loader2, Save, X } from 'lucide-react';

interface EditProjectModalProps {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function EditProjectModal({ project, isOpen, onClose, onSuccess }: EditProjectModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { updateProject } = useProjects();

    // Initialize form with current project data
    const form = useForm<ProjectEditFormData>({
        resolver: zodResolver(ProjectEditFormSchema),
        defaultValues: {
            title: project.title || '',
            description: project.description || '',
            status: project.status,
            priority_level: project.priority_level,
            estimated_value: project.estimated_value || undefined,
            project_type: project.project_type || '',
            notes: project.notes || '',
            tags: project.tags || [],
        }
    });

    const handleSubmit = async (data: ProjectEditFormData) => {
        setIsSubmitting(true);

        try {
            await updateProject(project.id, {
                title: data.title,
                description: data.description || null,
                status: data.status,
                priority_level: data.priority_level,
                estimated_value: data.estimated_value || null,
                project_type: data.project_type || null,
                notes: data.notes || null,
                tags: data.tags || null,
            });

            toast({
                title: "Project Updated Successfully!",
                description: `Project "${data.title}" has been updated.`,
            });

            onSuccess?.();
            onClose();

        } catch (error) {
            console.error('Error updating project:', error);

            // Handle specific database constraint errors
            let errorMessage = "There was an error updating the project. Please try again.";

            if (error instanceof Error) {
                if (error.message.includes('duplicate key')) {
                    errorMessage = "A project with this title already exists.";
                } else if (error.message.includes('check constraint')) {
                    errorMessage = "Invalid data provided. Please check your inputs and try again.";
                } else if (error.message.includes('foreign key')) {
                    errorMessage = "Invalid reference data. Please contact support.";
                } else if (error.message.includes('not null')) {
                    errorMessage = "Required fields cannot be empty.";
                }
            }

            toast({
                variant: "destructive",
                title: "Update Error",
                description: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            form.reset();
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Edit Project
                        <Badge variant="outline" className="text-xs">
                            {project.project_id}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Update project information. All changes will be saved immediately.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Basic Information</h3>

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project Title *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter project title"
                                                maxLength={PROJECT_CONSTRAINTS.TITLE_MAX_LENGTH}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe the project requirements and specifications"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Status and Priority */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Status & Priority</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Status *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="on_hold">On Hold</SelectItem>
                                                    <SelectItem value="delayed">Delayed</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="priority_level"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Priority Level *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="urgent">Urgent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Additional Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="estimated_value"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estimated Value ($)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="project_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Type</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Manufacturing, Fabrication"
                                                    maxLength={PROJECT_CONSTRAINTS.PROJECT_TYPE_MAX_LENGTH}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Additional notes or comments about the project"
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !form.formState.isValid}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update Project
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}