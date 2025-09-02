import { supabase } from '@/integrations/supabase/client';
import { Project, WorkflowStage } from '@/types/project';
import { approvalService } from './approvalService';

export interface PrerequisiteCheck {
    id: string;
    name: string;
    description: string;
    status: 'passed' | 'failed' | 'warning' | 'pending';
    required: boolean;
    details?: string;
    category: 'project_data' | 'documents' | 'approvals' | 'stage_specific' | 'system';
}

export interface PrerequisiteResult {
    allPassed: boolean;
    requiredPassed: boolean;
    checks: PrerequisiteCheck[];
    errors: string[];
    warnings: string[];
    blockers: string[];
}

class PrerequisiteChecker {
    /**
     * Perform comprehensive prerequisite checks for stage transition
     */
    async checkPrerequisites(
        project: Project,
        targetStage: WorkflowStage,
        currentStage?: WorkflowStage
    ): Promise<PrerequisiteResult> {
        const checks: PrerequisiteCheck[] = [];
        const errors: string[] = [];
        const warnings: string[] = [];
        const blockers: string[] = [];

        try {
            // 1. Basic project data checks
            const projectDataChecks = await this.checkProjectData(project);
            checks.push(...projectDataChecks);

            // 2. Document requirements check
            const documentChecks = await this.checkDocumentRequirements(project, targetStage);
            checks.push(...documentChecks);

            // 3. Approval requirements check
            const approvalChecks = await this.checkApprovalRequirements(project, targetStage);
            checks.push(...approvalChecks);

            // 4. Stage-specific checks
            const stageSpecificChecks = await this.checkStageSpecificRequirements(project, targetStage, currentStage);
            checks.push(...stageSpecificChecks);

            // 5. System checks (permissions, etc.)
            const systemChecks = await this.checkSystemRequirements(project, targetStage);
            checks.push(...systemChecks);

            // Analyze results
            const failedChecks = checks.filter(c => c.status === 'failed');
            const requiredFailedChecks = failedChecks.filter(c => c.required);
            const warningChecks = checks.filter(c => c.status === 'warning');

            // Collect errors and warnings
            requiredFailedChecks.forEach(check => {
                errors.push(`${check.name}: ${check.details || check.description}`);
                if (check.required) {
                    blockers.push(check.name);
                }
            });

            warningChecks.forEach(check => {
                warnings.push(`${check.name}: ${check.details || check.description}`);
            });

            return {
                allPassed: failedChecks.length === 0,
                requiredPassed: requiredFailedChecks.length === 0,
                checks,
                errors,
                warnings,
                blockers
            };

        } catch (error) {
            console.error('Error checking prerequisites:', error);

            // Return error state
            return {
                allPassed: false,
                requiredPassed: false,
                checks: [{
                    id: 'system_error',
                    name: 'System Error',
                    description: 'Failed to check prerequisites',
                    status: 'failed',
                    required: true,
                    details: 'An error occurred while checking prerequisites. Please try again.',
                    category: 'system'
                }],
                errors: ['System error occurred while checking prerequisites'],
                warnings: [],
                blockers: ['System Error']
            };
        }
    }

    /**
     * Check basic project data completeness
     */
    private async checkProjectData(project: Project): Promise<PrerequisiteCheck[]> {
        const checks: PrerequisiteCheck[] = [];

        // Project title check
        checks.push({
            id: 'project_title',
            name: 'Project Title',
            description: 'Project has a valid title',
            status: project.title && project.title.trim().length > 0 ? 'passed' : 'failed',
            required: true,
            details: project.title ? undefined : 'Project title is required',
            category: 'project_data'
        });

        // Project description check
        checks.push({
            id: 'project_description',
            name: 'Project Description',
            description: 'Project has a description',
            status: project.description && project.description.trim().length > 0 ? 'passed' : 'warning',
            required: false,
            details: project.description ? undefined : 'Project description helps with tracking and communication',
            category: 'project_data'
        });

        // Customer information check
        checks.push({
            id: 'customer_info',
            name: 'Customer Information',
            description: 'Customer is assigned to project',
            status: project.customer_id ? 'passed' : 'failed',
            required: true,
            details: project.customer_id ? undefined : 'Customer must be assigned to the project',
            category: 'project_data'
        });

        // Project priority check
        checks.push({
            id: 'project_priority',
            name: 'Project Priority',
            description: 'Project priority is set',
            status: project.priority_level ? 'passed' : 'warning',
            required: false,
            details: project.priority_level ? undefined : 'Setting priority helps with resource allocation',
            category: 'project_data'
        });

        return checks;
    }

