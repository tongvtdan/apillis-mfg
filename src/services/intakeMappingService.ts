import { ProjectType, IntakeType, ProjectPriority } from '@/types/project';

export interface IntakeMapping {
    intakeType: IntakeType;
    defaultProjectType: ProjectType;
    initialStageSlug: string;
    workflow: string;
    priority: ProjectPriority;
    description: string;
}

export const INTAKE_MAPPINGS: Record<string, IntakeMapping> = {
    'RFQ': {
        intakeType: 'rfq',
        defaultProjectType: 'fabrication',
        initialStageSlug: 'inquiry_received',
        workflow: 'quote_workflow',
        priority: 'medium',
        description: 'Request for quotation - typically leads to fabrication projects'
    },
    'Purchase Order': {
        intakeType: 'purchase_order',
        defaultProjectType: 'manufacturing',
        initialStageSlug: 'order_confirmed',
        workflow: 'production_workflow',
        priority: 'high',
        description: 'Purchase order - typically leads to manufacturing projects'
    },
    'Project Idea': {
        intakeType: 'project_idea',
        defaultProjectType: 'system_build',
        initialStageSlug: 'technical_review',
        workflow: 'development_workflow',
        priority: 'low',
        description: 'Project idea - typically leads to system build projects'
    }
};

export class IntakeMappingService {
    /**
     * Get mapping for a specific intake type
     */
    static getMapping(intakeType: string): IntakeMapping | null {
        return INTAKE_MAPPINGS[intakeType] || null;
    }

    /**
     * Get all available intake types
     */
    static getIntakeTypes(): string[] {
        return Object.keys(INTAKE_MAPPINGS);
    }

    /**
     * Determine project type based on intake type and form data
     * This can be enhanced with AI/ML in the future
     */
    static determineProjectType(intakeType: string, formData?: any): ProjectType {
        const mapping = this.getMapping(intakeType);
        if (!mapping) {
            // Default fallback
            return 'fabrication';
        }

        // TODO: Add logic to analyze formData and determine more specific project type
        // For now, use the default mapping
        return mapping.defaultProjectType;
    }

    /**
     * Get initial stage slug for an intake type
     */
    static getInitialStageSlug(intakeType: string): string {
        const mapping = this.getMapping(intakeType);
        return mapping?.initialStageSlug || 'inquiry_received';
    }

    /**
     * Get priority for an intake type
     */
    static getPriority(intakeType: string): ProjectPriority {
        const mapping = this.getMapping(intakeType);
        return mapping?.priority || 'medium';
    }
}
