/**
 * Test Remote Storage Upload
 *
 * This script tests if the remote Supabase storage is working correctly
 * after creating the "documents" bucket.
 *
 * Run this after creating the storage bucket to verify functionality.
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = 'https://ynhgxwnkpbpzwbtzrzka.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStorageUpload() {
    console.log('🧪 Testing Remote Supabase Storage...');
    console.log('=====================================');

    try {
        // Test 1: Check if we can access the documents bucket
        console.log('1. Testing bucket access...');

        const testFile = new File(['This is a test document for remote storage verification.'], 'test-storage.txt', {
            type: 'text/plain'
        });

        const fileName = `test-${Date.now()}.txt`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, testFile, {
                contentType: 'text/plain',
                upsert: false
            });

        if (uploadError) {
            console.error('❌ Storage upload failed:', uploadError.message);

            if (uploadError.message.includes('Bucket not found')) {
                console.log('\n💡 The "documents" bucket still does not exist.');
                console.log('Please create it in your Supabase dashboard:');
                console.log('1. Go to https://supabase.com/dashboard');
                console.log('2. Select your project');
                console.log('3. Go to Storage → Create Bucket');
                console.log('4. Name: "documents", Type: Private');
                return;
            }
        } else {
            console.log('✅ Storage upload successful!');
            console.log('📁 File uploaded:', uploadData?.path);

            // Test 2: Clean up test file
            console.log('2. Cleaning up test file...');

            const { error: deleteError } = await supabase.storage
                .from('documents')
                .remove([fileName]);

            if (deleteError) {
                console.log('⚠️  Could not clean up test file:', deleteError.message);
            } else {
                console.log('✅ Test file cleaned up');
            }

            console.log('\n🎉 SUCCESS: Remote storage is working correctly!');
            console.log('📝 You can now upload documents in the application.');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testStorageUpload();
