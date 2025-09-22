import { supabase } from '@/integrations/supabase/client.ts.js';
import { useAuth } from '@/core/auth';
import { useDocument } from '@/core/documents';
import { IntakeFormData, IntakeSubmissionResult, IntakeSubmissionType, SUBMISSION_TYPE_CONFIG } from '../types/intake.types';
import { IntakeValidation } from '../validations/intakeValidation';

export class IntakeService {

    /**
     * Submit intake form data and create project
     */
    static async submitIntakeForm(
        formData: IntakeFormData,
        organizationId: string,
        userId: string
    ): Promise<IntakeSubmissionResult> {

        console.log('🚀 Starting intake form submission:', {
            intakeType: formData.intakeType,
            organizationId,
            title: formData.projectTitle
        });

        try {
            // Validate form data
            const validation = IntakeValidation.validateCompleteForm(formData);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Validation failed: ${Object.values(validation.errors).flat().join(', ')}`
                };
            }

            // Generate project ID
            const projectId = await this.generateProjectId(organizationId);

            // Create project from intake data
            const project = await this.createProjectFromIntake(formData, organizationId, userId, projectId);

            // Upload documents if any
            const documentUploadResults = await this.uploadIntakeDocuments(formData.documents, project.id, userId);

            // Log activity
            await this.logIntakeActivity(project.id, 'intake_submitted', {
                intakeType: formData.intakeType,
                documentCount: formData.documents.length,
                uploadedDocuments: documentUploadResults.filter(r => r.success).length
            }, userId);

            return {
                success: true,
                projectId: project.id,
                warnings: documentUploadResults.filter(r => !r.success).map(r => r.error || 'Document upload failed')
            };

        } catch (error) {
            console.error('❌ Intake submission failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Generate unique project ID
     */
    private static async generateProjectId(organizationId: string): Promise<string> {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `PRJ-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Create project from intake data
     */
    private static async createProjectFromIntake(
        formData: IntakeFormData,
        organizationId: string,
        userId: string,
        projectId: string
    ) {
        const projectData = {
            id: projectId,
            title: formData.projectTitle,
            description: formData.description,
            organization_id: organizationId,
            created_by: userId,
            updated_by: userId,
            status: 'draft',
            priority: formData.priority || 'normal',
            project_type: this.mapIntakeTypeToProjectType(formData.intakeType),

            // Customer information
            customer_name: formData.customerName,
            customer_company: formData.company,
            customer_email: formData.email,
            customer_phone: formData.phone,
            customer_country: formData.country,
            customer_website: formData.website,

            // Project details
            target_price_per_unit: formData.targetPricePerUnit,
            desired_delivery_date: formData.desiredDeliveryDate,
            project_reference: formData.projectReference,

            // Volume information (stored as JSON)
            volume: formData.volumes ? JSON.stringify(formData.volumes) : null,

            // Metadata
            intake_type: formData.intakeType,
            intake_source: 'web_form',
            notes: formData.notes,
            tags: [`intake-${formData.intakeType}`],

            // Point of contacts (will be linked separately)
            point_of_contacts: formData.pointOfContacts || [],

            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('projects')
            .insert(projectData)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create project: ${error.message}`);
        }

        return data;
    }

    /**
     * Map intake type to project type
     */
    private static mapIntakeTypeToProjectType(intakeType: string): string {
        const mapping = {
            'inquiry': 'inquiry',
            'rfq': 'quote_request',
            'po': 'purchase_order',
            'design_idea': 'design_project'
        };

        return mapping[intakeType as keyof typeof mapping] || 'inquiry';
    }

    /**
     * Upload intake documents
     */
    private static async uploadIntakeDocuments(
        documents: IntakeFormData['documents'],
        projectId: string,
        userId: string
    ): Promise<Array<{ success: boolean; error?: string }>> {

        const results = [];

        for (const [index, document] of documents.entries()) {
            try {
                if (document.file) {
                    // Upload file document
                    const fileName = `intake-${projectId}-${index}-${document.file.name}`;
                    const filePath = `projects/${projectId}/intake/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('documents')
                        .upload(filePath, document.file);

                    if (uploadError) throw uploadError;

                    // Create document record
                    const { error: dbError } = await supabase
                        .from('project_documents')
                        .insert({
                            project_id: projectId,
                            document_type: document.type,
                            file_name: document.file.name,
                            file_path: filePath,
                            file_size: document.file.size,
                            mime_type: document.file.type,
                            uploaded_by: userId,
                            description: document.description || `Intake document: ${document.type}`,
                            tags: ['intake', document.type.toLowerCase()]
                        });

                    if (dbError) throw dbError;

                } else if (document.link) {
                    // Create link document record
                    const { error } = await supabase
                        .from('project_documents')
                        .insert({
                            project_id: projectId,
                            document_type: document.type,
                            external_link: document.link,
                            uploaded_by: userId,
                            description: document.description || `Intake document: ${document.type}`,
                            tags: ['intake', 'external', document.type.toLowerCase()]
                        });

                    if (error) throw error;
                }

                results.push({ success: true });

            } catch (error) {
                console.error(`Document upload failed for document ${index}:`, error);
                results.push({
                    success: false,
                    error: `Failed to upload ${document.type}: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        }

        return results;
    }

    /**
     * Log intake activity
     */
    private static async logIntakeActivity(
        projectId: string,
        action: string,
        details: any,
        userId: string
    ) {
        try {
            const { error } = await supabase
                .from('activity_log')
                .insert({
                    project_id: projectId,
                    user_id: userId,
                    action,
                    details,
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.warn('Failed to log intake activity:', error);
            }
        } catch (error) {
            console.warn('Activity logging failed:', error);
        }
    }

    /**
     * Get intake configuration for a submission type
     */
    static getIntakeConfig(submissionType: IntakeSubmissionType) {
        return SUBMISSION_TYPE_CONFIG[submissionType] || SUBMISSION_TYPE_CONFIG.inquiry;
    }

    /**
     * Validate intake form data
     */
    static validateIntakeForm(formData: IntakeFormData) {
        return IntakeValidation.validateCompleteForm(formData);
    }

    /**
     * Check if form can be submitted
     */
    static canSubmitForm(formData: IntakeFormData): boolean {
        return IntakeValidation.canSubmitForm(formData);
    }
}
