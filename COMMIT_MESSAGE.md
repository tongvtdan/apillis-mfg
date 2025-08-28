# Git Commit Message

```
feat(database): Add organization description/industry and user hierarchy fields

- Added description and industry fields to organizations table
- Added employee_id, direct_manager_id, direct_reports, and description fields to users table
- Created migration file 20250127000005_organization_user_enhancements.sql
- Updated sample data files (organizations.json, users.json) with new fields
- Updated database schema documentation
- Added indexes for improved query performance on new fields
- Established proper relationships between users through direct_manager_id and direct_reports
- Created summary document of changes

These enhancements provide better organizational information and improved user management capabilities, including hierarchical relationships between employees.
```