#!/usr/bin/env node

/**
 * Document Saving Debug Script
 * 
 * This script simulates the document saving process to help debug issues
 * with document uploads and database operations.
 * 
 * Usage:
 *   node debug_document_saving.js
 *   node debug_document_saving.js --verbose
 *   node debug_document_saving.js --check-db
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
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

function logDebug(message) {
    log(`🐛 ${message}`, 'cyan');
}

/**
 * Check database connection and table structure
 */
async function checkDatabaseStructure() {
    logInfo('Checking database structure...');

    try {
        // Test connection
        const { data: connectionTest, error: connectionError } = await supabase
            .from('organizations')
            .select('count')
            .limit(1);

        if (connectionError) {
            logError(`Database connection failed: ${connectionError.message}`);
            return false;
        }

        logSuccess('Database connection successful');

        // Check documents table structure
        const { data: documents, error: docsError } = await supabase
            .from('documents')
            .select('*')
            .limit(1);

        if (docsError) {
            logError(`Documents table access failed: ${docsError.message}`);
            return false;
        }

        logSuccess('Documents table accessible');

        // Check organizations table
        const { data: orgs, error: orgsError } = await supabase
            .from('organizations')
            .select('id, name')
            .limit(5);

        if (orgsError) {
            logError(`Organizations table access failed: ${orgsError.message}`);
            return false;
        }

        logSuccess(`Found ${orgs.length} organizations`);

        // Check users table
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, organization_id')
            .limit(5);

        if (usersError) {
            logError(`Users table access failed: ${usersError.message}`);
            return false;
        }

        logSuccess(`Found ${users.length} users`);

        return { organizations: orgs, users: users };

    } catch (error) {
        logError(`Database check failed: ${error.message}`);
        return false;
    }
}

/**
 * Create a test file for upload simulation
 */
function createTestFile() {
    const testContent = `Test Document Content
Created: ${new Date().toISOString()}
Purpose: Document saving debug test
This is a test file created by the debug script.`;

    const fileName = `test_document_${Date.now()}.txt`;
    const filePath = path.join(__dirname, fileName);

    fs.writeFileSync(filePath, testContent);

    return {
        filePath,
        fileName,
        content: testContent,
        size: Buffer.byteLength(testContent, 'utf8')
    };
}

/**
 * Simulate document upload process
 */
