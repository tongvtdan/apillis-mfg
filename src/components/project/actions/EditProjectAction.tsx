import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Building2, User, DollarSign, AlertCircle, CheckCircle2, Loader2, Edit, X } from 'lucide-react';
import { ProjectType, ProjectPriority, PROJECT_TYPE_LABELS, PROJECT_TYPE_DESCRIPTIONS } from '@/types/project';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Project } from '@/types/project';

// Enhanced validation schema for project editing
const projectEditSchema = z.object({
    // Project Information
    title: z.string()
        .min(3, 'Project title must be at least 3 characters')
        .max(100, 'Project title must be less than 100 characters'),
    description: z.string()
        .max(1000, 'Description must be less than 1000 characters')
        .optional(),
    project_type: z.enum(['system_build', 'fabrication', 'manufacturing']),
    priority_level: z.enum(['low', 'medium', 'high', 'critical']),
    status: z.enum(['active', 'on_hold', 'cancelled', 'completed']),

    // Customer Information
    customer_id: z.string().optional(),

    // Project Details
    estimated_value: z.string()
        .transform(val => val === '' ? undefined : parseFloat(val))
        .refine(val => val === undefined || val > 0, 'Value must be greater than 0')
        .optional(),
    estimated_delivery_date: z.string().optional(),

    // Additional Information
    tags: z.string().optional(),
    notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

type ProjectEditFormData = z.infer<typeof projectEditSchema>;

interface EditProjectActionProps {
    project: Project;
    onProjectUpdated?: (project: Project) => void;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showIcon?: boolean;
    children?: React.ReactNode;
}

export function EditProjectAction({
    project,
    onProjectUpdated,
    variant = 'outline',
    size = 'md',
    className = '',
    showIcon = true,
    children
}: EditProjectActionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingCustomers, setExistingCustomers] = useState<any[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    const { toast } = useToast();
    const { user, profile } = useAuth();

    const form = useForm<ProjectEditFormData>({
        resolver: zodResolver(projectEditSchema),
        defaultValues: {
            title: project.title || '',
            description: project.description || '',
            project_type: project.project_type || 'fabrication',
            priority_level: project.priority_level || 'medium',
            status: project.status || 'active',
            customer_organization_id: project.customer_organization_id || '',
            estimated_value: project.estimated_value?.toString() || '',
            estimated_delivery_date: project.estimated_delivery_date || '',
            tags: project.tags?.join(', ') || '',
            notes: project.notes || '',
        }
    });

    // Load existing customers when modal opens
    useEffect(() => {
        if (isOpen) {
            loadExistingCustomers();
        }
    }, [isOpen]);

    // Load existing customers
    const loadExistingCustomers = async () => {
        if (!profile?.organization_id) return;

        setLoadingCustomers(true);
        try {
            const { data, error } = await supabase
                .from('contacts')
                .select('id, company_name, contact_name, email')
                .eq('organization_id', profile.organization_id)
                .eq('type', 'customer')
                .eq('is_active', true)
                .order('company_name');

            if (error) throw error;
            setExistingCustomers(data || []);
        } catch (error) {
            console.error('Error loading customers:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load existing customers.",
            });
        } finally {
            setLoadingCustomers(false);
        }
    };

    // Handle form submission
    const onSubmit = async (data: ProjectEditFormData) => {
        if (!user || !profile?.organization_id) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in to edit projects.",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare update data
            const updateData = {
                title: data.title,
                description: data.description || null,
                project_type: data.project_type,
                priority_level: data.priority_level,
                status: data.status,
                customer_id: data.customer_id || null,
                estimated_value: data.estimated_value || null,
                estimated_delivery_date: data.estimated_delivery_date || null,
                tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
                notes: data.notes || null,
                updated_at: new Date().toISOString()
            };

            const { data: updatedProject, error: projectError } = await supabase
                .from('projects')
                .update(updateData)
                .eq('id', project.id)
                .select(`
                    *,
                    customer:contacts(*),
                    current_stage:workflow_stages(*)
                `)
                .single();

            if (projectError) throw projectError;

            toast({
                title: "Project Updated",
                description: `Project "${data.title}" has been updated successfully.`,
            });

            // Close modal
            setIsOpen(false);

            // Notify parent component
            if (onProjectUpdated) {
                onProjectUpdated(updatedProject as Project);
            }

        } catch (error: any) {
            console.error('Error updating project:', error);

            let errorMessage = "There was an error updating the project. Please try again.";

            if (error.message.includes('duplicate key')) {
                errorMessage = "A project with this title already exists. Please try again.";
            } else if (error.message.includes('foreign key')) {
                errorMessage = "Invalid customer reference. Please check your customer information.";
            } else if (error.message.includes('not null')) {
                errorMessage = "Required fields cannot be empty. Please check your inputs.";
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
            setIsOpen(false);
            // Reset form to original values
            form.reset({
                title: project.title || '',
                description: project.description || '',
                project_type: project.project_type || 'fabrication',
                priority_level: project.priority_level || 'medium',
                status: project.status || 'active',
                customer_organization_id: project.customer_organization_id || '',
                estimated_value: project.estimated_value?.toString() || '',
                estimated_delivery_date: project.estimated_delivery_date || '',
                tags: project.tags?.join(', ') || '',
                notes: project.notes || '',
            });
        }
    };

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                variant={variant}
                size={size}
                className={`flex items-center gap-2 ${className}`}
            >
                {showIcon && <Edit className="w-4 h-4" />}
                {children || 'Edit Project'}
            </Button>

            {/* Project Edit Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-background/95 backdrop-blur-lg flex items-center justify-center p-4 z-50">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Edit className="w-5 h-5" />
                                            Edit Project
                                        </CardTitle>
                                        <CardDescription>
                                            Update the project details below
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClose}
                                        disabled={isSubmitting}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        {/* Project ID Display */}
                                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                            <Badge variant="outline" className="font-mono">
                                                {project.project_id}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                Project ID
                                            </span>
                                        </div>

                                        {/* Project Information */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <Building2 className="w-5 h-5" />
                                                Project Information
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="title"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Project Title *</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Enter project title" {...field} />
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
                                                            <FormLabel>Project Type *</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select project type" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {Object.entries(PROJECT_TYPE_LABELS).map(([key, label]) => (
                                                                        <SelectItem key={key} value={key}>
                                                                            {label}
                                                                        </SelectItem>
                                                                    ))}
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
                                                            <FormLabel>Priority Level</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="low">Low</SelectItem>
                                                                    <SelectItem value="normal">Normal</SelectItem>
                                                                    <SelectItem value="high">High</SelectItem>
                                                                    <SelectItem value="urgent">Urgent</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="status"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Status</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="active">Active</SelectItem>
                                                                    <SelectItem value="on_hold">On Hold</SelectItem>
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
                                                    name="estimated_value"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Estimated Value</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(e.target.value)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="customer_id"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Customer</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder={loadingCustomers ? "Loading customers..." : "Select a customer"} />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="">No Customer</SelectItem>
                                                                    {existingCustomers.map((customer) => (
                                                                        <SelectItem key={customer.id} value={customer.id}>
                                                                            {customer.company_name} - {customer.contact_name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Description</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Enter project description"
                                                                className="min-h-[100px]"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <Separator />

                                        {/* Additional Information */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <DollarSign className="w-5 h-5" />
                                                Additional Information
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="estimated_delivery_date"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Estimated Delivery Date</FormLabel>
                                                            <FormControl>
                                                                <Input type="date" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="tags"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Tags</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Enter tags separated by commas" {...field} />
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
                                                                placeholder="Enter additional notes"
                                                                className="min-h-[80px]"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-end gap-3 pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleClose}
                                                disabled={isSubmitting}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex items-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Update Project
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </>
    );
}
