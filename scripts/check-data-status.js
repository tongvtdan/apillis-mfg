#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDataStatus() {
    try {
        console.log('📊 Database Data Status Report');
        console.log('='.repeat(50));

        // Check organizations
        const { data: orgs, error: orgError } = await supabase
            .from('organizations')
            .select('id, name, slug, industry');

        if (orgError) {
            console.error('❌ Error fetching organizations:', orgError);
        } else {
            console.log(`\n🏢 Organizations: ${orgs.length}`);
            orgs.forEach(org => {
                console.log(`   • ${org.name} (${org.slug}) - ${org.industry}`);
            });
        }

        // Check contacts
        const { data: contacts, error: contactError } = await supabase
            .from('contacts')
            .select('id, company_name, type, organization_id');

        if (contactError) {
            console.error('❌ Error fetching contacts:', contactError);
        } else {
            const customers = contacts.filter(c => c.type === 'customer');
            const suppliers = contacts.filter(c => c.type === 'supplier');

            console.log(`\n👥 Contacts: ${contacts.length} total`);
            console.log(`   • Customers: ${customers.length}`);
            console.log(`   • Suppliers: ${suppliers.length}`);

            console.log('\n   Customers:');
            customers.forEach(contact => {
                console.log(`     - ${contact.company_name}`);
            });

            console.log('\n   Suppliers:');
            suppliers.forEach(contact => {
                console.log(`     - ${contact.company_name}`);
            });
        }

        // Check projects
        const { data: projects, error: projectError } = await supabase
            .from('projects')
            .select('id, project_id, title, customer_id, status');

        if (projectError) {
            console.error('❌ Error fetching projects:', projectError);
        } else {
            const projectsWithCustomers = projects.filter(p => p.customer_id);
            const projectsWithoutCustomers = projects.filter(p => !p.customer_id);

            console.log(`\n📋 Projects: ${projects.length} total`);
            console.log(`   • With customers: ${projectsWithCustomers.length}`);
            console.log(`   • Without customers: ${projectsWithoutCustomers.length}`);

            console.log('\n   Sample projects with customers:');
            projectsWithCustomers.slice(0, 5).forEach(project => {
                console.log(`     - ${project.project_id}: ${project.title}`);
            });
        }

        // Check users
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id, name, role, department');

        if (userError) {
            console.error('❌ Error fetching users:', userError);
        } else {
            console.log(`\n👤 Users: ${users.length}`);
            if (users.length > 0) {
                const roles = {};
                users.forEach(user => {
                    roles[user.role] = (roles[user.role] || 0) + 1;
                });

                Object.entries(roles).forEach(([role, count]) => {
                    console.log(`   • ${role}: ${count}`);
                });
            }
        }

        // Check workflow stages
        const { data: stages, error: stageError } = await supabase
            .from('workflow_stages')
            .select('id, name, stage_order');

        if (stageError) {
            console.error('❌ Error fetching workflow stages:', stageError);
        } else {
            console.log(`\n🔄 Workflow Stages: ${stages.length}`);
            if (stages.length > 0) {
                stages.sort((a, b) => a.stage_order - b.stage_order).forEach(stage => {
                    console.log(`   • ${stage.stage_order}. ${stage.name}`);
                });
            }
        }

        // Check relationships
        console.log('\n🔗 Data Relationships:');

        if (projects && contacts) {
            const customerProjectCounts = {};
            projects.forEach(project => {
                if (project.customer_id) {
                    const customer = contacts.find(c => c.id === project.customer_id);
                    if (customer) {
                        customerProjectCounts[customer.company_name] = (customerProjectCounts[customer.company_name] || 0) + 1;
                    }
                }
            });

            console.log('   Projects per customer:');
            Object.entries(customerProjectCounts).forEach(([customer, count]) => {
                console.log(`     • ${customer}: ${count} projects`);
            });
        }

        console.log('\n✅ Data status check completed!');

    } catch (error) {
        console.error('❌ Error checking data status:', error);
    }
}

// Run the check
checkDataStatus();
