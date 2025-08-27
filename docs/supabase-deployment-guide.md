# Supabase Database Schema Deployment Guide

This guide will help you apply the enhanced Factory Pulse database schema to your Supabase project.

## Prerequisites

1. **Supabase Project**: You need an active Supabase project
2. **Database Access**: Access to your Supabase SQL Editor or psql connection
3. **Backup**: Recommended to backup existing data before migration

## Deployment Options

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project
   - Go to "SQL Editor" in the sidebar

2. **Run Migrations in Order**
   
   Execute each migration file in the following order:

   **Step 1: Enhanced Schema**
   ```sql
   -- Copy and paste the contents of supabase/migrations/001_enhanced_schema.sql
   -- This creates all new tables and enhances existing ones
   ```

   **Step 2: Performance Indexes**
   ```sql
   -- Copy and paste the contents of supabase/migrations/002_indexes_and_performance.sql
   -- This creates indexes for optimal query performance
   ```

   **Step 3: Row Level Security**
   ```sql
   -- Copy and paste the contents of supabase/migrations/003_row_level_security.sql
   -- This enables RLS and creates security policies
   ```

   **Step 4: Triggers and Functions**
   ```sql
   -- Copy and paste the contents of supabase/migrations/004_triggers_and_functions.sql
   -- This creates automated triggers and business logic
   ```

   **Step 5: Realtime Configuration**
   ```sql
   -- Copy and paste the contents of supabase/migrations/005_realtime_configuration.sql
   -- This configures Supabase Realtime for live updates
   ```

3. **Verify Deployment**
   - Check that all tables were created successfully
   - Verify indexes are in place
   - Test RLS policies are working
   - Confirm realtime is enabled for key tables

### Option 2: Using Supabase CLI

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Initialize Project (if not already done)**
   ```bash
   supabase init
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Run Deployment Script**
   ```bash
   ./scripts/deploy-database-schema.sh
   ```

### Option 3: Using psql (Advanced)

1. **Get Connection Details**
   - From Supabase Dashboard → Settings → Database
   - Copy the connection string

2. **Run Migrations**
   ```bash
   # Connect to your Supabase database
   psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"
   
   # Run each migration file
   \i supabase/migrations/001_enhanced_schema.sql
   \i supabase/migrations/002_indexes_and_performance.sql
   \i supabase/migrations/003_row_level_security.sql
   \i supabase/migrations/004_triggers_and_functions.sql
   \i supabase/migrations/005_realtime_configuration.sql
   ```

## Post-Deployment Steps

### 1. Update TypeScript Types

Generate new TypeScript types for your enhanced schema:

```bash
# Using Supabase CLI
supabase gen types typescript --linked > src/types/supabase.ts

# Or manually from Supabase Dashboard → API → TypeScript
```

### 2. Verify Tables Created

Check that these key tables were created:

- ✅ `organizations` - Multi-tenancy support
- ✅ `contacts` - Enhanced customer/supplier management
- ✅ `workflow_stages` - Configurable workflow stages
- ✅ `project_stage_history` - Stage transition tracking
- ✅ `project_assignments` - Multi-user project assignments
- ✅ `document_versions` - Document version control
- ✅ `document_comments` - Document collaboration
- ✅ `reviews` - Internal review system
- ✅ `supplier_rfqs` - Supplier RFQ management
- ✅ `supplier_quotes` - Quote collection and evaluation
- ✅ `messages` - Communication system
- ✅ `notifications` - Notification system
- ✅ `activity_log` - Audit trail
- ✅ `bom_items` - Bill of Materials management
- ✅ `ai_processing_queue` - AI processing system

### 3. Test Key Features

1. **Multi-tenancy**: Verify organization-based data isolation
2. **Workflow**: Test project stage transitions
3. **Documents**: Upload and version documents
4. **Communication**: Send messages and notifications
5. **Realtime**: Verify live updates work
6. **Security**: Test RLS policies

### 4. Migrate Existing Data (if applicable)

If you have existing data, you may need to:

1. **Map existing customers to contacts table**
2. **Set organization_id for existing records**
3. **Initialize workflow stages for existing projects**
4. **Update project assignments**

## Troubleshooting

### Common Issues

1. **Permission Errors**
   - Ensure you have admin access to the Supabase project
   - Check that RLS policies allow your operations

2. **Migration Failures**
   - Run migrations one at a time to identify issues
   - Check Supabase logs for detailed error messages
   - Ensure all dependencies are met

3. **Missing Tables**
   - Verify the migration completed successfully
   - Check for any SQL errors in the execution log

4. **RLS Policy Issues**
   - Temporarily disable RLS to test functionality
   - Verify user authentication is working
   - Check policy conditions match your use case

### Getting Help

1. **Check Migration Logs**
   ```sql
   SELECT * FROM migration_log ORDER BY executed_at DESC;
   ```

2. **Verify Table Structure**
   ```sql
   \dt  -- List all tables
   \d table_name  -- Describe specific table
   ```

3. **Test Policies**
   ```sql
   -- Test as specific user
   SET ROLE authenticated;
   SELECT * FROM projects LIMIT 1;
   ```

## Schema Features Overview

The enhanced schema provides:

### 🏢 **Multi-Tenancy**
- Organization-based data isolation
- User role management
- Configurable settings per organization

### 📋 **Enhanced Project Management**
- Configurable workflow stages
- Stage transition history
- Multi-user assignments
- Priority scoring system

### 📄 **Document Management**
- Version control system
- Access level controls
- Comment and annotation system
- AI processing integration

### 🤝 **Supplier Management**
- RFQ workflow
- Quote collection and evaluation
- Supplier qualification system
- Performance tracking

### 💬 **Communication System**
- Thread-based messaging
- Multi-channel notifications
- Real-time updates

### 🔍 **Analytics & Reporting**
- Complete audit trail
- Workflow performance metrics
- Bottleneck detection
- Custom reporting capabilities

### 🤖 **AI Integration**
- Document processing queue
- Automated data extraction
- Risk assessment
- Compliance checking

### 🔒 **Security & Compliance**
- Row Level Security policies
- Multi-tenant data isolation
- Complete audit logging
- Role-based access control

## Next Steps

After successful deployment:

1. **Update Application Code**: Use the new schema fields and relationships
2. **Test Enhanced Features**: Verify all new functionality works
3. **Train Users**: Update documentation and train users on new features
4. **Monitor Performance**: Watch for any performance issues with new indexes
5. **Plan Data Migration**: If needed, migrate existing data to new structure

For detailed information about the schema changes, see `docs/database-schema-migration-summary.md`.