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
import { Calendar, Building2, User, DollarSign, AlertCircle, CheckCircle2, Loader2, Settings, FileText, X } from 'lucide-react';
import { ProjectType, ProjectPriority, PROJECT_TYPE_LABELS, PROJECT_TYPE_DESCRIPTIONS, WorkflowDefinition } from '@/types/project';
import { useCustomerOrganizations } from '@/hooks/useCustomerOrganizations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth';
import { workflowDefinitionService } from '@/services/workflowDefinitionService';
import { projectWorkflowService } from '@/services/projectWorkflowService';
// DocumentUploader import removed - using custom file collection instead

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
    priority_level: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),

    // Customer Information
    customer_type: z.enum(['existing_org', 'new']),
    existing_customer_organization_id: z.string().optional(),

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
    workflow_definition_id: z.string().optional(),
}).refine(data => {
    // If customer_type is 'existing_org', existing_customer_organization_id is required
    if (data.customer_type === 'existing_org') {
        return !!data.existing_customer_organization_id;
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
    const [workflowDefinitions, setWorkflowDefinitions] = useState<WorkflowDefinition[]>([]);
    const [loadingWorkflowDefinitions, setLoadingWorkflowDefinitions] = useState(false);
    const [initialDocuments, setInitialDocuments] = useState<File[]>([]);
    const { organizations: customerOrganizations, loading: loadingOrganizations } = useCustomerOrganizations();

    const form = useForm<ProjectCreationFormData>({
        resolver: zodResolver(projectCreationSchema),
        defaultValues: {
            priority_level: 'normal',
            customer_type: 'existing_org',
            project_type: 'fabrication'
        }
    });

    const customerType = form.watch('customer_type');

    // Handle document upload success
    const handleDocumentUploadSuccess = useCallback((document: any) => {
        // This callback is called after document is saved to database
        console.log('Document uploaded successfully:', document);
        // Note: Documents are automatically saved by DocumentUploader to the database
        // The initialDocuments array will be populated when user selects files in the uploader
    }, []);

    // Generate project ID when modal opens
    useEffect(() => {
        if (open) {
            generateProjectId();
            loadExistingCustomers();
            loadWorkflowDefinitions();
        }
    }, [open]);

    // Load workflow definitions
    const loadWorkflowDefinitions = async () => {
        if (!profile?.organization_id) return;

        setLoadingWorkflowDefinitions(true);
        try {
            const { data, error } = await supabase
                .from('workflow_definitions')
                .select('*')
                .eq('organization_id', profile.organization_id)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setWorkflowDefinitions(data || []);
        } catch (error) {
            console.error('Error loading workflow definitions:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load workflow definitions.",
            });
        } finally {
            setLoadingWorkflowDefinitions(false);
        }
    };

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
                .select(`
                    id, 
                    contact_name, 
                    email, 
                    phone,
                    organizations!organization_id(name)
                `)
                .eq('organization_id', profile.organization_id)
                .eq('type', 'customer')
                .eq('is_active', true)
                .order('organizations(name)');

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
            let customerOrganizationId = data.existing_customer_organization_id;

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

            // Create project using workflow service
            const projectData = {
                title: data.title,
                description: data.description || null,
                customer_organization_id: customerOrganizationId,
                priority_level: data.priority_level,
                estimated_value: data.estimated_value || null,
                project_type: data.project_type,
                intake_type: 'project_idea',
                intake_source: 'manual',
                initial_documents: initialDocuments,
                contacts: []
            };

            console.log('📄 Creating project with', initialDocuments.length, 'initial documents');

            const newProject = await projectWorkflowService.createProjectWithWorkflow(projectData);

            if (!newProject) throw new Error('Failed to create project');

            toast({
                title: "Project Created",
                description: `Project ${newProject.project_id} has been created successfully.`,
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
            setInitialDocuments([]);
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
                                                    <SelectItem value="normal">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                            Normal Priority
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="high">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                                            High Priority
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="urgent">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                            Urgent Priority
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

                    {/* Workflow Definition */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Workflow Definition
                            </CardTitle>
                            <CardDescription>
                                Select a workflow template for this project
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="workflow_definition_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Workflow Template</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a workflow template" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {loadingWorkflowDefinitions ? (
                                                        <SelectItem value="loading" disabled>
                                                            <div className="flex items-center gap-2">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                Loading workflow templates...
                                                            </div>
                                                        </SelectItem>
                                                    ) : workflowDefinitions.length === 0 ? (
                                                        <SelectItem value="none" disabled>
                                                            No workflow templates found
                                                        </SelectItem>
                                                    ) : (
                                                        workflowDefinitions.map(definition => (
                                                            <SelectItem key={definition.id} value={definition.id}>
                                                                <div>
                                                                    <div className="font-medium">{definition.name}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        Version {definition.version}
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
                                Select a customer organization or individual contact
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
                                                <SelectItem value="existing_org">Customer Organization</SelectItem>
                                                <SelectItem value="existing_contact">Individual Contact</SelectItem>
                                                <SelectItem value="new">New Customer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {customerType === 'existing_org' && (
                                <FormField
                                    control={form.control}
                                    name="existing_customer_organization_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select Customer Organization *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose a customer organization" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {loadingOrganizations ? (
                                                        <SelectItem value="loading" disabled>
                                                            <div className="flex items-center gap-2">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                Loading organizations...
                                                            </div>
                                                        </SelectItem>
                                                    ) : customerOrganizations.length === 0 ? (
                                                        <SelectItem value="none" disabled>
                                                            No organizations found
                                                        </SelectItem>
                                                    ) : (
                                                        customerOrganizations.map(org => (
                                                            <SelectItem key={org.id} value={org.id}>
                                                                <div>
                                                                    <div className="font-medium">{org.name}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {org.industry} • {org.contacts?.length || 0} contacts
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

                    {/* Document Upload */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Initial Documents
                            </CardTitle>
                            <CardDescription>
                                Upload any initial documents, drawings, specifications, or other files for this project
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div
                                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const files = Array.from(e.dataTransfer.files);
                                        setInitialDocuments(prev => [...prev, ...files]);
                                    }}
                                >
                                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <div className="space-y-2">
                                        <p className="text-lg font-medium">
                                            Drop files here or{' '}
                                            <button
                                                type="button"
                                                className="text-primary hover:underline"
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.multiple = true;
                                                    input.onchange = (e) => {
                                                        const files = Array.from((e.target as HTMLInputElement).files || []);
                                                        setInitialDocuments(prev => [...prev, ...files]);
                                                    };
                                                    input.click();
                                                }}
                                            >
                                                browse
                                            </button>
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Maximum file size: 50MB per file
                                        </p>
                                    </div>
                                </div>

                                {/* File List */}
                                {initialDocuments.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Selected Files ({initialDocuments.length})</h4>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {initialDocuments.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium truncate">
                                                            {file.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                        </span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setInitialDocuments(prev => prev.filter((_, i) => i !== index));
                                                        }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
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