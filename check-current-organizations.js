/**
 * Check Current Organizations in Supabase
 *
 * This script checks what organizations currently exist in the Supabase database
 * and identifies the correct internal organization to use.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkCurrentOrganizations() {
    console.log('🔍 Checking Current Organizations in Supabase');
    console.log('============================================');
    console.log(`Supabase URL: ${SUPABASE_URL}`);
    console.log('');

    try {
        // Test database connection
        console.log('1. Testing database connection...');
        const { data: testData, error: testError } = await supabase
            .from('organizations')
            .select('count')
            .limit(1);

        if (testError) {
            throw new Error(`Database connection failed: ${testError.message}`);
        }
        console.log('✅ Database connection successful');

        // Get all organizations
        console.log('\n2. Fetching all organizations...');
        const { data: organizations, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .order('organization_type, name');

        if (orgError) {
            throw new Error(`Failed to fetch organizations: ${orgError.message}`);
        }

        console.log(`\n📋 Found ${organizations?.length || 0} organizations:\n`);

        // Group by organization type
        const orgsByType = {};
        organizations?.forEach(org => {
            const type = org.organization_type || 'unknown';
            if (!orgsByType[type]) orgsByType[type] = [];
            orgsByType[type].push(org);
        });

        // Display organizations by type
        Object.entries(orgsByType).forEach(([type, orgs]) => {
            console.log(`🏢 ${type.toUpperCase()} ORGANIZATIONS:`);
            orgs.forEach(org => {
                const status = org.is_active ? '✅' : '❌';
                console.log(`   ${status} ${org.name}`);
                console.log(`      ID: ${org.id}`);
                console.log(`      Slug: ${org.slug}`);
                console.log(`      Industry: ${org.industry || 'N/A'}`);
                console.log(`      Active: ${org.is_active}`);
                console.log('');
            });
        });

        // Look for Apillis or similar internal organizations
        console.log('🔍 Looking for Apillis or similar internal organizations...');

        const internalOrgs = organizations?.filter(org =>
            org.organization_type === 'internal' ||
            org.name.toLowerCase().includes('apillis') ||
            org.name.toLowerCase().includes('factory pulse')
        ) || [];

        if (internalOrgs.length > 0) {
            console.log('\n🎯 FOUND INTERNAL ORGANIZATIONS:');
            internalOrgs.forEach(org => {
                console.log(`   ✅ ${org.name} (ID: ${org.id})`);
            });

            // Check if Apillis exists
            const apillisOrg = internalOrgs.find(org =>
                org.name.toLowerCase().includes('apillis')
            );

            if (apillisOrg) {
                console.log(`\n🎉 APILLIS ORGANIZATION FOUND!`);
                console.log(`   Name: ${apillisOrg.name}`);
                console.log(`   ID: ${apillisOrg.id}`);
                console.log(`   Slug: ${apillisOrg.slug}`);
                console.log(`   Should use this for internal operations!`);
                return apillisOrg;
            } else {
                console.log(`\n⚠️ Apillis not found, but other internal organizations exist:`);
                internalOrgs.forEach(org => {
                    console.log(`   - ${org.name} (ID: ${org.id})`);
                });
                return internalOrgs[0]; // Use the first internal org
            }
        } else {
            console.log('\n❌ No internal organizations found!');
            console.log('   Need to create an internal organization for Apillis.');

            // Check if there are any organizations that might be intended as internal
            const potentialInternal = organizations?.filter(org =>
                org.name.toLowerCase().includes('pulse') ||
                org.name.toLowerCase().includes('internal') ||
                org.organization_type === 'customer' // Sometimes the first customer is actually internal
            );

            if (potentialInternal && potentialInternal.length > 0) {
                console.log('\n💡 Potential internal organizations found:');
                potentialInternal.forEach(org => {
                    console.log(`   - ${org.name} (${org.organization_type}) - ID: ${org.id}`);
                });
            }

            return null;
        }

    } catch (error) {
        console.error('❌ Error checking organizations:', error.message);
        console.error('Stack trace:', error.stack);
        return null;
    }
}

async function main() {
    const internalOrg = await checkCurrentOrganizations();

    if (internalOrg) {
        console.log('\n' + '='.repeat(60));
        console.log('📋 RECOMMENDATION:');
        console.log('='.repeat(60));
        console.log(`Use this organization for internal operations:`);
        console.log(`   Name: ${internalOrg.name}`);
        console.log(`   ID: ${internalOrg.id}`);
        console.log('');
        console.log('Update these constants in your scripts:');
        console.log(`   const INTERNAL_ORG_ID = '${internalOrg.id}';`);
        console.log(`   const INTERNAL_ORG_NAME = '${internalOrg.name}';`);
        console.log('');
        console.log('Then run:');
        console.log('   npm run fix:organization-structure');
        console.log('   npm run seed:workflow-stages');
        console.log('   npm run test:project-creation');
    } else {
        console.log('\n' + '='.repeat(60));
        console.log('⚠️ NO INTERNAL ORGANIZATION FOUND');
        console.log('='.repeat(60));
        console.log('');
        console.log('You have two options:');
        console.log('');
        console.log('1. Create Apillis as internal organization:');
        console.log('   - Add to seed.sql or create manually');
        console.log('   - organization_type: \'internal\'');
        console.log('');
        console.log('2. Use existing organization as internal:');
        console.log('   - Choose one from the list above');
        console.log('   - Update organization_type to \'internal\'');
        console.log('');
        console.log('Then update the scripts with the correct organization ID.');
    }

    console.log('\n' + '='.repeat(60));
}

// Export for use in other scripts
module.exports = { checkCurrentOrganizations };

if (require.main === module) {
    main().catch(console.error);
}
