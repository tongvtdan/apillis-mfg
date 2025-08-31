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

async function seedInventory() {
    try {
        console.log('🌱 Starting inventory items seeding...');

        // Load inventory items data
        const inventoryPath = path.join(__dirname, '../sample-data/13-inventory-items.json');
        const inventoryData = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

        console.log(`📊 Found ${inventoryData.length} inventory items to seed`);

        // Check if inventory items already exist
        const { data: existingInventory, error: checkError } = await supabase
            .from('inventory_items')
            .select('id, item_code')
            .limit(1);

        if (checkError) {
            throw new Error(`Failed to check existing inventory items: ${checkError.message}`);
        }

        if (existingInventory && existingInventory.length > 0) {
            console.log('⚠️  Inventory items table already contains data');
            console.log('   Use --force flag to overwrite existing data');

            if (!process.argv.includes('--force')) {
                console.log('   Skipping seeding to prevent data loss');
                return;
            }

            console.log('🗑️  Clearing existing inventory items...');
            const { error: deleteError } = await supabase
                .from('inventory_items')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (deleteError) {
                throw new Error(`Failed to clear existing inventory items: ${deleteError.message}`);
            }

            console.log('✅ Existing inventory items cleared');
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

        // Validate inventory data
        const validInventory = inventoryData.filter(item => {
            if (!orgIds.has(item.organization_id)) {
                console.log(`⚠️  Skipping inventory item ${item.item_name}: Invalid organization_id ${item.organization_id}`);
                return false;
            }
            return true;
        });

        if (validInventory.length === 0) {
            throw new Error('No valid inventory items found. All inventory items have invalid organization_id references');
        }

        // Insert inventory items
        console.log('📝 Inserting inventory items...');
        const { data, error } = await supabase
            .from('inventory_items')
            .insert(validInventory)
            .select();

        if (error) {
            throw new Error(`Failed to insert inventory items: ${error.message}`);
        }

        console.log('✅ Successfully seeded inventory items:');

        // Group by category for better display
        const rawMaterials = data.filter(item => item.category === 'raw_material');
        const components = data.filter(item => item.category === 'components');
        const fasteners = data.filter(item => item.category === 'fasteners');
        const consumables = data.filter(item => item.category === 'consumables');

        if (rawMaterials.length > 0) {
            console.log(`\n🔩 Raw Materials (${rawMaterials.length}):`);
            rawMaterials.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.item_name} - Stock: ${item.current_stock}${item.unit}`);
            });
        }

        if (components.length > 0) {
            console.log(`\n⚙️  Components (${components.length}):`);
            components.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.item_name} - Stock: ${item.current_stock}${item.unit}`);
            });
        }

        if (fasteners.length > 0) {
            console.log(`\n🔗 Fasteners (${fasteners.length}):`);
            fasteners.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.item_name} - Stock: ${item.current_stock}${item.unit}`);
            });
        }

        if (consumables.length > 0) {
            console.log(`\n🧯 Consumables (${consumables.length}):`);
            consumables.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.item_name} - Stock: ${item.current_stock}${item.unit}`);
            });
        }

        console.log(`\n🎉 Seeding completed! ${data.length} inventory items added to database`);
        console.log(`📊 Summary: ${rawMaterials.length} raw materials, ${components.length} components, ${fasteners.length} fasteners, ${consumables.length} consumables`);

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

// Run the seeding
seedInventory();