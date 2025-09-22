import { supabase } from '@/integrations/supabase/client.ts';
import { WorkflowStage, ProjectDocument } from '@/types/project';

export interface DocumentRequirement {
    id: string;
    type: string;
    name: string;
    description: string;
    required: boolean;
    stage_id: string;
    file_types?: string[];
    max_size_mb?: number;
    validation_rules?: Record<string, any>;
}

export interface DocumentValidationResult {
    isValid: boolean;
    missing: DocumentRequirement[];
    invalid: Array<{
        document: ProjectDocument;
        requirement: DocumentRequirement;
        issues: string[];
    }>;
    warnings: string[];
    summary: {
        total_required: number;
        satisfied: number;
        missing: number;
        invalid: number;
    };
}

export interface StageDocumentStatus {
    stage_id: string;
    stage_name: string;
    requirements: DocumentRequirement[];
    validation: DocumentValidationResult;
    completion_percentage: number;
}

class DocumentRequirementsService {
    private cachedRequirements: Map<string, DocumentRequirement[]> = new Map();
    private cacheTimestamp: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    /**
     * Get document requirements for a specific workflow stage
     */
    async getStageDocumentRequirements(stageId: string): Promise<DocumentRequirement[]> {
        const cacheKey = `stage_${stageId}`;
        const now = Date.now();

        // Return cached data if still valid
        if (this.cachedRequirements.has(cacheKey) && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
            return this.cachedRequirements.get(cacheKey) || [];
        }

        try {
            // For now, return predefined requirements based on stage name
            // In the future, this could be stored in the database
            const { data: stage, error } = await supabase
                .from('workflow_stages')
                .select('name')
                .eq('id', stageId)
                .single();

            if (error || !stage) {
                console.error('Error fetching stage:', error);
                return [];
            }

            const requirements = this.getDefaultStageRequirements(stageId, stage.name);
            this.cachedRequirements.set(cacheKey, requirements);
            this.cacheTimestamp = now;

            return requirements;
        } catch (error) {
            console.error('Error fetching document requirements:', error);
            return [];
        }
    }

    /**
     * Validate documents against stage requirements
     */
    async validateDocumentsForStage(
        projectId: string,
        stageId: string,
        documents?: ProjectDocument[]
    ): Promise<DocumentValidationResult> {
        try {
            // Get stage requirements
            const requirements = await this.getStageDocumentRequirements(stageId);

            // Get project documents if not provided
            let projectDocuments = documents;
            if (!projectDocuments) {
                const { data, error } = await supabase
                    .from('documents')
                    .select('*')
                    .eq('project_id', projectId);

                if (error) {
                    throw new Error(`Failed to fetch documents: ${error.message}`);
                }
                projectDocuments = data || [];
            }

            return this.performDocumentValidation(requirements, projectDocuments);
        } catch (error) {
            console.error('Error validating documents:', error);
            return {
                isValid: false,
                missing: [],
                invalid: [],
                warnings: ['Failed to validate documents'],
                summary: {
                    total_required: 0,
                    satisfied: 0,
                    missing: 0,
                    invalid: 0
                }
            };
        }
    }

    /**
     * Get document status for all stages in a project
     */
    async getProjectDocumentStatus(
        projectId: string,
        stages: WorkflowStage[]
    ): Promise<StageDocumentStatus[]> {
        try {
            // Get all project documents once
            const { data: documents, error } = await supabase
                .from('documents')
                .select('*')
                .eq('project_id', projectId);

            if (error) {
                throw new Error(`Failed to fetch documents: ${error.message}`);
            }

            const projectDocuments = documents || [];

            // Validate documents for each stage
            const statusPromises = stages.map(async (stage) => {
                const requirements = await this.getStageDocumentRequirements(stage.id);
                const validation = this.performDocumentValidation(requirements, projectDocuments);

                const completionPercentage = requirements.length > 0
                    ? Math.round((validation.summary.satisfied / validation.summary.total_required) * 100)
                    : 100;

                return {
                    stage_id: stage.id,
                    stage_name: stage.name,
                    requirements,
                    validation,
                    completion_percentage: completionPercentage
                };
            });

            return await Promise.all(statusPromises);
        } catch (error) {
            console.error('Error getting project document status:', error);
            return [];
        }
    }

