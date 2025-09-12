#!/usr/bin/env node

/**
 * Document Preview Test Script
 * This script tests the document preview functionality
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

async function checkDocuments() {
    logInfo('Checking uploaded documents...');

    try {
        const { data: documents, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            logError(`Failed to fetch documents: ${error.message}`);
            return [];
        }

        logSuccess(`Found ${documents.length} documents`);

        documents.forEach((doc, index) => {
            log(`   ${index + 1}. ${doc.title || doc.file_name}`, 'cyan');
            log(`      Type: ${doc.mime_type || 'Unknown'}`, 'cyan');
            log(`      Size: ${doc.file_size ? (doc.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}`, 'cyan');
            log(`      Path: ${doc.file_path || 'N/A'}`, 'cyan');
            log(`      Created: ${new Date(doc.created_at).toLocaleString()}`, 'cyan');
            log('', 'cyan');
        });

        return documents;
    } catch (error) {
        logError(`Error checking documents: ${error.message}`);
        return [];
    }
}

async function testPreviewUrls() {
    logInfo('Testing preview URL generation...');

    try {
        const { data: documents, error } = await supabase
            .from('documents')
            .select('*')
            .not('file_path', 'is', null)
            .limit(3);

        if (error) {
            logError(`Failed to fetch documents: ${error.message}`);
            return;
        }

        for (const doc of documents) {
            log(`Testing preview for: ${doc.title || doc.file_name}`, 'cyan');

            try {
                const { data, error: urlError } = await supabase.storage
                    .from('documents')
                    .createSignedUrl(doc.file_path, 3600);

                if (urlError) {
                    logError(`   Preview URL failed: ${urlError.message}`);
                } else {
                    logSuccess(`   Preview URL generated successfully`);
                    log(`   URL: ${data.signedUrl.substring(0, 100)}...`, 'cyan');
                }
            } catch (err) {
                logError(`   Preview URL error: ${err.message}`);
            }
        }
    } catch (error) {
        logError(`Error testing preview URLs: ${error.message}`);
    }
}

function getPreviewableTypes() {
    logInfo('Previewable file types:');

    const previewableTypes = [
        'application/pdf - PDF documents',
        'image/jpeg - JPEG images',
        'image/png - PNG images',
        'image/gif - GIF images',
        'image/webp - WebP images',
        'image/svg+xml - SVG images',
        'text/plain - Text files',
        'text/csv - CSV files'
    ];

    previewableTypes.forEach(type => {
        log(`   ✅ ${type}`, 'green');
    });

    log('');
    logInfo('Non-previewable types (download only):');

    const nonPreviewableTypes = [
        'application/msword - Word documents',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document - Word documents',
        'application/vnd.ms-excel - Excel spreadsheets',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet - Excel spreadsheets',
        'application/zip - ZIP archives',
        'application/x-zip-compressed - Compressed files'
    ];

    nonPreviewableTypes.forEach(type => {
        log(`   ⚠️  ${type}`, 'yellow');
    });
}

async function main() {
    log('🔍 Document Preview Test Script', 'cyan');
    log('===============================', 'cyan');
    log('');

    try {
        // Check existing documents
        const documents = await checkDocuments();
        log('');

        if (documents.length > 0) {
            // Test preview URL generation
            await testPreviewUrls();
            log('');
        } else {
            logWarning('No documents found. Upload some documents first to test preview functionality.');
            log('');
        }

        // Show previewable types
        getPreviewableTypes();

        logSuccess('🎉 Document Preview Test Completed!');
        log('');
        log('📋 How to Test Preview in the App:', 'cyan');
        log('   1. Open your application in the browser');
        log('   2. Navigate to a project with documents');
        log('   3. Click on any document in the grid or list view');
        log('   4. The preview modal should open automatically');
        log('   5. Test zoom, fullscreen, and download controls');
        log('');
        log('🔧 Preview Features Available:', 'cyan');
        log('   ✅ PDF preview with iframe');
        log('   ✅ Image preview with zoom controls');
        log('   ✅ Text file preview');
        log('   ✅ External link support');
        log('   ✅ Download functionality');
        log('   ✅ Fullscreen mode');
        log('   ✅ Metadata display');
        log('   ✅ Version history');

    } catch (error) {
        logError(`Script execution failed: ${error.message}`);
    }
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    checkDocuments,
    testPreviewUrls,
    getPreviewableTypes
};

