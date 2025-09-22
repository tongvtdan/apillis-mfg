import { Project, WorkflowStage, ProjectSubStageProgress } from '@/types/project';
import { supabase } from '@/integrations/supabase/client.ts';

export interface ExitCriteriaResult {
    canAdvance: boolean;
    errors: string[];
    warnings: string[];
    requiredActions: string[];
}

/**
 * Base class for workflow exit criteria validators
 */
export abstract class ExitCriteriaValidator {
    abstract validate(
        project: Project,
        currentStage: WorkflowStage,
        subStageProgress: ProjectSubStageProgress[]
    ): Promise<ExitCriteriaResult>;
}

/**
 * Validator for document requirements
 * Checks if all required documents are uploaded and approved
 */
export class DocumentRequirementsValidator extends ExitCriteriaValidator {
    async validate(
        project: Project,
        currentStage: WorkflowStage,
        subStageProgress: ProjectSubStageProgress[]
    ): Promise<ExitCriteriaResult> {
        const errors: string[] = [];
        const warnings: string[] = [];
        const requiredActions: string[] = [];

        try {
            // Get required documents for current stage
            const { data: requiredDocs, error } = await supabase
                .from('document_requirements')
                .select(`
                    *,
                    document_categories (
                        name,
                        code
                    )
                `)
                .eq('stage_id', currentStage.id)
                .eq('is_required', true);

            if (error) {
                console.error('Error fetching document requirements:', error);
                return {
                    canAdvance: false,
                    errors: ['Failed to validate document requirements'],
                    warnings: [],
                    requiredActions: []
                };
            }

            if (!requiredDocs || requiredDocs.length === 0) {
                return {
                    canAdvance: true,
                    errors: [],
                    warnings: [],
                    requiredActions: []
                };
            }

            // Check if all required documents are uploaded
            for (const reqDoc of requiredDocs) {
                const { data: uploadedDocs, error: docError } = await supabase
                    .from('documents')
                    .select('id, status, document_category_id')
                    .eq('project_id', project.id)
                    .eq('document_category_id', reqDoc.document_category_id);

                if (docError) {
                    console.error('Error checking uploaded documents:', docError);
                    continue;
                }

                if (!uploadedDocs || uploadedDocs.length === 0) {
                    errors.push(`Required document missing: ${reqDoc.document_categories?.name || 'Unknown'}`);
                    requiredActions.push(`Upload ${reqDoc.document_categories?.name || 'required document'}`);
                } else {
                    // Check if document is approved
                    const hasApprovedDoc = uploadedDocs.some(doc => doc.status === 'approved');
                    if (!hasApprovedDoc) {
                        warnings.push(`Document pending approval: ${reqDoc.document_categories?.name || 'Unknown'}`);
                        requiredActions.push(`Get approval for ${reqDoc.document_categories?.name || 'document'}`);
                    }
                }
            }

            return {
                canAdvance: errors.length === 0,
                errors,
                warnings,
                requiredActions
            };
        } catch (error) {
            console.error('Error in DocumentRequirementsValidator:', error);
            return {
                canAdvance: false,
                errors: ['Failed to validate document requirements'],
                warnings: [],
                requiredActions: []
            };
        }
    }
}

/**
 * Validator for sub-stage completion
 * Checks if all required sub-stages are completed
 */
export class SubStageCompletionValidator extends ExitCriteriaValidator {
    async validate(
        project: Project,
        currentStage: WorkflowStage,
        subStageProgress: ProjectSubStageProgress[]
    ): Promise<ExitCriteriaResult> {
        const errors: string[] = [];
        const warnings: string[] = [];
        const requiredActions: string[] = [];

        try {
            // Get required sub-stages for current stage
            const { data: requiredSubStages, error } = await supabase
                .from('workflow_sub_stages')
                .select('*')
                .eq('stage_id', currentStage.id)
                .eq('is_required', true);

            if (error) {
                console.error('Error fetching required sub-stages:', error);
                return {
                    canAdvance: false,
                    errors: ['Failed to validate sub-stage completion'],
                    warnings: [],
                    requiredActions: []
                };
            }

            if (!requiredSubStages || requiredSubStages.length === 0) {
                return {
                    canAdvance: true,
                    errors: [],
                    warnings: [],
                    requiredActions: []
                };
            }

            // Check completion status of each required sub-stage
            for (const reqSubStage of requiredSubStages) {
                const progress = subStageProgress.find(p => p.sub_stage_id === reqSubStage.id);

                if (!progress) {
                    errors.push(`Sub-stage not started: ${reqSubStage.name}`);
                    requiredActions.push(`Start ${reqSubStage.name}`);
                } else if (progress.status === 'pending') {
                    errors.push(`Sub-stage pending: ${reqSubStage.name}`);
                    requiredActions.push(`Complete ${reqSubStage.name}`);
                } else if (progress.status === 'in_progress') {
                    warnings.push(`Sub-stage in progress: ${reqSubStage.name}`);
                    requiredActions.push(`Complete ${reqSubStage.name}`);
                } else if (progress.status === 'blocked') {
                    errors.push(`Sub-stage blocked: ${reqSubStage.name}`);
                    requiredActions.push(`Resolve blockers for ${reqSubStage.name}`);
                }
            }

            return {
                canAdvance: errors.length === 0,
                errors,
                warnings,
                requiredActions
            };
        } catch (error) {
            console.error('Error in SubStageCompletionValidator:', error);
            return {
                canAdvance: false,
                errors: ['Failed to validate sub-stage completion'],
                warnings: [],
                requiredActions: []
            };
        }
    }
}

