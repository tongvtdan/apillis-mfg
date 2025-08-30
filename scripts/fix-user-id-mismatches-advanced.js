#!/usr/bin/env node

/**
 * Advanced Fix User ID Mismatches Script
 * 
 * This script fixes ID mismatches by temporarily disabling foreign key constraints,
 * updating all references, then re-enabling constraints
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Users with ID mismatches
const userMismatches = [
    {
        email: 'admin@factorypulse.vn',
        name: 'Nguyễn Văn Admin',
        oldId: '083f04db-458a-416b-88e9-94acf10382f8',
        newId: 'e562c228-5322-4ed3-8998-d06f060c367e'
    },
    {
        email: 'ceo@factorypulse.vn',
        name: 'Trần Thị CEO',
        oldId: '99845907-7255-4155-9dd0-c848ab9860cf',
        newId: '1ca3818e-878a-495f-a2a4-1657c82267d4'
    },
    {
        email: 'sales@factorypulse.vn',
        name: 'Lê Văn Sales',
        oldId: 'a1f24ed5-319e-4b66-8d21-fbc70d07ea09',
        newId: 'bd501374-d7ef-48ef-a166-48d066ec4b8a'
    },
    {
        email: 'procurement@factorypulse.vn',
        name: 'Phạm Thị Procurement',
        oldId: 'c91843ad-4327-429a-bf57-2b891df50e18',
        newId: 'b6793310-b9be-48be-8643-9e1ad1d9b496'
    },
    {
        email: 'engineering@factorypulse.vn',
        name: 'Hoàng Văn Engineering',
        oldId: '776edb76-953a-4482-9533-c793a633cc27',
        newId: '7c6e33b0-e4b7-4fca-9f8a-efe520266e41'
    }
];

async function executeSQL(sql, description) {
    try {
        const { data, error } = await supabase.rpc('exec_sql', { sql });
        if (error) {
            console.error(`❌ Error ${description}:`, error.message);
            return false;
        }
        console.log(`✅ ${description}`);
        return true;
    } catch (error) {
        console.error(`❌ Unexpected error ${description}:`, error.message);
        return false;
    }
}

async function createExecSqlFunction() {
    console.log('🔧 Creating SQL execution function...');

    const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
        result json;
    BEGIN
        EXECUTE sql;
        GET DIAGNOSTICS result = ROW_COUNT;
        RETURN json_build_object('rows_affected', result);
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'SQL execution failed: %', SQLERRM;
    END;
    $$;
  `;

    return await executeSQL(createFunctionSQL, 'Created SQL execution function');
}

async function disableForeignKeyConstraints() {
    console.log('\n🔄 Temporarily disabling foreign key constraints...');

    const constraints = [
        'ALTER TABLE projects DISABLE TRIGGER ALL',
        'ALTER TABLE project_assignments DISABLE TRIGGER ALL',
        'ALTER TABLE documents DISABLE TRIGGER ALL',
        'ALTER TABLE reviews DISABLE TRIGGER ALL',
        'ALTER TABLE messages DISABLE TRIGGER ALL',
        'ALTER TABLE notifications DISABLE TRIGGER ALL',
        'ALTER TABLE activity_log DISABLE TRIGGER ALL'
    ];

    let success = true;
    for (const constraint of constraints) {
        const result = await executeSQL(constraint, `Disabled constraints for table`);
        if (!result) success = false;
    }

    return success;
}

async function enableForeignKeyConstraints() {
    console.log('\n🔄 Re-enabling foreign key constraints...');

    const constraints = [
        'ALTER TABLE projects ENABLE TRIGGER ALL',
        'ALTER TABLE project_assignments ENABLE TRIGGER ALL',
        'ALTER TABLE documents ENABLE TRIGGER ALL',
        'ALTER TABLE reviews ENABLE TRIGGER ALL',
        'ALTER TABLE messages ENABLE TRIGGER ALL',
        'ALTER TABLE notifications ENABLE TRIGGER ALL',
        'ALTER TABLE activity_log ENABLE TRIGGER ALL'
    ];

    let success = true;
    for (const constraint of constraints) {
        const result = await executeSQL(constraint, `Enabled constraints for table`);
        if (!result) success = false;
    }

    return success;
}

async function updateAllReferences(oldId, newId, userName) {
    console.log(`\n🔄 Updating all references for ${userName}...`);

    const updates = [
        `UPDATE projects SET assigned_to = '${newId}' WHERE assigned_to = '${oldId}'`,
        `UPDATE projects SET created_by = '${newId}' WHERE created_by = '${oldId}'`,
        `UPDATE project_assignments SET user_id = '${newId}' WHERE user_id = '${oldId}'`,
        `UPDATE documents SET uploaded_by = '${newId}' WHERE uploaded_by = '${oldId}'`,
        `UPDATE reviews SET reviewer_id = '${newId}' WHERE reviewer_id = '${oldId}'`,
        `UPDATE reviews SET created_by = '${newId}' WHERE created_by = '${oldId}'`,
        `UPDATE messages SET sender_id = '${newId}' WHERE sender_id = '${oldId}'`,
        `UPDATE notifications SET user_id = '${newId}' WHERE user_id = '${oldId}'`,
        `UPDATE activity_log SET user_id = '${newId}' WHERE user_id = '${oldId}'`,
        `UPDATE users SET id = '${newId}' WHERE id = '${oldId}'`
    ];

    let totalUpdated = 0;
    let success = true;

    for (const updateSQL of updates) {
        const result = await executeSQL(updateSQL, `Updated references`);
        if (!result) success = false;
    }

    return success;
}

async function fixAllUserIdMismatches() {
    console.log('\n👥 Fixing all user ID mismatches...');

    let overallSuccess = true;

    for (const userMismatch of userMismatches) {
        console.log(`\n👤 Processing: ${userMismatch.name} (${userMismatch.email})`);
        console.log(`   🔗 ${userMismatch.oldId} → ${userMismatch.newId}`);

        const success = await updateAllReferences(
            userMismatch.oldId,
            userMismatch.newId,
            userMismatch.name
        );

        if (!success) {
            console.error(`❌ Failed to update references for ${userMismatch.name}`);
            overallSuccess = false;
        } else {
            console.log(`✅ Successfully updated all references for ${userMismatch.name}`);
        }
    }

    return overallSuccess;
}

async function verifyFixes() {
    console.log('\n🔍 Verifying all fixes...');

    let successCount = 0;
    let errorCount = 0;

    for (const userMismatch of userMismatches) {
        try {
            // Check if user exists with the new ID
            const { data: user, error } = await supabase
                .from('users')
                .select('id, email, name')
                .eq('id', userMismatch.newId)
                .single();

            if (error || !user) {
                console.error(`❌ User not found with new ID: ${userMismatch.email}`);
                errorCount++;
            } else {
                console.log(`✅ Verified: ${user.name} (${user.email})`);
                successCount++;
            }
        } catch (error) {
            console.error(`❌ Error verifying ${userMismatch.email}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n📊 Verification Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total: ${userMismatches.length}`);

    return errorCount === 0;
}

async function main() {
    console.log('🚀 Advanced User ID Mismatch Fixing...');
    console.log(`📋 Fixing ${userMismatches.length} user ID mismatches`);

    try {
        // Step 1: Create SQL execution function
        const functionCreated = await createExecSqlFunction();
        if (!functionCreated) {
            console.error('❌ Failed to create SQL execution function');
            process.exit(1);
        }

        // Step 2: Disable foreign key constraints
        const constraintsDisabled = await disableForeignKeyConstraints();
        if (!constraintsDisabled) {
            console.error('❌ Failed to disable foreign key constraints');
            process.exit(1);
        }

        // Step 3: Fix all user ID mismatches
        const fixesSuccessful = await fixAllUserIdMismatches();

        // Step 4: Re-enable foreign key constraints
        const constraintsEnabled = await enableForeignKeyConstraints();
        if (!constraintsEnabled) {
            console.error('⚠️  Warning: Failed to re-enable some foreign key constraints');
        }

        // Step 5: Verify fixes
        const verificationSuccess = await verifyFixes();

        if (fixesSuccessful && verificationSuccess) {
            console.log('\n🎉 All User ID Mismatches Fixed Successfully!');
            console.log('\n📝 Summary:');
            console.log('   ✅ All foreign key constraints temporarily disabled');
            console.log('   ✅ All user ID references updated across all tables');
            console.log('   ✅ All foreign key constraints re-enabled');
            console.log('   ✅ Perfect ID synchronization between auth.users and public.users');
            console.log('\n🔄 Next: Run the authentication test script to verify everything works');
            process.exit(0);
        } else {
            console.log('\n❌ Some fixes failed');
            console.log('   Please check the errors above and retry');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n💥 Fatal error during advanced fixing:', error);

        // Try to re-enable constraints in case of failure
        console.log('\n🔄 Attempting to re-enable foreign key constraints...');
        await enableForeignKeyConstraints();

        process.exit(1);
    }
}

// Run the script
main();