    /**
     * Check if documents are sufficient for stage advancement
     */
    async canAdvanceToStage(projectId: string, targetStageId: string): Promise<{
        canAdvance: boolean;
        blockers: string[];
        warnings: string[];
        validation: DocumentValidationResult;
    }> {
        const validation = await this.validateDocumentsForStage(projectId, targetStageId);

        const blockers: string[] = [];
        const warnings: string[] = [];

        // Check for missing required documents
        validation.missing.forEach(req => {
            if (req.required) {
                blockers.push(`Missing required document: ${req.name}`);
            } else {
                warnings.push(`Missing recommended document: ${req.name}`);
            }
        });

        // Check for invalid documents
        validation.invalid.forEach(({ document, requirement, issues }) => {
            if (requirement.required) {
                blockers.push(`Invalid ${requirement.name}: ${issues.join(', ')}`);
            } else {
                warnings.push(`Issues with ${requirement.name}: ${issues.join(', ')}`);
            }
        });

        return {
            canAdvance: blockers.length === 0,
            blockers,
            warnings: [...warnings, ...validation.warnings],
            validation
        };
    }

    /**
     * Get document requirements by category
     */
    async getRequirementsByCategory(stageId: string): Promise<Record<string, DocumentRequirement[]>> {
        const requirements = await this.getStageDocumentRequirements(stageId);

        const categories: Record<string, DocumentRequirement[]> = {};

        requirements.forEach(req => {
            const category = this.getDocumentCategory(req.type);
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(req);
        });

        return categories;
    }

    /**
     * Perform document validation logic
     */
    private performDocumentValidation(
        requirements: DocumentRequirement[],
        documents: ProjectDocument[]
    ): DocumentValidationResult {
        const missing: DocumentRequirement[] = [];
        const invalid: Array<{
            document: ProjectDocument;
            requirement: DocumentRequirement;
            issues: string[];
        }> = [];
        const warnings: string[] = [];

        let satisfied = 0;
        const totalRequired = requirements.filter(req => req.required).length;

        requirements.forEach(requirement => {
            // Find matching documents
            const matchingDocs = documents.filter(doc =>
                this.documentMatchesRequirement(doc, requirement)
            );

            if (matchingDocs.length === 0) {
                missing.push(requirement);
            } else {
                // Validate each matching document
                let hasValidDocument = false;

                matchingDocs.forEach(doc => {
                    const issues = this.validateDocument(doc, requirement);

                    if (issues.length === 0) {
                        hasValidDocument = true;
                    } else {
                        invalid.push({
                            document: doc,
                            requirement,
                            issues
                        });
                    }
                });

                if (hasValidDocument && requirement.required) {
                    satisfied++;
                }

                // Add warnings for multiple documents of same type
                if (matchingDocs.length > 1) {
                    warnings.push(`Multiple ${requirement.name} documents found - ensure the correct version is used`);
                }
            }
        });

        return {
            isValid: missing.filter(req => req.required).length === 0 &&
                invalid.filter(inv => inv.requirement.required).length === 0,
            missing,
            invalid,
            warnings,
            summary: {
                total_required: totalRequired,
                satisfied,
                missing: missing.filter(req => req.required).length,
                invalid: invalid.filter(inv => inv.requirement.required).length
            }
        };
    }

