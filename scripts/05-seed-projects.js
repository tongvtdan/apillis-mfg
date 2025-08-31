#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
    console.error('\nPlease check your .env.local file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function validateRelationships(projectsData) {
    console.log('🔍 Validating project relationships...');

    // Get existing data for validation
    const { data: organizations } = await supabase
        .from('organizations')
        .select('id');

    const { data: workflowStages } = await supabase
        .from('workflow_stages')
        .select('id');

    const { data: contacts } = await supabase
        .from('contacts')
        .select('id');

    const { data: users } = await supabase
        .from('users')
        .select('id');

    const orgIds = new Set(organizations?.map(org => org.id) || []);
    const stageIds = new Set(workflowStages?.map(stage => stage.id) || []);
    const contactIds = new Set(contacts?.map(contact => contact.id) || []);
    const userIds = new Set(users?.map(user => user.id) || []);

    const issues = [];

    projectsData.forEach((project, index) => {
        // Check organization_id
        if (!orgIds.has(project.organization_id)) {
            issues.push(`Project ${index + 1}: Invalid organization_id ${project.organization_id}`);
        }

        // Check current_stage_id
        if (project.current_stage_id && !stageIds.has(project.current_stage_id)) {
            issues.push(`Project ${index + 1}: Invalid current_stage_id ${project.current_stage_id}`);
        }

        // Check customer_id
        if (project.customer_id && !contactIds.has(project.customer_id)) {
            issues.push(`Project ${index + 1}: Invalid customer_id ${project.customer_id}`);
        }

        // Check created_by
        if (project.created_by && !userIds.has(project.created_by)) {
            issues.push(`Project ${index + 1}: Invalid created_by ${project.created_by}`);
        }

        // Check assigned_to
        if (project.assigned_to && !userIds.has(project.assigned_to)) {
            issues.push(`Project ${index + 1}: Invalid assigned_to ${project.assigned_to}`);
        }
    });

    if (issues.length > 0) {
        console.log('⚠️  Found relationship validation issues:');
        issues.forEach(issue => console.log(`   ${issue}`));

        if (!process.argv.includes('--fix-relationships')) {
            console.log('\nUse --fix-relationships flag to automatically fix invalid references');
            return false;
        }

        console.log('\n🔧 Fixing relationship issues...');
        return await fixRelationships(projectsData, { orgIds, stageIds, contactIds, userIds });
    }

    console.log('✅ All relationships validated successfully');
    return true;
}

async function fixRelationships(projectsData, validIds) {
    const fixedProjects = projectsData.map(project => {
        const fixed = { ...project };

        // Fix invalid customer_id references
        if (project.customer_id && !validIds.contactIds.has(project.customer_id)) {
            // Use first available customer contact
            const firstCustomerId = Array.from(validIds.contactIds)[0];
            if (firstCustomerId) {
                fixed.customer_id = firstCustomerId;
                console.log(`   Fixed customer_id for project ${project.project_id}: ${project.customer_id} → ${firstCustomerId}`);
            } else {
                fixed.customer_id = null;
                console.log(`   Removed invalid customer_id for project ${project.project_id}`);
            }
        }

        // Fix invalid current_stage_id references
        if (project.current_stage_id && !validIds.stageIds.has(project.current_stage_id)) {
            // Use first available workflow stage
            const firstStageId = Array.from(validIds.stageIds)[0];
            if (firstStageId) {
                fixed.current_stage_id = firstStageId;
                console.log(`   Fixed current_stage_id for project ${project.project_id}: ${project.current_stage_id} → ${firstStageId}`);
            } else {
                fixed.current_stage_id = null;
                console.log(`   Removed invalid current_stage_id for project ${project.project_id}`);
            }
        }

        // Fix invalid created_by references
        if (project.created_by && !validIds.userIds.has(project.created_by)) {
            // Use first available user
            const firstUserId = Array.from(validIds.userIds)[0];
            if (firstUserId) {
                fixed.created_by = firstUserId;
                console.log(`   Fixed created_by for project ${project.project_id}: ${project.created_by} → ${firstUserId}`);
            } else {
                fixed.created_by = null;
                console.log(`   Removed invalid created_by for project ${project.project_id}`);
            }
        }

        // Fix invalid assigned_to references
        if (project.assigned_to && !validIds.userIds.has(project.assigned_to)) {
            // Use first available user
            const firstUserId = Array.from(validIds.userIds)[0];
            if (firstUserId) {
                fixed.assigned_to = firstUserId;
                console.log(`   Fixed assigned_to for project ${project.project_id}: ${project.assigned_to} → ${firstUserId}`);
            } else {
                fixed.assigned_to = null;
                console.log(`   Removed invalid assigned_to for project ${project.project_id}`);
            }
        }

        return fixed;
    });

    return fixedProjects;
}

