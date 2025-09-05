import { Project, ProjectType, IntakeType, IntakeSource } from '@/types/project';
import { IntakeMappingService } from '@/services/intakeMappingService';
import { IntakeWorkflowService } from '@/services/intakeWorkflowService';
import { useProjects } from '@/hooks/useProjects';

export interface ProjectIntakeData {
    title: string;
    description?: string;
    customer_organization_id?: string;
    point_of_contacts?: string[];
    priority?: string;
    estimated_value?: number;
    due_date?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    notes?: string;
    tags?: string[];
    intake_type: string;
    intake_source?: IntakeSource;
}

export class ProjectIntakeService {
    /**
     * Create a project from intake data with proper mapping
     */
    static async createProjectFromIntake(
        intakeData: ProjectIntakeData,
        organizationId: string,
        createProjectFn: any
    ): Promise<Project> {
        try {
            // Get intake mapping
            const mapping = IntakeMappingService.getMapping(intakeData.intake_type);
            if (!mapping) {
                throw new Error(`Unknown intake type: ${intakeData.intake_type}`);
            }

            // Determine project type
            const projectType = IntakeMappingService.determineProjectType(intakeData.intake_type, intakeData);

            // Get initial stage ID
            const initialStageId = await IntakeWorkflowService.getInitialStageId(intakeData.intake_type, organizationId);

            // Fallback to first available stage if specific stage not found
            const stageId = initialStageId || await IntakeWorkflowService.getFirstAvailableStage(organizationId);

            // Get priority from mapping
            const priority = IntakeMappingService.getPriority(intakeData.intake_type);

            // Prepare tags
            const tags = [
                intakeData.intake_type.toLowerCase().replace(' ', '_'),
                projectType,
                ...(intakeData.tags || [])
            ];

            // Create project with intake-specific data
            const project = await createProjectFn({
                title: intakeData.title || `${intakeData.intake_type} from ${intakeData.contact_name || 'Customer'}`,
                description: intakeData.description,
                customer_organization_id: intakeData.customer_organization_id,
                point_of_contacts: intakeData.point_of_contacts || [],
                priority: priority,
                estimated_value: intakeData.estimated_value,
                due_date: intakeData.due_date,
                contact_name: intakeData.contact_name,
                contact_email: intakeData.contact_email,
                contact_phone: intakeData.contact_phone,
                notes: intakeData.notes,
                tags: tags,
                intake_type: mapping.intakeType,
                intake_source: intakeData.intake_source || 'portal',
                project_type: projectType,
                current_stage_id: stageId
            });

            return project;
        } catch (error) {
            console.error('Error creating project from intake:', error);
            throw error;
        }
    }

    /**
     * Get intake type mapping information
     */
    static getIntakeMapping(intakeType: string) {
        return IntakeMappingService.getMapping(intakeType);
    }

    /**
     * Get all available intake types
     */
    static getAvailableIntakeTypes() {
        return IntakeMappingService.getIntakeTypes();
    }
}
