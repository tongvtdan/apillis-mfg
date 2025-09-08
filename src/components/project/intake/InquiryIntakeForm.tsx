import React, { useState, useCallback, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogOverlay } from '@/components/ui/dialog';
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
import { CustomerModal } from '@/components/customer/CustomerModal';
import { ContactModal } from '@/components/customer/ContactModal';

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
    link: z.string().optional(),
    uploaded: z.boolean().optional()
}).refine(data => {
    // Either file or link is required, but not both
    const hasFile = data.file && data.file instanceof File;
    const hasLink = data.link && data.link.trim().length > 0;
    return hasFile || hasLink;
}, {
    message: "Either a file upload or a link is required"
}).refine(data => {
    // If link is provided, it should be a valid URL
    if (data.link && data.link.trim().length > 0) {
        try {
            new URL(data.link);
            return true;
        } catch {
            return false;
        }
    }
    return true;
}, {
    message: "Link must be a valid URL"
});

// Comprehensive validation schema
const inquiryFormSchema = z.object({
    intakeType: z.enum(['inquiry', 'rfq', 'po', 'design_idea']),
    projectTitle: z.string().min(3, 'Project title must be at least 3 characters').max(100, 'Project title cannot exceed 100 characters'),
    description: z.string().min(50, 'Description must be at least 50 characters'),
    volumes: z.array(volumeItemSchema).optional(),
    targetPricePerUnit: z.number().positive('Target price must be positive').optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    desiredDeliveryDate: z.string().refine(date => new Date(date) > new Date(Date.now() + 604800000), 'Delivery date must be at least 7 days from now'),
    projectReference: z.string().optional(), // Only for PO
    selectedCustomerId: z.string().optional(), // For customer selection
    customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
    company: z.string().min(2, 'Company name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    country: z.string().optional(),
    website: z.string().optional(),
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

export function InquiryIntakeForm({ submissionType, onSuccess }: InquiryIntakeFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [tempProjectId, setTempProjectId] = useState<string>('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [isGeneratingId, setIsGeneratingId] = useState(true);
    const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
    const [pointOfContactsOpen, setPointOfContactsOpen] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [isCreatingContact, setIsCreatingContact] = useState(false);
    const [isCreatingContactDialogOpen, setIsCreatingContactDialogOpen] = useState(false);
    const [isSubmittingContact, setIsSubmittingContact] = useState(false);
    const [documentModes, setDocumentModes] = useState<Record<number, 'none' | 'file' | 'link'>>({});


    // Contact creation form state
    const [contactFormData, setContactFormData] = useState({
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        contactRole: 'general',
        contactAddress: '',
        contactCity: '',
        contactState: '',
        contactPostalCode: '',
        contactWebsite: '',
        contactNotes: '',
        isPrimaryContact: false
    });

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
    const { customers: organizations, loading: organizationsLoading, createOrganization, refetch } = useCustomerOrganizations();
    const { profile } = useAuth();

    // Function to save project documents
    const saveProjectDocuments = async (projectId: string, documents: any[], organizationId: string) => {
        try {
            for (const doc of documents) {
                if (doc.file && doc.file instanceof File) {
                    // Upload file to storage
                    const fileName = `${projectId}/${Date.now()}_${doc.file.name}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('documents')
                        .upload(fileName, doc.file);

                    if (uploadError) {
                        console.error('Error uploading file:', uploadError);
                        continue;
                    }

                    // Get public URL
                    const { data: urlData } = supabase.storage
                        .from('documents')
                        .getPublicUrl(fileName);

                    // Create document record
                    const { data: documentData, error: docError } = await supabase
                        .from('documents')
                        .insert({
                            organization_id: organizationId,
                            project_id: projectId,
                            title: `${doc.type} - ${doc.file.name}`,
                            description: `Uploaded ${doc.type} document`,
                            file_name: fileName,
                            file_path: fileName,
                            file_size: doc.file.size,
                            mime_type: doc.file.type,
                            category: doc.type.toLowerCase().replace(' ', '_'),
                            version: 1,
                            is_current_version: true,
                            storage_provider: 'supabase',
                            access_level: 'organization',
                            tags: [doc.type.toLowerCase()],
                            uploaded_by: profile?.id,
                            metadata: {
                                original_file_name: doc.file.name,
                                upload_source: 'intake_form'
                            }
                        } as any)
                        .select()
                        .single();

                    if (docError) {
                        console.error('Error creating document record:', docError);
                        // Clean up uploaded file
                        await supabase.storage.from('documents').remove([fileName]);
                    } else if (documentData) {
                        console.log('✅ Document saved:', (documentData as any).title);
                    }
                } else if (doc.link && doc.link.trim()) {
                    // Save link as document
                    const { data: documentData, error: docError } = await supabase
                        .from('documents')
                        .insert({
                            organization_id: organizationId,
                            project_id: projectId,
                            title: `${doc.type} - Link`,
                            description: `Link to ${doc.type} document: ${doc.link}`,
                            file_name: doc.link,
                            file_path: doc.link,
                            file_size: 0,
                            mime_type: 'text/plain',
                            category: doc.type.toLowerCase().replace(' ', '_'),
                            version: 1,
                            is_current_version: true,
                            storage_provider: 'external',
                            access_level: 'organization',
                            tags: [doc.type.toLowerCase(), 'link'],
                            uploaded_by: profile?.id,
                            metadata: {
                                external_link: doc.link,
                                upload_source: 'intake_form'
                            }
                        } as any)
                        .select()
                        .single();

                    if (docError) {
                        console.error('Error creating document link record:', docError);
                    } else if (documentData) {
                        console.log('✅ Document link saved:', (documentData as any).title);
                    }
                }
            }
        } catch (error) {
            console.error('Error saving project documents:', error);
            // Don't throw error to prevent project creation from failing
        }
    };

    // Generate temporary project ID on component mount
    const generateTemporaryProjectId = useCallback(async () => {
        try {
            setIsGeneratingId(true);
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');

            // Get the count of projects created today to generate sequence
            const startOfDay = new Date(year, now.getMonth(), now.getDate()).toISOString();
            const endOfDay = new Date(year, now.getMonth(), now.getDate() + 1).toISOString();

            if (!profile?.organization_id) {
                throw new Error('User organization ID is required');
            }

            const { count, error } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .eq('organization_id', profile.organization_id as any)
                .gte('created_at', startOfDay)
                .lt('created_at', endOfDay);

            if (error) {
                console.error('Error getting project count for temp ID:', error);
                // Fallback to random sequence
                const sequence = String(Math.floor(Math.random() * 100)).padStart(2, '0');
                const fallbackId = `P-${year}${month}${day}${sequence}`;
                setTempProjectId(fallbackId);
            } else {
                const sequence = String((count || 0) + 1).padStart(2, '0');
                const projectId = `P-${year}${month}${day}${sequence}`;
                setTempProjectId(projectId);
            }
        } catch (error) {
            console.error('Error generating temporary project ID:', error);
            // Fallback to timestamp-based ID
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const timestamp = String(now.getTime()).slice(-4);
            const fallbackId = `P-${year}${month}${day}${timestamp}`;
            setTempProjectId(fallbackId);
        } finally {
            setIsGeneratingId(false);
        }
    }, [profile?.organization_id]);

    // Generate temporary project ID when component mounts
    useEffect(() => {
        if (profile?.organization_id) {
            generateTemporaryProjectId();
        }
    }, [profile?.organization_id, generateTemporaryProjectId]);

    // Get intake mapping for this submission type
    const mapping = IntakeMappingService.getMapping(IntakeMappingService.getInternalIntakeType(submissionType));

    // Initialize form
    const form = useForm<InquiryFormData>({
        resolver: zodResolver(inquiryFormSchema),
        defaultValues: {
            intakeType: IntakeMappingService.getInternalIntakeType(submissionType),
            volumes: [{ qty: 1000, unit: 'pcs', freq: 'per year' }],
            priority: 'normal',
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

    // Handle organization selection and auto-fill
    const handleOrganizationSelect = useCallback((organization: Organization) => {
        // Step 1: Update organization ID and name
        form.setValue('selectedCustomerId', organization.id);
        form.setValue('company', organization.name || '');
        form.setValue('website', organization.website || '');

        // Step 2: Clear contact-related fields
        form.setValue('pointOfContacts', []);
        form.setValue('customerName', '');
        form.setValue('email', '');
        setSelectedContacts([]);
        setCustomerSearchOpen(false);
        setCustomerSearchQuery('');

        // Step 3: Load contacts for the selected organization
        if (organization.id) {
            setLoadingContacts(true);
            getOrganizationContacts(organization.id);
        }
    }, [form, getOrganizationContacts]);

    // Toggle section collapse state
    const toggleSection = useCallback((sectionKey: string) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    }, []);

    // Filter organizations based on search query
    const filteredOrganizations = React.useMemo(() => {
        if (!organizations) return [];
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

    // Handle contact selection and auto-fill contact details
    const handleContactSelect = useCallback((contactId: string) => {
        const contact = organizationContacts.find(c => c.id === contactId);
        if (contact) {
            // Update selected contacts
            setSelectedContacts([contactId]);
            form.setValue('pointOfContacts', [contactId]);

            // Auto-fill contact information
            form.setValue('customerName', contact.contact_name || '');
            form.setValue('email', contact.email || '');
        }
    }, [organizationContacts, form]);

    // Handle contact deselection
    const handleContactDeselect = useCallback(() => {
        setSelectedContacts([]);
        form.setValue('pointOfContacts', []);
        form.setValue('customerName', '');
        form.setValue('email', '');
    }, [form]);

    // Handle point of contact selection - simplified approach
    const handlePointOfContactToggle = useCallback((contactId: string) => {
        if (selectedContacts.includes(contactId)) {
            // Deselect contact
            handleContactDeselect();
        } else {
            // Select contact
            handleContactSelect(contactId);
        }
    }, [selectedContacts, handleContactSelect, handleContactDeselect]);

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
                    country: 'US', // Default country
                    website: data.website || undefined,
                    description: 'Customer Organization'
                }, {
                    contact_name: data.customerName,
                    email: data.email,
                    phone: data.phone,
                    role: 'primary_contact'
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

            // Create project using intake service with pre-generated project ID
            const project = await ProjectIntakeService.createProjectFromIntake(
                intakeData,
                profile?.organization_id || '',
                createProject,
                tempProjectId // Pass the pre-generated project ID
            );

            // Save documents if any were uploaded
            if (data.documents && data.documents.length > 0) {
                console.log('📄 Saving documents for project:', project.project_id);
                await saveProjectDocuments(project.id, data.documents, profile?.organization_id || '');
            }

            setIsSubmitted(true);

            toast({
                title: "Project Submitted Successfully!",
                description: `Your ${submissionType.toLowerCase()} has been submitted with ID: ${project.project_id}`,
            });

            onSuccess?.(project.project_id);

        } catch (error) {
            console.error('Error submitting project:', error);

            let errorMessage = "There was an error submitting your project. Please try again.";

            if (error instanceof Error) {
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });

                // Provide more specific error messages
                if (error.message.includes('Unknown intake type')) {
                    errorMessage = "Invalid submission type. Please refresh the page and try again.";
                } else if (error.message.includes('customer organization')) {
                    errorMessage = "Failed to create customer organization. Please check your company information.";
                } else if (error.message.includes('workflow stage')) {
                    errorMessage = "Workflow configuration error. Please contact support.";
                } else if (error.message.includes('duplicate key')) {
                    errorMessage = "A project with this information already exists. Please check your data.";
                } else if (error.message.includes('foreign key')) {
                    errorMessage = "Invalid reference data. Please check your customer information.";
                } else if (error.message.includes('not null')) {
                    errorMessage = "Required fields are missing. Please check all required fields.";
                } else {
                    errorMessage = `Submission failed: ${error.message}`;
                }
            }

            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: errorMessage,
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
                                        Customer Information
                                    </CardTitle>
                                    <CardDescription>
                                        Select an existing customer organization or create a new one for project communication
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCreateCustomerOpen(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        New Customer
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        {!collapsedSections.customerInfo && (
                            <CardContent className="space-y-4">
                                {/* Organization and Point of Contacts Selection - Side by Side */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Organization Selection - Left Side */}
                                    <FormField
                                        control={form.control}
                                        name="selectedCustomerId"
                                        render={({ field }) => {
                                            const selectedOrg = organizations?.find(org => org.id === field.value);
                                            return (
                                                <FormItem>
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel>Select Existing Organization (Optional)</FormLabel>
                                                        {selectedOrg && (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        // TODO: Implement company details popup
                                                                        toast({
                                                                            title: "Company Details",
                                                                            description: `${selectedOrg.name} - ${selectedOrg.industry || 'No industry'} - ${selectedOrg.country || 'No country'}`,
                                                                        });
                                                                    }}
                                                                    className="text-xs"
                                                                >
                                                                    <Building2 className="h-3 w-3 mr-1" />
                                                                    View Details
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
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
                                                                        selectedOrg?.name || "Select organization..."
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
                                            )
                                        }}
                                    />

                                    {/* Point of Contacts Selection - Right Side */}
                                    {form.watch('selectedCustomerId') && (
                                        <FormField
                                            control={form.control}
                                            name="pointOfContacts"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel>Point of Contacts</FormLabel>
                                                        {selectedContacts.length > 0 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const contacts = selectedContacts.map(id => organizationContacts.find(c => c.id === id)).filter(Boolean);
                                                                    toast({
                                                                        title: "Contact Details",
                                                                        description: contacts.map(c => `${c.contact_name} - ${c.email}`).join(', '),
                                                                    });
                                                                }}
                                                                className="text-xs"
                                                            >
                                                                <Building2 className="h-3 w-3 mr-1" />
                                                                View Details
                                                            </Button>
                                                        )}
                                                    </div>
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
                                                                        : organizationContacts.length === 0 && !loadingContacts
                                                                            ? "No contacts - Add new contact"
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
                                                                            <>
                                                                                <CommandItem disabled>
                                                                                    No contacts available
                                                                                </CommandItem>
                                                                                <CommandItem
                                                                                    onSelect={() => {
                                                                                        setIsCreatingContactDialogOpen(true);
                                                                                        setPointOfContactsOpen(false);
                                                                                    }}
                                                                                    className="text-primary hover:text-primary"
                                                                                >
                                                                                    <Plus className="mr-2 h-4 w-4" />
                                                                                    Add new contact
                                                                                </CommandItem>
                                                                            </>
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

                                    {/* Placeholder for when no organization is selected */}
                                    {!form.watch('selectedCustomerId') && (
                                        <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-md">
                                            <div className="text-center text-muted-foreground">
                                                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">Select an organization first</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="company"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Organization Name *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder={form.watch('selectedCustomerId') ? "Auto-filled from organization" : "TechNova Inc."}
                                                        {...field}
                                                        readOnly={!!form.watch('selectedCustomerId')}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="customerName"
                                        render={({ field }) => {
                                            const hasContacts = organizationContacts.length > 0;
                                            return (
                                                <FormItem>
                                                    <FormLabel>Contact Name *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={
                                                                !form.watch('selectedCustomerId')
                                                                    ? "Select organization first"
                                                                    : !hasContacts
                                                                        ? "No contacts available - add new contact"
                                                                        : "Auto-filled from contact"
                                                            }
                                                            {...field}
                                                            readOnly={hasContacts && selectedContacts.length > 0}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            );
                                        }}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => {
                                        const hasContacts = organizationContacts.length > 0;
                                        return (
                                            <FormItem>
                                                <FormLabel>Email *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder={
                                                            !form.watch('selectedCustomerId')
                                                                ? "Select organization first"
                                                                : !hasContacts
                                                                    ? "No contacts available - add new contact"
                                                                    : "Auto-filled from contact"
                                                        }
                                                        {...field}
                                                        readOnly={hasContacts && selectedContacts.length > 0}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />
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
                                        {tempProjectId && (
                                            <Badge variant="outline" className="text-xs font-mono ml-2">
                                                {tempProjectId}
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        Provide detailed information about your manufacturing project
                                        {isGeneratingId && (
                                            <span className="ml-2 text-xs text-muted-foreground">(Generating ID...)</span>
                                        )}
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
                                            <FormLabel>Project Title * (3-100 characters)</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="e.g., High-Precision Sensor Mount"
                                                        {...field}
                                                        maxLength={100}
                                                    />
                                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                                                        {field.value?.length || 0}/100
                                                    </div>
                                                </div>
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
                                            <FormLabel>Description * (50-2000 characters)</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Textarea
                                                        placeholder="Describe your project requirements, specifications, and any special considerations..."
                                                        className="min-h-[100px] pr-16"
                                                        {...field}
                                                        maxLength={2000}
                                                    />
                                                    <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background px-1 rounded">
                                                        {field.value?.length || 0}/2000
                                                    </div>
                                                </div>
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
                                                        <Select onValueChange={field.onChange} value={field.value}>
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
                                                        <Select onValueChange={field.onChange} value={field.value}>
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
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select priority" />
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
                                        <div className="flex items-center gap-2">
                                            <FormLabel className="text-sm font-medium">Document {index + 1}:</FormLabel>
                                            <FormField
                                                control={form.control}
                                                name={`documents.${index}.type`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="w-[180px]">
                                                                    <SelectValue placeholder="Select type" />
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
                                        <p className="text-sm text-muted-foreground">
                                            {form.watch(`documents.${index}.type`) === 'BOM'
                                                ? 'Upload any file format (Excel, PDF, image, etc.) or provide a link'
                                                : 'Upload a file or provide a link (either one is required)'
                                            }
                                        </p>

                                        <div className="space-y-3">
                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.accept = form.watch(`documents.${index}.type`) === 'BOM' ? "*" : ".pdf,.dwg,.step,.stp,.zip,.rar";
                                                        input.onchange = (e) => {
                                                            const file = (e.target as HTMLInputElement).files?.[0];
                                                            if (file) {
                                                                form.setValue(`documents.${index}.file`, file);
                                                                form.setValue(`documents.${index}.uploaded`, true);
                                                                form.setValue(`documents.${index}.link`, '');
                                                                setDocumentModes(prev => ({ ...prev, [index]: 'file' }));
                                                            }
                                                        };
                                                        input.click();
                                                    }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    Upload File
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        form.setValue(`documents.${index}.file`, undefined);
                                                        form.setValue(`documents.${index}.link`, '');
                                                        form.setValue(`documents.${index}.uploaded`, true);
                                                        setDocumentModes(prev => ({ ...prev, [index]: 'link' }));
                                                    }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Link className="h-4 w-4" />
                                                    Add Link
                                                </Button>
                                            </div>

                                            {/* File Display */}
                                            {documentModes[index] === 'file' && form.watch(`documents.${index}.file`) && (
                                                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">
                                                        {form.watch(`documents.${index}.file`)?.name}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            form.setValue(`documents.${index}.file`, undefined);
                                                            form.setValue(`documents.${index}.uploaded`, false);
                                                            setDocumentModes(prev => ({ ...prev, [index]: 'none' }));
                                                        }}
                                                        className="ml-auto h-6 w-6 p-0"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Link Input */}
                                            {documentModes[index] === 'link' && (
                                                <FormField
                                                    control={form.control}
                                                    name={`documents.${index}.link`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>External Link</FormLabel>
                                                            <FormControl>
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        placeholder="https://drive.google.com/..."
                                                                        {...field}
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            form.setValue(`documents.${index}.link`, '');
                                                                            form.setValue(`documents.${index}.uploaded`, false);
                                                                            setDocumentModes(prev => ({ ...prev, [index]: 'none' }));
                                                                        }}
                                                                        className="h-10 w-10 p-0"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </div>
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
                                                <div className="relative">
                                                    <Textarea
                                                        placeholder="Any additional notes, special requirements, or considerations..."
                                                        className="min-h-[100px] pr-16"
                                                        {...field}
                                                        maxLength={1000}
                                                    />
                                                    <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background px-1 rounded">
                                                        {field.value?.length || 0}/1000
                                                    </div>
                                                </div>
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
                        <Button type="submit" disabled={isSubmitting || isGeneratingId || !tempProjectId}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : isGeneratingId ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Preparing...
                                </>
                            ) : (
                                <>
                                    Submit {submissionType}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form >

            {/* Create Customer Modal */}
            <CustomerModal
                open={createCustomerOpen}
                onClose={() => setCreateCustomerOpen(false)}
                onSuccess={(customer) => {
                    // Refresh customer organizations list
                    refetch();
                    // Close the modal
                    setCreateCustomerOpen(false);
                    // Show success message
                    toast({
                        title: "Customer Created Successfully!",
                        description: `${customer.name} has been added to your customer database.`,
                    });
                }}
            />

            {/* Contact Modal */}
            <ContactModal
                open={isCreatingContactDialogOpen}
                onClose={() => {
                                    setIsCreatingContactDialogOpen(false);
                                    setContactFormData({
                                        contactName: '',
                                        contactEmail: '',
                                        contactPhone: '',
                                        contactRole: 'general',
                                        contactAddress: '',
                                        contactCity: '',
                                        contactState: '',
                                        contactPostalCode: '',
                                        contactWebsite: '',
                                        contactNotes: '',
                                        isPrimaryContact: false
                                    });
                                }}
                organizationId={form.watch('selectedCustomerId')}
                onContactCreated={(contact) => {
                                        // Reload contacts for the organization
                    const reloadContacts = async () => {
                                        const { data: contactsData, error: contactsError } = await supabase
                                            .from('contacts')
                                            .select('*')
                                            .eq('organization_id', form.watch('selectedCustomerId') as any)
                                            .eq('type', 'customer' as any)
                                            .eq('is_active', true as any)
                                            .order('is_primary_contact', { ascending: false })
                                            .order('contact_name');

                                        if (!contactsError && contactsData) {
                                            setOrganizationContacts((contactsData as any) || []);
                                        }
                    };
                    reloadContacts();
                }}
            />
        </>
    );
}
