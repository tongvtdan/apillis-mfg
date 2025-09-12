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
    // Additional database fields
    volume?: string;
    target_price_per_unit?: number;
    desired_delivery_date?: string;
    project_reference?: string;
    status?: 'draft' | 'in_progress'; // Updated status field
}

export class ProjectIntakeService {
    /**
     * Create a project from intake data with proper mapping
     */
    static async createProjectFromIntake(
        intakeData: ProjectIntakeData,
        organizationId: string,
        createProjectFn: any,
        preGeneratedProjectId?: string
    ): Promise<Project> {
        try {
            console.log('🚀 Starting project creation from intake:', {
                intakeType: intakeData.intake_type,
                organizationId,
                title: intakeData.title
            });

            // Get intake mapping
            const mapping = IntakeMappingService.getMapping(intakeData.intake_type);
            if (!mapping) {
                throw new Error(`No mapping found for intake type: ${intakeData.intake_type}`);
            }
            console.log('✅ Intake mapping found:', mapping);

            // Determine project type
            const projectType = IntakeMappingService.determineProjectType(intakeData.intake_type, intakeData);
            console.log('✅ Project type determined:', projectType);

            // Get initial stage ID
            const initialStageId = await IntakeWorkflowService.getInitialStageId(intakeData.intake_type, organizationId);
            console.log('✅ Initial stage ID:', initialStageId);

            // Fallback to first available stage if specific stage not found
            let stageId = initialStageId || await IntakeWorkflowService.getFirstAvailableStage(organizationId);
            console.log('✅ Final stage ID:', stageId);

            // Override stageId for 'in_progress' projects to always use inquiry_received stage
            if (intakeData.status === 'in_progress') {
                stageId = '880e8400-e29b-41d4-a716-446655440001'; // inquiry_received stage
                console.log('🔄 Overriding stage ID for in_progress project to inquiry_received:', stageId);
            }

            if (!stageId) {
                throw new Error('No workflow stage found for project creation');
            }

            // Get priority from mapping
            const priority = IntakeMappingService.getPriority(intakeData.intake_type);
            console.log('✅ Priority determined:', priority);

            // Prepare tags
            const tags = [
                intakeData.intake_type.toLowerCase().replace(' ', '_'),
                projectType,
                ...(intakeData.tags || [])
            ];
            console.log('✅ Tags prepared:', tags);

            // Create project with intake-specific data
            console.log('🚀 Creating project with data:', {
                organization_id: organizationId,
                title: intakeData.title,
                customer_organization_id: intakeData.customer_organization_id,
                priority_level: priority,
                current_stage_id: stageId
            });

            const project = await createProjectFn({
                organization_id: organizationId, // Ensure organization_id is passed
                title: intakeData.title || `${intakeData.intake_type} from ${intakeData.contact_name || 'Customer'}`,
                description: intakeData.description,
                customer_organization_id: intakeData.customer_organization_id,
                point_of_contacts: intakeData.point_of_contacts || [],
                priority: priority, // Use correct field name for useProjectCreation
                estimated_value: intakeData.estimated_value,
                due_date: intakeData.due_date, // Map to correct field name
                notes: intakeData.notes,
                tags: tags,
                intake_type: mapping.intakeType,
                intake_source: intakeData.intake_source || 'portal',
                project_type: projectType,
                current_stage_id: stageId,
                status: intakeData.status, // Pass the status if provided
                // Pre-generated project ID
                project_id: preGeneratedProjectId,
                // Store additional fields in metadata JSONB
                metadata: {
                    contact_name: intakeData.contact_name,
                    contact_email: intakeData.contact_email,
                    contact_phone: intakeData.contact_phone,
                    volume: intakeData.volume,
                    target_price_per_unit: intakeData.target_price_per_unit,
                    desired_delivery_date: intakeData.desired_delivery_date,
                    project_reference: intakeData.project_reference
                }
            });

            console.log('✅ Project created successfully:', project);
            return project;
        } catch (error) {
            console.error('❌ Error creating project from intake:', error);
            // Make sure the error is properly propagated
            if (error instanceof Error) {
                throw new Error(`Failed to create project from intake: ${error.message}`);
            } else {
                throw new Error('Failed to create project from intake: Unknown error occurred');
            }
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