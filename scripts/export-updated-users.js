import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function exportUpdatedUsers() {
    try {
        console.log('📤 Exporting updated user data...');

        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('name');

        if (error) {
            console.error('❌ Error fetching users:', error);
            return;
        }

        console.log(`📋 Found ${users.length} users to export`);

        // Write to new file
        const outputPath = path.join(__dirname, '../sample-data/03-users-updated.json');
        fs.writeFileSync(outputPath, JSON.stringify(users, null, 4));

        console.log(`✅ Updated user data exported to: ${outputPath}`);
        console.log('\n👥 Users exported:');
        users.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - ${user.role}`);
        });

    } catch (error) {
        console.error('❌ Export error:', error);
    }
}

// Run the script
exportUpdatedUsers();