async function seedProjects() {
    try {
        console.log('🌱 Starting projects seeding...');

        // Load projects data
        const projectsPath = path.join(__dirname, '../sample-data/05-projects.json');
        const projectsData = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

        console.log(`📊 Found ${projectsData.length} projects to seed`);

        // Check if projects already exist
        const { data: existingProjects, error: checkError } = await supabase
            .from('projects')
            .select('id, project_id')
            .limit(1);

        if (checkError) {
            throw new Error(`Failed to check existing projects: ${checkError.message}`);
        }

        if (existingProjects && existingProjects.length > 0) {
            console.log('⚠️  Projects table already contains data');
            console.log('   Use --force flag to overwrite existing data');

            if (!process.argv.includes('--force')) {
                console.log('   Skipping seeding to prevent data loss');
                return;
            }

            console.log('🗑️  Clearing existing projects...');
            const { error: deleteError } = await supabase
                .from('projects')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (deleteError) {
                throw new Error(`Failed to clear existing projects: ${deleteError.message}`);
            }

            console.log('✅ Existing projects cleared');
        }

        // Validate relationships
        const validationResult = await validateRelationships(projectsData);
        if (!validationResult) {
            console.log('❌ Relationship validation failed. Exiting.');
            return;
        }

        const finalProjectsData = validationResult === true ? projectsData : validationResult;

        // Insert projects
        console.log('📝 Inserting projects...');
        const { data: insertedProjects, error: insertError } = await supabase
            .from('projects')
            .insert(finalProjectsData)
            .select('id, project_id, title');

        if (insertError) {
            throw new Error(`Failed to insert projects: ${insertError.message}`);
        }

        console.log(`✅ Successfully seeded ${insertedProjects.length} projects`);

        // Display summary
        console.log('\n📋 Seeding Summary:');
        console.log(`   Total projects processed: ${projectsData.length}`);
        console.log(`   Successfully inserted: ${insertedProjects.length}`);

        if (insertedProjects.length > 0) {
            console.log('\n   Sample inserted projects:');
            insertedProjects.slice(0, 5).forEach(project => {
                console.log(`   - ${project.project_id}: ${project.title}`);
            });
        }

        console.log('\n🎉 Projects seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error during projects seeding:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🌱 Factory Pulse - Projects Seeding Script

Usage:
  node scripts/05-seed-projects.js [options]

Options:
  --force              Force overwrite existing projects data
  --fix-relationships  Automatically fix invalid foreign key references
  --help, -h          Show this help message

Examples:
  node scripts/05-seed-projects.js                    # Seed projects (skip if exists)
  node scripts/05-seed-projects.js --force           # Force overwrite existing data
  node scripts/05-seed-projects.js --fix-relationships # Fix invalid references

Environment Variables:
  VITE_SUPABASE_URL              Supabase project URL
  VITE_SUPABASE_SERVICE_ROLE_KEY Supabase service role key

Notes:
  - Requires existing organizations, workflow stages, contacts, and users
  - Validates all foreign key relationships before insertion
  - Can automatically fix invalid references with --fix-relationships
  - Uses local Supabase instance only
`);
    process.exit(0);
}

// Run the seeding
seedProjects();
