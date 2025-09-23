# Document Saving Debug Tools

This guide provides comprehensive documentation for debugging document saving issues in the Factory Pulse application. The debugging tools include multiple approaches to identify and resolve common problems with document uploads and database operations.

## Overview

The document saving debug tools consist of:

1. **Node.js Script** - Server-side simulation and testing
2. **SQL Script** - Database structure and data analysis
3. **TypeScript Utilities** - Client-side debugging functions
4. **React Component** - In-app debugging interface
5. **Patch File** - Recommended improvements to existing code

## Quick Start

### 1. Check Database Structure

First, run the SQL script to verify your database setup:

```bash
# Connect to your Supabase database and run:
psql -h localhost -p 54322 -U postgres -d postgres -f debug_documents_table.sql
```

### 2. Test Document Upload Process

Use the Node.js script to simulate the document saving process:

```bash
# Install dependencies (if not already installed)
npm install @supabase/supabase-js

# Run the debug script
node debug_document_saving.js

# Run with verbose output
node debug_document_saving.js --verbose

# Check database only
node debug_document_saving.js --check-db
```

### 3. Use In-App Debugging

Add the DocumentDebugPanel component to your application:

```tsx
import { DocumentDebugPanel } from '@/components/debug/DocumentDebugPanel';

// In your component
<DocumentDebugPanel 
  projectId="your-project-id" 
  onClose={() => setShowDebug(false)} 
/>
```

## Detailed Usage

### Node.js Debug Script

The `debug_document_saving.js` script provides comprehensive testing of the document saving process.

#### Features:
- Database connectivity testing
- File upload simulation
- Error scenario testing
- Automatic cleanup
- Detailed logging

#### Usage Examples:

```bash
# Basic test
node debug_document_saving.js

# Verbose output with stack traces
node debug_document_saving.js --verbose

# Database connectivity check only
node debug_document_saving.js --check-db
```

#### Environment Variables:

Set these environment variables or modify the script:

```bash
export VITE_SUPABASE_URL="http://localhost:54321"
export VITE_SUPABASE_ANON_KEY="your-anon-key"
```

#### Output:

The script provides color-coded output:
- ✅ Green: Success messages
- ❌ Red: Error messages
- ⚠️ Yellow: Warning messages
- ℹ️ Blue: Information messages
- 🐛 Cyan: Debug messages

### SQL Debug Script

The `debug_documents_table.sql` script analyzes your database structure and data integrity.

#### What it checks:
- Table structure and constraints
- Data integrity issues
- Foreign key relationships
- Storage bucket configuration
- Common data problems
- Performance recommendations

#### Running the script:

```sql
-- In Supabase SQL Editor or psql
\i debug_documents_table.sql
```

#### Key sections:
1. **Table Structure** - Verifies documents table schema
2. **Data Integrity** - Checks for missing or invalid data
3. **Foreign Keys** - Validates relationships
4. **Storage Bucket** - Checks Supabase storage configuration
5. **Sample Data** - Analyzes existing documents
6. **Common Issues** - Detects duplicate paths, large files, etc.
7. **Recommendations** - Suggests fixes based on findings

### TypeScript Utilities

The `documentDebugUtils.ts` file provides client-side debugging functions.

#### Key Functions:

```typescript
import {
  validateDocumentData,
  checkDatabaseConnectivity,
  checkStorageBucket,
  simulateDocumentUpload,
  generateDebugReport,
  cleanupDebugDocuments,
  DocumentDebugLogger
} from '@/utils/documentDebugUtils';

// Validate file before upload
const validation = await validateDocumentData(file, orgId, projectId, userId);

// Check system status
const dbStatus = await checkDatabaseConnectivity();
const storageStatus = await checkStorageBucket();

// Simulate upload with logging
const logger = new DocumentDebugLogger();
const result = await simulateDocumentUpload(file, orgId, userId, projectId, logger);

// Generate comprehensive report
const report = await generateDebugReport();

// Clean up test documents
const cleanup = await cleanupDebugDocuments();
```

#### DocumentDebugLogger:

```typescript
const logger = new DocumentDebugLogger(true); // Enable logging

logger.log('Step 1: Validating file', { fileName: file.name });
logger.log('Step 2: Uploading to storage', uploadData);
logger.log('Step 3: Creating database record', documentData);

const logs = logger.getLogs();
const jsonLogs = logger.exportLogs();
```

### React Debug Component

The `DocumentDebugPanel` component provides a comprehensive in-app debugging interface.

#### Features:
- File selection and validation
- Upload simulation with detailed logging
- System status checking
- Debug log export
- Test result tracking
- Automatic cleanup

#### Usage:

