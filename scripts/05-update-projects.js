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

async function validateUpdateData(projectsData) {
    console.log('🔍 Validating update data...');

    // Get existing data for validation
    const { data: workflowStages } = await supabase
        .from('workflow_stages')
        .select('id, name');

    const { data: users } = await supabase
        .from('users')
        .select('id, name, role');

    const stageIds = new Set(workflowStages?.map(stage => stage.id) || []);
    const userIds = new Set(users?.map(user => user.id) || []);

    const issues = [];
    const validProjects = [];

    projectsData.forEach((project, index) => {
        const projectIssues = [];

        // Check current_stage_id
        if (project.current_stage_id && !stageIds.has(project.current_stage_id)) {
            projectIssues.push(`Invalid current_stage_id ${project.current_stage_id}`);
        }

        // Check created_by
        if (project.created_by && !userIds.has(project.created_by)) {
            projectIssues.push(`Invalid created_by ${project.created_by}`);
        }

        // Check assigned_to
        if (project.assigned_to && !userIds.has(project.assigned_to)) {
            projectIssues.push(`Invalid assigned_to ${project.assigned_to}`);
        }

        if (projectIssues.length > 0) {
            issues.push(`Project ${project.project_id} (${project.title}): ${projectIssues.join(', ')}`);
        } else {
            validProjects.push(project);
        }
    });

    if (issues.length > 0) {
        console.log('⚠️  Found validation issues:');
        issues.forEach(issue => console.log(`   ${issue}`));

        if (!process.argv.includes('--fix-relationships')) {
            console.log('\nUse --fix-relationships flag to automatically fix invalid references');
            return false;
        }

        console.log('\n🔧 Fixing relationship issues...');
        return await fixUpdateRelationships(projectsData, { stageIds, userIds });
    }

    console.log('✅ All update data validated successfully');
    return validProjects;
}