    /**
     * Check document requirements for the target stage
     */
    private async checkDocumentRequirements(
        project: Project,
        targetStage: WorkflowStage
    ): Promise<PrerequisiteCheck[]> {
        const checks: PrerequisiteCheck[] = [];

        try {
            // Get documents for this project - FIX: Remove is_active since it doesn't exist in table
            const { data: documents, error } = await supabase
                .from('documents')
                .select('id, category, file_name')
                .eq('project_id', project.id);

            if (error) {
                console.error('Error fetching documents:', error);
                checks.push({
                    id: 'documents_fetch_error',
                    name: 'Document Check Error',
                    description: 'Failed to check document requirements',
                    status: 'warning',
                    required: false,
                    details: 'Could not verify document requirements',
                    category: 'documents'
                });
                return checks;
            }

            // Define stage-specific document requirements
            const documentRequirements = this.getStageDocumentRequirements(targetStage.name);

            documentRequirements.forEach(requirement => {
                const hasDocument = documents?.some(doc =>
                    doc.category === requirement.type ||
                    doc.file_name?.toLowerCase().includes(requirement.type.toLowerCase())
                );

                checks.push({
                    id: `document_${requirement.type}`,
                    name: requirement.name,
                    description: requirement.description,
                    status: hasDocument ? 'passed' : (requirement.required ? 'failed' : 'warning'),
                    required: requirement.required,
                    details: hasDocument ? undefined : `${requirement.name} is ${requirement.required ? 'required' : 'recommended'} for this stage`,
                    category: 'documents'
                });
            });

            // General document check
            if (documents && documents.length === 0) {
                checks.push({
                    id: 'general_documents',
                    name: 'Project Documents',
                    description: 'Project has supporting documents',
                    status: 'warning',
                    required: false,
                    details: 'Consider uploading relevant project documents',
                    category: 'documents'
                });
            }

        } catch (error) {
            console.error('Error in checkDocumentRequirements:', error);
            checks.push({
                id: 'documents_error',
                name: 'Document Check Error',
                description: 'Error checking document requirements',
                status: 'warning',
                required: false,
                details: 'Could not verify document requirements',
                category: 'documents'
            });
        }

        return checks;
    }

