import React, { useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircle2, Loader2, Plus, Trash2, Upload, FileText, Link, X, Check, ChevronsUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectIntakeService, ProjectIntakeData } from '@/services/projectIntakeService';
import { IntakeMappingService } from '@/services/intakeMappingService';
import { Customer } from '@/types/project';
import { cn } from '@/lib/utils';

// Volume item schema
const volumeItemSchema = z.object({
    qty: z.number().positive('Quantity must be positive'),
    unit: z.enum(['pcs', 'units', 'kits']),
    freq: z.enum(['per year', 'per month', 'per quarter', 'prototype', 'initial', 'one_time'])
});

// Document item schema
const documentItemSchema = z.object({
    type: z.string().min(1, 'Document type is required'),
    file: z.instanceof(File).optional(),
    link: z.string().url('Invalid URL').optional(),
    uploaded: z.boolean().optional()
}).refine(data => data.file || data.link, {
    message: "Either a file or a link is required"
});

// Comprehensive validation schema
const inquiryFormSchema = z.object({
    intakeType: z.enum(['inquiry', 'rfq', 'po', 'design_idea']),
    projectTitle: z.string().min(3, 'Project title must be at least 3 characters').max(100, 'Project title cannot exceed 100 characters'),
    description: z.string().min(50, 'Description must be at least 50 characters'),
    volumes: z.array(volumeItemSchema).optional(),
    targetPricePerUnit: z.number().positive('Target price must be positive').optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    desiredDeliveryDate: z.string().refine(date => new Date(date) > new Date(Date.now() + 604800000), 'Delivery date must be at least 7 days from now'),
    projectReference: z.string().optional(), // Only for PO
    selectedCustomerId: z.string().optional(), // For customer selection
    customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
    company: z.string().min(2, 'Company name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    country: z.string().min(2, 'Country is required'),
    documents: z.array(documentItemSchema).min(2, 'At least two items required: Drawing and BOM'),
    notes: z.string().optional(),
    agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms')
});

type InquiryFormData = z.infer<typeof inquiryFormSchema>;

interface InquiryIntakeFormProps {
    submissionType: 'RFQ' | 'Purchase Order' | 'Project Idea';
    onSuccess?: (projectId: string) => void;
}

export function InquiryIntakeForm({ submissionType, onSuccess }: InquiryIntakeFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [tempProjectId, setTempProjectId] = useState<string>('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');

    const { toast } = useToast();
    const { createProject, createOrGetCustomer } = useProjects();
    const { customers, loading: customersLoading, searchCustomers } = useCustomers();
    const { profile } = useAuth();

    // Get intake mapping for this submission type
    const mapping = IntakeMappingService.getMapping(submissionType);

    // Initialize form
    const form = useForm<InquiryFormData>({
        resolver: zodResolver(inquiryFormSchema),
        defaultValues: {
            intakeType: submissionType === 'RFQ' ? 'rfq' : submissionType === 'Purchase Order' ? 'po' : 'design_idea',
            volumes: [{ qty: 1000, unit: 'pcs', freq: 'per year' }],
            priority: 'medium',
            documents: [
                { type: 'Drawing', file: undefined, link: '', uploaded: false },
                { type: 'BOM', file: undefined, link: '', uploaded: false }
            ],
            agreedToTerms: false
        }
    });

    const { fields: volumeFields, append: appendVolume, remove: removeVolume } = useFieldArray({
        control: form.control,
        name: 'volumes'
    });

    const { fields: documentFields, append: appendDocument, remove: removeDocument } = useFieldArray({
        control: form.control,
        name: 'documents'
    });

    // Handle customer selection and auto-fill
    const handleCustomerSelect = useCallback((customer: Customer) => {
        form.setValue('selectedCustomerId', customer.id);
        form.setValue('customerName', customer.contact_name || '');
        form.setValue('company', customer.company_name || '');
        form.setValue('email', customer.email || '');
        form.setValue('phone', customer.phone || '');
        form.setValue('country', customer.country || '');
        setCustomerSearchOpen(false);
        setCustomerSearchQuery('');
    }, [form]);

    // Filter customers based on search query
    const filteredCustomers = React.useMemo(() => {
        if (!customerSearchQuery) return customers;
        return customers.filter(customer =>
            customer.company_name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
            customer.contact_name?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
            customer.email?.toLowerCase().includes(customerSearchQuery.toLowerCase())
        );
    }, [customers, customerSearchQuery]);

    // Handle file upload
    const handleFileUpload = useCallback((file: File, documentIndex: number) => {
        form.setValue(`documents.${documentIndex}.file`, file);
        form.setValue(`documents.${documentIndex}.uploaded`, true);
    }, [form]);

    // Handle drag and drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            // For simplicity, add the first file to the first document slot
            handleFileUpload(files[0], 0);
        }
    }, [handleFileUpload]);

    const handleSubmit = async (data: InquiryFormData) => {
        setIsSubmitting(true);

        try {
            // Create or get customer
            const customer = await createOrGetCustomer({
                name: data.customerName,
                company: data.company,
                email: data.email,
                phone: data.phone || ''
            });

            // Check if customer creation was successful
            if (!customer || !(customer as any).id) {
                throw new Error('Failed to create or retrieve customer');
            }

            // Type assertion to ensure customer is the correct type
            const validCustomer = customer as any;

            // Prepare intake data
            const intakeData: ProjectIntakeData = {
                title: data.projectTitle,
                description: data.description,
                customer_id: validCustomer.id,
                priority: data.priority,
                estimated_value: data.targetPricePerUnit && data.volumes ?
                    data.targetPricePerUnit * data.volumes.reduce((sum, v) => sum + v.qty, 0) : undefined,
                due_date: data.desiredDeliveryDate,
                contact_name: validCustomer.contact_name || data.customerName,
                contact_email: validCustomer.email || data.email,
                contact_phone: validCustomer.phone || data.phone,
                notes: data.notes,
                intake_type: data.intakeType,
                intake_source: 'portal'
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
                description: "There was an error submitting your project. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Project Submitted Successfully!</h3>
                    <p className="text-muted-foreground mb-4">
                        Your {submissionType.toLowerCase()} has been submitted with ID: {tempProjectId}
                    </p>
                    <Badge variant="outline" className="text-sm">
                        Status: Under Review
                    </Badge>
                </CardContent>
            </Card>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Customer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                        <CardDescription>
                            Your contact details for project communication
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Customer Selection */}
                        <FormField
                            control={form.control}
                            name="selectedCustomerId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Select Existing Customer (Optional)</FormLabel>
                                    <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={customerSearchOpen}
                                                    className="w-full justify-between"
                                                >
                                                    {field.value ?
                                                        customers.find(customer => customer.id === field.value)?.company_name || "Select customer..."
                                                        : "Select customer..."
                                                    }
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput
                                                    placeholder="Search customers..."
                                                    value={customerSearchQuery}
                                                    onValueChange={setCustomerSearchQuery}
                                                />
                                                <CommandList>
                                                    <CommandEmpty>
                                                        {customersLoading ? "Loading customers..." : "No customers found."}
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {filteredCustomers.map((customer) => (
                                                            <CommandItem
                                                                key={customer.id}
                                                                value={customer.id}
                                                                onSelect={() => handleCustomerSelect(customer)}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        field.value === customer.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{customer.company_name}</span>
                                                                    {customer.contact_name && (
                                                                        <span className="text-sm text-muted-foreground">
                                                                            {customer.contact_name}
                                                                        </span>
                                                                    )}
                                                                    {customer.email && (
                                                                        <span className="text-sm text-muted-foreground">
                                                                            {customer.email}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="customerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Sarah Chen" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="TechNova Inc." {...field} />
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
                                        <FormLabel>Email *</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="sarah.chen@technova.com" {...field} />
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
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1-555-123-4567" {...field} />
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
                                            <SelectItem value="US">United States</SelectItem>
                                            <SelectItem value="VN">Vietnam</SelectItem>
                                            <SelectItem value="JP">Japan</SelectItem>
                                            <SelectItem value="CA">Canada</SelectItem>
                                            <SelectItem value="MX">Mexico</SelectItem>
                                            <SelectItem value="GB">United Kingdom</SelectItem>
                                            <SelectItem value="DE">Germany</SelectItem>
                                            <SelectItem value="FR">France</SelectItem>
                                            <SelectItem value="CN">China</SelectItem>
                                            <SelectItem value="IN">India</SelectItem>
                                            <SelectItem value="AU">Australia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Project Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                        <CardDescription>
                            Provide detailed information about your manufacturing project
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
                                        <Input placeholder="e.g., High-Precision Sensor Mount" {...field} />
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
                                            placeholder="Describe your project requirements, specifications, and any special considerations..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Volume Fields */}
                        <div className="space-y-2">
                            <FormLabel>Estimated Volume</FormLabel>
                            {volumeFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-end">
                                    <FormField
                                        control={form.control}
                                        name={`volumes.${index}.qty`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Quantity</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="1000"
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
                                            <FormItem className="flex-1">
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
                                        name={`volumes.${index}.freq`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
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
                                                        <SelectItem value="one_time">One Time Order</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {volumeFields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeVolume(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => appendVolume({ qty: 1000, unit: 'pcs', freq: 'per year' })}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Volume Tier
                            </Button>
                        </div>

                        <FormField
                            control={form.control}
                            name="targetPricePerUnit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Price (per unit)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="8.50"
                                                className="pl-8"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority *</FormLabel>
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

                            <FormField
                                control={form.control}
                                name="desiredDeliveryDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Desired Delivery Date *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                    </CardContent>
                </Card>

                {/* File Attachments */}
                <Card>
                    <CardHeader>
                        <CardTitle>File Attachments</CardTitle>
                        <CardDescription>
                            Upload drawings, BOMs, and other supporting documents
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {documentFields.map((field, index) => (
                            <div key={field.id} className="space-y-2">
                                <FormLabel>Document {index + 1}: {field.type}</FormLabel>
                                <div className="flex gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`documents.${index}.type`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select document type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Drawing">Drawing</SelectItem>
                                                        <SelectItem value="BOM">BOM</SelectItem>
                                                        <SelectItem value="Specification">Specification</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {documentFields.length > 2 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeDocument(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`documents.${index}.file`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.dwg,.step,.stp,.zip,.rar"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                field.onChange(file);
                                                                form.setValue(`documents.${index}.uploaded`, true);
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name={`documents.${index}.link`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Or provide external link</FormLabel>
                                            <FormControl>
                                                <div className="flex gap-2">
                                                    <Input placeholder="https://drive.google.com/..." {...field} />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            form.setValue(`documents.${index}.file`, undefined);
                                                            form.setValue(`documents.${index}.uploaded`, true);
                                                        }}
                                                    >
                                                        <Link className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendDocument({ type: 'Other', file: undefined, link: '', uploaded: false })}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another File or Link
                        </Button>
                    </CardContent>
                </Card>

                {/* Additional Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Notes</CardTitle>
                        <CardDescription>
                            Any additional information or special requirements
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
                                            placeholder="Any additional notes, special requirements, or considerations..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Terms Agreement */}
                <Card>
                    <CardContent className="pt-6">
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
                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                Submit {submissionType}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
