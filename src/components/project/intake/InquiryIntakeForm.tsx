import React, { useState, useCallback, useEffect } from 'react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle2, Loader2, Plus, Trash2, Upload, FileText, Link, X, Check, ChevronsUpDown, Building2, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { useCustomerOrganizations } from '@/hooks/useCustomerOrganizations';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectIntakeService, ProjectIntakeData } from '@/services/projectIntakeService';
import { IntakeMappingService } from '@/services/intakeMappingService';
import { Customer, Organization, Contact } from '@/types/project';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

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
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    pointOfContacts: z.array(z.string()).optional(), // Array of contact IDs
    documents: z.array(documentItemSchema).min(2, 'At least two items required: Drawing and BOM'),
    notes: z.string().optional(),
    agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms')
});

type InquiryFormData = z.infer<typeof inquiryFormSchema>;

interface InquiryIntakeFormProps {
    submissionType: 'RFQ' | 'Purchase Order' | 'Project Idea';
    onSuccess?: (projectId: string) => void;
}

// Country code to name mapping
const COUNTRY_NAMES: Record<string, string> = {
    'US': 'United States',
    'VN': 'Vietnam',
    'JP': 'Japan',
    'CA': 'Canada',
    'MX': 'Mexico',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'CN': 'China',
    'IN': 'India',
    'AU': 'Australia'
};

// Helper function to get country code from display name
const getCountryCode = (displayName: string): string => {
    const entry = Object.entries(COUNTRY_NAMES).find(([_, name]) => name === displayName);
    return entry ? entry[0] : displayName; // Return code if found, otherwise return as-is
};

