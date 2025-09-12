#!/usr/bin/env node

/**
 * Test script for TypeScript debug utilities
 * This script tests the documentDebugUtils functions
 */

// Import the utilities (you'll need to compile TypeScript first)
// For now, let's create a simple test

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabaseConnectivity() {
    console.log('🔍 Testing database connectivity...');

    try {
        const { data, error } = await supabase
            .from('organizations')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }

        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        return false;
    }
}

async function testDocumentsTable() {
    console.log('🔍 Testing documents table access...');

    try {
        const { data, error } = await supabase
            .from('documents')
            .select('id')
            .limit(1);

        if (error) {
            console.error('❌ Documents table access failed:', error.message);
            return false;
        }

        console.log('✅ Documents table accessible');
        return true;
    } catch (error) {
        console.error('❌ Documents table test failed:', error.message);
        return false;
    }
}

async function testStorageBucket() {
    console.log('🔍 Testing storage bucket access...');

    try {
        const { data, error } = await supabase.storage
            .from('documents')
            .list('', { limit: 1 });

        if (error) {
            console.error('❌ Storage bucket access failed:', error.message);
            return false;
        }

        console.log('✅ Storage bucket accessible');
        return true;
    } catch (error) {
        console.error('❌ Storage bucket test failed:', error.message);
        return false;
    }
}

async function getSystemInfo() {
    console.log('🔍 Gathering system information...');

    try {
        // Get organizations count
        const { count: orgCount } = await supabase
            .from('organizations')
            .select('*', { count: 'exact', head: true });

        // Get users count
        const { count: userCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        // Get documents count
        const { count: docCount } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true });

        console.log('📊 System Information:');
        console.log(`   Organizations: ${orgCount || 0}`);
        console.log(`   Users: ${userCount || 0}`);
        console.log(`   Documents: ${docCount || 0}`);

        return {
            organizations: orgCount || 0,
            users: userCount || 0,
            documents: docCount || 0
        };
    } catch (error) {
        console.error('❌ Failed to gather system info:', error.message);
        return null;
    }
}

async function main() {
    console.log('🚀 Starting TypeScript utilities test...');
    console.log('=====================================');

    const results = {
        database: false,
        documents: false,
        storage: false,
        systemInfo: null
    };

    // Test database connectivity
    results.database = await testDatabaseConnectivity();

    if (results.database) {
        // Test documents table
        results.documents = await testDocumentsTable();

        // Test storage bucket
        results.storage = await testStorageBucket();

        // Get system info
        results.systemInfo = await getSystemInfo();
    }

    console.log('\n📋 Test Results Summary:');
    console.log('========================');
    console.log(`Database Connection: ${results.database ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Documents Table: ${results.documents ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Storage Bucket: ${results.storage ? '✅ PASS' : '❌ FAIL'}`);

    if (results.systemInfo) {
        console.log('\n📊 System Status:');
        console.log(`   Organizations: ${results.systemInfo.organizations}`);
        console.log(`   Users: ${results.systemInfo.users}`);
        console.log(`   Documents: ${results.systemInfo.documents}`);
    }

    const allPassed = results.database && results.documents && results.storage;
    console.log(`\n🎯 Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

    if (!allPassed) {
        console.log('\n💡 Recommendations:');
        if (!results.database) {
            console.log('   - Check if Supabase is running: supabase start');
            console.log('   - Verify environment variables are set correctly');
        }
        if (!results.documents) {
            console.log('   - Run database migrations: supabase db reset --local');
            console.log('   - Check if documents table exists');
        }
        if (!results.storage) {
            console.log('   - Check storage bucket configuration');
            console.log('   - Verify RLS policies for storage');
        }
    }
}

// Run the test
main().catch(console.error);
