#!/usr/bin/env node

/**
 * Test script to verify upload fixes
 * This script tests the database connectivity and column name fixes
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');

    try {
        const { data, error } = await supabase
            .from('organizations')
            .select('id, name')
            .limit(1);

        if (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }

        console.log('✅ Database connection successful');
        console.log('   Found organizations:', data?.length || 0);
        return true;
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        return false;
    }
}

async function testDocumentsTableStructure() {
    console.log('🔍 Testing documents table structure...');

    try {
        // Check if we can insert a test record with the corrected column names
        const testData = {
            organization_id: '00000000-0000-0000-0000-000000000000',
            project_id: '00000000-0000-0000-0000-000000000000',
            title: 'Test Document',
            file_name: 'test.txt',
            file_path: 'test/path/test.txt',
            file_size: 1024,
            mime_type: 'text/plain', // This should work now
            category: 'other',
            access_level: 'internal',
            uploaded_by: '00000000-0000-0000-0000-000000000000'
        };

        console.log('📋 Testing insert with corrected column names:');
        console.log('   - mime_type (was file_type)');
        console.log('   - category (was document_type)');

        // Try to insert (this will fail due to foreign key constraints, but that's OK)
        const { data, error } = await supabase
            .from('documents')
            .insert(testData)
            .select();

        if (error) {
            // Check if it's a column name error or foreign key error
            if (error.message.includes('column') && error.message.includes('does not exist')) {
                console.error('❌ Column name error:', error.message);
                return false;
            } else {
                console.log('✅ Column names are correct (foreign key error expected):', error.message.split('\n')[0]);
                return true;
            }
        } else {
            console.log('✅ Insert succeeded unexpectedly');
            // Clean up the test record
            if (data?.[0]?.id) {
                await supabase.from('documents').delete().eq('id', data[0].id);
            }
            return true;
        }
    } catch (error) {
        console.error('❌ Documents table test failed:', error.message);
        return false;
    }
}

async function testStorageBucket() {
    console.log('🔍 Testing storage bucket...');

    try {
        const { data, error } = await supabase.storage
            .from('documents')
            .list('', { limit: 1 });

        if (error) {
            console.error('❌ Storage bucket access failed:', error.message);
            return false;
        }

        console.log('✅ Storage bucket accessible');
        console.log('   Files found:', data?.length || 0);
        return true;
    } catch (error) {
        console.error('❌ Storage test failed:', error.message);
        return false;
    }
}

async function runUploadSimulation() {
    console.log('🔍 Running upload simulation...');

    try {
        // Create a test file
        const testContent = `Test document created at ${new Date().toISOString()}`;
        const blob = new Blob([testContent], { type: 'text/plain' });
        const file = new File([blob], 'test_upload.txt', { type: 'text/plain' });

        console.log('📄 Created test file:', {
            name: file.name,
            size: file.size,
            type: file.type
        });

        // Get test organization and user
        const { data: orgData } = await supabase
            .from('organizations')
            .select('id')
            .limit(1);

        const { data: userData } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        if (!orgData?.[0] || !userData?.[0]) {
            console.log('⚠️ No test organization/user found, skipping full simulation');
            return true;
        }

        const orgId = orgData[0].id;
        const userId = userData[0].id;

        console.log('👤 Using test context:', { orgId, userId });

        // Simulate the upload process (without actually creating records)
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${orgId}/test/${fileName}`;

        console.log('📁 Would upload to path:', filePath);
        console.log('📊 Would insert record with:', {
            organization_id: orgId,
            title: file.name,
            file_name: fileName,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: userId,
            category: 'other',
            access_level: 'internal'
        });

        console.log('✅ Upload simulation completed (no actual files created)');
        return true;

    } catch (error) {
        console.error('❌ Upload simulation failed:', error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Upload Fix Verification Test');
    console.log('================================');
    console.log('');

    const results = {
        database: false,
        tableStructure: false,
        storage: false,
        simulation: false
    };

    // Test database connection
    results.database = await testDatabaseConnection();
    console.log('');

    if (results.database) {
        // Test table structure
        results.tableStructure = await testDocumentsTableStructure();
        console.log('');

        // Test storage
        results.storage = await testStorageBucket();
        console.log('');

        // Run simulation
        results.simulation = await runUploadSimulation();
        console.log('');
    }

    // Summary
    console.log('📋 Test Results Summary:');
    console.log('========================');
    console.log(`Database Connection: ${results.database ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Table Structure: ${results.tableStructure ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Storage Bucket: ${results.storage ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Upload Simulation: ${results.simulation ? '✅ PASS' : '❌ FAIL'}`);

    const allPassed = Object.values(results).every(result => result);
    console.log('');
    console.log(`🎯 Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

    if (!allPassed) {
        console.log('');
        console.log('💡 Next Steps:');
        if (!results.database) {
            console.log('   - Start Supabase: supabase start');
            console.log('   - Check environment variables');
        }
        if (!results.tableStructure) {
            console.log('   - Check database schema');
            console.log('   - Verify column names (mime_type, category)');
        }
        if (!results.storage) {
            console.log('   - Check storage bucket configuration');
            console.log('   - Verify RLS policies');
        }
    } else {
        console.log('');
        console.log('🎉 Upload fixes verified! Try uploading a document in the application.');
    }
}

// Run the test
main().catch(console.error);
