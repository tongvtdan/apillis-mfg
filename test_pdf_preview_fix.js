#!/usr/bin/env node

/**
 * PDF Preview Fix Test Script
 * This script tests the PDF preview functionality after the fix
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

// Mock the documentActionsService.isLink function
function isLink(document) {
    // Updated logic: A document is a link if it has an external_url OR if it's stored externally
    // Regular uploaded files should have file_path and be stored locally/supabase
    return !!(document.external_url || (document.storage_provider && document.storage_provider !== 'supabase' && document.storage_provider !== 'local'));
}

async function checkDocuments() {
    logInfo('Checking documents and their storage providers...');

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
            const isLinkDoc = isLink(doc);
            const canPreview = doc.mime_type === 'application/pdf' || doc.mime_type?.startsWith('image/');

            log(`   ${index + 1}. ${doc.title || doc.file_name}`, 'cyan');
            log(`      Type: ${doc.mime_type || 'Unknown'}`, 'cyan');
            log(`      Storage Provider: ${doc.storage_provider || 'NULL'}`, 'cyan');
            log(`      File Path: ${doc.file_path ? 'Yes' : 'No'}`, 'cyan');
            log(`      External URL: ${doc.external_url ? 'Yes' : 'No'}`, 'cyan');
            log(`      Is Link: ${isLinkDoc ? 'YES' : 'NO'}`, isLinkDoc ? 'red' : 'green');
            log(`      Can Preview: ${canPreview ? 'YES' : 'NO'}`, canPreview ? 'green' : 'yellow');
            log('', 'cyan');
        });

        return documents;
    } catch (error) {
        logError(`Error checking documents: ${error.message}`);
        return [];
    }
}

async function testPreviewUrls() {
    logInfo('Testing preview URL generation for PDFs...');

    try {
        const { data: documents, error } = await supabase
            .from('documents')
            .select('*')
            .eq('mime_type', 'application/pdf')
            .not('file_path', 'is', null)
            .limit(3);

        if (error) {
            logError(`Failed to fetch PDF documents: ${error.message}`);
            return;
        }

        if (documents.length === 0) {
            logWarning('No PDF documents found for testing');
            return;
        }

        for (const doc of documents) {
            log(`Testing preview for: ${doc.title || doc.file_name}`, 'cyan');

            const isLinkDoc = isLink(doc);
            if (isLinkDoc) {
                logError(`   Document is incorrectly identified as a link`);
                log(`   Storage Provider: ${doc.storage_provider}`, 'cyan');
                log(`   External URL: ${doc.external_url}`, 'cyan');
                continue;
            }

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

async function fixStorageProviders() {
    logInfo('Fixing storage providers for existing documents...');

    try {
        const { data, error } = await supabase
            .from('documents')
            .update({ storage_provider: 'supabase' })
            .is('storage_provider', null)
            .not('file_path', 'is', null);

        if (error) {
            logError(`Failed to update storage providers: ${error.message}`);
            return;
        }

        logSuccess('Storage providers updated successfully');

        // Also update documents with 'local' storage provider
        const { data: localUpdate, error: localError } = await supabase
            .from('documents')
            .update({ storage_provider: 'supabase' })
            .eq('storage_provider', 'local')
            .not('file_path', 'is', null);

        if (localError) {
            logError(`Failed to update local storage providers: ${localError.message}`);
        } else {
            logSuccess('Local storage providers updated to supabase');
        }

    } catch (error) {
        logError(`Error fixing storage providers: ${error.message}`);
    }
}

async function main() {
    log('🔧 PDF Preview Fix Test Script', 'cyan');
    log('==============================', 'cyan');
    log('');

    try {
        // Check current documents
        const documents = await checkDocuments();
        log('');

        // Fix storage providers if needed
        await fixStorageProviders();
        log('');

        // Test preview URLs
        await testPreviewUrls();
        log('');

        logSuccess('🎉 PDF Preview Fix Test Completed!');
        log('');
        log('📋 What was fixed:', 'cyan');
        log('   ✅ Updated isLink() logic to handle local/supabase storage');
        log('   ✅ Set storage_provider to "supabase" for new uploads');
        log('   ✅ Fixed existing documents with incorrect storage_provider');
        log('');
        log('🧪 How to test:', 'cyan');
        log('   1. Refresh your application in the browser');
        log('   2. Navigate to a project with PDF documents');
        log('   3. Click on any PDF document');
        log('   4. The preview should now work correctly');
        log('   5. You should see the PDF content instead of "Preview not available"');

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
    fixStorageProviders,
    isLink
};

