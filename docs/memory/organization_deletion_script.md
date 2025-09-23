# Memory: Organization Deletion SQL Script Created

## Date: 2025-01-20

## Summary
Created a comprehensive SQL script for safely deleting organizations and all related data from the Factory Pulse database.

## Details

### Script Location
- **Main Script**: `/scripts/delete_organization.sql`
- **Documentation**: `/docs/dev/scripts/delete_organization.md`

### Key Features
1. **Comprehensive Relationship Handling**: Handles all foreign key relationships including:
   - Users, contacts, projects, workflows
   - Documents, approvals, permissions
   - Custom roles, feature toggles, reviews
   - Activity logs, messages, notifications

2. **Safety Features**:
   - Proper deletion order to maintain referential integrity
   - Error handling with rollback on failure
   - Detailed logging of all operations
   - Safety checks before deletion

3. **Special Cases Handled**:
   - Projects referencing organization as customer
   - User manager relationships (direct_manager_id)
   - User reports arrays (direct_reports)

### Usage
```sql
-- Check what will be deleted first
SELECT * FROM delete_organization_safely('organization-uuid-here');

-- Clean up function after use
SELECT cleanup_deletion_function();
```

### Database Tables Affected
The script deletes data from 20+ tables in the correct order:
1. Special relationship updates
2. Dependent tables (reviews, permissions, etc.)
3. Core tables (projects, documents, workflows)
4. Base tables (users, contacts)
5. Organization itself

### Security Considerations
- Uses SECURITY DEFINER for proper permissions
- Respects Row Level Security (RLS) policies
- Includes comprehensive error handling
- Provides detailed audit trail

## Purpose
This script is designed for database cleanup purposes only, not for regular application operations. It provides a safe way to completely remove an organization and all its related data while maintaining database integrity.

## Related Files
- Database schema: `supabase/migrations/20250117000003_factory_pulse_complete_schema.sql`
- Additional tables: `supabase/migrations/20250117000009_create_reviews_table.sql`
- Permissions system: `supabase/migrations/20250117000010_enhanced_permissions_system.sql`
