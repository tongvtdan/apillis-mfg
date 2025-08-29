#!/usr/bin/env node

/**
 * Script to verify user synchronization between auth.users and users table
 * This confirms that the ID in users table matches the uid in auth.users
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyUserSync() {
    try {
        console.log('🔍 Verifying user synchronization between auth.users and users table...\n');

        // Get all users from both tables
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        const { data: tableUsers, error: tableError } = await supabase
            .from('users')
            .select('id, email, name, role, department, employee_id')
            .order('role', { ascending: true })
            .order('name', { ascending: true });

        if (authError) {
            throw new Error(`Error fetching auth users: ${authError.message}`);
        }

        if (tableError) {
            throw new Error(`Error fetching table users: ${tableError.message}`);
        }

        console.log(`📊 Found ${authUsers.users.length} authentication users and ${tableUsers.length} table users\n`);

        // Create maps for easy lookup
        const authUserMap = new Map();
        const tableUserMap = new Map();

        authUsers.users.forEach(user => {
            authUserMap.set(user.email, user);
        });

        tableUsers.forEach(user => {
            tableUserMap.set(user.email, user);
        });

        // Check synchronization
        let syncCount = 0;
        let mismatchCount = 0;
        const mismatches = [];

        console.log('🔍 Checking ID synchronization...\n');

        for (const tableUser of tableUsers) {
            const authUser = authUserMap.get(tableUser.email);

            if (!authUser) {
                console.log(`❌ No auth user found for: ${tableUser.email}`);
                mismatchCount++;
                mismatches.push({
                    email: tableUser.email,
                    issue: 'No auth user found',
                    tableId: tableUser.id,
                    authId: 'N/A'
                });
                continue;
            }

            if (tableUser.id === authUser.id) {
                console.log(`✅ SYNCED: ${tableUser.name} (${tableUser.email}) - ID: ${tableUser.id}`);
                syncCount++;
            } else {
                console.log(`❌ MISMATCH: ${tableUser.name} (${tableUser.email})`);
                console.log(`   Table ID: ${tableUser.id}`);
                console.log(`   Auth ID:  ${authUser.id}`);
                mismatchCount++;
                mismatches.push({
                    email: tableUser.email,
                    issue: 'ID mismatch',
                    tableId: tableUser.id,
                    authId: authUser.id
                });
            }
        }

        // Check for auth users without table records
        const orphanedAuthUsers = [];
        for (const authUser of authUsers.users) {
            if (!tableUserMap.has(authUser.email)) {
                orphanedAuthUsers.push(authUser.email);
            }
        }

        console.log('\n📊 Synchronization Summary:');
        console.log(`✅ Synchronized users: ${syncCount}`);
        console.log(`❌ Mismatched users: ${mismatchCount}`);
        console.log(`🔍 Orphaned auth users: ${orphanedAuthUsers.length}`);

        if (mismatchCount > 0) {
            console.log('\n❌ Mismatch Details:');
            mismatches.forEach(mismatch => {
                console.log(`   ${mismatch.email}: ${mismatch.issue}`);
                console.log(`     Table ID: ${mismatch.tableId}`);
                console.log(`     Auth ID:  ${mismatch.authId}`);
            });
        }

        if (orphanedAuthUsers.length > 0) {
            console.log('\n🔍 Orphaned Auth Users (no table record):');
            orphanedAuthUsers.forEach(email => {
                console.log(`   ${email}`);
            });
        }

        // Verify all users have the same data
        console.log('\n🔍 Verifying data consistency...\n');
        let dataMatchCount = 0;
        let dataMismatchCount = 0;

        for (const tableUser of tableUsers) {
            const authUser = authUserMap.get(tableUser.email);

            if (!authUser) continue;

            const authMeta = authUser.user_metadata || {};
            const nameMatch = tableUser.name === authMeta.name;
            const roleMatch = tableUser.role === authMeta.role;
            const deptMatch = tableUser.department === authMeta.department;
            const empIdMatch = tableUser.employee_id === authMeta.employee_id;

            if (nameMatch && roleMatch && deptMatch && empIdMatch) {
                console.log(`✅ Data match: ${tableUser.name} (${tableUser.email})`);
                dataMatchCount++;
            } else {
                console.log(`❌ Data mismatch: ${tableUser.name} (${tableUser.email})`);
                console.log(`   Name: ${nameMatch ? '✅' : '❌'} (Table: ${tableUser.name}, Auth: ${authMeta.name})`);
                console.log(`   Role: ${roleMatch ? '✅' : '❌'} (Table: ${tableUser.role}, Auth: ${authMeta.role})`);
                console.log(`   Dept: ${deptMatch ? '✅' : '❌'} (Table: ${tableUser.department}, Auth: ${authMeta.department})`);
                console.log(`   EmpID: ${empIdMatch ? '✅' : '❌'} (Table: ${tableUser.employee_id}, Auth: ${authMeta.employee_id})`);
                dataMismatchCount++;
            }
        }

        console.log('\n📊 Data Consistency Summary:');
        console.log(`✅ Data matches: ${dataMatchCount}`);
        console.log(`❌ Data mismatches: ${dataMismatchCount}`);

        // Final verification
        if (syncCount === tableUsers.length && dataMatchCount === tableUsers.length && orphanedAuthUsers.length === 0) {
            console.log('\n🎉 PERFECT SYNCHRONIZATION!');
            console.log('✅ All users have synchronized IDs');
            console.log('✅ All user data is consistent');
            console.log('✅ No orphaned authentication users');
        } else {
            console.log('\n⚠️  SYNCHRONIZATION ISSUES DETECTED');
            console.log('Please review the mismatches above');
        }

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    }
}

// Run the verification
verifyUserSync();
