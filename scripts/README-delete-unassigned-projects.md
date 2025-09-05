# Delete Unassigned Projects Scripts

This directory contains scripts to safely delete projects where `assigned_to` is NULL. The scripts include comprehensive safety checks, backup options, and multiple execution methods.

## 📁 Files Overview

| File                             | Description                         | Usage                                          |
| -------------------------------- | ----------------------------------- | ---------------------------------------------- |
| `delete-unassigned-projects.js`  | Node.js script with full automation | `node delete-unassigned-projects.js [options]` |
| `delete-unassigned-projects.sh`  | Shell wrapper for easier execution  | `./delete-unassigned-projects.sh [options]`    |
| `delete-unassigned-projects.sql` | SQL commands for manual execution   | Run in Supabase SQL Editor                     |

## 🚀 Quick Start

### Option 1: Shell Script (Recommended)
```bash
# Preview what will be deleted (safe)
./delete-unassigned-projects.sh --dry-run --backup

# Delete with backup and confirmation
./delete-unassigned-projects.sh --confirm --backup --limit=5

# Show SQL commands for manual execution
./delete-unassigned-projects.sh --sql-only
```

### Option 2: Node.js Script
```bash
# Preview what will be deleted
node delete-unassigned-projects.js --dry-run --backup

# Delete with backup
node delete-unassigned-projects.js --confirm --backup --limit=10
```

### Option 3: SQL Manual Execution
1. Open Supabase SQL Editor
2. Copy commands from `delete-unassigned-projects.sql`
3. Run SELECT queries first to preview
4. Run DELETE operations when satisfied

## ⚙️ Script Options

| Option       | Description                                          | Example      |
| ------------ | ---------------------------------------------------- | ------------ |
| `--dry-run`  | Show what would be deleted without actually deleting | `--dry-run`  |
| `--confirm`  | Skip confirmation prompt (use with caution)          | `--confirm`  |
| `--limit=N`  | Limit deletion to N projects                         | `--limit=5`  |
| `--backup`   | Create backup before deletion (recommended)          | `--backup`   |
| `--verbose`  | Show detailed output                                 | `--verbose`  |
| `--sql-only` | Show SQL commands for manual execution               | `--sql-only` |
| `--help`     | Show help message                                    | `--help`     |

## 🛡️ Safety Features

### 1. Dry Run Mode
Always test with `--dry-run` first to see what will be deleted:
```bash
./delete-unassigned-projects.sh --dry-run --backup
```

### 2. Backup Creation
Create backups before deletion:
```bash
./delete-unassigned-projects.sh --backup --confirm --limit=5
```

### 3. Batch Processing
Delete in small batches to minimize risk:
```bash
./delete-unassigned-projects.sh --limit=5 --backup
```

### 4. Confirmation Prompts
Scripts require explicit confirmation unless `--confirm` is used:
```bash
# This will ask for confirmation
./delete-unassigned-projects.sh --backup

# This skips confirmation (use with caution)
./delete-unassigned-projects.sh --confirm --backup
```

## 📊 What Gets Deleted

### Primary Target
- Projects where `assigned_to IS NULL`

### Related Data (Automatic Cleanup)
Due to foreign key constraints with `ON DELETE CASCADE`, the following related records are automatically deleted:

| Table                          | Description                 |
| ------------------------------ | --------------------------- |
| `project_sub_stage_progress`   | Sub-stage progress tracking |
| `project_stage_history`        | Stage transition history    |
| `project_assignments`          | Project assignments         |
| `documents`                    | Project documents           |
| `reviews`                      | Project reviews             |
| `messages`                     | Project messages            |
| `notifications`                | Project notifications       |
| `supplier_rfqs`                | Supplier RFQs               |
| `activity_log`                 | Activity log entries        |
| `bom_items`                    | Bill of materials           |
| `supplier_performance_metrics` | Supplier metrics            |

## 🔍 Analysis Queries

Before deletion, the scripts show:

### Project Counts by Status
```sql
SELECT 
    COUNT(*) as total_unassigned_projects,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_unassigned,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_unassigned,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_unassigned,
    COUNT(CASE WHEN status = 'on_hold' THEN 1 END) as on_hold_unassigned
FROM projects 
WHERE assigned_to IS NULL;
```

### Related Data Counts
The scripts check how many related records will be deleted from each table.

## 📋 Usage Examples

### Safe Preview
```bash
# See what would be deleted without making changes
./delete-unassigned-projects.sh --dry-run --backup --verbose
```

### Small Batch Deletion
```bash
# Delete 5 projects with backup
./delete-unassigned-projects.sh --limit=5 --backup --confirm
```

### Manual SQL Execution
```bash
# Get SQL commands for manual execution
./delete-unassigned-projects.sh --sql-only
```

### Full Deletion (Use with Caution)
```bash
# Delete all unassigned projects with backup
./delete-unassigned-projects.sh --confirm --backup
```

## ⚠️ Important Warnings

### Before Running
1. **Always use `--dry-run` first** to preview changes
2. **Create backups** using `--backup` option
3. **Start with small batches** using `--limit=N`
4. **Test in development environment** before production

### During Execution
1. **Monitor the output** for any errors
2. **Verify results** after deletion
3. **Check application functionality** after cleanup

### After Deletion
1. **Verify no broken references** in your application
2. **Test key workflows** to ensure everything works
3. **Keep backups** until you're confident everything is working

## 🔧 Troubleshooting

### Common Issues

#### "Supabase is not running locally"
```bash
# Start Supabase
supabase start
```

#### "Node.js not found"
```bash
# Install Node.js from https://nodejs.org/
# Or use the SQL script instead
./delete-unassigned-projects.sh --sql-only
```

#### "Permission denied"
```bash
# Make script executable
chmod +x delete-unassigned-projects.sh
```

### Error Recovery

#### If Deletion Fails
1. Check the error message
2. Verify Supabase is running
3. Check database permissions
4. Try smaller batches with `--limit=N`

#### If You Need to Restore
1. Use the backup files created by `--backup`
2. Restore from your database backup
3. Contact your database administrator if needed

## 📚 Related Documentation

- [Database Schema](../docs/database-schema.md)
- [Backup Scripts](./backup-database.sh)
- [Project Management System](../docs/project-management-system/)

## 🤝 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the script output for error messages
3. Use `--verbose` flag for detailed logging
4. Consider using the SQL script for manual execution

## 📝 Changelog

- **2025-01-05**: Initial release with comprehensive safety features
- **2025-01-05**: Added shell wrapper and SQL script options
- **2025-01-05**: Enhanced documentation and examples