    /**
     * Check approval requirements for the target stage
     */
    private async checkApprovalRequirements(
        project: Project,
        targetStage: WorkflowStage
    ): Promise<PrerequisiteCheck[]> {
        const checks: PrerequisiteCheck[] = [];

        try {
            // Use the approval service to get comprehensive approval status
            const approvalStatus = await approvalService.getApprovalStatus(project.id, targetStage.id);

            if (approvalStatus.required.length === 0) {
                // No approvals required
                checks.push({
                    id: 'no_approvals_required',
                    name: 'Approvals',
                    description: 'No approvals required for this stage',
                    status: 'passed',
                    required: false,
                    details: 'This stage does not require approvals',
                    category: 'approvals'
                });
            } else {
                // Add a summary check for overall approval status
                let overallStatus: 'passed' | 'failed' | 'warning' = 'passed';
                let overallDetails = 'All required approvals have been obtained';
                
                if (approvalStatus.rejected.length > 0) {
                    overallStatus = 'failed';
                    overallDetails = `${approvalStatus.rejected.length} approval(s) rejected`;
                } else if (approvalStatus.pending.length > 0) {
                    overallStatus = 'warning';
                    overallDetails = `${approvalStatus.pending.length} approval(s) pending`;
                } else if (!approvalStatus.isComplete) {
                    overallStatus = 'failed';
                    overallDetails = 'Not all required approvals have been obtained';
                }

                checks.push({
                    id: 'approval_status_overview',
                    name: 'Approval Status',
                    description: 'Overall approval status for this stage',
                    status: overallStatus,
                    required: true,
                    details: overallDetails,
                    category: 'approvals'
                });

                // Check each required approval role
                approvalStatus.required.forEach(role => {
                    const hasApproval = approvalStatus.approved.some(a => a.approver_role === role);
                    const isRejected = approvalStatus.rejected.some(a => a.approver_role === role);
                    const isPending = approvalStatus.pending.some(a => a.approver_role === role);

                    let status: 'passed' | 'failed' | 'warning' = 'failed';
                    let details = `${role} approval is required for this stage`;

                    if (hasApproval) {
                        status = 'passed';
                        details = `${role} approval granted`;
                    } else if (isRejected) {
                        status = 'failed';
                        details = `${role} approval was rejected`;
                    } else if (isPending) {
                        status = 'warning';
                        details = `${role} approval is pending`;
                    }

                    checks.push({
                        id: `approval_${role}`,
                        name: `${role} Approval`,
                        description: `Approval from ${role} role`,
                        status,
                        required: true,
                        details,
                        category: 'approvals'
                    });
                });

                // Add overall approval status check
                if (approvalStatus.isComplete) {
                    checks.push({
                        id: 'all_approvals_complete',
                        name: 'All Approvals Complete',
                        description: 'All required approvals have been obtained',
                        status: 'passed',
                        required: true,
                        details: 'Stage transition can proceed',
                        category: 'approvals'
                    });
                } else if (approvalStatus.rejected.length > 0) {
                    checks.push({
                        id: 'approvals_rejected',
                        name: 'Approvals Rejected',
                        description: 'Some approvals have been rejected',
                        status: 'failed',
                        required: true,
                        details: 'Address rejected approvals before proceeding. Rejected approvals: ' + 
                                approvalStatus.rejected.map(a => a.approver_role).join(', '),
                        category: 'approvals'
                    });
                } else if (approvalStatus.pending.length > 0) {
                    checks.push({
                        id: 'approvals_pending',
                        name: 'Approvals Pending',
                        description: 'Waiting for approval decisions',
                        status: 'warning',
                        required: true,
                        details: `${approvalStatus.pending.length} approval(s) still pending: ` + 
                                approvalStatus.pending.map(a => a.approver_role).join(', '),
                        category: 'approvals'
                    });
                } else {
                    checks.push({
                        id: 'approvals_incomplete',
                        name: 'Approvals Incomplete',
                        description: 'Required approvals not yet requested',
                        status: 'warning',
                        required: true,
                        details: 'Approvals have not been requested yet. Click "Request Approvals" to begin the process.',
                        category: 'approvals'
                    });
                }
            }

        } catch (error) {
            console.error('Error in checkApprovalRequirements:', error);
            checks.push({
                id: 'approval_error',
                name: 'Approval Check Error',
                description: 'Error checking approval requirements',
                status: 'warning',
                required: false,
                details: 'Could not verify approval requirements',
                category: 'approvals'
            });
        }

        return checks;
    }

    /**
     * Check stage-specific requirements
     */
    private async checkStageSpecificRequirements(
        project: Project,
        targetStage: WorkflowStage,
        currentStage?: WorkflowStage
    ): Promise<PrerequisiteCheck[]> {
        const checks: PrerequisiteCheck[] = [];

        // Stage-specific business logic checks
        switch (targetStage.name) {
            case 'Technical Review':
                checks.push({
                    id: 'technical_readiness',
                    name: 'Technical Readiness',
                    description: 'Project is ready for technical review',
                    status: project.description && project.description.length > 50 ? 'passed' : 'warning',
                    required: false,
                    details: 'Detailed project description helps with technical review',
                    category: 'stage_specific'
                });
                break;

            case 'Supplier RFQ':
                checks.push({
                    id: 'review_completion',
                    name: 'Review Completion',
                    description: 'Technical reviews should be completed',
                    status: 'warning', // Would check actual review status in real implementation
                    required: false,
                    details: 'Ensure engineering, QA, and production reviews are complete',
                    category: 'stage_specific'
                });
                break;

            case 'Quoted':
                // Check if supplier quotes exist
                checks.push({
                    id: 'supplier_quotes_available',
                    name: 'Supplier Quotes',
                    description: 'Supplier quotes have been received',
                    status: 'warning', // Would check actual quotes in real implementation
                    required: false,
                    details: 'At least one supplier quote should be available',
                    category: 'stage_specific'
                });
                break;

            case 'Order Confirmed':
                checks.push({
                    id: 'quote_approval',
                    name: 'Quote Approval',
                    description: 'Quote has been approved by customer',
                    status: project.estimated_value && project.estimated_value > 0 ? 'passed' : 'failed',
                    required: true,
                    details: project.estimated_value ? undefined : 'Project value must be set before order confirmation',
                    category: 'stage_specific'
                });
                break;

            case 'Procurement Planning':
                checks.push({
                    id: 'order_details',
                    name: 'Order Details',
                    description: 'Order details are complete',
                    status: project.due_date ? 'passed' : 'warning',
                    required: false,
                    details: 'Due date helps with procurement planning',
                    category: 'stage_specific'
                });
                break;

            case 'In Production':
                checks.push({
                    id: 'procurement_complete',
                    name: 'Procurement Complete',
                    description: 'Materials and resources are secured',
                    status: 'warning', // Would check procurement status in real implementation
                    required: false,
                    details: 'Ensure all materials are ordered and production is scheduled',
                    category: 'stage_specific'
                });
                break;

            case 'Shipped & Closed':
                checks.push({
                    id: 'production_complete',
                    name: 'Production Complete',
                    description: 'Production is finished and quality approved',
                    status: 'warning', // Would check production status in real implementation
                    required: false,
                    details: 'Product must be manufactured and pass quality checks',
                    category: 'stage_specific'
                });
                break;
        }

        return checks;
    }