    /**
     * Check if a document matches a requirement
     */
    private documentMatchesRequirement(document: ProjectDocument, requirement: DocumentRequirement): boolean {
        // Match by category
        if (document.category === requirement.type) {
            return true;
        }

        // Match by file name patterns
        const fileName = document.file_name?.toLowerCase() || '';
        const title = document.title?.toLowerCase() || '';
        const requirementType = requirement.type.toLowerCase();

        return fileName.includes(requirementType) || title.includes(requirementType);
    }

    /**
     * Validate a document against a requirement
     */
    private validateDocument(document: ProjectDocument, requirement: DocumentRequirement): string[] {
        const issues: string[] = [];

        // Check file type
        if (requirement.file_types && requirement.file_types.length > 0) {
            const fileExtension = document.file_name?.split('.').pop()?.toLowerCase();
            if (!fileExtension || !requirement.file_types.includes(fileExtension)) {
                issues.push(`Invalid file type. Expected: ${requirement.file_types.join(', ')}`);
            }
        }

        // Check file size
        if (requirement.max_size_mb && document.file_size) {
            const sizeMB = document.file_size / (1024 * 1024);
            if (sizeMB > requirement.max_size_mb) {
                issues.push(`File too large. Maximum size: ${requirement.max_size_mb}MB`);
            }
        }

        // Check validation rules
        if (requirement.validation_rules) {
            // Add custom validation logic here based on rules
            // For now, just basic checks
        }

        return issues;
    }

