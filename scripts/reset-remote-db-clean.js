import { createClient } from '@supabase/supabase-js';

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

async function resetDatabase() {
    try {
        console.log('🚀 Starting clean remote database reset...');
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

        // Get all user tables (excluding system tables)
        const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
            sql: `
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                AND table_name NOT LIKE 'pg_%'
                AND table_name NOT LIKE 'sql_%'
                ORDER BY table_name;
            `
        });

        if (tablesError) {
            console.error('❌ Failed to get tables:', tablesError.message);
            return;
        }

        if (!tables || tables.length === 0) {
            console.log('✅ Database is already clean - no tables found');
            return;
        }

        console.log(`📋 Found ${tables.length} tables to drop:`);
        tables.forEach(table => console.log(`   - ${table.table_name}`));

        // Drop all tables with CASCADE to remove dependencies
        const dropSQL = `
            DROP SCHEMA public CASCADE;
            CREATE SCHEMA public;
            GRANT ALL ON SCHEMA public TO postgres;
            GRANT ALL ON SCHEMA public TO public;
        `;

        console.log('\n🗑️  Dropping all tables and recreating public schema...');

        const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropSQL });

        if (dropError) {
            console.error('❌ Failed to drop tables:', dropError.message);
            return;
        }

        console.log('✅ Database successfully reset to clean state!');
        console.log('📝 No migrations were applied - database is completely empty');
        console.log('🚀 You can now develop locally and apply migrations later when ready');

    } catch (error) {
        console.error('❌ Reset failed:', error.message);
    }
}

// Run the reset
resetDatabase().catch(console.error);