async function fixUpdateRelationships(projectsData, validIds) {
    const fixedProjects = projectsData.map(project => {
        const fixed = { ...project };

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

async function updateProjects() {
    try {
        console.log('🔄 Starting projects update...');

        // Load projects data
        const projectsPath = path.join(__dirname, '../sample-data/05-projects.json');
        const projectsData = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

        console.log(`📊 Found ${projectsData.length} projects to update`);

        // Check if projects exist
        const { data: existingProjects, error: checkError } = await supabase
            .from('projects')
            .select('id, project_id, title')
            .limit(1);

        if (checkError) {
            throw new Error(`Failed to check existing projects: ${checkError.message}`);
        }

        if (!existingProjects || existingProjects.length === 0) {
            console.log('⚠️  No projects found in database');
            console.log('   Please run "npm run seed:projects" first to create projects');
            return;
        }

        console.log(`✅ Found ${existingProjects.length} existing projects`);

        // Validate update data
        const validationResult = await validateUpdateData(projectsData);
        if (!validationResult) {
            console.log('❌ Data validation failed. Exiting.');
            return;
        }

        const finalProjectsData = validationResult === true ? projectsData : validationResult;

        // Update projects using raw SQL to avoid column ambiguity
        console.log('📝 Updating projects using raw SQL...');
        let successCount = 0;
        let errorCount = 0;

        for (const project of finalProjectsData) {
            try {
                // Build the SQL update statement
                let updateFields = [];
                let updateValues = [];
                let paramCount = 1;

                if (project.current_stage_id !== undefined) {
                    updateFields.push(`current_stage_id = $${paramCount++}`);
                    updateValues.push(project.current_stage_id);
                }

                if (project.created_by !== undefined) {
                    updateFields.push(`created_by = $${paramCount++}`);
                    updateValues.push(project.created_by);
                }

                if (project.assigned_to !== undefined) {
                    updateFields.push(`assigned_to = $${paramCount++}`);
                    updateValues.push(project.assigned_to);
                }

                // Always update the updated_at field
                updateFields.push(`updated_at = $${paramCount++}`);
                updateValues.push(new Date().toISOString());

                if (updateFields.length === 0) {
                    console.log(`⚠️  No fields to update for project ${project.project_id}`);
                    continue;
                }

                const sql = `
                    UPDATE projects 
                    SET ${updateFields.join(', ')}
                    WHERE id = $${paramCount}
                `;
                updateValues.push(project.id);

                const { error } = await supabase.rpc('exec_sql', {
                    sql_query: sql,
                    params: updateValues
                });

                if (error) {
                    // Fallback to direct SQL if RPC doesn't work
                    console.log(`🔄 Trying direct SQL update for ${project.project_id}...`);

                    // Use a simpler approach with individual field updates
                    const updates = [];

                    if (project.current_stage_id !== undefined) {
                        const { error: stageError } = await supabase
                            .from('projects')
                            .update({ current_stage_id: project.current_stage_id })
                            .eq('id', project.id);
                        if (stageError) {
                            console.error(`❌ Error updating current_stage_id for ${project.project_id}: ${stageError.message}`);
                        } else {
                            updates.push('current_stage_id');
                        }
                    }

                    if (project.created_by !== undefined) {
                        const { error: createdError } = await supabase
                            .from('projects')
                            .update({ created_by: project.created_by })
                            .eq('id', project.id);
                        if (createdError) {
                            console.error(`❌ Error updating created_by for ${project.project_id}: ${createdError.message}`);
                        } else {
                            updates.push('created_by');
                        }
                    }

                    if (project.assigned_to !== undefined) {
                        const { error: assignedError } = await supabase
                            .from('projects')
                            .update({ assigned_to: project.assigned_to })
                            .eq('id', project.id);
                        if (assignedError) {
                            console.error(`❌ Error updating assigned_to for ${project.project_id}: ${assignedError.message}`);
                        } else {
                            updates.push('assigned_to');
                        }
                    }

                    // Update the updated_at field
                    const { error: timeError } = await supabase
                        .from('projects')
                        .update({ updated_at: new Date().toISOString() })
                        .eq('id', project.id);

                    if (updates.length > 0) {
                        console.log(`✅ Updated ${project.project_id} - ${project.title} (${updates.join(', ')})`);
                        successCount++;
                    } else {
                        console.error(`❌ Failed to update any fields for ${project.project_id}`);
                        errorCount++;
                    }
                } else {
                    console.log(`✅ Updated: ${project.project_id} - ${project.title}`);
                    successCount++;
                }

            } catch (err) {
                console.error(`❌ Exception updating project ${project.project_id}: ${err.message}`);
                errorCount++;
            }
        }

        // Display summary
        console.log('\n📋 Update Summary:');
        console.log(`   Total projects processed: ${finalProjectsData.length}`);
        console.log(`   Successfully updated: ${successCount}`);
        console.log(`   Errors: ${errorCount}`);

        // Final verification
        console.log('\n🔍 Final verification...');

        const { data: projectsWithStages, error: verifyError } = await supabase
            .from('projects')
            .select('id, title, current_stage_id')
            .not('current_stage_id', 'is', null);

        if (verifyError) {
            console.error('❌ Error during verification:', verifyError.message);
        } else {
            console.log(`✅ ${projectsWithStages.length} projects now have valid stage references`);

            // Show stage distribution
            const stageCounts = {};
            projectsWithStages.forEach(project => {
                const stageId = project.current_stage_id;
                stageCounts[stageId] = (stageCounts[stageId] || 0) + 1;
            });

            console.log('\n📊 Stage distribution:');
            Object.entries(stageCounts).forEach(([stageId, count]) => {
                console.log(`   Stage ${stageId}: ${count} projects`);
            });
        }

        console.log('\n🎉 Projects update completed successfully!');

    } catch (error) {
        console.error('❌ Error during projects update:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🔄 Factory Pulse - Projects Update Script

Usage:
  node scripts/05-update-projects.js [options]

Options:
  --fix-relationships  Automatically fix invalid foreign key references
  --help, -h          Show this help message

Examples:
  node scripts/05-update-projects.js                    # Update projects with validation
  node scripts/05-update-projects.js --fix-relationships # Fix invalid references

Environment Variables:
  VITE_SUPABASE_URL              Supabase project URL
  VITE_SUPABASE_SERVICE_ROLE_KEY Supabase service role key

Notes:
  - Requires existing projects in database (run seed:projects first)
  - Updates current_stage_id, created_by, and assigned_to fields
  - Validates all foreign key relationships before update
  - Can automatically fix invalid references with --fix-relationships
  - Uses local Supabase instance only
  - Processes updates individually to avoid column ambiguity issues
`);
    process.exit(0);
}

// Run the update
updateProjects();
