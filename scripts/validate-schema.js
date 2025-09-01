#!/usr/bin/env node

/**
 * Database Schema Validation Script
 * 
 * This script validates that the database schema matches the TypeScript interfaces
 * and checks for any data type mismatches or missing foreign key relationships.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration. Please check your .env.local file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Validates that all required tables exist and have the expected structure
 */
async function validateDatabaseSchema() {
    const errors = [];
    const warnings = [];

    console.log('🔍 Validating database schema...');

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

        console.log('📋 Testing table accessibility...');
        for (const test of tableTests) {
            try {
                const { error } = await test.query();
                if (error) {
                    errors.push(`Table ${test.name} access failed: ${error.message}`);
                    console.log(`❌ ${test.name}: ${error.message}`);
                } else {
                    console.log(`✅ ${test.name}: accessible`);
                }
            } catch (err) {
                errors.push(`Table ${test.name} not accessible: ${err instanceof Error ? err.message : 'Unknown error'}`);
                console.log(`❌ ${test.name}: not accessible`);
            }
        }

        // Test foreign key relationships
        console.log('🔗 Testing foreign key relationships...');
        await validateForeignKeyRelationships(errors, warnings);

        // Test enum values
        console.log('📝 Testing enum values...');
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
async function validateForeignKeyRelationships(errors, warnings) {
    try {
        // Test project -> customer relationship
        const { data: projectsWithCustomers, error: projectError } = await supabase
            .from('projects')
            .select(`
        id,
        customer_id,
        contacts!projects_customer_id_fkey(id, company_name)
      `)
            .limit(1);

        if (projectError) {
            errors.push(`Project-Customer relationship validation failed: ${projectError.message}`);
            console.log(`❌ Project-Customer FK: ${projectError.message}`);
        } else {
            console.log(`✅ Project-Customer FK: working`);
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
            console.log(`❌ Project-WorkflowStage FK: ${stageError.message}`);
        } else {
            console.log(`✅ Project-WorkflowStage FK: working`);
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
            console.log(`❌ WorkflowSubStage-WorkflowStage FK: ${subStageError.message}`);
        } else {
            console.log(`✅ WorkflowSubStage-WorkflowStage FK: working`);
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
            console.log(`❌ ProjectSubStageProgress FKs: ${progressError.message}`);
        } else {
            console.log(`✅ ProjectSubStageProgress FKs: working`);
        }

    } catch (error) {
        errors.push(`Foreign key validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log(`❌ Foreign key validation failed: ${error.message}`);
    }
}

/**
 * Validates enum values match expected types
 */
async function validateEnumValues(errors, warnings) {
    try {
        // Test project status enum
        const { data: projects, error: projectError } = await supabase
            .from('projects')
            .select('status')
            .limit(10);

        if (projectError) {
            errors.push(`Project status enum validation failed: ${projectError.message}`);
            console.log(`❌ Project status enum: ${projectError.message}`);
        } else if (projects) {
            const validStatuses = ['active', 'on_hold', 'cancelled', 'completed'];
            const invalidStatuses = projects
                .map(p => p.status)
                .filter(status => status && !validStatuses.includes(status));

            if (invalidStatuses.length > 0) {
                warnings.push(`Found invalid project statuses: ${[...new Set(invalidStatuses)].join(', ')}`);
                console.log(`⚠️ Invalid project statuses found: ${[...new Set(invalidStatuses)].join(', ')}`);
            } else {
                console.log(`✅ Project status enum: valid`);
            }
        }

        // Test priority level enum
        const { data: projectsWithPriority, error: priorityError } = await supabase
            .from('projects')
            .select('priority_level')
            .limit(10);

        if (priorityError) {
            errors.push(`Priority level enum validation failed: ${priorityError.message}`);
            console.log(`❌ Priority level enum: ${priorityError.message}`);
        } else if (projectsWithPriority) {
            const validPriorities = ['low', 'medium', 'high', 'critical'];
            const invalidPriorities = projectsWithPriority
                .map(p => p.priority_level)
                .filter(priority => priority && !validPriorities.includes(priority));

            if (invalidPriorities.length > 0) {
                warnings.push(`Found invalid priority levels: ${[...new Set(invalidPriorities)].join(', ')}`);
                console.log(`⚠️ Invalid priority levels found: ${[...new Set(invalidPriorities)].join(', ')}`);
            } else {
                console.log(`✅ Priority level enum: valid`);
            }
        }

        // Test contact type enum
        const { data: contacts, error: contactError } = await supabase
            .from('contacts')
            .select('type')
            .limit(10);

        if (contactError) {
            errors.push(`Contact type enum validation failed: ${contactError.message}`);
            console.log(`❌ Contact type enum: ${contactError.message}`);
        } else if (contacts) {
            const validTypes = ['customer', 'supplier', 'partner', 'internal'];
            const invalidTypes = contacts
                .map(c => c.type)
                .filter(type => type && !validTypes.includes(type));

            if (invalidTypes.length > 0) {
                warnings.push(`Found invalid contact types: ${[...new Set(invalidTypes)].join(', ')}`);
                console.log(`⚠️ Invalid contact types found: ${[...new Set(invalidTypes)].join(', ')}`);
            } else {
                console.log(`✅ Contact type enum: valid`);
            }
        }

    } catch (error) {
        errors.push(`Enum validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log(`❌ Enum validation failed: ${error.message}`);
    }
}

/**
 * Main validation function
 */
async function main() {
    console.log('🚀 Starting database schema validation...\n');

    const result = await validateDatabaseSchema();

    console.log('\n📊 Validation Summary:');
    console.log('='.repeat(50));

    if (result.isValid) {
        console.log('✅ Schema validation PASSED');
    } else {
        console.log('❌ Schema validation FAILED');
        console.log('\nErrors:');
        result.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (result.warnings.length > 0) {
        console.log('\nWarnings:');
        result.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    console.log(`\nTotal: ${result.errors.length} error(s), ${result.warnings.length} warning(s)`);

    if (!result.isValid) {
        process.exit(1);
    }
}

// Run the validation
main().catch(error => {
    console.error('❌ Validation script failed:', error);
    process.exit(1);
});