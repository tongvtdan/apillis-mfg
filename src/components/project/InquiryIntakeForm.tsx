import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Loader2, Upload, Link, Plus, X, File, Search, Users, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomers } from '@/hooks/useCustomers';
import { ProjectIntakeService, ProjectIntakeData } from '@/services/projectIntakeService';
import { IntakeMappingService } from '@/services/intakeMappingService';
import { VolumeData } from '@/types/project';
import { Customer } from '@/types/project';
import { CustomerModal } from '@/components/customer/CustomerModal';
import { getCountryCode, getCountryName, getAvailableCountries } from '@/lib/country-mapping';

// Enhanced validation schema
const volumeItemSchema = z.object({
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.enum(['pcs', 'units', 'kits']),
    frequency: z.enum(['per year', 'per month', 'per quarter', 'prototype', 'initial'])
});

const documentItemSchema = z.object({
    type: z.string(),
    file: z.any().optional(), // Changed from z.instanceof(File) to z.any() to avoid TypeScript issues
    link: z.string().url().optional(),
    uploaded: z.boolean().optional()
}).refine(data => data.file || data.link, {
    message: "Either a file or a link is required"
});

const intakeFormSchema = z.object({
    // Role selection
    userRole: z.enum(['customer', 'sales_rep']),

    // Intake type
    intakeType: z.enum(['RFQ', 'Purchase Order', 'Project Idea']),

    // Project details
    projectTitle: z.string().min(3, 'Project title must be at least 3 characters').max(100, 'Project title must be less than 100 characters'),
    description: z.string().min(50, 'Description must be at least 50 characters'),

    // Volume data
    volumes: z.array(volumeItemSchema).min(1, 'At least one volume entry is required'),

    // Pricing
    targetPricePerUnit: z.string().optional().refine((val) => {
        if (!val || val === '') return true; // Allow empty
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
    }, 'Target price must be a positive number'),

    // Delivery
    desiredDeliveryDate: z.string().refine(date => {
        const selectedDate = new Date(date);
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 7); // Minimum 7 days from now
        return selectedDate >= minDate;
    }, 'Delivery date must be at least 7 days from now'),

    // Project reference (only for PO)
    projectReference: z.string().optional(),

    // Customer information (for customer role)
    customerName: z.string().min(2, 'Customer name must be at least 2 characters').optional(),
    companyName: z.string().min(2, 'Company name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    phone: z.string().optional(),
    country: z.string().length(2, 'Country code must be 2 characters').optional(),

    // Customer selector (for sales rep role)
    selectedCustomerId: z.string().optional(),

    // Documents - Make optional for now since UI doesn't enforce this
    documents: z.array(documentItemSchema).optional().default([]),

    // Terms
    agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),

    // Notes
    notes: z.string().optional()
}).refine(data => {
    // Validate customer information based on role
    if (data.userRole === 'customer') {
        return data.customerName && data.companyName && data.email && data.country;
    } else if (data.userRole === 'sales_rep') {
        return data.selectedCustomerId;
    }
    return true;
}, {
    message: "Please provide complete customer information",
    path: ["customerName"] // This will show the error on the customer name field
});

type IntakeFormData = z.infer<typeof intakeFormSchema>;

interface InquiryIntakeFormProps {
    submissionType: 'RFQ' | 'Purchase Order' | 'Project Idea';
    onSuccess?: (projectId: string) => void;
}

