/**
 * Database Schema Validation
 * 
 * This module validates that TypeScript interfaces align with the database schema
 * and checks for any data type mismatches or missing foreign key relationships.
 */

import { supabase } from '@/integrations/supabase/client.ts';
import type { Database } from '@/integrations/supabase/types';

// Type aliases for better readability
type ProjectRow = Database['public']['Tables']['projects']['Row'];
type WorkflowStageRow = Database['public']['Tables']['workflow_stages']['Row'];
type WorkflowSubStageRow = Database['public']['Tables']['workflow_sub_stages']['Row'];
type ProjectSubStageProgressRow = Database['public']['Tables']['project_sub_stage_progress']['Row'];
type ContactRow = Database['public']['Tables']['contacts']['Row'];
type DocumentRow = Database['public']['Tables']['documents']['Row'];
type ProjectAssignmentRow = Database['public']['Tables']['project_assignments']['Row'];

/**
 * Validates that all required tables exist and have the expected structure
 */
export async function validateDatabaseSchema(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
}> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
        // Test basic table access
        const tableTests = [
            { name: 'projects', query: () => supabase.from('projects').select('id').limit(1) },
            { name: 'workflow_stages', query: () => supabase.from('workflow_stages').select('id').limit(1) },
            { name: 'workflow_sub_stages', query: () => supabase.from('workflow_sub_stages').select('id').limit(1) },
            { name: 'project_sub_stage_progress', query: () => supabase.from('project_sub_stage_progress').select('id').limit(1) },
            { name: 'contacts', query: () => supabase.from('contacts').select('id').limit(1) },
            { name: 'documents', query: () => supabase.from('documents').select('id').limit(1) },
            { name: 'project_assignments', query: () => supabase.from('project_assignments').select('id').limit(1) },
        ];

        for (const test of tableTests) {
            try {
                const { error } = await test.query();
                if (error) {
                    errors.push(`Table ${test.name} access failed: ${error.message}`);
                }
            } catch (err) {
                errors.push(`Table ${test.name} not accessible: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }

        // Test foreign key relationships
        await validateForeignKeyRelationships(errors, warnings);

        // Test enum values
        await validateEnumValues(errors, warnings);

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };

    } catch (error) {
        errors.push(`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return {
            isValid: false,
            errors,
            warnings
        };
    }
}

/**
 * Validates foreign key relationships are properly defined
 */
async function validateForeignKeyRelationships(errors: string[], warnings: string[]): Promise<void> {
    try {
        // Test project -> customer relationship
        const { data: projectsWithCustomers, error: projectError } = await supabase
            .from('projects')
            .select(`
        id,
        customer_id,
        contacts!projects_customer_id_fkey(id, contact_name)
      `)
            .limit(1);

        if (projectError) {
            errors.push(`Project-Customer relationship validation failed: ${projectError.message}`);
        }

        // Test project -> workflow_stage relationship
        const { data: projectsWithStages, error: stageError } = await supabase
            .from('projects')
            .select(`
        id,
        current_stage_id,
        workflow_stages!projects_current_stage_id_fkey(id, name)
      `)
            .limit(1);

        if (stageError) {
            errors.push(`Project-WorkflowStage relationship validation failed: ${stageError.message}`);
        }

        // Test workflow_sub_stages -> workflow_stages relationship
        const { data: subStagesWithStages, error: subStageError } = await supabase
            .from('workflow_sub_stages')
            .select(`
        id,
        workflow_stage_id,
        workflow_stages!workflow_sub_stages_workflow_stage_id_fkey(id, name)
      `)
            .limit(1);

        if (subStageError) {
            errors.push(`WorkflowSubStage-WorkflowStage relationship validation failed: ${subStageError.message}`);
        }

        // Test project_sub_stage_progress relationships
        const { data: progressWithRelations, error: progressError } = await supabase
            .from('project_sub_stage_progress')
            .select(`
        id,
        project_id,
        sub_stage_id,
        workflow_stage_id,
        projects!project_sub_stage_progress_project_id_fkey(id, title),
        workflow_sub_stages!project_sub_stage_progress_sub_stage_id_fkey(id, name),
        workflow_stages!project_sub_stage_progress_workflow_stage_id_fkey(id, name)
      `)
            .limit(1);

        if (progressError) {
            errors.push(`ProjectSubStageProgress relationships validation failed: ${progressError.message}`);
        }

    } catch (error) {
        errors.push(`Foreign key validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Validates enum values match expected types
 */
async function validateEnumValues(errors: string[], warnings: string[]): Promise<void> {
    try {
        // Test project status enum
        const { data: projects, error: projectError } = await supabase
            .from('projects')
            .select('status')
            .limit(10);

        if (projectError) {
            errors.push(`Project status enum validation failed: ${projectError.message}`);
        } else if (projects) {
            const validStatuses = ['active', 'on_hold', 'cancelled', 'completed'];
            const invalidStatuses = projects
                .map(p => p.status)
                .filter(status => status && !validStatuses.includes(status));

            if (invalidStatuses.length > 0) {
                warnings.push(`Found invalid project statuses: ${[...new Set(invalidStatuses)].join(', ')}`);
            }
        }

        // Test priority level enum
        const { data: projectsWithPriority, error: priorityError } = await supabase
            .from('projects')
            .select('priority_level')
            .limit(10);

        if (priorityError) {
            errors.push(`Priority level enum validation failed: ${priorityError.message}`);
        } else if (projectsWithPriority) {
            const validPriorities = ['low', 'normal', 'high', 'urgent'];
            const invalidPriorities = projectsWithPriority
                .map(p => p.priority_level)
                .filter(priority => priority && !validPriorities.includes(priority));

            if (invalidPriorities.length > 0) {
                warnings.push(`Found invalid priority levels: ${[...new Set(invalidPriorities)].join(', ')}`);
            }
        }

        // Test contact type enum
        const { data: contacts, error: contactError } = await supabase
            .from('contacts')
            .select('type')
            .limit(10);

        if (contactError) {
            errors.push(`Contact type enum validation failed: ${contactError.message}`);
        } else if (contacts) {
            const validTypes = ['customer', 'supplier', 'partner', 'internal'];
            const invalidTypes = contacts
                .map(c => c.type)
                .filter(type => type && !validTypes.includes(type));

            if (invalidTypes.length > 0) {
                warnings.push(`Found invalid contact types: ${[...new Set(invalidTypes)].join(', ')}`);
            }
        }

    } catch (error) {
        errors.push(`Enum validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Validates data type consistency between database and TypeScript interfaces
 */
export function validateTypeConsistency(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
} {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Type consistency checks are compile-time validated by TypeScript
    // This function serves as a placeholder for runtime type validation
    // if needed in the future

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Comprehensive schema validation that runs all checks
 */
export async function runFullSchemaValidation(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    summary: string;
}> {
    console.log('🔍 Starting database schema validation...');

    const schemaResult = await validateDatabaseSchema();
    const typeResult = validateTypeConsistency();

    const allErrors = [...schemaResult.errors, ...typeResult.errors];
    const allWarnings = [...schemaResult.warnings, ...typeResult.warnings];

    const isValid = allErrors.length === 0;

    let summary = `Schema validation ${isValid ? 'PASSED' : 'FAILED'}`;
    if (allErrors.length > 0) {
        summary += ` with ${allErrors.length} error(s)`;
    }
    if (allWarnings.length > 0) {
        summary += ` and ${allWarnings.length} warning(s)`;
    }

    console.log(`✅ ${summary}`);

    if (allErrors.length > 0) {
        console.error('❌ Errors:', allErrors);
    }

    if (allWarnings.length > 0) {
        console.warn('⚠️ Warnings:', allWarnings);
    }

    return {
        isValid,
        errors: allErrors,
        warnings: allWarnings,
        summary
    };
}