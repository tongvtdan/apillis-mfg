import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importSampleData() {
    try {
        console.log('🚀 Starting sample data import...');

        // 1. Import organizations
        console.log('📦 Importing organizations...');
        const organizationsPath = path.join(__dirname, '../sample-data/backup/organizations.json');
        const organizationsData = JSON.parse(fs.readFileSync(organizationsPath, 'utf8'));

        const { error: orgError } = await supabase
            .from('organizations')
            .upsert(organizationsData, { onConflict: 'id' });

        if (orgError) {
            console.error('❌ Error importing organizations:', orgError);
        } else {
            console.log(`✅ Imported ${organizationsData.length} organizations`);
        }

        // 2. Import users
        console.log('📦 Importing users...');
        const usersPath = path.join(__dirname, '../sample-data/backup/users.json');
        const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

        const { error: usersError } = await supabase
            .from('users')
            .upsert(usersData, { onConflict: 'id' });

        if (usersError) {
            console.error('❌ Error importing users:', usersError);
        } else {
            console.log(`✅ Imported ${usersData.length} users`);
        }

        // 3. Import contacts
        console.log('📦 Importing contacts...');
        const contactsPath = path.join(__dirname, '../sample-data/backup/contacts.json');
        const contactsData = JSON.parse(fs.readFileSync(contactsPath, 'utf8'));

        const { error: contactsError } = await supabase
            .from('contacts')
            .upsert(contactsData, { onConflict: 'id' });

        if (contactsError) {
            console.error('❌ Error importing contacts:', contactsError);
        } else {
            console.log(`✅ Imported ${contactsData.length} contacts`);
        }

        // 4. Import workflow stages
        console.log('📦 Importing workflow stages...');
        const stagesPath = path.join(__dirname, '../sample-data/backup/workflow-stages.json');
        const stagesData = JSON.parse(fs.readFileSync(stagesPath, 'utf8'));

        const { error: stagesError } = await supabase
            .from('workflow_stages')
            .upsert(stagesData, { onConflict: 'id' });

        if (stagesError) {
            console.error('❌ Error importing workflow stages:', stagesError);
        } else {
            console.log(`✅ Imported ${stagesData.length} workflow stages`);
        }

        // 5. Import projects
        console.log('📦 Importing projects...');
        const projectsPath = path.join(__dirname, '../sample-data/backup/projects.json');
        const projectsData = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

        const { error: projectsError } = await supabase
            .from('projects')
            .upsert(projectsData, { onConflict: 'id' });

        if (projectsError) {
            console.error('❌ Error importing projects:', projectsError);
        } else {
            console.log(`✅ Imported ${projectsData.length} projects`);
        }

        console.log('🎉 Sample data import completed!');

    } catch (error) {
        console.error('💥 Import failed:', error);
        process.exit(1);
    }
}

importSampleData();