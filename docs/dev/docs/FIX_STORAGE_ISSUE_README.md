# 🔧 Fix Document Upload Issue - Storage Bucket Missing

## Problem
The application is failing to upload documents with the error:
```
StorageApiError: Bucket not found
```

This occurs because the "documents" storage bucket doesn't exist on your remote Supabase instance.

## Solution

### Step 1: Create the Storage Bucket

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Create the Storage Bucket**
   - Navigate to: **Storage** in the left sidebar
   - Click **Create Bucket**
   - Fill in the details:
     - **Name**: `documents`
     - **Type**: `Private`
     - **File size limit**: `100MB` (or your preferred limit)
   - Click **Create**

3. **Verify Bucket Creation**
   - You should see the "documents" bucket in your storage list
   - The bucket should be marked as "Private"

### Step 2: Alternative SQL Method

If you prefer to create the bucket via SQL, you can run the script in `fix_storage_bucket_remote.sql` in your Supabase SQL Editor:

```sql
-- Run this in your Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    false,
    104857600, -- 100MB
    ARRAY[
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
        'application/x-zip-compressed',
        'application/octet-stream'
    ]
)
ON CONFLICT (id) DO NOTHING;
```

## What the Code Now Does

### Enhanced Error Handling
- ✅ Detects "Bucket not found" errors
- ✅ Provides helpful error messages with instructions
- ✅ Logs specific guidance for creating the missing bucket

### Better User Experience
- ✅ Clear error messages in the UI
- ✅ Console logs with actionable steps
- ✅ Graceful handling of storage failures

### Document Upload Flow
1. **Project Creation**: User creates project with documents
2. **Storage Upload**: Documents uploaded to "documents" bucket
3. **Database Record**: Document metadata saved to database
4. **Success**: User notified of successful upload

## Testing the Fix

After creating the storage bucket:

1. **Try uploading a document** in the project creation modal
2. **Check the console** for success messages:
   ```
   📄 Processing 1 initial documents for project P-2025092203
   ✅ Initial documents processed successfully
   ```

3. **Verify in Supabase Dashboard**:
   - Storage: Files should appear in the "documents" bucket
   - Database: Document records should exist in the "documents" table

## Troubleshooting

### If Still Getting Errors:
1. **Check bucket permissions**: Ensure the bucket is set to "Private"
2. **Verify RLS policies**: The bucket should have proper Row Level Security policies
3. **Check service role key**: Ensure your Supabase keys are correct
4. **Clear browser cache**: Sometimes cached configurations cause issues

### Common Error Messages:
- `"Bucket not found"`: Bucket doesn't exist - create it in dashboard
- `"signature verification failed"`: Authentication issue - check service role key
- `"Access denied"`: RLS policy issue - check bucket permissions

## Code Changes Made

### Files Modified:
- ✅ `src/core/documents/DocumentProvider.tsx` - Enhanced error handling
- ✅ `src/components/project/intake/InquiryIntakeForm.tsx` - Better error messages
- ✅ `src/services/projectWorkflowService.ts` - Improved upload handling
- ✅ `fix_storage_bucket_remote.sql` - SQL script for bucket creation

### Key Improvements:
- ✅ Graceful error handling for missing buckets
- ✅ Helpful error messages with actionable steps
- ✅ Better logging for debugging
- ✅ Consistent error handling across all upload methods

## Next Steps

1. **Create the storage bucket** using one of the methods above
2. **Test document upload** in the application
3. **Verify files appear** in both storage and database
4. **Monitor console logs** for success/failure messages

---

**Note**: Remember that all operations are now targeting your remote Supabase instance, not a local development environment. Avoid any database reset operations that would affect your remote data.