async function simulateDocumentUpload(testData, organizationId, userId, projectId = null) {
    logInfo('Simulating document upload process...');

    try {
        // Step 1: Validate inputs
        logDebug('Step 1: Validating inputs...');

        if (!organizationId) {
            throw new Error('Organization ID is required');
        }

        if (!userId) {
            throw new Error('User ID is required');
        }

        logSuccess('Input validation passed');

        // Step 2: Prepare file data
        logDebug('Step 2: Preparing file data...');

        const fileName = `${Date.now()}_${testData.fileName}`;
        const filePath = `${organizationId}/${projectId || 'test'}/${fileName}`;

        logDebug(`File path: ${filePath}`);
        logDebug(`File size: ${testData.size} bytes`);

        // Step 3: Upload to storage
        logDebug('Step 3: Uploading to storage...');

        const fileBuffer = Buffer.from(testData.content, 'utf8');
        const fileBlob = new Blob([fileBuffer], { type: 'text/plain' });

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, fileBlob);

        if (uploadError) {
            throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        logSuccess(`File uploaded successfully: ${uploadData.path}`);

        // Step 4: Create database record
        logDebug('Step 4: Creating database record...');

        const documentRecord = {
            organization_id: organizationId,
            project_id: projectId,
            title: `Test Document - ${testData.fileName}`,
            description: 'Test document created by debug script',
            file_name: fileName,
            file_path: filePath,
            file_size: testData.size,
            mime_type: 'text/plain',
            category: 'other',
            version_number: 1,
            is_current_version: true,
            storage_provider: 'supabase',
            access_level: 'organization',
            tags: ['test', 'debug'],
            uploaded_by: userId,
            metadata: {
                debug_script: true,
                created_at: new Date().toISOString(),
                test_type: 'simulation'
            }
        };

        const { data: documentData, error: docError } = await supabase
            .from('documents')
            .insert(documentRecord)
            .select()
            .single();

        if (docError) {
            // Clean up uploaded file
            logWarning('Database insert failed, cleaning up uploaded file...');
            await supabase.storage.from('documents').remove([filePath]);
            throw new Error(`Database insert failed: ${docError.message}`);
        }

        logSuccess(`Document record created: ${documentData.id}`);

        // Step 5: Verify the record
        logDebug('Step 5: Verifying document record...');

        const { data: verifyData, error: verifyError } = await supabase
            .from('documents')
            .select('*')
            .eq('id', documentData.id)
            .single();

        if (verifyError) {
            logWarning(`Verification failed: ${verifyError.message}`);
        } else {
            logSuccess('Document record verified successfully');
        }

        return {
            success: true,
            documentId: documentData.id,
            filePath: filePath,
            uploadData: uploadData,
            documentData: documentData
        };

    } catch (error) {
        logError(`Document upload simulation failed: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Test common error scenarios
 */
async function testErrorScenarios(testData, organizationId, userId) {
    logInfo('Testing common error scenarios...');

    const scenarios = [
        {
            name: 'Missing organization ID',
            test: () => simulateDocumentUpload(testData, null, userId)
        },
        {
            name: 'Missing user ID',
            test: () => simulateDocumentUpload(testData, organizationId, null)
        },
        {
            name: 'Invalid file path',
            test: async () => {
                const invalidPath = '../../../invalid/path/file.txt';
                const { error } = await supabase.storage
                    .from('documents')
                    .upload(invalidPath, new Blob(['test']));
                return { success: !error, error: error?.message };
            }
        },
        {
            name: 'Duplicate file upload',
            test: async () => {
                const duplicatePath = `${organizationId}/test/duplicate_test.txt`;
                const fileBlob = new Blob(['duplicate test content']);

                // First upload
                await supabase.storage.from('documents').upload(duplicatePath, fileBlob);

                // Second upload (should fail)
                const { error } = await supabase.storage
                    .from('documents')
                    .upload(duplicatePath, fileBlob);

                return { success: !!error, error: error?.message };
            }
        }
    ];

    for (const scenario of scenarios) {
        logDebug(`Testing: ${scenario.name}`);
        try {
            const result = await scenario.test();
            if (result.success) {
                logSuccess(`${scenario.name}: Passed`);
            } else {
                logWarning(`${scenario.name}: Failed as expected - ${result.error}`);
            }
        } catch (error) {
            logWarning(`${scenario.name}: Failed as expected - ${error.message}`);
        }
    }
}

/**
 * Clean up test files and records
 */
async function cleanup(testResults) {
    logInfo('Cleaning up test data...');

    try {
        // Remove uploaded files
        for (const result of testResults) {
            if (result.success && result.filePath) {
                const { error } = await supabase.storage
                    .from('documents')
                    .remove([result.filePath]);

                if (error) {
                    logWarning(`Failed to remove file ${result.filePath}: ${error.message}`);
                } else {
                    logSuccess(`Removed file: ${result.filePath}`);
                }
            }

            // Remove database records
            if (result.success && result.documentId) {
                const { error } = await supabase
                    .from('documents')
                    .delete()
                    .eq('id', result.documentId);

                if (error) {
                    logWarning(`Failed to remove document record ${result.documentId}: ${error.message}`);
                } else {
                    logSuccess(`Removed document record: ${result.documentId}`);
                }
            }
        }

        // Remove local test file
        const testFile = path.join(__dirname, 'test_document_*.txt');
        const files = fs.readdirSync(__dirname).filter(f => f.startsWith('test_document_'));

        for (const file of files) {
            try {
                fs.unlinkSync(path.join(__dirname, file));
                logSuccess(`Removed local test file: ${file}`);
            } catch (error) {
                logWarning(`Failed to remove local file ${file}: ${error.message}`);
            }
        }

    } catch (error) {
        logError(`Cleanup failed: ${error.message}`);
    }
}

/**
 * Main execution function
 */
async function main() {
    const args = process.argv.slice(2);
    const verbose = args.includes('--verbose');
    const checkDbOnly = args.includes('--check-db');

    log('🔍 Document Saving Debug Script', 'cyan');
    log('================================', 'cyan');

    try {
        // Check database structure
        const dbCheck = await checkDatabaseStructure();
        if (!dbCheck) {
            process.exit(1);
        }

        if (checkDbOnly) {
            logSuccess('Database check completed successfully');
            return;
        }

        // Get test data
        const testData = createTestFile();
        logSuccess(`Created test file: ${testData.fileName} (${testData.size} bytes)`);

        // Use first organization and user for testing
        const organizationId = dbCheck.organizations[0]?.id;
        const userId = dbCheck.users[0]?.id;

        if (!organizationId || !userId) {
            logError('No organizations or users found for testing');
            process.exit(1);
        }

        logInfo(`Using organization: ${dbCheck.organizations[0].name}`);
        logInfo(`Using user: ${dbCheck.users[0].email}`);

        // Run simulation
        const result = await simulateDocumentUpload(testData, organizationId, userId);

        if (result.success) {
            logSuccess('Document upload simulation completed successfully');

            // Test error scenarios
            await testErrorScenarios(testData, organizationId, userId);

            // Clean up
            await cleanup([result]);

        } else {
            logError(`Simulation failed: ${result.error}`);
        }

    } catch (error) {
        logError(`Script execution failed: ${error.message}`);
        if (verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }

    logSuccess('Debug script completed');
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    checkDatabaseStructure,
    simulateDocumentUpload,
    testErrorScenarios,
    cleanup
};