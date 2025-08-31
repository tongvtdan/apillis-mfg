import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create Supabase client with anon key for testing
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Test credentials
const TEST_PASSWORDS = [
    'Password@123',           // From user-credentials.md
    'FactoryPulse@2025',      // From create-auth-users.js
    'FactoryPulse2025!'       // Alternative from memory
];

async function testAuthSignIn() {
    console.log('🔐 Factory Pulse Authentication Testing Script');
    console.log('==============================================\n');

    const results = {
        totalTests: 0,
        successful: 0,
        failed: 0,
        details: []
    };

    try {
        // Load internal users data
        const internalUsersPath = path.join(__dirname, '../sample-data/03-users.json');
        const internalUsers = JSON.parse(fs.readFileSync(internalUsersPath, 'utf8'));

        // Load contacts data
        const contactsPath = path.join(__dirname, '../sample-data/04-contacts.json');
        const contacts = JSON.parse(fs.readFileSync(contactsPath, 'utf8'));

        console.log(`📋 Found ${internalUsers.length} internal users and ${contacts.length} contacts`);
        console.log(`🔑 Testing with ${TEST_PASSWORDS.length} password variations\n`);

        // Test internal users
        console.log('👥 Testing Internal Factory Pulse Users:');
        console.log('='.repeat(50));

        for (const user of internalUsers) {
            await testUserAuthentication(user.email, user.name, user.role, 'internal', results);
        }

        // Test contact users (customers and suppliers)
        console.log('\n👥 Testing Contact Users (Customers & Suppliers):');
        console.log('='.repeat(50));

        for (const contact of contacts) {
            await testUserAuthentication(contact.email, contact.contact_name, contact.type, 'contact', results);
        }

        // Generate summary report
        generateSummaryReport(results);

        // Save detailed results to file
        saveResultsToFile(results);

    } catch (error) {
        console.error('❌ Script error:', error);
        process.exit(1);
    }
}

async function testUserAuthentication(email, name, role, userType, results) {
    console.log(`\n🔍 Testing: ${name} (${email})`);
    console.log(`   Role: ${role} | Type: ${userType}`);

    let success = false;
    let workingPassword = null;
    let errorMessage = null;

    // Try each password variation
    for (const password of TEST_PASSWORDS) {
        try {
            console.log(`   🔑 Trying password: ${password}`);

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.log(`   ❌ Failed: ${error.message}`);
                errorMessage = error.message;
            } else {
                console.log(`   ✅ Success! User ID: ${data.user.id}`);
                success = true;
                workingPassword = password;

                // Test user metadata
                const userMetadata = data.user.user_metadata;
                console.log(`   📋 Metadata:`, {
                    name: userMetadata?.name || 'N/A',
                    role: userMetadata?.role || 'N/A',
                    department: userMetadata?.department || 'N/A'
                });

                // Sign out to test next password
                await supabase.auth.signOut();
                break;
            }

        } catch (error) {
            console.log(`   ❌ Exception: ${error.message}`);
            errorMessage = error.message;
        }

        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Record results
    results.totalTests++;
    if (success) {
        results.successful++;
        console.log(`   🎉 Authentication successful with password: ${workingPassword}`);
    } else {
        results.failed++;
        console.log(`   💥 All password attempts failed`);
    }

    results.details.push({
        email,
        name,
        role,
        userType,
        success,
        workingPassword,
        errorMessage,
        timestamp: new Date().toISOString()
    });

    console.log(`   ${success ? '✅' : '❌'} Test completed\n`);
}

function generateSummaryReport(results) {
    console.log('\n📊 Authentication Test Summary');
    console.log('==============================');
    console.log(`Total Tests: ${results.totalTests}`);
    console.log(`✅ Successful: ${results.successful}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.successful / results.totalTests) * 100).toFixed(1)}%`);

    // Group by user type
    const internalUsers = results.details.filter(d => d.userType === 'internal');
    const contactUsers = results.details.filter(d => d.userType === 'contact');

    console.log('\n📈 Breakdown by User Type:');
    console.log(`Internal Users: ${internalUsers.filter(d => d.success).length}/${internalUsers.length} successful`);
    console.log(`Contact Users: ${contactUsers.filter(d => d.success).length}/${contactUsers.length} successful`);

    // Show failed authentications
    const failedAuths = results.details.filter(d => !d.success);
    if (failedAuths.length > 0) {
        console.log('\n❌ Failed Authentications:');
        failedAuths.forEach(fail => {
            console.log(`   - ${fail.name} (${fail.email}) - ${fail.errorMessage}`);
        });
    }

    // Show working passwords
    const workingPasswords = [...new Set(results.details.filter(d => d.success).map(d => d.workingPassword))];
    if (workingPasswords.length > 0) {
        console.log('\n🔑 Working Passwords:');
        workingPasswords.forEach(password => {
            console.log(`   - ${password}`);
        });
    }
}

function saveResultsToFile(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = path.join(__dirname, `../backups/auth-test-results-${timestamp}.json`);

    const reportData = {
        timestamp: new Date().toISOString(),
        summary: {
            totalTests: results.totalTests,
            successful: results.successful,
            failed: results.failed,
            successRate: ((results.successful / results.totalTests) * 100).toFixed(1)
        },
        details: results.details,
        testPasswords: TEST_PASSWORDS,
        environment: {
            supabaseUrl,
            nodeVersion: process.version
        }
    };

    fs.writeFileSync(resultsPath, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Detailed results saved to: ${resultsPath}`);
}

// Command line argument parsing
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {
        verbose: false,
        saveResults: true,
        help: false
    };

    for (const arg of args) {
        switch (arg) {
            case '--verbose':
            case '-v':
                options.verbose = true;
                break;
            case '--no-save':
                options.saveResults = false;
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
        }
    }

    return options;
}

function showHelp() {
    console.log(`
🔐 Factory Pulse Authentication Testing Script

Usage: node scripts/test-auth-signin.js [options]

Options:
  -v, --verbose     Enable verbose output
  --no-save        Don't save results to file
  -h, --help       Show this help message

Examples:
  node scripts/test-auth-signin.js
  node scripts/test-auth-signin.js --verbose
  node scripts/test-auth-signin.js --no-save

Environment Variables:
  VITE_SUPABASE_URL          Supabase project URL
  VITE_SUPABASE_ANON_KEY     Supabase anonymous key

The script will test authentication for all users in:
- Internal Factory Pulse users (sample-data/03-users.json)
- Contact users (sample-data/04-contacts.json)

Test passwords used:
- Password@123
- FactoryPulse@2025
- FactoryPulse2025!
    `);
}

// Main execution
async function main() {
    const options = parseArguments();

    if (options.help) {
        showHelp();
        return;
    }

    console.log('🚀 Starting authentication testing...\n');

    if (options.verbose) {
        console.log('Environment:', {
            supabaseUrl,
            nodeVersion: process.version
        });
        console.log('');
    }

    await testAuthSignIn();
}

// Run the script
main().catch(console.error);