```tsx
import { DocumentDebugPanel } from '@/components/debug/DocumentDebugPanel';

function MyComponent() {
  const [showDebug, setShowDebug] = useState(false);
  
  return (
    <div>
      <Button onClick={() => setShowDebug(true)}>
        Open Debug Panel
      </Button>
      
      {showDebug && (
        <DocumentDebugPanel 
          projectId="project-123"
          onClose={() => setShowDebug(false)}
        />
      )}
    </div>
  );
}
```

#### Tabs:
1. **Upload Test** - File selection and validation
2. **System Check** - Database and storage status
3. **Debug Logs** - Detailed operation logs
4. **Test Results** - Results from simulations

## Common Issues and Solutions

### 1. Missing Organization Context

**Problem**: Documents saved without organization_id
**Symptoms**: Foreign key constraint violations
**Solution**: Ensure user profile has organization_id before upload

```typescript
// Check before upload
if (!profile?.organization_id) {
  throw new Error('User must be associated with an organization');
}
```

### 2. Storage Bucket Not Configured

**Problem**: Files can't be uploaded to storage
**Symptoms**: Storage upload errors
**Solution**: Verify Supabase storage bucket exists and is configured

```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE name = 'documents';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

### 3. Permission Issues

**Problem**: Users can't upload documents
**Symptoms**: RLS policy violations
**Solution**: Check Row Level Security policies

```sql
-- Check RLS policies for documents table
SELECT * FROM pg_policies WHERE tablename = 'documents';
```

### 4. File Size Limits

**Problem**: Large files fail to upload
**Symptoms**: Upload timeouts or size errors
**Solution**: Check file size limits in storage bucket configuration

### 5. Duplicate File Paths

**Problem**: Multiple documents with same file path
**Symptoms**: Storage conflicts
**Solution**: Use unique file naming strategy

```typescript
// Use timestamp + random string for uniqueness
const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`;
```

## Debugging Workflow

### Step 1: Database Check
Run the SQL script to verify database structure and identify data issues.

### Step 2: System Status
Use the TypeScript utilities to check connectivity and storage configuration.

### Step 3: File Validation
Test file validation with the React component or utilities.

### Step 4: Upload Simulation
Run the Node.js script or use the React component to simulate uploads.

### Step 5: Analyze Results
Review logs and error messages to identify specific issues.

### Step 6: Apply Fixes
Use the patch file recommendations to improve the existing code.

## Environment Setup

### Required Environment Variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: For remote testing
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### Dependencies:

```json
{
  "@supabase/supabase-js": "^2.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0"
}
```

## Best Practices

### 1. Always Validate Before Upload
```typescript
const validation = await validateDocumentData(file, orgId, projectId, userId);
if (!validation.isValid) {
  // Handle validation errors
  return;
}
```

### 2. Use Detailed Logging
```typescript
const logger = new DocumentDebugLogger(true);
logger.log('Starting upload process', { fileName: file.name });
```

### 3. Clean Up on Errors
```typescript
if (docError) {
  // Remove uploaded file if database insert fails
  await supabase.storage.from('documents').remove([filePath]);
  throw new Error(`Database insert failed: ${docError.message}`);
}
```

### 4. Test Error Scenarios
```typescript
// Test with invalid data
await simulateDocumentUpload(null, orgId, userId); // Should fail gracefully
```

### 5. Monitor System Health
```typescript
// Regular health checks
const report = await generateDebugReport();
if (report.recommendations.length > 0) {
  // Address recommendations
}
```

## Troubleshooting

### Script Won't Run
- Check Node.js version (requires 16+)
- Install dependencies: `npm install @supabase/supabase-js`
- Verify environment variables

### Database Connection Failed
- Check Supabase is running locally
- Verify connection string
- Check firewall settings

### Storage Upload Fails
- Verify storage bucket exists
- Check RLS policies
- Verify file size limits

### React Component Errors
- Check imports are correct
- Verify UI components are available
- Check TypeScript types

## Support

For additional help:
1. Check the console logs for detailed error messages
2. Run the SQL script to identify database issues
3. Use the Node.js script to test the upload process
4. Review the patch file for recommended improvements

## File Structure

```
factory-pulse/
├── debug_document_saving.js          # Node.js debug script
├── debug_documents_table.sql         # SQL analysis script
├── src/
│   ├── utils/
│   │   └── documentDebugUtils.ts     # TypeScript utilities
│   └── components/
│       └── debug/
│           └── DocumentDebugPanel.tsx # React debug component
├── docs/
│   ├── debug-document-saving.md       # This documentation
│   └── document-saving-fix.patch     # Recommended improvements
```

This comprehensive debugging toolkit should help you identify and resolve document saving issues efficiently.