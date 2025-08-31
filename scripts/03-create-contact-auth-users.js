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

async function createContactAuthUsers() {
    try {
        console.log('🚀 Starting contact auth user creation...');

        // Read contacts data
        const contactsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../sample-data/04-contacts.json'), 'utf8'));

        console.log(`📋 Found ${contactsData.length} contacts to process`);

        let successCount = 0;
        let errorCount = 0;
        const createdUsers = [];

        // Create auth users for each contact
        for (const contact of contactsData) {
            try {
                console.log(`👤 Creating auth user for: ${contact.contact_name} (${contact.email})`);

                // Determine role based on contact type
                const role = contact.type === 'customer' ? 'customer' : 'supplier';

                const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                    id: contact.id, // Use the same ID from contacts
                    email: contact.email,
                    password: 'FactoryPulse@2025',
                    email_confirm: true,
                    user_metadata: {
                        name: contact.contact_name,
                        display_name: contact.contact_name,
                        full_name: contact.contact_name,
                        role: role,
                        company_name: contact.company_name,
                        contact_type: contact.type,
                        phone: contact.phone
                    }
                });

                if (authError) {
                    console.error(`❌ Error creating auth user for ${contact.email}:`, authError);
                    errorCount++;
                    continue;
                }

                createdUsers.push({
                    id: authUser.user.id,
                    email: contact.email,
                    name: contact.contact_name,
                    company: contact.company_name,
                    type: contact.type,
                    role: role
                });

                console.log(`✅ Auth user created: ${contact.contact_name} (${contact.company_name}) -> ${authUser.user.id}`);
                successCount++;

            } catch (error) {
                console.error(`❌ Unexpected error creating auth user for ${contact.email}:`, error);
                errorCount++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`✅ Successfully created: ${successCount} auth users`);
        console.log(`❌ Errors: ${errorCount} users`);

        if (successCount > 0) {
            console.log('\n🔑 All contact auth users created with password: FactoryPulse@2025');
            console.log('📧 Contacts can use these credentials to access the portal');

            console.log('\n👥 Created Users:');
            console.log('ID'.padEnd(40) + 'Email'.padEnd(35) + 'Name'.padEnd(25) + 'Company'.padEnd(30) + 'Type');
            console.log('-'.repeat(140));

            for (const user of createdUsers) {
                console.log(
                    user.id.padEnd(40) +
                    user.email.padEnd(35) +
                    user.name.padEnd(25) +
                    user.company.padEnd(30) +
                    user.type
                );
            }

            console.log('\n📝 Note: These users are created in auth.users only.');
            console.log('💡 You may need to create corresponding user profiles in the users table if required.');
        }

    } catch (error) {
        console.error('❌ Script error:', error);
    }
}

// Run the script
createContactAuthUsers();