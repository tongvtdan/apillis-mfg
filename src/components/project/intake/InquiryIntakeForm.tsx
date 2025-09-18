import React, { useState, useCallback, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Form } from '@/components/ui/form';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { useProjectManagement } from '@/features/project-management/hooks';
import { useCustomerOrganizations } from '@/features/customer-management/hooks/useCustomerOrganizations';
import { useCustomers } from '@/features/customer-management/hooks/useCustomers';
import { useAuth } from '@/core/auth';
import { ProjectIntakeService, ProjectIntakeData } from '@/services/projectIntakeService';
import { IntakeMappingService } from '@/services/intakeMappingService';
import { Organization, Contact } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Service role client for storage operations (bypasses RLS)
const supabaseServiceRole = createClient(
    'http://localhost:54321',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);
import { CustomerModal } from '@/components/customer/CustomerModal';
import { ContactModal } from '@/components/customer/ContactModal';
import { ContactInfoSection } from './ContactInfoSection';
import { ProjectDetailsSection } from './ProjectDetailsSection';
import { FileAttachmentsSection } from './FileAttachmentsSection';
import { AdditionalNotesSection } from './AdditionalNotesSection';
import { TermsAgreementSection } from './TermsAgreementSection';
import { inquiryFormSchema, InquiryFormData, VolumeItem, DocumentItem } from './types';


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
    const { createProject } = useProjectManagement();
    const { customers: organizations, loading: organizationsLoading, refetch } = useCustomerOrganizations();
    const { createCustomer } = useCustomers();
    const { profile } = useAuth();

    // Function to save project documents
    const saveProjectDocuments = async (projectId: string, documents: any[], organizationId: string) => {
        try {
            for (const doc of documents) {
                if (doc.file && doc.file instanceof File) {
                    // Upload file to storage
                    const fileName = `${projectId}/${Date.now()}_${doc.file.name}`;
                    const { data: uploadData, error: uploadError } = await supabaseServiceRole.storage
                        .from('documents')
                        .upload(fileName, doc.file, {
                            contentType: doc.file.type,
                            upsert: false
                        });

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
                const newCustomer = await createCustomer({
                    company_name: data.company,
                    contact_name: data.customerName,
                    email: data.email,
                    phone: data.phone,
                    country: 'US', // Default country
                    website: data.website || undefined,
                    notes: 'Customer Organization created from inquiry intake'
                });
                customerOrganizationId = newCustomer.organization_id;
            }

            if (!customerOrganizationId) {
                throw new Error('Failed to create or select customer organization');
            }

            // Prepare intake data with explicit 'in_progress' status
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
                status: 'inquiry', // Explicitly set status to 'inquiry' for submissions
                current_stage_id: '880e8400-e29b-41d4-a716-446655440001', // Set to inquiry_received stage
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
                errorMessage = error.message;
            }

            toast({
                title: "Project Submission Failed",
                description: errorMessage,
                variant: "destructive",
            });

            // Reset submission state to allow retry
            setIsSubmitting(false);
            setIsSubmitted(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle save as draft
    const handleSaveAsDraft = async (data: InquiryFormData) => {
        setIsSubmitting(true);

        try {
            let customerOrganizationId = data.selectedCustomerId;

            // If no organization is selected, create a new one
            if (!customerOrganizationId && data.company) {
                const newCustomer = await createCustomer({
                    company_name: data.company,
                    contact_name: data.customerName,
                    email: data.email,
                    phone: data.phone,
                    country: 'US', // Default country
                    website: data.website || undefined,
                    notes: 'Customer Organization created from inquiry intake'
                });
                customerOrganizationId = newCustomer.organization_id;
            }

            if (!customerOrganizationId) {
                throw new Error('Failed to create or select customer organization');
            }

            // Prepare intake data with draft status
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
                status: 'draft', // Explicitly set status to 'draft' for draft submissions
                // Additional fields for database
                volume: data.volumes ? JSON.stringify(data.volumes) : undefined,
                target_price_per_unit: data.targetPricePerUnit,
                desired_delivery_date: data.desiredDeliveryDate,
                project_reference: data.projectReference
            };

            // Create project using intake service with pre-generated project ID and draft status
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
                title: "Project Saved as Draft!",
                description: `Your ${submissionType.toLowerCase()} has been saved as draft with ID: ${project.project_id}`,
            });

            onSuccess?.(project.project_id);

        } catch (error) {
            console.error('Error saving project as draft:', error);

            let errorMessage = "There was an error saving your project as draft. Please try again.";

            if (error instanceof Error) {
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });
                errorMessage = error.message;
            }

            toast({
                title: "Save as Draft Failed",
                description: errorMessage,
                variant: "destructive",
            });

            // Reset submission state to allow retry
            setIsSubmitting(false);
            setIsSubmitted(false);
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
                    <ContactInfoSection
                        form={form}
                        collapsed={collapsedSections.customerInfo}
                        onToggle={() => toggleSection('customerInfo')}
                        organizations={organizations}
                        organizationsLoading={organizationsLoading}
                        customerSearchOpen={customerSearchOpen}
                        setCustomerSearchOpen={setCustomerSearchOpen}
                        customerSearchQuery={customerSearchQuery}
                        setCustomerSearchQuery={setCustomerSearchQuery}
                        filteredOrganizations={filteredOrganizations}
                        handleOrganizationSelect={handleOrganizationSelect}
                        organizationContacts={organizationContacts}
                        loadingContacts={loadingContacts}
                        selectedContacts={selectedContacts}
                        pointOfContactsOpen={pointOfContactsOpen}
                        setPointOfContactsOpen={setPointOfContactsOpen}
                        handlePointOfContactToggle={handlePointOfContactToggle}
                        onCreateCustomer={() => setCreateCustomerOpen(true)}
                        onCreateContact={() => setIsCreatingContactDialogOpen(true)}
                    />

                    {/* Project Details */}
                    <ProjectDetailsSection
                        form={form}
                        collapsed={collapsedSections.projectDetails}
                        onToggle={() => toggleSection('projectDetails')}
                        submissionType={submissionType}
                        tempProjectId={tempProjectId}
                        isGeneratingId={isGeneratingId}
                        volumeFields={volumeFields}
                        appendVolume={appendVolume}
                        removeVolume={removeVolume}
                    />

                    {/* File Attachments */}
                    <FileAttachmentsSection
                        form={form}
                        collapsed={collapsedSections.fileAttachments}
                        onToggle={() => toggleSection('fileAttachments')}
                        documentFields={documentFields}
                        appendDocument={appendDocument}
                        removeDocument={removeDocument}
                        documentModes={documentModes}
                        setDocumentModes={setDocumentModes}
                    />

                    {/* Additional Notes */}
                    <AdditionalNotesSection
                        form={form}
                        collapsed={collapsedSections.additionalNotes}
                        onToggle={() => toggleSection('additionalNotes')}
                    />

                    {/* Terms Agreement */}
                    <TermsAgreementSection
                        form={form}
                        collapsed={collapsedSections.termsAgreement}
                        onToggle={() => toggleSection('termsAgreement')}
                    />

                    {/* Submit Button */}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={form.handleSubmit(handleSaveAsDraft)}
                            disabled={isSubmitting || isGeneratingId || !tempProjectId}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : isGeneratingId ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Preparing...
                                </>
                            ) : (
                                <>
                                    Save as Draft
                                </>
                            )}
                        </Button>
                        <Button
                            type="button" // Changed from submit to button to handle custom submission
                            onClick={form.handleSubmit(handleSubmit)}
                            disabled={isSubmitting || isGeneratingId || !tempProjectId}
                        >
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
