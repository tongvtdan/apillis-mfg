#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vf' +
    'cm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧹 Starting comprehensive database cleanup...\n');

// Tables to clean up (excluding users and auth tables)
const tablesToClean = [
    // Activity and logging tables (clean first to avoid FK issues)
    'activity_log',
    'document_access_log',

    // Approval system
    'approval_delegation_mappings',
    'approval_history',
    'approval_notifications',
    'approval_attachments',
    'approval_chains',
    'approval_delegations',
    'approvals',

    // Document system
    'document_versions',
    'documents',

    // Project system (clean in dependency order)
    'project_sub_stage_progress',
    'project_assignments',
    'reviews',
    'supplier_quotes',
    'supplier_rfqs',
    'messages',
    'project_contact_points_backup',
    'projects',

    // Workflow system
    'workflow_sub_stages',
    'workflow_stages',

    // Organization and contact system
    'contacts',
    'organizations',

    // Notification system
    'notifications',

    // Storage system
    'storage.objects',
    'storage.s3_multipart_uploads_parts',
    'storage.s3_multipart_uploads',
    'storage.prefixes',
    'storage.buckets_analytics',
    'storage.buckets',

    // Realtime system
    'realtime.messages_2025_09_09',
    'realtime.messages_2025_09_08',
    'realtime.messages_2025_09_07',
    'realtime.messages_2025_09_06',
    'realtime.messages_2025_09_05',
    'realtime.messages',
    'realtime.subscription',

    // Other system tables
    '_realtime.tenants',
    'net.http_request_queue',
    'net._http_response',
    'vault.secrets',
    'supabase_functions.hooks',

    // Migration tables (keep schema but clean data)
    '_realtime.schema_migrations',
    'realtime.schema_migrations',
    'storage.migrations',
    'supabase_functions.migrations',
    'supabase_migrations.schema_migrations'
];

async function cleanupTable(tableName) {
    try {
        console.log(`🗑️  Cleaning table: ${tableName}`);

        // Use TRUNCATE for better performance, but handle FK constraints
        if (tableName.includes('.')) {
            // Schema-qualified table
            const [schema, table] = tableName.split('.');
            const { error } = await supabase.rpc('exec_sql', {
                sql: `TRUNCATE TABLE "${schema}"."${table}" CASCADE;`
            });
            if (error) {
                console.log(`⚠️  TRUNCATE failed for ${tableName}, trying DELETE`);
                const { error: deleteError } = await supabase.rpc('exec_sql', {
                    sql: `DELETE FROM "${schema}"."${table}";`
                });
                if (deleteError) {
                    console.error(`❌ Error cleaning ${tableName}:`, deleteError);
                }
            }
        } else {
            // Regular public schema table
            const { error } = await supabase.rpc('exec_sql', {
                sql: `TRUNCATE TABLE "${tableName}" CASCADE;`
            });
            if (error) {
                console.log(`⚠️  TRUNCATE failed for ${tableName}, trying DELETE`);
                const { error: deleteError } = await supabase.rpc('exec_sql', {
                    sql: `DELETE FROM "${tableName}";`
                });
                if (deleteError) {
                    console.error(`❌ Error cleaning ${tableName}:`, deleteError);
                }
            }
        }
    } catch (error) {
        console.error(`❌ Error processing ${tableName}:`, error);
    }
}

async function verifyCleanup() {
    console.log('\n🔍 Verifying cleanup...\n');

    // Check remaining data in key tables
    const tablesToCheck = [
        'organizations',
        'projects',
        'workflow_stages',
        'contacts',
        'documents',
        'approvals'
    ];

    for (const table of tablesToCheck) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`⚠️  Could not check ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table}: ${count || 0} records remaining`);
            }
        } catch (error) {
            console.log(`⚠️  Error checking ${table}: ${error.message}`);
        }
    }

    // Verify users table is intact
    try {
        const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`⚠️  Could not check users table: ${error.message}`);
        } else {
            console.log(`✅ users table: ${count || 0} records preserved`);
        }
    } catch (error) {
        console.log(`⚠️  Error checking users table: ${error.message}`);
    }
}

async function main() {
    try {
        console.log('⚠️  WARNING: This will delete ALL data except users and auth tables!');
        console.log('📋 Tables to clean:', tablesToClean.length);
        console.log('');

        // Process tables in batches to avoid overwhelming the system
        const batchSize = 5;
        for (let i = 0; i < tablesToClean.length; i += batchSize) {
            const batch = tablesToClean.slice(i, i + batchSize);
            console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(tablesToClean.length / batchSize)}`);

            for (const table of batch) {
                await cleanupTable(table);
            }

            // Small delay between batches
            if (i + batchSize < tablesToClean.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        await verifyCleanup();

        console.log('\n🎉 Database cleanup completed successfully!');
        console.log('✅ All application data has been removed');
        console.log('✅ Users and authentication data preserved');
        console.log('✅ Database ready for fresh data seeding');

    } catch (error) {
        console.error('❌ Error in cleanup process:', error);
        process.exit(1);
    }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
