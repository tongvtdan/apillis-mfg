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
    'rfq': {
        intakeType: 'rfq',
        defaultProjectType: 'fabrication',
        initialStageSlug: 'inquiry_received',
        workflow: 'quote_workflow',
        priority: 'normal',
        description: 'Request for quotation - typically leads to fabrication projects'
    },
    'po': {
        intakeType: 'purchase_order',
        defaultProjectType: 'manufacturing',
        initialStageSlug: 'order_confirmed',
        workflow: 'production_workflow',
        priority: 'high',
        description: 'Purchase order - typically leads to manufacturing projects'
    },
    'design_idea': {
        intakeType: 'project_idea',
        defaultProjectType: 'system_build',
        initialStageSlug: 'technical_review',
        workflow: 'development_workflow',
        priority: 'low',
        description: 'Project idea - typically leads to system build projects'
    },
    'inquiry': {
        intakeType: 'rfq',
        defaultProjectType: 'fabrication',
        initialStageSlug: 'inquiry_received',
        workflow: 'quote_workflow',
        priority: 'normal',
        description: 'General inquiry - typically leads to fabrication projects'
    }
};

export class IntakeMappingService {
    /**
     * Convert display name to internal intake type value
     */
    static getInternalIntakeType(displayName: string): string {
        const mapping: Record<string, string> = {
            'RFQ': 'rfq',
            'Purchase Order': 'po',
            'Project Idea': 'design_idea'
        };
        return mapping[displayName] || displayName.toLowerCase();
    }

    /**
     * Get mapping for a specific intake type
     */
    static getMapping(intakeType: string): IntakeMapping | null {
        console.log('🔍 Looking up intake type mapping for:', intakeType);
        const mapping = INTAKE_MAPPINGS[intakeType] || null;
        if (mapping) {
            console.log('✅ Found mapping:', mapping);
        } else {
            console.log('❌ No mapping found for intake type:', intakeType);
            console.log('Available mappings:', Object.keys(INTAKE_MAPPINGS));
        }
        return mapping;
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
        return mapping?.priority || 'normal';
    }
}