export function InquiryIntakeForm({ submissionType, onSuccess }: InquiryIntakeFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [tempProjectId, setTempProjectId] = useState<string>('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
    const [pointOfContactsOpen, setPointOfContactsOpen] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [isCreatingOrganization, setIsCreatingOrganization] = useState(false);

    // Collapsible sections state
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
        customerInfo: false,
        projectDetails: false,
        fileAttachments: false,
        additionalNotes: false,
        termsAgreement: false
    });

    const { toast } = useToast();
    const { createProject } = useProjects();
    const { organizations, loading: organizationsLoading, createOrganization } = useCustomerOrganizations();
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
            pointOfContacts: [],
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

    // Handle organization selection and auto-fill
    const handleOrganizationSelect = useCallback((organization: Organization) => {
        form.setValue('selectedCustomerId', organization.id);
        form.setValue('company', organization.name || '');

        // Auto-fill organization-level information
        const countryCode = organization.country || '';
        const countryDisplay = countryCode ? (COUNTRY_NAMES[countryCode] || countryCode) : '';
        form.setValue('country', countryDisplay);
        form.setValue('website', organization.website || '');

        // Show country dropdown if organization doesn't have country
        setShowCountryDropdown(!organization.country);

        // Show alert if organization doesn't have country information
        if (!organization.country) {
            toast({
                title: "Country Information Missing",
                description: "This organization doesn't have country information. Please select a country below.",
                variant: "destructive",
            });
        }

        // Reset point of contacts when organization changes
        form.setValue('pointOfContacts', []);
        setSelectedContacts([]);
        setCustomerSearchOpen(false);
        setCustomerSearchQuery('');

        // Clear individual contact fields - they will be auto-filled when contacts are selected
        form.setValue('customerName', '');
        form.setValue('email', '');
        form.setValue('phone', '');
    }, [form, toast]);

    // Handle country selection - update organization if needed
    const handleCountryChange = useCallback(async (countryCode: string) => {
        const selectedOrganizationId = form.getValues('selectedCustomerId');

        if (selectedOrganizationId && countryCode) {
            try {
                // Update the organization with the selected country code
                await supabase
                    .from('organizations')
                    .update({ country: countryCode } as any)
                    .eq('id', selectedOrganizationId as any);

                // Update the form to show the full country name
                const countryDisplay = COUNTRY_NAMES[countryCode] || countryCode;
                form.setValue('country', countryDisplay);

                // Hide country dropdown after selection
                setShowCountryDropdown(false);

                // Show success message
                toast({
                    title: "Organization Updated",
                    description: `Country information has been updated for this organization.`,
                });
            } catch (error) {
                console.error('Error updating organization country:', error);
                toast({
                    title: "Update Failed",
                    description: "Failed to update organization country information.",
                    variant: "destructive",
                });
            }
        }
    }, [form, toast]);

    // Toggle section collapse state
    const toggleSection = useCallback((sectionKey: string) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    }, []);

    // Handle organization creation with primary contact
    const handleCreateOrganization = useCallback(async () => {
        setIsCreatingOrganization(true);

        try {
            const formData = form.getValues();

            // Validate required fields
            if (!formData.company || !formData.customerName || !formData.email || !formData.country) {
                toast({
                    title: "Missing Required Information",
                    description: "Please fill in all required fields (Organization Name, Contact Name, Email, Country).",
                    variant: "destructive",
                });
                return;
            }

            // Create organization with primary contact
            const newOrganization = await createOrganization({
                name: formData.company,
                organization_type: 'customer',
                country: getCountryCode(formData.country),
                website: formData.website || undefined,
                description: 'Customer Organization'
            }, {
                contact_name: formData.customerName,
                email: formData.email,
                phone: formData.phone || undefined,
                role: 'primary',
                is_primary_contact: true,
                country: getCountryCode(formData.country)
            });

            // Auto-select the newly created organization
            form.setValue('selectedCustomerId', newOrganization.id);

            // Auto-fill form fields
            form.setValue('company', newOrganization.name);
            form.setValue('country', formData.country);
            form.setValue('website', newOrganization.website || '');

            // Auto-select the primary contact
            if (newOrganization.primary_contact) {
                setSelectedContacts([newOrganization.primary_contact.id]);
                form.setValue('pointOfContacts', [newOrganization.primary_contact.id]);
                form.setValue('customerName', newOrganization.primary_contact.contact_name || '');
                form.setValue('email', newOrganization.primary_contact.email || '');
                form.setValue('phone', newOrganization.primary_contact.phone || '');
            }

            // Close modal and show success
            setCreateCustomerOpen(false);

            toast({
                title: "Organization Created Successfully!",
                description: `${newOrganization.name} has been created with primary contact ${formData.customerName}.`,
            });

        } catch (error) {
            console.error('Error creating organization:', error);
            toast({
                title: "Organization Creation Failed",
                description: "There was an error creating the organization. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsCreatingOrganization(false);
        }
    }, [form, createOrganization, toast]);

    // Filter organizations based on search query
    const filteredOrganizations = React.useMemo(() => {
        if (!customerSearchQuery) return organizations;
        return organizations.filter(organization =>
            organization.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
            organization.industry?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
            organization.description?.toLowerCase().includes(customerSearchQuery.toLowerCase())
        );
    }, [organizations, customerSearchQuery]);

    // Get contacts for the selected organization
    const [organizationContacts, setOrganizationContacts] = useState<Contact[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);

    // Handle point of contact selection
    const handlePointOfContactToggle = useCallback((contactId: string) => {
        setSelectedContacts(prev => {
            const newSelected = prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId];
            form.setValue('pointOfContacts', newSelected);

            // Auto-fill contact information when a contact is selected
            if (!prev.includes(contactId)) {
                // Contact is being added (not removed)
                const selectedContact = organizationContacts.find(contact => contact.id === contactId);
                if (selectedContact) {
                    // Auto-fill the contact form fields (excluding country - use organization country only)
                    form.setValue('customerName', selectedContact.contact_name || '');
                    form.setValue('email', selectedContact.email || '');
                    form.setValue('phone', selectedContact.phone || '');
                    // Note: Country is handled separately from organization data

                    // If organization name is not set, use the contact's company name
                    if (!form.getValues('company')) {
                        form.setValue('company', selectedContact.company_name || '');
                    }
                }
            }

            return newSelected;
        });
    }, [form, organizationContacts]);

    const getOrganizationContacts = useCallback(async (organizationId: string) => {
        if (!organizationId) {
            setOrganizationContacts([]);
            return;
        }

        try {
            setLoadingContacts(true);
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .eq('organization_id', organizationId as any)
                .eq('type', 'customer' as any)
                .eq('is_active', true as any)
                .order('is_primary_contact', { ascending: false })
                .order('contact_name');

            if (error) {
                console.error('Error fetching organization contacts:', error);
                setOrganizationContacts([]);
            } else {
                setOrganizationContacts((data as any) || []);
            }
        } catch (error) {
            console.error('Error fetching organization contacts:', error);
            setOrganizationContacts([]);
        } finally {
            setLoadingContacts(false);
        }
    }, []);

    // Fetch contacts when organization changes
    useEffect(() => {
        const selectedOrganizationId = form.watch('selectedCustomerId');
        if (selectedOrganizationId) {
            getOrganizationContacts(selectedOrganizationId);
        } else {
            setOrganizationContacts([]);
        }
    }, [form.watch('selectedCustomerId'), getOrganizationContacts]);

    // Auto-select primary contact when contacts are loaded
    useEffect(() => {
        if (organizationContacts.length > 0 && selectedContacts.length === 0) {
            // Find the primary contact
            const primaryContact = organizationContacts.find(contact => contact.is_primary_contact);
            const contactToSelect = primaryContact || organizationContacts[0]; // Fallback to first contact

            if (contactToSelect) {
                // Auto-select the primary/first contact
                setSelectedContacts([contactToSelect.id]);
                form.setValue('pointOfContacts', [contactToSelect.id]);

                // Auto-fill contact information (excluding country - use organization country only)
                form.setValue('customerName', contactToSelect.contact_name || '');
                form.setValue('email', contactToSelect.email || '');
                form.setValue('phone', contactToSelect.phone || '');
                // Note: Country is handled separately from organization data
            }
        }
    }, [organizationContacts, selectedContacts.length, form]);

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
            let customerOrganizationId = data.selectedCustomerId;

            // If no organization is selected, create a new one
            if (!customerOrganizationId && data.company) {
                const newOrganization = await createOrganization({
                    name: data.company,
                    organization_type: 'customer',
                    country: getCountryCode(data.country),
                    website: data.website || undefined,
                    description: 'Customer Organization'
                });
                customerOrganizationId = newOrganization.id;
            }

            if (!customerOrganizationId) {
                throw new Error('Failed to create or select customer organization');
            }

            // Prepare intake data
            const intakeData: ProjectIntakeData = {
                title: data.projectTitle,
                description: data.description,
                customer_organization_id: customerOrganizationId,
                point_of_contacts: data.pointOfContacts && data.pointOfContacts.length > 0
                    ? data.pointOfContacts
                    : [], // Use selected contacts or empty array
                priority: data.priority,
                estimated_value: data.targetPricePerUnit && data.volumes ?
                    data.targetPricePerUnit * data.volumes.reduce((sum, v) => sum + v.qty, 0) : data.targetPricePerUnit,
                due_date: data.desiredDeliveryDate,
                contact_name: data.customerName, // From form input
                contact_email: data.email, // From form input
                contact_phone: data.phone, // From form input
                notes: data.notes,
                tags: data.intakeType === 'po' ? [data.projectReference].filter(Boolean) : undefined,
                intake_type: data.intakeType,
                intake_source: 'portal',
                // Additional fields for database
                volume: data.volumes ? JSON.stringify(data.volumes) : undefined,
                target_price_per_unit: data.targetPricePerUnit,
                desired_delivery_date: data.desiredDeliveryDate,
                project_reference: data.projectReference
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
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleSection('customerInfo')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        {collapsedSections.customerInfo ? (
                                            <ChevronRight className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                        Customer Organization
                                    </CardTitle>
                                    <CardDescription>
                                        Select an existing customer organization or create a new one for project communication
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        {!collapsedSections.customerInfo && (
                            <CardContent className="space-y-4">
                                {/* Customer Selection and Creation */}
                                <div className="flex gap-2">
                                    <FormField
                                        control={form.control}
                                        name="selectedCustomerId"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Select Existing Organization (Optional)</FormLabel>
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
                                                                    organizations.find(org => org.id === field.value)?.name || "Select organization..."
                                                                    : "Select organization..."
                                                                }
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0">
                                                        <Command>
                                                            <CommandInput
                                                                placeholder="Search organizations..."
                                                                value={customerSearchQuery}
                                                                onValueChange={setCustomerSearchQuery}
                                                            />
                                                            <CommandList>
                                                                <CommandEmpty>
                                                                    {organizationsLoading ? "Loading organizations..." : "No organizations found."}
                                                                </CommandEmpty>
                                                                <CommandGroup>
                                                                    {filteredOrganizations.map((organization) => (
                                                                        <CommandItem
                                                                            key={organization.id}
                                                                            value={organization.id}
                                                                            onSelect={() => handleOrganizationSelect(organization)}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    field.value === organization.id ? "opacity-100" : "opacity-0"
                                                                                )}
                                                                            />
                                                                            <div className="flex flex-col">
                                                                                <span className="font-medium">{organization.name}</span>
                                                                                {organization.industry && (
                                                                                    <span className="text-sm text-muted-foreground">
                                                                                        {organization.industry}
                                                                                    </span>
                                                                                )}
                                                                                {organization.description && (
                                                                                    <span className="text-sm text-muted-foreground">
                                                                                        {organization.description}
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
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setCreateCustomerOpen(true)}
                                            className="px-3"
                                        >
                                            <Building2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Point of Contacts Selection */}
                                {form.watch('selectedCustomerId') && (
                                    <FormField
                                        control={form.control}
                                        name="pointOfContacts"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Point of Contacts</FormLabel>
                                                <Popover open={pointOfContactsOpen} onOpenChange={setPointOfContactsOpen}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={pointOfContactsOpen}
                                                                className="w-full justify-between"
                                                            >
                                                                {selectedContacts.length > 0
                                                                    ? `${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''} selected`
                                                                    : "Select point of contacts..."
                                                                }
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0">
                                                        <Command>
                                                            <CommandList>
                                                                <CommandGroup>
                                                                    {loadingContacts ? (
                                                                        <CommandItem disabled>
                                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                            Loading contacts...
                                                                        </CommandItem>
                                                                    ) : organizationContacts.length === 0 ? (
                                                                        <CommandItem disabled>
                                                                            No contacts found for this organization
                                                                        </CommandItem>
                                                                    ) : (
                                                                        organizationContacts.map((contact) => (
                                                                            <CommandItem
                                                                                key={contact.id}
                                                                                value={contact.id}
                                                                                onSelect={() => handlePointOfContactToggle(contact.id)}
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        "mr-2 h-4 w-4",
                                                                                        selectedContacts.includes(contact.id) ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                                <div className="flex flex-col flex-1">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="font-medium">
                                                                                            {contact.contact_name || 'Unnamed Contact'}
                                                                                        </span>
                                                                                        {contact.is_primary_contact && (
                                                                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                                                                                                Primary
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    <span className="text-sm text-muted-foreground">
                                                                                        {contact.email || 'No email'}
                                                                                    </span>
                                                                                </div>
                                                                            </CommandItem>
                                                                        ))
                                                                    )}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                {selectedContacts.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {selectedContacts.map(contactId => {
                                                            const contact = organizationContacts.find(c => c.id === contactId);
                                                            return contact ? (
                                                                <Badge
                                                                    key={contactId}
                                                                    variant={contact.is_primary_contact ? "default" : "secondary"}
                                                                    className="text-xs"
                                                                >
                                                                    {contact.contact_name || contact.email}
                                                                    {contact.is_primary_contact && (
                                                                        <span className="ml-1 text-xs">⭐</span>
                                                                    )}
                                                                    <X
                                                                        className="ml-1 h-3 w-3 cursor-pointer"
                                                                        onClick={() => handlePointOfContactToggle(contactId)}
                                                                    />
                                                                </Badge>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

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
                                                <FormLabel>Organization Name *</FormLabel>
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country *</FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl className="flex-1">
                                                        <Input
                                                            placeholder="Country will auto-fill when organization is selected"
                                                            {...field}
                                                            readOnly={!!field.value && !showCountryDropdown}
                                                        />
                                                    </FormControl>
                                                    {showCountryDropdown && (
                                                        <Select onValueChange={(value) => {
                                                            field.onChange(value);
                                                            handleCountryChange(value);
                                                        }} value="">
                                                            <FormControl>
                                                                <SelectTrigger className="w-[200px]">
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
                                                    )}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Website</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Project Details */}
                    <Card>
                        <CardHeader
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleSection('projectDetails')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        {collapsedSections.projectDetails ? (
                                            <ChevronRight className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                        Project Details
                                    </CardTitle>
                                    <CardDescription>
                                        Provide detailed information about your manufacturing project
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        {!collapsedSections.projectDetails && (
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
                                                                placeholder="100"
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
                                                        <Select onValueChange={(value) => {
                                                            field.onChange(value);
                                                            handleCountryChange(value);
                                                        }} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select unit" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="pcs">Pieces</SelectItem>
                                                                <SelectItem value="units">Units</SelectItem>
                                                                <SelectItem value="kits">Kits</SelectItem>
                                                                <SelectItem value="assembly">Assembly</SelectItem>
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
                                                        <Select onValueChange={(value) => {
                                                            field.onChange(value);
                                                            handleCountryChange(value);
                                                        }} value={field.value}>
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
                                                <Select onValueChange={(value) => {
                                                    field.onChange(value);
                                                    handleCountryChange(value);
                                                }} value={field.value}>
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
                        )}
                    </Card>

                    {/* File Attachments */}
                    <Card>
                        <CardHeader
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleSection('fileAttachments')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        {collapsedSections.fileAttachments ? (
                                            <ChevronRight className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                        File Attachments
                                    </CardTitle>
                                    <CardDescription>
                                        Upload drawings, BOMs, and other supporting documents
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        {!collapsedSections.fileAttachments && (
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
                                                        <Select onValueChange={(value) => {
                                                            field.onChange(value);
                                                            handleCountryChange(value);
                                                        }} value={field.value}>
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
                        )}
                    </Card>

                    {/* Additional Notes */}
                    <Card>
                        <CardHeader
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleSection('additionalNotes')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        {collapsedSections.additionalNotes ? (
                                            <ChevronRight className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                        Additional Notes
                                    </CardTitle>
                                    <CardDescription>
                                        Any additional information or special requirements
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        {!collapsedSections.additionalNotes && (
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
                        )}
                    </Card>

                    {/* Terms Agreement */}
                    <Card>
                        <CardHeader
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleSection('termsAgreement')}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        {collapsedSections.termsAgreement ? (
                                            <ChevronRight className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                        Terms Agreement
                                    </CardTitle>
                                    <CardDescription>
                                        Please review and agree to our terms of service
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        {!collapsedSections.termsAgreement && (
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
                        )}
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

            {/* Create Customer Modal */}
            <Dialog open={createCustomerOpen} onOpenChange={setCreateCustomerOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Organization</DialogTitle>
                        <DialogDescription>
                            Add a new customer organization to the system. A primary contact will be automatically created and selected for this project.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Organization Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Organization Name" {...field} />
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
                                            <Input placeholder="Contact Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email *</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="email@company.com" {...field} />
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
                        <div className="grid grid-cols-2 gap-4">
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
                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateCustomerOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCreateOrganization}
                                disabled={isCreatingOrganization}
                            >
                                {isCreatingOrganization ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Organization'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
