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

async function seedPurchaseOrders() {
    try {
        console.log('🌱 Starting purchase orders seeding...');

        // Load purchase orders data
        const purchaseOrdersPath = path.join(__dirname, '../sample-data/11-purchase-orders.json');
        const purchaseOrdersData = JSON.parse(fs.readFileSync(purchaseOrdersPath, 'utf8'));

        console.log(`📊 Found ${purchaseOrdersData.length} purchase orders to seed`);

        // Check if purchase orders already exist
        const { data: existingPurchaseOrders, error: checkError } = await supabase
            .from('purchase_orders')
            .select('id, po_number')
            .limit(1);

        if (checkError) {
            throw new Error(`Failed to check existing purchase orders: ${checkError.message}`);
        }

        if (existingPurchaseOrders && existingPurchaseOrders.length > 0) {
            console.log('⚠️  Purchase orders table already contains data');
            console.log('   Use --force flag to overwrite existing data');

            if (!process.argv.includes('--force')) {
                console.log('   Skipping seeding to prevent data loss');
                return;
            }

            console.log('🗑️  Clearing existing purchase orders...');
            const { error: deleteError } = await supabase
                .from('purchase_orders')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (deleteError) {
                throw new Error(`Failed to clear existing purchase orders: ${deleteError.message}`);
            }

            console.log('✅ Existing purchase orders cleared');
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

        // Validate purchase order data
        const validPurchaseOrders = purchaseOrdersData.filter(po => {
            if (!orgIds.has(po.organization_id)) {
                console.log(`⚠️  Skipping purchase order ${po.po_number}: Invalid organization_id ${po.organization_id}`);
                return false;
            }
            return true;
        });

        if (validPurchaseOrders.length === 0) {
            throw new Error('No valid purchase orders found. All purchase orders have invalid organization_id references');
        }

        // Insert purchase orders
        console.log('📝 Inserting purchase orders...');
        const { data, error } = await supabase
            .from('purchase_orders')
            .insert(validPurchaseOrders)
            .select();

        if (error) {
            throw new Error(`Failed to insert purchase orders: ${error.message}`);
        }

        console.log('✅ Successfully seeded purchase orders:');

        // Group by type for better display
        const customerOrders = data.filter(po => !po.supplier_id);
        const supplierOrders = data.filter(po => po.supplier_id);

        if (customerOrders.length > 0) {
            console.log(`\n🛒 Customer Orders (${customerOrders.length}):`);
            customerOrders.forEach((po, index) => {
                console.log(`   ${index + 1}. ${po.po_number} - Project: ${po.project_id?.substring(0, 8) || 'N/A'}`);
            });
        }

        if (supplierOrders.length > 0) {
            console.log(`\n📦 Supplier Orders (${supplierOrders.length}):`);
            supplierOrders.forEach((po, index) => {
                console.log(`   ${index + 1}. ${po.po_number} - Supplier: ${po.supplier_id?.substring(0, 8) || 'N/A'}`);
            });
        }

        console.log(`\n🎉 Seeding completed! ${data.length} purchase orders added to database`);
        console.log(`📊 Summary: ${customerOrders.length} customer orders, ${supplierOrders.length} supplier orders`);

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

// Run the seeding
seedPurchaseOrders();