/**
 * Validator for approval requirements
 * Checks if all required approvals are obtained
 */
export class ApprovalRequirementsValidator extends ExitCriteriaValidator {
    async validate(
        project: Project,
        currentStage: WorkflowStage,
        subStageProgress: ProjectSubStageProgress[]
    ): Promise<ExitCriteriaResult> {
        const errors: string[] = [];
        const warnings: string[] = [];
        const requiredActions: string[] = [];

        try {
            // Get pending approvals for the project
            const { data: pendingApprovals, error } = await supabase
                .from('approvals')
                .select(`
                    *,
                    approval_chains (
                        name,
                        description
                    )
                `)
                .eq('project_id', project.id)
                .eq('status', 'pending');

            if (error) {
                console.error('Error fetching pending approvals:', error);
                return {
                    canAdvance: false,
                    errors: ['Failed to validate approval requirements'],
                    warnings: [],
                    requiredActions: []
                };
            }

            if (pendingApprovals && pendingApprovals.length > 0) {
                for (const approval of pendingApprovals) {
                    errors.push(`Pending approval: ${approval.approval_chains?.name || 'Unknown'}`);
                    requiredActions.push(`Get approval for ${approval.approval_chains?.name || 'item'}`);
                }
            }

            return {
                canAdvance: errors.length === 0,
                errors,
                warnings,
                requiredActions
            };
        } catch (error) {
            console.error('Error in ApprovalRequirementsValidator:', error);
            return {
                canAdvance: false,
                errors: ['Failed to validate approval requirements'],
                warnings: [],
                requiredActions: []
            };
        }
    }
}

/**
 * Validator for project status requirements
 * Checks if project status allows stage advancement
 */
export class ProjectStatusValidator extends ExitCriteriaValidator {
    async validate(
        project: Project,
        currentStage: WorkflowStage,
        subStageProgress: ProjectSubStageProgress[]
    ): Promise<ExitCriteriaResult> {
        const errors: string[] = [];
        const warnings: string[] = [];
        const requiredActions: string[] = [];

        // Check if project is active
        if (project.status !== 'active') {
            errors.push(`Project status is ${project.status}. Must be active to advance stages.`);
            requiredActions.push('Activate project');
        }

        // Check if project has required fields
        if (!project.customer_organization_id) {
            errors.push('Customer organization is required');
            requiredActions.push('Assign customer organization');
        }

        if (!project.title || project.title.trim() === '') {
            errors.push('Project title is required');
            requiredActions.push('Set project title');
        }

        return {
            canAdvance: errors.length === 0,
            errors,
            warnings,
            requiredActions
        };
    }
}

/**
 * Composite validator that runs all validators
 */
export class CompositeExitCriteriaValidator extends ExitCriteriaValidator {
    private validators: ExitCriteriaValidator[];

    constructor(validators: ExitCriteriaValidator[] = []) {
        super();
        this.validators = validators.length > 0 ? validators : [
            new ProjectStatusValidator(),
            new SubStageCompletionValidator(),
            new DocumentRequirementsValidator(),
            new ApprovalRequirementsValidator()
        ];
    }

    async validate(
        project: Project,
        currentStage: WorkflowStage,
        subStageProgress: ProjectSubStageProgress[]
    ): Promise<ExitCriteriaResult> {
        const allErrors: string[] = [];
        const allWarnings: string[] = [];
        const allRequiredActions: string[] = [];

        // Run all validators
        for (const validator of this.validators) {
            try {
                const result = await validator.validate(project, currentStage, subStageProgress);
                allErrors.push(...result.errors);
                allWarnings.push(...result.warnings);
                allRequiredActions.push(...result.requiredActions);
            } catch (error) {
                console.error('Error running validator:', error);
                allErrors.push('Validation error occurred');
            }
        }

        return {
            canAdvance: allErrors.length === 0,
            errors: allErrors,
            warnings: allWarnings,
            requiredActions: allRequiredActions
        };
    }
}