    /**
     * Get default document requirements for a stage
     */
    private getDefaultStageRequirements(stageId: string, stageName: string): DocumentRequirement[] {
        const baseRequirements: Record<string, DocumentRequirement[]> = {
            'Inquiry Received': [
                {
                    id: `${stageId}_rfq`,
                    type: 'rfq',
                    name: 'RFQ Document',
                    description: 'Customer request for quotation or inquiry document',
                    required: true,
                    stage_id: stageId,
                    file_types: ['pdf', 'doc', 'docx', 'txt'],
                    max_size_mb: 10
                },
                {
                    id: `${stageId}_specs`,
                    type: 'specification',
                    name: 'Technical Specifications',
                    description: 'Technical requirements and specifications',
                    required: false,
                    stage_id: stageId,
                    file_types: ['pdf', 'doc', 'docx'],
                    max_size_mb: 20
                }
            ],
            'Technical Review': [
                {
                    id: `${stageId}_drawings`,
                    type: 'drawing',
                    name: 'Technical Drawings',
                    description: 'CAD drawings, blueprints, or technical diagrams',
                    required: true,
                    stage_id: stageId,
                    file_types: ['dwg', 'pdf', 'step', 'iges', 'stp'],
                    max_size_mb: 50
                },
                {
                    id: `${stageId}_bom`,
                    type: 'bom',
                    name: 'Bill of Materials',
                    description: 'Detailed bill of materials',
                    required: false,
                    stage_id: stageId,
                    file_types: ['xlsx', 'csv', 'pdf'],
                    max_size_mb: 5
                }
            ],
            'Supplier RFQ': [
                {
                    id: `${stageId}_bom`,
                    type: 'bom',
                    name: 'Bill of Materials',
                    description: 'Finalized bill of materials for supplier quoting',
                    required: true,
                    stage_id: stageId,
                    file_types: ['xlsx', 'csv', 'pdf'],
                    max_size_mb: 5
                },
                {
                    id: `${stageId}_rfq_package`,
                    type: 'rfq_package',
                    name: 'RFQ Package',
                    description: 'Complete RFQ package sent to suppliers',
                    required: false,
                    stage_id: stageId,
                    file_types: ['pdf', 'zip'],
                    max_size_mb: 100
                }
            ],
            'Quoted': [
                {
                    id: `${stageId}_quote`,
                    type: 'quote',
                    name: 'Customer Quote',
                    description: 'Generated quote document for customer',
                    required: true,
                    stage_id: stageId,
                    file_types: ['pdf', 'doc', 'docx'],
                    max_size_mb: 10
                },
                {
                    id: `${stageId}_supplier_quotes`,
                    type: 'supplier_quote',
                    name: 'Supplier Quotes',
                    description: 'Received supplier quotations',
                    required: false,
                    stage_id: stageId,
                    file_types: ['pdf', 'xlsx', 'doc'],
                    max_size_mb: 20
                }
            ],
            'Order Confirmed': [
                {
                    id: `${stageId}_po`,
                    type: 'purchase_order',
                    name: 'Purchase Order',
                    description: 'Customer purchase order',
                    required: true,
                    stage_id: stageId,
                    file_types: ['pdf', 'doc', 'docx'],
                    max_size_mb: 10
                },
                {
                    id: `${stageId}_contract`,
                    type: 'contract',
                    name: 'Contract/Agreement',
                    description: 'Signed contract or service agreement',
                    required: false,
                    stage_id: stageId,
                    file_types: ['pdf'],
                    max_size_mb: 20
                }
            ],
            'Procurement Planning': [
                {
                    id: `${stageId}_procurement_plan`,
                    type: 'procurement_plan',
                    name: 'Procurement Plan',
                    description: 'Material procurement and sourcing plan',
                    required: false,
                    stage_id: stageId,
                    file_types: ['xlsx', 'pdf', 'doc'],
                    max_size_mb: 10
                },
                {
                    id: `${stageId}_supplier_pos`,
                    type: 'supplier_po',
                    name: 'Supplier Purchase Orders',
                    description: 'Purchase orders sent to suppliers',
                    required: false,
                    stage_id: stageId,
                    file_types: ['pdf', 'doc'],
                    max_size_mb: 50
                }
            ],
            'In Production': [
                {
                    id: `${stageId}_work_order`,
                    type: 'work_order',
                    name: 'Work Order',
                    description: 'Production work order and instructions',
                    required: true,
                    stage_id: stageId,
                    file_types: ['pdf', 'doc', 'docx'],
                    max_size_mb: 20
                },
                {
                    id: `${stageId}_quality_plan`,
                    type: 'quality_plan',
                    name: 'Quality Control Plan',
                    description: 'Quality control and inspection procedures',
                    required: false,
                    stage_id: stageId,
                    file_types: ['pdf', 'doc', 'xlsx'],
                    max_size_mb: 15
                }
            ],
            'Shipped & Closed': [
                {
                    id: `${stageId}_shipping_docs`,
                    type: 'shipping_document',
                    name: 'Shipping Documents',
                    description: 'Shipping labels, packing lists, and delivery documentation',
                    required: true,
                    stage_id: stageId,
                    file_types: ['pdf', 'doc'],
                    max_size_mb: 10
                },
                {
                    id: `${stageId}_delivery_confirmation`,
                    type: 'delivery_confirmation',
                    name: 'Delivery Confirmation',
                    description: 'Proof of delivery and customer acceptance',
                    required: false,
                    stage_id: stageId,
                    file_types: ['pdf', 'jpg', 'png'],
                    max_size_mb: 5
                }
            ]
        };

        return baseRequirements[stageName] || [];
    }

    /**
     * Get document category for grouping
     */
    private getDocumentCategory(type: string): string {
        const categoryMap: Record<string, string> = {
            'rfq': 'Customer Documents',
            'specification': 'Technical Documents',
            'drawing': 'Technical Documents',
            'bom': 'Technical Documents',
            'quote': 'Commercial Documents',
            'purchase_order': 'Commercial Documents',
            'contract': 'Legal Documents',
            'work_order': 'Production Documents',
            'quality_plan': 'Quality Documents',
            'shipping_document': 'Logistics Documents',
            'delivery_confirmation': 'Logistics Documents'
        };

        return categoryMap[type] || 'Other Documents';
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.cachedRequirements.clear();
        this.cacheTimestamp = 0;
    }
}

// Export singleton instance
export const documentRequirementsService = new DocumentRequirementsService();