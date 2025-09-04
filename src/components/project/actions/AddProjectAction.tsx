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
import { Calendar, Building2, User, DollarSign, AlertCircle, CheckCircle2, Loader2, Plus, X } from 'lucide-react';
import { ProjectType, ProjectPriority, PROJECT_TYPE_LABELS, PROJECT_TYPE_DESCRIPTIONS } from '@/types/project';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Project } from '@/types/project';

// Enhanced validation schema for project creation
const projectCreationSchema = z.object({
    // Project Information
    title: z.string()
        .min(3, 'Project title must be at least 3 characters')
        .max(100, 'Project title must be less than 100 characters'),
    description: z.string()
        .max(1000, 'Description must be less than 1000 characters')
        .optional(),
    project_type: z.enum(['system_build', 'fabrication', 'manufacturing']),
    priority_level: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),

    // Customer Information
    customer_type: z.enum(['existing', 'new']),
    existing_customer_id: z.string().optional(),

    // New customer fields (only required if customer_type is 'new')
    company_name: z.string().optional(),
    contact_name: z.string().optional(),
    contact_email: z.string().email('Invalid email address').optional().or(z.literal('')),
    contact_phone: z.string().optional(),

    // Project Details
    estimated_value: z.string()
        .transform(val => val === '' ? undefined : parseFloat(val))
        .refine(val => val === undefined || val > 0, 'Value must be greater than 0')
        .optional(),
    estimated_delivery_date: z.string().optional(),

    // Additional Information
    tags: z.string().optional(),
    notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
}).refine(data => {
    // If customer_type is 'existing', existing_customer_id is required
    if (data.customer_type === 'existing') {
        return !!data.existing_customer_id;
    }
    // If customer_type is 'new', company_name and contact_name are required
    if (data.customer_type === 'new') {
        return !!data.company_name && !!data.contact_name;
    }
    return true;
}, {
    message: "Please provide required customer information",
    path: ["customer_type"]
});

type ProjectCreationFormData = z.infer<typeof projectCreationSchema>;

interface AddProjectActionProps {
    onProjectCreated?: (project: Project) => void;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showIcon?: boolean;
    children?: React.ReactNode;
}

