#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.error('   VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
    console.error('\nPlease check your .env.local file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedProductionOrders() {
    try {
        console.log('🌱 Starting production orders seeding...');

        // Load production orders data
        const productionOrdersPath = path.join(__dirname, '../sample-data/12-production-orders.json');
        const productionOrdersData = JSON.parse(fs.readFileSync(productionOrdersPath, 'utf8'));

        console.log(`📊 Found ${productionOrdersData.length} production orders to seed`);

        // Check if production orders already exist
        const { data: existingProductionOrders, error: checkError } = await supabase
            .from('production_orders')
            .select('id, production_number')
            .limit(1);

        if (checkError) {
            throw new Error(`Failed to check existing production orders: ${checkError.message}`);
        }

        if (existingProductionOrders && existingProductionOrders.length > 0) {
            console.log('⚠️  Production orders table already contains data');
            console.log('   Use --force flag to overwrite existing data');

            if (!process.argv.includes('--force')) {
                console.log('   Skipping seeding to prevent data loss');
                return;
            }

            console.log('🗑️  Clearing existing production orders...');
            const { error: deleteError } = await supabase
                .from('production_orders')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (deleteError) {
                throw new Error(`Failed to clear existing production orders: ${deleteError.message}`);
            }

            console.log('✅ Existing production orders cleared');
        }

        // Verify organizations exist
        console.log('🔍 Verifying organizations exist...');
        const { data: organizations, error: orgError } = await supabase
            .from('organizations')
            .select('id');

        if (orgError) {
            throw new Error(`Failed to fetch organizations: ${orgError.message}`);
        }

        if (!organizations || organizations.length === 0) {
            throw new Error('No organizations found. Please run 01-seed-organizations.js first');
        }

        const orgIds = new Set(organizations.map(org => org.id));

        // Validate production order data
        const validProductionOrders = productionOrdersData.filter(po => {
            if (!orgIds.has(po.organization_id)) {
                console.log(`⚠️  Skipping production order ${po.production_number}: Invalid organization_id ${po.organization_id}`);
                return false;
            }
            return true;
        });

        if (validProductionOrders.length === 0) {
            throw new Error('No valid production orders found. All production orders have invalid organization_id references');
        }

        // Insert production orders
        console.log('📝 Inserting production orders...');
        const { data, error } = await supabase
            .from('production_orders')
            .insert(validProductionOrders)
            .select();

        if (error) {
            throw new Error(`Failed to insert production orders: ${error.message}`);
        }

        console.log('✅ Successfully seeded production orders:');

        // Group by status for better display
        const inProgress = data.filter(po => po.status === 'in_progress');
        const scheduled = data.filter(po => po.status === 'scheduled');
        const planned = data.filter(po => po.status === 'planned');

        if (inProgress.length > 0) {
            console.log(`\n⚙️  In Progress (${inProgress.length}):`);
            inProgress.forEach((po, index) => {
                console.log(`   ${index + 1}. ${po.production_number} - Project: ${po.project_id?.substring(0, 8) || 'N/A'}`);
            });
        }

        if (scheduled.length > 0) {
            console.log(`\n📅 Scheduled (${scheduled.length}):`);
            scheduled.forEach((po, index) => {
                console.log(`   ${index + 1}. ${po.production_number} - Project: ${po.project_id?.substring(0, 8) || 'N/A'}`);
            });
        }

        if (planned.length > 0) {
            console.log(`\n📝 Planned (${planned.length}):`);
            planned.forEach((po, index) => {
                console.log(`   ${index + 1}. ${po.production_number} - Project: ${po.project_id?.substring(0, 8) || 'N/A'}`);
            });
        }

        console.log(`\n🎉 Seeding completed! ${data.length} production orders added to database`);
        console.log(`📊 Summary: ${inProgress.length} in progress, ${scheduled.length} scheduled, ${planned.length} planned`);

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

// Run the seeding
seedProductionOrders();