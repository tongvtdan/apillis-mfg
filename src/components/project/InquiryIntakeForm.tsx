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
import { CheckCircle2, Loader2, Upload, Link, Plus, X, File, Search, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomers } from '@/hooks/useCustomers';
import { ProjectIntakeService, ProjectIntakeData } from '@/services/projectIntakeService';
import { IntakeMappingService } from '@/services/intakeMappingService';
import { VolumeData } from '@/types/project';
import { Customer } from '@/types/project';
import { CustomerModal } from '@/components/customer/CustomerModal';

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
    intakeType: z.enum(['rfq', 'purchase_order', 'project_idea']),

    // Project details
    projectTitle: z.string().min(3, 'Project title must be at least 3 characters').max(100, 'Project title must be less than 100 characters'),
    description: z.string().min(50, 'Description must be at least 50 characters'),

    // Volume data
    volumes: z.array(volumeItemSchema).min(1, 'At least one volume entry is required'),

    // Pricing
    targetPricePerUnit: z.number().positive('Target price must be positive').optional(),

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

    // Documents
    documents: z.array(documentItemSchema).min(2, 'At least two documents required: Drawing and BOM'),

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
            intakeType: submissionType === 'RFQ' ? 'rfq' :
                submissionType === 'Purchase Order' ? 'purchase_order' : 'project_idea',
            volumes: [{ quantity: 1000, unit: 'pcs', frequency: 'per year' }],
            documents: [],
            agreedToTerms: false
        }
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
            form.setValue('country', selectedCustomer.country || '');
        }
    }, [selectedCustomer, selectedRole, form]);

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
                estimated_value: data.targetPricePerUnit ?
                    data.targetPricePerUnit * data.volumes.reduce((sum, v) => sum + v.quantity, 0) : undefined,
                due_date: data.desiredDeliveryDate,
                contact_name: customer.contact_name || data.customerName!,
                contact_email: customer.email || data.email!,
                contact_phone: customer.phone || data.phone,
                notes: data.notes,
                intake_type: data.intakeType,
                intake_source: 'portal',
                volume: data.volumes as VolumeData[],
                target_price_per_unit: data.targetPricePerUnit,
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                        <CardTitle>Submission Role</CardTitle>
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
                        <CardTitle>Project Details</CardTitle>
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

                            {volumeFields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                                    <FormField
                                        control={form.control}
                                        name={`volumes.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quantity</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="5000"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`volumes.${index}.unit`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Unit</FormLabel>
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
                                                <FormLabel>Frequency</FormLabel>
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
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                        />
                                    </FormControl>
                                    <FormMessage />
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
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
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
                                                            No customers found
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
                                                    <SelectItem value="VN">Vietnam</SelectItem>
                                                    <SelectItem value="US">United States</SelectItem>
                                                    <SelectItem value="CN">China</SelectItem>
                                                    <SelectItem value="JP">Japan</SelectItem>
                                                    <SelectItem value="KR">South Korea</SelectItem>
                                                    <SelectItem value="DE">Germany</SelectItem>
                                                    <SelectItem value="FR">France</SelectItem>
                                                    <SelectItem value="GB">United Kingdom</SelectItem>
                                                    <SelectItem value="CA">Canada</SelectItem>
                                                    <SelectItem value="AU">Australia</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
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
                        <CardTitle>Technical Documents & References</CardTitle>
                        <CardDescription>
                            Upload files or paste links to cloud storage. Supported: PDF, STEP, IGES, XLSX, DWG, SLDPRT, STL, ZIP (Max 10MB per file)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* File Upload Zone */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4">
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                        Upload files
                                    </span>
                                    <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        multiple
                                        accept=".pdf,.step,.iges,.xlsx,.dwg,.sldprt,.stl,.zip"
                                        onChange={(e) => handleFileUpload(e.target.files)}
                                    />
                                </label>
                                <p className="text-xs text-gray-500">or drag and drop</p>
                            </div>
                        </div>

                        {/* External Links */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Link className="h-4 w-4" />
                                <span className="text-sm font-medium">External Links</span>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="https://drive.google.com/..."
                                    className="flex-1"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const input = e.target as HTMLInputElement;
                                            handleExternalLink(input.value);
                                            input.value = '';
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                        handleExternalLink(input.value);
                                        input.value = '';
                                    }}
                                >
                                    Add Link
                                </Button>
                            </div>
                        </div>

                        {/* Uploaded Files Display */}
                        {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Uploaded Files:</h4>
                                <div className="space-y-1">
                                    {uploadedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            <File className="h-4 w-4" />
                                            <span>{file.name}</span>
                                            <span className="text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* External Links Display */}
                        {externalLinks.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">External Links:</h4>
                                <div className="space-y-1">
                                    {externalLinks.map((link, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            <Link className="h-4 w-4" />
                                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                {link}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-gray-500">
                            Required: At least one drawing and BOM must be provided (file or link).
                            Tip: Use ZIP for multiple related files. For large assemblies, link to Onshape or Fusion 360.
                        </p>
                    </CardContent>
                </Card>

                {/* Additional Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Notes</CardTitle>
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
                <Card>
                    <CardHeader>
                        <CardTitle>Privacy & Submission</CardTitle>
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
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            I agree to the Terms of Service and Privacy Policy
                                        </FormLabel>
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
                        disabled={isSubmitting || !form.formState.isValid}
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
                onCustomerCreated={(newCustomer) => {
                    // Refresh the customer list and select the new customer
                    if (newCustomer) {
                        form.setValue('selectedCustomerId', newCustomer.id);
                        setShowCustomerModal(false);
                    }
                }}
            />
        </Form>
    );
}
