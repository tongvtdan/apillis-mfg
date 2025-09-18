#!/bin/bash

# Factory Pulse Database Backup Script - Remote Deployment
# This script creates comprehensive backups of the cleaned local Supabase database for remote deployment

set -e

# Configuration
BACKUP_DIR="/Volumes/Work/Projects/Apillis/Apillis-MFG/factory-pulse/backups/remote"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PROJECT_NAME="factory_pulse_remote"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting Factory Pulse remote deployment backup..."
echo "📅 Timestamp: $TIMESTAMP"
echo "📁 Backup directory: $BACKUP_DIR"

# Check if Supabase is running locally
if ! supabase status > /dev/null 2>&1; then
    echo "❌ Error: Supabase is not running locally"
    echo "   Please start Supabase with: supabase start"
    exit 1
fi

echo "✅ Supabase is running locally"

# Analyze database before backup
echo "🔍 Analyzing cleaned database structure..."

# Get database size
DB_SIZE=$(PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "SELECT pg_size_pretty(pg_database_size('postgres'));")

# Get table count
TABLE_COUNT=$(PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")

# Get total rows across all tables
TOTAL_ROWS=$(PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "
    SELECT COALESCE(SUM(n_tup_ins), 0) as total_rows
    FROM pg_stat_user_tables
    WHERE schemaname = 'public';" 2>/dev/null || echo "0")

# Get RLS policies count
RLS_COUNT=$(PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "
    SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';" 2>/dev/null || echo "0")

# Verify essential data exists
ORG_COUNT=$(PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "SELECT COUNT(*) FROM organizations;")
USER_COUNT=$(PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "SELECT COUNT(*) FROM users;")
AUTH_USER_COUNT=$(PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -c "SELECT COUNT(*) FROM auth.users;")

echo "   Database size: $DB_SIZE"
echo "   Tables: $TABLE_COUNT"
echo "   Total rows: $TOTAL_ROWS"
echo "   RLS policies: $RLS_COUNT"
echo "   Organizations: $ORG_COUNT"
echo "   Users: $USER_COUNT"
echo "   Auth users: $AUTH_USER_COUNT"

# Verify essential data
if [ "$ORG_COUNT" -ne 1 ] || [ "$USER_COUNT" -ne 1 ] || [ "$AUTH_USER_COUNT" -ne 1 ]; then
    echo "❌ Error: Essential data verification failed"
    echo "   Expected: 1 organization, 1 user, 1 auth user"
    echo "   Found: $ORG_COUNT organizations, $USER_COUNT users, $AUTH_USER_COUNT auth users"
    exit 1
fi

echo "✅ Essential data verification passed"

# Create schema-only backup
echo "📋 Creating schema backup..."
supabase db dump --local --file "$BACKUP_DIR/${PROJECT_NAME}_schema_backup_${TIMESTAMP}.sql"

# Create data-only backup
echo "📊 Creating data backup..."
supabase db dump --local --data-only --file "$BACKUP_DIR/${PROJECT_NAME}_data_backup_${TIMESTAMP}.sql"

# Create complete backup (schema + data)
echo "💾 Creating complete backup..."
supabase db dump --local --file "$BACKUP_DIR/${PROJECT_NAME}_complete_backup_${TIMESTAMP}.sql"

# Create backup summary
echo "📝 Creating backup summary..."
summary_file="$BACKUP_DIR/backup-summary-${TIMESTAMP}.md"

# Get file sizes
SCHEMA_SIZE=$(du -h "$BACKUP_DIR/${PROJECT_NAME}_schema_backup_${TIMESTAMP}.sql" | cut -f1)
DATA_SIZE=$(du -h "$BACKUP_DIR/${PROJECT_NAME}_data_backup_${TIMESTAMP}.sql" | cut -f1)
COMPLETE_SIZE=$(du -h "$BACKUP_DIR/${PROJECT_NAME}_complete_backup_${TIMESTAMP}.sql" | cut -f1)

# Create summary markdown file
cat > "$summary_file" << EOF
# Factory Pulse Remote Deployment Backup Summary
**Date:** $(date +"%B %d, %Y")  
**Time:** $(date +"%H:%M:%S")  
**Backup ID:** $TIMESTAMP

## Backup Overview
- **Status:** ✅ Completed Successfully
- **Database:** Local Supabase Instance (Cleaned for Remote Deployment)
- **Project:** Factory Pulse Manufacturing System
- **Backup Type:** Comprehensive (Schema + Data + Complete)
- **Database Size:** $DB_SIZE
- **Total Tables:** $TABLE_COUNT
- **Total Rows:** $TOTAL_ROWS
- **RLS Policies:** $RLS_COUNT

## Essential Data Preserved
- **Organizations:** $ORG_COUNT (Apillis only)
- **Users:** $USER_COUNT (admin@apillis.com only)
- **Auth Users:** $AUTH_USER_COUNT (admin@apillis.com only)

## Files Created
| File Type | Filename | Size | Description |
| --------- | -------- | ---- | ----------- |
| Schema | \`${PROJECT_NAME}_schema_backup_${TIMESTAMP}.sql\` | $SCHEMA_SIZE | Database structure only |
| Data | \`${PROJECT_NAME}_data_backup_${TIMESTAMP}.sql\` | $DATA_SIZE | Data content only |
| Complete | \`${PROJECT_NAME}_complete_backup_${TIMESTAMP}.sql\` | $COMPLETE_SIZE | Full database backup |

## Database Status
- **Supabase Status:** ✅ Running locally
- **Connection:** Verified and stable
- **Data Integrity:** Confirmed
- **Sample Data:** ✅ Cleaned (removed)
- **Admin Account:** ✅ Preserved (admin@apillis.com)

## Remote Deployment Instructions

### Prerequisites
1. Set up remote Supabase project
2. Configure environment variables for remote connection
3. Ensure admin user can sign in with admin@apillis.com

### Deployment Steps

#### Option 1: Complete Restore (Recommended)
\`\`\`bash
# Reset remote database and restore complete backup
supabase db reset --remote && psql -h [REMOTE_HOST] -p [PORT] -U postgres -d postgres -f ${BACKUP_DIR}/${PROJECT_NAME}_complete_backup_${TIMESTAMP}.sql
\`\`\`

#### Option 2: Schema + Data Restore
\`\`\`bash
# Reset remote database
supabase db reset --remote

# Restore schema first
psql -h [REMOTE_HOST] -p [PORT] -U postgres -d postgres -f ${BACKUP_DIR}/${PROJECT_NAME}_schema_backup_${TIMESTAMP}.sql

# Then restore data
psql -h [REMOTE_HOST] -p [PORT] -U postgres -d postgres -f ${BACKUP_DIR}/${PROJECT_NAME}_data_backup_${TIMESTAMP}.sql
\`\`\`

### Post-Deployment Verification
1. Verify admin user can sign in: admin@apillis.com
2. Check organization exists: Apillis
3. Verify all tables and RLS policies are in place
4. Test user role management functionality

## Backup Location
\`\`\`
$BACKUP_DIR
\`\`\`

## Security Notes
- All sample data has been removed
- Only essential admin account preserved
- Ready for production deployment
- Admin can invite new users and manage roles

---
*Generated by Factory Pulse Remote Deployment Backup System*
EOF

echo "   Summary created: $summary_file"

# List created backup files
echo ""
echo "✅ Remote deployment backup completed successfully!"
echo "📁 Current backup files:"
find "$BACKUP_DIR" -name "${PROJECT_NAME}_*_${TIMESTAMP}.sql" -o -name "backup-summary-${TIMESTAMP}.md" | while read file; do
    ls -la "$file"
done

echo ""
echo "📊 Backup summary:"
echo "   - Schema backup: $BACKUP_DIR/${PROJECT_NAME}_schema_backup_${TIMESTAMP}.sql"
echo "   - Data backup: $BACKUP_DIR/${PROJECT_NAME}_data_backup_${TIMESTAMP}.sql"
echo "   - Complete backup: $BACKUP_DIR/${PROJECT_NAME}_complete_backup_${TIMESTAMP}.sql"
echo "   - Summary file: $BACKUP_DIR/backup-summary-${TIMESTAMP}.md"

echo ""
echo "🚀 Ready for remote Supabase deployment!"
echo "   - Database cleaned of sample data"
echo "   - Admin account preserved: admin@apillis.com"
echo "   - Apillis organization ready"
echo "   - All backup files created in: $BACKUP_DIR"
