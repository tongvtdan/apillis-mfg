import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Building2, User, DollarSign, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ProjectType, ProjectPriority, PROJECT_TYPE_LABELS, PROJECT_TYPE_DESCRIPTIONS } from '@/types/project';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

interface EnhancedProjectCreationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProjectCreated?: (project: any) => void;
}

export function EnhancedProjectCreationModal({
    open,
    onOpenChange,
    onProjectCreated
}: EnhancedProjectCreationModalProps) {
    const { toast } = useToast();
    const { user, profile } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedProjectId, setGeneratedProjectId] = useState<string>('');
    const [existingCustomers, setExistingCustomers] = useState<any[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

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
        if (open) {
            generateProjectId();
            loadExistingCustomers();
        }
    }, [open]);

    // Generate unique project ID
    const generateProjectId = async () => {
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');

            // Get the count of projects created today to generate sequence
            const startOfDay = new Date(year, now.getMonth(), now.getDate()).toISOString();
            const endOfDay = new Date(year, now.getMonth(), now.getDate() + 1).toISOString();

            const { count } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfDay)
                .lt('created_at', endOfDay);

            const sequence = String((count || 0) + 1).padStart(2, '0');
            const projectId = `P-${year}${month}${day}${sequence}`;

            setGeneratedProjectId(projectId);
        } catch (error) {
            console.error('Error generating project ID:', error);
            // Fallback to random sequence
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const sequence = String(Math.floor(Math.random() * 100)).padStart(2, '0');
            setGeneratedProjectId(`P-${year}${month}${day}${sequence}`);
        }
    };

    // Load existing customers
    const loadExistingCustomers = async () => {
        if (!profile?.organization_id) return;

        setLoadingCustomers(true);
        try {
            const { data, error } = await supabase
                .from('contacts')
                .select('id, company_name, contact_name, email, phone')
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
    const onSubmit = async (data: ProjectCreationFormData) => {
        if (!user || !profile?.organization_id) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in to create a project.",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            let customerId = data.existing_customer_id;

            // Create new customer if needed
            if (data.customer_type === 'new') {
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
                // Set to first workflow stage (will be handled by database trigger or application logic)
                current_stage_id: null, // Will be set by the system
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
            onOpenChange(false);

            // Notify parent component
            if (onProjectCreated) {
                onProjectCreated(newProject);
            }

        } catch (error: any) {
            console.error('Error creating project:', error);

            let errorMessage = "Failed to create project. Please try again.";

            if (error.code === '23505') {
                errorMessage = "A project with this ID already exists. Please try again.";
                generateProjectId(); // Generate new ID
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast({
                variant: "destructive",
                title: "Creation Failed",
                description: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            form.reset();
            setGeneratedProjectId('');
        }
    }, [open, form]);

    return (
        <Modal
            isOpen={open}
            onClose={() => onOpenChange(false)}
            title={
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Create New Project
                </div>
            }
            maxWidth="max-w-4xl"
        >

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Project ID Display */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Project ID</CardTitle>
                                    <CardDescription>Auto-generated unique identifier</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-lg font-mono px-3 py-1">
                                    {generatedProjectId || 'Generating...'}
                                </Badge>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Project Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Project Information
                            </CardTitle>
                            <CardDescription>
                                Basic information about the project
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Title *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter project title"
                                                    {...field}
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
                                                            <div>
                                                                <div className="font-medium">{label}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {PROJECT_TYPE_DESCRIPTIONS[key as ProjectType]}
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
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe the project requirements, specifications, or objectives..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                    <SelectItem value="low">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                            Low Priority
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="medium">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                            Medium Priority
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="high">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                                            High Priority
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="critical">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                            Critical Priority
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                                <Input
                                                    placeholder="Enter tags separated by commas"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Customer Information
                            </CardTitle>
                            <CardDescription>
                                Select an existing customer or create a new one
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="customer_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="existing">Existing Customer</SelectItem>
                                                <SelectItem value="new">New Customer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {customerType === 'existing' && (
                                <FormField
                                    control={form.control}
                                    name="existing_customer_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select Customer *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose an existing customer" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {loadingCustomers ? (
                                                        <SelectItem value="loading" disabled>
                                                            <div className="flex items-center gap-2">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                Loading customers...
                                                            </div>
                                                        </SelectItem>
                                                    ) : existingCustomers.length === 0 ? (
                                                        <SelectItem value="none" disabled>
                                                            No customers found
                                                        </SelectItem>
                                                    ) : (
                                                        existingCustomers.map(customer => (
                                                            <SelectItem key={customer.id} value={customer.id}>
                                                                <div>
                                                                    <div className="font-medium">{customer.company_name}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {customer.contact_name} • {customer.email}
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {customerType === 'new' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="company_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company Name *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter company name"
                                                        {...field}
                                                    />
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
                                                    <Input
                                                        placeholder="Enter contact person name"
                                                        {...field}
                                                    />
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
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="Enter email address"
                                                        {...field}
                                                    />
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
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="tel"
                                                        placeholder="Enter phone number"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Project Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Project Details
                            </CardTitle>
                            <CardDescription>
                                Financial and timeline information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="estimated_delivery_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estimated Delivery Date</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
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
                                        <FormLabel>Additional Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Any additional information, special requirements, or notes..."
                                                className="min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !generatedProjectId}
                            className="min-w-[120px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Create Project
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </Modal>
    );
}