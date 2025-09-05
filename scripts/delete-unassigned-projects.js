#!/usr/bin/env node

/**
 * Factory Pulse - Delete Unassigned Projects Script
 * 
 * This script deletes projects where assigned_to is NULL.
 * It includes safety checks, dry-run mode, and comprehensive logging.
 * 
 * Usage:
 *   node delete-unassigned-projects.js [--dry-run] [--confirm] [--limit=N]
 * 
 * Options:
 *   --dry-run    Show what would be deleted without actually deleting
 *   --confirm    Skip confirmation prompt (use with caution)
 *   --limit=N    Limit deletion to N projects (default: no limit)
 *   --backup     Create backup before deletion (recommended)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    // Supabase connection (local)
    supabaseUrl: 'http://127.0.0.1:54321',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',

    // Script options
    options: {
        dryRun: false,
        confirm: false,
        limit: null,
        createBackup: false,
        verbose: false
    },

    // Tables that reference projects (for verification)
    relatedTables: [
        'project_sub_stage_progress',
        'project_stage_history',
        'project_assignments',
        'documents',
        'reviews',
        'messages',
        'notifications',
        'supplier_rfqs',
        'activity_log',
        'bom_items',
        'supplier_performance_metrics'
    ]
};

// Parse command line arguments
function parseArguments() {
    const args = process.argv.slice(2);

    args.forEach(arg => {
        if (arg === '--dry-run') {
            CONFIG.options.dryRun = true;
        } else if (arg === '--confirm') {
            CONFIG.options.confirm = true;
        } else if (arg === '--backup') {
            CONFIG.options.createBackup = true;
        } else if (arg === '--verbose') {
            CONFIG.options.verbose = true;
        } else if (arg.startsWith('--limit=')) {
            CONFIG.options.limit = parseInt(arg.split('=')[1]);
        }
    });
}

// Initialize Supabase client
function initializeSupabase() {
    try {
        const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
        console.log('✅ Connected to local Supabase instance');
        return supabase;
    } catch (error) {
        console.error('❌ Failed to connect to Supabase:', error.message);
        process.exit(1);
    }
}

// Create backup before deletion
async function createBackup(supabase) {
    if (!CONFIG.options.createBackup) return;

    console.log('📦 Creating backup before deletion...');

    try {
        // Get current timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const backupDir = path.join(__dirname, '..', 'backups');

        // Ensure backup directory exists
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Export projects data
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .is('assigned_to', null);

        if (error) throw error;

        // Save backup
        const backupFile = path.join(backupDir, `unassigned_projects_backup_${timestamp}.json`);
        fs.writeFileSync(backupFile, JSON.stringify(projects, null, 2));

        console.log(`✅ Backup created: ${backupFile}`);
        console.log(`   Backed up ${projects.length} unassigned projects`);

    } catch (error) {
        console.error('❌ Backup failed:', error.message);
        throw error;
    }
}

// Get projects to delete
async function getUnassignedProjects(supabase) {
    console.log('🔍 Finding projects with assigned_to = NULL...');

    try {
        let query = supabase
            .from('projects')
            .select(`
        id,
        project_id,
        title,
        status,
        priority_level,
        created_at,
        organization_id,
        customer_id,
        current_stage_id
      `)
            .is('assigned_to', null)
            .order('created_at', { ascending: false });

        // Apply limit if specified
        if (CONFIG.options.limit) {
            query = query.limit(CONFIG.options.limit);
        }

        const { data: projects, error } = await query;

        if (error) throw error;

        console.log(`📊 Found ${projects.length} unassigned projects`);

        if (CONFIG.options.verbose && projects.length > 0) {
            console.log('\n📋 Projects to be deleted:');
            projects.forEach((project, index) => {
                console.log(`   ${index + 1}. ${project.project_id} - ${project.title} (${project.status})`);
            });
        }

        return projects;

    } catch (error) {
        console.error('❌ Failed to fetch projects:', error.message);
        throw error;
    }
}

// Check related data
async function checkRelatedData(supabase, projectIds) {
    if (projectIds.length === 0) return;

    console.log('🔗 Checking related data...');

    const relatedDataCounts = {};

    for (const table of CONFIG.relatedTables) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true })
                .in('project_id', projectIds);

            if (error) {
                console.warn(`   ⚠️  Could not check ${table}: ${error.message}`);
                relatedDataCounts[table] = 'unknown';
            } else {
                relatedDataCounts[table] = count || 0;
            }
        } catch (error) {
            console.warn(`   ⚠️  Could not check ${table}: ${error.message}`);
            relatedDataCounts[table] = 'error';
        }
    }

    // Display related data summary
    console.log('\n📊 Related data that will be deleted:');
    Object.entries(relatedDataCounts).forEach(([table, count]) => {
        if (count > 0) {
            console.log(`   ${table}: ${count} records`);
        } else if (count === 0) {
            console.log(`   ${table}: 0 records`);
        } else {
            console.log(`   ${table}: ${count}`);
        }
    });

    return relatedDataCounts;
}

// Delete projects
async function deleteProjects(supabase, projectIds) {
    if (projectIds.length === 0) {
        console.log('✅ No projects to delete');
        return { deleted: 0, errors: [] };
    }

    console.log(`🗑️  Deleting ${projectIds.length} projects...`);

    const errors = [];
    let deletedCount = 0;

    // Delete in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < projectIds.length; i += batchSize) {
        const batch = projectIds.slice(i, i + batchSize);

        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .in('id', batch);

            if (error) {
                console.error(`❌ Batch deletion failed: ${error.message}`);
                errors.push({ batch, error: error.message });
            } else {
                deletedCount += batch.length;
                console.log(`   ✅ Deleted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} projects`);
            }
        } catch (error) {
            console.error(`❌ Batch deletion error: ${error.message}`);
            errors.push({ batch, error: error.message });
        }
    }

    return { deleted: deletedCount, errors };
}

// Confirmation prompt
async function confirmDeletion(projects, relatedDataCounts) {
    if (CONFIG.options.confirm) {
        return true;
    }

    console.log('\n⚠️  DELETION CONFIRMATION REQUIRED');
    console.log('=====================================');
    console.log(`📊 Projects to delete: ${projects.length}`);

    // Show related data summary
    const totalRelatedRecords = Object.values(relatedDataCounts)
        .filter(count => typeof count === 'number')
        .reduce((sum, count) => sum + count, 0);

    if (totalRelatedRecords > 0) {
        console.log(`🔗 Related records to delete: ${totalRelatedRecords}`);
    }

    console.log('\n⚠️  This action cannot be undone!');
    console.log('   Make sure you have a backup if needed.');

    // In a real implementation, you would use readline for user input
    // For this script, we'll require the --confirm flag
    console.log('\n❌ Deletion cancelled for safety.');
    console.log('   Use --confirm flag to proceed with deletion.');
    console.log('   Example: node delete-unassigned-projects.js --confirm --backup');

    return false;
}

// Main execution function
async function main() {
    console.log('🏭 Factory Pulse - Delete Unassigned Projects Script');
    console.log('====================================================');

    // Parse arguments
    parseArguments();

    // Display configuration
    console.log('\n⚙️  Configuration:');
    console.log(`   Dry run: ${CONFIG.options.dryRun ? 'YES' : 'NO'}`);
    console.log(`   Create backup: ${CONFIG.options.createBackup ? 'YES' : 'NO'}`);
    console.log(`   Limit: ${CONFIG.options.limit || 'No limit'}`);
    console.log(`   Verbose: ${CONFIG.options.verbose ? 'YES' : 'NO'}`);

    // Initialize Supabase
    const supabase = initializeSupabase();

    try {
        // Get projects to delete
        const projects = await getUnassignedProjects(supabase);

        if (projects.length === 0) {
            console.log('✅ No unassigned projects found. Nothing to delete.');
            return;
        }

        // Check related data
        const projectIds = projects.map(p => p.id);
        const relatedDataCounts = await checkRelatedData(supabase, projectIds);

        // Create backup if requested
        if (CONFIG.options.createBackup) {
            await createBackup(supabase);
        }

        // Dry run mode
        if (CONFIG.options.dryRun) {
            console.log('\n🔍 DRY RUN MODE - No actual deletion performed');
            console.log('===============================================');
            console.log(`📊 Would delete ${projects.length} projects`);

            const totalRelatedRecords = Object.values(relatedDataCounts)
                .filter(count => typeof count === 'number')
                .reduce((sum, count) => sum + count, 0);

            if (totalRelatedRecords > 0) {
                console.log(`🔗 Would delete ${totalRelatedRecords} related records`);
            }

            console.log('\n✅ Dry run completed successfully');
            return;
        }

        // Confirmation
        const confirmed = await confirmDeletion(projects, relatedDataCounts);
        if (!confirmed) {
            console.log('\n❌ Deletion cancelled');
            return;
        }

        // Perform deletion
        const result = await deleteProjects(supabase, projectIds);

        // Display results
        console.log('\n📊 DELETION RESULTS');
        console.log('==================');
        console.log(`✅ Successfully deleted: ${result.deleted} projects`);

        if (result.errors.length > 0) {
            console.log(`❌ Errors: ${result.errors.length} batches failed`);
            result.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error.error}`);
            });
        }

        console.log('\n✅ Script completed successfully');

    } catch (error) {
        console.error('\n❌ Script failed:', error.message);
        if (CONFIG.options.verbose) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the script
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Script execution failed:', error.message);
        process.exit(1);
    });
}

module.exports = {
    main,
    CONFIG
};
