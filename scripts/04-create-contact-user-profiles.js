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

async function createContactUserProfiles() {
    try {
        console.log('🚀 Starting contact user profile creation...');

        // Read contacts data
        const contactsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../sample-data/04-contacts.json'), 'utf8'));

        console.log(`📋 Found ${contactsData.length} contacts to process`);

        // Verify that auth users exist for these contacts
        console.log('🔍 Verifying auth users exist...');
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.error('❌ Error fetching auth users:', authError);
            return;
        }

        const authUserIds = new Set(authUsers.users.map(user => user.id));
        const contactsWithAuth = contactsData.filter(contact => authUserIds.has(contact.id));
        const missingAuth = contactsData.filter(contact => !authUserIds.has(contact.id));

        if (missingAuth.length > 0) {
            console.log(`⚠️  Warning: ${missingAuth.length} contacts don't have auth users:`);
            missingAuth.forEach(contact => {
                console.log(`   - ${contact.contact_name} (${contact.email})`);
            });
            console.log('💡 Run create-contact-auth-users.js first to create auth users');
        }

        console.log(`✅ Found ${contactsWithAuth.length} contacts with auth users`);

        let successCount = 0;
        let errorCount = 0;
        const createdProfiles = [];

        // Create user profiles for contacts with auth users
        for (const contact of contactsWithAuth) {
            try {
                console.log(`👤 Creating user profile for: ${contact.contact_name} (${contact.company_name})`);

                // Determine role and department based on contact type
                const role = contact.type === 'customer' ? 'customer' : 'supplier';
                const department = contact.type === 'customer' ? 'Customer' : 'Supplier';

                // Create user profile
                const userProfile = {
                    id: contact.id, // Same ID as auth user and contact
                    organization_id: contact.organization_id,
                    email: contact.email,
                    name: contact.contact_name,
                    role: role,
                    department: department,
                    phone: contact.phone,
                    avatar_url: null,
                    status: contact.is_active ? 'active' : 'inactive',
                    description: `${contact.type === 'customer' ? 'Customer' : 'Supplier'} contact from ${contact.company_name}. ${contact.notes || ''}`.trim(),
                    employee_id: null, // External contacts don't have employee IDs
                    direct_manager_id: null, // External contacts don't have internal managers
                    direct_reports: [], // External contacts don't manage internal staff
                    last_login_at: null,
                    preferences: {
                        company_name: contact.company_name,
                        contact_type: contact.type,
                        industry: contact.metadata?.industry || null,
                        preferred_currency: contact.metadata?.preferred_currency || 'VND',
                        payment_terms: contact.payment_terms,
                        credit_limit: contact.credit_limit,
                        website: contact.website,
                        tax_id: contact.tax_id,
                        address: {
                            street: contact.address,
                            city: contact.city,
                            state: contact.state,
                            country: contact.country,
                            postal_code: contact.postal_code
                        },
                        ai_category: contact.ai_category,
                        ai_capabilities: contact.ai_capabilities,
                        ai_risk_score: contact.ai_risk_score
                    },
                    created_at: contact.created_at,
                    updated_at: contact.updated_at
                };

                const { error: profileError } = await supabase
                    .from('users')
                    .insert(userProfile);

                if (profileError) {
                    console.error(`❌ Error creating user profile for ${contact.email}:`, profileError);
                    errorCount++;
                } else {
                    createdProfiles.push({
                        id: contact.id,
                        name: contact.contact_name,
                        email: contact.email,
                        company: contact.company_name,
                        type: contact.type,
                        role: role
                    });
                    console.log(`✅ User profile created for ${contact.contact_name} (${contact.company_name})`);
                    successCount++;
                }

            } catch (error) {
                console.error(`❌ Unexpected error processing ${contact.email}:`, error);
                errorCount++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`✅ Successfully created: ${successCount} user profiles`);
        console.log(`❌ Errors: ${errorCount} profiles`);
        console.log(`⚠️  Skipped (no auth user): ${missingAuth.length} contacts`);

        if (successCount > 0) {
            console.log('\n👥 Created User Profiles:');
            console.log('Type'.padEnd(10) + 'Name'.padEnd(25) + 'Company'.padEnd(30) + 'Email'.padEnd(35) + 'Role');
            console.log('-'.repeat(110));

            for (const profile of createdProfiles) {
                console.log(
                    profile.type.padEnd(10) +
                    profile.name.padEnd(25) +
                    profile.company.padEnd(30) +
                    profile.email.padEnd(35) +
                    profile.role
                );
            }

            console.log('\n📝 Notes:');
            console.log('- Contact preferences include company details, payment terms, and AI analysis data');
            console.log('- External contacts have no employee_id, manager, or direct reports');
            console.log('- Status is set based on contact.is_active field');
            console.log('- Department is set to "Customer" or "Supplier" based on contact type');
        }

    } catch (error) {
        console.error('❌ Script error:', error);
    }
}

// Run the script
createContactUserProfiles();