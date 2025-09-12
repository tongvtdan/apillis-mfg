#!/usr/bin/env node

/**
 * Storage Bucket Setup Script
 * This script creates the required storage bucket for document uploads
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

async function checkExistingBuckets() {
    logInfo('Checking existing storage buckets...');

    try {
        const { data: buckets, error } = await supabase.storage.listBuckets();

        if (error) {
            logError(`Failed to list buckets: ${error.message}`);
            return [];
        }

        logSuccess(`Found ${buckets.length} existing buckets`);
        buckets.forEach(bucket => {
            log(`   - ${bucket.name} (public: ${bucket.public})`, 'cyan');
        });

        return buckets;
    } catch (error) {
        logError(`Error checking buckets: ${error.message}`);
        return [];
    }
}

async function createDocumentsBucket() {
    logInfo('Creating documents storage bucket...');

    try {
        // Check if bucket already exists
        const existingBuckets = await checkExistingBuckets();
        const documentsBucket = existingBuckets.find(b => b.name === 'documents');

        if (documentsBucket) {
            logWarning('Documents bucket already exists');
            return documentsBucket;
        }

        // Create the bucket
        const { data, error } = await supabase.storage.createBucket('documents', {
            public: false,
            fileSizeLimit: 100 * 1024 * 1024, // 100MB
            allowedMimeTypes: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'image/jpeg',
                'image/png',
                'image/gif',
                'text/plain',
                'application/zip',
                'application/x-zip-compressed'
            ]
        });

        if (error) {
            logError(`Failed to create bucket: ${error.message}`);
            return null;
        }

        logSuccess('Documents bucket created successfully');
        return data;
    } catch (error) {
        logError(`Error creating bucket: ${error.message}`);
        return null;
    }
}

async function testBucketAccess() {
    logInfo('Testing bucket access...');

    try {
        // Try to list files in the bucket
        const { data, error } = await supabase.storage
            .from('documents')
            .list('', { limit: 1 });

        if (error) {
            logError(`Bucket access test failed: ${error.message}`);
            return false;
        }

        logSuccess('Bucket access test passed');
        log(`   Files in bucket: ${data?.length || 0}`, 'cyan');
        return true;
    } catch (error) {
        logError(`Bucket access test error: ${error.message}`);
        return false;
    }
}

async function testFileUpload() {
    logInfo('Testing file upload...');

    try {
        // Create a test file
        const testContent = `Test file created at ${new Date().toISOString()}`;
        const blob = new Blob([testContent], { type: 'text/plain' });
        const testFile = new File([blob], 'test_upload.txt', { type: 'text/plain' });

        // Upload test file
        const { data, error } = await supabase.storage
            .from('documents')
            .upload('test/test_upload.txt', testFile);

        if (error) {
            logError(`File upload test failed: ${error.message}`);
            return false;
        }

        logSuccess('File upload test passed');
        log(`   Uploaded to: ${data.path}`, 'cyan');

        // Clean up test file
        const { error: deleteError } = await supabase.storage
            .from('documents')
            .remove(['test/test_upload.txt']);

        if (deleteError) {
            logWarning(`Failed to clean up test file: ${deleteError.message}`);
        } else {
            logSuccess('Test file cleaned up');
        }

        return true;
    } catch (error) {
        logError(`File upload test error: ${error.message}`);
        return false;
    }
}

async function main() {
    log('🚀 Storage Bucket Setup Script', 'cyan');
    log('==============================', 'cyan');
    log('');

    try {
        // Check existing buckets
        await checkExistingBuckets();
        log('');

        // Create documents bucket
        const bucket = await createDocumentsBucket();
        log('');

        if (bucket) {
            // Test bucket access
            const accessTest = await testBucketAccess();
            log('');

            if (accessTest) {
                // Test file upload
                const uploadTest = await testFileUpload();
                log('');

                if (uploadTest) {
                    logSuccess('🎉 Storage bucket setup completed successfully!');
                    log('');
                    log('📋 Next Steps:', 'cyan');
                    log('   1. Try uploading a document in your application');
                    log('   2. Check that files appear in the document list');
                    log('   3. Verify files are accessible for download');
                } else {
                    logError('❌ File upload test failed');
                }
            } else {
                logError('❌ Bucket access test failed');
            }
        } else {
            logError('❌ Failed to create documents bucket');
        }

    } catch (error) {
        logError(`Script execution failed: ${error.message}`);
    }

    log('');
    log('🔧 Manual Setup Alternative:', 'yellow');
    log('   If this script fails, run the SQL script manually:');
    log('   psql -h localhost -p 54322 -U postgres -d postgres -f create_storage_bucket.sql', 'cyan');
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    checkExistingBuckets,
    createDocumentsBucket,
    testBucketAccess,
    testFileUpload
};
