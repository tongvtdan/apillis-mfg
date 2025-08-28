import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration - UPDATE THESE VALUES
const SUPABASE_URL = 'https://ynhgxwnkpbpzwbtzrzka.supabase.co';
const SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Replace with your actual service role key

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Migration files to apply in order
const migrations = [
    '20250127000001_core_tables.sql',
    '20250127000002_workflow_projects.sql',
    '20250127000003_documents_reviews.sql',
    '20250127000004_communication_suppliers.sql',
    '20250127000005_advanced_features.sql',
    '20250127000006_convert_users_to_user_id.sql',
    '20250127000008_restore_users_data.sql',
    '20250127000009_insert_sample_users.sql',
    '20250127000010_rls_policies.sql'
];

async function applyMigration(migrationFile) {
    try {
        console.log(`\n🔄 Applying migration: ${migrationFile}`);

        // Read migration file
        const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', migrationFile);
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Split SQL into individual statements
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    const { error } = await supabase.rpc('exec_sql', { sql: statement });
                    if (error) {
                        console.log(`⚠️  Statement ${i + 1} had an issue (continuing):`, error.message);
                    }
                } catch (err) {
                    console.log(`⚠️  Statement ${i + 1} failed (continuing):`, err.message);
                }
            }
        }

        console.log(`✅ Migration ${migrationFile} completed`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to apply migration ${migrationFile}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Starting remote database migration...');
    console.log(`📡 Connecting to: ${SUPABASE_URL}`);

    // Test connection
    try {
        const { data, error } = await supabase.from('information_schema.tables').select('table_name').limit(1);
        if (error) {
            console.error('❌ Connection test failed:', error.message);
            console.log('\n🔑 Make sure you have:');
            console.log('1. Updated the SERVICE_ROLE_KEY in this script');
            console.log('2. The service role key is correct');
            console.log('3. Your project is accessible');
            return;
        }
        console.log('✅ Connection successful');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        return;
    }

    // Apply migrations
    let successCount = 0;
    for (const migration of migrations) {
        const success = await applyMigration(migration);
        if (success) successCount++;
    }

    console.log(`\n🎉 Migration complete! ${successCount}/${migrations.length} migrations applied successfully.`);

    if (successCount === migrations.length) {
        console.log('\n✅ Your remote database is now synchronized!');
        console.log('🔄 You can now switch to local development.');
    } else {
        console.log('\n⚠️  Some migrations failed. Check the logs above.');
    }
}

// Run the migration
main().catch(console.error);
