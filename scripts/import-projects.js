import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importProjects() {
    try {
        console.log('🚀 Starting projects import...');

        // Read the projects data
        const projectsPath = path.join(__dirname, '../sample-data/backup/projects.json');
        const projectsData = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

        console.log(`📊 Found ${projectsData.length} projects to import`);

        // Check if projects already exist
        const { count: existingCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true });

        if (existingCount > 0) {
            console.log(`⚠️  Found ${existingCount} existing projects. Skipping import.`);
            console.log(`📊 Total projects in database: ${existingCount}`);
            return;
        }

        // Import projects in batches
        const batchSize = 5;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < projectsData.length; i += batchSize) {
            const batch = projectsData.slice(i, i + batchSize);

            console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(projectsData.length / batchSize)}`);

            const { data, error } = await supabase
                .from('projects')
                .insert(batch)
                .select();

            if (error) {
                console.error(`❌ Error importing batch:`, error);
                errorCount += batch.length;
            } else {
                console.log(`✅ Successfully imported ${batch.length} projects`);
                successCount += batch.length;
            }

            // Small delay between batches to avoid overwhelming the database
            if (i + batchSize < projectsData.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log('\n🎉 Projects import completed!');
        console.log(`✅ Successfully imported: ${successCount} projects`);
        if (errorCount > 0) {
            console.log(`❌ Failed to import: ${errorCount} projects`);
        }

        // Verify the import
        const { count: finalCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true });

        console.log(`📊 Total projects in database: ${finalCount}`);

        // Show sample of imported projects
        const { data: sampleProjects } = await supabase
            .from('projects')
            .select('project_id, title, status, priority_level, estimated_value')
            .limit(5);

        if (sampleProjects && sampleProjects.length > 0) {
            console.log('\n📋 Sample of imported projects:');
            sampleProjects.forEach(project => {
                console.log(`  - ${project.project_id}: ${project.title} (${project.status}, ${project.priority_level}, ${project.estimated_value})`);
            });
        }

    } catch (error) {
        console.error('💥 Import failed:', error);
        process.exit(1);
    }
}

// Run the import
importProjects();