export function InquiryIntakeForm({ submissionType, onSuccess }: InquiryIntakeFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [tempProjectId, setTempProjectId] = useState<string>('');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [externalLinks, setExternalLinks] = useState<string[]>([]);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
    const [showTips, setShowTips] = useState(false);

    const { toast } = useToast();
    const { createProject, createOrGetCustomer } = useProjects();
    const { profile } = useAuth();
    const { customers, loading: loadingCustomers } = useCustomers();

    // Get intake mapping for this submission type
    const mapping = IntakeMappingService.getMapping(submissionType);

    // Initialize form
    const form = useForm<IntakeFormData>({
        resolver: zodResolver(intakeFormSchema),
        defaultValues: {
            userRole: 'customer',
            intakeType: submissionType,
            volumes: [{ quantity: 1000, unit: 'pcs', frequency: 'per year' }],
            documents: [],
            agreedToTerms: false, // Changed to false - user must explicitly agree
            // Set a default delivery date (7 days from now)
            desiredDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            // Add placeholder values for required customer fields
            projectTitle: '',
            description: '',
            customerName: '',
            companyName: '',
            email: '',
            country: ''
        },
        mode: 'onSubmit' // Validate only on submit
    });

    const { fields: volumeFields, append: appendVolume, remove: removeVolume } = useFieldArray({
        control: form.control,
        name: 'volumes'
    });

    // Watch for role changes to show/hide customer selector
    const selectedRole = form.watch('userRole');
    const selectedCustomerId = form.watch('selectedCustomerId');

    // Get selected customer data
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

    // Auto-fill customer information when customer is selected
    useEffect(() => {
        if (selectedCustomer && selectedRole === 'sales_rep') {
            form.setValue('customerName', selectedCustomer.contact_name || '');
            form.setValue('companyName', selectedCustomer.company_name || '');
            form.setValue('email', selectedCustomer.email || '');
            form.setValue('phone', selectedCustomer.phone || '');
            // Convert full country name to country code for form validation
            const countryCode = getCountryCode(selectedCustomer.country || '');
            form.setValue('country', countryCode);

            // Trigger form validation after setting values
            form.trigger(['customerName', 'companyName', 'email', 'country']);
        }
    }, [selectedCustomer, selectedRole, form]);

    // Clear customer fields when switching to customer role
    useEffect(() => {
        if (selectedRole === 'customer') {
            // Clear the selected customer ID
            form.setValue('selectedCustomerId', '');
            // Clear customer information fields to allow manual input
            form.setValue('customerName', '');
            form.setValue('companyName', '');
            form.setValue('email', '');
            form.setValue('phone', '');
            form.setValue('country', '');

            // Trigger form validation
            form.trigger(['customerName', 'companyName', 'email', 'country']);
        }
    }, [selectedRole, form]);

    // Generate temporary project ID
    useEffect(() => {
        const generateTempId = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const sequence = String(Math.floor(Math.random() * 100)).padStart(2, '0');
            return `P-${year}${month}${day}${sequence}`;
        };

        setTempProjectId(generateTempId());
    }, []);

    // Handle file upload
    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files);
        setUploadedFiles(prev => [...prev, ...newFiles]);

        // Add to form
        const currentDocs = form.getValues('documents') || [];
        newFiles.forEach(file => {
            currentDocs.push({
                type: getFileType(file.name),
                file: file,
                uploaded: false
            });
        });
        form.setValue('documents', currentDocs);
    };

    // Handle external link
    const handleExternalLink = (link: string) => {
        if (!link) return;

        setExternalLinks(prev => [...prev, link]);

        // Add to form
        const currentDocs = form.getValues('documents') || [];
        currentDocs.push({
            type: 'external',
            link: link,
            uploaded: false
        });
        form.setValue('documents', currentDocs);
    };

    // Handle document upload with type
    const handleDocumentUpload = (files: FileList | null, documentType: string) => {
        if (!files) return;

        const newFiles = Array.from(files);
        setUploadedFiles(prev => [...prev, ...newFiles]);

        // Add to form with specific type
        const currentDocs = form.getValues('documents') || [];
        newFiles.forEach(file => {
            currentDocs.push({
                type: documentType,
                file: file,
                uploaded: false
            });
        });
        form.setValue('documents', currentDocs);
    };

    // Handle document link with type
    const handleDocumentLink = (link: string, documentType: string) => {
        if (!link) return;

        setExternalLinks(prev => [...prev, link]);

        // Add to form with specific type
        const currentDocs = form.getValues('documents') || [];
        currentDocs.push({
            type: documentType,
            link: link,
            uploaded: false
        });
        form.setValue('documents', currentDocs);
    };

    // Get file type from filename
    const getFileType = (filename: string): string => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['step', 'iges', 'stl', 'dwg'].includes(ext || '')) return 'drawing';
        if (['xlsx', 'xls', 'csv'].includes(ext || '')) return 'bom';
        if (['pdf'].includes(ext || '')) return 'specification';
        return 'other';
    };

    const handleSubmit = async (data: IntakeFormData) => {
        setIsSubmitting(true);

        try {
            let customer;

            if (data.userRole === 'sales_rep' && data.selectedCustomerId) {
                // Use selected customer for sales rep
                customer = customers.find(c => c.id === data.selectedCustomerId);
                if (!customer) {
                    throw new Error('Selected customer not found');
                }
            } else {
                // Create or get customer for customer role
                customer = await createOrGetCustomer({
                    name: data.customerName!,
                    company: data.companyName!,
                    email: data.email!,
                    phone: data.phone || undefined
                });

                if (!customer) {
                    throw new Error('Failed to create or get customer');
                }
            }

            // Prepare intake data
            const intakeData: ProjectIntakeData = {
                title: data.projectTitle,
                description: data.description,
                customer_id: customer.id,
                priority: 'medium',
                estimated_value: data.targetPricePerUnit && data.targetPricePerUnit !== '' ?
                    parseFloat(data.targetPricePerUnit) * data.volumes.reduce((sum, v) => sum + v.quantity, 0) : undefined,
                due_date: data.desiredDeliveryDate,
                contact_name: customer.contact_name || data.customerName!,
                contact_email: customer.email || data.email!,
                contact_phone: customer.phone || data.phone,
                notes: data.notes,
                intake_type: data.intakeType,
                intake_source: 'portal',
                volume: data.volumes as VolumeData[],
                target_price_per_unit: data.targetPricePerUnit && data.targetPricePerUnit !== '' ? parseFloat(data.targetPricePerUnit) : undefined,
                project_reference: data.projectReference,
                desired_delivery_date: data.desiredDeliveryDate
            };

            // Create project using intake service
            const project = await ProjectIntakeService.createProjectFromIntake(
                intakeData,
                profile?.organization_id || '',
                createProject
            );

            setIsSubmitted(true);

            toast({
                title: "Project Submitted Successfully!",
                description: `Your ${submissionType.toLowerCase()} has been submitted with ID: ${project.project_id}`,
            });

            onSuccess?.(project.project_id);

        } catch (error) {
            console.error('Error submitting project:', error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "Failed to submit project. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <Card className="border-accent/30 bg-accent/5">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                        <CheckCircle2 className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-accent-foreground">Project Submitted Successfully!</CardTitle>
                    <CardDescription className="text-accent-foreground/80">
                        Your {submissionType.toLowerCase()} has been received and assigned ID: <strong>{tempProjectId}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-sm text-accent-foreground/70 mb-4">
                        You will receive email updates as your project progresses through our review process.
                    </p>
                    <Button onClick={() => window.location.reload()} variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
                        Submit Another Project
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="flex gap-6">
            {/* Vertical Progress Indicator */}
            <div className="w-24 flex-shrink-0">
                <div className="sticky top-6">
                    <ul className="steps steps-vertical w-full">
                        {/* Project Details Step */}
                        <li className={`step ${form.watch('projectTitle') && form.watch('description') && form.watch('volumes.0.quantity') > 0 ? 'step-primary' : ''}`}>
                        </li>

                        {/* Customer Information Step */}
                        <li className={`step ${(form.watch('userRole') === 'customer' && form.watch('customerName') && form.watch('companyName') && form.watch('email') && form.watch('country')) || (form.watch('userRole') === 'sales_rep' && form.watch('selectedCustomerId')) ? 'step-primary' : ''}`}>
                        </li>

                        {/* Documents Step */}
                        <li className={`step ${uploadedFiles.length > 0 || externalLinks.length > 0 ? 'step-primary' : ''}`}>
                        </li>

                        {/* Terms Step */}
                        <li className={`step ${form.watch('agreedToTerms') ? 'step-primary' : ''}`}>
                        </li>
                    </ul>

                </div>
            </div>

            {/* Main Form Content */}
            <div className="flex-1">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Form Tips - Collapsible */}
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowTips(!showTips)}
                                    className="flex items-center justify-between w-full text-left"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                        <span className="text-sm font-medium text-blue-800">Quick Tips</span>
                                    </div>
                                    <div className={`transform transition-transform duration-200 ${showTips ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </button>
                                {showTips && (
                                    <div className="mt-3 pt-3 border-t border-blue-200">
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li>• Fields marked with * are required</li>
                                            <li>• Be specific in your project description for better quotes</li>
                                            <li>• Upload technical drawings or provide cloud storage links</li>
                                            <li>• You can save as draft and return later</li>
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Project ID Display */}
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Temporary Project ID</p>
                            <p className="text-lg font-mono font-bold">{tempProjectId}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                A permanent ID will be assigned upon submission
                            </p>
                        </div>

                        {/* Intake Type Info */}
                        {mapping && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Badge variant="outline">{submissionType}</Badge>
                                        {mapping.description}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        )}

                        {/* Role Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-bold">
                                        R
                                    </div>
                                    Submission Role
                                </CardTitle>
                                <CardDescription>
                                    Select how you're submitting this project
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="userRole"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>I'm submitting as:</FormLabel>
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <input
                                                                type="radio"
                                                                value="customer"
                                                                checked={field.value === 'customer'}
                                                                onChange={() => field.onChange('customer')}
                                                                className="h-4 w-4"
                                                            />
                                                        </FormControl>
                                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                            Customer
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <input
                                                                type="radio"
                                                                value="sales_rep"
                                                                checked={field.value === 'sales_rep'}
                                                                onChange={() => field.onChange('sales_rep')}
                                                                className="h-4 w-4"
                                                            />
                                                        </FormControl>
                                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                            Sales Representative
                                                        </label>
                                                    </div>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Project Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                        1
                                    </div>
                                    Project Details
                                </CardTitle>
                                <CardDescription>
                                    Provide details about your manufacturing project or requirements.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="projectTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Title *</FormLabel>
                                            <FormControl>
                                                <Input placeholder={`Enter ${submissionType.toLowerCase()} title`} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-muted-foreground">
                                                    Must be 3-100 characters. Be specific and descriptive.
                                                </p>
                                                <span className={`text-xs ${field.value.length < 3 ? 'text-red-500' :
                                                    field.value.length > 100 ? 'text-red-500' : 'text-green-500'
                                                    }`}>
                                                    {field.value.length}/100
                                                </span>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description *</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe your project requirements, materials, quantities, specifications, etc."
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-muted-foreground">
                                                    Must be at least 50 characters. Include technical specifications, materials, tolerances, and any special requirements.
                                                </p>
                                                <span className={`text-xs ${field.value.length < 50 ? 'text-red-500' : 'text-green-500'
                                                    }`}>
                                                    {field.value.length}/50
                                                </span>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {/* Volume Fields */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Estimated Volume *</FormLabel>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => appendVolume({ quantity: 1000, unit: 'pcs', frequency: 'per year' })}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Volume
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        At least one volume entry is required. Add multiple entries for different phases or products.
                                    </p>

                                    {volumeFields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                                            <FormField
                                                control={form.control}
                                                name={`volumes.${index}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Quantity *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="5000"
                                                                min="1"
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                        <p className="text-xs text-muted-foreground">
                                                            Must be greater than 0
                                                        </p>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`volumes.${index}.unit`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Unit *</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select unit" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="pcs">Pieces</SelectItem>
                                                                <SelectItem value="units">Units</SelectItem>
                                                                <SelectItem value="kits">Kits</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`volumes.${index}.frequency`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Frequency *</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select frequency" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="per year">Per Year</SelectItem>
                                                                <SelectItem value="per month">Per Month</SelectItem>
                                                                <SelectItem value="per quarter">Per Quarter</SelectItem>
                                                                <SelectItem value="prototype">Prototype</SelectItem>
                                                                <SelectItem value="initial">Initial Order</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="flex items-end">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeVolume(index)}
                                                    disabled={volumeFields.length === 1}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Target Price */}
                                <FormField
                                    control={form.control}
                                    name="targetPricePerUnit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Target Price (per unit)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="8.50"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <p className="text-xs text-muted-foreground">
                                                Optional. Helps us provide more accurate quotes and recommendations.
                                            </p>
                                        </FormItem>
                                    )}
                                />

                                {/* Project Reference (only for PO) */}
                                {submissionType === 'Purchase Order' && (
                                    <FormField
                                        control={form.control}
                                        name="projectReference"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Project Reference</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="PO-2025-TECHNOVA-001" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {/* Desired Delivery Date */}
                                <FormField
                                    control={form.control}
                                    name="desiredDeliveryDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Desired Delivery Date *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <p className="text-xs text-muted-foreground">
                                                Must be at least 7 days from today. Earlier dates may require rush fees.
                                            </p>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                        2
                                    </div>
                                    Customer Information
                                </CardTitle>
                                <CardDescription>
                                    {selectedRole === 'sales_rep'
                                        ? 'Select the customer for this project'
                                        : 'Tell us about your company and the primary contact for this project.'
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedRole === 'sales_rep' ? (
                                    // Sales Rep Customer Selector
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="selectedCustomerId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Select Customer *</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={loadingCustomers ? "Loading customers..." : "Search or select existing customer"} />
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
                                                            ) : customers.length === 0 ? (
                                                                <SelectItem value="none" disabled>
                                                                    <div className="flex items-center gap-2">
                                                                        <Users className="h-4 w-4" />
                                                                        No customers found
                                                                    </div>
                                                                </SelectItem>
                                                            ) : (
                                                                customers.map(customer => (
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
                                                    <p className="text-xs text-muted-foreground">
                                                        Select an existing customer or create a new one below.
                                                    </p>
                                                </FormItem>
                                            )}
                                        />

                                        {/* Create New Customer Button */}
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowCustomerModal(true)}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create New Customer
                                            </Button>
                                            <span className="text-xs text-muted-foreground">
                                                Can't find the customer? Create a new one.
                                            </span>
                                        </div>

                                        {/* Selected Customer Details */}
                                        {selectedCustomer && (
                                            <div className="p-4 border rounded-lg bg-muted/50">
                                                <h4 className="font-medium mb-2">Selected Customer Details:</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                    <div><strong>Company:</strong> {selectedCustomer.company_name}</div>
                                                    <div><strong>Contact:</strong> {selectedCustomer.contact_name}</div>
                                                    <div><strong>Email:</strong> {selectedCustomer.email}</div>
                                                    <div><strong>Phone:</strong> {selectedCustomer.phone || 'Not provided'}</div>
                                                    <div><strong>Country:</strong> {selectedCustomer.country || 'Not provided'}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Regular Customer Information Fields
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="companyName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Company Name *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter company name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                        <p className="text-xs text-muted-foreground">
                                                            Must be at least 2 characters. Your company or organization name.
                                                        </p>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="customerName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Contact Name *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter contact person name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                        <p className="text-xs text-muted-foreground">
                                                            Must be at least 2 characters. Primary contact for this project.
                                                        </p>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email Address *</FormLabel>
                                                        <FormControl>
                                                            <Input type="email" placeholder="Enter email address" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                        <p className="text-xs text-muted-foreground">
                                                            Valid email address required for project communications.
                                                        </p>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone Number</FormLabel>
                                                        <FormControl>
                                                            <Input type="tel" placeholder="Enter phone number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                        <p className="text-xs text-muted-foreground">
                                                            Optional. Include country code for international numbers.
                                                        </p>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="country"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Country *</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select country" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {getAvailableCountries().map(({ code, name }) => (
                                                                <SelectItem key={code} value={code}>
                                                                    {name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                    <p className="text-xs text-muted-foreground">
                                                        Required for shipping and compliance purposes.
                                                    </p>
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Technical Documents */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                        3
                                    </div>
                                    Technical Documents & References
                                </CardTitle>
                                <CardDescription>
                                    Upload files or paste links to cloud storage. Supported: PDF, STEP, IGES, XLSX, DWG, SLDPRT, STL, ZIP (Max 10MB per file)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Document Categories */}
                                <div className="space-y-4">
                                    {/* Engineering Drawings */}
                                    <div className="border rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <input type="checkbox" className="h-4 w-4" />
                                            <span className="font-medium">Engineering Drawings (2D/3D) *</span>
                                        </div>
                                        <div className="ml-6 space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    type="file"
                                                    accept=".step,.iges,.stl,.dwg,.sldprt,.pdf"
                                                    className="flex-1"
                                                    onChange={(e) => handleDocumentUpload(e.target.files, 'drawing')}
                                                />
                                                <span className="text-sm text-muted-foreground self-center">OR</span>
                                                <Input
                                                    placeholder="https://drive.google.com/..."
                                                    className="flex-1"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const input = e.target as HTMLInputElement;
                                                            handleDocumentLink(input.value, 'drawing');
                                                            input.value = '';
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Supported: STEP, IGES, STL, DWG, SLDPRT, PDF
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bill of Materials */}
                                    <div className="border rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <input type="checkbox" className="h-4 w-4" />
                                            <span className="font-medium">Bill of Materials (BOM) *</span>
                                        </div>
                                        <div className="ml-6 space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    type="file"
                                                    accept=".xlsx,.xls,.csv"
                                                    className="flex-1"
                                                    onChange={(e) => handleDocumentUpload(e.target.files, 'bom')}
                                                />
                                                <span className="text-sm text-muted-foreground self-center">OR</span>
                                                <Input
                                                    placeholder="https://share.onshape.com/..."
                                                    className="flex-1"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const input = e.target as HTMLInputElement;
                                                            handleDocumentLink(input.value, 'bom');
                                                            input.value = '';
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Supported: XLSX, XLS, CSV
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quality Specifications */}
                                    <div className="border rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <input type="checkbox" className="h-4 w-4" />
                                            <span className="font-medium">Quality Specifications</span>
                                        </div>
                                        <div className="ml-6 space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    className="flex-1"
                                                    onChange={(e) => handleDocumentUpload(e.target.files, 'quality_specs')}
                                                />
                                                <span className="text-sm text-muted-foreground self-center">OR</span>
                                                <Input
                                                    placeholder="https://drive.google.com/..."
                                                    className="flex-1"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const input = e.target as HTMLInputElement;
                                                            handleDocumentLink(input.value, 'quality_specs');
                                                            input.value = '';
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Quality requirements, testing procedures, etc.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Compliance Documents */}
                                    <div className="border rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <input type="checkbox" className="h-4 w-4" />
                                            <span className="font-medium">Compliance Docs (ISO, RoHS, etc.)</span>
                                        </div>
                                        <div className="ml-6 space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    className="flex-1"
                                                    onChange={(e) => handleDocumentUpload(e.target.files, 'compliance')}
                                                />
                                                <span className="text-sm text-muted-foreground self-center">OR</span>
                                                <Input
                                                    placeholder="https://drive.google.com/..."
                                                    className="flex-1"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const input = e.target as HTMLInputElement;
                                                            handleDocumentLink(input.value, 'compliance');
                                                            input.value = '';
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                ISO standards, RoHS compliance, certifications, etc.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Add Another Document Button */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAddDocumentModal(true)}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Another File or Link
                                </Button>

                                {/* Uploaded Documents Summary */}
                                {uploadedFiles.length > 0 || externalLinks.length > 0 ? (
                                    <div className="border rounded-lg p-4 bg-muted/50">
                                        <h4 className="font-medium mb-3">Uploaded Documents Summary:</h4>
                                        <div className="space-y-2">
                                            {uploadedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm">
                                                    <File className="h-4 w-4" />
                                                    <span>{file.name}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {getFileType(file.name)}
                                                    </Badge>
                                                    <span className="text-muted-foreground">
                                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                    </span>
                                                </div>
                                            ))}
                                            {externalLinks.map((link, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm">
                                                    <Link className="h-4 w-4" />
                                                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                        {link}
                                                    </a>
                                                    <Badge variant="outline" className="text-xs">
                                                        external
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm text-amber-700">
                                        <strong>⚠️ Required:</strong> At least one drawing and BOM must be provided (file or link).
                                    </p>
                                    <p className="text-xs text-amber-600 mt-1">
                                        Tip: Use ZIP for multiple related files. For large assemblies, link to Onshape or Fusion 360.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-bold">
                                        N
                                    </div>
                                    Additional Notes
                                </CardTitle>
                                <CardDescription>
                                    Any additional information, special requirements, or notes...
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter any additional notes..."
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

                        {/* Terms & Conditions */}
                        <Card className="border-orange-200 bg-orange-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-orange-800">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 text-white text-sm font-bold">
                                        4
                                    </div>
                                    Terms of Service & Privacy Policy
                                </CardTitle>
                                <CardDescription className="text-orange-700">
                                    Please read and agree to our terms before submitting your project.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="agreedToTerms"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="mt-1"
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-orange-800 font-medium">
                                                    I agree to the Terms of Service and Privacy Policy *
                                                </FormLabel>
                                                <p className="text-sm text-orange-700">
                                                    By checking this box, you confirm that you have read and agree to our
                                                    <a href="/terms" target="_blank" className="underline hover:text-orange-800"> Terms of Service</a> and
                                                    <a href="/privacy" target="_blank" className="underline hover:text-orange-800"> Privacy Policy</a>.
                                                </p>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline">
                                Save as Draft
                            </Button>
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isSubmitting}
                                className="min-w-[200px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    `Submit ${submissionType}`
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Customer Modal for creating new customers */}
                    <CustomerModal
                        open={showCustomerModal}
                        onClose={() => setShowCustomerModal(false)}
                        customer={null}
                    />

                    {/* Add Document Modal */}
                    {showAddDocumentModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                                <h3 className="text-lg font-medium mb-4">Add Additional Document</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Document Type</label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select document type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="drawing">Engineering Drawing</SelectItem>
                                                <SelectItem value="bom">Bill of Materials</SelectItem>
                                                <SelectItem value="quality_specs">Quality Specifications</SelectItem>
                                                <SelectItem value="compliance">Compliance Documents</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Upload File</label>
                                        <Input
                                            type="file"
                                            accept=".pdf,.step,.iges,.xlsx,.dwg,.sldprt,.stl,.zip,.doc,.docx"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Or Add Link</label>
                                        <Input placeholder="https://drive.google.com/..." />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAddDocumentModal(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button className="flex-1">
                                        Add Document
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Form>
            </div>
        </div>
    );
}
