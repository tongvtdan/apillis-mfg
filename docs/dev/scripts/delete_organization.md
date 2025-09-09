# Organization Deletion Script

## Overview
This SQL script provides a safe way to delete an organization (customer) and all its related data from the Factory Pulse database. The script handles all foreign key relationships and ensures data integrity during the deletion process.

## ⚠️ WARNING
- **This script permanently deletes data** - there is no undo functionality
- **Use only for database cleanup purposes** - not for regular application operations
- **Run only in SQL Editor** with proper authorization
- **Test in a development environment first** before running in production

## What Gets Deleted

The script deletes the following data in the correct order to maintain referential integrity:

### 1. Special Cases (Updated/Handled First)
- **Projects as customers**: Updates `projects.customer_organization_id` to NULL
- **User manager relationships**: Updates `users.direct_manager_id` to NULL
- **User reports relationships**: Removes user IDs from `users.direct_reports` arrays

### 2. Related Tables (Deleted in Order)
- **review_checklist_items** → **reviews** → **permission_audit_log**
- **user_feature_access** → **feature_toggles**
- **user_custom_roles** → **role_permissions** → **custom_roles**
- **user_permissions** (via users)
- **approval_attachments** → **approval_history** → **approvals**
- **document_access_log** → **document_versions** → **documents**
- **project_sub_stage_progress** → **projects**
- **workflow_definition_sub_stages** → **workflow_definition_stages** → **workflow_definitions**
- **workflow_sub_stages** → **workflow_stages**
- **notifications** → **messages** → **activity_log**
- **contacts** → **users** → **organizations**

## Usage

### 1. Check What Will Be Deleted (Recommended)
Before running the deletion, check what data will be affected:

```sql
-- Check organization details
SELECT id, name, slug, organization_type, is_active, created_at 
FROM organizations 
WHERE id = 'your-organization-uuid-here';

-- Check related data counts
SELECT 
    'users' as table_name, COUNT(*) as count 
FROM users WHERE organization_id = 'your-organization-uuid-here'
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts WHERE organization_id = 'your-organization-uuid-here'
UNION ALL
SELECT 'projects', COUNT(*) FROM projects WHERE organization_id = 'your-organization-uuid-here'
UNION ALL
SELECT 'documents', COUNT(*) FROM documents WHERE organization_id = 'your-organization-uuid-here'
UNION ALL
SELECT 'approvals', COUNT(*) FROM approvals WHERE organization_id = 'your-organization-uuid-here'
UNION ALL
SELECT 'workflow_stages', COUNT(*) FROM workflow_stages WHERE organization_id = 'your-organization-uuid-here'
UNION ALL
SELECT 'custom_roles', COUNT(*) FROM custom_roles WHERE organization_id = 'your-organization-uuid-here'
UNION ALL
SELECT 'feature_toggles', COUNT(*) FROM feature_toggles WHERE organization_id = 'your-organization-uuid-here';
```

### 2. Run the Deletion
Execute the deletion function:

```sql
-- Replace with actual organization UUID
SELECT * FROM delete_organization_safely('123e4567-e89b-12d3-a456-426614174000');
```

### 3. Clean Up (Optional)
After successful deletion, clean up the function:

```sql
SELECT cleanup_deletion_function();
```

## Function Output

The `delete_organization_safely()` function returns a table with:
- **deleted_table**: Name of the table affected
- **deleted_count**: Number of records deleted/updated
- **status**: Status of the operation ('Deleted', 'Updated', 'ERROR')

Example output:
```
deleted_table          | deleted_count | status
-----------------------+---------------+----------
projects (customer refs) | 5            | Updated
users (manager refs)     | 2            | Updated
users (reports refs)     | 3            | Updated
review_checklist_items   | 12           | Deleted
reviews                  | 8            | Deleted
...
organizations            | 1            | Deleted
SUMMARY                  | 156          | Organization and all related data deleted successfully
```

## Error Handling

The script includes comprehensive error handling:
- **Organization not found**: Returns error if organization doesn't exist
- **Foreign key constraint**: Handles all relationship constraints
- **Transaction safety**: Uses proper deletion order to avoid constraint violations
- **Rollback on error**: Automatically rolls back on any error

## Database Schema Relationships

The script handles these key relationships:

```
organizations (1) → (many) users
organizations (1) → (many) contacts  
organizations (1) → (many) projects
organizations (1) → (many) workflow_stages
organizations (1) → (many) workflow_definitions
organizations (1) → (many) documents
organizations (1) → (many) approvals
organizations (1) → (many) custom_roles
organizations (1) → (many) feature_toggles
organizations (1) → (many) reviews
organizations (1) → (many) activity_log
organizations (1) → (many) messages
organizations (1) → (many) notifications
organizations (1) → (many) permission_audit_log

projects (many) → (1) organizations (as customer_organization_id)
users (many) → (1) users (as direct_manager_id)
users (1) → (many) users (as direct_reports array)
```

## Security Considerations

- **Row Level Security (RLS)**: All tables have RLS enabled
- **Permission checks**: Function uses SECURITY DEFINER for proper permissions
- **Audit trail**: Deletion is logged in activity_log before deletion
- **Authorization**: Only authenticated users can run the function

## Backup Recommendation

Before running this script, create a backup:

```sql
-- Create backup of organization data
CREATE TABLE organizations_backup AS 
SELECT * FROM organizations WHERE id = 'your-organization-uuid-here';

-- Create backup of related data
CREATE TABLE users_backup AS 
SELECT * FROM users WHERE organization_id = 'your-organization-uuid-here';

-- ... repeat for other important tables
```

## Troubleshooting

### Common Issues

1. **Permission denied**: Ensure you have proper database permissions
2. **Foreign key constraint**: The script handles this automatically
3. **RLS policy violation**: Ensure you're authenticated and have proper organization access

### Recovery

If you need to recover deleted data:
1. Restore from database backup
2. Use the backup tables created before deletion
3. Contact database administrator for point-in-time recovery

## File Location

- **Script**: `/scripts/delete_organization.sql`
- **Documentation**: `/docs/dev/scripts/delete_organization.md`

## Version History

- **v1.0**: Initial implementation with comprehensive relationship handling
- **v1.1**: Added error handling and safety checks
- **v1.2**: Added cleanup function and improved documentation
