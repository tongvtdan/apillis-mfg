#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execPromise = promisify(exec);

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

// Function to execute SQL commands directly
async function executeSQL(sql) {
    const command = `PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "${sql}"`;
    try {
        const { stdout, stderr } = await execPromise(command);
        if (stderr) {
            console.log('SQL stderr:', stderr);
        }
        return stdout;
    } catch (error) {
        throw new Error(`SQL execution failed: ${error.message}`);
    }
}

async function assignProjectsToStages() {
    try {
        console.log('🔄 Starting project stage assignment...');

        // Get all projects
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id, project_id, title')
            .order('created_at');

        if (projectsError) {
            throw new Error(`Failed to fetch projects: ${projectsError.message}`);
        }

        console.log(`📊 Found ${projects.length} projects to assign stages to`);

        if (projects.length === 0) {
            console.log('⚠️  No projects found in database');
            return;
        }

        // Get workflow stages
        const { data: workflowStages, error: stagesError } = await supabase
            .from('workflow_stages')
            .select('id, name, stage_order')
            .order('stage_order');

        if (stagesError) {
            throw new Error(`Failed to fetch workflow stages: ${stagesError.message}`);
        }

        console.log(`📊 Found ${workflowStages.length} workflow stages`);

        // Define stage distribution (distribute projects across all stages)
        const stageDistribution = [
            { stageId: workflowStages[0].id, count: Math.ceil(projects.length * 0.15) }, // 15% to first stage
            { stageId: workflowStages[1].id, count: Math.ceil(projects.length * 0.15) }, // 15% to second stage
            { stageId: workflowStages[2].id, count: Math.ceil(projects.length * 0.20) }, // 20% to third stage
            { stageId: workflowStages[3].id, count: Math.ceil(projects.length * 0.15) }, // 15% to fourth stage
            { stageId: workflowStages[4].id, count: Math.ceil(projects.length * 0.10) }, // 10% to fifth stage
            { stageId: workflowStages[5].id, count: Math.ceil(projects.length * 0.10) }, // 10% to sixth stage
            { stageId: workflowStages[6].id, count: Math.ceil(projects.length * 0.10) }, // 10% to seventh stage
            { stageId: workflowStages[7].id, count: Math.floor(projects.length * 0.05) }  // 5% to eighth stage
        ];

        // Adjust counts to match total projects
        const totalAssigned = stageDistribution.reduce((sum, item) => sum + item.count, 0);
        if (totalAssigned !== projects.length) {
            const diff = projects.length - totalAssigned;
            stageDistribution[0].count += diff; // Add difference to first stage
        }

        console.log('\n📊 Stage distribution plan:');
        stageDistribution.forEach((item, index) => {
            const stage = workflowStages.find(s => s.id === item.stageId);
            console.log(`   ${stage.name}: ${item.count} projects`);
        });

        // Disable trigger by dropping it to avoid column reference issues
        console.log('\n🔧 Managing triggers...');
        try {
            await executeSQL("DROP TRIGGER IF EXISTS handle_project_stage_change_trigger ON projects;");
            console.log('   ✅ Trigger dropped successfully');
        } catch (dropError) {
            console.log('   ⚠️  Could not drop trigger (may not exist):', dropError.message);
        }

        // Assign projects to stages using direct SQL updates
        console.log('\n📝 Assigning projects to stages...');
        let projectIndex = 0;
        let successCount = 0;
        let errorCount = 0;

        for (const distribution of stageDistribution) {
            const stage = workflowStages.find(s => s.id === distribution.stageId);
            console.log(`\n📌 Assigning ${distribution.count} projects to "${stage.name}" stage...`);

            for (let i = 0; i < distribution.count && projectIndex < projects.length; i++) {
                const project = projects[projectIndex];

                try {
                    // Use direct SQL update to avoid trigger issues
                    const updateSQL = `
                        UPDATE projects 
                        SET current_stage_id = '${distribution.stageId}', 
                            stage_entered_at = '${new Date().toISOString()}', 
                            updated_at = '${new Date().toISOString()}'
                        WHERE id = '${project.id}';
                    `;

                    await executeSQL(updateSQL);
                    console.log(`   ✅ ${project.project_id} - ${project.title}`);
                    successCount++;
                } catch (err) {
                    console.error(`❌ Exception updating project ${project.project_id}: ${err.message}`);
                    errorCount++;
                }

                projectIndex++;
            }
        }

        // Recreate the trigger function and trigger
        console.log('\n🔧 Recreating trigger...');
        try {
            // Recreate the trigger function with fixed column reference
            const triggerFunctionSQL = `
CREATE OR REPLACE FUNCTION handle_project_stage_change()
RETURNS TRIGGER AS $$
DECLARE
    stage_name TEXT;
    assigned_users UUID[];
    user_id UUID; -- Explicitly declare the variable to avoid ambiguity
BEGIN
    -- Only process if stage has changed
    IF NEW.current_stage_id IS DISTINCT FROM OLD.current_stage_id AND NEW.current_stage_id IS NOT NULL THEN
        -- Get stage name
        SELECT name INTO stage_name
        FROM workflow_stages
        WHERE id = NEW.current_stage_id;

        -- Update stage_entered_at
        NEW.stage_entered_at = NOW();

        -- Get assigned users for notifications (resolve ambiguity by specifying table)
        SELECT ARRAY_AGG(pa.user_id)
        INTO assigned_users
        FROM project_assignments pa
        WHERE pa.project_id = NEW.id AND pa.is_active = true;

        -- Create notifications for assigned users
        IF assigned_users IS NOT NULL THEN
            FOREACH user_id IN ARRAY assigned_users
            LOOP
                PERFORM create_notification(
                    user_id,
                    'Project Stage Updated',
                    'Project ' || NEW.project_id || ' moved to ' || stage_name,
                    'stage_change',
                    'medium',
                    '/projects/' || NEW.id,
                    'View Project',
                    'project',
                    NEW.id
                );
            END LOOP;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`;
            await executeSQL(triggerFunctionSQL);

            // Recreate the trigger
            await executeSQL("CREATE TRIGGER handle_project_stage_change_trigger BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION handle_project_stage_change();");

            console.log('   ✅ Trigger recreated successfully');
        } catch (createError) {
            console.log('   ⚠️  Could not recreate trigger:', createError.message);
        }

        // Display summary
        console.log('\n📋 Assignment Summary:');
        console.log(`   Total projects processed: ${projects.length}`);
        console.log(`   Successfully assigned: ${successCount}`);
        console.log(`   Errors: ${errorCount}`);

        // Final verification
        console.log('\n🔍 Final verification...');
        const { data: verificationData, error: verifyError } = await supabase
            .from('projects')
            .select('id, project_id, title, current_stage_id')
            .not('current_stage_id', 'is', null);

        if (verifyError) {
            console.error('❌ Error during verification:', verifyError.message);
        } else {
            console.log(`✅ ${verificationData.length} projects now have stage assignments`);

            // Show stage distribution
            const stageCounts = {};
            for (const project of verificationData) {
                const stageId = project.current_stage_id;
                stageCounts[stageId] = (stageCounts[stageId] || 0) + 1;
            }

            console.log('\n📊 Final stage distribution:');
            for (const [stageId, count] of Object.entries(stageCounts)) {
                const stage = workflowStages.find(s => s.id === stageId);
                console.log(`   ${stage ? stage.name : stageId}: ${count} projects`);
            }
        }

        console.log('\n🎉 Project stage assignment completed successfully!');

    } catch (error) {
        console.error('❌ Error during project stage assignment:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🔄 Factory Pulse - Project Stage Assignment Script

Usage:
  node scripts/06-assign-projects-to-stages.js [options]

Options:
  --help, -h          Show this help message

Description:
  This script assigns all projects in the database to various workflow stages
  to ensure proper visualization in the Kanban Flow view. Projects are 
  distributed across all 8 workflow stages with a realistic distribution.

Environment Variables:
  VITE_SUPABASE_URL              Supabase project URL
  VITE_SUPABASE_SERVICE_ROLE_KEY Supabase service role key

Notes:
  - Distributes projects across all workflow stages
  - Uses local Supabase instance only
  - Temporarily disables triggers to avoid column reference issues
  - Updates stage_entered_at and updated_at timestamps
`);
    process.exit(0);
}

// Run the assignment
assignProjectsToStages();