/**
 * Check Storage Buckets on Remote Supabase
 *
 * This script checks what storage buckets exist on the remote Supabase instance
 * and helps identify the correct bucket name for document uploads.
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = 'https://ynhgxwnkpbpzwbtzrzka.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStorageBuckets() {
    console.log('🔍 Checking storage buckets on remote Supabase...');
    console.log('=====================================');

    try {
        // Check if we can list buckets (this requires service role key)
        console.log('1. Checking bucket access...');

        // Try to list buckets - this will show if the service role key is available
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('❌ Error listing buckets:', listError.message);
            console.log('💡 This suggests the service role key is not available or bucket listing is not permitted');
        } else {
            console.log('✅ Successfully listed buckets:');
            console.log(buckets);

            // Check if 'documents' bucket exists
            const documentsBucket = buckets?.find(bucket => bucket.name === 'documents' || bucket.id === 'documents');
            if (documentsBucket) {
                console.log('✅ "documents" bucket exists:', documentsBucket);
            } else {
                console.log('❌ "documents" bucket not found');
                console.log('📋 Available buckets:', buckets?.map(b => b.name || b.id) || []);
            }
        }

        // Try to test upload to 'documents' bucket
        console.log('\n2. Testing "documents" bucket access...');

        const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload('test/test.txt', testFile);

        if (uploadError) {
            console.error('❌ Error accessing "documents" bucket:', uploadError.message);

            if (uploadError.message.includes('Bucket not found')) {
                console.log('💡 The "documents" bucket does not exist on the remote instance');
                console.log('📝 To fix this, you need to create the bucket in your Supabase dashboard:');
                console.log('   1. Go to https://supabase.com/dashboard');
                console.log('   2. Select your project');
                console.log('   3. Go to Storage');
                console.log('   4. Create a new bucket called "documents"');
                console.log('   5. Set it to private');
            }
        } else {
            console.log('✅ "documents" bucket is accessible');
            console.log('🧹 Cleaning up test file...');

            // Clean up test file
            await supabase.storage.from('documents').remove(['test/test.txt']);
            console.log('✅ Test file cleaned up');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }

    console.log('\n📋 Summary:');
    console.log('==========');
    console.log('To fix the document upload issue:');
    console.log('1. Create a storage bucket named "documents" in your Supabase dashboard');
    console.log('2. Or update the code to use an existing bucket name');
    console.log('3. Ensure the bucket has proper RLS policies for authenticated users');
}

checkStorageBuckets();