export function AddProjectAction({
    onProjectCreated,
    variant = 'default',
    size = 'md',
    className = '',
    showIcon = true,
    children
}: AddProjectActionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedProjectId, setGeneratedProjectId] = useState<string>('');
    const [existingCustomers, setExistingCustomers] = useState<any[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    const { toast } = useToast();
    const { user, profile } = useAuth();

    const form = useForm<ProjectCreationFormData>({
        resolver: zodResolver(projectCreationSchema),
        defaultValues: {
            priority_level: 'medium',
            customer_type: 'new',
            project_type: 'fabrication'
        }
    });

    const customerType = form.watch('customer_type');

    // Generate project ID when modal opens
    useEffect(() => {
        if (isOpen) {
            generateProjectId();
            loadExistingCustomers();
        }
    }, [isOpen]);

    // Generate unique project ID
    const generateProjectId = async () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const sequence = String(Math.floor(Math.random() * 100)).padStart(2, '0');
        const projectId = `P-${year}${month}${day}${sequence}`;
        setGeneratedProjectId(projectId);
    };

    // Load existing customers
    const loadExistingCustomers = async () => {
        if (!profile?.organization_id) return;

        setLoadingCustomers(true);
        try {
            const { data, error } = await supabase
                .from('contacts')
                .select(`
                    id, 
                    company_name, 
                    contact_name, 
                    email,
                    client_organization_id,
                    client_org:client_organization_id(name)
                `)
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
    const onSubmit = async (data: ProjectCreationFormData) => {
        if (!user || !profile?.organization_id) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in to create projects.",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            let customerId: string;

            // Handle customer creation or selection
            if (data.customer_type === 'new') {
                // Create new customer
                const { data: newCustomer, error: customerError } = await supabase
                    .from('contacts')
                    .insert({
                        organization_id: profile.organization_id,
                        type: 'customer',
                        company_name: data.company_name!,
                        contact_name: data.contact_name!,
                        email: data.contact_email || null,
                        phone: data.contact_phone || null,
                        is_active: true,
                        created_by: user.id
                    })
                    .select()
                    .single();

                if (customerError) throw customerError;
                customerId = newCustomer.id;
            } else {
                // Use existing customer
                customerId = data.existing_customer_id!;
            }

            // Create project
            const projectData = {
                organization_id: profile.organization_id,
                project_id: generatedProjectId,
                title: data.title,
                description: data.description || null,
                project_type: data.project_type,
                priority_level: data.priority_level,
                customer_id: customerId,
                estimated_value: data.estimated_value || null,
                estimated_delivery_date: data.estimated_delivery_date || null,
                status: 'active' as const,
                source: 'manual',
                created_by: user.id,
                tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
                notes: data.notes || null,
                stage_entered_at: new Date().toISOString()
            };

            const { data: newProject, error: projectError } = await supabase
                .from('projects')
                .insert(projectData)
                .select(`
                    *,
                    customer:contacts(*),
                    current_stage:workflow_stages(*)
                `)
                .single();

            if (projectError) throw projectError;

            toast({
                title: "Project Created",
                description: `Project ${generatedProjectId} has been created successfully.`,
            });

            // Reset form and close modal
            form.reset();
            setIsOpen(false);

            // Notify parent component
            if (onProjectCreated) {
                onProjectCreated(newProject as Project);
            }

        } catch (error: any) {
            console.error('Error creating project:', error);

            let errorMessage = "There was an error creating the project. Please try again.";

            if (error.message.includes('duplicate key')) {
                errorMessage = "A project with this ID already exists. Please try again.";
            } else if (error.message.includes('foreign key')) {
                errorMessage = "Invalid customer reference. Please check your customer information.";
            } else if (error.message.includes('not null')) {
                errorMessage = "Required fields cannot be empty. Please check your inputs.";
            }

            toast({
                variant: "destructive",
                title: "Creation Error",
                description: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setIsOpen(false);
            form.reset();
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
                {showIcon && <Plus className="w-4 h-4" />}
                {children || 'Add Project'}
            </Button>

            {/* Project Creation Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <Card className="shadow-lg border border-border bg-base-100">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Plus className="w-5 h-5" />
                                            Create New Project
                                        </CardTitle>
                                        <CardDescription>
                                            Fill in the details below to create a new project
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
                                                {generatedProjectId}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                Generated Project ID
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
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="low">Low</SelectItem>
                                                                    <SelectItem value="medium">Medium</SelectItem>
                                                                    <SelectItem value="high">High</SelectItem>
                                                                    <SelectItem value="critical">Critical</SelectItem>
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

                                        {/* Customer Information */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <User className="w-5 h-5" />
                                                Customer Information
                                            </h3>

                                            <FormField
                                                control={form.control}
                                                name="customer_type"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Customer Type *</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="new">New Customer</SelectItem>
                                                                <SelectItem value="existing">Existing Customer</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {customerType === 'existing' ? (
                                                <FormField
                                                    control={form.control}
                                                    name="existing_customer_id"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Select Customer *</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder={loadingCustomers ? "Loading customers..." : "Select a customer"} />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {existingCustomers.map((customer) => (
                                                                        <SelectItem key={customer.id} value={customer.id}>
                                                                            <div>
                                                                                <div className="font-medium">{customer.company_name}</div>
                                                                                <div className="text-xs text-muted-foreground">
                                                                                    {customer.contact_name} • {customer.client_org?.name || 'Unknown Company'}
                                                                                </div>
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="company_name"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Company Name *</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Enter company name" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="contact_name"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Contact Name *</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Enter contact name" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="contact_email"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Contact Email</FormLabel>
                                                                <FormControl>
                                                                    <Input type="email" placeholder="Enter email address" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="contact_phone"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Contact Phone</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Enter phone number" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            )}
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
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Create Project
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
