# Development Memory Directory

This directory contains structured development memory files following the `[feature][timestamp].md` naming convention.

## File Naming Convention

Format: `[feature-description][YYYYMMDD].md`

Examples:
- `user-auth-implementation-20250115.md`
- `database-optimization-20250114.md`
- `workflow-stages-fix-20250113.md`
- `archive-functionality-implementation-20241225.md`

**Note:** Use YYYYMMDD format (8 digits) for consistency with existing files. Include descriptive feature names and avoid special characters.

## Memory File Structure

Each memory file must include:

1. **Date & Time**: Current timestamp when memory was created (also reflected in filename)
2. **Feature/Context**: What feature or issue this memory addresses
3. **Problem/Situation**: What led to this work
4. **Solution/Changes**: What was implemented or changed
5. **Technical Details**: Code changes, database updates, architecture decisions
6. **Files Modified**: List of all files affected
7. **Challenges**: Any obstacles encountered and how they were overcome
8. **Results**: Outcome and verification of the solution
9. **Future Considerations**: Any follow-up work or monitoring needed

**Filename Format Reminder:**
- Always include timestamp: `feature-description-YYYYMMDD.md`
- Use 8-digit date format (YYYYMMDD)
- Keep descriptive names and avoid special characters

## Guidelines

- Create individual memory files for each significant feature or fix
- Use descriptive feature names in square brackets
- Include full timestamp for chronological ordering
- Archive memories monthly when folder approaches 500 lines total
- Keep the most recent 3 months easily accessible

## Current Memory Files

- `archive-functionality-implementation-20241225.md` - Complete implementation of archive/unarchive functionality for customers and suppliers
- `database-project-fixes-202509060702.md` - Database schema and project display fixes
- `workflow-stages-dropdown-fix-final-20250117.md` - Final fix for workflow stages dropdown
- `workflow-stages-dropdown-fix-20250117.md` - Workflow stages dropdown fixes
- `reviews-table-404-error-fix-20250117.md` - Reviews table 404 error resolution
- `reviews-foreign-key-fix-20250117.md` - Reviews foreign key relationship fixes
- `project-cleanup-unused-files-20250117.md` - Cleanup of unused project files
- `enhanced-customer-organization-creation-20250117.md` - Enhanced customer organization creation
- `database-schema-mismatch-fixes-20250117.md` - Database schema mismatch corrections
- `database-schema-documentation-update-20250117.md` - Database schema documentation updates
- `complete-database-schema-documentation-update-20250117.md` - Comprehensive database schema updates
- `comprehensive-database-audit-20250117.md` - Full database audit and fixes
- `database-functions-comparison-20250117.md` - Database functions analysis
- `dashboard-summary-rpc-function-fix-20250117.md` - Dashboard summary RPC function fixes
- `customer-organization-display-fix-20250117.md` - Customer organization display corrections
- `list-view-stage-dropdown-fix-20250117.md` - List view stage dropdown fixes
- `activity-log-400-error-fix-20250117.md` - Activity log 400 error resolution

## Recent Major Features

- **Archive Functionality** (December 2024): Implemented soft delete/archive system for customers and suppliers with full reactivation capability
- **Project Workflow** (January 2024): Complete project lifecycle management system
- **Database Schema** (January 2024): Comprehensive database refactoring and optimization

For more information, see `../project-rules.md` for the complete project guidelines.