    /**
     * Check system requirements (permissions, etc.)
     */
    private async checkSystemRequirements(
        project: Project,
        targetStage: WorkflowStage
    ): Promise<PrerequisiteCheck[]> {
        const checks: PrerequisiteCheck[] = [];

        // Check if user has permission to advance to this stage
        // This would integrate with the permission system
        checks.push({
            id: 'user_permissions',
            name: 'User Permissions',
            description: 'User has permission to advance to this stage',
            status: 'passed', // Would check actual permissions in real implementation
            required: true,
            details: undefined,
            category: 'system'
        });

        // Check if stage transition is valid (not skipping too many stages)
        const currentStageOrder = project.current_stage_order || 0;
        const targetStageOrder = targetStage.stage_order;
        const stageSkip = targetStageOrder - currentStageOrder;

        if (stageSkip > 1) {
            checks.push({
                id: 'stage_skip_validation',
                name: 'Stage Skip Validation',
                description: 'Skipping stages requires manager approval',
                status: 'warning',
                required: false,
                details: `Skipping ${stageSkip - 1} stage(s) may require manager approval`,
                category: 'system'
            });
        }

        return checks;
    }

    /**
     * Get document requirements for a specific stage
     */
    private getStageDocumentRequirements(stageName: string): Array<{
        type: string;
        name: string;
        description: string;
        required: boolean;
    }> {
        const requirements: Record<string, Array<{
            type: string;
            name: string;
            description: string;
            required: boolean;
        }>> = {
            'Technical Review': [
                {
                    type: 'rfq',
                    name: 'RFQ Document',
                    description: 'Customer RFQ or specification document',
                    required: true
                },
                {
                    type: 'drawing',
                    name: 'Technical Drawings',
                    description: 'CAD drawings or technical specifications',
                    required: false
                }
            ],
            'Supplier RFQ': [
                {
                    type: 'bom',
                    name: 'Bill of Materials',
                    description: 'Detailed BOM for supplier quoting',
                    required: true
                },
                {
                    type: 'specification',
                    name: 'Technical Specifications',
                    description: 'Detailed technical requirements',
                    required: false
                }
            ],
            'Quoted': [
                {
                    type: 'quote',
                    name: 'Customer Quote',
                    description: 'Generated customer quote document',
                    required: true
                },
                {
                    type: 'supplier_quote',
                    name: 'Supplier Quotes',
                    description: 'Received supplier quotations',
                    required: false
                }
            ],
            'Order Confirmed': [
                {
                    type: 'po',
                    name: 'Purchase Order',
                    description: 'Customer purchase order',
                    required: true
                },
                {
                    type: 'contract',
                    name: 'Contract/Agreement',
                    description: 'Signed contract or agreement',
                    required: false
                }
            ],
            'In Production': [
                {
                    type: 'work_order',
                    name: 'Work Order',
                    description: 'Production work order',
                    required: true
                },
                {
                    type: 'quality_plan',
                    name: 'Quality Plan',
                    description: 'Quality control and inspection plan',
                    required: false
                }
            ],
            'Shipped & Closed': [
                {
                    type: 'shipping_doc',
                    name: 'Shipping Documents',
                    description: 'Shipping and delivery documentation',
                    required: true
                },
                {
                    type: 'delivery_confirmation',
                    name: 'Delivery Confirmation',
                    description: 'Proof of delivery',
                    required: false
                }
            ]
        };

        return requirements[stageName] || [];
    }
}

// Export singleton instance
export const prerequisiteChecker = new PrerequisiteChecker();